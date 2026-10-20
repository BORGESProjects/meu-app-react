package com.apaprovado.controller;

import com.apaprovado.dto.RedacaoRequest;
import com.apaprovado.service.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.*;

@RestController
@RequestMapping("/api/ia")
public class RedacaoController {
    private final GeminiService gemini;
    private final RedacaoAuth auth;
    public RedacaoController(GeminiService gemini,RedacaoAuth auth){this.gemini=gemini;this.auth=auth;}
    @GetMapping("/redacao/status") public Map<String,Object> status(){return Map.of("versao",2,"formato","relatorio_v1","limiteCaracteres",20000);}
    @PostMapping("/corrigir-redacao") public ResponseEntity<?> corrigir(@RequestBody RedacaoRequest request,
            @RequestHeader(value="Authorization",required=false) String token,@RequestHeader(value="X-Supabase-Key",required=false) String key) {
        try {
            RedacaoService.validar(request);
            var resultado=gemini.corrigir(auth.require(token,key),request);
            return ResponseEntity.ok(Map.of("relatorio",resultado.relatorio(),"reutilizada",resultado.reutilizada(),"modelo",resultado.modelo(),
                    "candidates",List.of(Map.of("content",Map.of("parts",List.of(Map.of("text",resultado.relatorio().toPrettyString())))))));
        } catch(ResponseStatusException e) {
            var resposta=ResponseEntity.status(e.getStatusCode());
            if(e.getStatusCode().value()==429 || e.getStatusCode().value()==503)resposta.header("Retry-After","20");
            return resposta.body(Map.of("message",Objects.toString(e.getReason(),"Não foi possível corrigir a redação.")));
        }
    }
}
