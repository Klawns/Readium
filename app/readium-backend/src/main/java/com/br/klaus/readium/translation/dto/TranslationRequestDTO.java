package com.br.klaus.readium.translation.dto;

public record TranslationRequestDTO(
        Long bookId,
        String originalText,
        String translatedText,
        String contextSentence
) {
}
