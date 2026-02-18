package com.br.klaus.readium.translation.application.command;

import com.br.klaus.readium.config.CacheNames;
import com.br.klaus.readium.translation.Translation;
import com.br.klaus.readium.translation.api.TranslationResponseMapper;
import com.br.klaus.readium.translation.domain.port.TranslationRepositoryPort;
import com.br.klaus.readium.translation.dto.TranslationRequestDTO;
import com.br.klaus.readium.translation.dto.TranslationResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TranslationCommandService {

    private final TranslationRepositoryPort repository;

    @Transactional
    @Caching(evict = {
            @CacheEvict(cacheNames = CacheNames.TRANSLATIONS_BY_BOOK, allEntries = true, condition = "#req == null || #req.bookId() == null"),
            @CacheEvict(cacheNames = CacheNames.TRANSLATIONS_BY_BOOK, key = "#req.bookId()", condition = "#req != null && #req.bookId() != null")
    })
    public TranslationResponseDTO save(TranslationRequestDTO req) {
        if (req == null) {
            throw new IllegalArgumentException("translation request is required.");
        }

        String normalizedOriginalText = Translation.normalizeOriginalText(req.originalText());

        Translation translation = findExistingTranslation(req.bookId(), normalizedOriginalText)
                .orElseGet(() -> Translation.create(
                        req.bookId(),
                        req.originalText(),
                        req.translatedText(),
                        req.contextSentence()
                ));
        if (translation.getId() != null) {
            translation.revise(req.bookId(), req.originalText(), req.translatedText(), req.contextSentence());
        }

        repository.save(translation);
        return TranslationResponseMapper.toResponse(translation);
    }

    private Optional<Translation> findExistingTranslation(Long bookId, String normalizedText) {
        if (bookId == null) {
            return repository.findByBookIdIsNullAndOriginalText(normalizedText);
        }
        return repository.findByBookIdAndOriginalText(bookId, normalizedText);
    }
}
