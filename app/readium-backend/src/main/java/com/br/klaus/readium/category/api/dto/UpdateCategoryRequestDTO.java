package com.br.klaus.readium.category.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateCategoryRequestDTO(
        @NotBlank
        @Size(max = 80)
        String name,
        @Pattern(regexp = "^#([A-Fa-f0-9]{6})$", message = "A cor deve estar no formato hexadecimal, ex: #3B82F6")
        String color,
        Long parentId
) {
}
