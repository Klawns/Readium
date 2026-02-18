package com.br.klaus.readium.book.events.listener;

import com.br.klaus.readium.book.Book;
import com.br.klaus.readium.book.OcrGatewayResult;
import com.br.klaus.readium.book.domain.port.BookRepositoryPort;
import com.br.klaus.readium.book.domain.port.OcrGatewayPort;
import com.br.klaus.readium.book.events.BookOcrRequestedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
@Slf4j
public class BookOcrListener {

    private final BookRepositoryPort bookRepository;
    private final OcrGatewayPort ocrGateway;

    @Async("ocrTaskExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void handleBookOcrRequested(BookOcrRequestedEvent event) {
        Book book = bookRepository.findById(event.bookId()).orElse(null);
        if (book == null) {
            log.warn("Livro {} não encontrado para processamento OCR.", event.bookId());
            return;
        }

        book.markOcrRunning();
        bookRepository.save(book);

        try {
            OcrGatewayResult result = ocrGateway.process(book);
            book.markOcrDone(result.score(), result.processedFilePath());
            log.info("OCR finalizado para livro {} com score {}", book.getId(), result.score());
        } catch (Exception ex) {
            book.markOcrFailed();
            log.error("Falha no OCR do livro {}", book.getId(), ex);
        }

        bookRepository.save(book);
    }
}
