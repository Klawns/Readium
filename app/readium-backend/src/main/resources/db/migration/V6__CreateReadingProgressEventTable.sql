CREATE TABLE IF NOT EXISTS reading_progress_event (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id BIGINT NOT NULL,
    event_date DATE NOT NULL,
    pages_read_delta INTEGER NOT NULL,
    occurred_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_reading_progress_event_book FOREIGN KEY (book_id) REFERENCES book (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_reading_progress_event_date ON reading_progress_event (event_date);
CREATE INDEX IF NOT EXISTS idx_reading_progress_event_book ON reading_progress_event (book_id);
CREATE INDEX IF NOT EXISTS idx_reading_progress_event_occurred_at ON reading_progress_event (occurred_at);

