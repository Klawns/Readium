package com.br.klaus.readium.translation.dto;

public record AutoTranslationResponseDTO(
        String translatedText,
        String detectedLanguage
) {
}
