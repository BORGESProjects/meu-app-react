package com.apaprovado.service;

import com.fasterxml.jackson.databind.JsonNode;
import java.time.Duration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

@Service
public class SupabaseSessionAuth {
    private final RestTemplate http;
    private final String supabaseUrl;

    public SupabaseSessionAuth(
        RestTemplateBuilder builder,
        @Value("${app.supabase.url}") String supabaseUrl
    ) {
        this.http = builder.setConnectTimeout(Duration.ofSeconds(8))
            .setReadTimeout(Duration.ofSeconds(15))
            .build();
        this.supabaseUrl = supabaseUrl.replaceAll("/+$", "");
    }

    public JsonNode requireAuthenticated(String authorization, String publicKey) {
        if (authorization == null || !authorization.startsWith("Bearer ")
            || publicKey == null || publicKey.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Entre na sua conta para acessar o acervo.");
        }

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", authorization);
        headers.set("apikey", publicKey);
        try {
            JsonNode user = http.exchange(
                supabaseUrl + "/auth/v1/user",
                HttpMethod.GET,
                new HttpEntity<>(headers),
                JsonNode.class
            ).getBody();
            if (user == null || user.path("id").asText("").isBlank()
                || user.path("is_anonymous").asBoolean(false)) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sessão inválida. Entre novamente.");
            }
            return user;
        } catch (HttpClientErrorException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sessão inválida. Entre novamente.");
        } catch (RestClientException e) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Não foi possível validar o login agora.");
        }
    }
}
