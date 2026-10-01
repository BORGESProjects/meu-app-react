package com.apaprovado.controller;

import com.apaprovado.service.ImportAdmin;
import com.apaprovado.service.Importacoes;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/questoes")
public class AdminQuestionController {
    private final ImportAdmin auth;
    private final Importacoes questions;
    public AdminQuestionController(ImportAdmin auth, Importacoes questions) { this.auth=auth;this.questions=questions; }

    @PostMapping
    public Object create(@RequestHeader(value="Authorization",required=false) String token,
                         @RequestHeader(value="X-Supabase-Key",required=false) String key,
                         @RequestBody JsonNode body) throws Exception {
        return questions.createManual(auth.require(token,key),body);
    }
}
