package com.br.klaus.readium.book.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record UpdateProgressRequestDTO(
        @NotNull
        @Min(0)
        Integer page
) {
}
