package com.br.klaus.readium.category.infrastructure.persistence;

import com.br.klaus.readium.category.domain.model.ReadingProgressEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface ReadingProgressEventJpaRepository extends JpaRepository<ReadingProgressEvent, Long> {

    @Query("""
            select e.eventDate as date,
                   coalesce(sum(e.pagesReadDelta), 0) as pagesRead,
                   count(distinct e.bookId) as booksTouched,
                   count(e.id) as progressUpdates
            from ReadingProgressEvent e
            where e.eventDate between :startDate and :endDate
            group by e.eventDate
            order by e.eventDate asc
            """)
    List<DailyEvolutionProjection> findDailyEvolution(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    interface DailyEvolutionProjection {
        LocalDate getDate();

        long getPagesRead();

        long getBooksTouched();

        long getProgressUpdates();
    }
}

