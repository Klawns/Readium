package com.br.klaus.readium.category.api;

import com.br.klaus.readium.category.api.dto.CategoryResponseDTO;
import com.br.klaus.readium.category.domain.model.Category;

public final class CategoryResponseMapper {

    private CategoryResponseMapper() {
    }

    public static CategoryResponseDTO toResponse(Category category, long booksCount) {
        return new CategoryResponseDTO(
                category.getId(),
                category.getName(),
                category.getSlug(),
                category.getColor(),
                booksCount
        );
    }
}
