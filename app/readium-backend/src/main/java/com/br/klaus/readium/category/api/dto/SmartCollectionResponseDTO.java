package com.br.klaus.readium.category.api.dto;

import com.br.klaus.readium.book.api.BookInsightSnapshot;

import java.util.List;

public record SmartCollectionResponseDTO(
        String id,
        String name,
        String description,
        long totalBooks,
        List<BookInsightSnapshot> previewBooks
) {
}

