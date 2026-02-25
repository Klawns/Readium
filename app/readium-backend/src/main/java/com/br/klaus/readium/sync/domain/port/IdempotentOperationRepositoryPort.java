package com.br.klaus.readium.sync.domain.port;

import com.br.klaus.readium.sync.domain.model.IdempotentOperation;

import java.time.LocalDateTime;
import java.util.Optional;

public interface IdempotentOperationRepositoryPort {

    Optional<IdempotentOperation> findByScopeAndOperationId(String scope, String operationId);

    boolean reserve(String scope, String operationId);

    void attachResourceId(String scope, String operationId, Long resourceId);

    int deleteCreatedBefore(LocalDateTime threshold);
}
