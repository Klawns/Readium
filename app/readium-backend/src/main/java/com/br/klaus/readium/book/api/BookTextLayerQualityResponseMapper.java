package com.br.klaus.readium.book.api;

import com.br.klaus.readium.book.Book;
import com.br.klaus.readium.book.api.dto.BookTextLayerQualityResponseDTO;

public final class BookTextLayerQualityResponseMapper {

    private BookTextLayerQualityResponseMapper() {
    }

    public static BookTextLayerQualityResponseDTO toResponse(Book book) {
        return new BookTextLayerQualityResponseDTO(
                book.getId(),
                book.getOcrScore(),
                book.getOcrStatus() != null ? book.getOcrStatus().name() : Book.OcrStatus.PENDING.name(),
                book.getOcrUpdatedAt()
        );
    }
}
