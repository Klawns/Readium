package com.br.klaus.readium.translation.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AutoTranslationRequestDTO(
        @NotBlank
        String text,
        @NotBlank
        @Size(max = 10)
        String targetLanguage
) {
}
