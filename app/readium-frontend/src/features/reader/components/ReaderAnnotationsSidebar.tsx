import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight, X, StickyNote } from 'lucide-react';
import type { ReaderAnnotation } from '../domain/models';

interface ReaderAnnotationsSidebarProps {
  annotations: ReaderAnnotation[];
  currentPage: number;
  isOpen: boolean;
  isVisible: boolean;
  onOpenChange: (open: boolean) => void;
  onGoToPage: (page: number) => void;
}

const MAX_HIGHLIGHT_PREVIEW = 160;
const MAX_NOTE_PREVIEW = 120;

const toPreview = (text: string | null | undefined, maxLength: number): string => {
  const normalized = (text ?? '').trim().replaceAll(/\s+/g, ' ');
  if (!normalized) {
    return '';
  }
  if (normalized.length <= maxLength) {
    return normalized;
  }
  return `${normalized.slice(0, maxLength)}...`;
};

const sortAnnotations = (annotations: ReaderAnnotation[]): ReaderAnnotation[] =>
  [...annotations].sort((left, right) => {
    if (left.page !== right.page) {
      return left.page - right.page;
    }
    return left.id - right.id;
  });

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
      {!isOpen && isVisible ? (
        <button
          type="button"
          onClick={() => onOpenChange(true)}
          className="absolute right-0 top-1/2 z-40 flex -translate-y-1/2 items-center gap-1 rounded-l-xl border border-r-0 border-border/70 bg-background/95 px-2 py-2 text-xs font-medium text-foreground shadow-md transition hover:bg-muted"
          aria-expanded={isPanelVisible}
          aria-label="Abrir painel de anotacoes"
        >
          <ChevronLeft className="h-4 w-4" />
          <StickyNote className="h-4 w-4" />
          <span className="hidden sm:inline">Anotacoes</span>
        </button>
      ) : null}

      <aside
        className={`absolute right-0 top-0 z-30 h-full w-[18rem] max-w-[92vw] border-l border-border/70 bg-background/95 shadow-xl backdrop-blur-sm transition-transform duration-200 sm:w-[20rem] ${
          isPanelVisible ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-hidden={!isPanelVisible}
      >
        {isPanelVisible ? (
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="absolute left-0 top-1/2 z-40 flex -translate-x-full -translate-y-1/2 items-center rounded-l-xl border border-r-0 border-border/70 bg-background/95 px-2 py-2 text-foreground shadow-md transition hover:bg-muted"
            aria-label="Fechar painel de anotacoes"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        ) : null}

        <div className="flex h-full flex-col">
          <div className="flex items-start justify-between gap-3 border-b border-border/70 px-4 py-3">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Anotacoes do Livro</h3>
              <p className="text-xs text-muted-foreground">{sortedAnnotations.length} anotacao(oes)</p>
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border/70 bg-background text-muted-foreground transition hover:bg-muted hover:text-foreground"
              aria-label="Fechar painel de anotacoes"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-2 py-2">
            {sortedAnnotations.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border/70 px-3 py-4 text-xs text-muted-foreground">
                Nenhuma anotacao encontrada.
              </div>
            ) : (
              <div className="space-y-2">
                {sortedAnnotations.map((annotation) => {
                  const highlightPreview = toPreview(annotation.selectedText, MAX_HIGHLIGHT_PREVIEW) || 'Sem trecho marcado';
                  const notePreview = toPreview(annotation.note, MAX_NOTE_PREVIEW);
                  const isCurrentPage = annotation.page === currentPage;

                  return (
                    <button
                      key={annotation.id}
                      type="button"
                      onClick={() => onGoToPage(annotation.page)}
                      className={`w-full rounded-lg border px-3 py-2 text-left transition ${
                        isCurrentPage
                          ? 'border-primary/60 bg-primary/10'
                          : 'border-border/70 bg-card hover:border-primary/40 hover:bg-muted/70'
                      }`}
                    >
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-[11px] font-semibold uppercase tracking-wide text-primary">
                          Pagina {annotation.page}
                        </span>
                        {isCurrentPage ? (
                          <span className="text-[10px] font-medium text-primary">Atual</span>
                        ) : null}
                      </div>
                      <div className="space-y-2">
                        <div
                          className="rounded-md border-l-2 bg-amber-100/70 px-2 py-1.5 text-xs text-foreground"
                          style={{ borderLeftColor: annotation.color }}
                        >
                          {highlightPreview}
                        </div>
                        <div className="rounded-md border border-border/60 bg-background/60 px-2 py-1.5">
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                            Comentario
                          </p>
                          <p className="mt-0.5 text-xs text-foreground/90">{notePreview || 'Sem comentario'}</p>
                        </div>
                      </div>
                    </button>
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
