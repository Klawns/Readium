package com.br.klaus.readium.category.api;

import com.br.klaus.readium.category.api.dto.CategoryResponseDTO;
import com.br.klaus.readium.category.api.dto.CreateCategoryRequestDTO;
import com.br.klaus.readium.category.api.dto.UpdateBookCategoriesRequestDTO;
import com.br.klaus.readium.category.api.dto.UpdateCategoryRequestDTO;
import com.br.klaus.readium.category.application.command.CategoryCommandService;
import com.br.klaus.readium.category.application.query.CategoryQueryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryCommandService commandService;
    private final CategoryQueryService queryService;

    @GetMapping("/categories")
    public ResponseEntity<List<CategoryResponseDTO>> findAll(
            @RequestParam(required = false) String query) {
        return ResponseEntity.ok(queryService.findAll(query));
    }

    @PostMapping("/categories")
    public ResponseEntity<CategoryResponseDTO> create(
            @RequestBody @Valid CreateCategoryRequestDTO req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(commandService.create(req));
    }

    @PatchMapping("/categories/{id}")
    public ResponseEntity<CategoryResponseDTO> update(
            @PathVariable Long id,
            @RequestBody @Valid UpdateCategoryRequestDTO req) {
        return ResponseEntity.ok(commandService.update(id, req));
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        commandService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/books/{bookId}/categories")
    public ResponseEntity<List<CategoryResponseDTO>> findByBook(@PathVariable Long bookId) {
        return ResponseEntity.ok(queryService.findByBookId(bookId));
    }

    @PutMapping("/books/{bookId}/categories")
    public ResponseEntity<List<CategoryResponseDTO>> updateBookCategories(
            @PathVariable Long bookId,
            @RequestBody @Valid UpdateBookCategoriesRequestDTO req) {
        return ResponseEntity.ok(commandService.updateBookCategories(bookId, req));
    }
}
