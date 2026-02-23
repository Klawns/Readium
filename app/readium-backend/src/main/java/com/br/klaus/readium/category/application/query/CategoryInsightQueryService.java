package com.br.klaus.readium.category.application.query;

import com.br.klaus.readium.book.api.BookInsightSnapshot;
import com.br.klaus.readium.book.api.BookInsightsDataService;
import com.br.klaus.readium.category.api.dto.BookMetricsResponseDTO;
import com.br.klaus.readium.category.api.dto.BookRecommendationResponseDTO;
import com.br.klaus.readium.category.api.dto.SmartCollectionResponseDTO;
import com.br.klaus.readium.category.domain.model.BookCategory;
import com.br.klaus.readium.category.domain.port.BookCategoryRepositoryPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class CategoryInsightQueryService {

    private static final int DEFAULT_RECOMMENDATION_LIMIT = 6;
    private static final int MAX_RECOMMENDATION_LIMIT = 12;
    private static final int PREVIEW_SIZE = 4;

    private final BookInsightsDataService bookInsightsDataService;
    private final BookCategoryRepositoryPort bookCategoryRepository;

    @Transactional(readOnly = true)
    public BookMetricsResponseDTO getMetrics() {
        List<BookInsightSnapshot> books = bookInsightsDataService.findAllSnapshots();
        List<BookCategory> links = bookCategoryRepository.findAll();

        Set<Long> existingBookIds = new HashSet<>();
        for (BookInsightSnapshot book : books) {
            if (book.id() != null) {
                existingBookIds.add(book.id());
            }
        }

        Set<Long> categorizedBookIds = new HashSet<>();
        for (BookCategory link : links) {
            Long bookId = link.getBookId();
            if (bookId != null && existingBookIds.contains(bookId)) {
                categorizedBookIds.add(bookId);
            }
        }

        long totalBooks = books.size();
        long toReadBooks = books.stream().filter(this::isToRead).count();
        long readingBooks = books.stream().filter(this::isReading).count();
        long readBooks = books.stream().filter(this::isRead).count();
        long categorizedBooks = categorizedBookIds.size();
        long uncategorizedBooks = Math.max(0L, totalBooks - categorizedBooks);
        long totalPagesKnown = books.stream().mapToLong(this::knownPages).sum();
        long pagesRead = books.stream().mapToLong(this::estimateReadPages).sum();
        int averageProgressPercent = calculateAverageProgressPercent(books);
        int completionPercent = percent(readBooks, totalBooks);

        return new BookMetricsResponseDTO(
                totalBooks,
                toReadBooks,
                readingBooks,
                readBooks,
                categorizedBooks,
                uncategorizedBooks,
                totalPagesKnown,
                pagesRead,
                averageProgressPercent,
                completionPercent
        );
    }

    @Transactional(readOnly = true)
    public List<SmartCollectionResponseDTO> getSmartCollections() {
        List<BookInsightSnapshot> books = bookInsightsDataService.findAllSnapshots();
        List<BookCategory> links = bookCategoryRepository.findAll();
        Set<Long> categorizedBookIds = toCategorizedBookIds(links);

        List<SmartCollectionResponseDTO> collections = new ArrayList<>();

        collections.add(buildCollection(
                "continue-reading",
                "Continuar lendo",
                "Livros com leitura em andamento para manter ritmo.",
                books.stream().filter(this::isReading).toList(),
                byProgressDescending().thenComparing(byIdDescending())
        ));

        collections.add(buildCollection(
                "almost-finished",
                "Quase finalizados",
                "Livros acima de 80% para concluir rapidamente.",
                books.stream().filter(this::isAlmostFinished).toList(),
                byProgressDescending().thenComparing(byIdDescending())
        ));

        collections.add(buildCollection(
                "uncategorized",
                "Sem categoria",
                "Livros que ainda nao foram organizados por categoria.",
                books.stream().filter(book -> !categorizedBookIds.contains(book.id())).toList(),
                byReadingPriority().thenComparing(byIdDescending())
        ));

        collections.add(buildCollection(
                "ocr-attention",
                "OCR pendente",
                "PDFs que ainda nao finalizaram processamento OCR.",
                books.stream().filter(this::needsOcrAttention).toList(),
                byIdDescending()
        ));

        collections.add(buildCollection(
                "quick-wins",
                "Leituras rapidas",
                "Titulos curtos para manter consistencia de leitura.",
                books.stream().filter(this::isQuickWinCandidate).toList(),
                Comparator.comparingInt(this::knownPages).thenComparing(byIdDescending())
        ));

        return collections;
    }

    @Transactional(readOnly = true)
    public List<BookRecommendationResponseDTO> getRecommendations(Integer requestedLimit) {
        int limit = sanitizeRecommendationLimit(requestedLimit);
        List<BookInsightSnapshot> books = bookInsightsDataService.findAllSnapshots();
        List<BookCategory> links = bookCategoryRepository.findAll();
        Map<Long, List<BookCategory>> linksByBookId = groupLinksByBookId(links);
        Map<Long, Integer> categoryAffinity = buildCategoryAffinity(books, linksByBookId);

        return books.stream()
                .filter(book -> !isRead(book))
                .map(book -> scoreBook(book, linksByBookId, categoryAffinity))
                .sorted(Comparator.comparingDouble(ScoredRecommendation::score).reversed()
                        .thenComparing(ScoredRecommendation::bookId, Comparator.reverseOrder()))
                .limit(limit)
                .map(result -> new BookRecommendationResponseDTO(
                        result.book(),
                        result.reason(),
                        round(result.score())
                ))
                .toList();
    }

    private SmartCollectionResponseDTO buildCollection(
            String id,
            String name,
            String description,
            List<BookInsightSnapshot> source,
            Comparator<BookInsightSnapshot> order
    ) {
        List<BookInsightSnapshot> ordered = source.stream().sorted(order).toList();
        List<BookInsightSnapshot> previewBooks = ordered.stream()
                .limit(PREVIEW_SIZE)
                .toList();

        return new SmartCollectionResponseDTO(
                id,
                name,
                description,
                ordered.size(),
                previewBooks
        );
    }

    private ScoredRecommendation scoreBook(
            BookInsightSnapshot book,
            Map<Long, List<BookCategory>> linksByBookId,
            Map<Long, Integer> categoryAffinity
    ) {
        List<BookCategory> links = linksByBookId.getOrDefault(book.id(), List.of());
        int affinityMatches = 0;
        for (BookCategory link : links) {
            Long categoryId = link.getCategory() != null ? link.getCategory().getId() : null;
            if (categoryId == null) {
                continue;
            }
            affinityMatches += categoryAffinity.getOrDefault(categoryId, 0);
        }

        boolean quickWin = isQuickWinCandidate(book);
        double progress = progressRatio(book);

        double score = 0d;
        if (isReading(book)) {
            score += 80d;
        } else if (isToRead(book)) {
            score += 34d;
        }
        score += progress * 35d;
        if (quickWin) {
            score += 15d;
        }
        if (affinityMatches > 0) {
            score += Math.min(40d, affinityMatches * 6d);
        }
        if (links.isEmpty()) {
            score -= 4d;
        }
        if (knownPages(book) > 550) {
            score -= 6d;
        }
        if ("DONE".equals(book.ocrStatus())) {
            score += 3d;
        } else if ("FAILED".equals(book.ocrStatus())) {
            score -= 5d;
        }
        if (book.id() != null) {
            score += (book.id() % 7) * 0.1d;
        }

        String reason = recommendationReason(book, progress, affinityMatches, quickWin, links.isEmpty());
        return new ScoredRecommendation(book, score, reason);
    }

    private String recommendationReason(
            BookInsightSnapshot book,
            double progress,
            int affinityMatches,
            boolean quickWin,
            boolean uncategorized
    ) {
        if (isReading(book) && progress >= 0.8d) {
            return "Voce esta perto de concluir este livro.";
        }
        if (isReading(book)) {
            return "Voce ja iniciou este livro e manter ritmo acelera a conclusao.";
        }
        if (affinityMatches > 0) {
            return "Este titulo combina com categorias em que voce mais avanca.";
        }
        if (quickWin) {
            return "Leitura curta para gerar tracao rapida na rotina.";
        }
        if (uncategorized) {
            return "Boa opcao para ler e depois classificar na sua estrutura.";
        }
        return "Boa opcao para a sua fila de leitura atual.";
    }

    private Map<Long, Integer> buildCategoryAffinity(
            List<BookInsightSnapshot> books,
            Map<Long, List<BookCategory>> linksByBookId
    ) {
        Map<Long, BookInsightSnapshot> byId = new HashMap<>();
        for (BookInsightSnapshot book : books) {
            if (book.id() != null) {
                byId.put(book.id(), book);
            }
        }

        Map<Long, Integer> affinity = new HashMap<>();
        for (Map.Entry<Long, List<BookCategory>> entry : linksByBookId.entrySet()) {
            BookInsightSnapshot sourceBook = byId.get(entry.getKey());
            if (sourceBook == null || !isEngaged(sourceBook)) {
                continue;
            }
            for (BookCategory link : entry.getValue()) {
                Long categoryId = link.getCategory() != null ? link.getCategory().getId() : null;
                if (categoryId == null) {
                    continue;
                }
                affinity.merge(categoryId, 1, Integer::sum);
            }
        }
        return affinity;
    }

    private Map<Long, List<BookCategory>> groupLinksByBookId(List<BookCategory> links) {
        Map<Long, List<BookCategory>> grouped = new HashMap<>();
        for (BookCategory link : links) {
            Long bookId = link.getBookId();
            if (bookId == null) {
                continue;
            }
            grouped.computeIfAbsent(bookId, ignored -> new ArrayList<>()).add(link);
        }
        return grouped;
    }

    private Set<Long> toCategorizedBookIds(List<BookCategory> links) {
        Set<Long> ids = new HashSet<>();
        for (BookCategory link : links) {
            if (link.getBookId() != null) {
                ids.add(link.getBookId());
            }
        }
        return ids;
    }

    private Comparator<BookInsightSnapshot> byIdDescending() {
        return Comparator.comparing(
                (BookInsightSnapshot book) -> book.id() == null ? Long.MIN_VALUE : book.id(),
                Comparator.reverseOrder()
        );
    }

    private Comparator<BookInsightSnapshot> byProgressDescending() {
        return Comparator.comparingDouble(this::progressRatio).reversed();
    }

    private Comparator<BookInsightSnapshot> byReadingPriority() {
        return Comparator.comparingInt(book -> {
            if (isReading(book)) {
                return 0;
            }
            if (isToRead(book)) {
                return 1;
            }
            return 2;
        });
    }

    private int sanitizeRecommendationLimit(Integer requestedLimit) {
        if (requestedLimit == null) {
            return DEFAULT_RECOMMENDATION_LIMIT;
        }
        return Math.max(1, Math.min(MAX_RECOMMENDATION_LIMIT, requestedLimit));
    }

    private int calculateAverageProgressPercent(List<BookInsightSnapshot> books) {
        double sum = 0d;
        int count = 0;
        for (BookInsightSnapshot book : books) {
            if (knownPages(book) <= 0) {
                continue;
            }
            sum += progressRatio(book);
            count++;
        }
        if (count == 0) {
            return 0;
        }
        return (int) Math.round((sum / count) * 100d);
    }

    private int percent(long numerator, long denominator) {
        if (denominator <= 0L) {
            return 0;
        }
        return (int) Math.round((numerator * 100d) / denominator);
    }

    private long estimateReadPages(BookInsightSnapshot book) {
        int readPages = safeLastReadPage(book);
        int pages = knownPages(book);
        if (pages <= 0) {
            return readPages;
        }
        return Math.min(readPages, pages);
    }

    private int knownPages(BookInsightSnapshot book) {
        Integer pages = book.pages();
        if (pages == null || pages <= 0) {
            return 0;
        }
        return pages;
    }

    private int safeLastReadPage(BookInsightSnapshot book) {
        Integer value = book.lastReadPage();
        if (value == null || value < 0) {
            return 0;
        }
        return value;
    }

    private double progressRatio(BookInsightSnapshot book) {
        int pages = knownPages(book);
        if (pages <= 0) {
            return 0d;
        }
        return Math.min(1d, safeLastReadPage(book) / (double) pages);
    }

    private boolean needsOcrAttention(BookInsightSnapshot book) {
        if (!"PDF".equals(book.format())) {
            return false;
        }
        return !"DONE".equals(book.ocrStatus());
    }

    private boolean isAlmostFinished(BookInsightSnapshot book) {
        if (!isReading(book)) {
            return false;
        }
        double progress = progressRatio(book);
        return progress >= 0.8d && progress < 1d;
    }

    private boolean isQuickWinCandidate(BookInsightSnapshot book) {
        return isToRead(book) && knownPages(book) > 0 && knownPages(book) <= 220;
    }

    private boolean isEngaged(BookInsightSnapshot book) {
        return isRead(book) || isReading(book) || safeLastReadPage(book) > 0;
    }

    private boolean isRead(BookInsightSnapshot book) {
        return "READ".equals(book.status());
    }

    private boolean isReading(BookInsightSnapshot book) {
        return "READING".equals(book.status());
    }

    private boolean isToRead(BookInsightSnapshot book) {
        return "TO_READ".equals(book.status());
    }

    private double round(double value) {
        return Math.round(value * 10d) / 10d;
    }

    private record ScoredRecommendation(BookInsightSnapshot book, double score, String reason) {
        private Long bookId() {
            return book.id() == null ? Long.MIN_VALUE : book.id();
        }
    }
}

