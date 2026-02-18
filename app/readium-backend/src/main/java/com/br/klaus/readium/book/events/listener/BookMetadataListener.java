package com.br.klaus.readium.book.events.listener;

import com.br.klaus.readium.book.domain.model.Book;
import com.br.klaus.readium.book.domain.port.BookRepositoryPort;
import com.br.klaus.readium.book.domain.port.BookStoragePort;
import com.br.klaus.readium.book.events.BookCreatedEvent;
import io.documentnode.epub4j.epub.EpubReader;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDDocumentInformation;
import org.apache.pdfbox.rendering.ImageType;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;

@Component
@RequiredArgsConstructor
@Slf4j
public class BookMetadataListener {
    private static final int METADATA_SAVE_MAX_ATTEMPTS = 2;

    private final BookRepositoryPort bookRepository;
    private final BookStoragePort storageService;

    @Async("metadataTaskExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void handleBookCreated(BookCreatedEvent event) {
        log.info("Iniciando processamento de metadados para o livro ID: {}", event.id());

        Book book = bookRepository.findById(event.id()).orElse(null);
        if (book == null) {
            log.warn("Livro {} nao encontrado para processamento de metadados.", event.id());
            return;
        }

        try {
            File file = new File(book.getFilePath());
            if (!file.exists()) {
                log.error("Arquivo fisico nao encontrado: {}", book.getFilePath());
                return;
            }

            if (book.getBookFormat() == Book.BookFormat.PDF) {
                processPdf(book, file);
            } else if (book.getBookFormat() == Book.BookFormat.EPUB) {
                processEpub(book, file);
            }

            saveProcessedMetadata(book);
            log.info("Metadados processados com sucesso para o livro {}", book.getId());
        } catch (OptimisticLockingFailureException e) {
            log.error("Conflito de versao ao salvar metadados do livro {} apos tentativas de retry.", event.id(), e);
        } catch (Exception e) {
            log.error("Erro ao processar metadados do livro {}", event.id(), e);
        }
    }

    private void saveProcessedMetadata(Book processedBook) {
        Book candidate = processedBook;
        for (int attempt = 1; attempt <= METADATA_SAVE_MAX_ATTEMPTS; attempt++) {
            try {
                bookRepository.save(candidate);
                return;
            } catch (OptimisticLockingFailureException ex) {
                if (attempt >= METADATA_SAVE_MAX_ATTEMPTS) {
                    throw ex;
                }

                log.warn("Conflito otimista ao salvar metadados do livro {}. Recarregando entidade para retry.",
                        processedBook.getId());
                Book latest = bookRepository.findById(processedBook.getId()).orElse(null);
                if (latest == null) {
                    log.warn("Livro {} nao encontrado durante retry de metadados.", processedBook.getId());
                    return;
                }
                applyProcessedMetadata(processedBook, latest);
                candidate = latest;
            }
        }
    }

    private void applyProcessedMetadata(Book source, Book target) {
        target.setAuthor(source.getAuthor());
        target.setPages(source.getPages());
        target.setCoverPath(source.getCoverPath());
        target.setHasCover(source.isHasCover());
    }

    private void processPdf(Book book, File file) throws IOException {
        try (PDDocument document = Loader.loadPDF(file)) {
            PDDocumentInformation info = document.getDocumentInformation();
            if (info.getAuthor() != null && !info.getAuthor().isBlank()) {
                book.setAuthor(info.getAuthor());
            }
            book.setPages(document.getNumberOfPages());

            PDFRenderer renderer = new PDFRenderer(document);
            BufferedImage image = renderer.renderImage(0, 1.0f, ImageType.RGB);

            try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
                ImageIO.write(image, "jpg", baos);
                String coverPath = storageService.saveCover(baos.toByteArray(), "jpg");
                book.setCoverPath(coverPath);
                book.setHasCover(true);
            }
        }
    }

    private void processEpub(Book book, File file) throws IOException {
        EpubReader epubReader = new EpubReader();
        io.documentnode.epub4j.domain.Book epub;
        try (FileInputStream stream = new FileInputStream(file)) {
            epub = epubReader.readEpub(stream);
        }

        if (!epub.getMetadata().getAuthors().isEmpty()) {
            String authorName = epub.getMetadata().getAuthors().get(0).getFirstname() + " "
                    + epub.getMetadata().getAuthors().get(0).getLastname();
            book.setAuthor(authorName.trim());
        }

        if (epub.getCoverImage() != null) {
            String coverPath = storageService.saveCover(epub.getCoverImage().getData(), "jpg");
            book.setCoverPath(coverPath);
            book.setHasCover(true);
        }

        book.setPages(epub.getSpine().size());
    }
}

