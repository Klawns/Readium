package com.br.klaus.readium.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class BookVersionBackfillRunner implements ApplicationRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(ApplicationArguments args) {
        try {
            int updatedRows = jdbcTemplate.update("UPDATE book SET version = 0 WHERE version IS NULL");
            if (updatedRows > 0) {
                log.warn("Backfilled null book.version for {} row(s).", updatedRows);
            }
        } catch (DataAccessException ex) {
            log.error("Failed to backfill book.version values", ex);
        }
    }
}
