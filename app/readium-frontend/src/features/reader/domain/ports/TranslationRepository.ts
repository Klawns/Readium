import type { ReaderTranslation } from '../models';

export interface CreateTranslationCommand {
  bookId: number;
  originalText: string;
  translatedText: string;
  contextSentence?: string;
}

export interface TranslationRepository {
  getByBook(bookId: number): Promise<ReaderTranslation[]>;
  create(command: CreateTranslationCommand): Promise<ReaderTranslation>;
}
