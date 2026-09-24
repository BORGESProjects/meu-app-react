package com.apaprovado.controller;

import com.apaprovado.model.EditalItem;
import com.apaprovado.repository.EditalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/editais")
@CrossOrigin(origins = "*")
public class EditalController {

    @Autowired
    private EditalRepository editalRepository;

    @GetMapping
    public List<EditalItem> listar(@RequestParam(required = false) String concurso) {
        if (concurso != null && !concurso.isEmpty()) {
            return editalRepository.findByConcurso(concurso);
        }
        return editalRepository.findAll();
    }

    @PostMapping
    public EditalItem salvar(@RequestBody EditalItem item) {
        return editalRepository.save(item);
    }

    @PatchMapping("/{id}/toggle")
    public EditalItem alternarConcluido(@PathVariable Long id) {
        EditalItem item = editalRepository.findById(id).orElseThrow();
        item.setConcluido(!item.isConcluido());
        return editalRepository.save(item);
    }

    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Long id) {
        editalRepository.deleteById(id);
    }
}