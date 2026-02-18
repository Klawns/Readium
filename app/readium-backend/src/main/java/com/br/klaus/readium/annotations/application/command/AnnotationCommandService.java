package com.br.klaus.readium.annotations.application.command;

import com.br.klaus.readium.annotations.Annotation;
import com.br.klaus.readium.annotations.domain.port.AnnotationRepositoryPort;
import com.br.klaus.readium.annotations.dto.AnnotationRequestDTO;
import com.br.klaus.readium.annotations.dto.AnnotationResponseDTO;
import com.br.klaus.readium.annotations.dto.UpdateAnnotationRequestDTO;
import com.br.klaus.readium.book.api.BookExistenceService;
import com.br.klaus.readium.config.CacheNames;
import com.br.klaus.readium.event.BookDeletedEvent;
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

        Annotation annotation = Annotation.from(req);
        repository.save(annotation);
        return AnnotationResponseDTO.fromEntity(annotation);
    }

    @Transactional
    @Caching(evict = {
            @CacheEvict(cacheNames = CacheNames.ANNOTATIONS_BY_BOOK, allEntries = true),
            @CacheEvict(cacheNames = CacheNames.ANNOTATIONS_BY_BOOK_PAGE, allEntries = true)
    })
    public AnnotationResponseDTO update(Long id, UpdateAnnotationRequestDTO req) {
        Annotation annotation = repository.findById(id)
                .orElseThrow(() -> new AnnotationNotFoundException("Anotacao com ID " + id + " nao encontrada."));

        annotation.merge(req);
        repository.save(annotation);
        return AnnotationResponseDTO.fromEntity(annotation);
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
}
