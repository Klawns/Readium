package com.br.klaus.readium.book.application.query;

import com.br.klaus.readium.book.api.BookInsightSnapshot;
import com.br.klaus.readium.book.api.BookInsightsDataService;
import com.br.klaus.readium.book.domain.model.Book;
import com.br.klaus.readium.book.domain.port.BookRepositoryPort;
import com.br.klaus.readium.book.domain.service.BookTitleFormatter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BookInsightsDataServiceImpl implements BookInsightsDataService {

    private final BookRepositoryPort bookRepository;

    @Override
    @Transactional(readOnly = true)
    public List<BookInsightSnapshot> findAllSnapshots() {
        return bookRepository.findAll().stream()
                .map(this::toSnapshot)
                .toList();
    }

    private BookInsightSnapshot toSnapshot(Book book) {
        String coverUrl = book.isHasCover() ? "/api/books/" + book.getId() + "/cover" : null;
        String format = book.getBookFormat() != null ? book.getBookFormat().name() : "PDF";
        String status = book.getBookStatus() != null ? book.getBookStatus().name() : "TO_READ";
        String ocrStatus = book.getOcrStatus() != null ? book.getOcrStatus().name() : "PENDING";

        return new BookInsightSnapshot(
                book.getId(),
                BookTitleFormatter.normalize(book.getTitle()),
                book.getAuthor(),
                book.getPages(),
                book.getLastReadPage(),
                format,
                status,
                coverUrl,
                ocrStatus
        );
    }
}

