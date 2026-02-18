package com.br.klaus.readium.book.application.support;

import com.br.klaus.readium.book.Book;
import com.br.klaus.readium.book.BookRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class OcrRunningRecoveryService {

    private final BookRepository repository;

    @Value("${app.ocr.running-timeout-seconds:2400}")
    private long ocrRunningTimeoutSeconds;

    public void recoverIfStale(Book book) {
        if (!isStale(book)) {
            return;
        }

        log.warn(
                "OCR em estado RUNNING estagnado para livro {} (updatedAt={}). Marcando como FAILED para permitir novo processamento.",
                book.getId(),
                book.getOcrUpdatedAt()
        );

        book.markOcrFailed();
        repository.save(book);
    }

    private boolean isStale(Book book) {
        if (book.getOcrStatus() != Book.OcrStatus.RUNNING) {
            return false;
        }

        if (book.getOcrUpdatedAt() == null) {
            return true;
        }

        long timeoutSeconds = Math.max(ocrRunningTimeoutSeconds, 60);
        LocalDateTime staleThreshold = LocalDateTime.now().minusSeconds(timeoutSeconds);
        return book.getOcrUpdatedAt().isBefore(staleThreshold);
    }
}
