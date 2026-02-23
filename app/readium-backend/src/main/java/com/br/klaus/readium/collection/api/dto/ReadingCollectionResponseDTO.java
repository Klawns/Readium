package com.br.klaus.readium.collection.api.dto;

public record ReadingCollectionResponseDTO(
        Long id,
        String name,
        String slug,
        String description,
        String color,
        String icon,
        long booksCount
) {
}

