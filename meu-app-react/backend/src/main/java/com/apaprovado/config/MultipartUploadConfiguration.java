package com.apaprovado.config;

import jakarta.servlet.MultipartConfigElement;
import org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.boot.web.servlet.MultipartConfigFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.unit.DataSize;

@Configuration
public class MultipartUploadConfiguration {
    private static final int MAX_REQUEST_BYTES = (int) DataSize.ofMegabytes(20).toBytes();

    @Bean
    public MultipartConfigElement multipartConfigElement() {
        MultipartConfigFactory factory = new MultipartConfigFactory();
        factory.setMaxFileSize(DataSize.ofMegabytes(10));
        factory.setMaxRequestSize(DataSize.ofMegabytes(20));
        return factory.createMultipartConfig();
    }

    @Bean
    public WebServerFactoryCustomizer<TomcatServletWebServerFactory> multipartConnectorLimits() {
        return factory -> factory.addConnectorCustomizers(connector -> {
            connector.setMaxPostSize(MAX_REQUEST_BYTES);
            connector.setMaxSwallowSize(MAX_REQUEST_BYTES);
        });
    }
}
