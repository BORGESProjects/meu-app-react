package com.apaprovado.controller;

import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {
    private final String revisao;
    public HealthController(@Value("${RENDER_GIT_COMMIT:local}") String revisao) {
        this.revisao = revisao;
    }
    @GetMapping("/api/health")
    public Map<String, String> health() {
        return Map.of("status", "ok", "revisao", revisao);
    }
}
