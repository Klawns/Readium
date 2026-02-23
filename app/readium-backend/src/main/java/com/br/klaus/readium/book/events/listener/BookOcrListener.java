package com.br.klaus.readium.book.events.listener;

import com.br.klaus.readium.book.domain.model.Book;
import com.br.klaus.readium.book.domain.model.OcrGatewayResult;
import com.br.klaus.readium.book.domain.port.BookRepositoryPort;
import com.br.klaus.readium.book.domain.port.OcrGatewayPort;
import com.br.klaus.readium.book.events.BookOcrRequestedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.time.Duration;
import java.time.Instant;

@Component
@RequiredArgsConstructor
@Slf4j
public class BookOcrListener {

    private final BookRepositoryPort bookRepository;
    private final OcrGatewayPort ocrGateway;

    @Async("ocrTaskExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleBookOcrRequested(BookOcrRequestedEvent event) {
        Instant startedAt = Instant.now();
        Book book = bookRepository.findById(event.bookId()).orElse(null);
        if (book == null) {
            log.warn("Livro {} nao encontrado para processamento OCR.", event.bookId());
            return;
        }

        log.info("Iniciando OCR para livro {} (titulo='{}')", book.getId(), book.getTitle());
        book.markOcrRunning();
        bookRepository.save(book);

        try {
            OcrGatewayResult result = ocrGateway.process(book);
            book.markOcrDone(result.score(), result.processedFilePath());
            long elapsedSeconds = Duration.between(startedAt, Instant.now()).toSeconds();
            log.info("OCR finalizado para livro {} com score {} em {}s", book.getId(), result.score(), elapsedSeconds);
        } catch (Exception ex) {
            String details = resolveFailureDetails(ex);
            book.markOcrFailed(details);
            log.error("Falha no OCR do livro {}", book.getId(), ex);
        }

        bookRepository.save(book);
    }

    private String resolveFailureDetails(Exception ex) {
        Throwable current = ex;
        while (current.getCause() != null) {
            current = current.getCause();
        }

        String message = current.getMessage();
        if (message == null || message.isBlank()) {
            return "Falha no OCR sem mensagem de erro.";
        }

        String normalized = message.trim().replaceAll("\\s+", " ");
        if (normalized.length() <= 300) {
            return normalized;
        }
        return normalized.substring(0, 300) + "...";
    }
}

