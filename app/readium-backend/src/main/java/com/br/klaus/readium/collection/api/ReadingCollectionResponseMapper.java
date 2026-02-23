package com.br.klaus.readium.collection.api;

import com.br.klaus.readium.collection.api.dto.ReadingCollectionResponseDTO;
import com.br.klaus.readium.collection.domain.model.ReadingCollection;

public final class ReadingCollectionResponseMapper {

    private ReadingCollectionResponseMapper() {
    }

    public static ReadingCollectionResponseDTO toResponse(ReadingCollection collection, long booksCount) {
        return new ReadingCollectionResponseDTO(
                collection.getId(),
                collection.getName(),
                collection.getSlug(),
                collection.getDescription(),
                collection.getColor(),
                collection.getIcon(),
                booksCount
        );
    }
}

