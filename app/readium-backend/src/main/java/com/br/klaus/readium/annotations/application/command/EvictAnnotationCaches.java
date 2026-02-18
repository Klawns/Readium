package com.br.klaus.readium.annotations.application.command;

import com.br.klaus.readium.config.CacheNames;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Caching;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Caching(evict = {
        @CacheEvict(cacheNames = CacheNames.ANNOTATIONS_BY_BOOK, allEntries = true),
        @CacheEvict(cacheNames = CacheNames.ANNOTATIONS_BY_BOOK_PAGE, allEntries = true)
})
public @interface EvictAnnotationCaches {
}

