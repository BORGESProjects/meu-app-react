package com.apaprovado.service;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.apache.pdfbox.rendering.ImageType;
import org.springframework.stereotype.Service;
import javax.imageio.ImageIO;
import java.nio.file.*;
import java.util.*;
import java.util.concurrent.TimeUnit;

/** Text first, local OCR only for pages without a usable text layer. */
@Service
public class PdfTextReader {
    public record Page(int number, String text, boolean ocr) {}
    public List<Page> read(byte[] bytes) throws Exception {
        List<Page> pages = new ArrayList<>();
        try (var doc = Loader.loadPDF(bytes)) {
            var stripper = new PDFTextStripper();
            stripper.setSortByPosition(true);
            for (int i=0; i<doc.getNumberOfPages(); i++) {
                if (Thread.currentThread().isInterrupted()) throw new InterruptedException();
                stripper.setStartPage(i+1); stripper.setEndPage(i+1);
                String text = stripper.getText(doc);
                boolean hasImages=doc.getPage(i).getResources()!=null && doc.getPage(i).getResources().getXObjectNames().iterator().hasNext();
                boolean ocr = text.replaceAll("\\s", "").length()<40 && hasImages;
                if (ocr) {
                    var box=doc.getPage(i).getCropBox();
                    float dpi=Math.min(150,2400*72/Math.max(box.getWidth(),box.getHeight()));
                    var image = new PDFRenderer(doc).renderImageWithDPI(i,dpi,ImageType.GRAY);
                    try { text = recognize(image); } finally { image.flush(); }
                }
                pages.add(new Page(i+1,text,ocr));
            }
        }
        return pages;
    }
    public String recognize(java.awt.image.BufferedImage image) throws Exception {
        Path dir=Files.createTempDirectory("aprovado-ocr-");
        Process process=null;
        try {
            Path input=dir.resolve("page.png"), output=dir.resolve("text"), log=dir.resolve("ocr.log");
            ImageIO.write(image,"png",input.toFile());
            process=new ProcessBuilder("tesseract",input.toString(),output.toString(),"-l","por+eng","--psm","3")
                .redirectErrorStream(true).redirectOutput(log.toFile()).start();
            if (!process.waitFor(60,TimeUnit.SECONDS)) throw new IllegalStateException("O OCR demorou demais em uma página. Envie um PDF com melhor resolução ou camada de texto.");
            if(process.exitValue()!=0) throw new IllegalStateException("Não foi possível ler uma página digitalizada. Confira a qualidade do PDF.");
            return Files.readString(dir.resolve("text.txt"));
        } catch (java.io.IOException e) {
            throw new IllegalStateException("O leitor OCR não está disponível no servidor. Use um PDF com texto selecionável ou configure o Tesseract.");
        } finally {
            if(process!=null && process.isAlive()) { process.destroyForcibly(); process.waitFor(5,TimeUnit.SECONDS); }
            try(var paths=Files.list(dir)) { for(Path p:paths.toList()) Files.deleteIfExists(p); }
            Files.deleteIfExists(dir);
        }
    }
}
