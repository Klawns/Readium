package com.br.klaus.readium.category.api.dto;

public record CategoryResponseDTO(
        Long id,
        String name,
        String slug,
        String color,
        long booksCount
) {
}
