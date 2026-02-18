package com.br.klaus.readium.book.application.support;

import com.br.klaus.readium.book.domain.model.Book;
import com.br.klaus.readium.book.domain.port.BookRepositoryPort;
import com.br.klaus.readium.exception.BookNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BookLookupService {

    private final BookRepositoryPort repository;

    public Book loadOrThrow(Long bookId) {
        return repository.findById(bookId)
                .orElseThrow(() -> new BookNotFoundException("Livro com ID " + bookId + " nao encontrado."));
    }
}

