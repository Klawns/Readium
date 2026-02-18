import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, StickyNote } from 'lucide-react';
import type { ReaderAnnotation } from '../domain/models';

interface ReaderAnnotationsSidebarProps {
  annotations: ReaderAnnotation[];
  currentPage: number;
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
  onGoToPage,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const sortedAnnotations = useMemo(() => sortAnnotations(annotations), [annotations]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="absolute right-0 top-1/2 z-40 flex -translate-y-1/2 items-center gap-1 rounded-l-xl border border-r-0 border-border/70 bg-background/95 px-2 py-2 text-xs font-medium text-foreground shadow-md transition hover:bg-muted"
        aria-expanded={isOpen}
        aria-label="Abrir painel de anotacoes"
      >
        {isOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        <StickyNote className="h-4 w-4" />
        <span className="hidden sm:inline">Anotacoes</span>
      </button>

      <aside
        className={`absolute right-0 top-0 z-30 h-full w-[20rem] max-w-[86vw] border-l border-border/70 bg-background/95 shadow-xl backdrop-blur-sm transition-transform duration-200 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-hidden={!isOpen}
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-border/70 px-4 py-3">
            <h3 className="text-sm font-semibold text-foreground">Anotacoes do Livro</h3>
            <p className="text-xs text-muted-foreground">{sortedAnnotations.length} anotacao(oes)</p>
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
