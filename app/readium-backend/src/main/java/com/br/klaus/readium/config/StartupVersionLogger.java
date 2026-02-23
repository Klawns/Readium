package com.br.klaus.readium.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class StartupVersionLogger {

    private final Environment environment;

    @Value("${app.version:unknown}")
    private String appVersion;

    public StartupVersionLogger(Environment environment) {
        this.environment = environment;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady() {
        String ocrEngine = environment.getProperty("app.ocr.engine", "unknown");
        log.info("Readium iniciado com versao {} (ocrEngine={})", appVersion, ocrEngine);
    }
}
