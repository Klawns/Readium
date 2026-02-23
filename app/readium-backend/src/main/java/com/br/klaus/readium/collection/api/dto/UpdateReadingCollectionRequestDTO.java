package com.br.klaus.readium.collection.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateReadingCollectionRequestDTO(
        @NotBlank
        @Size(max = 80)
        String name,
        @Size(max = 255)
        String description,
        @Pattern(regexp = "^#([A-Fa-f0-9]{6})$", message = "A cor deve estar no formato hexadecimal, ex: #3B82F6")
        String color,
        @Size(max = 32)
        String icon,
        @Size(max = 32)
        String templateId
) {
}
