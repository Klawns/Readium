package com.br.klaus.readium.translation;

public interface TranslationGateway {

    TranslationAutoResult translate(String text, String targetLanguage);
}
