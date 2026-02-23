package com.br.klaus.readium.category.domain.port;

import com.br.klaus.readium.category.domain.model.BookCategory;

import java.util.Collection;
import java.util.List;

public interface BookCategoryRepositoryPort {

    List<BookCategory> findAll();

    List<BookCategory> findByBookId(Long bookId);

    long countByCategoryId(Long categoryId);

    void deleteByBookId(Long bookId);

    void deleteByCategoryId(Long categoryId);

    void saveAll(Collection<BookCategory> links);
}
