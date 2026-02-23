package com.br.klaus.readium.category.application.query;

import com.br.klaus.readium.book.api.BookExistenceService;
import com.br.klaus.readium.category.api.CategoryResponseMapper;
import com.br.klaus.readium.category.api.dto.CategoryResponseDTO;
import com.br.klaus.readium.category.domain.model.BookCategory;
import com.br.klaus.readium.category.domain.model.Category;
import com.br.klaus.readium.category.domain.port.BookCategoryRepositoryPort;
import com.br.klaus.readium.category.domain.port.CategoryRepositoryPort;
import com.br.klaus.readium.exception.BookNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryQueryService {

    private final CategoryRepositoryPort categoryRepository;
    private final BookCategoryRepositoryPort bookCategoryRepository;
    private final BookExistenceService bookExistenceService;

    @Transactional(readOnly = true)
    public List<CategoryResponseDTO> findAll(String query) {
        return categoryRepository.findAll(query)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CategoryResponseDTO> findByBookId(Long bookId) {
        requireBookExists(bookId);

        return bookCategoryRepository.findByBookId(bookId)
                .stream()
                .map(BookCategory::getCategory)
                .sorted(Comparator.comparing(Category::getName, String.CASE_INSENSITIVE_ORDER))
                .map(this::toResponse)
                .toList();
    }

    public CategoryResponseDTO toResponse(Category category) {
        long count = bookCategoryRepository.countByCategoryId(category.getId());
        return CategoryResponseMapper.toResponse(category, count);
    }

    private void requireBookExists(Long bookId) {
        if (!bookExistenceService.existsById(bookId)) {
            throw new BookNotFoundException("Livro com ID " + bookId + " nao encontrado.");
        }
    }
}
