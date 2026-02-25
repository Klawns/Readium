import type { CategoryTreeNode } from '../domain/category-tree';

export interface CategoryTreeEditorState {
  editingCategoryId: number | null;
  editingName: string;
  editingColor: string;
}

export interface CategoryTreeDragDropState {
  draggingCategoryId: number | null;
  dropTargetCategoryId: number | null;
  dropAsRoot: boolean;
}

export interface CategoryTreeActions {
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

export interface CategoryTreeInteraction {
  editor: CategoryTreeEditorState;
  dragDrop: CategoryTreeDragDropState;
  actions: CategoryTreeActions;
}
