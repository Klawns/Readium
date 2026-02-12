import { httpClient } from '@/services/http';
import { AutoTranslationResponseSchema } from '@/services/schemas';
import type {
  TranslationProvider,
  TranslationResult,
} from '../../domain/ports/TranslationProvider';

export class BackendTranslationProvider implements TranslationProvider {
  async translate({ text, targetLanguage }: { text: string; targetLanguage: string }): Promise<TranslationResult> {
    const sanitizedText = text.trim();
    if (!sanitizedText) {
      return {
        detectedLanguage: 'unknown',
        translatedText: '',
      };
    }

    const response = await httpClient.post('/translations/auto', {
      text: sanitizedText,
      targetLanguage,
    });

    if (response.status >= 400) {
      throw new Error(`Translation API failed (${response.status})`);
    }

    return AutoTranslationResponseSchema.parse(response.data);
  }
}
