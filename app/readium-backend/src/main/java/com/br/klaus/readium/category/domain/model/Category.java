package com.br.klaus.readium.category.domain.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "category", indexes = {
        @Index(name = "idx_category_name", columnList = "name"),
        @Index(name = "idx_category_slug", columnList = "slug", unique = true),
        @Index(name = "idx_category_parent", columnList = "parent_id")
})
@Data
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Version
    private Long version;

    @Column(nullable = false, length = 80)
    private String name;

    @Column(nullable = false, length = 96, unique = true)
    private String slug;

    @Column(nullable = false, length = 7)
    private String color;

    @Column(name = "parent_id")
    private Long parentId;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder;

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

    public static Category create(String name, String slug, String color, Long parentId, int sortOrder) {
        Category category = new Category();
        category.name = name;
        category.slug = slug;
        category.color = color;
        category.parentId = parentId;
        category.sortOrder = sortOrder;
        return category;
    }
}
