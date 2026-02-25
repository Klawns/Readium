package com.br.klaus.readium.sync.infrastructure.persistence;

import com.br.klaus.readium.sync.domain.model.IdempotentOperation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;

public interface IdempotentOperationJpaRepository extends JpaRepository<IdempotentOperation, Long> {

    Optional<IdempotentOperation> findByScopeAndOperationId(String scope, String operationId);

    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query(value = """
            INSERT OR IGNORE INTO idempotent_operation (scope, operation_id, created_at)
            VALUES (:scope, :operationId, CURRENT_TIMESTAMP)
            """, nativeQuery = true)
    int insertIfAbsent(
            @Param("scope") String scope,
            @Param("operationId") String operationId
    );

    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("""
            update IdempotentOperation operation
            set operation.resourceId = :resourceId
            where operation.scope = :scope and operation.operationId = :operationId
            """)
    int updateResourceId(
            @Param("scope") String scope,
            @Param("operationId") String operationId,
            @Param("resourceId") Long resourceId
    );

    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("""
            delete from IdempotentOperation operation
            where operation.createdAt < :threshold
            """)
    int deleteCreatedBefore(@Param("threshold") LocalDateTime threshold);
}
