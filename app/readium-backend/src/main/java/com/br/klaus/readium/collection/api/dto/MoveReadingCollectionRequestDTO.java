package com.br.klaus.readium.collection.api.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record MoveReadingCollectionRequestDTO(
        @NotNull
        @Min(0)
        Integer targetIndex
) {
}
