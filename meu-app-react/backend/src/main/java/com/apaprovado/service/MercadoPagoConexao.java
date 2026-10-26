package com.apaprovado.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.util.UriComponentsBuilder;
import com.fasterxml.jackson.databind.JsonNode;

@Service
public class MercadoPagoConexao {
    private static final SecureRandom RANDOM = new SecureRandom();
    private final RestClient mercadoPago;
    private final JdbcTemplate jdbc;
    private final String clientId;
    private final String clientSecret;
    private final String redirectUri;
    private final String chaveCriptografia;

    public MercadoPagoConexao(RestClient.Builder builder, JdbcTemplate jdbc,
            @Value("${app.payment.oauth.client-id:}") String clientId,
            @Value("${app.payment.oauth.client-secret:}") String clientSecret,
            @Value("${app.payment.oauth.redirect-uri:}") String redirectUri,
            @Value("${app.payment.token-encryption-key:}") String chaveCriptografia) {
        this.mercadoPago = builder.baseUrl("https://api.mercadopago.com").build();
        this.jdbc = jdbc;
        this.clientId = clientId == null ? "" : clientId.trim();
        this.clientSecret = clientSecret == null ? "" : clientSecret.trim();
        this.redirectUri = redirectUri == null ? "" : redirectUri.trim();
        this.chaveCriptografia = chaveCriptografia == null ? "" : chaveCriptografia.trim();
    }

    public record Status(boolean conectado, String vendedorId, Instant tokenValidoAte) {}

    public String iniciarAutorizacao() {
        validarConfiguracao();
        byte[] aleatorio = new byte[32];
        RANDOM.nextBytes(aleatorio);
        String state = Base64.getUrlEncoder().withoutPadding().encodeToString(aleatorio);
        RANDOM.nextBytes(aleatorio);
        String verifier = Base64.getUrlEncoder().withoutPadding().encodeToString(aleatorio);
        String challenge = Base64.getUrlEncoder().withoutPadding().encodeToString(sha256(verifier));
        jdbc.update("DELETE FROM public.mercado_pago_oauth_states WHERE expires_at < now()");
        jdbc.update("INSERT INTO public.mercado_pago_oauth_states(state_hash,code_verifier_cipher,expires_at) VALUES (?,?,?)",
            hash(state), criptografar(verifier), java.sql.Timestamp.from(Instant.now().plus(10, ChronoUnit.MINUTES)));
        return UriComponentsBuilder.fromUriString("https://auth.mercadopago.com/authorization")
            .queryParam("client_id", clientId)
            .queryParam("response_type", "code")
            .queryParam("platform_id", "mp")
            .queryParam("state", state)
            .queryParam("redirect_uri", redirectUri)
            .queryParam("scope", "read write offline_access")
            .queryParam("code_challenge", challenge)
            .queryParam("code_challenge_method", "S256")
            .encode().build().toUriString();
    }

    public void concluirAutorizacao(String code, String state) {
        validarConfiguracao();
        if (code == null || code.isBlank() || code.length() > 2048 || state == null || !state.matches("[A-Za-z0-9_-]{40,60}")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Resposta de autorização inválida.");
        }
        List<String> verificador = jdbc.query("DELETE FROM public.mercado_pago_oauth_states "
                + "WHERE state_hash=? AND expires_at > now() RETURNING code_verifier_cipher",
            (rs, row) -> rs.getString("code_verifier_cipher"), hash(state));
        if (verificador.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A tentativa de conexão expirou. Inicie a conexão novamente.");
        }
        Map<String, Object> pedido = Map.of(
            "client_id", clientId,
            "client_secret", clientSecret,
            "grant_type", "authorization_code",
            "code", code,
            "redirect_uri", redirectUri,
            "code_verifier", descriptografar(verificador.get(0))
        );
        JsonNode tokens = trocarToken(pedido);
        salvarTokens(tokens, null);
    }

    public synchronized String accessToken() {
        List<Conta> contas = jdbc.query("SELECT merchant_id,access_token_cipher,refresh_token_cipher,expires_at "
                + "FROM public.mercado_pago_connection WHERE singleton=true",
            (rs, row) -> new Conta(rs.getString("merchant_id"), rs.getString("access_token_cipher"),
                rs.getString("refresh_token_cipher"), rs.getTimestamp("expires_at").toInstant()));
        if (contas.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Conecte a conta recebedora do Mercado Pago na aba Recebimentos.");
        }
        Conta conta = contas.get(0);
        if (conta.expiraEm().isAfter(Instant.now().plus(5, ChronoUnit.MINUTES))) {
            return descriptografar(conta.accessTokenCipher());
        }
        validarConfiguracao();
        String refreshToken = descriptografar(conta.refreshTokenCipher());
        JsonNode tokens = trocarToken(Map.of(
            "client_id", clientId,
            "client_secret", clientSecret,
            "grant_type", "refresh_token",
            "refresh_token", refreshToken
        ));
        salvarTokens(tokens, refreshToken);
        return tokens.path("access_token").asText("");
    }

    public Status status() {
        List<Status> linhas = jdbc.query("SELECT merchant_id,expires_at FROM public.mercado_pago_connection WHERE singleton=true",
            (rs, row) -> new Status(true, rs.getString("merchant_id"), rs.getTimestamp("expires_at").toInstant()));
        return linhas.isEmpty() ? new Status(false, null, null) : linhas.get(0);
    }

    private JsonNode trocarToken(Map<String, Object> pedido) {
        try {
            JsonNode resposta = mercadoPago.post().uri("/oauth/token")
                .contentType(MediaType.APPLICATION_JSON)
                .body(pedido).retrieve().body(JsonNode.class);
            if (resposta == null || resposta.path("access_token").asText("").isBlank()) throw new IllegalStateException();
            return resposta;
        } catch (Exception erro) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "O Mercado Pago não concluiu a conexão. Confira a aplicação OAuth e tente novamente.");
        }
    }

    private void salvarTokens(JsonNode tokens, String refreshAnterior) {
        String accessToken = tokens.path("access_token").asText("");
        String refreshToken = tokens.path("refresh_token").asText("");
        String vendedorId = tokens.path("user_id").asText("");
        long segundos = tokens.path("expires_in").asLong(0);
        if (accessToken.isBlank() || vendedorId.isBlank() || segundos < 60 || segundos > 200L * 86400) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "O Mercado Pago retornou dados de conexão incompletos.");
        }
        if (refreshToken.isBlank()) refreshToken = refreshAnterior == null ? "" : refreshAnterior;
        if (refreshToken.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "O Mercado Pago não liberou a renovação automática da conexão. Autorize novamente com offline_access.");
        }
        Instant expiraEm = Instant.now().plusSeconds(segundos);
        jdbc.update("INSERT INTO public.mercado_pago_connection(singleton,merchant_id,access_token_cipher,refresh_token_cipher,expires_at,updated_at) "
                + "VALUES (true,?,?,?,?,now()) ON CONFLICT (singleton) DO UPDATE SET merchant_id=EXCLUDED.merchant_id, "
                + "access_token_cipher=EXCLUDED.access_token_cipher,refresh_token_cipher=EXCLUDED.refresh_token_cipher, "
                + "expires_at=EXCLUDED.expires_at,updated_at=now()",
            vendedorId, criptografar(accessToken), criptografar(refreshToken), java.sql.Timestamp.from(expiraEm));
    }

    private void validarConfiguracao() {
        if (clientId.isBlank() || clientSecret.isBlank() || !redirectUri.startsWith("https://")) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Configure as credenciais OAuth e a URL de retorno do Mercado Pago no servidor.");
        }
        chave();
    }

    private SecretKeySpec chave() {
        try {
            byte[] bytes = Base64.getDecoder().decode(chaveCriptografia);
            if (bytes.length != 32) throw new IllegalArgumentException();
            return new SecretKeySpec(bytes, "AES");
        } catch (Exception erro) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Configure PAYMENT_TOKEN_ENCRYPTION_KEY com 32 bytes em Base64 no servidor.");
        }
    }

    private String criptografar(String valor) {
        try {
            byte[] iv = new byte[12];
            RANDOM.nextBytes(iv);
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.ENCRYPT_MODE, chave(), new GCMParameterSpec(128, iv));
            byte[] encrypted = cipher.doFinal(valor.getBytes(StandardCharsets.UTF_8));
            return "v1:" + Base64.getEncoder().encodeToString(iv) + ":" + Base64.getEncoder().encodeToString(encrypted);
        } catch (ResponseStatusException erro) {
            throw erro;
        } catch (Exception erro) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Não foi possível proteger a credencial do Mercado Pago.");
        }
    }

    private String descriptografar(String valor) {
        try {
            String[] partes = valor.split(":", 3);
            if (partes.length != 3 || !"v1".equals(partes[0])) throw new IllegalArgumentException();
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.DECRYPT_MODE, chave(), new GCMParameterSpec(128, Base64.getDecoder().decode(partes[1])));
            return new String(cipher.doFinal(Base64.getDecoder().decode(partes[2])), StandardCharsets.UTF_8);
        } catch (ResponseStatusException erro) {
            throw erro;
        } catch (Exception erro) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "A credencial do Mercado Pago não pôde ser lida. Reconecte a conta ou confira PAYMENT_TOKEN_ENCRYPTION_KEY.");
        }
    }

    private static byte[] sha256(String valor) {
        try { return MessageDigest.getInstance("SHA-256").digest(valor.getBytes(StandardCharsets.US_ASCII)); }
        catch (Exception erro) { throw new IllegalStateException("SHA-256 não está disponível.", erro); }
    }

    private static String hash(String valor) {
        return HexFormat.of().formatHex(sha256(valor));
    }

    private record Conta(String vendedorId, String accessTokenCipher, String refreshTokenCipher, Instant expiraEm) {}
}
