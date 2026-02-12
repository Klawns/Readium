package com.br.klaus.readium.book.dto;

import jakarta.validation.constraints.Min;

public record UpdateProgressRequestDTO(
        @Min(0)
        Integer page
) {
}
