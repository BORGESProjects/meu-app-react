package com.apaprovado;
import com.apaprovado.service.PdfGemini;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.MediaType;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.*;
import static org.springframework.test.web.client.response.MockRestResponseCreators.*;

class GeminiClassificationTests {
    @Test void sendsOnlyQuestionTextAndAcceptsOnlyMetadata() throws Exception {
        var customizer=new org.springframework.boot.test.web.client.MockServerRestTemplateCustomizer();
        var mapper=new ObjectMapper();
        var gemini=new PdfGemini(new RestTemplateBuilder().additionalCustomizers(customizer),mapper,"test-key","test-model");
        var server=customizer.getServer();
        String suggestion=mapper.writeValueAsString(Map.of("materia","Matemática","conteudo","Aritmética","dificuldade","Fácil","resposta_correta",3));
        String response=mapper.writeValueAsString(Map.of("candidates",List.of(Map.of("finishReason","STOP","content",Map.of("parts",List.of(Map.of("text",suggestion)))))));
        server.expect(requestTo("https://generativelanguage.googleapis.com/v1beta/models/test-model:generateContent"))
            .andExpect(request -> {
                var body=((org.springframework.mock.http.client.MockClientHttpRequest)request).getBodyAsString();
                assertFalse(body.contains("inline_data"));assertFalse(body.contains("resposta_correta"));assertFalse(body.contains("PDF_SECRET"));
                assertTrue(body.contains("Quanto"));
            }).andRespond(withSuccess(response,MediaType.APPLICATION_JSON));
        var question=mapper.createObjectNode().put("enunciado","Quanto é 2+2?").put("resposta_correta",1).put("pdf","PDF_SECRET");
        question.putArray("opcoes").add("3").add("4");
        var result=gemini.classify(question);
        assertEquals(3,result.size());assertFalse(result.has("resposta_correta"));assertEquals("Matemática",result.path("materia").asText());server.verify();
    }
    @Test void providerFailureAllowsManualClassification() throws Exception {
        var customizer=new org.springframework.boot.test.web.client.MockServerRestTemplateCustomizer();
        var mapper=new ObjectMapper();
        var gemini=new PdfGemini(new RestTemplateBuilder().additionalCustomizers(customizer),mapper,"test-key","test-model");
        customizer.getServer().expect(anything()).andRespond(withStatus(org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE));
        var error=assertThrows(IllegalStateException.class,()->gemini.classify(mapper.createObjectNode().put("enunciado","Teste")));
        assertTrue(error.getMessage().contains("manualmente"));customizer.getServer().verify();
    }
}
