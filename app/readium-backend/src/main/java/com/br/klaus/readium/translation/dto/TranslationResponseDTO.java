package com.br.klaus.readium.translation.dto;

import com.br.klaus.readium.translation.Translation;
import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record TranslationResponseDTO(
        Long id,
        Long bookId,
        String originalText,
        String translatedText,
        String contextSentence
) {
    public static TranslationResponseDTO fromEntity(Translation translation) {
        return new TranslationResponseDTO(
                translation.getId(),
                translation.getBookId(),
                translation.getOriginalText(),
                translation.getTranslatedText(),
                translation.getContextSentence()
        );
    }
}
