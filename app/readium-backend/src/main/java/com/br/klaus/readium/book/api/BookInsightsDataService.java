package com.br.klaus.readium.book.api;

import java.util.List;

public interface BookInsightsDataService {

    List<BookInsightSnapshot> findAllSnapshots();
}

