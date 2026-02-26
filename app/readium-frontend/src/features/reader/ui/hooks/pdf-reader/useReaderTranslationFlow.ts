import { useCallback, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { createLogger } from '@/lib/logger.ts';
import type { CreateAnnotationCommand } from '../../../domain/ports/AnnotationRepository';
import type { CreateTranslationCommand } from '../../../domain/ports/TranslationRepository';
import type { PendingSelection } from '../../readerTypes';
import type { TranslationOverlayInteractPayload } from '../pdf-viewport/PdfDocumentViewport.types';
import type { ActiveTranslationState, TranslationInputState } from '../../pdfReader.types';
import { useReaderTranslationInputController } from './useReaderTranslationInputController';
import { useReaderTranslationClipboard } from './useReaderTranslationClipboard';

const logger = createLogger('reader-translation-flow');

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

const EPSILON = 0.0001;

const isPendingSelectionEqual = (left: PendingSelection | null, right: PendingSelection | null): boolean => {
  if (left === right) {
    return true;
  }

  if (!left || !right) {
    return false;
  }

  if (
    left.text !== right.text ||
    left.page !== right.page ||
    left.rects.length !== right.rects.length ||
    Math.abs(left.popupPosition.x - right.popupPosition.x) > EPSILON ||
    Math.abs(left.popupPosition.y - right.popupPosition.y) > EPSILON
  ) {
    return false;
  }

  for (let index = 0; index < left.rects.length; index += 1) {
    const leftRect = left.rects[index];
    const rightRect = right.rects[index];
    if (
      Math.abs(leftRect.x - rightRect.x) > EPSILON ||
      Math.abs(leftRect.y - rightRect.y) > EPSILON ||
      Math.abs(leftRect.width - rightRect.width) > EPSILON ||
      Math.abs(leftRect.height - rightRect.height) > EPSILON
    ) {
      return false;
    }
  }

  return true;
};

export const useReaderTranslationFlow = ({
  bookId,
  createAnnotation,
  autoTranslate,
  persistTranslation,
}: UseReaderTranslationFlowParams) => {
  const [pendingSelection, setPendingSelection] = useState<PendingSelection | null>(null);
  const [translationInput, setTranslationInput] = useState<TranslationInputState | null>(null);
  const [activeTranslation, setActiveTranslation] = useState<ActiveTranslationState | null>(null);

  const setPendingSelectionWithLog = useCallback<Dispatch<SetStateAction<PendingSelection | null>>>((value) => {
    setPendingSelection((previous) => {
      const selection = typeof value === 'function' ? value(previous) : value;
      if (isPendingSelectionEqual(previous, selection)) {
        return previous;
      }
      logger.debug('pending selection state updated', {
        hasSelection: Boolean(selection),
        page: selection?.page ?? null,
        rectCount: selection?.rects.length ?? 0,
        textLength: selection?.text.length ?? 0,
      });
      return selection;
    });
  }, []);

  const translationInputController = useReaderTranslationInputController({
    bookId,
    pendingSelection,
    setPendingSelection: setPendingSelectionWithLog,
    translationInput,
    setTranslationInput,
    createAnnotation,
    autoTranslate,
    persistTranslation,
  });
  const { copyPendingSelection, clearPendingSelection } = useReaderTranslationClipboard({
    pendingSelection,
    setPendingSelection: setPendingSelectionWithLog,
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
    setPendingSelection: setPendingSelectionWithLog,
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
