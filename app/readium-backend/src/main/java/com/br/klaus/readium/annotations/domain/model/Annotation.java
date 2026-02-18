package com.br.klaus.readium.annotations.domain.model;

import com.br.klaus.readium.annotations.infrastructure.persistence.converter.RectListConverter;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(indexes = {
        @Index(name = "idx_annotation_book_id", columnList = "book_id"),
        @Index(name = "idx_annotation_book_page", columnList = "book_id,page")
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Annotation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long bookId;

    private int page;

    @Convert(converter = RectListConverter.class)
    @Column(columnDefinition = "TEXT")
    private List<Rect> rects;

    private String color;

    @Column(length = 1000)
    private String selectedText;

    @Column(length = 1000)
    private String note;

    private LocalDateTime createdAt;

    public static Annotation create(
            Long bookId,
            int page,
            List<Rect> rects,
            String color,
            String selectedText,
            String note
    ) {
        Annotation annotation = new Annotation();
        annotation.bookId = bookId;
        annotation.page = page;
        annotation.rects = rects;
        annotation.color = color;
        annotation.selectedText = selectedText;
        annotation.note = note;
        return annotation;
    }

    public void update(String color, String note) {
        if (color != null) {
            this.color = color;
        }
        if (note != null) {
            this.note = note;
        }
    }

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}
