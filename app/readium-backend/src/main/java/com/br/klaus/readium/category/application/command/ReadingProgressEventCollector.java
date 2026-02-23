package com.br.klaus.readium.category.application.command;

import com.br.klaus.readium.book.events.BookProgressUpdatedEvent;
import com.br.klaus.readium.category.domain.model.ReadingProgressEvent;
import com.br.klaus.readium.category.domain.port.ReadingProgressEventRepositoryPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class ReadingProgressEventCollector {

    private final ReadingProgressEventRepositoryPort repository;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void handleProgressUpdated(BookProgressUpdatedEvent event) {
        int previousPage = normalizePage(event.previousLastReadPage());
        int currentPage = normalizePage(event.currentLastReadPage());
        int delta = Math.max(0, currentPage - previousPage);

        if (delta <= 0) {
            return;
        }

        LocalDateTime eventTime = event.updatedAt() != null ? event.updatedAt() : LocalDateTime.now();
        ReadingProgressEvent progressEvent = ReadingProgressEvent.create(
                event.bookId(),
                eventTime.toLocalDate(),
                delta,
                eventTime
        );
        repository.save(progressEvent);
    }

    private int normalizePage(Integer page) {
        if (page == null || page < 0) {
            return 0;
        }
        return page;
    }
}

