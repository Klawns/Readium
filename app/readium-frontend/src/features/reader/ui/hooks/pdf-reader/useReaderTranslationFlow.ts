import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import type { ReaderRect } from '../../../domain/models';
import type { PendingSelection } from '../../readerTypes';
import type { TranslationOverlayInteractPayload } from '../pdf-viewport/PdfDocumentViewport.types';
import type { ActiveTranslationState, TranslationInputState } from '../../pdfReader.types';
import { createLogger } from '@/lib/logger.ts';
import { GOOGLE_TRANSLATE_TARGET_LANGUAGE } from './pdfReader.constants';

const logger = createLogger('reader');

const buildGoogleTranslateUrl = (text: string) =>
  `https://translate.google.com/?sl=auto&tl=${GOOGLE_TRANSLATE_TARGET_LANGUAGE}&text=${encodeURIComponent(text)}&op=translate`;

interface CreateReaderAnnotationInput {
  bookId: number;
  page: number;
  rects: ReaderRect[];
  color: string;
  selectedText: string;
  note?: string;
}

interface TranslationResult {
  translatedText: string;
  detectedLanguage: string;
}

interface PersistTranslationInput {
  bookId: number;
  originalText: string;
  translatedText: string;
}

interface UseReaderTranslationFlowParams {
  bookId: number;
  createAnnotation: (input: CreateReaderAnnotationInput) => Promise<unknown>;
  autoTranslate: (selectedText: string) => Promise<TranslationResult>;
  persistTranslation: (input: PersistTranslationInput) => Promise<unknown>;
}

export const useReaderTranslationFlow = ({
  bookId,
  createAnnotation,
  autoTranslate,
  persistTranslation,
}: UseReaderTranslationFlowParams) => {
  const [pendingSelection, setPendingSelection] = useState<PendingSelection | null>(null);
  const [translationInput, setTranslationInput] = useState<TranslationInputState | null>(null);
  const [activeTranslation, setActiveTranslation] = useState<ActiveTranslationState | null>(null);

  const openGoogleTranslateFallback = useCallback((googleTranslateUrl: string) => {
    const openedTab = window.open(googleTranslateUrl, '_blank', 'noopener,noreferrer');
    if (!openedTab) {
      toast.warning('Nao foi possivel abrir nova aba. Use o link no popup para abrir o Google Tradutor.');
    }
  }, []);

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
    [bookId, createAnnotation, pendingSelection],
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
        toast.warning('Nao foi possivel traduzir automaticamente esse trecho. Voce pode preencher manualmente.');
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
      logger.error('automatic translation failed', error);
      toast.error('Falha na traducao automatica. Voce pode preencher manualmente.');
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
  }, [autoTranslate, openGoogleTranslateFallback, pendingSelection]);

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
    [bookId, createAnnotation, persistTranslation, translationInput],
  );

  const handleTranslationOverlayInteract = useCallback((payload: TranslationOverlayInteractPayload) => {
    setActiveTranslation({
      translation: payload.translation,
      position: payload.position,
    });
  }, []);

  const closeTranslationInput = useCallback(() => {
    setTranslationInput(null);
  }, []);

  const closeActiveTranslation = useCallback(() => {
    setActiveTranslation(null);
  }, []);

  const clearPendingSelection = useCallback(() => {
    setPendingSelection(null);
  }, []);

  return {
    pendingSelection,
    translationInput,
    activeTranslation,
    setPendingSelection,
    handleCreateHighlight,
    startTranslateFlow,
    saveTranslation,
    handleTranslationOverlayInteract,
    closeTranslationInput,
    closeActiveTranslation,
    clearPendingSelection,
  };
};
