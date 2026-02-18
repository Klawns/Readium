package com.br.klaus.readium.book.application.command;

import com.br.klaus.readium.book.Book;
import com.br.klaus.readium.book.BookTitleFormatter;
import com.br.klaus.readium.book.application.support.OcrRunningRecoveryService;
import com.br.klaus.readium.book.api.BookResponseMapper;
import com.br.klaus.readium.book.domain.port.BookRepositoryPort;
import com.br.klaus.readium.book.domain.port.BookStoragePort;
import com.br.klaus.readium.book.dto.BookResponseDTO;
import com.br.klaus.readium.book.dto.UpdateBookStatusRequestDTO;
import com.br.klaus.readium.book.dto.UpdateProgressRequestDTO;
import com.br.klaus.readium.event.BookCreatedEvent;
import com.br.klaus.readium.event.BookDeletedEvent;
import com.br.klaus.readium.event.BookOcrRequestedEvent;
import com.br.klaus.readium.event.BookProgressUpdatedEvent;
import com.br.klaus.readium.exception.BookNotFoundException;
import com.br.klaus.readium.exception.UnsupportedFileFormatException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.Locale;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookCommandService {

    private final BookRepositoryPort repository;
    private final ApplicationEventPublisher eventPublisher;
    private final BookStoragePort storageService;
    private final OcrRunningRecoveryService ocrRunningRecoveryService;

    @Transactional
    public BookResponseDTO upload(MultipartFile file) {
        String originalFilename = StringUtils.cleanPath(Objects.toString(file.getOriginalFilename(), ""));
        String extension = StringUtils.getFilenameExtension(originalFilename);

        if (originalFilename.isBlank() || !isSupportedExtension(extension)) {
            throw new UnsupportedFileFormatException("Formato de arquivo nao suportado. Apenas .pdf e .epub sao permitidos.");
        }

        BookStoragePort.StoredFile storedFile = storageService.saveWithChecksum(file);
        Book existingBook = repository.findByFileHash(storedFile.sha256()).orElse(null);
        if (existingBook != null) {
            storageService.delete(storedFile.path());
            log.info("Upload duplicado detectado para hash {}. Reutilizando livro {}.", storedFile.sha256(), existingBook.getId());
            return BookResponseMapper.toResponse(existingBook);
        }

        String title = BookTitleFormatter.fromFilename(originalFilename);
        Book book = Book.create(title, storedFile.path(), originalFilename);
        book.setFileHash(storedFile.sha256());

        Book savedBook;
        try {
            savedBook = repository.save(book);
        } catch (DataIntegrityViolationException ex) {
            storageService.delete(storedFile.path());
            Book duplicatedBook = repository.findByFileHash(storedFile.sha256()).orElse(null);
            if (duplicatedBook != null) {
                log.info("Upload concorrente duplicado para hash {}. Reutilizando livro {}.", storedFile.sha256(), duplicatedBook.getId());
                return BookResponseMapper.toResponse(duplicatedBook);
            }
            throw ex;
        } catch (RuntimeException ex) {
            storageService.delete(storedFile.path());
            throw ex;
        }

        eventPublisher.publishEvent(new BookCreatedEvent(savedBook.getId(), savedBook.getTitle()));
        return BookResponseMapper.toResponse(savedBook);
    }

    @Transactional
    public void deleteById(Long id) {
        Book book = repository.findById(id)
                .orElseThrow(() -> new BookNotFoundException("Livro com ID " + id + " nao encontrado para delecao."));

        storageService.delete(book.getFilePath());
        if (book.getCoverPath() != null) {
            storageService.delete(book.getCoverPath());
        }
        if (book.getOcrFilePath() != null && !book.getOcrFilePath().equals(book.getFilePath())) {
            storageService.delete(book.getOcrFilePath());
        }

        repository.deleteById(id);
        eventPublisher.publishEvent(new BookDeletedEvent(id));
    }

    @Transactional
    public void changeBookStatus(UpdateBookStatusRequestDTO req) {
        Book book = repository.findById(req.bookId())
                .orElseThrow(() -> new BookNotFoundException("Livro com ID " + req.bookId() + " nao encontrado."));

        try {
            Book.BookStatus newStatus = Book.BookStatus.valueOf(req.status());
            book.setBookStatus(newStatus);
            repository.save(book);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Status invalido: " + req.status());
        }
    }

    @Transactional
    public void updateProgress(Long bookId, UpdateProgressRequestDTO req) {
        Book book = repository.findById(bookId)
                .orElseThrow(() -> new BookNotFoundException("Livro com ID " + bookId + " nao encontrado."));

        Integer previousPage = book.getLastReadPage();
        Book.BookStatus previousStatus = book.getBookStatus();

        book.updateReadingProgress(req.page());
        repository.save(book);

        if (!Objects.equals(previousPage, book.getLastReadPage()) || previousStatus != book.getBookStatus()) {
            eventPublisher.publishEvent(new BookProgressUpdatedEvent(
                    book.getId(),
                    book.getLastReadPage(),
                    book.getBookStatus() != null ? book.getBookStatus().name() : null,
                    LocalDateTime.now()
            ));
        }
    }

    @Transactional
    public void queueOcr(Long bookId) {
        Book book = repository.findById(bookId)
                .orElseThrow(() -> new BookNotFoundException("Livro com ID " + bookId + " nao encontrado."));

        ocrRunningRecoveryService.recoverIfStale(book);

        if (book.getOcrStatus() == Book.OcrStatus.RUNNING) {
            return;
        }

        book.markOcrQueued();
        repository.save(book);
        eventPublisher.publishEvent(new BookOcrRequestedEvent(bookId));
    }

    private boolean isSupportedExtension(String extension) {
        if (extension == null || extension.isBlank()) {
            return false;
        }

        String normalized = extension.toLowerCase(Locale.ROOT);
        return "pdf".equals(normalized) || "epub".equals(normalized);
    }
}
