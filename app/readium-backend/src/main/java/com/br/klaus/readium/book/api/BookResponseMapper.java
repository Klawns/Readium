package com.br.klaus.readium.book.api;

import com.br.klaus.readium.book.domain.model.Book;
import com.br.klaus.readium.book.domain.service.BookTitleFormatter;
import com.br.klaus.readium.book.api.dto.BookResponseDTO;

public final class BookResponseMapper {

    private BookResponseMapper() {
    }

    public static BookResponseDTO toResponse(Book book) {
        if (book == null) {
            return null;
        }

        String coverUrl = book.isHasCover() ? "/api/books/" + book.getId() + "/cover" : null;

        return new BookResponseDTO(
                book.getId(),
                BookTitleFormatter.normalize(book.getTitle()),
                book.getAuthor(),
                book.getPages(),
                book.getLastReadPage(),
                book.getBookFormat() != null ? book.getBookFormat().name() : "PDF",
                book.getBookStatus() != null ? book.getBookStatus().name() : "TO_READ",
                coverUrl
        );
    }
}

