package com.br.klaus.readium.book.dto;

import java.time.LocalDateTime;

public record BookOcrStatusResponseDTO(
        Long bookId,
        String status,
        Double score,
        LocalDateTime updatedAt
) {
}
