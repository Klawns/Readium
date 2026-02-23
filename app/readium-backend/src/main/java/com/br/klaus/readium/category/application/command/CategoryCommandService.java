package com.br.klaus.readium.category.application.command;

import com.br.klaus.readium.book.api.BookExistenceService;
import com.br.klaus.readium.book.events.BookDeletedEvent;
import com.br.klaus.readium.category.api.dto.CategoryResponseDTO;
import com.br.klaus.readium.category.api.dto.CreateCategoryRequestDTO;
import com.br.klaus.readium.category.api.dto.MoveCategoryRequestDTO;
import com.br.klaus.readium.category.api.dto.UpdateBookCategoriesRequestDTO;
import com.br.klaus.readium.category.api.dto.UpdateCategoryRequestDTO;
import com.br.klaus.readium.category.application.query.CategoryQueryService;
import com.br.klaus.readium.category.domain.model.BookCategory;
import com.br.klaus.readium.category.domain.model.Category;
import com.br.klaus.readium.category.domain.port.BookCategoryRepositoryPort;
import com.br.klaus.readium.category.domain.port.CategoryRepositoryPort;
import com.br.klaus.readium.category.domain.service.CategorySlugService;
import com.br.klaus.readium.exception.BookNotFoundException;
import com.br.klaus.readium.exception.CategoryNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.*;

@Service
@RequiredArgsConstructor
public class CategoryCommandService {

    private static final String[] COLOR_PALETTE = {
            "#2563EB", "#0EA5E9", "#14B8A6", "#22C55E",
            "#EAB308", "#F97316", "#EF4444", "#EC4899", "#8B5CF6"
    };

    private final CategoryRepositoryPort categoryRepository;
    private final BookCategoryRepositoryPort bookCategoryRepository;
    private final BookExistenceService bookExistenceService;
    private final CategoryQueryService categoryQueryService;

    @Transactional
    public CategoryResponseDTO create(CreateCategoryRequestDTO req) {
        String name = normalizeName(req.name());
        Long parentId = normalizeParentId(req.parentId());
        validateParentHierarchy(null, parentId);
        String slug = generateUniqueSlug(name, null);
        String color = normalizeColor(req.color(), name);
        int sortOrder = calculateNextSortOrder(parentId);

        Category saved = categoryRepository.save(Category.create(name, slug, color, parentId, sortOrder));
        return categoryQueryService.toResponse(saved);
    }

    @Transactional
    public CategoryResponseDTO update(Long categoryId, UpdateCategoryRequestDTO req) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new CategoryNotFoundException("Categoria com ID " + categoryId + " nao encontrada."));

        String name = normalizeName(req.name());
        Long nextParentId = normalizeParentId(req.parentId());
        validateParentHierarchy(categoryId, nextParentId);
        String slug = generateUniqueSlug(name, categoryId);
        String color = normalizeColor(req.color(), name);
        Long previousParentId = category.getParentId();

        category.setName(name);
        category.setSlug(slug);
        category.setColor(color);
        category.setParentId(nextParentId);

        if (!Objects.equals(previousParentId, nextParentId)) {
            category.setSortOrder(calculateNextSortOrder(nextParentId));
        }

        Category saved = categoryRepository.save(category);
        normalizeSiblingSort(previousParentId);
        normalizeSiblingSort(nextParentId);

        return categoryQueryService.toResponse(saved);
    }

    @Transactional
    public void delete(Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new CategoryNotFoundException("Categoria com ID " + categoryId + " nao encontrada."));

        Long deletedParentId = category.getParentId();

        List<Category> children = categoryRepository.findByParentId(categoryId);
        for (Category child : children) {
            child.setParentId(deletedParentId);
            child.setSortOrder(calculateNextSortOrder(deletedParentId));
            categoryRepository.save(child);
        }

        bookCategoryRepository.deleteByCategoryId(categoryId);
        categoryRepository.deleteById(categoryId);
        normalizeSiblingSort(deletedParentId);
    }

    @Transactional
    public CategoryResponseDTO move(Long categoryId, MoveCategoryRequestDTO req) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new CategoryNotFoundException("Categoria com ID " + categoryId + " nao encontrada."));

        Long targetParentId = normalizeParentId(req.parentId());
        validateParentHierarchy(categoryId, targetParentId);

        Long previousParentId = category.getParentId();
        if (Objects.equals(previousParentId, targetParentId)) {
            return categoryQueryService.toResponse(category);
        }

        category.setParentId(targetParentId);
        category.setSortOrder(calculateNextSortOrder(targetParentId));
        Category saved = categoryRepository.save(category);

        normalizeSiblingSort(previousParentId);
        normalizeSiblingSort(targetParentId);

        return categoryQueryService.toResponse(saved);
    }

    @Transactional
    public List<CategoryResponseDTO> updateBookCategories(Long bookId, UpdateBookCategoriesRequestDTO req) {
        requireBookExists(bookId);

        Set<Long> requestedCategoryIds = sanitizeCategoryIds(req.categoryIds());
        List<Category> categories = requestedCategoryIds.isEmpty()
                ? List.of()
                : categoryRepository.findAllById(requestedCategoryIds);

        if (categories.size() != requestedCategoryIds.size()) {
            Set<Long> foundIds = categories.stream().map(Category::getId).collect(java.util.stream.Collectors.toSet());
            List<Long> missingIds = requestedCategoryIds.stream()
                    .filter(id -> !foundIds.contains(id))
                    .toList();
            throw new CategoryNotFoundException("Categorias nao encontradas para os IDs: " + missingIds);
        }

        bookCategoryRepository.deleteByBookId(bookId);
        if (!categories.isEmpty()) {
            List<BookCategory> links = categories.stream()
                    .map(category -> BookCategory.create(bookId, category))
                    .toList();
            bookCategoryRepository.saveAll(links);
        }

        return categoryQueryService.findByBookId(bookId);
    }

    @EventListener
    @Transactional
    public void onBookDeleted(BookDeletedEvent event) {
        bookCategoryRepository.deleteByBookId(event.id());
    }

    private void requireBookExists(Long bookId) {
        if (!bookExistenceService.existsById(bookId)) {
            throw new BookNotFoundException("Livro com ID " + bookId + " nao encontrado.");
        }
    }

    private Set<Long> sanitizeCategoryIds(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return Set.of();
        }
        Set<Long> sanitized = new LinkedHashSet<>();
        for (Long id : ids) {
            if (id == null || id <= 0) {
                continue;
            }
            sanitized.add(id);
        }
        return sanitized;
    }

    private String normalizeName(String name) {
        String trimmed = name == null ? "" : name.trim();
        if (!StringUtils.hasText(trimmed)) {
            throw new IllegalArgumentException("Nome da categoria e obrigatorio.");
        }
        return trimmed;
    }

    private Long normalizeParentId(Long parentId) {
        if (parentId == null || parentId <= 0) {
            return null;
        }
        return parentId;
    }

    private int calculateNextSortOrder(Long parentId) {
        long siblingsCount = categoryRepository.countByParentId(parentId);
        return (int) Math.min(siblingsCount, Integer.MAX_VALUE);
    }

    private void normalizeSiblingSort(Long parentId) {
        List<Category> siblings = categoryRepository.findByParentId(parentId);
        int index = 0;
        boolean changed = false;
        for (Category sibling : siblings) {
            if (sibling.getSortOrder() != index) {
                sibling.setSortOrder(index);
                changed = true;
            }
            index++;
        }
        if (changed) {
            categoryRepository.saveAll(siblings);
        }
    }

    private void validateParentHierarchy(Long categoryId, Long parentId) {
        if (parentId == null) {
            return;
        }

        Category parent = categoryRepository.findById(parentId)
                .orElseThrow(() -> new CategoryNotFoundException("Categoria pai com ID " + parentId + " nao encontrada."));

        if (categoryId == null) {
            return;
        }
        if (Objects.equals(categoryId, parent.getId())) {
            throw new IllegalArgumentException("Uma categoria nao pode ser pai dela mesma.");
        }

        Long cursor = parent.getParentId();
        while (cursor != null) {
            if (Objects.equals(cursor, categoryId)) {
                throw new IllegalArgumentException("Nao e permitido criar ciclo na hierarquia de categorias.");
            }
            Long currentCursor = cursor;
            Category cursorCategory = categoryRepository.findById(currentCursor)
                    .orElseThrow(() -> new CategoryNotFoundException("Categoria pai com ID " + currentCursor + " nao encontrada."));
            cursor = cursorCategory.getParentId();
        }
    }

    private String normalizeColor(String rawColor, String name) {
        if (StringUtils.hasText(rawColor)) {
            return rawColor.trim().toUpperCase(Locale.ROOT);
        }
        int paletteIndex = Math.floorMod(name.toLowerCase(Locale.ROOT).hashCode(), COLOR_PALETTE.length);
        return COLOR_PALETTE[paletteIndex];
    }

    private String generateUniqueSlug(String name, Long currentCategoryId) {
        String baseSlug = CategorySlugService.toSlug(name);
        String candidate = baseSlug;
        int suffix = 2;

        while (slugBelongsToAnotherCategory(candidate, currentCategoryId)) {
            candidate = baseSlug + "-" + suffix;
            suffix++;
        }

        return candidate;
    }

    private boolean slugBelongsToAnotherCategory(String slug, Long currentCategoryId) {
        Optional<Category> existing = categoryRepository.findBySlug(slug);
        if (existing.isEmpty()) {
            return false;
        }
        if (currentCategoryId == null) {
            return true;
        }
        return !Objects.equals(existing.get().getId(), currentCategoryId);
    }
}
