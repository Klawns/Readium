package com.br.klaus.readium.translation.domain.model;

public record TranslationAutoResult(
        String translatedText,
        String detectedLanguage
) {
}
