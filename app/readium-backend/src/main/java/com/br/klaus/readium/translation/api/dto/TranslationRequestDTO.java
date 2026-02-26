package com.br.klaus.readium.translation.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record TranslationRequestDTO(
        Long bookId,
        @NotBlank
        @Size(max = 1000)
        String originalText,
        @NotBlank
        @Size(max = 1000)
        String translatedText,
        @Size(max = 2000)
        String contextSentence
) {
}
