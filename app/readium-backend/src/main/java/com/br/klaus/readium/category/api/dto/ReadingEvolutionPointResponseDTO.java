package com.br.klaus.readium.category.api.dto;

public record ReadingEvolutionPointResponseDTO(
        String date,
        long pagesRead,
        long booksTouched,
        long progressUpdates
) {
}

