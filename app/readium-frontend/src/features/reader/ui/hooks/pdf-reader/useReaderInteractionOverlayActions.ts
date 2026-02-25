import { useCallback } from 'react';

interface UseReaderInteractionOverlayActionsParams {
  handleCreateHighlight: (color: string) => Promise<void>;
  copyPendingSelection: () => Promise<void>;
  startTranslateFlow: () => Promise<void>;
  saveTranslation: (value: string) => Promise<void>;
  saveAnnotationNote: (note: string) => Promise<void>;
  deleteAnnotationNote: () => Promise<void>;
}

export const useReaderInteractionOverlayActions = ({
  handleCreateHighlight,
  copyPendingSelection,
  startTranslateFlow,
  saveTranslation,
  saveAnnotationNote,
  deleteAnnotationNote,
}: UseReaderInteractionOverlayActionsParams) => {
  const onSelectColor = useCallback(
    (color: string) => {
      void handleCreateHighlight(color);
    },
    [handleCreateHighlight],
  );

  const onCopySelection = useCallback(() => {
    void copyPendingSelection();
  }, [copyPendingSelection]);

  const onStartTranslateFlow = useCallback(() => {
    void startTranslateFlow();
  }, [startTranslateFlow]);

  const onSaveTranslation = useCallback(
    (value: string) => {
      void saveTranslation(value);
    },
    [saveTranslation],
  );

  const onSaveAnnotationNote = useCallback(
    (note: string) => {
      void saveAnnotationNote(note);
    },
    [saveAnnotationNote],
  );

  const onDeleteAnnotationNote = useCallback(() => {
    void deleteAnnotationNote();
  }, [deleteAnnotationNote]);

  return {
    onSelectColor,
    onCopySelection,
    onStartTranslateFlow,
    onSaveTranslation,
    onSaveAnnotationNote,
    onDeleteAnnotationNote,
  };
};
