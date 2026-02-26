package com.br.klaus.readium.annotations.api.dto;

import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

public record RectDTO(
        @PositiveOrZero
        double x,
        @PositiveOrZero
        double y,
        @Positive
        double width,
        @Positive
        double height
) {
}
