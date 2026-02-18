import React, { useMemo } from 'react';
import { ChevronLeft, X, StickyNote } from 'lucide-react';
import type { ReaderAnnotation } from '../domain/models';

interface ReaderAnnotationsSidebarProps {
  annotations: ReaderAnnotation[];
  currentPage: number;
  isOpen: boolean;
  isVisible: boolean;
  onOpenChange: (open: boolean) => void;
  onGoToPage: (page: number) => void;
}

const MAX_TEXT_PREVIEW = 96;

const toPreview = (text: string | null | undefined): string => {
  const normalized = (text ?? '').trim().replaceAll(/\s+/g, ' ');
  if (!normalized) {
    return '';
  }
  if (normalized.length <= MAX_TEXT_PREVIEW) {
    return normalized;
  }
  return `${normalized.slice(0, MAX_TEXT_PREVIEW)}...`;
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
                  const preview = toPreview(annotation.note) || toPreview(annotation.selectedText) || 'Sem texto';
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
                      <p className="text-xs text-foreground">{preview}</p>
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
