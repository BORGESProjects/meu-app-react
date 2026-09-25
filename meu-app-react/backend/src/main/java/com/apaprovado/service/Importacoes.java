package com.apaprovado.service;

import com.apaprovado.model.ImportacaoPdf;
import com.apaprovado.repository.ImportacaoRepository;
import com.fasterxml.jackson.databind.*;
import com.fasterxml.jackson.databind.node.*;
import jakarta.annotation.PreDestroy;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.*;

@Service
public class Importacoes {
    private final ImportacaoRepository repo;
    private final ObjectMapper mapper;
    private final QuestionDrafts drafts;
    private final PdfGemini gemini;
    private final PdfFiles files;
    private final ThreadPoolExecutor worker = new ThreadPoolExecutor(1,1,0,TimeUnit.SECONDS,new ArrayBlockingQueue<>(2));
    public Importacoes(ImportacaoRepository repo, ObjectMapper mapper, QuestionDrafts drafts, PdfGemini gemini, PdfFiles files) {
        this.repo=repo; this.mapper=mapper; this.drafts=drafts; this.gemini=gemini; this.files=files;
    }
    @PreDestroy public void stop() { worker.shutdownNow(); }
    @EventListener(ApplicationReadyEvent.class)
    public void recover() {
        for (ImportacaoPdf job : repo.findByStatusOrderByCriadoDesc("PROCESSANDO")) {
            job.status="ERRO"; job.erro="O servidor reiniciou durante a leitura. Clique em Continuar extração.";
            repo.save(job);
        }
    }
    public synchronized ImportacaoPdf create(String owner, byte[] prova, byte[] gabarito, int ano, String banca, String concurso, String modelo, int esperadas) throws Exception {
        if (ano<1900 || ano>2100 || esperadas<1 || esperadas>150) throw bad("Informe um ano válido e de 1 a 150 questões.");
        for (String s : List.of(banca,concurso,modelo)) if (s.isBlank() || s.length()>160) throw bad("Preencha banca, concurso e modelo (até 160 caracteres).");
        int pages = files.validate(prova); files.validate(gabarito);
        MessageDigest hash = MessageDigest.getInstance("SHA-256");
        hash.update(prova); hash.update(gabarito); hash.update(modelo.trim().toUpperCase(Locale.ROOT).getBytes(StandardCharsets.UTF_8));
        String fingerprint = HexFormat.of().formatHex(hash.digest());
        Optional<ImportacaoPdf> existing = repo.findByFingerprint(fingerprint);
        if (existing.isPresent()) {
            if (!existing.get().ownerId.equals(owner)) throw bad("Esses arquivos já foram importados.");
            return existing.get();
        }
        if (worker.getQueue().remainingCapacity()==0) throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,"Há outras provas na fila. Aguarde uma delas terminar.");
        ImportacaoPdf job = new ImportacaoPdf();
        job.id=UUID.randomUUID().toString(); job.ownerId=owner; job.fingerprint=fingerprint;
        job.prova=prova; job.gabarito=gabarito; job.paginas=pages;
        job.ano=ano; job.banca=banca.trim(); job.concurso=concurso.trim(); job.modelo=modelo.trim().toUpperCase(Locale.ROOT);
        job.esperadas=esperadas; job.status="PROCESSANDO"; job=repo.saveAndFlush(job);
        enqueue(job.id);
        return job;
    }
    private void enqueue(String id) {
        try { worker.execute(() -> process(id)); }
        catch (RejectedExecutionException e) {
            ImportacaoPdf job = repo.findById(id).orElseThrow(); job.status="ERRO"; job.erro="A fila está cheia. Continue a extração mais tarde."; repo.save(job);
        }
    }
    public ImportacaoPdf owned(String id, String owner) {
        ImportacaoPdf job=repo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (!job.ownerId.equals(owner)) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        return job;
    }
    public ImportacaoPdf published(String id) {
        ImportacaoPdf job=repo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (!job.status.equals("PUBLICADO")) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        return job;
    }
    public synchronized ImportacaoPdf retry(String id, String owner) {
        ImportacaoPdf job=owned(id,owner);
        if (!job.status.equals("ERRO")) throw bad("Somente extrações interrompidas podem ser retomadas.");
        job.status="PROCESSANDO"; job.erro=null; job.atualizado=Instant.now(); job=repo.saveAndFlush(job); enqueue(id); return job;
    }
    public synchronized ImportacaoPdf save(String id, String owner, JsonNode body, boolean publish) {
        ImportacaoPdf job=owned(id,owner);
        if (job.status.equals("PUBLICADO") && publish) return job; // idempotent publish
        if (!List.of("REVISAO","ERRO").contains(job.status)) throw bad("Aguarde o processamento terminar antes de editar.");
        if (body.path("version").asLong(-1)!=job.version) throw new ResponseStatusException(HttpStatus.CONFLICT,"O rascunho mudou em outra aba. Reabra antes de editar.");
        if(body.has("ano")) {
            int year=body.path("ano").asInt(); int count=body.path("esperadas").asInt();
            String board=body.path("banca").asText("").trim(); String title=body.path("concurso").asText("").trim();
            if(year<1900||year>2100||count<1||count>150||board.isBlank()||board.length()>160||title.isBlank()||title.length()>160)
                throw bad("Confira ano, banca, concurso e quantidade de questões.");
            job.ano=year;job.esperadas=count;job.banca=board;job.concurso=title;job.progresso=Math.min(job.progresso,count);
        }
        job.questoes=drafts.normalize(body.path("questoes"),job,publish).toString();
        job.atualizado=Instant.now();
        if (publish) { job.status="PUBLICADO"; job.erro=null; }
        return repo.saveAndFlush(job);
    }
    private void process(String id) {
        try {
            ImportacaoPdf job=repo.findById(id).orElseThrow();
            ArrayNode all=(ArrayNode)mapper.readTree(job.questoes);
            for (int start=job.progresso+1; start<=job.esperadas; start+=5) {
                if (Thread.currentThread().isInterrupted()) throw new InterruptedException();
                int end=Math.min(start+4,job.esperadas);
                ArrayNode batch=gemini.extract(job,start,end);
                for (JsonNode q:batch) {
                    int n=q.path("numero_original").asInt();
                    if(n<start || n>end) throw new IllegalStateException("A IA retornou questões fora da sequência. Confira o modelo e os PDFs.");
                    ((ObjectNode)q).put("revisada",false);
                    all.add(q);
                }
                all=drafts.normalize(all,job,false);
                if(all.size()!=end) throw new IllegalStateException("A IA não extraiu todas as questões do lote. Confira o rascunho ou continue a extração.");
                job.questoes=all.toString(); job.progresso=end; job.atualizado=Instant.now(); job=repo.saveAndFlush(job);
            }
            job.status="REVISAO"; job.erro=null; repo.save(job);
        } catch (Exception e) {
            ImportacaoPdf job=repo.findById(id).orElse(null);
            if(job!=null) {
                job.status="ERRO";
                job.erro=e instanceof IllegalStateException ? e.getMessage() : "A extração foi interrompida. Os lotes concluídos foram preservados. Tente continuar ou revise o rascunho.";
                job.atualizado=Instant.now(); repo.save(job);
            }
            if(e instanceof InterruptedException) Thread.currentThread().interrupt();
        }
    }
    public ObjectNode detail(ImportacaoPdf j) throws Exception {
        ObjectNode o=mapper.createObjectNode();
        o.put("id",j.id).put("status",j.status).put("concurso",j.concurso).put("banca",j.banca).put("modelo",j.modelo)
            .put("ano",j.ano).put("esperadas",j.esperadas).put("paginas",j.paginas).put("progresso",j.progresso).put("version",j.version);
        o.put("erro",j.erro); o.set("questoes",mapper.readTree(j.questoes)); return o;
    }
    public List<Map<String,Object>> list(String owner) {
        return repo.findAllProjectedByOwnerIdOrderByCriadoDesc(owner).stream().map(j -> Map.<String,Object>of(
            "id",j.getId(),"status",j.getStatus(),"concurso",j.getConcurso(),"ano",j.getAno(),"modelo",j.getModelo(),"progresso",j.getProgresso(),"esperadas",j.getEsperadas())).toList();
    }
    public ArrayNode publicQuestions() throws Exception {
        ArrayNode all=mapper.createArrayNode();
        for (var j:repo.findAllProjectedByStatusOrderByCriadoDesc("PUBLICADO")) {
            for(JsonNode q:mapper.readTree(j.getQuestoes())) {
                ObjectNode out=((ObjectNode)q).deepCopy();
                out.remove(List.of("revisada","observacao"));
                out.put("id","pdf-"+j.getId()+"-"+q.path("numero_original").asInt());
                out.put("ano",j.getAno()).put("banca",j.getBanca()).put("concurso",j.getConcurso()).put("modelo",j.getModelo());
                out.put("dificuldade_estimada",true);
                out.put("pdf_original","/api/acervo/"+j.getId()+"/prova.pdf");
                if(q.path("tem_imagem").asBoolean()) out.put("pagina_imagem","/api/acervo/"+j.getId()+"/paginas/"+q.path("pagina").asInt());
                all.add(out);
            }
        }
        return all;
    }
    private ResponseStatusException bad(String msg) { return new ResponseStatusException(HttpStatus.BAD_REQUEST,msg); }
}
