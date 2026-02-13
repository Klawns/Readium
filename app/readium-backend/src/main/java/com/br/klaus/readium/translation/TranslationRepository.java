package com.br.klaus.readium.translation;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TranslationRepository extends JpaRepository<Translation, Long> {

    List<Translation> findByBookId(Long bookId);

    List<Translation> findByBookIdIsNull();

    Optional<Translation> findByBookIdAndOriginalText(Long bookId, String originalText);

    Optional<Translation> findByBookIdIsNullAndOriginalText(String originalText);
}
