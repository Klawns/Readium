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
      const details =
        typeof response.data === 'object' && response.data !== null && 'message' in response.data
          ? String((response.data as { message?: unknown }).message ?? '')
          : '';
      throw new Error(details ? `Translation API failed (${response.status}): ${details}` : `Translation API failed (${response.status})`);
    }

    const parsed = AutoTranslationResponseSchema.parse(response.data);
    return {
      detectedLanguage: parsed.detectedLanguage ?? 'unknown',
      translatedText: parsed.translatedText ?? '',
    };
  }
}
