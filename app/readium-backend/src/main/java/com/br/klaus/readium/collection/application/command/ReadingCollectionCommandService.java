package com.br.klaus.readium.collection.application.command;

import com.br.klaus.readium.book.api.BookExistenceService;
import com.br.klaus.readium.book.events.BookDeletedEvent;
import com.br.klaus.readium.collection.api.dto.CreateReadingCollectionRequestDTO;
import com.br.klaus.readium.collection.api.dto.MoveReadingCollectionRequestDTO;
import com.br.klaus.readium.collection.api.dto.ReadingCollectionResponseDTO;
import com.br.klaus.readium.collection.api.dto.UpdateBookCollectionsRequestDTO;
import com.br.klaus.readium.collection.api.dto.UpdateReadingCollectionRequestDTO;
import com.br.klaus.readium.collection.application.query.ReadingCollectionQueryService;
import com.br.klaus.readium.collection.domain.model.BookReadingCollection;
import com.br.klaus.readium.collection.domain.model.ReadingCollection;
import com.br.klaus.readium.collection.domain.port.BookReadingCollectionRepositoryPort;
import com.br.klaus.readium.collection.domain.port.ReadingCollectionRepositoryPort;
import com.br.klaus.readium.collection.domain.service.ReadingCollectionSlugService;
import com.br.klaus.readium.exception.BookNotFoundException;
import com.br.klaus.readium.exception.CollectionNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.Objects;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class ReadingCollectionCommandService {

    private static final String[] COLOR_PALETTE = {
            "#2563EB", "#0EA5E9", "#14B8A6", "#22C55E",
            "#EAB308", "#F97316", "#EF4444", "#EC4899", "#8B5CF6"
    };
    private static final String DEFAULT_ICON = "books";
    private static final String DEFAULT_TEMPLATE_ID = "classic";

    private final ReadingCollectionRepositoryPort collectionRepository;
    private final BookReadingCollectionRepositoryPort bookCollectionRepository;
    private final BookExistenceService bookExistenceService;
    private final ReadingCollectionQueryService queryService;

    @Transactional
    public ReadingCollectionResponseDTO create(CreateReadingCollectionRequestDTO req) {
        String name = normalizeName(req.name());
        String slug = generateUniqueSlug(name, null);
        String description = normalizeDescription(req.description());
        String color = normalizeColor(req.color(), name);
        String icon = normalizeIcon(req.icon());
        String templateId = normalizeTemplateId(req.templateId());
        int sortOrder = calculateNextSortOrder();

        ReadingCollection saved = collectionRepository.save(
                ReadingCollection.create(name, slug, description, color, icon, sortOrder, templateId)
        );
        return queryService.toResponse(saved);
    }

    @Transactional
    public ReadingCollectionResponseDTO update(Long collectionId, UpdateReadingCollectionRequestDTO req) {
        ReadingCollection collection = collectionRepository.findById(collectionId)
                .orElseThrow(() -> new CollectionNotFoundException(
                        "Colecao com ID " + collectionId + " nao encontrada."
                ));

        String name = normalizeName(req.name());
        String slug = generateUniqueSlug(name, collectionId);
        String description = normalizeDescription(req.description());
        String color = normalizeColor(req.color(), name);
        String icon = normalizeIcon(req.icon());
        String templateId = normalizeTemplateId(req.templateId());

        collection.setName(name);
        collection.setSlug(slug);
        collection.setDescription(description);
        collection.setColor(color);
        collection.setIcon(icon);
        collection.setTemplateId(templateId);

        ReadingCollection saved = collectionRepository.save(collection);
        return queryService.toResponse(saved);
    }

    @Transactional
    public ReadingCollectionResponseDTO move(Long collectionId, MoveReadingCollectionRequestDTO req) {
        List<ReadingCollection> ordered = collectionRepository.findAll(null);
        if (ordered.isEmpty()) {
            throw new CollectionNotFoundException("Nenhuma colecao encontrada para reordenacao.");
        }

        int currentIndex = indexOfCollection(ordered, collectionId);
        if (currentIndex < 0) {
            throw new CollectionNotFoundException("Colecao com ID " + collectionId + " nao encontrada.");
        }

        int targetIndex = normalizeTargetIndex(req.targetIndex(), ordered.size(), currentIndex);
        if (targetIndex == currentIndex) {
            return queryService.toResponse(ordered.get(currentIndex));
        }

        ReadingCollection moving = ordered.remove(currentIndex);
        ordered.add(targetIndex, moving);

        boolean changed = false;
        for (int index = 0; index < ordered.size(); index++) {
            ReadingCollection collection = ordered.get(index);
            if (collection.getSortOrder() != index) {
                collection.setSortOrder(index);
                changed = true;
            }
        }
        if (changed) {
            collectionRepository.saveAll(ordered);
        }

        return queryService.toResponse(moving);
    }

    @Transactional
    public void delete(Long collectionId) {
        ReadingCollection collection = collectionRepository.findById(collectionId)
                .orElseThrow(() -> new CollectionNotFoundException(
                        "Colecao com ID " + collectionId + " nao encontrada."
        ));

        int removedSortOrder = collection.getSortOrder();
        bookCollectionRepository.deleteByCollectionId(collection.getId());
        collectionRepository.deleteById(collection.getId());
        normalizeSortOrders(removedSortOrder);
    }

    @Transactional
    public List<ReadingCollectionResponseDTO> updateBookCollections(Long bookId, UpdateBookCollectionsRequestDTO req) {
        requireBookExists(bookId);

        Set<Long> requestedCollectionIds = sanitizeCollectionIds(req.collectionIds());
        List<ReadingCollection> collections = requestedCollectionIds.isEmpty()
                ? List.of()
                : collectionRepository.findAllById(requestedCollectionIds);

        if (collections.size() != requestedCollectionIds.size()) {
            Set<Long> foundIds = collections.stream()
                    .map(ReadingCollection::getId)
                    .collect(java.util.stream.Collectors.toSet());
            List<Long> missingIds = requestedCollectionIds.stream()
                    .filter(id -> !foundIds.contains(id))
                    .toList();
            throw new CollectionNotFoundException("Colecoes nao encontradas para os IDs: " + missingIds);
        }

        bookCollectionRepository.deleteByBookId(bookId);
        if (!collections.isEmpty()) {
            List<BookReadingCollection> links = collections.stream()
                    .map(collection -> BookReadingCollection.create(bookId, collection))
                    .toList();
            bookCollectionRepository.saveAll(links);
        }

        return queryService.findByBookId(bookId);
    }

    @EventListener
    @Transactional
    public void onBookDeleted(BookDeletedEvent event) {
        bookCollectionRepository.deleteByBookId(event.id());
    }

    private void requireBookExists(Long bookId) {
        if (!bookExistenceService.existsById(bookId)) {
            throw new BookNotFoundException("Livro com ID " + bookId + " nao encontrado.");
        }
    }

    private Set<Long> sanitizeCollectionIds(List<Long> ids) {
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
            throw new IllegalArgumentException("Nome da colecao e obrigatorio.");
        }
        return trimmed;
    }

    private String normalizeDescription(String description) {
        if (description == null) {
            return null;
        }
        String trimmed = description.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private String normalizeColor(String rawColor, String name) {
        if (StringUtils.hasText(rawColor)) {
            return rawColor.trim().toUpperCase(Locale.ROOT);
        }
        int paletteIndex = Math.floorMod(name.toLowerCase(Locale.ROOT).hashCode(), COLOR_PALETTE.length);
        return COLOR_PALETTE[paletteIndex];
    }

    private String normalizeIcon(String icon) {
        if (!StringUtils.hasText(icon)) {
            return DEFAULT_ICON;
        }
        return icon.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizeTemplateId(String templateId) {
        if (!StringUtils.hasText(templateId)) {
            return DEFAULT_TEMPLATE_ID;
        }
        return templateId.trim().toLowerCase(Locale.ROOT);
    }

    private int calculateNextSortOrder() {
        long totalCollections = collectionRepository.countAll();
        return (int) Math.min(totalCollections, Integer.MAX_VALUE);
    }

    private int indexOfCollection(List<ReadingCollection> collections, Long collectionId) {
        for (int index = 0; index < collections.size(); index++) {
            ReadingCollection collection = collections.get(index);
            if (Objects.equals(collection.getId(), collectionId)) {
                return index;
            }
        }
        return -1;
    }

    private int normalizeTargetIndex(Integer targetIndex, int size, int currentIndex) {
        if (targetIndex == null) {
            return currentIndex;
        }
        if (targetIndex <= 0) {
            return 0;
        }
        if (targetIndex >= size - 1) {
            return size - 1;
        }
        return targetIndex;
    }

    private void normalizeSortOrders(int fromIndex) {
        List<ReadingCollection> ordered = collectionRepository.findAll(null);
        boolean changed = false;
        for (int index = 0; index < ordered.size(); index++) {
            ReadingCollection collection = ordered.get(index);
            if (index >= fromIndex && collection.getSortOrder() != index) {
                collection.setSortOrder(index);
                changed = true;
            }
        }
        if (changed) {
            collectionRepository.saveAll(ordered);
        }
    }

    private String generateUniqueSlug(String name, Long currentCollectionId) {
        String baseSlug = ReadingCollectionSlugService.toSlug(name);
        String candidate = baseSlug;
        int suffix = 2;

        while (slugBelongsToAnotherCollection(candidate, currentCollectionId)) {
            candidate = baseSlug + "-" + suffix;
            suffix++;
        }

        return candidate;
    }

    private boolean slugBelongsToAnotherCollection(String slug, Long currentCollectionId) {
        Optional<ReadingCollection> existing = collectionRepository.findBySlug(slug);
        if (existing.isEmpty()) {
            return false;
        }
        if (currentCollectionId == null) {
            return true;
        }
        return !currentCollectionId.equals(existing.get().getId());
    }
}
