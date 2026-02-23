package com.br.klaus.readium.book.domain.model;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class BookProgressPolicyTests {

    @Test
    void shouldKeepHighestPageWhenProgressMovesBackwards() {
        Book book = Book.create("Livro", "data/books/livro.pdf", "livro.pdf");
        book.setPages(300);

        book.updateReadingProgress(80);
        book.updateReadingProgress(10);

        assertEquals(80, book.getLastReadPage());
    }

    @Test
    void shouldAdvanceWhenProgressMovesForward() {
        Book book = Book.create("Livro", "data/books/livro.pdf", "livro.pdf");
        book.setPages(300);

        book.updateReadingProgress(80);
        book.updateReadingProgress(120);

        assertEquals(120, book.getLastReadPage());
    }

    @Test
    void shouldRejectProgressAboveTotalPages() {
        Book book = Book.create("Livro", "data/books/livro.pdf", "livro.pdf");
        book.setPages(100);

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> book.updateReadingProgress(101)
        );

        assertEquals("Pagina invalida. O livro so tem 100 paginas.", exception.getMessage());
    }
}
