package com.br.klaus.readium.sync.application;

import com.br.klaus.readium.sync.domain.model.IdempotentOperation;
import com.br.klaus.readium.sync.domain.port.IdempotentOperationRepositoryPort;
import org.junit.jupiter.api.Test;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

class IdempotentOperationRetentionServiceTests {

    @Test
    void shouldDeleteOperationsOlderThanConfiguredRetention() {
        SpyRepository repository = new SpyRepository(7);
        IdempotentOperationRetentionService service = new IdempotentOperationRetentionService(repository);
        LocalDateTime beforeCall = LocalDateTime.now();

        int deleted = service.purgeOlderThanDays(15);

        assertEquals(7, deleted);
        assertNotNull(repository.lastThreshold);
        LocalDateTime expectedApproximate = beforeCall.minusDays(15);
        long deltaSeconds = Math.abs(Duration.between(expectedApproximate, repository.lastThreshold).toSeconds());
        assertTrue(deltaSeconds <= 2, "Threshold deveria ficar proximo de now()-15d");
    }

    @Test
    void shouldRejectInvalidRetentionPeriod() {
        SpyRepository repository = new SpyRepository(0);
        IdempotentOperationRetentionService service = new IdempotentOperationRetentionService(repository);

        IllegalArgumentException error = assertThrows(
                IllegalArgumentException.class,
                () -> service.purgeOlderThanDays(0)
        );

        assertEquals("Retencao invalida para idempotencia. Use pelo menos 1 dia.", error.getMessage());
    }

    private static final class SpyRepository implements IdempotentOperationRepositoryPort {
        private final int deletedCount;
        private LocalDateTime lastThreshold;

        private SpyRepository(int deletedCount) {
            this.deletedCount = deletedCount;
        }

        @Override
        public Optional<IdempotentOperation> findByScopeAndOperationId(String scope, String operationId) {
            return Optional.empty();
        }

        @Override
        public boolean reserve(String scope, String operationId) {
            return false;
        }

        @Override
        public void attachResourceId(String scope, String operationId, Long resourceId) {
        }

        @Override
        public int deleteCreatedBefore(LocalDateTime threshold) {
            this.lastThreshold = threshold;
            return deletedCount;
        }
    }
}
