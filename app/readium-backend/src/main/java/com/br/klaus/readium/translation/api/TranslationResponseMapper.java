package com.br.klaus.readium.translation.api;

import com.br.klaus.readium.translation.domain.model.Translation;
import com.br.klaus.readium.translation.api.dto.TranslationResponseDTO;

public final class TranslationResponseMapper {

    private TranslationResponseMapper() {
    }

    public static TranslationResponseDTO toResponse(Translation translation) {
        return new TranslationResponseDTO(
                translation.getId(),
                translation.getBookId(),
                translation.getOriginalText(),
                translation.getTranslatedText(),
                translation.getContextSentence()
        );
    }
}
