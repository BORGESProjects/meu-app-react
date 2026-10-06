package com.apaprovado;

import com.apaprovado.model.ImportacaoPdf;
import com.apaprovado.repository.ImportacaoRepository;
import com.apaprovado.service.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.*;
import org.apache.pdfbox.pdmodel.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.server.ResponseStatusException;
import java.io.ByteArrayOutputStream;
import java.time.Duration;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.awaitility.Awaitility.await;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties={"spring.datasource.url=jdbc:h2:mem:import-tests;DB_CLOSE_DELAY=-1","spring.jpa.hibernate.ddl-auto=create-drop"})
@AutoConfigureMockMvc
class ImportacaoTests {
    @Autowired Importacoes jobs;
    @Autowired ImportacaoRepository repo;
    @Autowired QuestionDrafts drafts;
    @Autowired PdfFiles pdfs;
    @Autowired ObjectMapper mapper;
    @Autowired MockMvc mvc;
    @MockBean LocalQuestionAi classifier;
    @MockBean PdfLocal local;

    ArrayNode fixture() throws Exception {
        return (ArrayNode)mapper.readTree("""
          [{"numero_original":1,"enunciado":"Qual é a soma de 2 e 2?","texto_apoio":"",
          "opcoes":["3","4","5","6","7"],"resposta_correta":1,"anulada":false,
          "materia":"Matemática","conteudo":"Aritmética","dificuldade":"Fácil","pagina":1,"tem_imagem":false,"revisada":true,
          "numero_fonte":17,"ano":2019,"banca":"ESA","concurso":"ESA 2019","fonte":"ESA - 2019"}]
          """);
    }
    byte[] pdf() throws Exception {
        try(PDDocument doc=new PDDocument();ByteArrayOutputStream out=new ByteArrayOutputStream()) {
            doc.addPage(new PDPage()); doc.save(out); return out.toByteArray();
        }
    }
    @Test void unauthenticatedRequestsNeverReachExtraction() throws Exception {
        mvc.perform(get("/api/importacoes")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/importacoes/acesso")).andExpect(status().isUnauthorized());
        mvc.perform(post("/api/admin/questoes").contentType("application/json").content("{}"))
            .andExpect(status().isUnauthorized());
        mvc.perform(post("/api/importacoes/anything/publicar").contentType("application/json").content("{}"))
            .andExpect(status().isUnauthorized());
        verifyNoInteractions(classifier,local);
    }
    @Test void manualQuestionIsValidatedAndPublishedInPublicCollection() throws Exception {
        ObjectNode body=mapper.createObjectNode().put("ano",2026).put("banca","Professor")
            .put("concurso","Questão avulsa").put("materia","Português").put("conteudo","Sintaxe")
            .put("dificuldade","Média").put("enunciado","Assinale a alternativa correta.")
            .put("resposta_correta",1);
        body.set("opcoes",mapper.createArrayNode().add("A").add("B").add("C").add("D").add("E"));
        JsonNode published=jobs.createManual("admin-one",body);
        assertEquals("Professor",published.path("banca").asText());
        assertEquals(2026,published.path("ano").asInt());
        assertFalse(published.has("pdf_original"));
        assertTrue(jobs.publicQuestions().toString().contains("Assinale a alternativa correta."));
        body.put("dificuldade","Impossível");
        assertThrows(ResponseStatusException.class,()->jobs.createManual("admin-one",body));
    }
    @Test void durableDraftPublicationIsAtomicPrivateAndIdempotent() throws Exception {
        when(local.extract(any())).thenAnswer(i -> fixture());
        byte[] original=pdf();
        ImportacaoPdf created=jobs.create("admin-one",original,original,2025,"TESTE","Prova de teste","T",1);
        await().atMost(Duration.ofSeconds(10)).until(()->repo.findById(created.id).orElseThrow().status.equals("REVISAO"));
        ImportacaoPdf draft=jobs.owned(created.id,"admin-one");
        assertThrows(ResponseStatusException.class,()->jobs.owned(created.id,"another-user"));
        mvc.perform(get("/api/acervo/"+draft.id+"/prova.pdf")).andExpect(status().isNotFound());
        assertFalse(jobs.publicQuestions().toString().contains(draft.id));
        ObjectNode body=mapper.createObjectNode().put("version",draft.version);
        body.set("questoes",mapper.readTree(draft.questoes));
        assertThrows(ResponseStatusException.class,()->jobs.save(draft.id,"admin-one",body,true));
        body.set("questoes",fixture());
        ImportacaoPdf published=jobs.save(draft.id,"admin-one",body,true);
        assertEquals("PUBLICADO",published.status);
        verifyNoInteractions(classifier);
        assertTrue(jobs.publicQuestions().toString().contains(draft.id));
        assertFalse(jobs.publicQuestions().toString().contains("ownerId"));
        JsonNode publicQuestion=null;
        for(JsonNode candidate:jobs.publicQuestions()) if(candidate.path("id").asText().contains(draft.id)) publicQuestion=candidate;
        assertNotNull(publicQuestion);
        assertEquals(2019,publicQuestion.path("ano").asInt());
        assertEquals("ESA",publicQuestion.path("banca").asText());
        assertEquals(17,publicQuestion.path("numero_fonte").asInt());
        assertEquals(published.version,jobs.save(draft.id,"admin-one",body,true).version);
        assertEquals(draft.id,jobs.create("admin-one",original,original,2025,"TESTE","Prova de teste","T",1).id);
        mvc.perform(get("/api/acervo/"+draft.id+"/prova.pdf")).andExpect(status().isOk()).andExpect(content().contentType("application/pdf"));
        mvc.perform(get("/api/acervo/"+draft.id+"/paginas/1")).andExpect(status().isOk()).andExpect(content().contentType("image/jpeg"));
    }
    @Test void reviewRejectsMissingAnswersDuplicateNumbersAndIncompleteExams() throws Exception {
        ImportacaoPdf job=new ImportacaoPdf();job.esperadas=1;job.paginas=1;
        ArrayNode values=fixture(); ((ObjectNode)values.get(0)).putNull("resposta_correta");
        assertThrows(ResponseStatusException.class,()->drafts.normalize(values,job,true));
        ((ObjectNode)values.get(0)).put("anulada",true);
        assertTrue(drafts.normalize(values,job,true).get(0).path("resposta_correta").isNull());
        values.add(values.get(0).deepCopy());
        assertThrows(ResponseStatusException.class,()->drafts.normalize(values,job,true));
        assertThrows(ResponseStatusException.class,()->drafts.normalize(mapper.createArrayNode(),job,true));
        assertThrows(ResponseStatusException.class,()->pdfs.validate("not a PDF".getBytes()));
    }
    @Test void reviewRejectsRepeatedBlankAndContaminatedOptions() throws Exception {
        ImportacaoPdf job=new ImportacaoPdf();job.esperadas=1;job.paginas=1;
        ArrayNode values=fixture();
        ArrayNode options=(ArrayNode)values.get(0).path("opcoes");
        options.set(1,options.get(0));
        assertThrows(ResponseStatusException.class,()->drafts.normalize(values,job,true));
        options.set(1,TextNode.valueOf(""));
        assertThrows(ResponseStatusException.class,()->drafts.normalize(values,job,true));
        options.set(1,TextNode.valueOf("x".repeat(501)));
        assertThrows(ResponseStatusException.class,()->drafts.normalize(values,job,true));
    }
    @Test void reviewCleansPdfSeparatorsAndRejectsBrokenEquationGlyphs() throws Exception {
        ImportacaoPdf job=new ImportacaoPdf();job.esperadas=1;job.paginas=1;
        ArrayNode values=fixture();
        ((ArrayNode)values.get(0).path("opcoes")).set(4,TextNode.valueOf("7\n#####"));
        JsonNode clean=drafts.normalize(values,job,true).get(0);
        assertEquals("7",clean.path("opcoes").get(4).asText());

        ((ObjectNode)values.get(0)).put("enunciado","A equação 𝑥ଶ൅𝑦ଶെ4𝑥ൌെ3 está ilegível.");
        assertThrows(ResponseStatusException.class,()->drafts.normalize(values,job,true));
        ((ObjectNode)values.get(0)).put("enunciado","Assinale a alternativa correta.");
        ((ArrayNode)values.get(0).path("opcoes")).set(0,TextNode.valueOf("𝑟′ ൌ𝑎ଵ"));
        assertThrows(ResponseStatusException.class,()->drafts.normalize(values,job,true));
    }
    @Test void interruptedExtractionPreservesCompletedBatches() throws Exception {
        when(local.extract(any())).thenThrow(new IllegalStateException("PDF ilegível"));
        byte[] original=pdf();
        var created=jobs.create("admin-retry",original,original,2025,"TESTE","Prova retomada","R",6);
        await().atMost(Duration.ofSeconds(10)).until(()->repo.findById(created.id).orElseThrow().status.equals("ERRO"));
        var saved=jobs.owned(created.id,"admin-retry");
        ArrayNode batch=mapper.createArrayNode();
        for(int n=1;n<=5;n++) batch.add(((ObjectNode)fixture().get(0)).put("numero_original",n));
        saved.questoes=batch.toString();saved.progresso=5;repo.saveAndFlush(saved);
        doAnswer(call -> { ArrayNode one=fixture();((ObjectNode)one.get(0)).put("numero_original",6);return one; }).when(local).extract(any());
        jobs.retry(created.id,"admin-retry");
        await().atMost(Duration.ofSeconds(10)).until(()->repo.findById(created.id).orElseThrow().status.equals("REVISAO"));
        assertEquals(6,jobs.owned(created.id,"admin-retry").progresso);
        assertEquals(6,mapper.readTree(jobs.owned(created.id,"admin-retry").questoes).size());
    }
    @Test void incompleteReviewCanBeReprocessed() throws Exception {
        when(local.extract(any())).thenReturn(fixture());
        byte[] original=pdf();
        var created=jobs.create("admin-incomplete",original,original,2025,"TESTE","Prova incompleta","D",2);
        await().atMost(Duration.ofSeconds(10)).until(()->repo.findById(created.id).orElseThrow().status.equals("REVISAO"));
        assertEquals(1,jobs.owned(created.id,"admin-incomplete").progresso);
        ArrayNode complete=fixture();complete.add(((ObjectNode)fixture().get(0)).put("numero_original",2));
        when(local.extract(any())).thenReturn(complete);
        jobs.retry(created.id,"admin-incomplete");
        await().atMost(Duration.ofSeconds(10)).until(()->repo.findById(created.id).orElseThrow().progresso==2);
        assertEquals(2,mapper.readTree(jobs.owned(created.id,"admin-incomplete").questoes).size());
    }
    @Test void extractionAutomaticallyClassifiesMissingMetadata() throws Exception {
        ArrayNode extracted=fixture(); ObjectNode question=(ObjectNode)extracted.get(0);
        question.put("materia","");question.put("conteudo","");question.put("revisada",false);
        when(local.extract(any())).thenReturn(extracted);
        ArrayNode suggestions=mapper.createArrayNode().add(mapper.createObjectNode()
            .put("numero_original",1).put("materia","Matemática").put("conteudo","Operações fundamentais")
            .put("dificuldade","Fácil").put("confianca",0.94));
        when(classifier.classifyBatch(any())).thenReturn(suggestions);
        var created=jobs.create("admin-auto",pdf(),pdf(),2025,"TESTE","Classificação automática","AUTO",1);
        await().atMost(Duration.ofSeconds(10)).until(()->repo.findById(created.id).orElseThrow().status.equals("REVISAO"));
        JsonNode saved=mapper.readTree(jobs.owned(created.id,"admin-auto").questoes).get(0);
        assertEquals("Operações fundamentais",saved.path("conteudo").asText());
        assertEquals(0.94,saved.path("confianca_classificacao").asDouble());
        verify(classifier).classifyBatch(any());
    }
}
