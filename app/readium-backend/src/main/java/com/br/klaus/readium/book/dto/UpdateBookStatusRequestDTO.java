package com.br.klaus.readium.book.dto;

public record UpdateBookStatusRequestDTO(
        Long bookId,
        String status   // TO_READ, READING, READ
) {
}
