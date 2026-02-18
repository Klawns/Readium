package com.br.klaus.readium.book.api.dto;

import java.time.LocalDateTime;

public record BookTextLayerQualityResponseDTO(
        Long bookId,
        Double score,
        String status,
        LocalDateTime updatedAt
) {
}
