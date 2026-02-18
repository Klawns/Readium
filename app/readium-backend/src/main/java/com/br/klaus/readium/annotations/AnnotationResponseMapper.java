package com.br.klaus.readium.annotations;

import com.br.klaus.readium.annotations.dto.AnnotationResponseDTO;
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
                annotation.getRects(),
                annotation.getColor(),
                annotation.getSelectedText(),
                annotation.getNote()
        );
    }

    public static List<AnnotationResponseDTO> fromPage(Page<Annotation> page) {
        return page.getContent().stream().map(AnnotationResponseMapper::toResponse).toList();
    }
}
