package com.br.klaus.readium.translation;

import com.br.klaus.readium.exception.RateLimitExceededException;
import com.br.klaus.readium.translation.dto.AutoTranslationRequestDTO;
import com.br.klaus.readium.translation.dto.AutoTranslationResponseDTO;
import com.br.klaus.readium.translation.dto.TranslationRequestDTO;
import com.br.klaus.readium.translation.dto.TranslationResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class TranslationService {

    private final TranslationRepository repository;
    private final TranslationGateway translationGateway;

    private final Map<String, CachedAutoTranslation> autoTranslationCache = new ConcurrentHashMap<>();
    private final Map<String, Long> lastRequestByKey = new ConcurrentHashMap<>();

    @Value("${app.translation.cache.ttl-seconds:86400}")
    private long cacheTtlSeconds;

    @Value("${app.translation.cache.max-entries:5000}")
    private int cacheMaxEntries;

    @Value("${app.translation.rate-limit.min-interval-ms:150}")
    private long minIntervalMs;

    @Transactional
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
        String cacheKey = targetLanguage + "::" + normalize(inputText);

        evictExpiredCacheEntries();

        CachedAutoTranslation cached = autoTranslationCache.get(cacheKey);
        long now = System.currentTimeMillis();
        if (cached != null && cached.expiresAtMs() > now) {
            return cached.response();
        }

        enforceRateLimit(cacheKey, now);

        TranslationAutoResult result = translationGateway.translate(inputText, targetLanguage);
        AutoTranslationResponseDTO response = new AutoTranslationResponseDTO(
                result.translatedText(),
                result.detectedLanguage()
        );

        long expiresAt = now + (cacheTtlSeconds * 1000L);
        autoTranslationCache.put(cacheKey, new CachedAutoTranslation(response, expiresAt, now));
        trimCacheIfNeeded();

        return response;
    }

    private Optional<Translation> findExistingTranslation(Long bookId, String normalizedText) {
        if (bookId == null) {
            return repository.findByBookIdIsNullAndOriginalText(normalizedText);
        }
        return repository.findByBookIdAndOriginalText(bookId, normalizedText);
    }

    private void enforceRateLimit(String cacheKey, long now) {
        Long lastRequest = lastRequestByKey.put(cacheKey, now);
        if (lastRequest != null && (now - lastRequest) < minIntervalMs) {
            throw new RateLimitExceededException("Too many translation requests for the same text.");
        }
    }

    private void evictExpiredCacheEntries() {
        long now = System.currentTimeMillis();
        autoTranslationCache.entrySet().removeIf(entry -> entry.getValue().expiresAtMs() <= now);
        long staleThreshold = now - (cacheTtlSeconds * 1000L);
        lastRequestByKey.entrySet().removeIf(entry -> entry.getValue() <= staleThreshold);
    }

    private void trimCacheIfNeeded() {
        if (autoTranslationCache.size() <= cacheMaxEntries) {
            return;
        }

        int itemsToRemove = autoTranslationCache.size() - cacheMaxEntries;
        autoTranslationCache.entrySet().stream()
                .sorted(Comparator.comparingLong(entry -> entry.getValue().createdAtMs()))
                .limit(itemsToRemove)
                .map(Map.Entry::getKey)
                .toList()
                .forEach(autoTranslationCache::remove);
    }

    private String normalize(String value) {
        return value.trim().toLowerCase();
    }

    private record CachedAutoTranslation(
            AutoTranslationResponseDTO response,
            long expiresAtMs,
            long createdAtMs
    ) {
    }
}
