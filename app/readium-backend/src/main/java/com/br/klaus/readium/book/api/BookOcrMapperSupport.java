package com.br.klaus.readium.book.api;

import com.br.klaus.readium.book.domain.model.Book;

final class BookOcrMapperSupport {

    private BookOcrMapperSupport() {
    }

    static String resolveStatus(Book book) {
        return book.getOcrStatus() != null
                ? book.getOcrStatus().name()
                : Book.OcrStatus.PENDING.name();
    }
}

