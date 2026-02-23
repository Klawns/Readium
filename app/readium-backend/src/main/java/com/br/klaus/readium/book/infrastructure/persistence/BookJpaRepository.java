package com.br.klaus.readium.book.infrastructure.persistence;

import com.br.klaus.readium.book.domain.model.Book;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.List;

public interface BookJpaRepository extends JpaRepository<Book, Long>, JpaSpecificationExecutor<Book> {

    Optional<Book> findByFileHash(String fileHash);

    List<Book> findByOcrStatus(Book.OcrStatus ocrStatus);

    @Query(
            value = """
                    SELECT b.*
                    FROM book b
                    LEFT JOIN book_category bc ON bc.book_id = b.id
                    LEFT JOIN book_reading_collection brc ON brc.book_id = b.id
                    WHERE (:status IS NULL OR b.book_status = :status)
                      AND (
                            :categoryId IS NULL
                            OR bc.category_id IN (
                                WITH RECURSIVE category_tree(id) AS (
                                    SELECT id
                                    FROM category
                                    WHERE id = :categoryId
                                    UNION ALL
                                    SELECT c.id
                                    FROM category c
                                    JOIN category_tree ct ON c.parent_id = ct.id
                                )
                                SELECT id
                                FROM category_tree
                            )
                      )
                      AND (
                            :collectionId IS NULL
                            OR brc.collection_id = :collectionId
                      )
                      AND (
                            :query IS NULL
                            OR :query = ''
                            OR LOWER(COALESCE(b.title, '')) LIKE LOWER('%' || :query || '%')
                            OR LOWER(COALESCE(b.author, '')) LIKE LOWER('%' || :query || '%')
                          )
                    GROUP BY b.id
                    """,
            countQuery = """
                    SELECT COUNT(DISTINCT b.id)
                    FROM book b
                    LEFT JOIN book_category bc ON bc.book_id = b.id
                    LEFT JOIN book_reading_collection brc ON brc.book_id = b.id
                    WHERE (:status IS NULL OR b.book_status = :status)
                      AND (
                            :categoryId IS NULL
                            OR bc.category_id IN (
                                WITH RECURSIVE category_tree(id) AS (
                                    SELECT id
                                    FROM category
                                    WHERE id = :categoryId
                                    UNION ALL
                                    SELECT c.id
                                    FROM category c
                                    JOIN category_tree ct ON c.parent_id = ct.id
                                )
                                SELECT id
                                FROM category_tree
                            )
                      )
                      AND (
                            :collectionId IS NULL
                            OR brc.collection_id = :collectionId
                      )
                      AND (
                            :query IS NULL
                            OR :query = ''
                            OR LOWER(COALESCE(b.title, '')) LIKE LOWER('%' || :query || '%')
                            OR LOWER(COALESCE(b.author, '')) LIKE LOWER('%' || :query || '%')
                          )
                    """,
            nativeQuery = true
    )
    Page<Book> findAllByFilters(
            @Param("status") String status,
            @Param("query") String query,
            @Param("categoryId") Long categoryId,
            @Param("collectionId") Long collectionId,
            Pageable pageable
    );
}
