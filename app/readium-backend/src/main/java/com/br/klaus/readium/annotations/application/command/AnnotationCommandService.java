package com.br.klaus.readium.annotations.application.command;

import com.br.klaus.readium.annotations.domain.model.Annotation;
import com.br.klaus.readium.annotations.domain.model.Rect;
import com.br.klaus.readium.annotations.api.AnnotationResponseMapper;
import com.br.klaus.readium.annotations.api.dto.AnnotationRequestDTO;
import com.br.klaus.readium.annotations.api.dto.AnnotationResponseDTO;
import com.br.klaus.readium.annotations.api.dto.UpdateAnnotationRequestDTO;
import com.br.klaus.readium.annotations.domain.port.AnnotationRepositoryPort;
import com.br.klaus.readium.book.api.BookExistenceService;
import com.br.klaus.readium.book.events.BookDeletedEvent;
import com.br.klaus.readium.exception.AnnotationNotFoundException;
import com.br.klaus.readium.exception.BookNotFoundException;
import com.br.klaus.readium.sync.application.OperationIdempotencyService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AnnotationCommandService {
    private static final String CREATE_OPERATION_SCOPE = "annotation-create";
    private static final String UPDATE_OPERATION_SCOPE = "annotation-update";
    private static final String DELETE_OPERATION_SCOPE = "annotation-delete";

    private final AnnotationRepositoryPort repository;
    private final BookExistenceService bookExistenceService;
    private final OperationIdempotencyService operationIdempotencyService;

    @Transactional
    @EvictAnnotationCaches
    public AnnotationResponseDTO create(AnnotationRequestDTO req, String operationId) {
        OperationIdempotencyService.OperationClaim claim = operationIdempotencyService.claim(
                CREATE_OPERATION_SCOPE,
                operationId
        );
        if (!claim.shouldProcess()) {
            return resolveDuplicatedCreate(claim);
        }

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
        operationIdempotencyService.attachResourceId(claim, annotation.getId());
        return AnnotationResponseMapper.toResponse(annotation);
    }

    @Transactional
    @EvictAnnotationCaches
    public AnnotationResponseDTO update(Long id, UpdateAnnotationRequestDTO req, String operationId) {
        OperationIdempotencyService.OperationClaim claim = operationIdempotencyService.claim(
                UPDATE_OPERATION_SCOPE,
                operationId
        );
        if (!claim.shouldProcess()) {
            return repository.findById(id)
                    .map(AnnotationResponseMapper::toResponse)
                    .orElseThrow(() -> new AnnotationNotFoundException("Anotacao com ID " + id + " nao encontrada."));
        }

        Annotation annotation = repository.findById(id)
                .orElseThrow(() -> new AnnotationNotFoundException("Anotacao com ID " + id + " nao encontrada."));

        annotation.update(req.color(), req.note());
        repository.save(annotation);
        return AnnotationResponseMapper.toResponse(annotation);
    }

    @Transactional
    @EvictAnnotationCaches
    public void delete(Long id, String operationId) {
        OperationIdempotencyService.OperationClaim claim = operationIdempotencyService.claim(
                DELETE_OPERATION_SCOPE,
                operationId
        );
        if (!claim.shouldProcess()) {
            return;
        }

        Annotation annotation = repository.findById(id)
                .orElseThrow(() -> new AnnotationNotFoundException("Anotacao com ID " + id + " nao encontrada para delecao."));
        repository.delete(annotation);
    }

    @EventListener
    @Transactional
    @EvictAnnotationCaches
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

    private AnnotationResponseDTO resolveDuplicatedCreate(OperationIdempotencyService.OperationClaim claim) {
        Long resourceId = claim.resourceId();
        if (resourceId == null) {
            throw new IllegalStateException("Operacao de criacao de anotacao duplicada sem recurso associado.");
        }

        Annotation annotation = repository.findById(resourceId)
                .orElseThrow(() -> new AnnotationNotFoundException("Anotacao com ID " + resourceId + " nao encontrada."));
        return AnnotationResponseMapper.toResponse(annotation);
    }
}
