package com.apaprovado.service;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.apache.pdfbox.rendering.ImageType;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import javax.imageio.ImageIO;
import java.io.*;
import java.nio.charset.StandardCharsets;

@Service
public class PdfFiles {
    public int validate(byte[] bytes) {
        if (bytes.length < 5 || bytes.length > 6 * 1024 * 1024
            || !new String(bytes, 0, 5, StandardCharsets.US_ASCII).equals("%PDF-"))
            throw bad("Envie PDFs válidos, com até 6 MB por arquivo.");
        try (PDDocument doc = Loader.loadPDF(bytes)) {
            if (doc.isEncrypted() || doc.getNumberOfPages() < 1 || doc.getNumberOfPages() > 100)
                throw bad("O PDF deve estar sem senha e ter entre 1 e 100 páginas.");
            for (var page : doc.getPages()) {
                if (page.getMediaBox().getWidth() > 2000 || page.getMediaBox().getHeight() > 2000)
                    throw bad("O PDF contém uma página com dimensões excessivas.");
            }
            return doc.getNumberOfPages();
        } catch (IOException e) { throw bad("Não foi possível abrir o PDF. Confira se está íntegro e sem senha."); }
    }
    public synchronized byte[] page(byte[] pdf, int page) {
        try (PDDocument doc = Loader.loadPDF(pdf); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            if (page < 1 || page > doc.getNumberOfPages()) throw bad("Página inválida.");
            var image = new PDFRenderer(doc).renderImageWithDPI(page - 1, 100, ImageType.RGB);
            ImageIO.write(image, "jpg", out);
            image.flush();
            return out.toByteArray();
        } catch (IOException e) { throw bad("Não foi possível exibir esta página."); }
    }
    private ResponseStatusException bad(String msg) { return new ResponseStatusException(HttpStatus.BAD_REQUEST, msg); }
}
