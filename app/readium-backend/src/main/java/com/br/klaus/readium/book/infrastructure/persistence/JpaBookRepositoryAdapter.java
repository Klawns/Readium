package com.br.klaus.readium.book.infrastructure.persistence;

import com.br.klaus.readium.book.Book;
import com.br.klaus.readium.book.domain.port.BookRepositoryPort;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class JpaBookRepositoryAdapter implements BookRepositoryPort {

    private final BookJpaRepository repository;

    @Override
    public Page<Book> findAll(Book.BookStatus status, String query, Pageable pageable) {
        Specification<Book> spec = Specification.where(BookJpaSpecifications.hasStatus(status))
                .and(BookJpaSpecifications.containsText(query));
        return repository.findAll(spec, pageable);
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
    public Book save(Book book) {
        return repository.save(book);
    }

    @Override
    public void deleteById(Long id) {
        repository.deleteById(id);
    }
}