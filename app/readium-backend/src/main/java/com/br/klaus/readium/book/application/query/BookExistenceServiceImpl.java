package com.br.klaus.readium.book.application.query;

import com.br.klaus.readium.book.BookRepository;
import com.br.klaus.readium.book.api.BookExistenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BookExistenceServiceImpl implements BookExistenceService {

    private final BookRepository repository;

    @Override
    @Transactional(readOnly = true)
    public boolean existsById(Long bookId) {
        return repository.existsById(bookId);
    }
}
