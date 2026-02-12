package com.br.klaus.readium.book;

import com.br.klaus.readium.book.dto.BookFilterDTO;
import com.br.klaus.readium.book.dto.BookOcrStatusResponseDTO;
import com.br.klaus.readium.book.dto.BookResponseDTO;
import com.br.klaus.readium.book.dto.BookTextLayerQualityResponseDTO;
import com.br.klaus.readium.book.dto.UpdateBookStatusRequestDTO;
import com.br.klaus.readium.book.dto.UpdateProgressRequestDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/books")
@RequiredArgsConstructor
@Slf4j
public class BookController {

    private final BookService service;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<BookResponseDTO> uploadBook(@RequestParam("file") MultipartFile file) throws IOException {
        log.info("Recebendo upload de arquivo: {}", file.getOriginalFilename());
        BookResponseDTO response = service.save(file);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<Page<BookResponseDTO>> findAll(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String query,
            @PageableDefault(size = 12) Pageable pageable) {
        
        log.info("Listando livros. Status: {}, Query: {}, Page: {}", status, query, pageable.getPageNumber());
        
        BookFilterDTO filter = new BookFilterDTO(status, query);
        Page<BookResponseDTO> result = service.findAll(filter, pageable);
        
        log.info("Livros encontrados: {}", result.getTotalElements());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookResponseDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteById(@PathVariable Long id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/status")
    public ResponseEntity<Void> updateStatus(@RequestBody UpdateBookStatusRequestDTO req) {
        service.changeBookStatus(req);
        return ResponseEntity.noContent().build();
    }
    
    @PatchMapping("/{id}/progress")
    public ResponseEntity<Void> updateProgress(
            @PathVariable Long id,
            @RequestBody @Valid UpdateProgressRequestDTO req) {
        service.updateProgress(id, req);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/file")
    public ResponseEntity<Resource> downloadFile(@PathVariable Long id) {
        Resource resource = service.getBookFile(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

    @GetMapping(value = "/{id}/cover", produces = MediaType.IMAGE_JPEG_VALUE)
    public ResponseEntity<Resource> getCover(@PathVariable Long id) {
        Resource cover = service.getBookCover(id);
        return ResponseEntity.ok(cover);
    }

    @PostMapping("/{id}/ocr")
    public ResponseEntity<Void> queueOcr(@PathVariable Long id) {
        service.queueOcr(id);
        return ResponseEntity.accepted().build();
    }

    @GetMapping("/{id}/ocr-status")
    public ResponseEntity<BookOcrStatusResponseDTO> getOcrStatus(@PathVariable Long id) {
        return ResponseEntity.ok(service.getOcrStatus(id));
    }

    @GetMapping("/{id}/text-layer-quality")
    public ResponseEntity<BookTextLayerQualityResponseDTO> getTextLayerQuality(@PathVariable Long id) {
        return ResponseEntity.ok(service.getTextLayerQuality(id));
    }
}
