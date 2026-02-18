package com.br.klaus.readium.annotations.infrastructure.persistence;

import com.br.klaus.readium.annotations.Annotation;
import com.br.klaus.readium.annotations.domain.port.AnnotationRepositoryPort;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class JpaAnnotationRepositoryAdapter implements AnnotationRepositoryPort {

    private final AnnotationJpaRepository repository;

    @Override
    public Page<Annotation> findAll(Pageable pageable) {
        return repository.findAll(pageable);
    }

    @Override
    public Page<Annotation> findByBookIdAndPage(Long bookId, int page, Pageable pageable) {
        return repository.findByBookIdAndPage(bookId, page, pageable);
    }

    @Override
    public Page<Annotation> findByBookId(Long bookId, Pageable pageable) {
        return repository.findByBookId(bookId, pageable);
    }

    @Override
    public List<Annotation> findByBookId(Long bookId) {
        return repository.findByBookId(bookId);
    }

    @Override
    public Optional<Annotation> findById(Long id) {
        return repository.findById(id);
    }

    @Override
    public Annotation save(Annotation annotation) {
        return repository.save(annotation);
    }

    @Override
    public void delete(Annotation annotation) {
        repository.delete(annotation);
    }

    @Override
    public void deleteAll(List<Annotation> annotations) {
        repository.deleteAll(annotations);
    }
}