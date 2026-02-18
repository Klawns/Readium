package com.br.klaus.readium.annotations.api.dto;

import java.util.List;

public record AnnotationRequestDTO(
        Long bookId,
        int page,
        List<RectDTO> rects,
        String color,
        String selectedText,
        String note
) {
}
