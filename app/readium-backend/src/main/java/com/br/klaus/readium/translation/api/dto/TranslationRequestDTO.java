package com.br.klaus.readium.translation.api.dto;

public record TranslationRequestDTO(
        Long bookId,
        String originalText,
        String translatedText,
        String contextSentence
) {
}
