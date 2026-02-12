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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnnotationService {

    private final AnnotationRepository repository;
    private final BookRepository bookRepository;

    @Transactional
    public AnnotationResponseDTO create(AnnotationRequestDTO req) {
        if (!bookRepository.existsById(req.bookId())) {
            throw new BookNotFoundException("Livro com ID " + req.bookId() + " não encontrado.");
        }

        // Criação via Factory Method (DDD)
        Annotation annotation = Annotation.from(req);

        repository.save(annotation);
        return AnnotationResponseDTO.fromEntity(annotation);
    }

    @Transactional(readOnly = true)
    public List<AnnotationResponseDTO> findAll() {
        return repository.findAll().stream()
                .map(AnnotationResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AnnotationResponseDTO> findByBookAndPage(Long bookId, int page) {
        if (!bookRepository.existsById(bookId)) {
            throw new BookNotFoundException("Livro com ID " + bookId + " não encontrado.");
        }
        return repository.findByBookIdAndPage(bookId, page).stream()
                .map(AnnotationResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<AnnotationResponseDTO> findByBookId(Long bookId) {
        if (!bookRepository.existsById(bookId)) {
            throw new BookNotFoundException("Livro com ID " + bookId + " não encontrado.");
        }
        return repository.findByBookId(bookId).stream()
                .map(AnnotationResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public AnnotationResponseDTO update(Long id, UpdateAnnotationRequestDTO req) {
        Annotation annotation = repository.findById(id)
                .orElseThrow(() -> new AnnotationNotFoundException("Anotação com ID " + id + " não encontrada."));

        // Atualização via Domain Method (DDD)
        annotation.merge(req);
        
        repository.save(annotation);
        return AnnotationResponseDTO.fromEntity(annotation);
    }

    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new AnnotationNotFoundException("Anotação com ID " + id + " não encontrada para deleção.");
        }
        repository.deleteById(id);
    }

    @EventListener
    @Transactional
    public void onBookDeleted(BookDeletedEvent event) {
        List<Annotation> annotations = repository.findByBookId(event.id());
        repository.deleteAll(annotations);
    }
}
