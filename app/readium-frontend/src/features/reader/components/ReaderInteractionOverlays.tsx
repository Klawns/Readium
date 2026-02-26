import React from 'react';
import type { ReaderAnnotation } from '../domain/models';
import type { PendingSelection } from '../ui/readerTypes';
import type { ActiveTranslationState, TranslationInputState } from '../ui/pdfReader.types';
import { SelectionActionPopup } from '../ui/components/SelectionActionPopup';
import TranslationInputPopup from './TranslationInputPopup';
import TranslationPopup from './TranslationPopup';
import AnnotationNotePopup from './AnnotationNotePopup';

const TOUCH_SELECTION_POPUP_DELAY_MS = 260;

interface ActiveAnnotationNoteState {
  annotation: ReaderAnnotation;
  position: { x: number; y: number };
}

interface ReaderInteractionOverlaysProps {
  pendingSelection: PendingSelection | null;
  isTouchPointerActive: boolean;
  translationInput: TranslationInputState | null;
  activeTranslation: ActiveTranslationState | null;
  activeAnnotationNote: ActiveAnnotationNoteState | null;
  isSavingNote: boolean;
  isDeletingNote: boolean;
  onSelectColor: (color: string) => void;
  onCopySelection: () => void;
  onStartTranslateFlow: () => void;
  onCloseSelection: () => void;
  onSaveTranslation: (value: string) => void;
  onCancelTranslation: () => void;
  onCloseActiveTranslation: () => void;
  onSaveAnnotationNote: (note: string) => void;
  onDeleteAnnotationNote: () => void;
  onCancelAnnotationNote: () => void;
}

export const ReaderInteractionOverlays: React.FC<ReaderInteractionOverlaysProps> = ({
  pendingSelection,
  isTouchPointerActive,
  translationInput,
  activeTranslation,
  activeAnnotationNote,
  isSavingNote,
  isDeletingNote,
  onSelectColor,
  onCopySelection,
  onStartTranslateFlow,
  onCloseSelection,
  onSaveTranslation,
  onCancelTranslation,
  onCloseActiveTranslation,
  onSaveAnnotationNote,
  onDeleteAnnotationNote,
  onCancelAnnotationNote,
}) => {
  const isTouchCapableDevice = React.useMemo(
    () => typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0,
    [],
  );
  const [selectionForPopup, setSelectionForPopup] = React.useState<PendingSelection | null>(null);

  React.useEffect(() => {
    if (!pendingSelection || isTouchPointerActive) {
      setSelectionForPopup(null);
      return;
    }

    if (!isTouchCapableDevice) {
      setSelectionForPopup(pendingSelection);
      return;
    }

    const timerId = window.setTimeout(() => {
      setSelectionForPopup(pendingSelection);
    }, TOUCH_SELECTION_POPUP_DELAY_MS);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [isTouchCapableDevice, isTouchPointerActive, pendingSelection]);

  return (
    <>
      {selectionForPopup && (
        <SelectionActionPopup
          position={selectionForPopup.popupPosition}
          onSelectColor={onSelectColor}
          onCopy={onCopySelection}
          onTranslate={onStartTranslateFlow}
          onClose={onCloseSelection}
        />
      )}

      {translationInput && (
        <TranslationInputPopup
          position={translationInput.position}
          originalText={translationInput.originalText}
          initialValue={translationInput.translatedText}
          detectedLanguage={translationInput.detectedLanguage}
          googleTranslateUrl={translationInput.googleTranslateUrl}
          onSave={onSaveTranslation}
          onCancel={onCancelTranslation}
        />
      )}

      {activeTranslation && (
        <TranslationPopup
          translation={activeTranslation.translation}
          position={activeTranslation.position}
          onClose={onCloseActiveTranslation}
        />
      )}

      {activeAnnotationNote && (
        <AnnotationNotePopup
          annotation={activeAnnotationNote.annotation}
          position={activeAnnotationNote.position}
          isSaving={isSavingNote}
          isDeleting={isDeletingNote}
          onSave={onSaveAnnotationNote}
          onDelete={onDeleteAnnotationNote}
          onCancel={onCancelAnnotationNote}
        />
      )}
    </>
  );
};
