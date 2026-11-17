package com.apaprovado.service;

import com.fasterxml.jackson.databind.JsonNode;
import java.math.BigDecimal;
import java.util.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;

/** Cartão tokenizado pelo SDK do Mercado Pago; valores e parcelas são conferidos no servidor. */
@Service
public class MercadoPagoCartao {
    private final RestClient http;
    private final AcessoComercial acesso;
    private final MercadoPagoConexao conta;
    private final String publicKey, notificationUrl;
    private final BigDecimal precoMensal;
    @Autowired
    public MercadoPagoCartao(RestClient.Builder builder, AcessoComercial acesso, MercadoPagoConexao conta,
            @Value("${app.payment.public-key:}") String publicKey,
            @Value("${app.payment.notification-url:}") String notificationUrl,
            @Value("${app.payment.prices.basic.monthly:9.90}") String precoMensal) {
        this.http=builder.baseUrl("https://api.mercadopago.com").build();this.acesso=acesso;this.conta=conta;
        this.publicKey=publicKey;this.notificationUrl=notificationUrl;
        this.precoMensal=new BigDecimal(precoMensal);
    }
    public MercadoPagoCartao(RestClient.Builder builder, AcessoComercial acesso, MercadoPagoConexao conta,
            String publicKey, String notificationUrl) {
        this(builder, acesso, conta, publicKey, notificationUrl, "9.90");
    }
    public record Pedido(String ciclo, String token, String paymentMethodId, String issuerId, int parcelas,
            String documentoTipo, String documentoNumero, String tentativa) {}
    public record PedidoMensal(String token, String paymentMethodId, String issuerId, int parcelas,
            String documentoTipo, String documentoNumero, String tentativa) {}
    public record ResultadoMensal(String id, String status, String detalhe, String codigoPix, String qrBase64) {}
    public Map<String,String> configuracao() { return Map.of("publicKey",publicKey); }
    public Map<String,String> pagar(String email, Pedido pedido) {
        if(pedido==null)throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Pagamento inválido.");
        int meses=switch(Objects.toString(pedido.ciclo(),"")){case "quarterly"->3;case "annual"->12;default->0;};
        if(meses==0 || (pedido.parcelas()!=1 && pedido.parcelas()!=meses)
                || pedido.token()==null || !pedido.token().matches("[a-zA-Z0-9_-]{10,256}")
                || pedido.paymentMethodId()==null || !pedido.paymentMethodId().matches("[a-zA-Z0-9_-]{1,50}")
                || pedido.tentativa()==null || !pedido.tentativa().matches("[a-f0-9-]{36}")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Escolha cartão à vista ou em tantas parcelas quanto os meses do plano.");
        }
        if(publicKey.isBlank() || !notificationUrl.startsWith("https://"))throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,"Pagamento com cartão ainda não configurado.");
        if(acesso.status(email).liberado())throw new ResponseStatusException(HttpStatus.CONFLICT,"Sua conta já possui acesso ativo.");
        BigDecimal valor=new BigDecimal(meses==3?"23.70":"82.80");
        String token=conta.accessToken();
        JsonNode methods;
        try {methods=http.get().uri("/v1/payment_methods").header("Authorization","Bearer "+token).retrieve().body(JsonNode.class);}
        catch(Exception e){throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,"Não foi possível validar a modalidade do cartão.");}
        boolean credito=false;
        if(methods!=null&&methods.isArray())for(JsonNode method:methods){if(pedido.paymentMethodId().equals(method.path("id").asText())&&"credit_card".equals(method.path("payment_type_id").asText()))credito=true;}
        if(!credito)throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Este plano aceita somente cartão de crédito.");
        // Mesmo identificador em uma repetição de envio evita duas cobranças após timeout.
        String reference="ap:basica:"+pedido.ciclo()+":card:"+pedido.tentativa();
        var existing=acesso.checkoutPorReferencia(reference);
        if(existing!=null&&!email.equalsIgnoreCase(existing.email()))throw new ResponseStatusException(HttpStatus.CONFLICT,"Tentativa de pagamento inválida.");
        if(existing==null)acesso.registrarCheckoutAvulso("card:"+pedido.tentativa(),reference,email,"basica",pedido.ciclo(),valor,"card");
        Map<String,Object> payer=new HashMap<>();payer.put("email",email);
        if(pedido.documentoTipo()!=null&&pedido.documentoNumero()!=null)payer.put("identification",Map.of("type",pedido.documentoTipo(),"number",pedido.documentoNumero()));
        Map<String,Object> body=new HashMap<>();body.put("transaction_amount",valor);body.put("token",pedido.token());
        body.put("description","AP Aprovado · "+meses+" meses");body.put("installments",pedido.parcelas());
        body.put("payment_method_id",pedido.paymentMethodId());if(pedido.issuerId()!=null&&!pedido.issuerId().isBlank())body.put("issuer_id",pedido.issuerId());
        body.put("payer",payer);body.put("external_reference",reference);body.put("notification_url",notificationUrl);
        body.put("binary_mode",true);
        JsonNode payment;
        try{payment=http.post().uri("/v1/payments").header("Authorization","Bearer "+token)
            .header("X-Idempotency-Key",pedido.tentativa()).body(body).retrieve().body(JsonNode.class);}
        catch(Exception e){throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,"Não foi possível concluir o pagamento. Consulte o status antes de tentar novamente.");}
        if(payment==null)throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,"O pagamento não retornou um status.");
        // A confirmação definitiva e a liberação são feitas pelo webhook autenticado já existente.
        return Map.of("id",payment.path("id").asText(),"status",payment.path("status").asText());
    }

    public ResultadoMensal pagarMensal(String email, PedidoMensal pedido) {
        if (pedido == null || pedido.tentativa() == null || !pedido.tentativa().matches("[a-f0-9-]{36}") || pedido.parcelas() != 1
                || pedido.paymentMethodId() == null || !pedido.paymentMethodId().matches("[a-zA-Z0-9_-]{1,50}")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Dados de pagamento mensal inv\u00e1lidos.");
        }
        if (publicKey.isBlank() || !notificationUrl.startsWith("https://"))
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Pagamento mensal ainda n\u00e3o configurado.");
        if (acesso.status(email).liberado())
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Sua conta j\u00e1 possui acesso ativo.");

        String accessToken = conta.accessToken();
        JsonNode methods;
        try {
            methods = http.get().uri("/v1/payment_methods").header("Authorization", "Bearer " + accessToken).retrieve().body(JsonNode.class);
        } catch (Exception erro) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "N\u00e3o foi poss\u00edvel validar a modalidade do pagamento.");
        }
        String paymentMethodId = pedido.paymentMethodId();
        String paymentType = null;
        if (methods != null && methods.isArray()) {
            for (JsonNode method : methods) {
                if (paymentMethodId.equals(method.path("id").asText())) {
                    paymentType = method.path("payment_type_id").asText("");
                    break;
                }
            }
        }
        if (paymentType == null || !Set.of("bank_transfer", "debit_card", "credit_card").contains(paymentType)
                || ("bank_transfer".equals(paymentType) && !"pix".equals(paymentMethodId)))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O plano mensal aceita somente Pix, d\u00e9bito ou cr\u00e9dito.");
        boolean pix = "bank_transfer".equals(paymentType);
        if (!pix && (pedido.token() == null || !pedido.token().matches("[a-zA-Z0-9_-]{10,256}")))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Confira os dados do cart\u00e3o e tente novamente.");

        String modalidade = pix ? "pix" : "debit_card".equals(paymentType) ? "debit" : "card";
        String reference = "ap:basica:monthly:" + modalidade + ":" + pedido.tentativa();
        var existing = acesso.checkoutPorReferencia(reference);
        if (existing != null && (!email.equalsIgnoreCase(existing.email()) || !"basica".equals(existing.plano())
                || !"monthly".equals(existing.ciclo()) || existing.valor().compareTo(precoMensal) != 0
                || !modalidade.equals(existing.modalidade())))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Esta tentativa de pagamento n\u00e3o pode ser reutilizada.");
        if (existing == null) acesso.registrarCheckoutAvulso("monthly:" + pedido.tentativa(), reference,
            email, "basica", "monthly", precoMensal, modalidade);

        Map<String, Object> body = new HashMap<>();
        body.put("transaction_amount", precoMensal);
        body.put("description", "AP Aprovado - mensalidade");
        body.put("payment_method_id", paymentMethodId);
        body.put("payer", Map.of("email", email));
        body.put("external_reference", reference);
        body.put("notification_url", notificationUrl);
        if (!pix) {
            body.put("token", pedido.token());
            body.put("installments", 1);
            if (pedido.issuerId() != null && !pedido.issuerId().isBlank()) body.put("issuer_id", pedido.issuerId());
            if (pedido.documentoTipo() != null && pedido.documentoNumero() != null
                    && pedido.documentoTipo().matches("[A-Za-z0-9_-]{1,20}")
                    && pedido.documentoNumero().matches("[0-9]{5,20}")) {
                body.put("payer", Map.of("email", email, "identification", Map.of("type", pedido.documentoTipo(), "number", pedido.documentoNumero())));
            }
        }
        JsonNode payment;
        try {
            payment = http.post().uri("/v1/payments").header("Authorization", "Bearer " + accessToken)
                .header("X-Idempotency-Key", pedido.tentativa()).body(body).retrieve().body(JsonNode.class);
        } catch (Exception erro) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                "N\u00e3o foi poss\u00edvel iniciar o pagamento. Consulte o status antes de tentar novamente.");
        }
        if (payment == null) throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "O Mercado Pago n\u00e3o retornou o status do pagamento.");
        if (!conta.recebedorValido(payment.path("collector_id").asText("")))
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "O pagamento n\u00e3o foi direcionado \u00e0 conta recebedora autorizada.");
        JsonNode transactionData = payment.path("point_of_interaction").path("transaction_data");
        return new ResultadoMensal(payment.path("id").asText(), payment.path("status").asText(),
            payment.path("status_detail").asText(""), transactionData.path("qr_code").asText(""),
            transactionData.path("qr_code_base64").asText(""));
    }
}
