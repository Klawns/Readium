package com.br.klaus.readium.collection.infrastructure.persistence;

import com.br.klaus.readium.collection.domain.model.BookReadingCollection;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookReadingCollectionJpaRepository extends JpaRepository<BookReadingCollection, Long> {

    List<BookReadingCollection> findByBookId(Long bookId);

    long countByCollectionId(Long collectionId);

    void deleteByBookId(Long bookId);

    void deleteByCollectionId(Long collectionId);
}

