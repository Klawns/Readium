package com.br.klaus.readium.book.api.dto;

public record BookResponseDTO(
        Long id,
        String title,
        String author,
        Integer pages,
        Integer lastReadPage,
        String format,
        String status,
        String coverUrl
) {
}
