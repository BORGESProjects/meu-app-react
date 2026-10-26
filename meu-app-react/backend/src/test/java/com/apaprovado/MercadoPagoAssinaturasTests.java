package com.apaprovado;

import com.apaprovado.service.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.*;
import static org.springframework.test.web.client.response.MockRestResponseCreators.*;

class MercadoPagoAssinaturasTests {
    private static final String SECRET = "segredo-ficticio-webhook-32-caracteres";
    private final ObjectMapper json = new ObjectMapper();
    private final AcessoComercial access = mock(AcessoComercial.class);
    private final MercadoPagoConexao account = mock(MercadoPagoConexao.class);
    private final RestClient.Builder builder = RestClient.builder();
    private final MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
    private final MercadoPagoAssinaturas service = new MercadoPagoAssinaturas(builder, json, access, account, SECRET,
        "https://ap-aprovado.pages.dev/aluno", "9.90", "20.70", "58.80", "19.90", "41.70", "118.80");

    private String signature(String id) throws Exception {
        var mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(SECRET.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        return "ts=123,v1=" + java.util.HexFormat.of().formatHex(mac.doFinal(
            ("id:" + id + ";request-id:req;ts:123;").getBytes(StandardCharsets.UTF_8)));
    }

    @Test void checkoutIsPendingAndBoundToAuthenticatedStudent() {
        when(access.status("aluno@example.com")).thenReturn(new AcessoComercial.Status(false, null, false, null, null));
        when(account.accessToken()).thenReturn("fake-token");
        server.expect(requestTo("https://api.mercadopago.com/preapproval"))
            .andExpect(method(HttpMethod.POST)).andExpect(header("Authorization", "Bearer fake-token"))
            .andExpect(jsonPath("$.status").value("pending"))
            .andExpect(jsonPath("$.auto_recurring.transaction_amount").value(19.90))
            .andExpect(jsonPath("$.auto_recurring.frequency").value(1))
            .andRespond(withSuccess("{\"id\":\"sub-1\",\"init_point\":\"https://www.mercadopago.com.br/subscriptions/checkout?preapproval_id=sub-1\"}", MediaType.APPLICATION_JSON));
        assertTrue(service.criarCheckout("aluno@example.com", "premium", "monthly").url().startsWith("https://www.mercadopago.com.br/"));
        verify(access).registrarCheckout(eq("sub-1"), startsWith("ap:premium:monthly:"), eq("aluno@example.com"),
            eq("premium"), eq("monthly"), eq(new BigDecimal("19.90")));
        server.verify();
    }

    @Test void rejectsUnsignedNotificationBeforeCallingProvider() throws Exception {
        assertEquals(401, assertThrows(ResponseStatusException.class, () -> service.receberNotificacao(
            json.readTree("{\"id\":\"evt-1\"}"), "subscription_authorized_payment", "123", "ts=123,v1=" + "0".repeat(64), "req")).getStatusCode().value());
        verifyNoInteractions(access, account);
    }

    @Test void paidInvoiceWithTextAmountUsesStudentBindingAndCalendarMonth() throws Exception {
        var chargedAt = OffsetDateTime.now().minusDays(1);
        when(account.accessToken()).thenReturn("fake-token");
        when(access.checkout("sub-1")).thenReturn(new AcessoComercial.TitularCheckout("ap:premium:monthly:test", "aluno@example.com", "premium", "monthly", new BigDecimal("19.90")));
        server.expect(requestTo("https://api.mercadopago.com/authorized_payments/123"))
            .andRespond(withSuccess("{\"id\":123,\"preapproval_id\":\"sub-1\",\"transaction_amount\":\"19.90\",\"currency_id\":\"BRL\",\"debit_date\":\"" + chargedAt + "\",\"payment\":{\"id\":456,\"status\":\"approved\"}}", MediaType.APPLICATION_JSON));
        server.expect(requestTo("https://api.mercadopago.com/preapproval/sub-1"))
            .andRespond(withSuccess("{\"id\":\"sub-1\",\"external_reference\":\"ap:premium:monthly:test\",\"payer_email\":\"pagador@example.com\",\"status\":\"authorized\",\"auto_recurring\":{\"frequency\":1,\"frequency_type\":\"months\",\"currency_id\":\"BRL\",\"transaction_amount\":\"19.90\"}}", MediaType.APPLICATION_JSON));
        service.receberNotificacao(json.readTree("{\"id\":\"evt-1\"}"), "subscription_authorized_payment", "123", signature("123"), "req");
        verify(access).registrarPagamentoConfirmado(eq("evt-1"), eq("sub-1"), eq("456"), eq("aluno@example.com"),
            eq("premium"), eq("monthly"), eq(new BigDecimal("19.90")), eq("BRL"), eq(new BigDecimal("19.90")),
            eq(chargedAt.plusMonths(1).toInstant()), eq(chargedAt.toInstant()));
        server.verify();
    }

    @Test void ignoresPaymentsNotCreatedByThisPortal() throws Exception {
        when(account.accessToken()).thenReturn("fake-token");
        server.expect(requestTo("https://api.mercadopago.com/authorized_payments/123"))
            .andRespond(withSuccess("{\"preapproval_id\":\"unrelated\",\"payment\":{\"id\":456,\"status\":\"approved\"}}", MediaType.APPLICATION_JSON));
        service.receberNotificacao(json.readTree("{\"id\":\"evt-2\"}"), "subscription_authorized_payment", "123", signature("123"), "req");
        verify(access).checkout("unrelated");
        verifyNoMoreInteractions(access);
        server.verify();
    }
}
