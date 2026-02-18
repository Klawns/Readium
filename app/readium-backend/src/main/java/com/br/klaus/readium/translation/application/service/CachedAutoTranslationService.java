package com.br.klaus.readium.translation.application.service;

import com.br.klaus.readium.config.CacheNames;
import com.br.klaus.readium.translation.domain.port.TranslationGatewayPort;
import com.br.klaus.readium.translation.api.dto.AutoTranslationResponseDTO;
import com.br.klaus.readium.translation.domain.model.TranslationAutoResult;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CachedAutoTranslationService {

    private final TranslationGatewayPort translationGateway;
    private final TranslationRateLimiter translationRateLimiter;

    @Cacheable(cacheNames = CacheNames.AUTO_TRANSLATION, key = "#targetLanguage + '::' + #normalizedText")
    public AutoTranslationResponseDTO translate(String normalizedText, String inputText, String targetLanguage) {
        translationRateLimiter.enforce(targetLanguage + "::" + normalizedText);

        TranslationAutoResult result = translationGateway.translate(inputText, targetLanguage);
        return new AutoTranslationResponseDTO(
                result.translatedText(),
                result.detectedLanguage()
        );
    }
}
