package com.br.klaus.readium.category.domain.port;

import com.br.klaus.readium.category.domain.model.Category;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface CategoryRepositoryPort {

    List<Category> findAll(String query);

    List<Category> findByParentId(Long parentId);

    List<Category> findAllById(Collection<Long> ids);

    Optional<Category> findById(Long id);

    Optional<Category> findBySlug(String slug);

    long countByParentId(Long parentId);

    Category save(Category category);

    void saveAll(Collection<Category> categories);

    void deleteById(Long id);
}
