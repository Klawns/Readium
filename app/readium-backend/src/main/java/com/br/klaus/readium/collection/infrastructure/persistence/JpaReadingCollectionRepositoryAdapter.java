package com.br.klaus.readium.collection.infrastructure.persistence;

import com.br.klaus.readium.collection.domain.model.ReadingCollection;
import com.br.klaus.readium.collection.domain.port.ReadingCollectionRepositoryPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class JpaReadingCollectionRepositoryAdapter implements ReadingCollectionRepositoryPort {

    private final ReadingCollectionJpaRepository repository;

    @Override
    public List<ReadingCollection> findAll(String query) {
        return repository.findByQuery(query);
    }

    @Override
    public List<ReadingCollection> findAllById(Collection<Long> ids) {
        return repository.findByIdIn(ids);
    }

    @Override
    public Optional<ReadingCollection> findById(Long id) {
        return repository.findById(id);
    }

    @Override
    public Optional<ReadingCollection> findBySlug(String slug) {
        return repository.findBySlug(slug);
    }

    @Override
    public long countAll() {
        return repository.count();
    }

    @Override
    public ReadingCollection save(ReadingCollection collection) {
        return repository.save(collection);
    }

    @Override
    public void saveAll(Collection<ReadingCollection> collections) {
        repository.saveAll(collections);
    }

    @Override
    public void deleteById(Long id) {
        repository.deleteById(id);
    }
}
