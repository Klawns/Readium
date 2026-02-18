package com.br.klaus.readium.book.api.dto;

public record UpdateBookStatusRequestDTO(
        Long bookId,
        String status   // TO_READ, READING, READ
) {
}
