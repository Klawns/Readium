package com.br.klaus.readium.book.events;

import java.time.LocalDateTime;

public record BookProgressUpdatedEvent(
        Long bookId,
        Integer lastReadPage,
        String status,
        LocalDateTime updatedAt
) {
}
