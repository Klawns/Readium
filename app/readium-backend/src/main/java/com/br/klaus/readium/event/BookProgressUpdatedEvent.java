package com.br.klaus.readium.event;

import java.time.LocalDateTime;

public record BookProgressUpdatedEvent(
        Long bookId,
        Integer lastReadPage,
        String status,
        LocalDateTime updatedAt
) {
}
