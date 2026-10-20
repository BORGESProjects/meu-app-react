package com.apaprovado.service;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.*;
import org.springframework.web.server.ResponseStatusException;
import java.time.Duration;

@Service
public class RedacaoAuth {
    private final RestTemplate http;
    private final String url;
    public RedacaoAuth(RestTemplateBuilder builder,@Value("${app.supabase.url}") String url) {
        http=builder.setConnectTimeout(Duration.ofSeconds(5)).setReadTimeout(Duration.ofSeconds(10)).build();
        this.url=url.replaceAll("/+$","");
    }
    public String require(String token,String key) {
        if(token==null || !token.startsWith("Bearer ") || key==null || key.isBlank()) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Entre na sua conta para corrigir a redação.");
        var headers=new HttpHeaders();headers.set("Authorization",token);headers.set("apikey",key);
        try {
            JsonNode user=http.exchange(url+"/auth/v1/user",HttpMethod.GET,new HttpEntity<>(headers),JsonNode.class).getBody();
            if(user==null || user.path("id").asText("").isBlank() || user.path("email_confirmed_at").asText("").isBlank()) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Confirme seu e-mail e entre novamente.");
            return user.path("id").asText();
        } catch(HttpClientErrorException e) {throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Sessão expirada. Entre novamente.");}
        catch(RestClientException e) {throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,"Não foi possível validar sua sessão. Tente novamente.");}
    }
}
