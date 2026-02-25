import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils.ts';
import type { ReaderAnnotation } from '../domain/models';
import { useDismissOnPointerDownOutside } from '../ui/hooks/useDismissOnPointerDownOutside';
import { useReaderPopupLayout } from '../ui/hooks/useReaderPopupLayout';

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
  const { isMobile, style } = useReaderPopupLayout({
    position,
    desktopWidth: 352,
    desktopOffset: 14,
  });

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

  useDismissOnPointerDownOutside(popupRef, onCancel);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSave(note.trim());
  };

  return (
    <div
      ref={popupRef}
      className={cn(
        'reader-popup-surface rounded-2xl animate-in fade-in-90 zoom-in-95',
        isMobile ? 'w-auto p-3.5' : 'w-[22rem] p-4',
      )}
      style={style}
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
            className={cn('text-destructive hover:text-destructive', isMobile ? 'h-8 w-8' : 'h-7 w-7')}
            aria-label="Remover highlight"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        {selectedTextPreview ? (
          <p className="line-clamp-2 rounded-lg border border-slate-900/10 bg-slate-50 px-2 py-1 text-xs text-slate-500">
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
          className={cn(
            'w-full resize-y rounded-xl border border-slate-900/10 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-slate-400 focus:ring-2 focus:ring-slate-300/60',
            isMobile ? 'min-h-[84px]' : 'min-h-[92px]',
          )}
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
