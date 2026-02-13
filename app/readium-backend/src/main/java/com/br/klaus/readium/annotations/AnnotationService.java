package com.br.klaus.readium.annotations;

import com.br.klaus.readium.annotations.dto.AnnotationRequestDTO;
import com.br.klaus.readium.annotations.dto.AnnotationResponseDTO;
import com.br.klaus.readium.annotations.dto.UpdateAnnotationRequestDTO;
import com.br.klaus.readium.book.BookRepository;
import com.br.klaus.readium.event.BookDeletedEvent;
import com.br.klaus.readium.exception.AnnotationNotFoundException;
import com.br.klaus.readium.exception.BookNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnnotationService {

    private static final int DEFAULT_PAGE_SIZE = 200;
    private static final int MAX_PAGE_SIZE = 500;

    private final AnnotationRepository repository;
    private final BookRepository bookRepository;

    @Transactional
    public AnnotationResponseDTO create(AnnotationRequestDTO req) {
        if (!bookRepository.existsById(req.bookId())) {
            throw new BookNotFoundException("Livro com ID " + req.bookId() + " nao encontrado.");
        }

        Annotation annotation = Annotation.from(req);

        repository.save(annotation);
        return AnnotationResponseDTO.fromEntity(annotation);
    }

    @Transactional(readOnly = true)
    public List<AnnotationResponseDTO> findAll(int resultPage, int size) {
        return repository.findAll(PageRequest.of(Math.max(resultPage, 0), sanitizePageSize(size)))
                .getContent()
                .stream()
                .map(AnnotationResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AnnotationResponseDTO> findByBookAndPage(Long bookId, int page, int resultPage, int size) {
        if (!bookRepository.existsById(bookId)) {
            throw new BookNotFoundException("Livro com ID " + bookId + " nao encontrado.");
        }

        return repository.findByBookIdAndPage(
                        bookId,
                        page,
                        PageRequest.of(Math.max(resultPage, 0), sanitizePageSize(size))
                )
                .getContent()
                .stream()
                .map(AnnotationResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AnnotationResponseDTO> findByBookId(Long bookId, int resultPage, int size) {
        if (!bookRepository.existsById(bookId)) {
            throw new BookNotFoundException("Livro com ID " + bookId + " nao encontrado.");
        }

        return repository.findByBookId(bookId, PageRequest.of(Math.max(resultPage, 0), sanitizePageSize(size)))
                .getContent()
                .stream()
                .map(AnnotationResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public AnnotationResponseDTO update(Long id, UpdateAnnotationRequestDTO req) {
        Annotation annotation = repository.findById(id)
                .orElseThrow(() -> new AnnotationNotFoundException("Anotacao com ID " + id + " nao encontrada."));

        annotation.merge(req);

        repository.save(annotation);
        return AnnotationResponseDTO.fromEntity(annotation);
    }

    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new AnnotationNotFoundException("Anotacao com ID " + id + " nao encontrada para delecao.");
        }
        repository.deleteById(id);
    }

    @EventListener
    @Transactional
    public void onBookDeleted(BookDeletedEvent event) {
        List<Annotation> annotations = repository.findByBookId(event.id());
        repository.deleteAll(annotations);
    }

    private int sanitizePageSize(int requestedSize) {
        if (requestedSize <= 0) {
            return DEFAULT_PAGE_SIZE;
        }
        return Math.min(requestedSize, MAX_PAGE_SIZE);
    }
}
