package com.br.klaus.readium.book.infrastructure.persistence;

import com.br.klaus.readium.book.domain.model.Book;
import com.br.klaus.readium.book.domain.port.BookRepositoryPort;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class JpaBookRepositoryAdapter implements BookRepositoryPort {

    private final BookJpaRepository repository;

    @Override
    public List<Book> findAll() {
        return repository.findAll();
    }

    @Override
    public Page<Book> findAll(Book.BookStatus status, String query, Long categoryId, Long collectionId, Pageable pageable) {
        return repository.findAllByFilters(
                status != null ? status.name() : null,
                query,
                categoryId,
                collectionId,
                pageable
        );
    }

    @Override
    public Optional<Book> findById(Long id) {
        return repository.findById(id);
    }

    @Override
    public boolean existsById(Long id) {
        return repository.existsById(id);
    }

    @Override
    public Optional<Book> findByFileHash(String fileHash) {
        return repository.findByFileHash(fileHash);
    }

    @Override
    public List<Book> findByOcrStatus(Book.OcrStatus status) {
        return repository.findByOcrStatus(status);
    }

    @Override
    public Book save(Book book) {
        return repository.save(book);
    }

    @Override
    public void deleteById(Long id) {
        repository.deleteById(id);
    }
}
