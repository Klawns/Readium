package com.br.klaus.readium.collection.domain.service;

import java.text.Normalizer;
import java.util.Locale;
import java.util.regex.Pattern;

public final class ReadingCollectionSlugService {

    private static final Pattern NON_ALNUM = Pattern.compile("[^a-z0-9]+");
    private static final Pattern EDGE_DASH = Pattern.compile("(^-|-$)");

    private ReadingCollectionSlugService() {
    }

    public static String toSlug(String input) {
        if (input == null || input.isBlank()) {
            return "colecao";
        }

        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD)
                .replaceAll("\\p{M}+", "")
                .toLowerCase(Locale.ROOT)
                .trim();

        String slug = NON_ALNUM.matcher(normalized).replaceAll("-");
        slug = EDGE_DASH.matcher(slug).replaceAll("");

        if (slug.isBlank()) {
            return "colecao";
        }

        return slug;
    }
}

