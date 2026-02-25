import type { TranslationProvider } from '../../domain/ports/TranslationProvider';
import type {
  CreateTranslationCommand,
  TranslationRepository,
} from '../../domain/ports/TranslationRepository';

export class GetBookTranslationsUseCase {
  constructor(private readonly repository: TranslationRepository) {}

  execute(bookId: number) {
    return this.repository.getByBook(bookId);
  }
}

export class TranslateSelectionUseCase {
  constructor(private readonly provider: TranslationProvider) {}

  execute(text: string) {
    return this.provider.translate({
      text,
      targetLanguage: 'pt',
    });
  }
}

export class PersistTranslationUseCase {
  constructor(private readonly repository: TranslationRepository) {}

  execute(command: CreateTranslationCommand) {
    return this.repository.create(command);
  }
}
