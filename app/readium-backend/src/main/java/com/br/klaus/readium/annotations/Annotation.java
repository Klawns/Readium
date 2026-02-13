package com.br.klaus.readium.annotations;

import com.br.klaus.readium.annotations.converter.RectListConverter;
import com.br.klaus.readium.annotations.dto.AnnotationRequestDTO;
import com.br.klaus.readium.annotations.dto.RectDTO;
import com.br.klaus.readium.annotations.dto.UpdateAnnotationRequestDTO;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(indexes = {
        @Index(name = "idx_annotation_book_id", columnList = "book_id"),
        @Index(name = "idx_annotation_book_page", columnList = "book_id,page")
})
@Data
public class Annotation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long bookId;

    private int page;

    @Convert(converter = RectListConverter.class)
    @Column(columnDefinition = "TEXT") // SQLite usa TEXT para strings longas/JSON
    private List<RectDTO> rects;

    private String color;

    @Column(length = 1000)
    private String selectedText;
    
    @Column(length = 1000)
    private String note;

    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }

    // Factory Method atualizado
    public static Annotation from(AnnotationRequestDTO req) {
        Annotation annotation = new Annotation();
        annotation.setBookId(req.bookId());
        annotation.setPage(req.page());
        annotation.setRects(req.rects());
        annotation.setColor(req.color());
        annotation.setSelectedText(req.selectedText());
        annotation.setNote(req.note());
        return annotation;
    }

    public void merge(UpdateAnnotationRequestDTO req) {
        if (req.color() != null) this.color = req.color();
        if (req.note() != null) this.note = req.note();
        // Geralmente não atualizamos rects ou selectedText, mas se precisar, adicione aqui
    }
}
