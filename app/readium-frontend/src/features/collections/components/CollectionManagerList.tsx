import { ArrowDown, ArrowUp, Pencil, Trash2 } from 'lucide-react';
import type { ReadingCollection } from '@/types';
import { Button } from '@/components/ui/button.tsx';
import { resolveCollectionTemplate } from '../application/services/collection-template-presets';

interface CollectionManagerListProps {
  collections: ReadingCollection[];
  isLoading: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  editingCollectionId: number | null;
  onMoveUp: (collectionId: number) => Promise<void>;
  onMoveDown: (collectionId: number) => Promise<void>;
  onBeginEdit: (collection: ReadingCollection) => void;
  onDeleteCollection: (collectionId: number) => Promise<unknown>;
  canMoveUp: (collectionId: number) => boolean;
  canMoveDown: (collectionId: number) => boolean;
}

export const CollectionManagerList = ({
  collections,
  isLoading,
  isSaving,
  isDeleting,
  editingCollectionId,
  onMoveUp,
  onMoveDown,
  onBeginEdit,
  onDeleteCollection,
  canMoveUp,
  canMoveDown,
}: CollectionManagerListProps) => (
  <>
    <div className="mb-2 flex items-center justify-between gap-2">
      <p className="text-sm font-medium text-slate-700">Colecoes existentes</p>
      <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] text-slate-500">
        {collections.length} itens
      </span>
    </div>

    <div className="min-h-0 space-y-2 overflow-y-auto pr-1">
      {isLoading ? (
        <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500">
          Carregando colecoes...
        </div>
      ) : collections.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
          Nenhuma colecao criada ainda.
        </div>
      ) : (
        collections.map((collection) => {
          const template = resolveCollectionTemplate(collection.templateId);
          const isEditing = editingCollectionId === collection.id;

          return (
            <article
              key={collection.id}
              className={`rounded-lg border bg-white p-3 shadow-sm transition ${
                isEditing ? 'border-slate-900 ring-1 ring-slate-900/20' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start gap-2">
                <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: collection.color }} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800">{collection.name}</p>
                  {collection.description ? (
                    <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">{collection.description}</p>
                  ) : null}
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${template.chipClassName}`}>
                      {template.label}
                    </span>
                    <span className="text-[11px] text-slate-500">{collection.booksCount} livros</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => void onMoveUp(collection.id)}
                    disabled={!canMoveUp(collection.id) || isSaving}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => void onMoveDown(collection.id)}
                    disabled={!canMoveDown(collection.id) || isSaving}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onBeginEdit(collection)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={() => void onDeleteCollection(collection.id)}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </article>
          );
        })
      )}
    </div>
  </>
);
