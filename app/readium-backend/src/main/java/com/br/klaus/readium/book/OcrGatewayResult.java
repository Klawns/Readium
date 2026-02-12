package com.br.klaus.readium.book;

public record OcrGatewayResult(
        String processedFilePath,
        Double score
) {
}
