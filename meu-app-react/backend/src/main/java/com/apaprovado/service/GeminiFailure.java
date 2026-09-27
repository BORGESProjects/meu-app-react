package com.apaprovado.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Locale;

/** Safe diagnostics: never expose Google's raw response, credentials or project identifiers. */
public record GeminiFailure(String message, boolean retryable, long delayMillis) {
    public static GeminiFailure from(int status, String body, int attempt) {
        long delay = 10000L * (1L << attempt);
        boolean daily = false, zero = false;
        try {
            JsonNode error = new ObjectMapper().readTree(body).path("error");
            for (JsonNode detail : error.path("details")) {
                String retry = detail.path("retryDelay").asText("");
                if (retry.matches("[0-9]+(\\.[0-9]+)?s"))
                    delay = Math.max(delay, (long)Math.ceil(Double.parseDouble(retry.substring(0,retry.length()-1))*1000)+1000);
                for (JsonNode violation : detail.path("violations")) {
                    daily |= violation.path("quotaId").asText().toLowerCase(Locale.ROOT).contains("perday");
                    zero |= violation.has("quotaValue") && violation.path("quotaValue").asText().equals("0");
                }
            }
        } catch (Exception ignored) { /* A non-JSON provider error still has an HTTP status. */ }
        if (status == 429) {
            if (zero) return new GeminiFailure("Gemini: este projeto está sem cota disponível para o modelo (HTTP 429). Confira os limites e a configuração do projeto no Google AI Studio. Reenviar o PDF não resolve; o rascunho está salvo.",false,0);
            if (daily) return new GeminiFailure("Gemini: o limite diário do projeto foi atingido (HTTP 429). Aguarde a renovação da cota ou revise os limites no Google AI Studio; depois continue este rascunho.",false,0);
            return new GeminiFailure("Gemini: limite de solicitações ou tokens atingido (HTTP 429). Aguarde e use Continuar extração. Se persistir, confira a cota do projeto no Google AI Studio. O rascunho está salvo.",delay<=120000,delay);
        }
        if (status>=500) return new GeminiFailure("Gemini: serviço temporariamente indisponível (HTTP "+status+"). As tentativas automáticas não concluíram a leitura. Use Continuar extração mais tarde; o rascunho está salvo.",true,delay);
        if(status==401 || status==403) return new GeminiFailure("Gemini: chave sem acesso (HTTP "+status+"). Confira GEMINI_API_KEY e as permissões do projeto no servidor.",false,0);
        if(status==404) return new GeminiFailure("Gemini: modelo não encontrado (HTTP 404). Confira GEMINI_IMPORT_MODEL no servidor.",false,0);
        return new GeminiFailure("Gemini recusou a leitura (HTTP "+status+"). Confira os PDFs, o modelo e a chave configurados no servidor. O rascunho está salvo.",false,0);
    }
}
