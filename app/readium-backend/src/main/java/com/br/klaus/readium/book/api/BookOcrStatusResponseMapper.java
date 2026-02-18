package com.br.klaus.readium.book.api;

import com.br.klaus.readium.book.Book;
import com.br.klaus.readium.book.api.dto.BookOcrStatusResponseDTO;

public final class BookOcrStatusResponseMapper {

    private BookOcrStatusResponseMapper() {
    }

    public static BookOcrStatusResponseDTO toResponse(Book book) {
        return new BookOcrStatusResponseDTO(
                book.getId(),
                book.getOcrStatus() != null ? book.getOcrStatus().name() : Book.OcrStatus.PENDING.name(),
                book.getOcrScore(),
                book.getOcrUpdatedAt()
        );
    }
}
