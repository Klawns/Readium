package com.br.klaus.readium.translation.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record TranslationResponseDTO(
        Long id,
        Long bookId,
        String originalText,
        String translatedText,
        String contextSentence
) {
}
