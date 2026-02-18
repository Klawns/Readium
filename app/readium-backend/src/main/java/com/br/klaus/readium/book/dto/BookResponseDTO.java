package com.br.klaus.readium.book.dto;

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
