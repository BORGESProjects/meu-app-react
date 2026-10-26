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
import java.util.Set;
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
    private final String notificationUrl;
    private final Map<String, Plano> planos;

    public MercadoPagoAssinaturas(RestClient.Builder builder, ObjectMapper json, AcessoComercial acesso,
            MercadoPagoConexao conta,
            @Value("${app.payment.webhook-secret:}") String webhookSecret,
            @Value("${app.payment.return-url:}") String returnUrl,
            @Value("${app.payment.notification-url:}") String notificationUrl,
            @Value("${app.payment.prices.basic.monthly:9.90}") String basicaMensal,
            @Value("${app.payment.prices.premium.monthly:19.90}") String premiumMensal,
            @Value("${app.payment.discount.quarterly:0.25}") String descontoTrimestral,
            @Value("${app.payment.discount.annual:0.30}") String descontoAnual) {
        this.mercadoPago = builder.baseUrl("https://api.mercadopago.com").build();
        this.json = json;
        this.acesso = acesso;
        this.conta = conta;
        this.webhookSecret = webhookSecret;
        this.returnUrl = returnUrl;
        this.notificationUrl = notificationUrl;
        String basicaTrimestral = totalCiclo(basicaMensal, 3, descontoTrimestral);
        String basicaAnual = totalCiclo(basicaMensal, 12, descontoAnual);
        String premiumTrimestral = totalCiclo(premiumMensal, 3, descontoTrimestral);
        String premiumAnual = totalCiclo(premiumMensal, 12, descontoAnual);
        this.planos = Map.of(
            chave("basica", "monthly"), plano("basica", "monthly", 1, basicaMensal),
            chave("basica", "quarterly"), plano("basica", "quarterly", 3, basicaTrimestral),
            chave("basica", "annual"), plano("basica", "annual", 12, basicaAnual),
            chave("premium", "monthly"), plano("premium", "monthly", 1, premiumMensal),
            chave("premium", "quarterly"), plano("premium", "quarterly", 3, premiumTrimestral),
            chave("premium", "annual"), plano("premium", "annual", 12, premiumAnual)
        );
    }

    public record Checkout(String tipo, String url, String codigoPix, String qrBase64, Instant expiraEm) {}
    public record PlanoPublico(String codigo, String nome, String periodo, String periodoNome,
            BigDecimal valorTotal, BigDecimal valorMensal, BigDecimal valorPix, BigDecimal valorCartao, int meses) {}
    private record Plano(String codigo, String nome, String periodo, String periodoNome,
            BigDecimal valorTotal, BigDecimal valorMensal, int meses) {
        PlanoPublico publico() {
            BigDecimal pix = meses == 1 ? valorTotal : valorTotal.multiply(new BigDecimal("0.90")).setScale(2, RoundingMode.HALF_UP);
            BigDecimal cartao = meses == 1 ? valorTotal : valorTotal.multiply(new BigDecimal("1.10")).setScale(2, RoundingMode.HALF_UP);
            return new PlanoPublico(codigo, nome, periodo, periodoNome, valorTotal, valorMensal, pix, cartao, meses);
        }
    }

    public BigDecimal precoMensalPublico() {
        return obterPlano("basica", "monthly").valorTotal();
    }

    public Checkout criarCheckout(String email) {
        return criarCheckout(email, "basica", "monthly", "subscription");
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
        return criarCheckout(email, codigoPlano, periodo, "subscription");
    }

    public Checkout criarCheckout(String email, String codigoPlano, String periodo, String modalidade) {
        String normalizedEmail = email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
        if (!normalizedEmail.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Informe um e-mail válido.");
        }
        Plano plano = obterPlano(codigoPlano, periodo);
        String forma = modalidade == null ? "" : modalidade.trim().toLowerCase(Locale.ROOT);
        if (plano.meses() == 1) forma = "subscription";
        else if (!List.of("pix", "card").contains(forma)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Escolha Pix à vista ou cartão para o plano trimestral/anual.");
        }
        if (acesso.status(normalizedEmail).liberado()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                "Você já tem um período de acesso ativo. Cancele a renovação e aguarde o fim do período antes de iniciar outro plano.");
        }
        String accessToken = conta.accessToken();
        if (returnUrl == null || !returnUrl.startsWith("https://")) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Checkout ainda não está configurado.");
        }

        if (plano.meses() > 1) return criarCheckoutAvulso(normalizedEmail, plano, forma, accessToken);

        Map<String, Object> recurrence = Map.of("frequency", plano.meses(), "frequency_type", "months",
            "transaction_amount", plano.valorTotal(), "currency_id", "BRL");
        Map<String, Object> body = new HashMap<>();
        body.put("reason", "AP Aprovado — " + plano.nome() + " · " + plano.periodoNome());
        String reference = "ap:" + plano.codigo() + ":" + plano.periodo() + ":" + UUID.randomUUID();
        body.put("external_reference", reference);
        body.put("payer_email", normalizedEmail);
        body.put("auto_recurring", recurrence);
        body.put("back_url", returnUrl);
        if (notificationUrl != null && notificationUrl.startsWith("https://")) body.put("notification_url", notificationUrl);
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
        return new Checkout("subscription", url, null, null, null);
    }

    private Checkout criarCheckoutAvulso(String email, Plano plano, String forma, String accessToken) {
        if (notificationUrl == null || !notificationUrl.startsWith("https://")) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Notificações seguras de pagamento ainda não estão configuradas no servidor.");
        }
        BigDecimal valor = forma.equals("pix")
            ? plano.valorTotal().multiply(new BigDecimal("0.90")).setScale(2, RoundingMode.HALF_UP)
            : plano.valorTotal().multiply(new BigDecimal("1.10")).setScale(2, RoundingMode.HALF_UP);
        String reference = "ap:" + plano.codigo() + ":" + plano.periodo() + ":" + forma + ":" + UUID.randomUUID();
        try {
            JsonNode response;
            if (forma.equals("pix")) {
                Map<String, Object> body = Map.of("transaction_amount", valor, "description",
                    "AP Aprovado — " + plano.nome() + " · " + plano.periodoNome(), "payment_method_id", "pix",
                    "payer", Map.of("email", email), "external_reference", reference, "notification_url", notificationUrl);
                response = mercadoPago.post().uri("/v1/payments")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                    .header("X-Idempotency-Key", UUID.randomUUID().toString())
                    .body(body).retrieve().body(JsonNode.class);
                String qr = response == null ? "" : response.path("point_of_interaction").path("transaction_data").path("qr_code").asText("");
                String qrBase64 = response == null ? "" : response.path("point_of_interaction").path("transaction_data").path("qr_code_base64").asText("");
                String ticket = response == null ? "" : response.path("point_of_interaction").path("transaction_data").path("ticket_url").asText("");
                if (qr.isBlank() || qrBase64.isBlank()) throw new IllegalStateException();
                acesso.registrarCheckoutAvulso("payment:" + response.path("id").asText(""), reference, email,
                    plano.codigo(), plano.periodo(), valor, "pix");
                Instant expiraEm = null;
                try { expiraEm = OffsetDateTime.parse(response.path("date_of_expiration").asText()).toInstant(); }
                catch (Exception ignorado) { }
                return new Checkout("pix", ticket, qr, qrBase64, expiraEm);
            }

            Map<String, Object> item = Map.of("id", "ap-" + plano.codigo() + "-" + plano.periodo(),
                "title", "AP Aprovado — " + plano.nome() + " · " + plano.periodoNome(),
                "description", "Acesso por " + plano.meses() + " meses", "quantity", 1, "currency_id", "BRL", "unit_price", valor);
            Map<String, Object> body = new HashMap<>();
            body.put("items", List.of(item));
            body.put("payer", Map.of("email", email));
            body.put("external_reference", reference);
            body.put("notification_url", notificationUrl);
            body.put("back_urls", Map.of("success", returnUrl, "failure", returnUrl, "pending", returnUrl));
            body.put("auto_return", "approved");
            body.put("payment_methods", Map.of("excluded_payment_types", List.of(
                Map.of("id", "ticket"), Map.of("id", "bank_transfer"), Map.of("id", "debit_card"),
                Map.of("id", "prepaid_card")), "installments", 12));
            response = mercadoPago.post().uri("/checkout/preferences")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                .header("X-Idempotency-Key", UUID.randomUUID().toString())
                .body(body).retrieve().body(JsonNode.class);
            String url = response == null ? "" : response.path("init_point").asText("");
            String host = URI.create(url).getHost();
            if (host == null || !url.startsWith("https://") || !Set.of("www.mercadopago.com.br", "mercadopago.com.br", "www.mercadopago.com", "mercadopago.com").contains(host)) {
                throw new IllegalStateException();
            }
            acesso.registrarCheckoutAvulso("preference:" + response.path("id").asText(""), reference, email,
                plano.codigo(), plano.periodo(), valor, "card");
            return new Checkout("card", url, null, null, null);
        } catch (ResponseStatusException erro) {
            throw erro;
        } catch (Exception erro) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Não foi possível iniciar o pagamento agora. Confira a conexão com o Mercado Pago e tente novamente.");
        }
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

        if ("payment".equals(tipo)) {
            receberPagamentoAvulso(eventId, dataId);
            return;
        }

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

    private void receberPagamentoAvulso(String eventId, String paymentId) {
        JsonNode payment = consultar("/v1/payments/" + segmento(paymentId));
        String reference = payment.path("external_reference").asText("");
        var titular = acesso.checkoutPorReferencia(reference);
        if (titular == null || !Set.of("pix", "card").contains(titular.modalidade())) return;
        String status = payment.path("status").asText("");
        String accessKey = "one-time:" + paymentId;
        if ("refunded".equals(status) || "charged_back".equals(status)) {
            acesso.revogarAcessoPorEstorno(eventId, accessKey, paymentId, status);
            return;
        }
        if (!"approved".equals(status) || !"BRL".equals(payment.path("currency_id").asText(""))) return;
        String methodId = payment.path("payment_method_id").asText("");
        String methodType = payment.path("payment_type_id").asText("");
        if (titular.modalidade().equals("pix") && !"pix".equals(methodId)) return;
        if (titular.modalidade().equals("card") && !Set.of("credit_card", "account_money").contains(methodType)) return;
        BigDecimal amount;
        try { amount = payment.path("transaction_amount").decimalValue(); }
        catch (Exception erro) { return; }
        if (amount.compareTo(titular.valor()) != 0) return;
        Instant paidAt;
        try { paidAt = OffsetDateTime.parse(payment.path("date_approved").asText()).toInstant(); }
        catch (Exception erro) { paidAt = Instant.now(); }
        Instant validUntil = paidAt.atOffset(java.time.ZoneOffset.UTC).plusMonths(
            "quarterly".equals(titular.ciclo()) ? 3 : 12).toInstant();
        acesso.registrarPagamentoConfirmado(eventId, accessKey, paymentId, titular.email(), titular.plano(),
            titular.ciclo(), amount, payment.path("currency_id").asText(""), titular.valor(), validUntil, paidAt);
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

    private static String totalCiclo(String valorMensal, int meses, String desconto) {
        try {
            BigDecimal mensal = new BigDecimal(valorMensal);
            BigDecimal fator = BigDecimal.ONE.subtract(new BigDecimal(desconto));
            if (mensal.signum() <= 0 || fator.signum() <= 0 || fator.compareTo(BigDecimal.ONE) > 0) throw new NumberFormatException();
            return mensal.multiply(BigDecimal.valueOf(meses)).multiply(fator).setScale(2, RoundingMode.HALF_UP).toPlainString();
        } catch (Exception erro) {
            throw new IllegalStateException("Desconto ou preço mensal inválido.");
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
