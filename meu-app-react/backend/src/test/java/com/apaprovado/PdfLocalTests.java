package com.apaprovado;
import com.apaprovado.service.*;
import com.apaprovado.model.ImportacaoPdf;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import java.util.*;
import java.nio.file.*;
import static org.junit.jupiter.api.Assertions.*;

class PdfLocalTests {
    final PdfLocal extractor=new PdfLocal(new PdfTextReader(),new ObjectMapper());
    @Test void actualOcrOnLinuxBuild() throws Exception {
        org.junit.jupiter.api.Assumptions.assumeTrue(System.getProperty("os.name").toLowerCase().contains("linux"));
        var image=new java.awt.image.BufferedImage(1200,500,java.awt.image.BufferedImage.TYPE_BYTE_GRAY);
        var g=image.createGraphics();g.setColor(java.awt.Color.WHITE);g.fillRect(0,0,1200,500);
        g.setColor(java.awt.Color.BLACK);g.setFont(new java.awt.Font("SansSerif",java.awt.Font.PLAIN,32));
        int y=60;for(String line:List.of("QUESTAO 1","Quanto e dois mais dois?","A) Tres","B) Quatro","C) Cinco")) {g.drawString(line,50,y);y+=65;}
        g.dispose();
        try { String text=new PdfTextReader().recognize(image);assertTrue(text.contains("Quatro"),text);assertTrue(text.contains("QUEST"),text); }
        finally { image.flush(); }
    }
    @Test void separatesAnswersAndUsesOnlySelectedModel() {
        var job=new ImportacaoPdf();job.esperadas=2;job.modelo="B";
        var questions=extractor.parse(List.of(new PdfTextReader.Page(2,"""
            PROVA DE MATEMÁTICA
            1
            Quanto é dois mais dois?
            [A] Três
            [B] Quatro
            [C] Cinco
            [D] Seis
            [E] Sete
            2
            Qual é o dobro de dois?
            A) 1
            B) 2
            C) 3
            D) 4
            E) 5
            """,false)),List.of(new PdfTextReader.Page(1,"Modelo A Modelo B\n1 A 1 B\n2 E 2 Anulada",false)),job);
        assertEquals(2,questions.size());assertEquals(1,questions.get(0).path("resposta_correta").asInt());
        assertEquals("Quatro",questions.get(0).path("opcoes").get(1).asText());
        assertFalse(questions.get(0).path("enunciado").asText().contains("[A]"));
        assertTrue(questions.get(1).path("anulada").asBoolean());assertFalse(questions.get(0).path("revisada").asBoolean());
    }
    @Test void neverGuessesBubbleSheetOrConflictingAnswers() {
        var answers=extractor.answers(List.of(new PdfTextReader.Page(1,"1 Ⓐ Ⓑ Ⓒ Ⓓ Ⓔ\n2 A\n2 B",false)),"A");
        assertTrue(answers.isEmpty());
    }
    @Test void keepsSharedTextAndUnknownAnswer() {
        var job=new ImportacaoPdf();job.esperadas=1;job.modelo="A";
        String support="Texto de apoio: "+"Um trecho importante da leitura. ".repeat(5);
        var values=extractor.parse(List.of(new PdfTextReader.Page(1,support,false),new PdfTextReader.Page(2,"1\nSegundo o texto, qual opção?\n[A] Um\n[B] Dois",true)),List.of(),job);
        assertTrue(values.get(0).path("texto_apoio").asText().contains(support.strip()));
        assertTrue(values.get(0).path("resposta_correta").isNull());
        assertTrue(values.get(0).path("observacao").asText().contains("OCR"));
    }
    @Test void realExamWhenProvided() throws Exception {
        String exam=System.getProperty("test.exam");
        if(exam==null) return;
        var job=new ImportacaoPdf();job.esperadas=Integer.getInteger("test.count",44);job.modelo="A";
        job.prova=Files.readAllBytes(Path.of(exam));job.gabarito=Files.readAllBytes(Path.of(System.getProperty("test.key")));
        Files.writeString(Path.of("target/local-text.txt"),new PdfTextReader().read(job.prova).toString());
        var result=extractor.extract(job);
        System.out.println("Local extraction: "+result.size()+" questions, "+java.util.stream.StreamSupport.stream(result.spliterator(),false).filter(q->!q.path("resposta_correta").isNull()||q.path("anulada").asBoolean()).count()+" answers");
        Files.createDirectories(Path.of("target"));Files.writeString(Path.of("target/local-extraction.json"),result.toPrettyString());
        assertEquals(job.esperadas,result.size());
        job.paginas=100;
        new QuestionDrafts(new ObjectMapper()).normalize(result,job,false);
        for(var q:result) {assertFalse(q.path("enunciado").asText().isBlank(),q.toString());assertFalse(q.path("revisada").asBoolean());}
    }
}
