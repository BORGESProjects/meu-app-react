package com.apaprovado.service;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;
import java.time.Duration;
import java.util.Locale;

@Service
public class ImportAdmin {
    private final RestTemplate http;
    private final String url;
    private final String email;
    public ImportAdmin(RestTemplateBuilder builder, @Value("${app.supabase.url}") String url,
                       @Value("${app.admin.email:}") String email) {
        this.http = builder.setConnectTimeout(Duration.ofSeconds(8)).setReadTimeout(Duration.ofSeconds(15)).build();
        this.url = url.replaceAll("/+$", "");
        this.email = email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
    }
    public String require(String authorization, String publicKey) {
        if (authorization == null || !authorization.startsWith("Bearer ") || publicKey == null || publicKey.isBlank())
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Entre com sua conta de administrador.");
        if (email.isBlank())
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "O e-mail administrador ainda não foi configurado.");
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", authorization);
        headers.set("apikey", publicKey);
        try {
            // Fixed trusted origin. The browser key only identifies this Supabase project;
            // authority comes from Auth's server-verified user, never from request metadata.
            JsonNode user = http.exchange(url + "/auth/v1/user", HttpMethod.GET, new HttpEntity<>(headers), JsonNode.class).getBody();
            String emailConfirmadoEm = user == null ? "" : user.path("email_confirmed_at").asText("");
            if (user == null || !email.equals(user.path("email").asText("").trim().toLowerCase(Locale.ROOT))
                || emailConfirmadoEm.isBlank()
                || user.path("id").asText("").isBlank()
                || user.path("is_anonymous").asBoolean(false))
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Esta conta não tem acesso administrativo.");
            return user.path("id").asText();
        } catch (HttpClientErrorException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sessão inválida. Entre novamente.");
        } catch (RestClientException e) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Não foi possível validar o login. Tente novamente.");
        }
    }
}
