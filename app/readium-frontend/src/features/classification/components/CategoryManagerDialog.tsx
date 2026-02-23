import { useMemo, useState, type FC } from 'react';
import { Palette, Plus, Save, Trash2, X } from 'lucide-react';
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

interface CategoryManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  isLoading: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  onCreateCategory: (payload: { name: string; color?: string }) => Promise<unknown>;
  onUpdateCategory: (payload: { categoryId: number; name: string; color?: string }) => Promise<unknown>;
  onDeleteCategory: (categoryId: number) => Promise<unknown>;
}

const normalizeHexColor = (value: string): string => {
  const trimmed = value.trim();
  return /^#([A-Fa-f0-9]{6})$/.test(trimmed) ? trimmed.toUpperCase() : '#2563EB';
};

export const CategoryManagerDialog: FC<CategoryManagerDialogProps> = ({
  open,
  onOpenChange,
  categories,
  isLoading,
  isSaving,
  isDeleting,
  onCreateCategory,
  onUpdateCategory,
  onDeleteCategory,
}) => {
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#2563EB');
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingColor, setEditingColor] = useState('#2563EB');

  const canCreate = useMemo(() => newName.trim().length > 0, [newName]);

  const handleCreate = async () => {
    const name = newName.trim();
    if (!name) {
      return;
    }
    await onCreateCategory({
      name,
      color: normalizeHexColor(newColor),
    });
    setNewName('');
  };

  const beginEdit = (category: Category) => {
    setEditingCategoryId(category.id);
    setEditingName(category.name);
    setEditingColor(normalizeHexColor(category.color));
  };

  const cancelEdit = () => {
    setEditingCategoryId(null);
    setEditingName('');
    setEditingColor('#2563EB');
  };

  const handleUpdate = async () => {
    if (editingCategoryId == null || !editingName.trim()) {
      return;
    }
    await onUpdateCategory({
      categoryId: editingCategoryId,
      name: editingName.trim(),
      color: normalizeHexColor(editingColor),
    });
    cancelEdit();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl border-0 bg-gradient-to-b from-slate-50 to-white p-0">
        <DialogHeader className="rounded-t-xl border-b border-slate-200 bg-slate-900 px-6 py-5 text-slate-100">
          <DialogTitle className="text-xl">Gerenciar categorias</DialogTitle>
          <DialogDescription className="text-slate-300">
            Crie e personalize categorias para organizar sua biblioteca.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 px-6 py-5">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="mb-3 text-sm font-semibold text-slate-700">Nova categoria</p>
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
            <p className="text-sm font-semibold text-slate-700">Categorias existentes</p>
            <div className="max-h-[360px] space-y-2 overflow-y-auto pr-1">
              {isLoading ? (
                <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500">
                  Carregando categorias...
                </div>
              ) : categories.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
                  Nenhuma categoria criada ainda.
                </div>
              ) : (
                categories.map((category) => {
                  const isEditing = editingCategoryId === category.id;
                  return (
                    <div
                      key={category.id}
                      className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center"
                    >
                      <div
                        className="h-3 w-12 rounded-full"
                        style={{ backgroundColor: normalizeHexColor(isEditing ? editingColor : category.color) }}
                      />
                      <div className="min-w-0 flex-1">
                        {isEditing ? (
                          <Input
                            value={editingName}
                            onChange={(event) => setEditingName(event.target.value)}
                            className="h-8"
                          />
                        ) : (
                          <p className="truncate text-sm font-medium text-slate-800">{category.name}</p>
                        )}
                        <p className="text-xs text-slate-500">{category.booksCount} livros</p>
                      </div>

                      <div className="flex items-center gap-2">
                        {isEditing ? (
                          <>
                            <input
                              type="color"
                              value={editingColor}
                              onChange={(event) => setEditingColor(event.target.value)}
                              className="h-8 w-10 cursor-pointer rounded border border-slate-200 bg-transparent p-1"
                            />
                            <Button
                              size="sm"
                              onClick={() => void handleUpdate()}
                              disabled={isSaving || !editingName.trim()}
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={cancelEdit}>
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button size="sm" variant="outline" onClick={() => beginEdit(category)}>
                              Editar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-200 text-red-600 hover:bg-red-50"
                              onClick={() => void onDeleteCategory(category.id)}
                              disabled={isDeleting}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
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
