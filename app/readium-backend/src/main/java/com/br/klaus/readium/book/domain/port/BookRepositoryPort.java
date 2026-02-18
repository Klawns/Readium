package com.br.klaus.readium.book.domain.port;

import com.br.klaus.readium.book.domain.model.Book;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

public interface BookRepositoryPort {

    Page<Book> findAll(Book.BookStatus status, String query, Pageable pageable);

    Optional<Book> findById(Long id);

    boolean existsById(Long id);

    Optional<Book> findByFileHash(String fileHash);

    Book save(Book book);

    void deleteById(Long id);
}
