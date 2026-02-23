import type { FC } from 'react';
import { GripVertical, Save, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import type { CategoryTreeNode } from '../domain/category-tree';

interface CategoryHierarchyTreeProps {
  nodes: CategoryTreeNode[];
  isLoading: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  editingCategoryId: number | null;
  editingName: string;
  editingColor: string;
  draggingCategoryId: number | null;
  dropTargetCategoryId: number | null;
  dropAsRoot: boolean;
  onChangeEditingName: (value: string) => void;
  onChangeEditingColor: (value: string) => void;
  onBeginEdit: (node: CategoryTreeNode) => void;
  onCancelEdit: () => void;
  onSaveEdit: (categoryId: number) => Promise<unknown>;
  onDelete: (categoryId: number) => Promise<unknown>;
  onDragStart: (categoryId: number) => void;
  onDragEnd: () => void;
  onDragEnterTarget: (targetCategoryId: number | null) => void;
  onDropOnTarget: (targetCategoryId: number | null) => Promise<unknown>;
}

const INDENT_SIZE_PX = 22;

const CategoryTreeItem: FC<{
  node: CategoryTreeNode;
  props: CategoryHierarchyTreeProps;
}> = ({ node, props }) => {
  const {
    editingCategoryId,
    editingName,
    editingColor,
    draggingCategoryId,
    dropTargetCategoryId,
    isSaving,
    isDeleting,
    onBeginEdit,
    onCancelEdit,
    onChangeEditingName,
    onChangeEditingColor,
    onSaveEdit,
    onDelete,
    onDragStart,
    onDragEnd,
    onDragEnterTarget,
    onDropOnTarget,
  } = props;

  const isEditing = editingCategoryId === node.category.id;
  const isDropTarget = dropTargetCategoryId === node.category.id && draggingCategoryId !== null;
  const cannotDropOnSelf = draggingCategoryId === node.category.id;

  return (
    <div className="space-y-2">
      <div
        className={`flex items-center gap-2 rounded-lg border p-2 transition ${
          isDropTarget ? 'border-primary bg-primary/5' : 'border-slate-200 bg-white'
        }`}
        style={{ paddingLeft: `${node.depth * INDENT_SIZE_PX + 8}px` }}
        draggable
        onDragStart={() => onDragStart(node.category.id)}
        onDragEnd={onDragEnd}
        onDragOver={(event) => {
          event.preventDefault();
          if (!cannotDropOnSelf) {
            onDragEnterTarget(node.category.id);
          }
        }}
        onDrop={(event) => {
          event.preventDefault();
          if (!cannotDropOnSelf) {
            void onDropOnTarget(node.category.id);
          }
        }}
      >
        <span className="rounded p-1 text-slate-500">
          <GripVertical className="h-4 w-4" />
        </span>
        <span className="h-3 w-10 rounded-full" style={{ backgroundColor: node.category.color }} />

        <div className="min-w-0 flex-1">
          {isEditing ? (
            <Input value={editingName} onChange={(event) => onChangeEditingName(event.target.value)} className="h-8" />
          ) : (
            <p className="truncate text-sm font-medium text-slate-800">{node.category.name}</p>
          )}
          <p className="text-xs text-slate-500">{node.category.booksCount} livros</p>
        </div>

        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <input
                type="color"
                value={editingColor}
                onChange={(event) => onChangeEditingColor(event.target.value)}
                className="h-8 w-10 cursor-pointer rounded border border-slate-200 bg-transparent p-1"
              />
              <Button
                size="sm"
                onClick={() => void onSaveEdit(node.category.id)}
                disabled={isSaving || !editingName.trim()}
              >
                <Save className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={onCancelEdit}>
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button size="sm" variant="outline" onClick={() => onBeginEdit(node)}>
                Editar
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50"
                onClick={() => void onDelete(node.category.id)}
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {node.children.map((child) => (
        <CategoryTreeItem key={child.category.id} node={child} props={props} />
      ))}
    </div>
  );
};

export const CategoryHierarchyTree: FC<CategoryHierarchyTreeProps> = (props) => {
  if (props.isLoading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500">
        Carregando categorias...
      </div>
    );
  }

  if (props.nodes.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
        Nenhuma categoria criada ainda.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div
        className={`rounded-lg border border-dashed p-2 text-xs text-slate-500 transition ${
          props.dropAsRoot ? 'border-primary bg-primary/5' : 'border-slate-300 bg-slate-50'
        }`}
        onDragOver={(event) => {
          event.preventDefault();
          props.onDragEnterTarget(null);
        }}
        onDrop={(event) => {
          event.preventDefault();
          void props.onDropOnTarget(null);
        }}
      >
        Arraste aqui para mover categoria para a raiz
      </div>

      {props.nodes.map((node) => (
        <CategoryTreeItem key={node.category.id} node={node} props={props} />
      ))}
    </div>
  );
};
