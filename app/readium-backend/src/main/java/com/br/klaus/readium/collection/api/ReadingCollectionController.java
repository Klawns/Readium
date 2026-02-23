package com.br.klaus.readium.collection.api;

import com.br.klaus.readium.collection.api.dto.CreateReadingCollectionRequestDTO;
import com.br.klaus.readium.collection.api.dto.MoveReadingCollectionRequestDTO;
import com.br.klaus.readium.collection.api.dto.ReadingCollectionResponseDTO;
import com.br.klaus.readium.collection.api.dto.UpdateBookCollectionsRequestDTO;
import com.br.klaus.readium.collection.api.dto.UpdateReadingCollectionRequestDTO;
import com.br.klaus.readium.collection.application.command.ReadingCollectionCommandService;
import com.br.klaus.readium.collection.application.query.ReadingCollectionQueryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ReadingCollectionController {

    private final ReadingCollectionCommandService commandService;
    private final ReadingCollectionQueryService queryService;

    @GetMapping("/collections")
    public ResponseEntity<List<ReadingCollectionResponseDTO>> findAll(
            @RequestParam(required = false) String query
    ) {
        return ResponseEntity.ok(queryService.findAll(query));
    }

    @PostMapping("/collections")
    public ResponseEntity<ReadingCollectionResponseDTO> create(
            @RequestBody @Valid CreateReadingCollectionRequestDTO req
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(commandService.create(req));
    }

    @PatchMapping("/collections/{id}")
    public ResponseEntity<ReadingCollectionResponseDTO> update(
            @PathVariable Long id,
            @RequestBody @Valid UpdateReadingCollectionRequestDTO req
    ) {
        return ResponseEntity.ok(commandService.update(id, req));
    }

    @PatchMapping("/collections/{id}/move")
    public ResponseEntity<ReadingCollectionResponseDTO> move(
            @PathVariable Long id,
            @RequestBody @Valid MoveReadingCollectionRequestDTO req
    ) {
        return ResponseEntity.ok(commandService.move(id, req));
    }

    @DeleteMapping("/collections/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        commandService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/books/{bookId}/collections")
    public ResponseEntity<List<ReadingCollectionResponseDTO>> findByBook(@PathVariable Long bookId) {
        return ResponseEntity.ok(queryService.findByBookId(bookId));
    }

    @PutMapping("/books/{bookId}/collections")
    public ResponseEntity<List<ReadingCollectionResponseDTO>> updateBookCollections(
            @PathVariable Long bookId,
            @RequestBody @Valid UpdateBookCollectionsRequestDTO req
    ) {
        return ResponseEntity.ok(commandService.updateBookCollections(bookId, req));
    }
}
