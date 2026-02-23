import { useEffect, useMemo, useState, type FC } from 'react';
import { Check, FolderPlus } from 'lucide-react';
import type { Category } from '@/types';
import { Button } from '@/components/ui/button.tsx';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog.tsx';
import { useCategoryHierarchy } from '../ui/hooks/useCategoryHierarchy';

interface BookCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookTitle: string;
  categories: Category[];
  selectedCategories: Category[];
  isLoading: boolean;
  isSaving: boolean;
  onSave: (categoryIds: number[]) => Promise<unknown>;
}

export const BookCategoryDialog: FC<BookCategoryDialogProps> = ({
  open,
  onOpenChange,
  bookTitle,
  categories,
  selectedCategories,
  isLoading,
  isSaving,
  onSave,
}) => {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const { flattened } = useCategoryHierarchy(categories);

  useEffect(() => {
    if (!open) {
      return;
    }
    setSelectedIds(selectedCategories.map((category) => category.id));
  }, [open, selectedCategories]);

  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const toggleCategory = (categoryId: number) => {
    setSelectedIds((current) => {
      if (current.includes(categoryId)) {
        return current.filter((id) => id !== categoryId);
      }
      return [...current, categoryId];
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Categorias do livro</DialogTitle>
          <DialogDescription>
            Selecione em quais categorias o livro <span className="font-medium text-foreground">{bookTitle}</span> deve
            aparecer.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[360px] space-y-2 overflow-y-auto">
          {isLoading ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
              Carregando categorias do livro...
            </div>
          ) : categories.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
              Crie categorias antes de classificar este livro.
            </div>
          ) : (
            flattened.map((node) => {
              const isSelected = selectedIdSet.has(node.category.id);
              return (
                <button
                  key={node.category.id}
                  type="button"
                  className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition ${
                    isSelected
                      ? 'border-slate-900 bg-slate-900/5'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                  onClick={() => toggleCategory(node.category.id)}
                  style={{ paddingLeft: `${node.depth * 18 + 12}px` }}
                >
                  <span className="h-3 w-10 rounded-full" style={{ backgroundColor: node.category.color }} />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-800">{node.category.name}</span>
                  <span className="text-xs text-slate-500">{node.category.booksCount}</span>
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
            <FolderPlus className="mr-2 h-4 w-4" />
            Salvar categorias
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
