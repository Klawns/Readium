package com.br.klaus.readium.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.CacheManager;
import org.springframework.cache.caffeine.CaffeineCache;
import org.springframework.cache.support.SimpleCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;
import java.util.List;

@Configuration
public class CacheConfig {

    @Bean
    public CacheManager cacheManager(
            @Value("${app.translation.cache.ttl-seconds:86400}") long autoTranslationTtlSeconds,
            @Value("${app.translation.cache.max-entries:5000}") long autoTranslationMaxEntries,
            @Value("${app.cache.translation-list.ttl-seconds:300}") long translationListTtlSeconds,
            @Value("${app.cache.translation-list.max-entries:2000}") long translationListMaxEntries,
            @Value("${app.cache.annotations.ttl-seconds:120}") long annotationsTtlSeconds,
            @Value("${app.cache.annotations.max-entries:5000}") long annotationsMaxEntries
    ) {
        SimpleCacheManager manager = new SimpleCacheManager();
        manager.setCaches(List.of(
                buildCache(CacheNames.AUTO_TRANSLATION, autoTranslationTtlSeconds, autoTranslationMaxEntries),
                buildCache(CacheNames.TRANSLATIONS_BY_BOOK, translationListTtlSeconds, translationListMaxEntries),
                buildCache(CacheNames.ANNOTATIONS_BY_BOOK, annotationsTtlSeconds, annotationsMaxEntries),
                buildCache(CacheNames.ANNOTATIONS_BY_BOOK_PAGE, annotationsTtlSeconds, annotationsMaxEntries)
        ));
        return manager;
    }

    private CaffeineCache buildCache(String name, long ttlSeconds, long maxEntries) {
        return new CaffeineCache(
                name,
                Caffeine.newBuilder()
                        .expireAfterWrite(Duration.ofSeconds(Math.max(ttlSeconds, 1)))
                        .maximumSize(Math.max(maxEntries, 1))
                        .build()
        );
    }
}
