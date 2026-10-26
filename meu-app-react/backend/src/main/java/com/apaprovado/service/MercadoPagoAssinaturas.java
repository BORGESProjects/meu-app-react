package com.apaprovado.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.Locale;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;

@Service
public class MercadoPagoAssinaturas {
    private final RestClient mercadoPago;
    private final ObjectMapper json;
    private final AcessoComercial acesso;
    private final MercadoPagoConexao conta;
    private final String webhookSecret;
    private final String returnUrl;
    private final Map<String, Plano> planos;

    public MercadoPagoAssinaturas(RestClient.Builder builder, ObjectMapper json, AcessoComercial acesso,
            MercadoPagoConexao conta,
            @Value("${app.payment.webhook-secret:}") String webhookSecret,
            @Value("${app.payment.return-url:}") String returnUrl,
            @Value("${app.payment.prices.basic.monthly:9.90}") String basicaMensal,
            @Value("${app.payment.prices.basic.quarterly:20.70}") String basicaTrimestral,
            @Value("${app.payment.prices.basic.annual:58.80}") String basicaAnual,
            @Value("${app.payment.prices.premium.monthly:19.90}") String premiumMensal,
            @Value("${app.payment.prices.premium.quarterly:41.70}") String premiumTrimestral,
            @Value("${app.payment.prices.premium.annual:118.80}") String premiumAnual) {
        this.mercadoPago = builder.baseUrl("https://api.mercadopago.com").build();
        this.json = json;
        this.acesso = acesso;
        this.conta = conta;
        this.webhookSecret = webhookSecret;
        this.returnUrl = returnUrl;
        this.planos = Map.of(
            chave("basica", "monthly"), plano("basica", "monthly", 1, basicaMensal),
            chave("basica", "quarterly"), plano("basica", "quarterly", 3, basicaTrimestral),
            chave("basica", "annual"), plano("basica", "annual", 12, basicaAnual),
            chave("premium", "monthly"), plano("premium", "monthly", 1, premiumMensal),
            chave("premium", "quarterly"), plano("premium", "quarterly", 3, premiumTrimestral),
            chave("premium", "annual"), plano("premium", "annual", 12, premiumAnual)
        );
    }

    public record Checkout(String url) {}
    public record PlanoPublico(String codigo, String nome, String periodo, String periodoNome,
            BigDecimal valorTotal, BigDecimal valorMensal, int meses) {}
    private record Plano(String codigo, String nome, String periodo, String periodoNome,
            BigDecimal valorTotal, BigDecimal valorMensal, int meses) {
        PlanoPublico publico() {
            return new PlanoPublico(codigo, nome, periodo, periodoNome, valorTotal, valorMensal, meses);
        }
    }

    public BigDecimal precoMensalPublico() {
        return obterPlano("basica", "monthly").valorTotal();
    }

    public Checkout criarCheckout(String email) {
        return criarCheckout(email, "basica", "monthly");
    }

    public List<PlanoPublico> planosPublicos() {
        List<PlanoPublico> resposta = new ArrayList<>();
        for (String codigo : List.of("basica", "premium")) {
            for (String periodo : List.of("monthly", "quarterly", "annual")) {
                resposta.add(obterPlano(codigo, periodo).publico());
            }
        }
        return resposta;
    }

    public Checkout criarCheckout(String email, String codigoPlano, String periodo) {
        String normalizedEmail = email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
        if (!normalizedEmail.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Informe um e-mail válido.");
        }
        Plano plano = obterPlano(codigoPlano, periodo);
        if (acesso.status(normalizedEmail).liberado()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                "Você já tem um período de acesso ativo. Cancele a renovação e aguarde o fim do período antes de iniciar outro plano.");
        }
        String accessToken = conta.accessToken();
        if (returnUrl == null || !returnUrl.startsWith("https://")) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Checkout ainda não está configurado.");
        }

        Map<String, Object> recurrence = Map.of("frequency", plano.meses(), "frequency_type", "months",
            "transaction_amount", plano.valorTotal(), "currency_id", "BRL");
        Map<String, Object> body = new HashMap<>();
        body.put("reason", "AP Aprovado — " + plano.nome() + " · " + plano.periodoNome());
        String reference = "ap:" + plano.codigo() + ":" + plano.periodo() + ":" + UUID.randomUUID();
        body.put("external_reference", reference);
        body.put("payer_email", normalizedEmail);
        body.put("auto_recurring", recurrence);
        body.put("back_url", returnUrl);
        body.put("status", "pending");
        final JsonNode response;
        try {
            response = mercadoPago.post().uri("/preapproval")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                .body(body).retrieve().body(JsonNode.class);
        } catch (Exception erro) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Não foi possível iniciar o checkout agora.");
        }
        String url = response == null ? "" : response.path("init_point").asText("");
        String host;
        try { host = URI.create(url).getHost(); } catch (Exception erro) { host = null; }
        if (host == null || !url.startsWith("https://") || !java.util.Set.of("www.mercadopago.com.br", "mercadopago.com.br", "www.mercadopago.com", "mercadopago.com").contains(host)) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "O Mercado Pago não retornou o endereço do checkout.");
        }
        acesso.registrarCheckout(segmento(response.path("id").asText("")), reference, normalizedEmail,
            plano.codigo(), plano.periodo(), plano.valorTotal());
        return new Checkout(url);
    }

    public void cancelarAssinatura(String email) {
        String normalizedEmail = email == null ? "" : email.trim().toLowerCase();
        String subscriptionId = acesso.assinaturaAtivaParaCancelar(normalizedEmail);
        if (subscriptionId == null || subscriptionId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Não há assinatura ativa para cancelar.");
        }
        JsonNode subscription = consultar("/preapproval/" + segmento(subscriptionId));
        var titular = acesso.checkout(subscriptionId);
        if (titular == null || !normalizedEmail.equalsIgnoreCase(titular.email())
                || !titular.referencia().equals(subscription.path("external_reference").asText(""))
                || !"authorized".equals(subscription.path("status").asText(""))) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "A assinatura não corresponde a uma renovação ativa desta conta.");
        }
        try {
            mercadoPago.put().uri("/preapproval/" + segmento(subscriptionId))
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + conta.accessToken())
                .body(Map.of("status", "canceled"))
                .retrieve().body(JsonNode.class);
        } catch (Exception erro) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "O Mercado Pago não confirmou o cancelamento. Tente novamente.");
        }
        acesso.registrarCancelamentoDoAssinante(subscriptionId, normalizedEmail);
    }

    public void receberNotificacao(JsonNode evento, String tipoQuery, String dataId,
            String assinatura, String requestId) {
        validarAssinatura(assinatura, requestId, dataId);
        if (evento == null || dataId == null || dataId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Notificação inválida.");
        }
        String tipo = tipoQuery == null || tipoQuery.isBlank() ? evento.path("type").asText("") : tipoQuery;
        String eventId = evento.path("id").asText("");
        if (eventId.isBlank()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Notificação sem identificador.");

        if ("subscription_preapproval".equals(tipo)) {
            JsonNode subscription = consultar("/preapproval/" + segmento(dataId));
            var titular = acesso.checkout(dataId);
            if (titular == null || !titular.referencia().equals(subscription.path("external_reference").asText(""))) return;
            String status = subscription.path("status").asText("");
            if ("cancelled".equals(status) || "canceled".equals(status) || "paused".equals(status)) {
                acesso.registrarCancelamento(dataId, titular.email());
            }
            return;
        }
        if (!"subscription_authorized_payment".equals(tipo)) return;

        JsonNode invoice = consultar("/authorized_payments/" + segmento(dataId));
        JsonNode payment = invoice.path("payment");
        String subscriptionId = invoice.path("preapproval_id").asText("");
        if (subscriptionId.isBlank()) return;
        var titular = acesso.checkout(subscriptionId);
        if (titular == null) return;
        String paymentStatus = payment.path("status").asText("");
        if ("refunded".equals(paymentStatus) || "charged_back".equals(paymentStatus)) {
            acesso.revogarAcessoPorEstorno(eventId, subscriptionId, payment.path("id").asText(""), paymentStatus);
            return;
        }
        if (!"approved".equals(paymentStatus)) return;
        JsonNode subscription = consultar("/preapproval/" + segmento(subscriptionId));
        String status = subscription.path("status").asText("");
        if (!"authorized".equals(status) && !"cancelled".equals(status) && !"canceled".equals(status)) return;
        if (!titular.referencia().equals(subscription.path("external_reference").asText(""))) return;
        Plano plano = obterPlano(titular.plano(), titular.ciclo());
        JsonNode recurring = subscription.path("auto_recurring");
        if (!"BRL".equals(recurring.path("currency_id").asText(""))
                || !"months".equals(recurring.path("frequency_type").asText(""))
                || recurring.path("frequency").asInt(0) != plano.meses()) return;

        BigDecimal amount;
        try {
            amount = new BigDecimal(invoice.path("transaction_amount").asText(""));
            if (new BigDecimal(recurring.path("transaction_amount").asText("")).compareTo(titular.valor()) != 0) return;
        } catch (Exception erro) {
            return;
        }
        if (amount.compareTo(titular.valor()) != 0 || !"BRL".equals(invoice.path("currency_id").asText(""))) return;
        Instant validUntil = proximaValidade(subscription, invoice, plano.meses());
        Instant paidAt = dataPagamento(invoice);
        acesso.registrarPagamentoConfirmado(eventId, subscriptionId,
            payment.path("id").asText(""), titular.email(),
            plano.codigo(), plano.periodo(), amount, invoice.path("currency_id").asText(""),
            titular.valor(), validUntil, paidAt);
        if ("cancelled".equals(status) || "canceled".equals(status)) {
            acesso.registrarCancelamento(subscriptionId, titular.email());
        }
    }

    private Instant proximaValidade(JsonNode subscription, JsonNode invoice, int meses) {
        // Base entitlement on this invoice, never a future retry's subscription date.
        String chargedAt = invoice.path("debit_date").asText(invoice.path("date_created").asText(""));
        try {
            return OffsetDateTime.parse(chargedAt).plusMonths(meses).toInstant();
        } catch (Exception erro) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Fatura sem data de cobrança válida.");
        }
    }

    private Instant dataPagamento(JsonNode invoice) {
        String date = invoice.path("debit_date").asText(invoice.path("date_created").asText(""));
        try { return OffsetDateTime.parse(date).toInstant(); }
        catch (Exception erro) { return Instant.now(); }
    }

    private JsonNode consultar(String path) {
        try {
            return mercadoPago.get().uri(path).header(HttpHeaders.AUTHORIZATION, "Bearer " + conta.accessToken())
                .retrieve().body(JsonNode.class);
        } catch (Exception erro) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Não foi possível validar a notificação com o Mercado Pago.");
        }
    }

    private Plano planoDaAssinatura(JsonNode subscription) {
        JsonNode recorrencia = subscription.path("auto_recurring");
        try {
            int meses = recorrencia.path("frequency").asInt(0);
            if (!"months".equalsIgnoreCase(recorrencia.path("frequency_type").asText(""))) return null;
            BigDecimal valor = recorrencia.path("transaction_amount").decimalValue();
            return planos.values().stream().filter(plano -> plano.meses() == meses && plano.valorTotal().compareTo(valor) == 0)
                .findFirst().orElse(null);
        } catch (Exception erro) { return null; }
    }

    private Plano obterPlano(String codigo, String periodo) {
        Plano plano = planos.get(chave(codigo, periodo));
        if (plano == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Plano ou frequência não reconhecidos.");
        return plano;
    }

    private static Plano plano(String codigo, String periodo, int meses, String valor) {
        try {
            BigDecimal total = new BigDecimal(valor);
            if (total.signum() <= 0 || total.scale() > 2) throw new NumberFormatException();
            String nome = "premium".equals(codigo) ? "Premium" : "Básica";
            String nomePeriodo = switch (periodo) {
                case "monthly" -> "Mensal";
                case "quarterly" -> "Trimestral";
                case "annual" -> "Anual";
                default -> throw new NumberFormatException();
            };
            return new Plano(codigo, nome, periodo, nomePeriodo, total,
                total.divide(BigDecimal.valueOf(meses), 2, RoundingMode.HALF_UP), meses);
        } catch (Exception erro) {
            throw new IllegalStateException("Preço inválido para " + codigo + " / " + periodo + ".");
        }
    }

    private static String chave(String codigo, String periodo) { return codigo + ":" + periodo; }

    private void validarAssinatura(String assinatura, String requestId, String dataId) {
        if (webhookSecret == null || webhookSecret.isBlank() || webhookSecret.length() < 32) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Webhook do Mercado Pago ainda não configurado.");
        }
        if (assinatura == null || requestId == null || dataId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Assinatura de notificação inválida.");
        }
        String ts = "", v1 = "";
        for (String part : assinatura.split(",")) {
            String[] pair = part.trim().split("=", 2);
            if (pair.length == 2 && "ts".equals(pair[0])) ts = pair[1];
            if (pair.length == 2 && "v1".equals(pair[0])) v1 = pair[1];
        }
        if (ts.isBlank() || !v1.matches("[a-fA-F0-9]{64}")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Assinatura de notificação inválida.");
        }
        String manifest = "id:" + dataId.toLowerCase() + ";request-id:" + requestId + ";ts:" + ts + ";";
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(webhookSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] expected = mac.doFinal(manifest.getBytes(StandardCharsets.UTF_8));
            byte[] received = java.util.HexFormat.of().parseHex(v1);
            if (!MessageDigest.isEqual(expected, received)) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Assinatura de notificação inválida.");
            }
        } catch (ResponseStatusException erro) {
            throw erro;
        } catch (Exception erro) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Não foi possível validar a notificação.");
        }
    }

    private static String segmento(String value) {
        if (value == null || !value.matches("[A-Za-z0-9_-]{1,180}")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Identificador de recurso inválido.");
        }
        return value;
    }
}
