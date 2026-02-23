CREATE TABLE IF NOT EXISTS reading_collection (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    version BIGINT NOT NULL DEFAULT 0,
    name VARCHAR(80) NOT NULL,
    slug VARCHAR(96) NOT NULL UNIQUE,
    description VARCHAR(255),
    color VARCHAR(7) NOT NULL,
    icon VARCHAR(32) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reading_collection_name ON reading_collection (name);

CREATE TABLE IF NOT EXISTS book_reading_collection (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id BIGINT NOT NULL,
    collection_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_book_reading_collection_book_collection UNIQUE (book_id, collection_id),
    CONSTRAINT fk_book_reading_collection_book FOREIGN KEY (book_id) REFERENCES book (id) ON DELETE CASCADE,
    CONSTRAINT fk_book_reading_collection_collection FOREIGN KEY (collection_id) REFERENCES reading_collection (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_book_reading_collection_book ON book_reading_collection (book_id);
CREATE INDEX IF NOT EXISTS idx_book_reading_collection_collection ON book_reading_collection (collection_id);

