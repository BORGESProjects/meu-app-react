package com.apaprovado.controller;

import com.apaprovado.dto.RedacaoRequest;
import com.apaprovado.service.GeminiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ia")
public class RedacaoController {

    @Autowired
    private GeminiService geminiService;

    @PostMapping("/corrigir-redacao")
    public ResponseEntity<?> corrigirRedacao(@RequestBody RedacaoRequest request) {
        if (request.getTema() == null || request.getTema().isBlank()
                || request.getTexto() == null || request.getTexto().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Tema e texto são obrigatórios."));
        }
        // Chama a IA de verdade com o tema e o texto enviados pelo site
        String correcaoIa = geminiService.corrigirRedacaoComIA(
                request.getTema(), request.getTexto(), request.getBanca(), request.getAno(), request.getCriterios());

        // Deixa o Spring serializar a resposta para preservar aspas, acentos e quebras de linha.
        return ResponseEntity.ok(Map.of(
                "candidates", List.of(Map.of(
                        "content", Map.of(
                                "parts", List.of(Map.of("text", correcaoIa)))))));
    }
}
