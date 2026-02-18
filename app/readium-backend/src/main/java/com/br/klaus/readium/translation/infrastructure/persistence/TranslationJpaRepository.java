package com.br.klaus.readium.translation.infrastructure.persistence;

import com.br.klaus.readium.translation.domain.model.Translation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TranslationJpaRepository extends JpaRepository<Translation, Long> {

    List<Translation> findByBookId(Long bookId);

    List<Translation> findByBookIdIsNull();

    Optional<Translation> findByBookIdAndOriginalText(Long bookId, String originalText);

    Optional<Translation> findByBookIdIsNullAndOriginalText(String originalText);
}
