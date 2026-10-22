package com.apaprovado.controller;

import com.apaprovado.model.EditalItem;
import com.apaprovado.repository.EditalRepository;
import com.apaprovado.service.ImportAdmin;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/editais")
public class EditalController {

    private final EditalRepository editalRepository;
    private final ImportAdmin auth;

    public EditalController(EditalRepository editalRepository, ImportAdmin auth) {
        this.editalRepository = editalRepository;
        this.auth = auth;
    }

    @GetMapping
    public List<EditalItem> listar(@RequestParam(required = false) String concurso) {
        if (concurso != null && !concurso.isEmpty()) {
            return editalRepository.findByConcurso(concurso);
        }
        return editalRepository.findAll();
    }

    @PostMapping
    public EditalItem salvar(@RequestBody EditalItem item,
            @RequestHeader(value="Authorization",required=false) String token,
            @RequestHeader(value="X-Supabase-Key",required=false) String key) {
        auth.require(token,key);
        return editalRepository.save(item);
    }

    @PatchMapping("/{id}/toggle")
    public EditalItem alternarConcluido(@PathVariable Long id,
            @RequestHeader(value="Authorization",required=false) String token,
            @RequestHeader(value="X-Supabase-Key",required=false) String key) {
        auth.require(token,key);
        EditalItem item = editalRepository.findById(id).orElseThrow();
        item.setConcluido(!item.isConcluido());
        return editalRepository.save(item);
    }

    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Long id,
            @RequestHeader(value="Authorization",required=false) String token,
            @RequestHeader(value="X-Supabase-Key",required=false) String key) {
        auth.require(token,key);
        editalRepository.deleteById(id);
    }
}
