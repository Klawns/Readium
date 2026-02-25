package com.br.klaus.readium.sync.domain.model;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "idempotent_operation",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_idempotent_operation_scope_operation",
                        columnNames = {"scope", "operation_id"}
                )
        },
        indexes = {
                @Index(name = "idx_idempotent_operation_created_at", columnList = "created_at")
        }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class IdempotentOperation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "scope", nullable = false, length = 80)
    private String scope;

    @Column(name = "operation_id", nullable = false, length = 120)
    private String operationId;

    @Column(name = "resource_id")
    private Long resourceId;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public static IdempotentOperation create(String scope, String operationId) {
        IdempotentOperation operation = new IdempotentOperation();
        operation.scope = scope;
        operation.operationId = operationId;
        operation.createdAt = LocalDateTime.now();
        return operation;
    }

    public void attachResourceId(Long resourceId) {
        this.resourceId = resourceId;
    }
}
