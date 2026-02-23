ALTER TABLE category ADD COLUMN parent_id BIGINT;
ALTER TABLE category ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_category_parent ON category (parent_id);

UPDATE category
SET sort_order = id
WHERE sort_order = 0;
