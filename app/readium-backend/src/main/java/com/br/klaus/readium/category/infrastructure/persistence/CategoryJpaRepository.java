package com.br.klaus.readium.category.infrastructure.persistence;

import com.br.klaus.readium.category.domain.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface CategoryJpaRepository extends JpaRepository<Category, Long> {

    Optional<Category> findBySlug(String slug);

    List<Category> findByIdIn(Collection<Long> ids);

    List<Category> findByParentIdOrderBySortOrderAscNameAsc(Long parentId);

    long countByParentId(Long parentId);

    @Query("""
            select c
            from Category c
            where (:query is null or :query = '' or lower(c.name) like lower(concat('%', :query, '%')))
            order by c.sortOrder asc, lower(c.name) asc
            """)
    List<Category> findByQuery(@Param("query") String query);
}
