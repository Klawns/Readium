package com.br.klaus.readium.translation;

import com.br.klaus.readium.exception.ExternalServiceException;
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
import java.util.Map;

@Component
public class HttpTranslationGateway implements TranslationGateway {

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

    public HttpTranslationGateway() {
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
        String encodedText = URLEncoder.encode(text, StandardCharsets.UTF_8);
        String encodedTarget = URLEncoder.encode(targetLanguage, StandardCharsets.UTF_8);
        String url = myMemoryUrl + "?q=" + encodedText + "&langpair=auto|" + encodedTarget;

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .timeout(Duration.ofMillis(timeoutMs))
                .GET()
                .build();

        String body = send(request);
        try {
            JsonNode root = objectMapper.readTree(body);
            String translatedText = root.path("responseData").path("translatedText").asText("");
            if (!StringUtils.hasText(translatedText)) {
                throw new ExternalServiceException("Translation provider returned an empty translation.");
            }
            return new TranslationAutoResult(translatedText, "unknown");
        } catch (IOException e) {
            throw new ExternalServiceException("Failed to parse response from translation provider.", e);
        }
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
}
