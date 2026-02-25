import { TranslationHttpRepository } from '../../infrastructure/api/translation-http-repository';
import { BackendTranslationProvider } from '../../infrastructure/translation/backend-translation-provider';
import {
  GetBookTranslationsUseCase,
  PersistTranslationUseCase,
  TranslateSelectionUseCase,
} from './translation-use-cases';

const translationRepository = new TranslationHttpRepository();
const translationProvider = new BackendTranslationProvider();

export const getBookTranslationsUseCase = new GetBookTranslationsUseCase(translationRepository);
export const translateSelectionUseCase = new TranslateSelectionUseCase(translationProvider);
export const persistTranslationUseCase = new PersistTranslationUseCase(translationRepository);
