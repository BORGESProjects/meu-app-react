package com.apaprovado.controller;
import com.apaprovado.service.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.time.Duration;

@RestController
@RequestMapping("/api/acervo")
public class AcervoController {
    private final Importacoes jobs;
    private final PdfFiles files;
    public AcervoController(Importacoes jobs,PdfFiles files) { this.jobs=jobs; this.files=files; }
    @GetMapping public Object questions() throws Exception { return jobs.publicQuestions(); }
    @GetMapping("/{id}/prova.pdf") public ResponseEntity<byte[]> pdf(@PathVariable String id) {
        return ResponseEntity.ok().contentType(MediaType.APPLICATION_PDF).header("Content-Disposition","inline; filename=prova.pdf")
            .cacheControl(CacheControl.maxAge(Duration.ofHours(1)).cachePublic()).body(jobs.published(id).prova);
    }
    @GetMapping("/{id}/paginas/{page}") public ResponseEntity<byte[]> image(@PathVariable String id,@PathVariable int page) {
        return ResponseEntity.ok().contentType(MediaType.IMAGE_JPEG).cacheControl(CacheControl.maxAge(Duration.ofHours(1)).cachePublic())
            .body(files.page(jobs.published(id).prova,page));
    }
}
