package com.br.klaus.readium.collection.domain.port;

import com.br.klaus.readium.collection.domain.model.ReadingCollection;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface ReadingCollectionRepositoryPort {

    List<ReadingCollection> findAll(String query);

    List<ReadingCollection> findAllById(Collection<Long> ids);

    Optional<ReadingCollection> findById(Long id);

    Optional<ReadingCollection> findBySlug(String slug);

    ReadingCollection save(ReadingCollection collection);

    void deleteById(Long id);
}

