package com.br.klaus.readium.category.infrastructure.persistence;

import com.br.klaus.readium.category.domain.model.DailyReadingEvolutionPoint;
import com.br.klaus.readium.category.domain.model.ReadingProgressEvent;
import com.br.klaus.readium.category.domain.port.ReadingProgressEventRepositoryPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JpaReadingProgressEventRepositoryAdapter implements ReadingProgressEventRepositoryPort {

    private final ReadingProgressEventJpaRepository repository;

    @Override
    public ReadingProgressEvent save(ReadingProgressEvent event) {
        return repository.save(event);
    }

    @Override
    public List<DailyReadingEvolutionPoint> findDailyEvolution(LocalDate startDate, LocalDate endDate) {
        return repository.findDailyEvolution(startDate, endDate).stream()
                .map(item -> new DailyReadingEvolutionPoint(
                        item.getDate(),
                        item.getPagesRead(),
                        item.getBooksTouched(),
                        item.getProgressUpdates()
                ))
                .toList();
    }
}

