package com.br.klaus.readium.book;

import com.br.klaus.readium.book.dto.BookFilterDTO;
import com.br.klaus.readium.book.dto.BookOcrStatusResponseDTO;
import com.br.klaus.readium.book.dto.BookResponseDTO;
import com.br.klaus.readium.book.dto.BookTextLayerQualityResponseDTO;
import com.br.klaus.readium.book.dto.UpdateBookStatusRequestDTO;
import com.br.klaus.readium.book.dto.UpdateProgressRequestDTO;

import com.br.klaus.readium.event.BookCreatedEvent;
import com.br.klaus.readium.event.BookDeletedEvent;
import com.br.klaus.readium.event.BookOcrRequestedEvent;
import com.br.klaus.readium.exception.BookNotFoundException;
import com.br.klaus.readium.exception.UnsupportedFileFormatException;
import com.br.klaus.readium.storage.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class BookService {

    private final BookRepository repository;
    private final ApplicationEventPublisher eventPublisher;
    private final FileStorageService storageService;

    @Transactional
    public BookResponseDTO save(MultipartFile file) {
        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());

        if (originalFilename.isBlank() || (!originalFilename.endsWith(".pdf") && !originalFilename.endsWith(".epub"))) {
            throw new UnsupportedFileFormatException("Formato de arquivo não suportado. Apenas .pdf e .epub são permitidos.");
        }

        String filePath = storageService.save(file);

        String title = StringUtils.stripFilenameExtension(originalFilename);
        Book book = Book.create(title, filePath, originalFilename);

        Book savedBook = repository.save(book);
        
        eventPublisher.publishEvent(new BookCreatedEvent(savedBook.getId(), savedBook.getTitle()));
        
        return BookResponseDTO.fromEntity(savedBook);
    }

    @Transactional(readOnly = true)
    public Page<BookResponseDTO> findAll(BookFilterDTO filter, Pageable pageable) {
        // Inicia com uma Specification que sempre retorna true (conjunção vazia)
        // Isso evita o erro "Specification must not be null" que ocorre com Specification.where(null)
        Specification<Book> spec = (root, query, criteriaBuilder) -> criteriaBuilder.conjunction();

        if (filter.status() != null && !filter.status().isBlank() && !filter.status().equals("ALL")) {
            try {
                Book.BookStatus status = Book.BookStatus.valueOf(filter.status().toUpperCase());
                spec = spec.and(BookSpecifications.hasStatus(status));
            } catch (IllegalArgumentException e) {
                // Ignora status inválido
            }
        }

        if (filter.query() != null && !filter.query().isBlank()) {
            spec = spec.and(BookSpecifications.containsText(filter.query()));
        }

        return repository.findAll(spec, pageable)
                .map(BookResponseDTO::fromEntity);
    }

    @Transactional(readOnly = true)
    public BookResponseDTO findById(Long id) {
        return repository.findById(id)
                .map(BookResponseDTO::fromEntity)
                .orElseThrow(() -> new BookNotFoundException("Livro com ID " + id + " não encontrado."));
    }

    @Transactional
    public void deleteById(Long id) {
        Book book = repository.findById(id)
                .orElseThrow(() -> new BookNotFoundException("Livro com ID " + id + " não encontrado para deleção."));

        storageService.delete(book.getFilePath());
        if (book.getCoverPath() != null) {
            storageService.delete(book.getCoverPath());
        }
        if (book.getOcrFilePath() != null && !book.getOcrFilePath().equals(book.getFilePath())) {
            storageService.delete(book.getOcrFilePath());
        }

        repository.deleteById(id);
        
        eventPublisher.publishEvent(new BookDeletedEvent(id));
    }

    @Transactional
    public void changeBookStatus(UpdateBookStatusRequestDTO req) {
        Book book = repository.findById(req.bookId())
                .orElseThrow(() -> new BookNotFoundException("Livro com ID " + req.bookId() + " não encontrado."));

        try {
            Book.BookStatus newStatus = Book.BookStatus.valueOf(req.status());
            book.setBookStatus(newStatus);
            repository.save(book);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Status inválido: " + req.status());
        }
    }
    
    @Transactional
    public void updateProgress(Long bookId, UpdateProgressRequestDTO req) {
        Book book = repository.findById(bookId)
                .orElseThrow(() -> new BookNotFoundException("Livro com ID " + bookId + " não encontrado."));

        // Validação de nulidade para o corpo da requisição
        if (req == null || req.page() == null) {
            // Pode lançar exceção ou simplesmente ignorar a requisição
            // Vamos ignorar para não quebrar o cliente
            return;
        }
        
        Integer newPage = req.page();

        if (book.getPages() != null && newPage > book.getPages()) {
             throw new IllegalArgumentException("Página inválida. O livro só tem " + book.getPages() + " páginas.");
        }

        book.setLastReadPage(newPage);

        if (book.getBookStatus() == Book.BookStatus.TO_READ && newPage > 0) {
            book.setBookStatus(Book.BookStatus.READING);
        }
        
        if (book.getPages() != null && newPage.equals(book.getPages())) {
            book.setBookStatus(Book.BookStatus.READ);
        }

        repository.save(book);
    }

    @Transactional(readOnly = true)
    public Resource getBookFile(Long id) {
        Book book = repository.findById(id)
                .orElseThrow(() -> new BookNotFoundException("Livro com ID " + id + " não encontrado."));
        
        String filePath = book.getFilePath();
        if (book.getOcrStatus() == Book.OcrStatus.DONE
                && book.getOcrFilePath() != null
                && !book.getOcrFilePath().isBlank()) {
            filePath = book.getOcrFilePath();
        }

        return storageService.load(filePath);
    }

    @Transactional(readOnly = true)
    public Resource getBookCover(Long id) {
        Book book = repository.findById(id)
                .orElseThrow(() -> new BookNotFoundException("Livro com ID " + id + " não encontrado."));
        
        if (!book.isHasCover() || book.getCoverPath() == null) {
            throw new BookNotFoundException("Capa não encontrada para o livro com ID " + id);
        }
        
        return storageService.load(book.getCoverPath());
    }

    @Transactional
    public void queueOcr(Long bookId) {
        Book book = repository.findById(bookId)
                .orElseThrow(() -> new BookNotFoundException("Livro com ID " + bookId + " não encontrado."));

        book.markOcrQueued();
        repository.save(book);

        eventPublisher.publishEvent(new BookOcrRequestedEvent(bookId));
    }

    @Transactional(readOnly = true)
    public BookOcrStatusResponseDTO getOcrStatus(Long bookId) {
        Book book = repository.findById(bookId)
                .orElseThrow(() -> new BookNotFoundException("Livro com ID " + bookId + " não encontrado."));

        return BookOcrStatusResponseDTO.fromEntity(book);
    }

    @Transactional(readOnly = true)
    public BookTextLayerQualityResponseDTO getTextLayerQuality(Long bookId) {
        Book book = repository.findById(bookId)
                .orElseThrow(() -> new BookNotFoundException("Livro com ID " + bookId + " não encontrado."));

        return BookTextLayerQualityResponseDTO.fromEntity(book);
    }
}
