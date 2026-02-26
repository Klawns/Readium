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
    void shouldAllowExactProgressToMoveBackwards() {
        Book book = Book.create("Livro", "data/books/livro.pdf", "livro.pdf");
        book.setPages(300);

        book.updateReadingProgress(120);
        book.setReadingProgressExactly(20);

        assertEquals(20, book.getLastReadPage());
    }

    @Test
    void shouldSetToReadWhenExactProgressIsReset() {
        Book book = Book.create("Livro", "data/books/livro.pdf", "livro.pdf");
        book.setPages(300);

        book.updateReadingProgress(120);
        book.setReadingProgressExactly(0);

        assertEquals(0, book.getLastReadPage());
        assertEquals(Book.BookStatus.TO_READ, book.getBookStatus());
    }

    @Test
    void shouldSetReadingWhenExactProgressIsInMiddle() {
        Book book = Book.create("Livro", "data/books/livro.pdf", "livro.pdf");
        book.setPages(300);

        book.setReadingProgressExactly(50);

        assertEquals(50, book.getLastReadPage());
        assertEquals(Book.BookStatus.READING, book.getBookStatus());
    }

    @Test
    void shouldSetReadWhenExactProgressReachesLastPage() {
        Book book = Book.create("Livro", "data/books/livro.pdf", "livro.pdf");
        book.setPages(200);

        book.setReadingProgressExactly(200);

        assertEquals(200, book.getLastReadPage());
        assertEquals(Book.BookStatus.READ, book.getBookStatus());
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

    @Test
    void shouldRejectExactProgressAboveTotalPages() {
        Book book = Book.create("Livro", "data/books/livro.pdf", "livro.pdf");
        book.setPages(100);

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> book.setReadingProgressExactly(101)
        );

        assertEquals("Pagina invalida. O livro so tem 100 paginas.", exception.getMessage());
    }
}
