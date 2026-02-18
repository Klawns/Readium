package com.br.klaus.readium.annotations.domain.port;

import com.br.klaus.readium.annotations.Annotation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface AnnotationRepositoryPort {

    Page<Annotation> findAll(Pageable pageable);

    Page<Annotation> findByBookIdAndPage(Long bookId, int page, Pageable pageable);

    Page<Annotation> findByBookId(Long bookId, Pageable pageable);

    List<Annotation> findByBookId(Long bookId);

    Optional<Annotation> findById(Long id);

    Annotation save(Annotation annotation);

    void delete(Annotation annotation);

    void deleteAll(List<Annotation> annotations);
}