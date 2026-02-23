package com.br.klaus.readium.collection.domain.port;

import com.br.klaus.readium.collection.domain.model.BookReadingCollection;

import java.util.Collection;
import java.util.List;

public interface BookReadingCollectionRepositoryPort {

    List<BookReadingCollection> findByBookId(Long bookId);

    long countByCollectionId(Long collectionId);

    void deleteByBookId(Long bookId);

    void deleteByCollectionId(Long collectionId);

    void saveAll(Collection<BookReadingCollection> links);
}

