package com.br.klaus.readium.book.domain.port;

import com.br.klaus.readium.book.Book;
import com.br.klaus.readium.book.OcrGatewayResult;

public interface OcrGatewayPort {

    OcrGatewayResult process(Book book);
}