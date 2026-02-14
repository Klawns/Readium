package com.br.klaus.readium.book;

public final class BookTitleFormatter {

    private BookTitleFormatter() {
    }

    public static String fromFilename(String filename) {
        if (filename == null || filename.isBlank()) {
            return "Sem Titulo";
        }

        int extensionStart = filename.lastIndexOf('.');
        String rawTitle = extensionStart > 0 ? filename.substring(0, extensionStart) : filename;
        return normalize(rawTitle);
    }

    public static String normalize(String value) {
        if (value == null || value.isBlank()) {
            return "Sem Titulo";
        }

        String normalized = value
                .replace('_', ' ')
                .replace('-', ' ')
                .replace('.', ' ')
                .replaceAll("\\s+", " ")
                .trim();

        return normalized.isBlank() ? "Sem Titulo" : normalized;
    }
}
