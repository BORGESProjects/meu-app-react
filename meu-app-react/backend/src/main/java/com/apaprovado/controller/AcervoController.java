package com.apaprovado.controller;
import com.apaprovado.service.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.time.Duration;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/acervo")
public class AcervoController {
    private final Importacoes jobs;
    private final PdfFiles files;
    private final R2AcervoStorage r2;
    private final SupabaseSessionAuth sessions;
    private final ImportAdmin admin;
    public AcervoController(Importacoes jobs, PdfFiles files, R2AcervoStorage r2,
                            SupabaseSessionAuth sessions, ImportAdmin admin) {
        this.jobs = jobs;
        this.files = files;
        this.r2 = r2;
        this.sessions = sessions;
        this.admin = admin;
    }
    @GetMapping public Object questions() throws Exception { return jobs.publicQuestions(); }
    @PostMapping("/r2/assinaturas")
    public Map<String, Map<String, String>> assinaturasR2(
        @RequestHeader(value = "Authorization", required = false) String authorization,
        @RequestHeader(value = "X-Supabase-Key", required = false) String publicKey,
        @RequestBody Map<String, List<String>> request
    ) {
        sessions.requireAuthenticated(authorization, publicKey);
        return Map.of("urls", r2.presignExisting(request == null ? null : request.get("keys")));
    }

    @GetMapping("/r2/status")
    public R2AcervoStorage.StorageStatus statusR2(
        @RequestHeader(value = "Authorization", required = false) String authorization,
        @RequestHeader(value = "X-Supabase-Key", required = false) String publicKey
    ) {
        admin.require(authorization, publicKey);
        return r2.storageStatus();
    }

    @PostMapping("/r2/preflight")
    public R2AcervoStorage.PreflightResult preflightR2(
        @RequestHeader(value = "Authorization", required = false) String authorization,
        @RequestHeader(value = "X-Supabase-Key", required = false) String publicKey,
        @RequestBody List<R2AcervoStorage.UploadFileDescriptor> files
    ) {
        admin.require(authorization, publicKey);
        return r2.preflight(files);
    }

    @PostMapping(value = "/r2/objetos", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Map<String, Object> enviarObjetosR2(
        @RequestHeader(value = "Authorization", required = false) String authorization,
        @RequestHeader(value = "X-Supabase-Key", required = false) String publicKey,
        @RequestParam("files") List<MultipartFile> files
    ) {
        admin.require(authorization, publicKey);
        return r2.uploadBatch(files);
    }
    @GetMapping("/{id}/prova.pdf") public ResponseEntity<byte[]> pdf(@PathVariable String id) {
        return ResponseEntity.ok().contentType(MediaType.APPLICATION_PDF).header("Content-Disposition","inline; filename=prova.pdf")
            .cacheControl(CacheControl.maxAge(Duration.ofHours(1)).cachePublic()).body(jobs.published(id).prova);
    }
    @GetMapping("/{id}/paginas/{page}") public ResponseEntity<byte[]> image(@PathVariable String id,@PathVariable int page) {
        return ResponseEntity.ok().contentType(MediaType.IMAGE_JPEG).cacheControl(CacheControl.maxAge(Duration.ofHours(1)).cachePublic())
            .body(files.page(jobs.published(id).prova,page));
    }
}
