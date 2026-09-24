package com.apaprovado.controller;

import com.apaprovado.dto.RedacaoRequest;
import com.apaprovado.service.GeminiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ia")
@CrossOrigin(origins = "http://localhost:5173")
public class RedacaoController {

    @Autowired
    private GeminiService geminiService;

    @PostMapping("/corrigir-redacao")
    public ResponseEntity<?> corrigirRedacao(@RequestBody RedacaoRequest request) {
        // Chama a IA de verdade com o tema e o texto enviados pelo site
        String correcaoIa = geminiService.corrigirRedacaoComIA(request.getTema(), request.getTexto());

        // Converte o texto da correção para o formato JSON compatível com o seu App.jsx
        String jsonResposta = "{ \"candidates\": [ { \"content\": { \"parts\": [ { \"text\": \"" + 
                correcaoIa.replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "") + 
                "\" } ] } } ] }";

        return ResponseEntity.ok().body(jsonResposta);
    }
}