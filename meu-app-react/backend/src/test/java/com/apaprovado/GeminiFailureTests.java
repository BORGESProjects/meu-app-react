package com.apaprovado;

import com.apaprovado.service.GeminiFailure;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class GeminiFailureTests {
    @Test void respectsProviderRetryDelay() {
        var failure=GeminiFailure.from(429,"""
            {"error":{"details":[{"retryDelay":"39.5s"}]}}
            """,0);
        assertTrue(failure.retryable()); assertEquals(40500,failure.delayMillis());
        assertTrue(failure.message().contains("HTTP 429"));
    }
    @Test void exhaustedDailyOrZeroQuotaDoesNotLoop() {
        for(String violation:new String[]{"\"quotaValue\":\"0\"","\"quotaId\":\"GenerateRequestsPerDayPerProject\""}) {
            assertFalse(GeminiFailure.from(429,"{\"error\":{\"details\":[{\"violations\":[{"+violation+"}]}]}}",0).retryable());
        }
    }
    @Test void safeDistinctFailures() {
        var temporary=GeminiFailure.from(503,"API_KEY_SECRET PROJECT_PRIVATE",1);
        assertTrue(temporary.retryable()); assertEquals(20000,temporary.delayMillis());
        assertTrue(temporary.message().contains("HTTP 503"));
        assertFalse(temporary.message().contains("SECRET"));
        assertFalse(GeminiFailure.from(403,"",0).retryable());
        assertTrue(GeminiFailure.from(404,"",0).message().contains("GEMINI_IMPORT_MODEL"));
    }
}
