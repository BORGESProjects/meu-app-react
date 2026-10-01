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
    private final LocalQuestionAi classifier;
    private final PdfLocal local;
    private final PdfFiles files;
    private final ThreadPoolExecutor worker = new ThreadPoolExecutor(1,1,0,TimeUnit.SECONDS,new ArrayBlockingQueue<>(2));
    public Importacoes(ImportacaoRepository repo, ObjectMapper mapper, QuestionDrafts drafts, LocalQuestionAi classifier, PdfFiles files, PdfLocal local) {
        this.repo=repo; this.mapper=mapper; this.drafts=drafts; this.classifier=classifier; this.files=files; this.local=local;
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
        boolean incompleteReview=job.status.equals("REVISAO") && job.progresso<job.esperadas;
        if (!job.status.equals("ERRO") && !incompleteReview)
            throw bad("Somente extrações interrompidas ou incompletas podem ser retomadas.");
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
            ArrayNode extracted=local.extract(job);
            Map<Integer,Integer> existing=new HashMap<>();
            for(int i=0;i<all.size();i++) existing.put(all.get(i).path("numero_original").asInt(),i);
            for(JsonNode q:extracted) {
                int number=q.path("numero_original").asInt();
                Integer index=existing.get(number);
                ((ObjectNode)q).put("revisada",false);
                if(index==null) { existing.put(number,all.size());all.add(q);continue; }
                JsonNode old=all.get(index);
                boolean untouched=!old.path("revisada").asBoolean() && old.path("conteudo").asText("").isBlank();
                if(untouched) all.set(index,q);
                else if(old.path("resposta_correta").isNull() && !q.path("resposta_correta").isNull())
                    ((ObjectNode)old).set("resposta_correta",q.path("resposta_correta"));
            }
            all=drafts.normalize(all,job,false);
            job.questoes=all.toString(); job.progresso=all.size(); job.atualizado=Instant.now(); job=repo.saveAndFlush(job);
            String classificationWarning=null;
            try { classifyMissing(job,all); }
            catch(IllegalStateException e) { classificationWarning=e.getMessage()+" Use ‘Classificar pendentes’ para tentar novamente."; }
            job=repo.findById(id).orElseThrow();
            all=drafts.normalize(all,job,false);
            job.questoes=all.toString(); job.progresso=all.size(); job.atualizado=Instant.now();
            job.status="REVISAO"; job.erro=classificationWarning; repo.save(job);
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
    public ObjectNode classify(String id,String owner,JsonNode body) throws Exception {
        ImportacaoPdf job=owned(id,owner);
        if(!List.of("REVISAO","ERRO").contains(job.status)) throw bad("Abra um rascunho para sugerir a classificação.");
        JsonNode q=body.path("questao");
        ArrayNode one=mapper.createArrayNode().add(q);
        return classifier.classify(drafts.normalize(one,job,false).get(0));
    }
    private void classifyMissing(ImportacaoPdf job,ArrayNode all) throws Exception {
        List<ObjectNode> pending=new ArrayList<>();
        for(JsonNode q:all) if(q.path("materia").asText("").isBlank() || q.path("conteudo").asText("").isBlank()) pending.add((ObjectNode)q);
        for(int start=0;start<pending.size();start+=10) {
            List<ObjectNode> batch=pending.subList(start,Math.min(start+10,pending.size()));
            ArrayNode input=mapper.createArrayNode(); batch.forEach(input::add);
            ArrayNode suggestions=classifier.classifyBatch(input);
            Map<Integer,JsonNode> byNumber=new HashMap<>();
            for(JsonNode suggestion:suggestions) byNumber.put(suggestion.path("numero_original").asInt(),suggestion);
            for(ObjectNode question:batch) {
                JsonNode suggestion=byNumber.get(question.path("numero_original").asInt());
                if(suggestion==null) throw new IllegalStateException("A IA local não classificou todas as questões.");
                question.put("materia",suggestion.path("materia").asText());
                question.put("conteudo",suggestion.path("conteudo").asText());
                question.put("dificuldade",suggestion.path("dificuldade").asText());
                question.put("confianca_classificacao",suggestion.path("confianca").asDouble(0.5));
                question.put("revisada",false);
            }
            job.questoes=all.toString(); job.atualizado=Instant.now(); job=repo.saveAndFlush(job);
        }
    }
    public ArrayNode classifyBatch(String id,String owner,JsonNode body) throws Exception {
        ImportacaoPdf job=owned(id,owner);
        if(!List.of("REVISAO","ERRO").contains(job.status)) throw bad("Abra um rascunho para sugerir a classificação.");
        JsonNode input=body.path("questoes");
        if(!input.isArray() || input.isEmpty() || input.size()>10) throw bad("Selecione de 1 a 10 questões por lote.");
        Map<Integer,JsonNode> originals=new HashMap<>();
        for(JsonNode q:mapper.readTree(job.questoes)) originals.put(q.path("numero_original").asInt(),q);
        ArrayNode safe=mapper.createArrayNode(); Set<Integer> seen=new HashSet<>();
        for(JsonNode requested:input) {
            int number=requested.path("numero_original").asInt(); JsonNode original=originals.get(number);
            if(original==null || !seen.add(number)) throw bad("O lote contém uma questão inválida ou repetida.");
            safe.add(original);
        }
        return classifier.classifyBatch(safe);
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
    public synchronized ObjectNode createManual(String owner, JsonNode body) throws Exception {
        int year=body.path("ano").asInt(0);
        String board=body.path("banca").asText("").trim();
        String title=body.path("concurso").asText("").trim();
        if(year<1900||year>2100||board.isBlank()||board.length()>160||title.isBlank()||title.length()>160)
            throw bad("Confira o ano, a banca e o concurso.");
        ImportacaoPdf job=new ImportacaoPdf();
        job.id=UUID.randomUUID().toString();job.ownerId=owner;job.fingerprint=UUID.randomUUID().toString();
        job.status="PUBLICADO";job.concurso=title;job.banca=board;job.modelo="MANUAL";job.ano=year;
        job.esperadas=1;job.paginas=1;job.progresso=1;job.prova=new byte[0];job.gabarito=new byte[0];
        ObjectNode question=mapper.createObjectNode();
        question.put("numero_original",1).put("pagina",1).put("tem_imagem",false).put("revisada",true)
            .put("materia",body.path("materia").asText()).put("conteudo",body.path("conteudo").asText())
            .put("dificuldade",body.path("dificuldade").asText()).put("enunciado",body.path("enunciado").asText())
            .put("texto_apoio",body.path("texto_apoio").asText("")).put("anulada",false)
            .put("banca",board).put("concurso",title).put("ano",year).put("modelo","MANUAL");
        question.set("opcoes",body.path("opcoes"));
        question.set("resposta_correta",body.path("resposta_correta"));
        job.questoes=drafts.normalize(mapper.createArrayNode().add(question),job,true).toString();
        job=repo.saveAndFlush(job);
        return (ObjectNode)publicQuestionsFor(job).get(0);
    }
    private ArrayNode publicQuestionsFor(ImportacaoPdf j) throws Exception {
        ArrayNode all=mapper.createArrayNode();
        for(JsonNode q:mapper.readTree(j.questoes)) {
            ObjectNode out=((ObjectNode)q).deepCopy();
            out.remove(List.of("revisada","observacao"));
            out.put("id","pdf-"+j.id+"-"+q.path("numero_original").asInt());
            out.put("ano",q.path("ano").asInt(j.ano));
            if(q.path("banca").asText("").isBlank()) out.put("banca",j.banca);
            if(q.path("concurso").asText("").isBlank()) out.put("concurso",j.concurso);
            if(q.path("modelo").asText("").isBlank()) out.put("modelo",j.modelo);
            out.put("dificuldade_estimada",true);
            if(!"CURSO".equals(j.modelo)&&!"MANUAL".equals(j.modelo)) out.put("pdf_original","/api/acervo/"+j.id+"/prova.pdf");
            if(q.path("tem_imagem").asBoolean()) out.put("pagina_imagem","/api/acervo/"+j.id+"/paginas/"+q.path("pagina").asInt());
            all.add(out);
        }
        return all;
    }
    public ArrayNode publicQuestions() throws Exception {
        ArrayNode all=mapper.createArrayNode();
        for (var j:repo.findAllProjectedByStatusOrderByCriadoDesc("PUBLICADO")) {
            ImportacaoPdf value=new ImportacaoPdf();value.id=j.getId();value.questoes=j.getQuestoes();value.ano=j.getAno();
            value.banca=j.getBanca();value.concurso=j.getConcurso();value.modelo=j.getModelo();
            all.addAll(publicQuestionsFor(value));
        }
        return all;
    }
    private ResponseStatusException bad(String msg) { return new ResponseStatusException(HttpStatus.BAD_REQUEST,msg); }
}
