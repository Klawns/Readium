package com.br.klaus.readium.annotations.api.dto;

import jakarta.validation.constraints.Size;

public record UpdateAnnotationRequestDTO(
        @Size(max = 32)
        String color,
        @Size(max = 1000)
        String note
) {
}
