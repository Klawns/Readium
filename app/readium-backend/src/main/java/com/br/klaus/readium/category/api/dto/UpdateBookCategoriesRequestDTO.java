package com.br.klaus.readium.category.api.dto;

import jakarta.validation.constraints.NotNull;

import java.util.List;

public record UpdateBookCategoriesRequestDTO(
        @NotNull
        List<Long> categoryIds
) {
}
