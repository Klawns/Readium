package com.br.klaus.readium.category.domain.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "reading_progress_event", indexes = {
        @Index(name = "idx_reading_progress_event_date", columnList = "event_date"),
        @Index(name = "idx_reading_progress_event_book", columnList = "book_id"),
        @Index(name = "idx_reading_progress_event_occurred_at", columnList = "occurred_at")
})
@Data
public class ReadingProgressEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "book_id", nullable = false)
    private Long bookId;

    @Column(name = "event_date", nullable = false)
    private LocalDate eventDate;

    @Column(name = "pages_read_delta", nullable = false)
    private int pagesReadDelta;

    @Column(name = "occurred_at", nullable = false)
    private LocalDateTime occurredAt;

    @PrePersist
    void prePersist() {
        if (occurredAt == null) {
            occurredAt = LocalDateTime.now();
        }
    }

    public static ReadingProgressEvent create(
            Long bookId,
            LocalDate eventDate,
            int pagesReadDelta,
            LocalDateTime occurredAt
    ) {
        ReadingProgressEvent event = new ReadingProgressEvent();
        event.bookId = bookId;
        event.eventDate = eventDate;
        event.pagesReadDelta = pagesReadDelta;
        event.occurredAt = occurredAt;
        return event;
    }
}

