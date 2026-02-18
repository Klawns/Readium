package com.br.klaus.readium.translation;

import com.br.klaus.readium.exception.RateLimitExceededException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class TranslationRateLimiter {

    private final Map<String, Long> lastRequestByKey = new ConcurrentHashMap<>();

    @Value("${app.translation.rate-limit.min-interval-ms:150}")
    private long minIntervalMs;

    public void enforce(String key) {
        long now = System.currentTimeMillis();
        Long lastRequest = lastRequestByKey.put(key, now);
        if (lastRequest != null && (now - lastRequest) < minIntervalMs) {
            throw new RateLimitExceededException("Too many translation requests for the same text.");
        }
        cleanup(now);
    }

    private void cleanup(long now) {
        long staleThreshold = now - Math.max(minIntervalMs, 1) * 20;
        lastRequestByKey.entrySet().removeIf(entry -> entry.getValue() <= staleThreshold);
    }
}
