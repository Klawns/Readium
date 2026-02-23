import { type FC } from 'react';
import { Bookmark, Settings2 } from 'lucide-react';
import type { ReadingCollection } from '@/types';
import { Button } from '@/components/ui/button.tsx';

interface CollectionFilterBarProps {
  collections: ReadingCollection[];
  selectedCollectionId: number | null;
  onSelectCollection: (collectionId: number | null) => void;
  onManageCollections: () => void;
}

export const CollectionFilterBar: FC<CollectionFilterBarProps> = ({
  collections,
  selectedCollectionId,
  onSelectCollection,
  onManageCollections,
}) => (
  <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-r from-white to-slate-50 p-4 shadow-sm">
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex min-w-0 items-center gap-2">
        <Bookmark className="h-4 w-4 text-slate-600" />
        <p className="text-sm font-medium text-slate-700">Filtrar por colecao</p>
      </div>
      <Button variant="outline" size="sm" className="gap-2 self-start lg:self-auto" onClick={onManageCollections}>
        <Settings2 className="h-4 w-4" />
        Gerenciar colecoes
      </Button>
    </div>

    <div className="mt-3 flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onSelectCollection(null)}
        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
          selectedCollectionId == null
            ? 'border-slate-900 bg-slate-900 text-white'
            : 'border-slate-300 bg-white text-slate-600 hover:border-slate-400'
        }`}
      >
        Todas
      </button>

      {collections.map((collection) => {
        const isActive = selectedCollectionId === collection.id;
        return (
          <button
            key={collection.id}
            type="button"
            onClick={() => onSelectCollection(collection.id)}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
              isActive
                ? 'border-slate-900 bg-slate-900 text-white'
                : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
            }`}
          >
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: collection.color }} />
            <span>{collection.name}</span>
            <span className={`${isActive ? 'text-slate-300' : 'text-slate-500'}`}>{collection.booksCount}</span>
          </button>
        );
      })}
    </div>
  </div>
);

