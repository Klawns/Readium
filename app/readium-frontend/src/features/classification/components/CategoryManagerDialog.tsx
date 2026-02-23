import type { FC } from 'react';
import { Palette, Plus } from 'lucide-react';
import type { Category } from '@/types';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
  const {
    tree,
    flattened,
  } = useCategoryHierarchy(categories);

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
    setNewName('');
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
      <DialogContent className="max-w-3xl border-0 bg-gradient-to-b from-slate-50 to-white p-0">
        <DialogHeader className="rounded-t-xl border-b border-slate-200 bg-slate-900 px-6 py-5 text-slate-100">
          <DialogTitle className="text-xl">Gerenciar categorias</DialogTitle>
          <DialogDescription className="text-slate-300">
            Organize categorias em hierarquia e arraste para mudar o pai.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 px-6 py-5">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="mb-3 text-sm font-semibold text-slate-700">Nova categoria raiz</p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Input
                value={newName}
                onChange={(event) => setNewName(event.target.value)}
                placeholder="Ex: Arquitetura de Software"
                className="sm:flex-1"
              />
              <label className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                <Palette className="h-4 w-4" />
                <input
                  type="color"
                  value={newColor}
                  onChange={(event) => setNewColor(event.target.value)}
                  className="h-6 w-8 cursor-pointer border-0 bg-transparent p-0"
                />
              </label>
              <Button
                onClick={() => void handleCreate()}
                disabled={!canCreate || isSaving}
                className="bg-slate-900 text-white hover:bg-slate-800"
              >
                <Plus className="mr-2 h-4 w-4" />
                Adicionar
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-700">Hierarquia de categorias</p>
            <div className="max-h-[420px] overflow-y-auto pr-1">
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
          </div>
        </div>

        <DialogFooter className="border-t border-slate-200 bg-slate-50 px-6 py-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
