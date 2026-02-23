import { useEffect, useMemo, useState, type FC } from 'react';
import { BookmarkPlus, Check } from 'lucide-react';
import type { ReadingCollection } from '@/types';
import { Button } from '@/components/ui/button.tsx';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog.tsx';
import { resolveCollectionTemplate } from '../application/services/collection-template-presets';

interface BookCollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookTitle: string;
  collections: ReadingCollection[];
  selectedCollections: ReadingCollection[];
  isLoading: boolean;
  isSaving: boolean;
  onSave: (collectionIds: number[]) => Promise<unknown>;
}

export const BookCollectionDialog: FC<BookCollectionDialogProps> = ({
  open,
  onOpenChange,
  bookTitle,
  collections,
  selectedCollections,
  isLoading,
  isSaving,
  onSave,
}) => {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  useEffect(() => {
    if (!open) {
      return;
    }
    setSelectedIds(selectedCollections.map((collection) => collection.id));
  }, [open, selectedCollections]);

  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const toggleCollection = (collectionId: number) => {
    setSelectedIds((current) => {
      if (current.includes(collectionId)) {
        return current.filter((id) => id !== collectionId);
      }
      return [...current, collectionId];
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Colecoes do livro</DialogTitle>
          <DialogDescription>
            Selecione em quais colecoes o livro <span className="font-medium text-foreground">{bookTitle}</span> deve
            aparecer.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[360px] space-y-2 overflow-y-auto">
          {isLoading ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
              Carregando colecoes do livro...
            </div>
          ) : collections.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
              Crie colecoes antes de classificar este livro.
            </div>
          ) : (
            collections.map((collection) => {
              const isSelected = selectedIdSet.has(collection.id);
              const template = resolveCollectionTemplate(collection.templateId);
              return (
                <button
                  key={collection.id}
                  type="button"
                  className={`flex w-full items-center gap-3 rounded-lg border bg-gradient-to-r p-3 text-left transition ${
                    isSelected
                      ? 'border-slate-900 bg-slate-900/5'
                      : `${template.panelClassName} hover:border-slate-300`
                  }`}
                  onClick={() => toggleCollection(collection.id)}
                >
                  <span className="h-3 w-10 rounded-full" style={{ backgroundColor: collection.color }} />
                  <div className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-slate-800">{collection.name}</span>
                    {collection.description ? (
                      <span className="block truncate text-xs text-slate-500">{collection.description}</span>
                    ) : null}
                  </div>
                  <span className="text-xs text-slate-500">{collection.booksCount}</span>
                  {isSelected && (
                    <span className="rounded-full bg-slate-900 p-1 text-white">
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={() => {
              void onSave(selectedIds).then(() => onOpenChange(false));
            }}
            disabled={isSaving}
          >
            <BookmarkPlus className="mr-2 h-4 w-4" />
            Salvar colecoes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
