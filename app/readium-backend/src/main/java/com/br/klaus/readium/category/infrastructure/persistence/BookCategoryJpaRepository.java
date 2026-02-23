package com.br.klaus.readium.category.infrastructure.persistence;

import com.br.klaus.readium.category.domain.model.BookCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookCategoryJpaRepository extends JpaRepository<BookCategory, Long> {

    List<BookCategory> findByBookId(Long bookId);

    long countByCategoryId(Long categoryId);

    void deleteByBookId(Long bookId);

    void deleteByCategoryId(Long categoryId);
}
