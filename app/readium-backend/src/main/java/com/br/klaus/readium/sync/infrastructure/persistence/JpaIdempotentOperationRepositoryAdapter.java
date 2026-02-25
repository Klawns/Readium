package com.br.klaus.readium.sync.infrastructure.persistence;

import com.br.klaus.readium.sync.domain.model.IdempotentOperation;
import com.br.klaus.readium.sync.domain.port.IdempotentOperationRepositoryPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class JpaIdempotentOperationRepositoryAdapter implements IdempotentOperationRepositoryPort {

    private final IdempotentOperationJpaRepository repository;

    @Override
    public Optional<IdempotentOperation> findByScopeAndOperationId(String scope, String operationId) {
        return repository.findByScopeAndOperationId(scope, operationId);
    }

    @Override
    public boolean reserve(String scope, String operationId) {
        return repository.insertIfAbsent(scope, operationId) > 0;
    }

    @Override
    public void attachResourceId(String scope, String operationId, Long resourceId) {
        repository.updateResourceId(scope, operationId, resourceId);
    }

    @Override
    public int deleteCreatedBefore(LocalDateTime threshold) {
        return repository.deleteCreatedBefore(threshold);
    }
}
