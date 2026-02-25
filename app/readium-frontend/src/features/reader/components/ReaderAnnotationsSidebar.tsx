import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight, X, StickyNote } from 'lucide-react';
import type { ReaderAnnotation } from '../domain/models';
import { ReaderAnnotationListItem } from './ReaderAnnotationListItem';
import { sortAnnotations } from './readerAnnotationsSidebar.utils';

interface ReaderAnnotationsSidebarProps {
  annotations: ReaderAnnotation[];
  currentPage: number;
  isOpen: boolean;
  isVisible: boolean;
  onOpenChange: (open: boolean) => void;
  onGoToPage: (page: number) => void;
}

const ReaderAnnotationsSidebar: React.FC<ReaderAnnotationsSidebarProps> = ({
  annotations,
  currentPage,
  isOpen,
  isVisible,
  onOpenChange,
  onGoToPage,
}) => {
  const sortedAnnotations = useMemo(() => sortAnnotations(annotations), [annotations]);
  const isPanelVisible = isVisible && isOpen;

  return (
    <>
      <button
        type="button"
        onClick={() => onOpenChange(true)}
        className={`reader-floating-surface reader-motion-premium-quick absolute right-0 top-1/2 z-40 flex -translate-y-1/2 items-center gap-1 rounded-l-xl rounded-r-none border-r-0 px-2 py-2 text-xs font-medium text-slate-700 hover:bg-white ${
          !isOpen && isVisible ? 'translate-x-0 opacity-100' : 'translate-x-5 opacity-0 pointer-events-none'
        }`}
        aria-expanded={isPanelVisible}
        aria-label="Abrir painel de anotacoes"
      >
        <ChevronLeft className="h-4 w-4" />
        <StickyNote className="h-4 w-4" />
        <span className="hidden sm:inline">Anotacoes</span>
      </button>

      <aside
        className={`reader-floating-surface reader-motion-premium absolute right-0 top-0 z-30 h-full w-[18rem] max-w-[92vw] rounded-l-2xl border-l border-r-0 border-t-0 border-b-0 sm:w-[20rem] ${
          isPanelVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        }`}
        aria-hidden={!isPanelVisible}
      >
        {isPanelVisible ? (
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="reader-floating-surface absolute left-0 top-1/2 z-40 flex -translate-x-full -translate-y-1/2 items-center rounded-l-xl rounded-r-none border-r-0 px-2 py-2 text-slate-700 transition hover:bg-white"
            aria-label="Fechar painel de anotacoes"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        ) : null}

        <div className="flex h-full flex-col">
          <div className="flex items-start justify-between gap-3 border-b border-slate-900/10 px-4 py-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Anotacoes do Livro</h3>
              <p className="text-xs text-slate-500">{sortedAnnotations.length} anotacao(oes)</p>
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-900/10 bg-white/80 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label="Fechar painel de anotacoes"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-2 py-2">
            {sortedAnnotations.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-900/15 bg-white/60 px-3 py-4 text-xs text-slate-500">
                Nenhuma anotacao encontrada.
              </div>
            ) : (
              <div className="space-y-2">
                {sortedAnnotations.map((annotation) => {
                  return (
                    <ReaderAnnotationListItem
                      key={annotation.id}
                      annotation={annotation}
                      isCurrentPage={annotation.page === currentPage}
                      onGoToPage={onGoToPage}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default ReaderAnnotationsSidebar;
