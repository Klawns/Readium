package com.br.klaus.readium.annotations.application.query;

import com.br.klaus.readium.annotations.AnnotationResponseMapper;
import com.br.klaus.readium.annotations.domain.port.AnnotationRepositoryPort;
import com.br.klaus.readium.annotations.dto.AnnotationResponseDTO;
import com.br.klaus.readium.book.api.BookExistenceService;
import com.br.klaus.readium.config.CacheNames;
import com.br.klaus.readium.exception.BookNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AnnotationQueryService {

    private static final int DEFAULT_PAGE_SIZE = 200;
    private static final int MAX_PAGE_SIZE = 500;

    private final AnnotationRepositoryPort repository;
    private final BookExistenceService bookExistenceService;

    @Transactional(readOnly = true)
    public List<AnnotationResponseDTO> findAll(int resultPage, int size) {
        return AnnotationResponseMapper.fromPage(
                repository.findAll(PageRequest.of(Math.max(resultPage, 0), sanitizePageSize(size)))
        );
    }

    @Transactional(readOnly = true)
    @Cacheable(cacheNames = CacheNames.ANNOTATIONS_BY_BOOK_PAGE, key = "#bookId + '::' + #page + '::' + #resultPage + '::' + #size")
    public List<AnnotationResponseDTO> findByBookAndPage(Long bookId, int page, int resultPage, int size) {
        if (!bookExistenceService.existsById(bookId)) {
            throw new BookNotFoundException("Livro com ID " + bookId + " nao encontrado.");
        }

        return AnnotationResponseMapper.fromPage(
                repository.findByBookIdAndPage(
                        bookId,
                        page,
                        PageRequest.of(Math.max(resultPage, 0), sanitizePageSize(size))
                )
        );
    }

    @Transactional(readOnly = true)
    @Cacheable(cacheNames = CacheNames.ANNOTATIONS_BY_BOOK, key = "#bookId + '::' + #resultPage + '::' + #size")
    public List<AnnotationResponseDTO> findByBookId(Long bookId, int resultPage, int size) {
        if (!bookExistenceService.existsById(bookId)) {
            throw new BookNotFoundException("Livro com ID " + bookId + " nao encontrado.");
        }

        return AnnotationResponseMapper.fromPage(
                repository.findByBookId(bookId, PageRequest.of(Math.max(resultPage, 0), sanitizePageSize(size)))
        );
    }

    private int sanitizePageSize(int requestedSize) {
        if (requestedSize <= 0) {
            return DEFAULT_PAGE_SIZE;
        }
        return Math.min(requestedSize, MAX_PAGE_SIZE);
    }
}
