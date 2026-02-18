package com.br.klaus.readium.book.api;

import com.br.klaus.readium.book.domain.model.Book;
import com.br.klaus.readium.book.api.dto.BookTextLayerQualityResponseDTO;

public final class BookTextLayerQualityResponseMapper {

    private BookTextLayerQualityResponseMapper() {
    }

    public static BookTextLayerQualityResponseDTO toResponse(Book book) {
        return new BookTextLayerQualityResponseDTO(
                book.getId(),
                book.getOcrScore(),
                BookOcrMapperSupport.resolveStatus(book),
                book.getOcrUpdatedAt()
        );
    }
}

