package com.br.klaus.readium.annotations.api;

import com.br.klaus.readium.annotations.Annotation;
import com.br.klaus.readium.annotations.Rect;
import com.br.klaus.readium.annotations.api.dto.AnnotationResponseDTO;
import com.br.klaus.readium.annotations.api.dto.RectDTO;
import org.springframework.data.domain.Page;

import java.util.List;

public final class AnnotationResponseMapper {

    private AnnotationResponseMapper() {
    }

    public static AnnotationResponseDTO toResponse(Annotation annotation) {
        return new AnnotationResponseDTO(
                annotation.getId(),
                annotation.getBookId(),
                annotation.getPage(),
                toRectDTOs(annotation.getRects()),
                annotation.getColor(),
                annotation.getSelectedText(),
                annotation.getNote()
        );
    }

    public static List<AnnotationResponseDTO> fromPage(Page<Annotation> page) {
        return page.getContent().stream().map(AnnotationResponseMapper::toResponse).toList();
    }

    private static List<RectDTO> toRectDTOs(List<Rect> rects) {
        if (rects == null) {
            return List.of();
        }

        return rects.stream()
                .map(rect -> new RectDTO(rect.x(), rect.y(), rect.width(), rect.height()))
                .toList();
    }
}
