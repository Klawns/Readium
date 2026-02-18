package com.br.klaus.readium.translation.domain.port;

import com.br.klaus.readium.translation.TranslationAutoResult;

public interface TranslationGatewayPort {

    TranslationAutoResult translate(String text, String targetLanguage);
}