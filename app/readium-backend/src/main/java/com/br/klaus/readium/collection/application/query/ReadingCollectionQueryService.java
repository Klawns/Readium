package com.br.klaus.readium.collection.application.query;

import com.br.klaus.readium.book.api.BookExistenceService;
import com.br.klaus.readium.collection.api.ReadingCollectionResponseMapper;
import com.br.klaus.readium.collection.api.dto.ReadingCollectionResponseDTO;
import com.br.klaus.readium.collection.domain.model.BookReadingCollection;
import com.br.klaus.readium.collection.domain.model.ReadingCollection;
import com.br.klaus.readium.collection.domain.port.BookReadingCollectionRepositoryPort;
import com.br.klaus.readium.collection.domain.port.ReadingCollectionRepositoryPort;
import com.br.klaus.readium.exception.BookNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReadingCollectionQueryService {

    private final ReadingCollectionRepositoryPort collectionRepository;
    private final BookReadingCollectionRepositoryPort bookCollectionRepository;
    private final BookExistenceService bookExistenceService;

    @Transactional(readOnly = true)
    public List<ReadingCollectionResponseDTO> findAll(String query) {
        return collectionRepository.findAll(query)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ReadingCollectionResponseDTO> findByBookId(Long bookId) {
        requireBookExists(bookId);

        return bookCollectionRepository.findByBookId(bookId)
                .stream()
                .map(BookReadingCollection::getCollection)
                .sorted(Comparator
                        .comparingInt(ReadingCollection::getSortOrder)
                        .thenComparing(ReadingCollection::getName, String.CASE_INSENSITIVE_ORDER))
                .map(this::toResponse)
                .toList();
    }

    public ReadingCollectionResponseDTO toResponse(ReadingCollection collection) {
        long count = bookCollectionRepository.countByCollectionId(collection.getId());
        return ReadingCollectionResponseMapper.toResponse(collection, count);
    }

    private void requireBookExists(Long bookId) {
        if (!bookExistenceService.existsById(bookId)) {
            throw new BookNotFoundException("Livro com ID " + bookId + " nao encontrado.");
        }
    }
}
