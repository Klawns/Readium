package com.br.klaus.readium.book.api;

import com.br.klaus.readium.book.domain.model.Book;
import com.br.klaus.readium.book.api.dto.BookOcrStatusResponseDTO;

public final class BookOcrStatusResponseMapper {

    private BookOcrStatusResponseMapper() {
    }

    public static BookOcrStatusResponseDTO toResponse(Book book) {
        return new BookOcrStatusResponseDTO(
                book.getId(),
                BookOcrMapperSupport.resolveStatus(book),
                book.getOcrScore(),
                book.getOcrUpdatedAt()
        );
    }
}

