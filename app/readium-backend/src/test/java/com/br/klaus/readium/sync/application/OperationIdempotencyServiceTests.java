package com.br.klaus.readium.sync.application;

import com.br.klaus.readium.sync.domain.model.IdempotentOperation;
import com.br.klaus.readium.sync.domain.port.IdempotentOperationRepositoryPort;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

import static org.junit.jupiter.api.Assertions.*;

class OperationIdempotencyServiceTests {

    private static final String SCOPE = "book-progress";

    @Test
    void shouldProcessWhenOperationIdIsMissing() {
        OperationIdempotencyService service = new OperationIdempotencyService(new InMemoryRepository());

        OperationIdempotencyService.OperationClaim claim = service.claim(SCOPE, null);

        assertTrue(claim.shouldProcess());
        assertFalse(claim.hasOperationId());
    }

    @Test
    void shouldMarkDuplicateOperationOnSecondClaim() {
        OperationIdempotencyService service = new OperationIdempotencyService(new InMemoryRepository());

        OperationIdempotencyService.OperationClaim firstClaim = service.claim(SCOPE, "op-123");
        OperationIdempotencyService.OperationClaim secondClaim = service.claim(SCOPE, "op-123");

        assertTrue(firstClaim.shouldProcess());
        assertTrue(firstClaim.hasOperationId());
        assertFalse(secondClaim.shouldProcess());
        assertEquals("op-123", secondClaim.operationId());
    }

    @Test
    void shouldReturnStoredResourceIdForDuplicateCreate() {
        OperationIdempotencyService service = new OperationIdempotencyService(new InMemoryRepository());

        OperationIdempotencyService.OperationClaim firstClaim = service.claim("annotation-create", "op-create-1");
        service.attachResourceId(firstClaim, 99L);

        OperationIdempotencyService.OperationClaim duplicateClaim = service.claim("annotation-create", "op-create-1");

        assertFalse(duplicateClaim.shouldProcess());
        assertEquals(99L, duplicateClaim.resourceId());
    }

    private static final class InMemoryRepository implements IdempotentOperationRepositoryPort {
        private final Map<String, IdempotentOperation> operations = new ConcurrentHashMap<>();

        @Override
        public Optional<IdempotentOperation> findByScopeAndOperationId(String scope, String operationId) {
            return Optional.ofNullable(operations.get(toKey(scope, operationId)));
        }

        @Override
        public boolean reserve(String scope, String operationId) {
            return operations.putIfAbsent(toKey(scope, operationId), IdempotentOperation.create(scope, operationId)) == null;
        }

        @Override
        public void attachResourceId(String scope, String operationId, Long resourceId) {
            IdempotentOperation current = operations.get(toKey(scope, operationId));
            if (current == null) {
                return;
            }
            operations.put(toKey(scope, operationId), withResourceId(scope, operationId, resourceId));
        }

        @Override
        public int deleteCreatedBefore(LocalDateTime threshold) {
            return 0;
        }

        private static String toKey(String scope, String operationId) {
            return scope + "::" + operationId;
        }

        private static IdempotentOperation withResourceId(String scope, String operationId, Long resourceId) {
            IdempotentOperation operation = IdempotentOperation.create(scope, operationId);
            operation.attachResourceId(resourceId);
            return operation;
        }
    }
}
