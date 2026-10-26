package com.apaprovado;

import com.apaprovado.service.AcessoComercial;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AcessoComercialTests {
    private static final String SECRET = "chave-webhook-de-teste-com-mais-de-trinta-caracteres";

    private static String assinatura(String corpo) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(SECRET.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        return "sha256=" + java.util.HexFormat.of().formatHex(mac.doFinal(corpo.getBytes(StandardCharsets.UTF_8)));
    }

    private static String evento(String status) {
        return "{\"provider\":\"mercado_pago\",\"eventId\":\"evt-1\",\"subscriptionId\":\"sub-1\","
            + "\"paymentId\":\"pay-1\",\"email\":\"aluno@example.com\",\"status\":\"" + status
            + "\",\"amount\":39.90,\"currency\":\"BRL\",\"accessUntil\":\""
            + Instant.now().plusSeconds(30L * 86400).toString() + "\"}";
    }

    @Test void rejectsAnUnsignedPaymentEvent() {
        var service = new AcessoComercial(mock(org.springframework.jdbc.core.JdbcTemplate.class), new ObjectMapper(), SECRET, "39.90");
        var error = assertThrows(ResponseStatusException.class, () -> service.processarEvento(evento("active"), "sha256=" + "0".repeat(64)));
        assertEquals(401, error.getStatusCode().value());
    }

    @Test void recordsAValidRenewalOnlyOnce() throws Exception {
        var jdbc = mock(org.springframework.jdbc.core.JdbcTemplate.class);
        when(jdbc.update(contains("eventos_pagamento"), eq("mercado_pago"), eq("evt-1"))).thenReturn(1);
        when(jdbc.update(contains("acesso_comercial"), any(), any(), any(), any(), any(), any())).thenReturn(1);
        var service = new AcessoComercial(jdbc, new ObjectMapper(), SECRET, "39.90");
        String body = evento("active");
        assertTrue(service.processarEvento(body, assinatura(body)));
        verify(jdbc).update(contains("acesso_comercial"), eq("mercado_pago"), eq("sub-1"), eq("pay-1"),
            eq("aluno@example.com"), eq("active"), any());
    }

    @Test void duplicateProviderEventsDoNotGrantAccessAgain() throws Exception {
        var jdbc = mock(org.springframework.jdbc.core.JdbcTemplate.class);
        when(jdbc.update(contains("eventos_pagamento"), eq("mercado_pago"), eq("evt-1"))).thenReturn(0);
        var service = new AcessoComercial(jdbc, new ObjectMapper(), SECRET, "39.90");
        String body = evento("active");
        assertFalse(service.processarEvento(body, assinatura(body)));
        verify(jdbc, never()).update(contains("acesso_comercial"), any(), any(), any(), any(), any(), any());
    }

    @Test void rejectsMissingWebhookConfiguration() {
        var service = new AcessoComercial(mock(org.springframework.jdbc.core.JdbcTemplate.class), new ObjectMapper(), "", "39.90");
        var error = assertThrows(ResponseStatusException.class, () -> service.processarEvento(evento("active"), "sha256=" + "0".repeat(64)));
        assertEquals(503, error.getStatusCode().value());
    }

    @Test void rejectsAValidEventAtTheWrongPrice() throws Exception {
        var service = new AcessoComercial(mock(org.springframework.jdbc.core.JdbcTemplate.class), new ObjectMapper(), SECRET, "49.90");
        String body = evento("active");
        var error = assertThrows(ResponseStatusException.class, () -> service.processarEvento(body, assinatura(body)));
        assertEquals(400, error.getStatusCode().value());
    }
}
