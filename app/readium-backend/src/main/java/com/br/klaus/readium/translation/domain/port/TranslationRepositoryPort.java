package com.br.klaus.readium.translation.domain.port;

import com.br.klaus.readium.translation.Translation;

import java.util.List;
import java.util.Optional;

public interface TranslationRepositoryPort {

    List<Translation> findByBookId(Long bookId);

    List<Translation> findByBookIdIsNull();

    Optional<Translation> findByBookIdAndOriginalText(Long bookId, String originalText);

    Optional<Translation> findByBookIdIsNullAndOriginalText(String originalText);

    Translation save(Translation translation);
}