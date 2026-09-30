package com.apaprovado.service;

import com.apaprovado.model.ImportacaoPdf;
import com.apaprovado.repository.ImportacaoRepository;
import com.fasterxml.jackson.databind.*;
import com.fasterxml.jackson.databind.node.*;
import org.springframework.boot.*;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.stereotype.Component;
import org.apache.pdfbox.pdmodel.*;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.*;
import java.util.stream.Stream;

/** One-shot, local-only importer for previously validated course question batches. */
@Component
@ConditionalOnProperty(name="course.import.dir")
public class PreparedCourseImporter implements ApplicationRunner {
    private final ImportacaoRepository repo;
    private final ObjectMapper mapper;
    private final QuestionDrafts drafts;
    private final ConfigurableApplicationContext context;

    public PreparedCourseImporter(ImportacaoRepository repo, ObjectMapper mapper, QuestionDrafts drafts,
                                  ConfigurableApplicationContext context) {
        this.repo=repo; this.mapper=mapper; this.drafts=drafts; this.context=context;
    }

    @Override public void run(ApplicationArguments args) throws Exception {
        Path directory=Path.of(args.getOptionValues("course.import.dir").get(0)).toAbsolutePath().normalize();
        Set<String> existing=existingFingerprints();
        int published=0, skipped=0;
        try(Stream<Path> paths=Files.list(directory)) {
            for(Path jsonPath:paths.filter(p -> p.getFileName().toString().startsWith("Aula") && p.toString().endsWith(".json")).sorted().toList()) {
                ObjectNode root=(ObjectNode)mapper.readTree(Files.readString(jsonPath));
                ArrayNode input=(ArrayNode)root.path("questions");
                ArrayNode unique=mapper.createArrayNode();
                for(JsonNode item:input) {
                    if(item.path("tem_imagem").asBoolean()) { skipped++; continue; }
                    String key=contentKey(item);
                    if(existing.add(key)) unique.add(item.deepCopy()); else skipped++;
                }
                if(unique.isEmpty()) continue;
                for(int index=0;index<unique.size();index++) ((ObjectNode)unique.get(index))
                    .put("numero_original",index+1).put("pagina",1).put("tem_imagem",false);

                byte[] pdf=blankPdf();
                String content=unique.get(0).path("conteudo").asText("Português");
                String fingerprint=sha256(mapper.writeValueAsBytes(unique));
                if(repo.findByFingerprint(fingerprint).isPresent()) continue;

                ImportacaoPdf job=new ImportacaoPdf();
                job.id=UUID.randomUUID().toString(); job.ownerId="local-admin-course-import"; job.fingerprint=fingerprint;
                job.status="PUBLICADO"; job.concurso="Português — "+content; job.banca="Diversas"; job.modelo="CURSO";
                job.ano=2023; job.esperadas=unique.size(); job.paginas=1; job.progresso=unique.size();
                job.prova=pdf; job.gabarito=pdf; job.questoes=drafts.normalize(unique,job,true).toString();
                job.criado=Instant.now(); job.atualizado=Instant.now();
                repo.saveAndFlush(job); published+=unique.size();
                System.out.println("PUBLICADO "+content+": "+unique.size());
            }
        }
        System.out.println("IMPORTACAO_CONCLUIDA publicados="+published+" duplicados="+skipped);
        SpringApplication.exit(context,() -> 0);
    }

    private Set<String> existingFingerprints() throws Exception {
        Set<String> values=new HashSet<>();
        for(var job:repo.findAllProjectedByStatusOrderByCriadoDesc("PUBLICADO"))
            for(JsonNode question:mapper.readTree(job.getQuestoes())) values.add(contentKey(question));
        return values;
    }

    private String contentKey(JsonNode question) {
        StringBuilder raw=new StringBuilder(question.path("enunciado").asText());
        question.path("opcoes").forEach(option -> raw.append(' ').append(option.asText()));
        String folded=java.text.Normalizer.normalize(raw,java.text.Normalizer.Form.NFD)
            .replaceAll("\\p{M}+","").toLowerCase(Locale.ROOT);
        return folded.replaceAll("[^a-z0-9]+"," ").trim();
    }

    private String sha256(byte[]... parts) throws Exception {
        MessageDigest digest=MessageDigest.getInstance("SHA-256");
        for(byte[] part:parts) digest.update(part);
        digest.update("prepared-course-v1".getBytes(StandardCharsets.UTF_8));
        return HexFormat.of().formatHex(digest.digest());
    }

    private byte[] blankPdf() throws Exception {
        try(PDDocument document=new PDDocument(); ByteArrayOutputStream output=new ByteArrayOutputStream()) {
            document.addPage(new PDPage()); document.save(output); return output.toByteArray();
        }
    }
}
