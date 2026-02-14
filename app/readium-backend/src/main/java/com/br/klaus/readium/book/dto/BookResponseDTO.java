package com.br.klaus.readium.book.dto;

import com.br.klaus.readium.book.Book;
import com.br.klaus.readium.book.BookTitleFormatter;

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
    public static BookResponseDTO fromEntity(Book book) {
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
