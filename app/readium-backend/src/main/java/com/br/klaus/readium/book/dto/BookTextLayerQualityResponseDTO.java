package com.br.klaus.readium.book.dto;

import com.br.klaus.readium.book.Book;

import java.time.LocalDateTime;

public record BookTextLayerQualityResponseDTO(
        Long bookId,
        Double score,
        String status,
        LocalDateTime updatedAt
) {
    public static BookTextLayerQualityResponseDTO fromEntity(Book book) {
        return new BookTextLayerQualityResponseDTO(
                book.getId(),
                book.getOcrScore(),
                book.getOcrStatus() != null ? book.getOcrStatus().name() : Book.OcrStatus.PENDING.name(),
                book.getOcrUpdatedAt()
        );
    }
}
