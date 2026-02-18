package com.br.klaus.readium.translation.infrastructure.gateway;

import com.br.klaus.readium.exception.ExternalServiceException;
import com.br.klaus.readium.translation.domain.model.TranslationAutoResult;
import com.br.klaus.readium.translation.domain.port.TranslationGatewayPort;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

@Component
public class HttpTranslationGatewayAdapter implements TranslationGatewayPort {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient;

    @Value("${app.translation.provider.type:MYMEMORY}")
    private String providerType;

    @Value("${app.translation.provider.mymemory-url:https://api.mymemory.translated.net/get}")
    private String myMemoryUrl;

    @Value("${app.translation.provider.libre-url:http://localhost:5000/translate}")
    private String libreTranslateUrl;

    @Value("${app.translation.provider.libre-api-key:}")
    private String libreApiKey;

    @Value("${app.translation.provider.timeout-ms:5000}")
    private int timeoutMs;

    public HttpTranslationGatewayAdapter() {
        this.httpClient = HttpClient.newBuilder().build();
    }

    @Override
    public TranslationAutoResult translate(String text, String targetLanguage) {
        String provider = providerType == null ? "MYMEMORY" : providerType.trim().toUpperCase();
        return switch (provider) {
            case "LIBRETRANSLATE" -> translateWithLibreTranslate(text, targetLanguage);
            case "MYMEMORY" -> translateWithMyMemory(text, targetLanguage);
            default -> throw new ExternalServiceException("Unsupported translation provider: " + provider);
        };
    }

    private TranslationAutoResult translateWithMyMemory(String text, String targetLanguage) {
        MyMemoryResponse response = callMyMemoryWithSourceFallback(text, targetLanguage);

        if (shouldRetryWithNormalizedCase(text, response)) {
            MyMemoryResponse retryWithEnglishSource = callMyMemory(text, "en", targetLanguage);
            response = retryWithEnglishSource;

            if (shouldRetryWithNormalizedCase(text, retryWithEnglishSource)) {
                String normalizedText = text.trim().toLowerCase(Locale.ROOT);
                response = callMyMemory(normalizedText, "en", targetLanguage);
            }
        }

        if (response.statusCode() != 200) {
            String details = StringUtils.hasText(response.details()) ? response.details() : "unknown error";
            throw new ExternalServiceException("MyMemory translation failed: " + details);
        }

        if (!StringUtils.hasText(response.translatedText())) {
            throw new ExternalServiceException("Translation provider returned an empty translation.");
        }

        return new TranslationAutoResult(response.translatedText(), response.detectedLanguage());
    }

    private TranslationAutoResult translateWithLibreTranslate(String text, String targetLanguage) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("q", text);
        payload.put("source", "auto");
        payload.put("target", targetLanguage);
        payload.put("format", "text");
        if (StringUtils.hasText(libreApiKey)) {
            payload.put("api_key", libreApiKey);
        }

        try {
            String jsonBody = objectMapper.writeValueAsString(payload);
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(libreTranslateUrl))
                    .timeout(Duration.ofMillis(timeoutMs))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                    .build();

            String body = send(request);
            JsonNode root = objectMapper.readTree(body);

            String translatedText = root.path("translatedText").asText("");
            if (!StringUtils.hasText(translatedText)) {
                throw new ExternalServiceException("Translation provider returned an empty translation.");
            }

            String detectedLanguage = root.path("detectedLanguage").path("language").asText(
                    root.path("detectedLanguage").asText("unknown")
            );
            return new TranslationAutoResult(translatedText, detectedLanguage);
        } catch (IOException e) {
            throw new ExternalServiceException("Failed to parse response from translation provider.", e);
        }
    }

    private String send(HttpRequest request) {
        try {
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new ExternalServiceException(
                        "Translation provider call failed with status " + response.statusCode()
                );
            }
            return response.body();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new ExternalServiceException("Translation provider call failed.", e);
        } catch (IOException e) {
            throw new ExternalServiceException("Translation provider call failed.", e);
        }
    }

    private MyMemoryResponse callMyMemory(String text, String sourceLanguage, String targetLanguage) {
        String encodedText = URLEncoder.encode(text, StandardCharsets.UTF_8);
        String encodedLangPair = URLEncoder.encode(sourceLanguage + "|" + targetLanguage, StandardCharsets.UTF_8);
        String url = myMemoryUrl + "?q=" + encodedText + "&langpair=" + encodedLangPair;

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .timeout(Duration.ofMillis(timeoutMs))
                .GET()
                .build();

        String body = send(request);
        try {
            JsonNode root = objectMapper.readTree(body);
            int responseStatus = root.path("responseStatus").asInt(200);
            String responseDetails = root.path("responseDetails").asText("");
            String translatedText = root.path("responseData").path("translatedText").asText("");
            return new MyMemoryResponse(translatedText, sourceLanguage, responseStatus, responseDetails);
        } catch (IOException e) {
            throw new ExternalServiceException("Failed to parse response from translation provider.", e);
        }
    }

    private MyMemoryResponse callMyMemoryWithSourceFallback(String text, String targetLanguage) {
        MyMemoryResponse response = callMyMemory(text, "auto", targetLanguage);
        if (isInvalidSourceLanguage(response)) {
            return callMyMemory(text, "en", targetLanguage);
        }
        return response;
    }

    private boolean shouldRetryWithNormalizedCase(String originalText, MyMemoryResponse response) {
        if (response.statusCode() != 200) {
            return false;
        }
        if (!StringUtils.hasText(originalText) || !StringUtils.hasText(response.translatedText())) {
            return false;
        }

        String input = originalText.trim();
        String translated = response.translatedText().trim();
        if (!translated.equalsIgnoreCase(input)) {
            return false;
        }

        return isMostlyUppercase(input);
    }

    private boolean isMostlyUppercase(String text) {
        int letters = 0;
        int uppercaseLetters = 0;
        for (char current : text.toCharArray()) {
            if (Character.isLetter(current)) {
                letters++;
                if (Character.isUpperCase(current)) {
                    uppercaseLetters++;
                }
            }
        }

        if (letters < 3) {
            return false;
        }

        return ((double) uppercaseLetters / letters) >= 0.7;
    }

    private boolean isInvalidSourceLanguage(MyMemoryResponse response) {
        if (response.statusCode() == 200) {
            return false;
        }

        String details = response.details() == null ? "" : response.details().toLowerCase(Locale.ROOT);
        return details.contains("invalid source language");
    }

    private record MyMemoryResponse(
            String translatedText,
            String detectedLanguage,
            int statusCode,
            String details
    ) {
    }
}
