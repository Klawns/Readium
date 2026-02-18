package com.br.klaus.readium.annotations.infrastructure.persistence;

import com.br.klaus.readium.annotations.domain.model.Annotation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AnnotationJpaRepository extends JpaRepository<Annotation, Long> {

    List<Annotation> findByBookIdAndPage(Long bookId, int page);

    Page<Annotation> findByBookIdAndPage(Long bookId, int page, Pageable pageable);

    List<Annotation> findByBookId(Long bookId);

    Page<Annotation> findByBookId(Long bookId, Pageable pageable);
}
