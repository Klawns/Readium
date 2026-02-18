package com.br.klaus.readium.book;

import com.br.klaus.readium.book.dto.BookFilterDTO;
import com.br.klaus.readium.book.dto.BookOcrStatusResponseDTO;
import com.br.klaus.readium.book.dto.BookResponseDTO;
import com.br.klaus.readium.book.dto.BookTextLayerQualityResponseDTO;
import com.br.klaus.readium.book.dto.UpdateBookStatusRequestDTO;
import com.br.klaus.readium.book.dto.UpdateProgressRequestDTO;
import com.br.klaus.readium.event.BookCreatedEvent;
import com.br.klaus.readium.event.BookDeletedEvent;
import com.br.klaus.readium.event.BookOcrRequestedEvent;
import com.br.klaus.readium.event.BookProgressUpdatedEvent;
import com.br.klaus.readium.exception.BookNotFoundException;
import com.br.klaus.readium.exception.UnsupportedFileFormatException;
import com.br.klaus.readium.storage.FileStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.core.io.Resource;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
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
public class BookService {

    private final BookRepository repository;
    private final ApplicationEventPublisher eventPublisher;
    private final FileStorageService storageService;

    @Value("${app.ocr.running-timeout-seconds:2400}")
    private long ocrRunningTimeoutSeconds;

    @Transactional
    public BookResponseDTO save(MultipartFile file) {
        String originalFilename = StringUtils.cleanPath(Objects.toString(file.getOriginalFilename(), ""));
        String extension = StringUtils.getFilenameExtension(originalFilename);

        if (originalFilename.isBlank() || !isSupportedExtension(extension)) {
            throw new UnsupportedFileFormatException("Formato de arquivo nao suportado. Apenas .pdf e .epub sao permitidos.");
        }

        FileStorageService.StoredFile storedFile = storageService.saveWithChecksum(file);
        Book existingBook = repository.findByFileHash(storedFile.sha256()).orElse(null);
        if (existingBook != null) {
            storageService.delete(storedFile.path());
            log.info("Upload duplicado detectado para hash {}. Reutilizando livro {}.", storedFile.sha256(), existingBook.getId());
            return BookResponseDTO.fromEntity(existingBook);
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
                return BookResponseDTO.fromEntity(duplicatedBook);
            }
            throw ex;
        } catch (RuntimeException ex) {
            storageService.delete(storedFile.path());
            throw ex;
        }

        eventPublisher.publishEvent(new BookCreatedEvent(savedBook.getId(), savedBook.getTitle()));

        return BookResponseDTO.fromEntity(savedBook);
    }

    private boolean isSupportedExtension(String extension) {
        if (extension == null || extension.isBlank()) {
            return false;
        }

        String normalized = extension.toLowerCase(Locale.ROOT);
        return "pdf".equals(normalized) || "epub".equals(normalized);
    }

    @Transactional(readOnly = true)
    public Page<BookResponseDTO> findAll(BookFilterDTO filter, Pageable pageable) {
        Specification<Book> spec = (root, query, criteriaBuilder) -> criteriaBuilder.conjunction();

        if (filter.status() != null && !filter.status().isBlank() && !filter.status().equals("ALL")) {
            try {
                Book.BookStatus status = Book.BookStatus.valueOf(filter.status().toUpperCase());
                spec = spec.and(BookSpecifications.hasStatus(status));
            } catch (IllegalArgumentException e) {
                // Ignore invalid status filter.
            }
        }

        if (filter.query() != null && !filter.query().isBlank()) {
            spec = spec.and(BookSpecifications.containsText(filter.query()));
        }

        return repository.findAll(spec, pageable)
                .map(BookResponseDTO::fromEntity);
    }

    @Transactional(readOnly = true)
    public BookResponseDTO findById(Long id) {
        return repository.findById(id)
                .map(BookResponseDTO::fromEntity)
                .orElseThrow(() -> new BookNotFoundException("Livro com ID " + id + " nao encontrado."));
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

    @Transactional(readOnly = true)
    public Resource getBookFile(Long id) {
        Book book = repository.findById(id)
                .orElseThrow(() -> new BookNotFoundException("Livro com ID " + id + " nao encontrado."));

        String filePath = book.getFilePath();
        if (book.getOcrStatus() == Book.OcrStatus.DONE
                && book.getOcrFilePath() != null
                && !book.getOcrFilePath().isBlank()) {
            filePath = book.getOcrFilePath();
        }

        return storageService.load(filePath);
    }

    @Transactional(readOnly = true)
    public Resource getBookCover(Long id) {
        Book book = repository.findById(id)
                .orElseThrow(() -> new BookNotFoundException("Livro com ID " + id + " nao encontrado."));

        if (!book.isHasCover() || book.getCoverPath() == null) {
            throw new BookNotFoundException("Capa nao encontrada para o livro com ID " + id);
        }

        return storageService.load(book.getCoverPath());
    }

    @Transactional
    public void queueOcr(Long bookId) {
        Book book = repository.findById(bookId)
                .orElseThrow(() -> new BookNotFoundException("Livro com ID " + bookId + " nao encontrado."));

        recoverStaleRunningOcr(book);

        if (book.getOcrStatus() == Book.OcrStatus.RUNNING) {
            return;
        }

        book.markOcrQueued();
        repository.save(book);

        eventPublisher.publishEvent(new BookOcrRequestedEvent(bookId));
    }

    @Transactional
    public BookOcrStatusResponseDTO getOcrStatus(Long bookId) {
        Book book = repository.findById(bookId)
                .orElseThrow(() -> new BookNotFoundException("Livro com ID " + bookId + " nao encontrado."));

        recoverStaleRunningOcr(book);
        return BookOcrStatusResponseDTO.fromEntity(book);
    }

    @Transactional(readOnly = true)
    public BookTextLayerQualityResponseDTO getTextLayerQuality(Long bookId) {
        Book book = repository.findById(bookId)
                .orElseThrow(() -> new BookNotFoundException("Livro com ID " + bookId + " nao encontrado."));

        return BookTextLayerQualityResponseDTO.fromEntity(book);
    }

    private void recoverStaleRunningOcr(Book book) {
        if (!isOcrRunningStale(book)) {
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

    private boolean isOcrRunningStale(Book book) {
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
