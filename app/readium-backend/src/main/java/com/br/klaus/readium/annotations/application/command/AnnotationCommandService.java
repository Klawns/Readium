package com.br.klaus.readium.annotations.application.command;

import com.br.klaus.readium.annotations.Annotation;
import com.br.klaus.readium.annotations.Rect;
import com.br.klaus.readium.annotations.api.AnnotationResponseMapper;
import com.br.klaus.readium.annotations.api.dto.AnnotationRequestDTO;
import com.br.klaus.readium.annotations.api.dto.AnnotationResponseDTO;
import com.br.klaus.readium.annotations.api.dto.UpdateAnnotationRequestDTO;
import com.br.klaus.readium.annotations.domain.port.AnnotationRepositoryPort;
import com.br.klaus.readium.book.api.BookExistenceService;
import com.br.klaus.readium.config.CacheNames;
import com.br.klaus.readium.book.events.BookDeletedEvent;
import com.br.klaus.readium.exception.AnnotationNotFoundException;
import com.br.klaus.readium.exception.BookNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Caching;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AnnotationCommandService {

    private final AnnotationRepositoryPort repository;
    private final BookExistenceService bookExistenceService;

    @Transactional
    @Caching(evict = {
            @CacheEvict(cacheNames = CacheNames.ANNOTATIONS_BY_BOOK, allEntries = true),
            @CacheEvict(cacheNames = CacheNames.ANNOTATIONS_BY_BOOK_PAGE, allEntries = true)
    })
    public AnnotationResponseDTO create(AnnotationRequestDTO req) {
        if (!bookExistenceService.existsById(req.bookId())) {
            throw new BookNotFoundException("Livro com ID " + req.bookId() + " nao encontrado.");
        }

        Annotation annotation = Annotation.create(
                req.bookId(),
                req.page(),
                toRects(req),
                req.color(),
                req.selectedText(),
                req.note()
        );
        repository.save(annotation);
        return AnnotationResponseMapper.toResponse(annotation);
    }

    @Transactional
    @Caching(evict = {
            @CacheEvict(cacheNames = CacheNames.ANNOTATIONS_BY_BOOK, allEntries = true),
            @CacheEvict(cacheNames = CacheNames.ANNOTATIONS_BY_BOOK_PAGE, allEntries = true)
    })
    public AnnotationResponseDTO update(Long id, UpdateAnnotationRequestDTO req) {
        Annotation annotation = repository.findById(id)
                .orElseThrow(() -> new AnnotationNotFoundException("Anotacao com ID " + id + " nao encontrada."));

        annotation.update(req.color(), req.note());
        repository.save(annotation);
        return AnnotationResponseMapper.toResponse(annotation);
    }

    @Transactional
    @Caching(evict = {
            @CacheEvict(cacheNames = CacheNames.ANNOTATIONS_BY_BOOK, allEntries = true),
            @CacheEvict(cacheNames = CacheNames.ANNOTATIONS_BY_BOOK_PAGE, allEntries = true)
    })
    public void delete(Long id) {
        Annotation annotation = repository.findById(id)
                .orElseThrow(() -> new AnnotationNotFoundException("Anotacao com ID " + id + " nao encontrada para delecao."));
        repository.delete(annotation);
    }

    @EventListener
    @Transactional
    @Caching(evict = {
            @CacheEvict(cacheNames = CacheNames.ANNOTATIONS_BY_BOOK, allEntries = true),
            @CacheEvict(cacheNames = CacheNames.ANNOTATIONS_BY_BOOK_PAGE, allEntries = true)
    })
    public void onBookDeleted(BookDeletedEvent event) {
        List<Annotation> annotations = repository.findByBookId(event.id());
        repository.deleteAll(annotations);
    }

    private List<Rect> toRects(AnnotationRequestDTO req) {
        if (req.rects() == null) {
            return List.of();
        }
        return req.rects().stream()
                .map(rect -> new Rect(rect.x(), rect.y(), rect.width(), rect.height()))
                .toList();
    }
}
