package com.br.klaus.readium.annotations;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnnotationRepository extends JpaRepository<Annotation, Long> {

    List<Annotation> findByBookIdAndPage(Long bookId, int page);
    
    List<Annotation> findByBookId(Long bookId);
}
