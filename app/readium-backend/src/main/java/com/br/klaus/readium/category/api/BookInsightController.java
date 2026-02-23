package com.br.klaus.readium.category.api;

import com.br.klaus.readium.category.api.dto.BookMetricsResponseDTO;
import com.br.klaus.readium.category.api.dto.BookRecommendationResponseDTO;
import com.br.klaus.readium.category.api.dto.ReadingEvolutionPointResponseDTO;
import com.br.klaus.readium.category.api.dto.SmartCollectionResponseDTO;
import com.br.klaus.readium.category.application.query.CategoryInsightQueryService;
import com.br.klaus.readium.category.application.query.ReadingEvolutionQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/books/insights")
@RequiredArgsConstructor
public class BookInsightController {

    private final CategoryInsightQueryService queryService;
    private final ReadingEvolutionQueryService readingEvolutionQueryService;

    @GetMapping("/metrics")
    public ResponseEntity<BookMetricsResponseDTO> getMetrics() {
        return ResponseEntity.ok(queryService.getMetrics());
    }

    @GetMapping("/smart-collections")
    public ResponseEntity<List<SmartCollectionResponseDTO>> getSmartCollections() {
        return ResponseEntity.ok(queryService.getSmartCollections());
    }

    @GetMapping("/recommendations")
    public ResponseEntity<List<BookRecommendationResponseDTO>> getRecommendations(
            @RequestParam(required = false) Integer limit
    ) {
        return ResponseEntity.ok(queryService.getRecommendations(limit));
    }

    @GetMapping("/evolution")
    public ResponseEntity<List<ReadingEvolutionPointResponseDTO>> getEvolution(
            @RequestParam(required = false) Integer days
    ) {
        return ResponseEntity.ok(readingEvolutionQueryService.getEvolution(days));
    }
}
