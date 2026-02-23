package com.br.klaus.readium.collection.domain.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "book_reading_collection", indexes = {
        @Index(name = "idx_book_reading_collection_book", columnList = "book_id"),
        @Index(name = "idx_book_reading_collection_collection", columnList = "collection_id")
}, uniqueConstraints = {
        @UniqueConstraint(
                name = "uk_book_reading_collection_book_collection",
                columnNames = {"book_id", "collection_id"}
        )
})
@Data
public class BookReadingCollection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "book_id", nullable = false)
    private Long bookId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "collection_id", nullable = false)
    private ReadingCollection collection;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    public static BookReadingCollection create(Long bookId, ReadingCollection collection) {
        BookReadingCollection link = new BookReadingCollection();
        link.bookId = bookId;
        link.collection = collection;
        return link;
    }
}

