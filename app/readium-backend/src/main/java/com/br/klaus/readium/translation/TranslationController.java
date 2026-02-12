package com.br.klaus.readium.translation;

import com.br.klaus.readium.translation.dto.AutoTranslationRequestDTO;
import com.br.klaus.readium.translation.dto.AutoTranslationResponseDTO;
import com.br.klaus.readium.translation.dto.TranslationRequestDTO;
import com.br.klaus.readium.translation.dto.TranslationResponseDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class TranslationController {

    private final TranslationService service;

    @PostMapping("/translations")
    public ResponseEntity<TranslationResponseDTO> create(@RequestBody TranslationRequestDTO req) {
        TranslationResponseDTO response = service.save(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/translations/auto")
    public ResponseEntity<AutoTranslationResponseDTO> autoTranslate(@RequestBody @Valid AutoTranslationRequestDTO req) {
        return ResponseEntity.ok(service.autoTranslate(req));
    }

    @GetMapping("/books/{bookId}/translations")
    public ResponseEntity<List<TranslationResponseDTO>> findByBook(@PathVariable Long bookId) {
        return ResponseEntity.ok(service.findByBookId(bookId));
    }
}
