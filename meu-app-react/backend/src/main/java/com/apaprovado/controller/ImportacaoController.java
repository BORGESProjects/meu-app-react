package com.apaprovado.controller;

import com.apaprovado.service.*;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.server.ResponseStatusException;
import java.util.Map;

@RestController
@RequestMapping("/api/importacoes")
public class ImportacaoController {
    private final ImportAdmin auth;
    private final Importacoes jobs;
    public ImportacaoController(ImportAdmin auth,Importacoes jobs) { this.auth=auth; this.jobs=jobs; }
    @GetMapping("/acesso") public Map<String,Boolean> access(@RequestHeader(value="Authorization",required=false) String token,@RequestHeader(value="X-Supabase-Key",required=false) String key) {
        auth.require(token,key); return Map.of("administrador",true);
    }
    @GetMapping public Object list(@RequestHeader(value="Authorization",required=false) String token,@RequestHeader(value="X-Supabase-Key",required=false) String key) {
        return jobs.list(auth.require(token,key));
    }
    @PostMapping(consumes=MediaType.MULTIPART_FORM_DATA_VALUE) public Object create(
        @RequestHeader(value="Authorization",required=false) String token,@RequestHeader(value="X-Supabase-Key",required=false) String key,
        @RequestParam MultipartFile prova,@RequestParam MultipartFile gabarito,@RequestParam int ano,
        @RequestParam String banca,@RequestParam String concurso,@RequestParam String modelo,@RequestParam int esperadas) throws Exception {
        String owner=auth.require(token,key);
        return jobs.detail(jobs.create(owner,prova.getBytes(),gabarito.getBytes(),ano,banca,concurso,modelo,esperadas));
    }
    @GetMapping("/{id}") public Object get(@PathVariable String id,@RequestHeader(value="Authorization",required=false) String token,@RequestHeader(value="X-Supabase-Key",required=false) String key) throws Exception {
        return jobs.detail(jobs.owned(id,auth.require(token,key)));
    }
    @PatchMapping("/{id}") public Object save(@PathVariable String id,@RequestHeader(value="Authorization",required=false) String token,@RequestHeader(value="X-Supabase-Key",required=false) String key,@RequestBody JsonNode body) throws Exception {
        return jobs.detail(jobs.save(id,auth.require(token,key),body,false));
    }
    @PostMapping("/{id}/publicar") public Object publish(@PathVariable String id,@RequestHeader(value="Authorization",required=false) String token,@RequestHeader(value="X-Supabase-Key",required=false) String key,@RequestBody JsonNode body) throws Exception {
        return jobs.detail(jobs.save(id,auth.require(token,key),body,true));
    }
    @PostMapping("/{id}/continuar") public Object retry(@PathVariable String id,@RequestHeader(value="Authorization",required=false) String token,@RequestHeader(value="X-Supabase-Key",required=false) String key) throws Exception {
        return jobs.detail(jobs.retry(id,auth.require(token,key)));
    }
    @GetMapping("/{id}/arquivo/{tipo}") public ResponseEntity<byte[]> file(@PathVariable String id,@PathVariable String tipo,@RequestHeader(value="Authorization",required=false) String token,@RequestHeader(value="X-Supabase-Key",required=false) String key) {
        var job=jobs.owned(id,auth.require(token,key));
        if(!tipo.equals("prova")&&!tipo.equals("gabarito")) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        return ResponseEntity.ok().contentType(MediaType.APPLICATION_PDF).cacheControl(CacheControl.noStore()).body(tipo.equals("prova")?job.prova:job.gabarito);
    }
    @ExceptionHandler(ResponseStatusException.class) public ResponseEntity<?> error(ResponseStatusException e) {
        return ResponseEntity.status(e.getStatusCode()).body(Map.of("message",e.getReason()==null?"Requisição inválida.":e.getReason()));
    }
    @ExceptionHandler(MaxUploadSizeExceededException.class) public ResponseEntity<?> tooLarge() {
        return ResponseEntity.status(413).body(Map.of("message","Cada PDF deve ter até 6 MB."));
    }
}
