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
    @Test void readsOfficialPdfAndVisualAnswerKey() throws Exception {
        ImportacaoPdf job=new ImportacaoPdf();
        job.prova=Files.readAllBytes(Path.of("../public/acervo/esa-2025/prova-original.pdf"));
        job.gabarito=Files.readAllBytes(Path.of("../public/acervo/esa-2025/gabarito-definitivo.pdf"));
        job.concurso="ESA 2025 CFGS 2026/27 Geral";job.banca="ESA";job.modelo="A";job.ano=2025;
        var result=gemini.extract(job,1,2);
        assertEquals(2,result.size());
        assertEquals(1,result.get(0).path("numero_original").asInt());
        assertTrue(result.get(0).path("anulada").asBoolean());
        assertEquals(2,result.get(1).path("numero_original").asInt());
        assertEquals(2,result.get(1).path("resposta_correta").asInt());
        assertEquals(5,result.get(1).path("opcoes").size());
    }
}
