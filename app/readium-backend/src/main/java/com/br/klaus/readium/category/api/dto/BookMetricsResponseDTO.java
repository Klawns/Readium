package com.br.klaus.readium.category.api.dto;

public record BookMetricsResponseDTO(
        long totalBooks,
        long toReadBooks,
        long readingBooks,
        long readBooks,
        long categorizedBooks,
        long uncategorizedBooks,
        long totalPagesKnown,
        long pagesRead,
        int averageProgressPercent,
        int completionPercent
) {
}

