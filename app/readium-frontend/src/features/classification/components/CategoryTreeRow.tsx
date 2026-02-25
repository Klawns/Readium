import { GripVertical, Pencil, Save, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import type { CategoryTreeNode } from '../domain/category-tree';
import type { CategoryTreeInteraction } from './category-management.types';

const INDENT_SIZE_PX = 18;

interface CategoryTreeRowProps {
  node: CategoryTreeNode;
  isSaving: boolean;
  isDeleting: boolean;
  interaction: CategoryTreeInteraction;
}

export const CategoryTreeRow = ({ node, isSaving, isDeleting, interaction }: CategoryTreeRowProps) => {
  const { editor, dragDrop, actions } = interaction;
  const isEditing = editor.editingCategoryId === node.category.id;
  const isDropTarget = dragDrop.dropTargetCategoryId === node.category.id && dragDrop.draggingCategoryId !== null;
  const cannotDropOnSelf = dragDrop.draggingCategoryId === node.category.id;

  return (
    <div
      className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 transition ${
        isDropTarget ? 'border-primary bg-primary/5' : 'border-slate-200 bg-white hover:border-slate-300'
      }`}
      style={{ marginLeft: `${node.depth * INDENT_SIZE_PX}px` }}
      draggable
      onDragStart={() => actions.onDragStart(node.category.id)}
      onDragEnd={actions.onDragEnd}
      onDragOver={(event) => {
        event.preventDefault();
        if (!cannotDropOnSelf) {
          actions.onDragEnterTarget(node.category.id);
        }
      }}
      onDrop={(event) => {
        event.preventDefault();
        if (!cannotDropOnSelf) {
          void actions.onDropOnTarget(node.category.id);
        }
      }}
    >
      <button type="button" className="rounded p-1 text-slate-400" aria-label="Arrastar categoria">
        <GripVertical className="h-3.5 w-3.5" />
      </button>
      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: node.category.color }} />

      <div className="min-w-0 flex-1">
        {isEditing ? (
          <Input
            value={editor.editingName}
            onChange={(event) => actions.onChangeEditingName(event.target.value)}
            className="h-8"
          />
        ) : (
          <p className="truncate text-sm font-medium text-slate-800">{node.category.name}</p>
        )}
        <p className="text-[11px] text-slate-500">{node.category.booksCount} livros</p>
      </div>

      {isEditing ? (
        <div className="flex items-center gap-1.5">
          <input
            type="color"
            value={editor.editingColor}
            onChange={(event) => actions.onChangeEditingColor(event.target.value)}
            className="h-8 w-8 cursor-pointer rounded border border-slate-200 bg-transparent p-1"
          />
          <Button
            size="icon"
            variant="outline"
            onClick={() => void actions.onSaveEdit(node.category.id)}
            disabled={isSaving || !editor.editingName.trim()}
            className="h-8 w-8"
          >
            <Save className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="outline" onClick={actions.onCancelEdit} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-1.5">
          <Button size="icon" variant="ghost" onClick={() => actions.onBeginEdit(node)} className="h-8 w-8">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={() => void actions.onDelete(node.category.id)}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
