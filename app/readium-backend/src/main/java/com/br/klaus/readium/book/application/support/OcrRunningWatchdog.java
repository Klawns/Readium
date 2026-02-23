package com.br.klaus.readium.book.application.support;

import com.br.klaus.readium.book.domain.model.Book;
import com.br.klaus.readium.book.domain.port.BookRepositoryPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class OcrRunningWatchdog {

    private final BookRepositoryPort repository;
    private final OcrRunningRecoveryService recoveryService;

    @Scheduled(fixedDelayString = "${app.ocr.recovery.fixed-delay-ms:60000}")
    @Transactional
    public void recoverStaleRunningOcrJobs() {
        List<Book> runningBooks = repository.findByOcrStatus(Book.OcrStatus.RUNNING);
        if (runningBooks.isEmpty()) {
            return;
        }

        int recovered = 0;
        for (Book book : runningBooks) {
            Book.OcrStatus before = book.getOcrStatus();
            recoveryService.recoverIfStale(book);
            if (before == Book.OcrStatus.RUNNING && book.getOcrStatus() == Book.OcrStatus.FAILED) {
                recovered++;
            }
        }

        if (recovered > 0) {
            log.warn("Watchdog OCR recuperou {} job(s) estagnados em RUNNING.", recovered);
        }
    }
}

