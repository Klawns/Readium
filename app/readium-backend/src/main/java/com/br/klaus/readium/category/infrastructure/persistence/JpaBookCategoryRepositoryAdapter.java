package com.br.klaus.readium.category.infrastructure.persistence;

import com.br.klaus.readium.category.domain.model.BookCategory;
import com.br.klaus.readium.category.domain.port.BookCategoryRepositoryPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JpaBookCategoryRepositoryAdapter implements BookCategoryRepositoryPort {

    private final BookCategoryJpaRepository repository;

    @Override
    public List<BookCategory> findAll() {
        return repository.findAll();
    }

    @Override
    public List<BookCategory> findByBookId(Long bookId) {
        return repository.findByBookId(bookId);
    }

    @Override
    public long countByCategoryId(Long categoryId) {
        return repository.countByCategoryId(categoryId);
    }

    @Override
    public void deleteByBookId(Long bookId) {
        repository.deleteByBookId(bookId);
    }

    @Override
    public void deleteByCategoryId(Long categoryId) {
        repository.deleteByCategoryId(categoryId);
    }

    @Override
    public void saveAll(Collection<BookCategory> links) {
        repository.saveAll(links);
    }
}
