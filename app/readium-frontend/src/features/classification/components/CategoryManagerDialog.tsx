import type { FC } from 'react';
import { GripVertical, Layers3, Palette, Plus } from 'lucide-react';
import type { Category } from '@/types';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog.tsx';
import { useCategoryHierarchy } from '../ui/hooks/useCategoryHierarchy';
import { useCategoryDragDrop } from '../ui/hooks/useCategoryDragDrop';
import { useCategoryManagerState } from '../ui/hooks/useCategoryManagerState';
import { CategoryHierarchyTree } from './CategoryHierarchyTree';

interface CategoryManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  isLoading: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  onCreateCategory: (payload: { name: string; color?: string; parentId?: number | null }) => Promise<unknown>;
  onUpdateCategory: (payload: {
    categoryId: number;
    name: string;
    color?: string;
    parentId?: number | null;
  }) => Promise<unknown>;
  onMoveCategory: (payload: { categoryId: number; parentId: number | null }) => Promise<unknown>;
  onDeleteCategory: (categoryId: number) => Promise<unknown>;
}

export const CategoryManagerDialog: FC<CategoryManagerDialogProps> = ({
  open,
  onOpenChange,
  categories,
  isLoading,
  isSaving,
  isDeleting,
  onCreateCategory,
  onUpdateCategory,
  onMoveCategory,
  onDeleteCategory,
}) => {
  const { tree, flattened } = useCategoryHierarchy(categories);

  const {
    newName,
    newColor,
    editingCategoryId,
    editingName,
    editingColor,
    canCreate,
    setNewName,
    setNewColor,
    setEditingName,
    setEditingColor,
    beginEdit,
    cancelEdit,
    clearCreate,
    normalizeHexColor,
  } = useCategoryManagerState();

  const dragDrop = useCategoryDragDrop({
    onMove: onMoveCategory,
  });

  const handleCreate = async () => {
    const name = newName.trim();
    if (!name) {
      return;
    }
    await onCreateCategory({
      name,
      color: normalizeHexColor(newColor),
      parentId: null,
    });
    clearCreate();
  };

  const handleSaveEdit = async (categoryId: number) => {
    const name = editingName.trim();
    if (!name) {
      return;
    }

    const current = flattened.find((node) => node.category.id === categoryId);
    await onUpdateCategory({
      categoryId,
      name,
      color: normalizeHexColor(editingColor),
      parentId: current?.category.parentId ?? null,
    });
    cancelEdit();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-5xl overflow-hidden border border-slate-200 bg-slate-50 p-0">
        <DialogHeader className="border-b border-slate-200 bg-white px-5 py-4">
          <DialogTitle className="text-lg text-slate-900">Categorias</DialogTitle>
          <DialogDescription className="text-slate-600">
            Estruture a hierarquia e arraste categorias para reorganizar.
          </DialogDescription>
        </DialogHeader>

        <div className="grid max-h-[calc(90vh-82px)] grid-cols-1 overflow-hidden md:grid-cols-[300px_1fr]">
          <aside className="border-b border-slate-200 bg-white p-4 md:border-b-0 md:border-r">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Nova categoria raiz</p>
            <div className="mt-3 space-y-3">
              <Input
                value={newName}
                onChange={(event) => setNewName(event.target.value)}
                placeholder="Ex: Arquitetura de Software"
              />
              <div className="flex items-center gap-2">
                <label className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-2.5 py-2 text-xs text-slate-600">
                  <Palette className="h-4 w-4" />
                  <input
                    type="color"
                    value={newColor}
                    onChange={(event) => setNewColor(event.target.value)}
                    className="h-6 w-8 cursor-pointer border-0 bg-transparent p-0"
                  />
                </label>
                <Input
                  value={newColor}
                  onChange={(event) => setNewColor(event.target.value)}
                  className="h-9"
                />
              </div>
              <Button
                onClick={() => void handleCreate()}
                disabled={!canCreate || isSaving}
                className="w-full gap-2"
              >
                <Plus className="h-4 w-4" />
                Criar categoria
              </Button>
            </div>
            <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
              <p className="font-medium text-slate-700">Dica</p>
              <p className="mt-1">
                Use arrastar e soltar para trocar o pai da categoria. Solte no bloco "Raiz" para remover o pai.
              </p>
            </div>
          </aside>

          <section className="flex min-h-0 flex-col p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-700">
              <Layers3 className="h-4 w-4" />
              Hierarquia atual
              <span className="ml-auto inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] text-slate-500">
                <GripVertical className="h-3 w-3" />
                Arrastar ativo
              </span>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto pr-1">
              <CategoryHierarchyTree
                nodes={tree}
                isLoading={isLoading}
                isSaving={isSaving}
                isDeleting={isDeleting}
                editingCategoryId={editingCategoryId}
                editingName={editingName}
                editingColor={editingColor}
                draggingCategoryId={dragDrop.draggingCategoryId}
                dropTargetCategoryId={dragDrop.dropTargetCategoryId}
                dropAsRoot={dragDrop.dropAsRoot}
                onChangeEditingName={setEditingName}
                onChangeEditingColor={setEditingColor}
                onBeginEdit={(node) => beginEdit(node.category)}
                onCancelEdit={cancelEdit}
                onSaveEdit={handleSaveEdit}
                onDelete={onDeleteCategory}
                onDragStart={dragDrop.beginDrag}
                onDragEnd={dragDrop.resetDragState}
                onDragEnterTarget={dragDrop.markDropTarget}
                onDropOnTarget={dragDrop.performDrop}
              />
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
};
