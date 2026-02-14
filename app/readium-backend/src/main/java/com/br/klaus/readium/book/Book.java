package com.br.klaus.readium.book;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Locale;

@Entity
@Table(indexes = {
        @Index(name = "idx_book_status", columnList = "book_status"),
        @Index(name = "idx_book_title", columnList = "title"),
        @Index(name = "idx_book_author", columnList = "author"),
        @Index(name = "idx_book_ocr_status", columnList = "ocr_status")
})
@Data
public class Book {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Version
    private Long version;

    private String title;
    private String author;
    private Integer pages;
    
    // Novo campo para progresso de leitura
    private Integer lastReadPage = 0;

    @JsonIgnore
    private String coverPath;

    private boolean hasCover = false;

    @JsonIgnore
    private String filePath;

    @JsonIgnore
    private String ocrFilePath;

    @Enumerated(EnumType.STRING)
    private BookFormat bookFormat;

    @Enumerated(EnumType.STRING)
    private BookStatus bookStatus;

    @Enumerated(EnumType.STRING)
    private OcrStatus ocrStatus = OcrStatus.PENDING;

    private Double ocrScore;

    private LocalDateTime ocrUpdatedAt;

    public enum BookFormat {
        PDF,
        EPUB,
    }

    public enum BookStatus {
        READING,
        TO_READ,
        READ
    }

    public enum OcrStatus {
        PENDING,
        RUNNING,
        DONE,
        FAILED
    }

    public static Book create(String title, String filePath, String originalFilename) {
        Book book = new Book();
        String normalizedFilename = originalFilename == null ? "" : originalFilename.toLowerCase(Locale.ROOT);

        book.setTitle(title);
        book.setFilePath(filePath);
        book.setBookFormat(normalizedFilename.endsWith(".pdf") ? BookFormat.PDF : BookFormat.EPUB);
        book.setBookStatus(BookStatus.TO_READ);
        book.setLastReadPage(0);
        book.setOcrStatus(OcrStatus.PENDING);
        book.setOcrUpdatedAt(LocalDateTime.now());
        return book;
    }

    public void markOcrQueued() {
        this.ocrStatus = OcrStatus.PENDING;
        this.ocrUpdatedAt = LocalDateTime.now();
    }

    public void markOcrRunning() {
        this.ocrStatus = OcrStatus.RUNNING;
        this.ocrUpdatedAt = LocalDateTime.now();
    }

    public void markOcrDone(Double score, String processedFilePath) {
        this.ocrStatus = OcrStatus.DONE;
        this.ocrScore = score;
        if (processedFilePath != null && !processedFilePath.isBlank()) {
            this.ocrFilePath = processedFilePath;
        }
        this.ocrUpdatedAt = LocalDateTime.now();
    }

    public void markOcrFailed() {
        this.ocrStatus = OcrStatus.FAILED;
        this.ocrUpdatedAt = LocalDateTime.now();
    }

    public void updateReadingProgress(int newPage) {
        if (newPage < 0) {
            throw new IllegalArgumentException("Pagina invalida. O valor nao pode ser negativo.");
        }
        if (this.pages != null && newPage > this.pages) {
            throw new IllegalArgumentException("Pagina invalida. O livro so tem " + this.pages + " paginas.");
        }

        this.lastReadPage = newPage;

        if ((this.bookStatus == null || this.bookStatus == BookStatus.TO_READ) && newPage > 0) {
            this.bookStatus = BookStatus.READING;
        }
        if (this.pages != null && newPage == this.pages) {
            this.bookStatus = BookStatus.READ;
        }
    }
}
