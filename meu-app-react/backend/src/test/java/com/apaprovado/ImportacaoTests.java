package com.apaprovado;

import com.apaprovado.model.ImportacaoPdf;
import com.apaprovado.repository.ImportacaoRepository;
import com.apaprovado.service.*;
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
    @MockBean PdfGemini gemini;

    ArrayNode fixture() throws Exception {
        return (ArrayNode)mapper.readTree("""
          [{"numero_original":1,"enunciado":"Qual é a soma de 2 e 2?","texto_apoio":"",
          "opcoes":["3","4","5","6","7"],"resposta_correta":1,"anulada":false,
          "materia":"Matemática","conteudo":"Aritmética","dificuldade":"Fácil","pagina":1,"tem_imagem":false,"revisada":true}]
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
        mvc.perform(post("/api/importacoes/anything/publicar").contentType("application/json").content("{}"))
            .andExpect(status().isUnauthorized());
        verifyNoInteractions(gemini);
    }
    @Test void durableDraftPublicationIsAtomicPrivateAndIdempotent() throws Exception {
        when(gemini.extract(any(),anyInt(),anyInt())).thenAnswer(i -> fixture());
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
        assertTrue(jobs.publicQuestions().toString().contains(draft.id));
        assertFalse(jobs.publicQuestions().toString().contains("ownerId"));
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
    @Test void interruptedExtractionPreservesCompletedBatches() throws Exception {
        doAnswer(call -> {
            if ((int)call.getArgument(1)>1) throw new IllegalStateException("IA temporariamente indisponível");
            ArrayNode batch=mapper.createArrayNode();
            for(int n=1;n<=5;n++) batch.add(((ObjectNode)fixture().get(0)).put("numero_original",n));
            return batch;
        }).when(gemini).extract(any(),anyInt(),anyInt());
        byte[] original=pdf();
        var created=jobs.create("admin-retry",original,original,2025,"TESTE","Prova retomada","R",6);
        await().atMost(Duration.ofSeconds(10)).until(()->repo.findById(created.id).orElseThrow().status.equals("ERRO"));
        assertEquals(5,jobs.owned(created.id,"admin-retry").progresso);
        doAnswer(call -> { ArrayNode one=fixture();((ObjectNode)one.get(0)).put("numero_original",6);return one; }).when(gemini).extract(any(),eq(6),eq(6));
        jobs.retry(created.id,"admin-retry");
        await().atMost(Duration.ofSeconds(10)).until(()->repo.findById(created.id).orElseThrow().status.equals("REVISAO"));
        assertEquals(6,jobs.owned(created.id,"admin-retry").progresso);
        assertEquals(6,mapper.readTree(jobs.owned(created.id,"admin-retry").questoes).size());
    }
}
