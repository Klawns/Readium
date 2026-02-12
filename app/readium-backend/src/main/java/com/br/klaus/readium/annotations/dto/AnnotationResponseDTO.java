package com.br.klaus.readium.annotations.dto;

import com.br.klaus.readium.annotations.Annotation;

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
    public static AnnotationResponseDTO fromEntity(Annotation annotation) {
        return new AnnotationResponseDTO(
                annotation.getId(),
                annotation.getBookId(),
                annotation.getPage(),
                annotation.getRects(),
                annotation.getColor(),
                annotation.getSelectedText(),
                annotation.getNote()
        );
    }
}
