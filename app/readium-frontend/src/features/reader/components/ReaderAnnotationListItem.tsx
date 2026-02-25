import React from 'react';
import type { ReaderAnnotation } from '../domain/models';
import { MAX_HIGHLIGHT_PREVIEW, MAX_NOTE_PREVIEW, toPreview } from './readerAnnotationsSidebar.utils';

interface ReaderAnnotationListItemProps {
  annotation: ReaderAnnotation;
  isCurrentPage: boolean;
  onGoToPage: (page: number) => void;
}

export const ReaderAnnotationListItem: React.FC<ReaderAnnotationListItemProps> = ({
  annotation,
  isCurrentPage,
  onGoToPage,
}) => {
  const highlightPreview = toPreview(annotation.selectedText, MAX_HIGHLIGHT_PREVIEW) || 'Sem trecho marcado';
  const notePreview = toPreview(annotation.note, MAX_NOTE_PREVIEW);

  return (
    <button
      type="button"
      onClick={() => onGoToPage(annotation.page)}
      className={`w-full rounded-xl border px-3 py-2.5 text-left transition ${
        isCurrentPage
          ? 'border-slate-800/15 bg-white/95 shadow-[0_8px_20px_-16px_rgba(15,23,42,0.5)]'
          : 'border-slate-900/10 bg-white/70 hover:bg-white'
      }`}
    >
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">
          Pagina {annotation.page}
        </span>
        {isCurrentPage ? (
          <span className="text-[10px] font-medium text-slate-700">Atual</span>
        ) : null}
      </div>
      <div className="space-y-2">
        <div
          className="rounded-lg border border-slate-900/10 bg-slate-50 px-2 py-1.5 text-xs text-slate-700"
          style={{ borderLeftColor: annotation.color }}
        >
          {highlightPreview}
        </div>
        <div className="rounded-lg border border-slate-900/10 bg-white/70 px-2 py-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Comentario
          </p>
          <p className="mt-0.5 text-xs text-slate-700">{notePreview || 'Sem comentario'}</p>
        </div>
      </div>
    </button>
  );
};
