package com.br.klaus.readium.book.domain.model;

public record OcrGatewayResult(
        String processedFilePath,
        Double score
) {
}
