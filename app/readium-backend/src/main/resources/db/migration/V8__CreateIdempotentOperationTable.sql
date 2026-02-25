CREATE TABLE IF NOT EXISTS idempotent_operation (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scope VARCHAR(80) NOT NULL,
    operation_id VARCHAR(120) NOT NULL,
    resource_id BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_idempotent_operation_scope_operation UNIQUE (scope, operation_id)
);

CREATE INDEX IF NOT EXISTS idx_idempotent_operation_created_at ON idempotent_operation (created_at);
