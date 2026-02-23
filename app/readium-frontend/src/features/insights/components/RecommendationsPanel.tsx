import type { FC } from 'react';
import { Compass } from 'lucide-react';
import type { BookRecommendation } from '@/types';
import { Button } from '@/components/ui/button.tsx';

interface RecommendationsPanelProps {
  recommendations: BookRecommendation[];
  isLoading: boolean;
  onOpenBook: (bookId: number) => void;
  showHeader?: boolean;
}

const cardClass =
  'rounded-xl border border-slate-200 bg-gradient-to-r from-white to-slate-50 p-3 shadow-sm';

export const RecommendationsPanel: FC<RecommendationsPanelProps> = ({
  recommendations,
  isLoading,
  onOpenBook,
  showHeader = true,
}) => {
  if (isLoading) {
    return (
      <div className="grid gap-3 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-24 animate-pulse rounded-xl border border-slate-200 bg-white" />
        ))}
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {showHeader ? (
        <div className="flex items-center gap-2 text-slate-700">
          <Compass className="h-4 w-4" />
          <h2 className="text-sm font-semibold uppercase tracking-wide">Recomendacoes pessoais</h2>
        </div>
      ) : null}
      <div className="grid gap-3 lg:grid-cols-2">
        {recommendations.map((item) => (
          <article key={item.book.id} className={cardClass}>
            <div className="flex items-center gap-3">
              <div className="h-16 w-12 shrink-0 overflow-hidden rounded-md bg-slate-100">
                {item.book.coverUrl ? (
                  <img src={item.book.coverUrl} alt={item.book.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[10px] font-medium text-slate-500">
                    Sem capa
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="line-clamp-1 text-sm font-semibold text-slate-900">{item.book.title}</h3>
                <p className="mt-1 line-clamp-2 text-xs text-slate-600">{item.reason}</p>
              </div>
              <Button size="sm" onClick={() => onOpenBook(item.book.id)}>
                Abrir
              </Button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
