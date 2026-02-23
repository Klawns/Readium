package com.br.klaus.readium.category.application.query;

import com.br.klaus.readium.category.api.dto.ReadingEvolutionPointResponseDTO;
import com.br.klaus.readium.category.domain.model.DailyReadingEvolutionPoint;
import com.br.klaus.readium.category.domain.port.ReadingProgressEventRepositoryPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReadingEvolutionQueryService {

    private static final int DEFAULT_DAYS = 30;
    private static final int MIN_DAYS = 7;
    private static final int MAX_DAYS = 180;

    private final ReadingProgressEventRepositoryPort repository;

    @Transactional(readOnly = true)
    public List<ReadingEvolutionPointResponseDTO> getEvolution(Integer requestedDays) {
        int days = sanitizeDays(requestedDays);
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(days - 1L);

        List<DailyReadingEvolutionPoint> points = repository.findDailyEvolution(startDate, endDate);
        Map<LocalDate, DailyReadingEvolutionPoint> pointsByDate = new HashMap<>();
        for (DailyReadingEvolutionPoint point : points) {
            pointsByDate.put(point.date(), point);
        }

        List<ReadingEvolutionPointResponseDTO> response = new ArrayList<>(days);
        for (int i = 0; i < days; i++) {
            LocalDate date = startDate.plusDays(i);
            DailyReadingEvolutionPoint point = pointsByDate.get(date);
            if (point == null) {
                response.add(new ReadingEvolutionPointResponseDTO(date.toString(), 0, 0, 0));
                continue;
            }

            response.add(new ReadingEvolutionPointResponseDTO(
                    date.toString(),
                    Math.max(0L, point.pagesRead()),
                    Math.max(0L, point.booksTouched()),
                    Math.max(0L, point.progressUpdates())
            ));
        }
        return response;
    }

    private int sanitizeDays(Integer requestedDays) {
        if (requestedDays == null) {
            return DEFAULT_DAYS;
        }
        return Math.max(MIN_DAYS, Math.min(MAX_DAYS, requestedDays));
    }
}

