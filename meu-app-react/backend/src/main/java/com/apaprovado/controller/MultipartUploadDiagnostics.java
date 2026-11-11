package com.apaprovado.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.util.Map;

@RestControllerAdvice
public class MultipartUploadDiagnostics {
    private static final Logger LOG = LoggerFactory.getLogger(MultipartUploadDiagnostics.class);
    private static final long CONFIGURED_MAX_REQUEST_BYTES = 20L * 1024L * 1024L;

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<Map<String, String>> uploadTooLarge(
        MaxUploadSizeExceededException error,
        HttpServletRequest request
    ) {
        long reportedLimit = error.getMaxUploadSize();
        long effectiveLimit = reportedLimit > 0 ? reportedLimit : CONFIGURED_MAX_REQUEST_BYTES;
        long contentLength = request.getContentLengthLong();
        LOG.warn("Upload multipart recusado: limiteEfetivo={} bytes, limiteReportado={} bytes, requisicao={} bytes, rota={}",
            effectiveLimit, reportedLimit, contentLength, request.getRequestURI());
        String detail = "O lote excedeu o limite efetivo do servidor (" + effectiveLimit + " bytes).";
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE).body(Map.of("detail", detail));
    }
}
