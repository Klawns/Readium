package com.br.klaus.readium.translation.application.query;

import com.br.klaus.readium.config.CacheNames;
import com.br.klaus.readium.translation.CachedAutoTranslationService;
import com.br.klaus.readium.translation.Translation;
import com.br.klaus.readium.translation.domain.port.TranslationRepositoryPort;
import com.br.klaus.readium.translation.dto.AutoTranslationRequestDTO;
import com.br.klaus.readium.translation.dto.AutoTranslationResponseDTO;
import com.br.klaus.readium.translation.dto.TranslationResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class TranslationQueryService {

    private final TranslationRepositoryPort repository;
    private final CachedAutoTranslationService cachedAutoTranslationService;

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
                .toList();
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

    private String normalize(String value) {
        return value.trim().toLowerCase();
    }
}
