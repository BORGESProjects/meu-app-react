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

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<Map<String, String>> uploadTooLarge(
        MaxUploadSizeExceededException error,
        HttpServletRequest request
    ) {
        long limit = error.getMaxUploadSize();
        long contentLength = request.getContentLengthLong();
        LOG.warn("Upload multipart recusado: limite={} bytes, requisicao={} bytes, rota={}",
            limit, contentLength, request.getRequestURI());
        String detail = "O lote excedeu o limite efetivo do servidor (" + limit + " bytes).";
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE).body(Map.of("detail", detail));
    }
}
