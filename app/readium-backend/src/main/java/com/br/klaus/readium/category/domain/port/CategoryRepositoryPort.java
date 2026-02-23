package com.br.klaus.readium.category.domain.port;

import com.br.klaus.readium.category.domain.model.Category;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface CategoryRepositoryPort {

    List<Category> findAll(String query);

    List<Category> findAllById(Collection<Long> ids);

    Optional<Category> findById(Long id);

    Optional<Category> findBySlug(String slug);

    Category save(Category category);

    void deleteById(Long id);
}
