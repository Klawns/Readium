package com.br.klaus.readium.annotations;

import com.br.klaus.readium.annotations.dto.AnnotationRequestDTO;
import com.br.klaus.readium.annotations.dto.AnnotationResponseDTO;
import com.br.klaus.readium.annotations.dto.UpdateAnnotationRequestDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class AnnotationController {

    private final AnnotationService service;

    @PostMapping("/annotations")
    public ResponseEntity<AnnotationResponseDTO> create(@RequestBody AnnotationRequestDTO req) {
        AnnotationResponseDTO response = service.create(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/annotations")
    public ResponseEntity<List<AnnotationResponseDTO>> findAll(
            @RequestParam(defaultValue = "0") int resultPage,
            @RequestParam(defaultValue = "200") int size) {
        return ResponseEntity.ok(service.findAll(resultPage, size));
    }

    @GetMapping("/annotations/book/{bookId}/page/{page}")
    public ResponseEntity<List<AnnotationResponseDTO>> findByBookAndPage(
            @PathVariable Long bookId,
            @PathVariable int page,
            @RequestParam(defaultValue = "0") int resultPage,
            @RequestParam(defaultValue = "200") int size) {
        return ResponseEntity.ok(service.findByBookAndPage(bookId, page, resultPage, size));
    }
    
    @GetMapping("/books/{bookId}/annotations")
    public ResponseEntity<List<AnnotationResponseDTO>> findByBook(
            @PathVariable Long bookId,
            @RequestParam(defaultValue = "0") int resultPage,
            @RequestParam(defaultValue = "200") int size) {
        List<AnnotationResponseDTO> response = service.findByBookId(bookId, resultPage, size);
        log.debug("Returning {} annotations for book {}", response.size(), bookId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/annotations/{id}")
    public ResponseEntity<AnnotationResponseDTO> update(
            @PathVariable Long id,
            @RequestBody UpdateAnnotationRequestDTO req) {
        return ResponseEntity.ok(service.update(id, req));
    }

    @DeleteMapping("/annotations/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
