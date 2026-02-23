import type { FC } from 'react';
import { Layers3 } from 'lucide-react';
import type { SmartCollection } from '@/types';
import { Button } from '@/components/ui/button.tsx';

interface SmartCollectionsPanelProps {
  collections: SmartCollection[];
  isLoading: boolean;
  onOpenBook: (bookId: number) => void;
}

const collectionTitleClass =
  'rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur-sm';

export const SmartCollectionsPanel: FC<SmartCollectionsPanelProps> = ({
  collections,
  isLoading,
  onOpenBook,
}) => {
  if (isLoading) {
    return (
      <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-48 animate-pulse rounded-xl border border-slate-200 bg-white" />
        ))}
      </div>
    );
  }

  if (collections.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-slate-700">
        <Layers3 className="h-4 w-4" />
        <h2 className="text-sm font-semibold uppercase tracking-wide">Colecoes inteligentes</h2>
      </div>
      <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
        {collections.map((collection) => (
          <article key={collection.id} className={collectionTitleClass}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">{collection.name}</h3>
                <p className="mt-1 text-xs text-slate-500">{collection.description}</p>
              </div>
              <span className="rounded-full bg-slate-900 px-2 py-1 text-xs font-medium text-white">
                {collection.totalBooks}
              </span>
            </div>

            <div className="mt-4 space-y-2">
              {collection.previewBooks.length === 0 ? (
                <p className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-500">
                  Nenhum livro nesta colecao.
                </p>
              ) : (
                collection.previewBooks.map((book) => (
                  <Button
                    key={book.id}
                    variant="ghost"
                    className="h-auto w-full justify-between rounded-md border border-slate-200 px-3 py-2 text-left hover:bg-slate-50"
                    onClick={() => onOpenBook(book.id)}
                  >
                    <span className="line-clamp-1 text-xs font-medium text-slate-700">{book.title}</span>
                    <span className="text-[11px] text-slate-500">{book.status.replace('_', ' ')}</span>
                  </Button>
                ))
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

