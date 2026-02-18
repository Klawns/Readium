package com.br.klaus.readium.book;

import com.br.klaus.readium.book.application.command.BookCommandService;
import com.br.klaus.readium.book.application.query.BookQueryService;
import com.br.klaus.readium.book.dto.BookFilterDTO;
import com.br.klaus.readium.book.dto.BookOcrStatusResponseDTO;
import com.br.klaus.readium.book.dto.BookResponseDTO;
import com.br.klaus.readium.book.dto.BookTextLayerQualityResponseDTO;
import com.br.klaus.readium.book.dto.PagedResponseDTO;
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

    private final BookCommandService commandService;
    private final BookQueryService queryService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<BookResponseDTO> uploadBook(@RequestParam("file") MultipartFile file) throws IOException {
        log.info("Recebendo upload de arquivo: {}", file.getOriginalFilename());
        BookResponseDTO response = commandService.upload(file);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<PagedResponseDTO<BookResponseDTO>> findAll(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String query,
            @PageableDefault(size = 12) Pageable pageable) {
        
        log.info("Listando livros. Status: {}, Query: {}, Page: {}", status, query, pageable.getPageNumber());
        
        BookFilterDTO filter = new BookFilterDTO(status, query);
        Page<BookResponseDTO> result = queryService.findAll(filter, pageable);
        
        log.info("Livros encontrados: {}", result.getTotalElements());
        return ResponseEntity.ok(PagedResponseDTO.fromPage(result));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookResponseDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(queryService.findById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteById(@PathVariable Long id) {
        commandService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/status")
    public ResponseEntity<Void> updateStatus(@RequestBody UpdateBookStatusRequestDTO req) {
        commandService.changeBookStatus(req);
        return ResponseEntity.noContent().build();
    }
    
    @PatchMapping("/{id}/progress")
    public ResponseEntity<Void> updateProgress(
            @PathVariable Long id,
            @RequestBody @Valid UpdateProgressRequestDTO req) {
        commandService.updateProgress(id, req);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/file")
    public ResponseEntity<Resource> downloadFile(@PathVariable Long id) {
        Resource resource = queryService.getBookFile(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

    @GetMapping(value = "/{id}/cover", produces = MediaType.IMAGE_JPEG_VALUE)
    public ResponseEntity<Resource> getCover(@PathVariable Long id) {
        Resource cover = queryService.getBookCover(id);
        return ResponseEntity.ok(cover);
    }

    @PostMapping("/{id}/ocr")
    public ResponseEntity<Void> queueOcr(@PathVariable Long id) {
        commandService.queueOcr(id);
        return ResponseEntity.accepted().build();
    }

    @GetMapping("/{id}/ocr-status")
    public ResponseEntity<BookOcrStatusResponseDTO> getOcrStatus(@PathVariable Long id) {
        return ResponseEntity.ok(queryService.getOcrStatus(id));
    }

    @GetMapping("/{id}/text-layer-quality")
    public ResponseEntity<BookTextLayerQualityResponseDTO> getTextLayerQuality(@PathVariable Long id) {
        return ResponseEntity.ok(queryService.getTextLayerQuality(id));
    }
}
