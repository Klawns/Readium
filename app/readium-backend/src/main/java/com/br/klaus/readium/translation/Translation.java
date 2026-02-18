package com.br.klaus.readium.translation;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Locale;

@Entity
@Table(indexes = {
        @Index(name = "idx_translation_book_id", columnList = "book_id"),
        @Index(name = "idx_translation_book_original", columnList = "book_id,original_text"),
        @Index(name = "idx_translation_original_text", columnList = "original_text")
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
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

    public static Translation create(Long bookId, String originalText, String translatedText, String contextSentence) {
        Translation translation = new Translation();
        translation.revise(bookId, originalText, translatedText, contextSentence);
        return translation;
    }

    public void revise(Long bookId, String originalText, String translatedText, String contextSentence) {
        this.bookId = bookId;
        this.originalText = normalizeOriginalText(originalText);
        this.translatedText = requireText(translatedText, "translatedText").trim();
        this.contextSentence = sanitizeContext(contextSentence);
    }

    public static String normalizeOriginalText(String value) {
        return requireText(value, "originalText").trim().toLowerCase(Locale.ROOT);
    }

    private static String requireText(String value, String fieldName) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(fieldName + " is required.");
        }
        return value;
    }

    private static String sanitizeContext(String contextSentence) {
        if (contextSentence == null) {
            return null;
        }

        String sanitized = contextSentence.trim();
        return sanitized.isEmpty() ? null : sanitized;
    }

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}
