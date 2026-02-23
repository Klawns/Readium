package com.br.klaus.readium.category.domain.port;

import com.br.klaus.readium.category.domain.model.DailyReadingEvolutionPoint;
import com.br.klaus.readium.category.domain.model.ReadingProgressEvent;

import java.time.LocalDate;
import java.util.List;

public interface ReadingProgressEventRepositoryPort {

    ReadingProgressEvent save(ReadingProgressEvent event);

    List<DailyReadingEvolutionPoint> findDailyEvolution(LocalDate startDate, LocalDate endDate);
}

