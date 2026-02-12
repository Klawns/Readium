export interface TranslateTextCommand {
  text: string;
  targetLanguage: string;
}

export interface TranslationResult {
  detectedLanguage: string;
  translatedText: string;
}

export interface TranslationProvider {
  translate(command: TranslateTextCommand): Promise<TranslationResult>;
}
