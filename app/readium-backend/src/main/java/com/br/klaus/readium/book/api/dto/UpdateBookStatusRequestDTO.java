package com.br.klaus.readium.book.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record UpdateBookStatusRequestDTO(
        @NotNull
        Long bookId,
        @NotBlank
        @Pattern(regexp = "TO_READ|READING|READ")
        String status
) {
}
