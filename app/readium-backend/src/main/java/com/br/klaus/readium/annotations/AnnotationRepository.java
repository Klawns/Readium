package com.br.klaus.readium.annotations;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnnotationRepository extends JpaRepository<Annotation, Long> {

    List<Annotation> findByBookIdAndPage(Long bookId, int page);

    Page<Annotation> findByBookIdAndPage(Long bookId, int page, Pageable pageable);
    
    List<Annotation> findByBookId(Long bookId);

    Page<Annotation> findByBookId(Long bookId, Pageable pageable);
}
