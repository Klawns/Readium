package com.br.klaus.readium.book.dto;

import com.br.klaus.readium.book.Book;

import java.time.LocalDateTime;

public record BookOcrStatusResponseDTO(
        Long bookId,
        String status,
        Double score,
        LocalDateTime updatedAt
) {
    public static BookOcrStatusResponseDTO fromEntity(Book book) {
        return new BookOcrStatusResponseDTO(
                book.getId(),
                book.getOcrStatus() != null ? book.getOcrStatus().name() : Book.OcrStatus.PENDING.name(),
                book.getOcrScore(),
                book.getOcrUpdatedAt()
        );
    }
}
