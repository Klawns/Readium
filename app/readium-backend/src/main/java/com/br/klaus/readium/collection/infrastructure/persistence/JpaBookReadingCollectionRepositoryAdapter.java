package com.br.klaus.readium.collection.infrastructure.persistence;

import com.br.klaus.readium.collection.domain.model.BookReadingCollection;
import com.br.klaus.readium.collection.domain.port.BookReadingCollectionRepositoryPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JpaBookReadingCollectionRepositoryAdapter implements BookReadingCollectionRepositoryPort {

    private final BookReadingCollectionJpaRepository repository;

    @Override
    public List<BookReadingCollection> findByBookId(Long bookId) {
        return repository.findByBookId(bookId);
    }

    @Override
    public long countByCollectionId(Long collectionId) {
        return repository.countByCollectionId(collectionId);
    }

    @Override
    public void deleteByBookId(Long bookId) {
        repository.deleteByBookId(bookId);
    }

    @Override
    public void deleteByCollectionId(Long collectionId) {
        repository.deleteByCollectionId(collectionId);
    }

    @Override
    public void saveAll(Collection<BookReadingCollection> links) {
        repository.saveAll(links);
    }
}

