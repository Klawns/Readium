package com.br.klaus.readium.translation;

import com.br.klaus.readium.translation.application.command.TranslationCommandService;
import com.br.klaus.readium.translation.application.query.TranslationQueryService;
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

    private final TranslationCommandService commandService;
    private final TranslationQueryService queryService;

    @PostMapping("/translations")
    public ResponseEntity<TranslationResponseDTO> create(@RequestBody TranslationRequestDTO req) {
        TranslationResponseDTO response = commandService.save(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/translations/auto")
    public ResponseEntity<AutoTranslationResponseDTO> autoTranslate(@RequestBody @Valid AutoTranslationRequestDTO req) {
        return ResponseEntity.ok(queryService.autoTranslate(req));
    }

    @GetMapping("/books/{bookId}/translations")
    public ResponseEntity<List<TranslationResponseDTO>> findByBook(@PathVariable Long bookId) {
        return ResponseEntity.ok(queryService.findByBookId(bookId));
    }
}
