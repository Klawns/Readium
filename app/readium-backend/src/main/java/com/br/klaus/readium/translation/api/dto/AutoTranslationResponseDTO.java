package com.br.klaus.readium.translation.api.dto;

public record AutoTranslationResponseDTO(
        String translatedText,
        String detectedLanguage
) {
}
