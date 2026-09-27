package com.apaprovado;

import com.apaprovado.model.ImportacaoPdf;
import com.apaprovado.service.PdfGemini;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfSystemProperty;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import java.nio.file.Files;
import java.nio.file.Path;
import static org.junit.jupiter.api.Assertions.*;

/** Opt-in smoke check only; normal builds never contact the model or spend quota. */
@SpringBootTest
@EnabledIfSystemProperty(named="test.gemini.live",matches="true")
class PdfGeminiLiveTests {
    @Autowired PdfGemini gemini;
    @Test void suggestsOnlyMetadata() throws Exception {
        var question=new com.fasterxml.jackson.databind.ObjectMapper().readTree("{\"enunciado\":\"Quanto é 2 + 2?\",\"opcoes\":[\"3\",\"4\"]}");
        var result=gemini.classify(question);
        assertEquals(3,result.size());
        assertFalse(result.path("materia").asText().isBlank());
        assertFalse(result.has("resposta_correta"));
    }
}
