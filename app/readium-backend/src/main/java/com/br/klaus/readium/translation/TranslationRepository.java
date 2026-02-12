package com.br.klaus.readium.translation;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TranslationRepository extends JpaRepository<Translation, Long> {
    
    // Busca traduções específicas do livro OU globais (bookId is null)
    @Query("SELECT t FROM Translation t WHERE t.bookId = :bookId OR t.bookId IS NULL")
    List<Translation> findByBookIdOrGlobal(Long bookId);

    Optional<Translation> findByBookIdAndOriginalText(Long bookId, String originalText);
}
