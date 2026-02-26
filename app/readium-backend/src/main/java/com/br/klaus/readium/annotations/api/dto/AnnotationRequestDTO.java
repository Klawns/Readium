package com.br.klaus.readium.annotations.api.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record AnnotationRequestDTO(
        @NotNull
        Long bookId,
        @Min(1)
        int page,
        List<@Valid RectDTO> rects,
        @Size(max = 32)
        String color,
        @Size(max = 1000)
        String selectedText,
        @Size(max = 1000)
        String note
) {
}
