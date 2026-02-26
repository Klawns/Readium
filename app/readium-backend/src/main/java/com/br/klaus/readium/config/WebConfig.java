package com.br.klaus.readium.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Arrays;

@Configuration
@Slf4j
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.web.cors.allowed-origin-patterns:http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173,http://127.0.0.1:4173}")
    private String allowedOriginPatterns;

    @Value("${app.web.cors.allow-credentials:false}")
    private boolean allowCredentials;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        String[] origins = Arrays.stream(allowedOriginPatterns.split(","))
                .map(String::trim)
                .filter(value -> !value.isBlank())
                .toArray(String[]::new);
        boolean hasWildcardOrigin = Arrays.stream(origins).anyMatch("*"::equals);
        boolean effectiveAllowCredentials = allowCredentials && !hasWildcardOrigin;

        if (allowCredentials && hasWildcardOrigin) {
            log.warn("CORS com credenciais foi solicitado com origem curinga. Credenciais foram desabilitadas por seguranca.");
        }

        registry.addMapping("/**")
                .allowedOriginPatterns(origins.length == 0 ? new String[]{"http://localhost:5173"} : origins)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(effectiveAllowCredentials);
    }
}
