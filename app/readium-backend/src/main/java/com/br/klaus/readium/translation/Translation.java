package com.br.klaus.readium.translation;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(indexes = {
        @Index(name = "idx_translation_book_id", columnList = "book_id"),
        @Index(name = "idx_translation_book_original", columnList = "book_id,original_text"),
        @Index(name = "idx_translation_original_text", columnList = "original_text")
})
@Data
public class Translation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long bookId; // Pode ser null (tradução global)

    private String originalText;

    private String translatedText;

    @Column(length = 1000)
    private String contextSentence;

    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}
