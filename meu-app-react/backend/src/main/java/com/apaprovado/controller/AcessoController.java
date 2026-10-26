package com.apaprovado.controller;

import com.apaprovado.service.AcessoComercial;
import com.apaprovado.service.ImportAdmin;
import com.apaprovado.service.MercadoPagoConexao;
import com.apaprovado.service.MercadoPagoAssinaturas;
import com.apaprovado.service.SupabaseSessionAuth;
import com.fasterxml.jackson.databind.JsonNode;
import java.util.Map;
import java.net.URI;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.CacheControl;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/acesso")
public class AcessoController {
    private final AcessoComercial acessos;
    private final SupabaseSessionAuth sessoes;
    private final MercadoPagoAssinaturas mercadoPago;
    private final MercadoPagoConexao contaMercadoPago;
    private final ImportAdmin administrador;
    private final String retornoAdmin;

    public AcessoController(AcessoComercial acessos, SupabaseSessionAuth sessoes, MercadoPagoAssinaturas mercadoPago,
            MercadoPagoConexao contaMercadoPago, ImportAdmin administrador,
            @Value("${app.payment.admin-return-url:https://ap-aprovado.pages.dev/aluno.html#recebimentos}") String retornoAdmin) {
        this.acessos = acessos;
        this.sessoes = sessoes;
        this.mercadoPago = mercadoPago;
        this.contaMercadoPago = contaMercadoPago;
        this.administrador = administrador;
        this.retornoAdmin = retornoAdmin;
    }

    public record CheckoutRequest(String plano, String ciclo, String modalidade) {}

    @GetMapping("/preco")
    public Map<String, String> preco() {
        return Map.of(
            "valorMensal", mercadoPago.precoMensalPublico().toPlainString(),
            "moeda", "BRL",
            "periodo", "mensal"
        );
    }

    @GetMapping("/planos")
    public java.util.List<MercadoPagoAssinaturas.PlanoPublico> planos() {
        return mercadoPago.planosPublicos();
    }

    @GetMapping("/admin/recebimentos")
    public ResponseEntity<AcessoComercial.RelatorioRecebimentos> recebimentos(
            @RequestHeader(value="Authorization", required=false) String authorization,
            @RequestHeader(value="X-Supabase-Key", required=false) String publicKey) {
        administrador.require(authorization, publicKey);
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(acessos.listarRecebimentos());
    }

    @GetMapping("/admin/mercado-pago/status")
    public ResponseEntity<MercadoPagoConexao.Status> statusMercadoPago(
            @RequestHeader(value="Authorization", required=false) String authorization,
            @RequestHeader(value="X-Supabase-Key", required=false) String publicKey) {
        administrador.require(authorization, publicKey);
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(contaMercadoPago.status());
    }

    @PostMapping("/admin/mercado-pago/conectar")
    public Map<String, String> conectarMercadoPago(
            @RequestHeader(value="Authorization", required=false) String authorization,
            @RequestHeader(value="X-Supabase-Key", required=false) String publicKey) {
        administrador.require(authorization, publicKey);
        return Map.of("url", contaMercadoPago.iniciarAutorizacao());
    }

    @GetMapping("/mercado-pago/oauth/callback")
    public ResponseEntity<Void> callbackMercadoPago(
            @org.springframework.web.bind.annotation.RequestParam(value="code", required=false) String code,
            @org.springframework.web.bind.annotation.RequestParam(value="state", required=false) String state,
            @org.springframework.web.bind.annotation.RequestParam(value="error", required=false) String oauthError) {
        if (oauthError != null && !oauthError.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A conexão do Mercado Pago foi recusada ou cancelada.");
        }
        contaMercadoPago.concluirAutorizacao(code, state);
        return ResponseEntity.status(HttpStatus.FOUND).location(URI.create(retornoAdmin)).build();
    }

    @PostMapping("/checkout")
    public MercadoPagoAssinaturas.Checkout checkout(
            @RequestBody(required=false) CheckoutRequest request,
            @RequestHeader(value="Authorization", required=false) String authorization,
            @RequestHeader(value="X-Supabase-Key", required=false) String publicKey) {
        String email = emailConfirmado(authorization, publicKey);
        return mercadoPago.criarCheckout(email, request == null ? "" : request.plano(),
            request == null ? "" : request.ciclo(), request == null ? "" : request.modalidade());
    }

    @PostMapping("/cancelar")
    public Map<String, Boolean> cancelar(
            @RequestHeader(value="Authorization", required=false) String authorization,
            @RequestHeader(value="X-Supabase-Key", required=false) String publicKey) {
        mercadoPago.cancelarAssinatura(emailConfirmado(authorization, publicKey));
        return Map.of("cancelado", true);
    }

    @GetMapping("/status")
    public AcessoComercial.Status status(
            @RequestHeader(value="Authorization", required=false) String authorization,
            @RequestHeader(value="X-Supabase-Key", required=false) String publicKey) {
        return acessos.status(emailConfirmado(authorization, publicKey));
    }

    @PostMapping("/webhook/mercado-pago")
    public Map<String, Boolean> webhookMercadoPago(@RequestBody(required=false) JsonNode evento,
            @RequestHeader(value="x-signature", required=false) String assinatura,
            @RequestHeader(value="x-request-id", required=false) String requestId,
            @org.springframework.web.bind.annotation.RequestParam(value="data.id", required=false) String dataId,
            @org.springframework.web.bind.annotation.RequestParam(value="type", required=false) String tipo) {
        mercadoPago.receberNotificacao(evento, tipo, dataId, assinatura, requestId);
        return Map.of("recebido", true);
    }

    private String emailConfirmado(String authorization, String publicKey) {
        var user = sessoes.requireAuthenticated(authorization, publicKey);
        if (user.path("email_confirmed_at").asText("").isBlank()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Confirme o e-mail da conta antes de gerenciar a assinatura.");
        }
        String email = user.path("email").asText("").trim();
        if (email.isBlank()) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "A conta autenticada não tem e-mail válido.");
        return email;
    }
}
