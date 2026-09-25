package com.apaprovado;

import com.apaprovado.service.ImportAdmin;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.web.client.MockServerRestTemplateCustomizer;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.MediaType;
import org.springframework.web.server.ResponseStatusException;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.*;
import static org.springframework.test.web.client.response.MockRestResponseCreators.*;

class ImportAdminTests {
    @Test void checksVerifiedEmailAtTrustedServerInsteadOfTrustingClientClaims() {
        var mock=new MockServerRestTemplateCustomizer();
        var auth=new ImportAdmin(new RestTemplateBuilder().additionalCustomizers(mock),"https://trusted.supabase.co","admin@example.com");
        assertThrows(ResponseStatusException.class,()->auth.require(null,"key"));
        mock.getServer().expect(requestTo("https://trusted.supabase.co/auth/v1/user"))
            .andExpect(header("Authorization","Bearer access-token"))
            .andRespond(withSuccess("{\"id\":\"id-1\",\"email\":\"admin@example.com\",\"email_confirmed_at\":\"2026-09-25T00:00:00Z\"}",MediaType.APPLICATION_JSON));
        assertEquals("id-1",auth.require("Bearer access-token","public-key"));
        mock.getServer().verify();
    }
    @Test void refusesOtherAccountsAndUnconfirmedEmail() {
        for(String user:new String[]{"{\"id\":\"id-2\",\"email\":\"other@example.com\",\"email_confirmed_at\":\"2026-09-25\"}","{\"id\":\"id-1\",\"email\":\"admin@example.com\"}"}) {
            var mock=new MockServerRestTemplateCustomizer();
            var auth=new ImportAdmin(new RestTemplateBuilder().additionalCustomizers(mock),"https://trusted.supabase.co","admin@example.com");
            mock.getServer().expect(requestTo("https://trusted.supabase.co/auth/v1/user")).andRespond(withSuccess(user,MediaType.APPLICATION_JSON));
            assertEquals(403,assertThrows(ResponseStatusException.class,()->auth.require("Bearer token","public-key")).getStatusCode().value());
        }
    }
}
