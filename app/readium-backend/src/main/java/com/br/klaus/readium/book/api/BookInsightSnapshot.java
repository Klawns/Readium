package com.br.klaus.readium.book.api;

public record BookInsightSnapshot(
        Long id,
        String title,
        String author,
        Integer pages,
        Integer lastReadPage,
        String format,
        String status,
        String coverUrl,
        String ocrStatus
) {
}

