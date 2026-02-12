import { httpClient } from '@/services/http';
import { TranslationSchema } from '@/services/schemas';
import type {
  CreateTranslationCommand,
  TranslationRepository,
} from '../../domain/ports/TranslationRepository';
import type { ReaderTranslation } from '../../domain/models';

const TranslationResponseSchema = TranslationSchema.array();

type TranslationDto = {
  id: number;
  bookId: number | null;
  originalText: string;
  translatedText: string;
  contextSentence?: string | null;
};

const toReaderTranslation = (translation: TranslationDto): ReaderTranslation => ({
  id: translation.id,
  bookId: translation.bookId,
  originalText: translation.originalText,
  translatedText: translation.translatedText,
  contextSentence: translation.contextSentence ?? undefined,
});

export class TranslationHttpRepository implements TranslationRepository {
  async getByBook(bookId: number): Promise<ReaderTranslation[]> {
    const response = await httpClient.get(`/books/${bookId}/translations`);
    const parsed = TranslationResponseSchema.parse(response.data) as TranslationDto[];
    return parsed.map(toReaderTranslation);
  }

  async create(command: CreateTranslationCommand): Promise<ReaderTranslation> {
    const response = await httpClient.post('/translations', command);
    const parsed = TranslationSchema.parse(response.data) as TranslationDto;
    return toReaderTranslation(parsed);
  }
}
