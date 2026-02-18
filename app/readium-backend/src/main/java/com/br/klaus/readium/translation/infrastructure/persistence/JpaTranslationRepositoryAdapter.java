package com.br.klaus.readium.translation.infrastructure.persistence;

import com.br.klaus.readium.translation.domain.model.Translation;
import com.br.klaus.readium.translation.domain.port.TranslationRepositoryPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class JpaTranslationRepositoryAdapter implements TranslationRepositoryPort {

    private final TranslationJpaRepository repository;

    @Override
    public List<Translation> findByBookId(Long bookId) {
        return repository.findByBookId(bookId);
    }

    @Override
    public List<Translation> findByBookIdIsNull() {
        return repository.findByBookIdIsNull();
    }

    @Override
    public Optional<Translation> findByBookIdAndOriginalText(Long bookId, String originalText) {
        return repository.findByBookIdAndOriginalText(bookId, originalText);
    }

    @Override
    public Optional<Translation> findByBookIdIsNullAndOriginalText(String originalText) {
        return repository.findByBookIdIsNullAndOriginalText(originalText);
    }

    @Override
    public Translation save(Translation translation) {
        return repository.save(translation);
    }
}
