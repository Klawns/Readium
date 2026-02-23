package com.br.klaus.readium.collection.application.command;

import com.br.klaus.readium.book.api.BookExistenceService;
import com.br.klaus.readium.book.events.BookDeletedEvent;
import com.br.klaus.readium.collection.api.dto.CreateReadingCollectionRequestDTO;
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
import java.util.Set;

@Service
@RequiredArgsConstructor
public class ReadingCollectionCommandService {

    private static final String[] COLOR_PALETTE = {
            "#2563EB", "#0EA5E9", "#14B8A6", "#22C55E",
            "#EAB308", "#F97316", "#EF4444", "#EC4899", "#8B5CF6"
    };
    private static final String DEFAULT_ICON = "books";

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

        ReadingCollection saved = collectionRepository.save(
                ReadingCollection.create(name, slug, description, color, icon)
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

        collection.setName(name);
        collection.setSlug(slug);
        collection.setDescription(description);
        collection.setColor(color);
        collection.setIcon(icon);

        ReadingCollection saved = collectionRepository.save(collection);
        return queryService.toResponse(saved);
    }

    @Transactional
    public void delete(Long collectionId) {
        ReadingCollection collection = collectionRepository.findById(collectionId)
                .orElseThrow(() -> new CollectionNotFoundException(
                        "Colecao com ID " + collectionId + " nao encontrada."
                ));

        bookCollectionRepository.deleteByCollectionId(collection.getId());
        collectionRepository.deleteById(collection.getId());
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

