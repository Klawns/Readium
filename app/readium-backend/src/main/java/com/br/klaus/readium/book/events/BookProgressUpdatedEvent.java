package com.br.klaus.readium.book.events;

import java.time.LocalDateTime;

public record BookProgressUpdatedEvent(
        Long bookId,
        Integer previousLastReadPage,
        Integer currentLastReadPage,
        String status,
        LocalDateTime updatedAt
) {
}
