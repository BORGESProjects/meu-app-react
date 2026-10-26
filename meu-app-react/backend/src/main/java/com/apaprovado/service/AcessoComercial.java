package com.apaprovado.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.charset.StandardCharsets;
import java.math.BigDecimal;
import java.security.MessageDigest;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.HexFormat;
import java.util.Locale;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AcessoComercial {
    private final JdbcTemplate jdbc;
    private final ObjectMapper json;
    private final String segredoWebhook;
    private final String precoMensal;

    public AcessoComercial(JdbcTemplate jdbc, ObjectMapper json,
            @Value("${app.payment.webhook-secret:}") String segredoWebhook,
            @Value("${app.payment.monthly-price:}") String precoMensal) {
        this.jdbc = jdbc;
        this.json = json;
        this.segredoWebhook = segredoWebhook;
        this.precoMensal = precoMensal;
    }

    public record Status(boolean liberado, Instant validoAte, boolean cancelamentoAgendado,
            String plano, String ciclo) {}
    public record Recebimento(String referencia, String assinatura, String email, String plano, String ciclo,
            BigDecimal valor, String moeda, String status, Instant recebidoEm, Instant acessoValidoAte) {}
    public record RelatorioRecebimentos(BigDecimal saldoMesAntesTaxas, long pagamentosAprovadosMes,
            List<Recebimento> recebimentos) {}

    public record TitularCheckout(String referencia, String email, String plano, String ciclo, BigDecimal valor) {}

    public void registrarCheckout(String id, String referencia, String email, String plano, String ciclo, BigDecimal valor) {
        jdbc.update("INSERT INTO public.checkouts_mercado_pago(subscription_id,external_reference,email,plan_key,billing_cycle,amount) "
            + "VALUES (?,?,?,?,?,?)", id, referencia, email, plano, ciclo, valor);
    }

    public TitularCheckout checkout(String id) {
        var rows = jdbc.query("SELECT external_reference,email,plan_key,billing_cycle,amount FROM public.checkouts_mercado_pago WHERE subscription_id=?",
            (rs, row) -> new TitularCheckout(rs.getString("external_reference"), rs.getString("email"),
                rs.getString("plan_key"), rs.getString("billing_cycle"), rs.getBigDecimal("amount")), id);
        return rows.isEmpty() ? null : rows.get(0);
    }

    public Status status(String email) {
        if (email == null || email.isBlank()) return new Status(false, null, false, null, null);
        var linhas = jdbc.query(
            "SELECT access_until, status, plan_key, billing_cycle FROM public.acesso_comercial "
                + "WHERE lower(email) = lower(?) AND status IN ('active','cancelled') AND access_until > now() "
                + "ORDER BY access_until DESC LIMIT 1",
            (rs, row) -> new Status(true, rs.getTimestamp("access_until").toInstant(),
                "cancelled".equals(rs.getString("status")), rs.getString("plan_key"), rs.getString("billing_cycle")), email.trim());
        return linhas.isEmpty() ? new Status(false, null, false, null, null) : linhas.get(0);
    }

    public RelatorioRecebimentos listarRecebimentos() {
        var totais = jdbc.queryForMap("SELECT COALESCE(SUM("
                + "CASE WHEN paid_at >= date_trunc('month', now()) THEN amount ELSE 0 END - "
                + "CASE WHEN status IN ('refunded','charged_back') AND updated_at >= date_trunc('month', now()) THEN amount ELSE 0 END),0) AS saldo, "
                + "COUNT(*) FILTER (WHERE status='approved' AND paid_at >= date_trunc('month', now())) AS aprovados "
                + "FROM public.pagamentos_recebidos WHERE paid_at >= date_trunc('month', now()) "
                + "OR (status IN ('refunded','charged_back') AND updated_at >= date_trunc('month', now()))");
        BigDecimal saldoAntesTaxas = (BigDecimal) totais.get("saldo");
        long aprovados = ((Number) totais.get("aprovados")).longValue();
        List<Recebimento> itens = jdbc.query("SELECT payment_reference, subscription_id, email, plan_key, billing_cycle, amount, currency, "
                + "status, paid_at, access_until FROM public.pagamentos_recebidos ORDER BY paid_at DESC LIMIT 200",
            (rs, row) -> new Recebimento(rs.getString("payment_reference"), rs.getString("subscription_id"),
                rs.getString("email"), rs.getString("plan_key"), rs.getString("billing_cycle"),
                rs.getBigDecimal("amount"), rs.getString("currency"), rs.getString("status"),
                rs.getTimestamp("paid_at").toInstant(), rs.getTimestamp("access_until") == null ? null : rs.getTimestamp("access_until").toInstant()));
        return new RelatorioRecebimentos(saldoAntesTaxas, aprovados, itens);
    }

    @Transactional
    public boolean registrarPagamentoConfirmado(String eventId, String subscriptionId, String paymentId,
            String email, BigDecimal amount, String currency, Instant accessUntil, Instant paidAt) {
        BigDecimal configuredPrice;
        try {
            configuredPrice = new BigDecimal(precoMensal);
            if (configuredPrice.signum() <= 0) throw new NumberFormatException();
        } catch (Exception erro) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Preço mensal ainda não configurado.");
        }
        return registrarPagamentoConfirmado(eventId, subscriptionId, paymentId, email, "basica", "monthly",
            amount, currency, configuredPrice, accessUntil, paidAt);
    }

    @Transactional
    public boolean registrarPagamentoConfirmado(String eventId, String subscriptionId, String paymentId,
            String email, String plano, String ciclo, BigDecimal amount, String currency,
            BigDecimal valorEsperado, Instant accessUntil, Instant paidAt) {
        String normalizedEmail = email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
        if (eventId == null || eventId.isBlank() || subscriptionId == null || subscriptionId.isBlank()
                || paymentId == null || paymentId.isBlank()
                || !normalizedEmail.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")
                || !java.util.Set.of("basica", "premium").contains(plano)
                || !java.util.Set.of("monthly", "quarterly", "annual").contains(ciclo)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Dados de assinatura incompletos.");
        }
        if (valorEsperado == null || valorEsperado.signum() <= 0) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Preço do plano ainda não configurado.");
        }
        if (!"BRL".equalsIgnoreCase(currency) || amount == null || amount.compareTo(valorEsperado) != 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A fatura não corresponde ao plano e à frequência configurados.");
        }
        Instant now = Instant.now();
        if (accessUntil == null || !accessUntil.isAfter(now) || accessUntil.isAfter(now.plusSeconds(370L * 86400))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A validade da assinatura é inválida.");
        }
        int inserted = jdbc.update("INSERT INTO public.eventos_pagamento(provider,event_id) VALUES ('mercado_pago',?) "
                + "ON CONFLICT (provider,event_id) DO NOTHING", eventId);
        if (inserted == 0) return false;
        registrarRecebimento("mercado_pago", eventId, subscriptionId, paymentId, normalizedEmail, plano, ciclo,
            amount, currency.toUpperCase(Locale.ROOT), paidAt, accessUntil);
        jdbc.update("INSERT INTO public.acesso_comercial(provider,subscription_id,payment_reference,email,status,access_until,plan_key,billing_cycle) "
                + "VALUES ('mercado_pago',?,?,?,'active',?,?,?) ON CONFLICT (provider,subscription_id) DO UPDATE SET "
                + "payment_reference=EXCLUDED.payment_reference,email=EXCLUDED.email,status='active',"
                + "access_until=GREATEST(public.acesso_comercial.access_until,EXCLUDED.access_until),"
                + "plan_key=EXCLUDED.plan_key,billing_cycle=EXCLUDED.billing_cycle,updated_at=now()",
            subscriptionId, paymentId, normalizedEmail, java.sql.Timestamp.from(accessUntil), plano, ciclo);
        return true;
    }

    public String assinaturaAtivaParaCancelar(String email) {
        if (email == null || email.isBlank()) return null;
        var ids = jdbc.query("SELECT subscription_id FROM public.acesso_comercial "
                + "WHERE provider='mercado_pago' AND lower(email)=lower(?) AND status='active' AND access_until>now() "
                + "ORDER BY access_until DESC LIMIT 1", (rs, row) -> rs.getString("subscription_id"), email.trim());
        return ids.isEmpty() ? null : ids.get(0);
    }

    @Transactional
    public void registrarCancelamentoDoAssinante(String subscriptionId, String email) {
        if (subscriptionId == null || subscriptionId.isBlank() || email == null || email.isBlank()) return;
        jdbc.update("UPDATE public.acesso_comercial SET status='cancelled',updated_at=now() "
                + "WHERE provider='mercado_pago' AND subscription_id=? AND lower(email)=lower(?) AND status='active'",
            subscriptionId, email.trim());
    }

    @Transactional
    public void registrarCancelamento(String subscriptionId, String email) {
        String normalizedEmail = email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
        if (subscriptionId == null || subscriptionId.isBlank()
                || !normalizedEmail.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) return;
        jdbc.update("INSERT INTO public.acesso_comercial(provider,subscription_id,payment_reference,email,status,access_until) "
                + "VALUES ('mercado_pago',?,'',?,'cancelled',now()) ON CONFLICT (provider,subscription_id) DO UPDATE SET "
                + "email=EXCLUDED.email,status='cancelled',access_until=GREATEST(public.acesso_comercial.access_until,now()),updated_at=now()",
            subscriptionId, normalizedEmail);
    }

    @Transactional
    public void revogarAcessoPorEstorno(String eventId, String subscriptionId, String paymentId, String status) {
        if (eventId == null || eventId.isBlank() || subscriptionId == null || subscriptionId.isBlank()) return;
        int inserted = jdbc.update("INSERT INTO public.eventos_pagamento(provider,event_id) VALUES ('mercado_pago',?) "
                + "ON CONFLICT (provider,event_id) DO NOTHING", eventId);
        if (inserted == 0) return;
        String estado = "charged_back".equals(status) ? "charged_back" : "refunded";
        jdbc.update("UPDATE public.acesso_comercial SET status=?,access_until=now(),updated_at=now() "
            + "WHERE provider='mercado_pago' AND subscription_id=? AND payment_reference=?", estado, subscriptionId, paymentId);
        if (paymentId != null && !paymentId.isBlank()) {
            jdbc.update("UPDATE public.pagamentos_recebidos SET status=?,updated_at=now() "
                + "WHERE provider='mercado_pago' AND subscription_id=? AND payment_reference=?", estado, subscriptionId, paymentId);
        }
    }

    @Transactional
    public boolean processarEvento(String corpo, String assinatura) {
        validarAssinatura(corpo, assinatura);
        final JsonNode evento;
        try {
            evento = json.readTree(corpo);
        } catch (Exception erro) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Evento de pagamento inválido.");
        }

        String provider = texto(evento, "provider").toLowerCase(Locale.ROOT);
        String eventId = texto(evento, "eventId");
        String subscriptionId = texto(evento, "subscriptionId");
        String paymentId = texto(evento, "paymentId");
        String email = texto(evento, "email").toLowerCase(Locale.ROOT);
        String status = texto(evento, "status").toLowerCase(Locale.ROOT);
        String currency = texto(evento, "currency").toUpperCase(Locale.ROOT);
        String expiration = texto(evento, "accessUntil");
        var amount = evento.path("amount");

        if (!provider.matches("[a-z0-9_-]{2,40}") || eventId.isBlank() || eventId.length() > 180
            || subscriptionId.isBlank() || subscriptionId.length() > 180 || paymentId.isBlank()
            || paymentId.length() > 180 || !email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Evento sem os identificadores necessários.");
        }
        if (!java.util.Set.of("active", "cancelled", "refunded", "charged_back", "expired").contains(status)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Estado de pagamento não reconhecido.");
        }
        if (!amount.isNumber() || !"BRL".equals(currency)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O evento precisa conter um pagamento em BRL.");
        }
        final BigDecimal valorMensal;
        try {
            valorMensal = new BigDecimal(precoMensal);
            if (valorMensal.signum() <= 0) throw new NumberFormatException();
        } catch (Exception erro) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Preço mensal ainda não configurado.");
        }
        if (amount.decimalValue().compareTo(valorMensal) != 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O pagamento não corresponde ao preço mensal configurado em BRL.");
        }
        final Instant accessUntil;
        try {
            accessUntil = Instant.parse(expiration);
        } catch (Exception erro) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O pagamento precisa informar a validade do acesso.");
        }
        if (!accessUntil.isAfter(Instant.now()) || accessUntil.isAfter(Instant.now().plusSeconds(370L * 24 * 60 * 60))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A validade informada para o acesso é inválida.");
        }

        int inserido = jdbc.update("INSERT INTO public.eventos_pagamento(provider,event_id) VALUES (?,?) "
            + "ON CONFLICT (provider,event_id) DO NOTHING", provider, eventId);
        if (inserido == 0) return false;

        if ("active".equals(status)) {
            Instant paidAt = instante(texto(evento, "paidAt"));
            registrarRecebimento(provider, eventId, subscriptionId, paymentId, email, "basica", "monthly",
                amount.decimalValue(), currency, paidAt == null ? Instant.now() : paidAt, accessUntil);
        } else if ("refunded".equals(status) || "charged_back".equals(status)) {
            jdbc.update("UPDATE public.pagamentos_recebidos SET status=?,updated_at=now() WHERE provider=? AND subscription_id=? "
                + "AND payment_reference=?", status, provider, subscriptionId, paymentId);
        }

        jdbc.update("INSERT INTO public.acesso_comercial(provider,subscription_id,payment_reference,email,status,access_until) "
                + "VALUES (?,?,?,?,?,?) ON CONFLICT (provider,subscription_id) DO UPDATE SET "
                + "payment_reference=EXCLUDED.payment_reference,email=EXCLUDED.email,status=EXCLUDED.status,"
                + "access_until=EXCLUDED.access_until,updated_at=now()",
            provider, subscriptionId, paymentId, email, status,
            java.sql.Timestamp.from(accessUntil));
        return true;
    }

    private void registrarRecebimento(String provider, String eventId, String subscriptionId, String paymentId,
            String email, String plano, String ciclo, BigDecimal amount, String currency, Instant paidAt, Instant accessUntil) {
        if (paymentId == null || paymentId.isBlank() || amount == null || amount.signum() <= 0
                || !"BRL".equalsIgnoreCase(currency)) return;
        jdbc.update("INSERT INTO public.pagamentos_recebidos(provider,event_id,subscription_id,payment_reference,email,amount,currency,status,paid_at,access_until,plan_key,billing_cycle) "
                + "VALUES (?,?,?,?,?,?,?,'approved',?,?,?,?) ON CONFLICT (provider,payment_reference) DO NOTHING",
            provider, eventId, subscriptionId, paymentId, email, amount, currency.toUpperCase(Locale.ROOT),
            java.sql.Timestamp.from(paidAt == null ? Instant.now() : paidAt),
            accessUntil == null ? null : java.sql.Timestamp.from(accessUntil), plano, ciclo);
    }

    private static Instant instante(String value) {
        if (value == null || value.isBlank()) return null;
        try { return Instant.parse(value); }
        catch (Exception ignored) {
            try { return OffsetDateTime.parse(value).toInstant(); }
            catch (Exception erro) { return null; }
        }
    }

    private void validarAssinatura(String corpo, String assinatura) {
        if (segredoWebhook == null || segredoWebhook.length() < 32) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Confirmação de pagamento ainda não configurada.");
        }
        if (corpo == null || assinatura == null || !assinatura.matches("sha256=[a-fA-F0-9]{64}")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Assinatura do pagamento inválida.");
        }
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(segredoWebhook.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] esperado = mac.doFinal(corpo.getBytes(StandardCharsets.UTF_8));
            byte[] recebido = HexFormat.of().parseHex(assinatura.substring("sha256=".length()));
            if (!MessageDigest.isEqual(esperado, recebido)) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Assinatura do pagamento inválida.");
            }
        } catch (ResponseStatusException erro) {
            throw erro;
        } catch (Exception erro) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Não foi possível validar o evento.");
        }
    }

    private static String texto(JsonNode evento, String campo) {
        return evento.path(campo).asText("").trim();
    }
}
