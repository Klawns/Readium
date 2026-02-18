package com.br.klaus.readium.translation.application.command;

import com.br.klaus.readium.config.CacheNames;
import com.br.klaus.readium.translation.Translation;
import com.br.klaus.readium.translation.domain.port.TranslationRepositoryPort;
import com.br.klaus.readium.translation.dto.TranslationRequestDTO;
import com.br.klaus.readium.translation.dto.TranslationResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

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
        if (req == null || !StringUtils.hasText(req.originalText()) || !StringUtils.hasText(req.translatedText())) {
            throw new IllegalArgumentException("originalText and translatedText are required.");
        }

        String normalizedText = normalize(req.originalText());

        Translation translation = findExistingTranslation(req.bookId(), normalizedText)
                .orElse(new Translation());

        translation.setBookId(req.bookId());
        translation.setOriginalText(normalizedText);
        translation.setTranslatedText(req.translatedText().trim());
        translation.setContextSentence(req.contextSentence());

        repository.save(translation);
        return TranslationResponseDTO.fromEntity(translation);
    }

    private Optional<Translation> findExistingTranslation(Long bookId, String normalizedText) {
        if (bookId == null) {
            return repository.findByBookIdIsNullAndOriginalText(normalizedText);
        }
        return repository.findByBookIdAndOriginalText(bookId, normalizedText);
    }

    private String normalize(String value) {
        return value.trim().toLowerCase();
    }
}
