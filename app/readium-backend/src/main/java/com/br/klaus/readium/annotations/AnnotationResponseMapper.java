package com.br.klaus.readium.annotations;

import com.br.klaus.readium.annotations.dto.AnnotationResponseDTO;
import org.springframework.data.domain.Page;

import java.util.List;

public final class AnnotationResponseMapper {

    private AnnotationResponseMapper() {
    }

    public static List<AnnotationResponseDTO> fromPage(Page<Annotation> page) {
        return page.getContent().stream().map(AnnotationResponseDTO::fromEntity).toList();
    }
}
