package com.br.klaus.readium.book;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

public class BookSpecifications {

    public static Specification<Book> hasStatus(Book.BookStatus status) {
        return (root, query, criteriaBuilder) -> {
            if (status == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("bookStatus"), status);
        };
    }

    public static Specification<Book> containsText(String text) {
        return (root, query, criteriaBuilder) -> {
            if (!StringUtils.hasText(text)) {
                return criteriaBuilder.conjunction();
            }
            String likePattern = "%" + text.toLowerCase() + "%";
            
            return criteriaBuilder.or(
                    criteriaBuilder.like(criteriaBuilder.lower(criteriaBuilder.coalesce(root.get("title"), "")), likePattern),
                    criteriaBuilder.like(criteriaBuilder.lower(criteriaBuilder.coalesce(root.get("author"), "")), likePattern)
            );
        };
    }
}
