import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ReaderAnnotation } from '../domain/models';

interface AnnotationNotePopupProps {
  annotation: ReaderAnnotation;
  position: { x: number; y: number };
  isSaving?: boolean;
  isDeleting?: boolean;
  onSave: (note: string) => void;
  onDelete: () => void;
  onCancel: () => void;
}

const MAX_PREVIEW_LENGTH = 180;

const toPreviewText = (text: string) =>
  text.length > MAX_PREVIEW_LENGTH ? `${text.slice(0, MAX_PREVIEW_LENGTH)}...` : text;

const AnnotationNotePopup: React.FC<AnnotationNotePopupProps> = ({
  annotation,
  position,
  isSaving = false,
  isDeleting = false,
  onSave,
  onDelete,
  onCancel,
}) => {
  const [note, setNote] = useState(annotation.note ?? '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  const selectedTextPreview = useMemo(
    () => toPreviewText(annotation.selectedText.trim()),
    [annotation.selectedText],
  );

  useEffect(() => {
    setNote(annotation.note ?? '');
  }, [annotation.id, annotation.note]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onCancel();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onCancel]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSave(note.trim());
  };

  return (
    <div
      ref={popupRef}
      className="w-[22rem] rounded-2xl border border-border/80 bg-background/95 p-4 shadow-2xl backdrop-blur-sm animate-in fade-in-90 zoom-in-95"
      style={{
        position: 'fixed',
        top: position.y,
        left: position.x,
        transform: 'translateX(-50%) translateY(calc(-100% - 14px))',
        zIndex: 1000,
      }}
    >
      <div className="mb-3 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Anotacao</h3>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onDelete}
            disabled={isDeleting || isSaving}
            className="h-7 w-7 text-destructive hover:text-destructive"
            aria-label="Remover highlight"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        {selectedTextPreview ? (
          <p className="line-clamp-2 rounded-lg bg-muted/70 px-2 py-1 text-xs text-muted-foreground">
            {selectedTextPreview}
          </p>
        ) : null}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          ref={textareaRef}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Escreva sua anotacao..."
          className="min-h-[92px] w-full resize-y rounded-xl border border-border/80 bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
          maxLength={1000}
        />
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">{note.length}/1000</span>
          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={isSaving || isDeleting}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={isSaving || isDeleting}>
              {isSaving ? 'Salvando...' : isDeleting ? 'Removendo...' : 'Salvar'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AnnotationNotePopup;
