package com.br.klaus.readium.book.events.listener;

import com.br.klaus.readium.book.domain.model.Book;
import com.br.klaus.readium.book.domain.model.OcrGatewayResult;
import com.br.klaus.readium.book.domain.port.BookRepositoryPort;
import com.br.klaus.readium.book.domain.port.OcrGatewayPort;
import com.br.klaus.readium.book.events.BookOcrRequestedEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.time.Duration;
import java.time.Instant;
import java.util.Locale;
import java.util.concurrent.Executor;
import java.util.concurrent.RejectedExecutionException;

@Component
@Slf4j
public class BookOcrListener {
    private static final String OCR_QUEUE_FULL_DETAILS = "Fila de OCR lotada. Tente novamente em instantes.";

    private final BookRepositoryPort bookRepository;
    private final OcrGatewayPort ocrGateway;
    private final Executor ocrTaskExecutor;

    public BookOcrListener(
            BookRepositoryPort bookRepository,
            OcrGatewayPort ocrGateway,
            @Qualifier("ocrTaskExecutor") Executor ocrTaskExecutor
    ) {
        this.bookRepository = bookRepository;
        this.ocrGateway = ocrGateway;
        this.ocrTaskExecutor = ocrTaskExecutor;
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleBookOcrRequested(BookOcrRequestedEvent event) {
        try {
            ocrTaskExecutor.execute(() -> processBookOcr(event.bookId()));
        } catch (RejectedExecutionException ex) {
            handleQueueRejection(event.bookId(), ex);
        }
    }

    private void processBookOcr(Long bookId) {
        Instant startedAt = Instant.now();
        Book book = bookRepository.findById(bookId).orElse(null);
        if (book == null) {
            log.warn("Livro {} nao encontrado para processamento OCR.", bookId);
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

    private void handleQueueRejection(Long bookId, RuntimeException exception) {
        log.warn("Fila OCR saturada; livro {} nao foi enfileirado.", bookId, exception);

        Book book = bookRepository.findById(bookId).orElse(null);
        if (book == null) {
            return;
        }

        if (book.getOcrStatus() == Book.OcrStatus.RUNNING || book.getOcrStatus() == Book.OcrStatus.DONE) {
            return;
        }

        book.markOcrFailed(OCR_QUEUE_FULL_DETAILS);
        bookRepository.save(book);
    }

    private String resolveFailureDetails(Exception ex) {
        Throwable current = ex;
        while (current.getCause() != null) {
            current = current.getCause();
        }

        String message = current.getMessage();
        if (message == null || message.isBlank()) {
            return "Falha ao processar OCR.";
        }

        String normalized = message.trim().toLowerCase(Locale.ROOT);
        if (normalized.contains("timeout")) {
            return "OCR excedeu o tempo limite de processamento.";
        }
        if (normalized.contains("codigo")) {
            return "OCR finalizou com erro.";
        }
        return "Falha ao processar OCR.";
    }
}
