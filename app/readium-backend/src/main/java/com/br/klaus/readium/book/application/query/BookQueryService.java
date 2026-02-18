package com.br.klaus.readium.book.application.query;

import com.br.klaus.readium.book.Book;
import com.br.klaus.readium.book.BookRepository;
import com.br.klaus.readium.book.BookSpecifications;
import com.br.klaus.readium.book.application.support.OcrRunningRecoveryService;
import com.br.klaus.readium.book.dto.BookFilterDTO;
import com.br.klaus.readium.book.dto.BookOcrStatusResponseDTO;
import com.br.klaus.readium.book.dto.BookResponseDTO;
import com.br.klaus.readium.book.dto.BookTextLayerQualityResponseDTO;
import com.br.klaus.readium.exception.BookNotFoundException;
import com.br.klaus.readium.storage.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BookQueryService {

    private final BookRepository repository;
    private final FileStorageService storageService;
    private final OcrRunningRecoveryService ocrRunningRecoveryService;

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

        return repository.findAll(spec, pageable).map(BookResponseDTO::fromEntity);
    }

    @Transactional(readOnly = true)
    public BookResponseDTO findById(Long id) {
        return repository.findById(id)
                .map(BookResponseDTO::fromEntity)
                .orElseThrow(() -> new BookNotFoundException("Livro com ID " + id + " nao encontrado."));
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
    public BookOcrStatusResponseDTO getOcrStatus(Long bookId) {
        Book book = repository.findById(bookId)
                .orElseThrow(() -> new BookNotFoundException("Livro com ID " + bookId + " nao encontrado."));

        ocrRunningRecoveryService.recoverIfStale(book);
        return BookOcrStatusResponseDTO.fromEntity(book);
    }

    @Transactional(readOnly = true)
    public BookTextLayerQualityResponseDTO getTextLayerQuality(Long bookId) {
        Book book = repository.findById(bookId)
                .orElseThrow(() -> new BookNotFoundException("Livro com ID " + bookId + " nao encontrado."));

        return BookTextLayerQualityResponseDTO.fromEntity(book);
    }
}
