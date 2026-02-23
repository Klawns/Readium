package com.br.klaus.readium.collection.infrastructure.persistence;

import com.br.klaus.readium.collection.domain.model.ReadingCollection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface ReadingCollectionJpaRepository extends JpaRepository<ReadingCollection, Long> {

    Optional<ReadingCollection> findBySlug(String slug);

    List<ReadingCollection> findByIdIn(Collection<Long> ids);

    @Query("""
            select c
            from ReadingCollection c
            where (:query is null or :query = '' or lower(c.name) like lower(concat('%', :query, '%')))
            order by lower(c.name) asc
            """)
    List<ReadingCollection> findByQuery(@Param("query") String query);
}

