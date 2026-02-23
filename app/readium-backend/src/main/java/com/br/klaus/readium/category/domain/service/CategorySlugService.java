package com.br.klaus.readium.category.domain.service;

import java.text.Normalizer;
import java.util.Locale;

public final class CategorySlugService {

    private CategorySlugService() {
    }

    public static String toSlug(String value) {
        if (value == null) {
            return "categoria";
        }

        String normalized = Normalizer.normalize(value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase(Locale.ROOT)
                .trim()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-{2,}", "-")
                .replaceAll("^-|-$", "");

        return normalized.isBlank() ? "categoria" : normalized;
    }
}
