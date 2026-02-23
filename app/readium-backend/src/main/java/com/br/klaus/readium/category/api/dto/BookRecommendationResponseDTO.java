package com.br.klaus.readium.category.api.dto;

import com.br.klaus.readium.book.api.BookInsightSnapshot;

public record BookRecommendationResponseDTO(
        BookInsightSnapshot book,
        String reason,
        double score
) {
}

