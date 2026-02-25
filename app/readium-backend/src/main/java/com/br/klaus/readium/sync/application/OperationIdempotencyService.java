package com.br.klaus.readium.sync.application;

import com.br.klaus.readium.sync.domain.model.IdempotentOperation;
import com.br.klaus.readium.sync.domain.port.IdempotentOperationRepositoryPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class OperationIdempotencyService {

    private final IdempotentOperationRepositoryPort repository;

    public OperationClaim claim(String scope, String operationId) {
        if (scope == null || scope.isBlank()) {
            throw new IllegalArgumentException("Escopo da operacao idempotente e obrigatorio.");
        }
        if (operationId == null || operationId.isBlank()) {
            return OperationClaim.withoutOperationId(scope);
        }

        String normalizedOperationId = operationId.trim();
        Optional<IdempotentOperation> existing = repository.findByScopeAndOperationId(scope, normalizedOperationId);
        if (existing.isPresent()) {
            return OperationClaim.duplicate(scope, normalizedOperationId, existing.get().getResourceId());
        }

        boolean reserved = repository.reserve(scope, normalizedOperationId);
        if (reserved) {
            return OperationClaim.acquired(scope, normalizedOperationId);
        }

        Optional<IdempotentOperation> concurrent = repository.findByScopeAndOperationId(scope, normalizedOperationId);
        return OperationClaim.duplicate(
                scope,
                normalizedOperationId,
                concurrent.map(IdempotentOperation::getResourceId).orElse(null)
        );
    }

    public void attachResourceId(OperationClaim claim, Long resourceId) {
        if (!claim.hasOperationId() || !claim.shouldProcess() || resourceId == null) {
            return;
        }
        repository.attachResourceId(claim.scope(), claim.operationId(), resourceId);
    }

    public record OperationClaim(boolean shouldProcess, String scope, String operationId, Long resourceId) {

        static OperationClaim withoutOperationId(String scope) {
            return new OperationClaim(true, scope, null, null);
        }

        static OperationClaim acquired(String scope, String operationId) {
            return new OperationClaim(true, scope, operationId, null);
        }

        static OperationClaim duplicate(String scope, String operationId, Long resourceId) {
            return new OperationClaim(false, scope, operationId, resourceId);
        }

        public boolean hasOperationId() {
            return operationId != null;
        }
    }
}
