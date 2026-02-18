package com.br.klaus.readium.translation;

import com.br.klaus.readium.config.CacheNames;
import com.br.klaus.readium.translation.dto.AutoTranslationRequestDTO;
import com.br.klaus.readium.translation.dto.AutoTranslationResponseDTO;
import com.br.klaus.readium.translation.dto.TranslationRequestDTO;
import com.br.klaus.readium.translation.dto.TranslationResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class TranslationService {

    private final TranslationRepository repository;
    private final CachedAutoTranslationService cachedAutoTranslationService;

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

    @Transactional(readOnly = true)
    @Cacheable(cacheNames = CacheNames.TRANSLATIONS_BY_BOOK, key = "#bookId")
    public List<TranslationResponseDTO> findByBookId(Long bookId) {
        List<Translation> scopedTranslations = repository.findByBookId(bookId);

        Set<String> scopedOriginalTexts = new HashSet<>();
        for (Translation translation : scopedTranslations) {
            if (translation.getOriginalText() != null) {
                scopedOriginalTexts.add(translation.getOriginalText());
            }
        }

        List<Translation> globalTranslations = repository.findByBookIdIsNull().stream()
                .filter(translation -> translation.getOriginalText() == null
                        || !scopedOriginalTexts.contains(translation.getOriginalText()))
                .toList();

        return Stream.concat(scopedTranslations.stream(), globalTranslations.stream())
                .map(TranslationResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AutoTranslationResponseDTO autoTranslate(AutoTranslationRequestDTO req) {
        if (req == null || !StringUtils.hasText(req.text())) {
            throw new IllegalArgumentException("text is required.");
        }

        String inputText = req.text().trim().replaceAll("\\s+", " ");
        String targetLanguage = req.resolveTargetLanguage();
        String normalizedText = normalize(inputText);
        return cachedAutoTranslationService.translate(normalizedText, inputText, targetLanguage);
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
