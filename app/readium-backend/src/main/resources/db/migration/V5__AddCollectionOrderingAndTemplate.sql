ALTER TABLE reading_collection
    ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0;

ALTER TABLE reading_collection
    ADD COLUMN template_id VARCHAR(32) NOT NULL DEFAULT 'classic';

CREATE INDEX IF NOT EXISTS idx_reading_collection_sort_order ON reading_collection (sort_order);

WITH ordered AS (
    SELECT id,
           ROW_NUMBER() OVER (ORDER BY id) - 1 AS position
    FROM reading_collection
)
UPDATE reading_collection
SET sort_order = (
    SELECT ordered.position
    FROM ordered
    WHERE ordered.id = reading_collection.id
)
WHERE id IN (SELECT id FROM ordered);

