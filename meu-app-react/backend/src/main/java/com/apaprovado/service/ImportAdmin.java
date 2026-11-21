package com.apaprovado.service;

import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ImportAdmin {
    private final SupabaseSessionAuth sessoes;
    private final JdbcTemplate jdbc;

    public ImportAdmin(SupabaseSessionAuth sessoes, JdbcTemplate jdbc) {
        this.sessoes = sessoes;
        this.jdbc = jdbc;
    }

    public String require(String authorization, String publicKey) {
        var user = sessoes.requireAuthenticated(authorization, publicKey);
        String id = user.path("id").asText("");
        String email = user.path("email").asText("");
        if (id.isBlank() || email.isBlank() || user.path("email_confirmed_at").asText("").isBlank()
                || !Boolean.TRUE.equals(jdbc.queryForObject(
                    "SELECT EXISTS (SELECT 1 FROM public.permissoes_software WHERE user_id=CAST(? AS uuid) AND email=lower(?) AND papel='administrador')",
                    Boolean.class, id, email))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Esta conta não tem acesso administrativo.");
        }
        return id;
    }
}
