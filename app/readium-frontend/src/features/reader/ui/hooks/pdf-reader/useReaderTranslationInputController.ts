import { useCallback } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { CreateAnnotationCommand } from '../../../domain/ports/AnnotationRepository';
import type { CreateTranslationCommand } from '../../../domain/ports/TranslationRepository';
import type { PendingSelection } from '../../readerTypes';
import type { TranslationInputState } from '../../pdfReader.types';
import { buildGoogleTranslateUrl } from './readerTranslationFlow.utils';
import { useReaderTranslationNotifier } from './useReaderTranslationNotifier';

interface TranslationResult {
  translatedText: string;
  detectedLanguage: string;
}

interface UseReaderTranslationInputControllerParams {
  bookId: number;
  pendingSelection: PendingSelection | null;
  setPendingSelection: Dispatch<SetStateAction<PendingSelection | null>>;
  translationInput: TranslationInputState | null;
  setTranslationInput: Dispatch<SetStateAction<TranslationInputState | null>>;
  createAnnotation: (input: CreateAnnotationCommand) => Promise<unknown>;
  autoTranslate: (selectedText: string) => Promise<TranslationResult>;
  persistTranslation: (input: CreateTranslationCommand) => Promise<unknown>;
}

export const useReaderTranslationInputController = ({
  bookId,
  pendingSelection,
  setPendingSelection,
  translationInput,
  setTranslationInput,
  createAnnotation,
  autoTranslate,
  persistTranslation,
}: UseReaderTranslationInputControllerParams) => {
  const {
    notifyGoogleTranslatePopupBlocked,
    notifyAutomaticTranslationUnavailable,
    notifyAutomaticTranslationFailed,
  } = useReaderTranslationNotifier();

  const openGoogleTranslateFallback = useCallback((googleTranslateUrl: string) => {
    const openedTab = window.open(googleTranslateUrl, '_blank', 'noopener,noreferrer');
    if (!openedTab) {
      notifyGoogleTranslatePopupBlocked();
    }
  }, [notifyGoogleTranslatePopupBlocked]);

  const handleCreateHighlight = useCallback(
    async (color: string) => {
      if (!pendingSelection) {
        return;
      }

      await createAnnotation({
        bookId,
        page: pendingSelection.page,
        rects: pendingSelection.rects,
        color,
        selectedText: pendingSelection.text,
      });

      setPendingSelection(null);
    },
    [bookId, createAnnotation, pendingSelection, setPendingSelection],
  );

  const startTranslateFlow = useCallback(async () => {
    if (!pendingSelection) {
      return;
    }

    const googleTranslateUrl = buildGoogleTranslateUrl(pendingSelection.text);

    try {
      const autoTranslation = await autoTranslate(pendingSelection.text);
      const originalNormalized = pendingSelection.text.trim().toLowerCase();
      const translatedNormalized = autoTranslation.translatedText.trim().toLowerCase();
      const didNotTranslate = Boolean(originalNormalized) && translatedNormalized === originalNormalized;

      if (didNotTranslate) {
        notifyAutomaticTranslationUnavailable();
        openGoogleTranslateFallback(googleTranslateUrl);
      }

      setTranslationInput({
        position: pendingSelection.popupPosition,
        originalText: pendingSelection.text,
        translatedText: didNotTranslate ? '' : autoTranslation.translatedText,
        detectedLanguage: autoTranslation.detectedLanguage,
        googleTranslateUrl: didNotTranslate ? googleTranslateUrl : undefined,
        page: pendingSelection.page,
        rects: pendingSelection.rects,
      });
    } catch (error: unknown) {
      notifyAutomaticTranslationFailed(error);
      openGoogleTranslateFallback(googleTranslateUrl);
      setTranslationInput({
        position: pendingSelection.popupPosition,
        originalText: pendingSelection.text,
        translatedText: '',
        detectedLanguage: 'unknown',
        googleTranslateUrl,
        page: pendingSelection.page,
        rects: pendingSelection.rects,
      });
    }

    setPendingSelection(null);
  }, [
    autoTranslate,
    notifyAutomaticTranslationFailed,
    notifyAutomaticTranslationUnavailable,
    openGoogleTranslateFallback,
    pendingSelection,
    setPendingSelection,
    setTranslationInput,
  ]);

  const saveTranslation = useCallback(
    async (translatedText: string) => {
      if (!translationInput) {
        return;
      }

      await persistTranslation({
        bookId,
        originalText: translationInput.originalText.trim().toLowerCase(),
        translatedText,
      });

      await createAnnotation({
        bookId,
        page: translationInput.page,
        rects: translationInput.rects,
        color: '#FDE68A',
        selectedText: translationInput.originalText,
        note: translatedText,
      });

      setTranslationInput(null);
    },
    [bookId, createAnnotation, persistTranslation, setTranslationInput, translationInput],
  );

  const closeTranslationInput = useCallback(() => {
    setTranslationInput(null);
  }, [setTranslationInput]);

  return {
    handleCreateHighlight,
    startTranslateFlow,
    saveTranslation,
    closeTranslationInput,
  };
};
