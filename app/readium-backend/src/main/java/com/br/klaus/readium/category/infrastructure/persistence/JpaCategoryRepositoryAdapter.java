package com.br.klaus.readium.category.infrastructure.persistence;

import com.br.klaus.readium.category.domain.model.Category;
import com.br.klaus.readium.category.domain.port.CategoryRepositoryPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class JpaCategoryRepositoryAdapter implements CategoryRepositoryPort {

    private final CategoryJpaRepository repository;

    @Override
    public List<Category> findAll(String query) {
        return repository.findByQuery(query);
    }

    @Override
    public List<Category> findByParentId(Long parentId) {
        return repository.findByParentIdOrderBySortOrderAscNameAsc(parentId);
    }

    @Override
    public List<Category> findAllById(Collection<Long> ids) {
        return repository.findByIdIn(ids);
    }

    @Override
    public Optional<Category> findById(Long id) {
        return repository.findById(id);
    }

    @Override
    public Optional<Category> findBySlug(String slug) {
        return repository.findBySlug(slug);
    }

    @Override
    public long countByParentId(Long parentId) {
        return repository.countByParentId(parentId);
    }

    @Override
    public Category save(Category category) {
        return repository.save(category);
    }

    @Override
    public void saveAll(Collection<Category> categories) {
        repository.saveAll(categories);
    }

    @Override
    public void deleteById(Long id) {
        repository.deleteById(id);
    }
}
