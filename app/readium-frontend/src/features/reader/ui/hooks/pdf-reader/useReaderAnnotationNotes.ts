import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import type { ReaderAnnotation } from '../../../domain/models';
import type { AnnotationOverlayInteractPayload } from '../pdf-viewport/PdfDocumentViewport.types';

interface UpdateAnnotationInput {
  id: number;
  color?: string;
  note?: string;
}

interface ActiveAnnotationNoteState {
  annotation: ReaderAnnotation;
  position: { x: number; y: number };
}

interface UseReaderAnnotationNotesParams {
  updateAnnotation: (input: UpdateAnnotationInput) => Promise<unknown>;
}

export const useReaderAnnotationNotes = ({
  updateAnnotation,
}: UseReaderAnnotationNotesParams) => {
  const [activeAnnotationNote, setActiveAnnotationNote] = useState<ActiveAnnotationNoteState | null>(null);
  const [isSavingNote, setIsSavingNote] = useState(false);

  const openAnnotationNote = useCallback((payload: AnnotationOverlayInteractPayload) => {
    setActiveAnnotationNote({
      annotation: payload.annotation,
      position: payload.position,
    });
  }, []);

  const closeAnnotationNote = useCallback(() => {
    setActiveAnnotationNote(null);
  }, []);

  const saveAnnotationNote = useCallback(
    async (note: string) => {
      if (!activeAnnotationNote) {
        return;
      }

      setIsSavingNote(true);
      try {
        await updateAnnotation({
          id: activeAnnotationNote.annotation.id,
          note,
        });
        setActiveAnnotationNote(null);
      } catch {
        toast.error('Falha ao salvar anotacao.');
      } finally {
        setIsSavingNote(false);
      }
    },
    [activeAnnotationNote, updateAnnotation],
  );

  return {
    activeAnnotationNote,
    isSavingNote,
    openAnnotationNote,
    closeAnnotationNote,
    saveAnnotationNote,
  };
};
