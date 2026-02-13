package com.br.klaus.readium.translation.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;
import org.springframework.util.StringUtils;

import java.util.Locale;

public record AutoTranslationRequestDTO(
        @NotBlank
        String text,
        @JsonAlias({"target", "target_language", "targetLang", "to", "language"})
        String targetLanguage
) {
    public String resolveTargetLanguage() {
        if (!StringUtils.hasText(targetLanguage)) {
            return "pt";
        }

        String normalized = targetLanguage.trim().toLowerCase(Locale.ROOT);
        return switch (normalized) {
            case "pt-br", "pt_br", "ptbr", "portuguese", "portugues" -> "pt";
            case "en-us", "en_us", "enus" -> "en";
            case "es-es", "es_es", "eses" -> "es";
            default -> normalized;
        };
    }
}
