import { useCallback, useState } from 'react';
import type { CreateAnnotationCommand } from '../../../domain/ports/AnnotationRepository';
import type { CreateTranslationCommand } from '../../../domain/ports/TranslationRepository';
import type { PendingSelection } from '../../readerTypes';
import type { TranslationOverlayInteractPayload } from '../pdf-viewport/PdfDocumentViewport.types';
import type { ActiveTranslationState, TranslationInputState } from '../../pdfReader.types';
import { useReaderTranslationInputController } from './useReaderTranslationInputController';
import { useReaderTranslationClipboard } from './useReaderTranslationClipboard';

interface TranslationResult {
  translatedText: string;
  detectedLanguage: string;
}

interface UseReaderTranslationFlowParams {
  bookId: number;
  createAnnotation: (input: CreateAnnotationCommand) => Promise<unknown>;
  autoTranslate: (selectedText: string) => Promise<TranslationResult>;
  persistTranslation: (input: CreateTranslationCommand) => Promise<unknown>;
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

  const translationInputController = useReaderTranslationInputController({
    bookId,
    pendingSelection,
    setPendingSelection,
    translationInput,
    setTranslationInput,
    createAnnotation,
    autoTranslate,
    persistTranslation,
  });
  const { copyPendingSelection, clearPendingSelection } = useReaderTranslationClipboard({
    pendingSelection,
    setPendingSelection,
  });

  const handleTranslationOverlayInteract = useCallback((payload: TranslationOverlayInteractPayload) => {
    setActiveTranslation({
      translation: payload.translation,
      position: payload.position,
    });
  }, []);

  const closeActiveTranslation = useCallback(() => {
    setActiveTranslation(null);
  }, []);

  return {
    pendingSelection,
    translationInput,
    activeTranslation,
    setPendingSelection,
    handleCreateHighlight: translationInputController.handleCreateHighlight,
    startTranslateFlow: translationInputController.startTranslateFlow,
    saveTranslation: translationInputController.saveTranslation,
    copyPendingSelection,
    handleTranslationOverlayInteract,
    closeTranslationInput: translationInputController.closeTranslationInput,
    closeActiveTranslation,
    clearPendingSelection,
  };
};
