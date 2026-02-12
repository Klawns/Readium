package com.br.klaus.readium.book;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface BookRepository extends JpaRepository<Book, Long>, JpaSpecificationExecutor<Book> {
    
    // O método findByBookStatus não é mais estritamente necessário se usarmos Specifications para tudo,
    // mas pode ser mantido para compatibilidade ou uso simples.
    Page<Book> findByBookStatus(Book.BookStatus status, Pageable pageable);
}
