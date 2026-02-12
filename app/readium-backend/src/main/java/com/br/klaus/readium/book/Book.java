package com.br.klaus.readium.book;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
public class Book {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

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
        book.setTitle(title);
        book.setFilePath(filePath);
        book.setBookFormat(originalFilename.endsWith(".pdf") ? BookFormat.PDF : BookFormat.EPUB);
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
}
