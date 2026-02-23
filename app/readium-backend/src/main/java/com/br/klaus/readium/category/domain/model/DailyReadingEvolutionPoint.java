package com.br.klaus.readium.category.domain.model;

import java.time.LocalDate;

public record DailyReadingEvolutionPoint(
        LocalDate date,
        long pagesRead,
        long booksTouched,
        long progressUpdates
) {
}

