package com.br.klaus.readium.collection.domain.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "reading_collection", indexes = {
        @Index(name = "idx_reading_collection_name", columnList = "name"),
        @Index(name = "idx_reading_collection_slug", columnList = "slug", unique = true)
})
@Data
public class ReadingCollection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Version
    private Long version;

    @Column(nullable = false, length = 80)
    private String name;

    @Column(nullable = false, length = 96, unique = true)
    private String slug;

    @Column(length = 255)
    private String description;

    @Column(nullable = false, length = 7)
    private String color;

    @Column(nullable = false, length = 32)
    private String icon;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) {
            createdAt = now;
        }
        updatedAt = now;
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public static ReadingCollection create(String name, String slug, String description, String color, String icon) {
        ReadingCollection collection = new ReadingCollection();
        collection.name = name;
        collection.slug = slug;
        collection.description = description;
        collection.color = color;
        collection.icon = icon;
        return collection;
    }
}

