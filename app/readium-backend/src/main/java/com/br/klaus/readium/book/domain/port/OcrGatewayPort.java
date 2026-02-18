package com.br.klaus.readium.book.domain.port;

import com.br.klaus.readium.book.domain.model.Book;
import com.br.klaus.readium.book.domain.model.OcrGatewayResult;

public interface OcrGatewayPort {

    OcrGatewayResult process(Book book);
}
