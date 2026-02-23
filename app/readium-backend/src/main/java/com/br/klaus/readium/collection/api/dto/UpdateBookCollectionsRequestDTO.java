package com.br.klaus.readium.collection.api.dto;

import jakarta.validation.constraints.NotNull;

import java.util.List;

public record UpdateBookCollectionsRequestDTO(
        @NotNull
        List<Long> collectionIds
) {
}

