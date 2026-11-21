package com.apaprovado;

import com.apaprovado.service.ImportAdmin;
import com.apaprovado.service.SupabaseSessionAuth;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.server.ResponseStatusException;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ImportAdminTests {
    @Test void somenteAdministradorConfirmadoPodeAdministrar() throws Exception {
        var sessoes = mock(SupabaseSessionAuth.class);
        var jdbc = mock(JdbcTemplate.class);
        var usuario = new ObjectMapper().createObjectNode().put("id","id").put("email","admin@example.com");
        when(sessoes.requireAuthenticated("Bearer token","public")).thenReturn(usuario);
        var admin = new ImportAdmin(sessoes,jdbc);
        assertThrows(ResponseStatusException.class,()->admin.require("Bearer token","public"));
        verifyNoInteractions(jdbc);
        usuario.put("email_confirmed_at","2026-01-01");
        when(jdbc.queryForObject(contains("papel='administrador'"),eq(Boolean.class),eq("id"),eq("admin@example.com"))).thenReturn(false,true);
        assertEquals(403, assertThrows(ResponseStatusException.class,()->admin.require("Bearer token","public")).getStatusCode().value());
        assertEquals("id",admin.require("Bearer token","public"));
    }
}
