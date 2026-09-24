package com.apaprovado.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GeminiService {

    // A chave é injetada automaticamente de forma segura pelo Spring Boot
    @Value("${gemini.api.key}")
    private String apiKey;

    // Modelo obrigatório exigido pela tua chave de API
    private final String URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent";

    public String corrigirRedacaoComIA(String tema, String texto) {
        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-goog-api-key", apiKey);

        String prompt = "Aja como um corretor rigoroso de redações (estilo ENEM e concursos públicos). " +
                "Tema da redação: " + tema + "\n" +
                "Texto enviado pelo aluno:\n" + texto + "\n\n" +
                "Por favor, analise o texto detalhadamente, aponte pontos fortes, desvios gramaticais, coerência, coesão, proposta de intervenção e dê uma avaliação construtiva.";

        Map<String, Object> part = new HashMap<>();
        part.put("text", prompt);

        Map<String, Object> content = new HashMap<>();
        content.put("parts", List.of(part));

        Map<String, Object> body = new HashMap<>();
        body.put("contents", List.of(content));

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(URL, entity, Map.class);
            Map<String, Object> responseBody = response.getBody();
            
            if (responseBody != null && responseBody.containsKey("candidates")) {
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) responseBody.get("candidates");
                if (!candidates.isEmpty()) {
                    Map<String, Object> candidateContent = (Map<String, Object>>) candidates.get(0).get("content");
                    List<Map<String, Object>> parts = (List<Map<String, Object>>) candidateContent.get("parts");
                    if (!parts.isEmpty()) {
                        return (String) parts.get(0).get("text");
                    }
                }
            }
            return "Não foi possível extrair a resposta da IA.";
        } catch (Exception e) {
            return "Erro ao comunicar com a API do Gemini: " + e.getMessage();
        }
    }
}