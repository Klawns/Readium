package com.br.klaus.readium.annotations.dto;

import java.util.List;

public record AnnotationResponseDTO(
        Long id,
        Long bookId,
        int page,
        List<RectDTO> rects,
        String color,
        String selectedText,
        String note
) {
}
