CREATE TABLE IF NOT EXISTS category (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    version BIGINT NOT NULL DEFAULT 0,
    name VARCHAR(80) NOT NULL,
    slug VARCHAR(96) NOT NULL UNIQUE,
    color VARCHAR(7) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_category_name ON category (name);

CREATE TABLE IF NOT EXISTS book_category (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_book_category_book_category UNIQUE (book_id, category_id),
    CONSTRAINT fk_book_category_book FOREIGN KEY (book_id) REFERENCES book (id) ON DELETE CASCADE,
    CONSTRAINT fk_book_category_category FOREIGN KEY (category_id) REFERENCES category (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_book_category_book ON book_category (book_id);
CREATE INDEX IF NOT EXISTS idx_book_category_category ON book_category (category_id);
