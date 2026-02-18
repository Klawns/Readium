package com.br.klaus.readium.book.application.query;

import com.br.klaus.readium.book.domain.model.Book;
import com.br.klaus.readium.book.application.support.OcrRunningRecoveryService;
import com.br.klaus.readium.book.api.BookOcrStatusResponseMapper;
import com.br.klaus.readium.book.api.BookResponseMapper;
import com.br.klaus.readium.book.api.BookTextLayerQualityResponseMapper;
import com.br.klaus.readium.book.domain.port.BookRepositoryPort;
import com.br.klaus.readium.book.domain.port.BookStoragePort;
import com.br.klaus.readium.book.api.dto.BookFilterDTO;
import com.br.klaus.readium.book.api.dto.BookOcrStatusResponseDTO;
import com.br.klaus.readium.book.api.dto.BookResponseDTO;
import com.br.klaus.readium.book.api.dto.BookTextLayerQualityResponseDTO;
import com.br.klaus.readium.exception.BookNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BookQueryService {

    private final BookRepositoryPort repository;
    private final BookStoragePort storageService;
    private final OcrRunningRecoveryService ocrRunningRecoveryService;

    @Transactional(readOnly = true)
    public Page<BookResponseDTO> findAll(BookFilterDTO filter, Pageable pageable) {
        Book.BookStatus status = null;
        if (filter.status() != null && !filter.status().isBlank() && !filter.status().equals("ALL")) {
            try {
                status = Book.BookStatus.valueOf(filter.status().toUpperCase());
            } catch (IllegalArgumentException e) {
                // Ignore invalid status filter.
            }
        }

        return repository.findAll(status, filter.query(), pageable).map(BookResponseMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public BookResponseDTO findById(Long id) {
        return repository.findById(id)
                .map(BookResponseMapper::toResponse)
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
        return BookOcrStatusResponseMapper.toResponse(book);
    }

    @Transactional(readOnly = true)
    public BookTextLayerQualityResponseDTO getTextLayerQuality(Long bookId) {
        Book book = repository.findById(bookId)
                .orElseThrow(() -> new BookNotFoundException("Livro com ID " + bookId + " nao encontrado."));

        return BookTextLayerQualityResponseMapper.toResponse(book);
    }
}

