import type { FC } from 'react';
import type { Category } from '@/types';
import type {
  CreateCategoryHandler,
  DeleteCategoryHandler,
  MoveCategoryHandler,
  UpdateCategoryHandler,
} from '../domain/category-actions';
import { useCategoryHierarchy } from '../ui/hooks/useCategoryHierarchy';
import { useCategoryDragDrop } from '../ui/hooks/useCategoryDragDrop';
import { useCategoryManagerState } from '../ui/hooks/useCategoryManagerState';
import { CategoryCreationSidebar } from './CategoryCreationSidebar';
import { CategoryHierarchySection } from './CategoryHierarchySection';
import type { CategoryTreeInteraction } from './category-management.types';

interface CategoryManagementPanelProps {
  categories: Category[];
  isLoading: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  onCreateCategory: CreateCategoryHandler;
  onUpdateCategory: UpdateCategoryHandler;
  onMoveCategory: MoveCategoryHandler;
  onDeleteCategory: DeleteCategoryHandler;
  className?: string;
  treeScrollClassName?: string;
}

export const CategoryManagementPanel: FC<CategoryManagementPanelProps> = ({
  categories,
  isLoading,
  isSaving,
  isDeleting,
  onCreateCategory,
  onUpdateCategory,
  onMoveCategory,
  onDeleteCategory,
  className,
  treeScrollClassName,
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

  const rootClassName = ['grid grid-cols-1 overflow-hidden md:grid-cols-[300px_1fr]', className]
    .filter(Boolean)
    .join(' ');
  const interaction: CategoryTreeInteraction = {
    editor: {
      editingCategoryId,
      editingName,
      editingColor,
    },
    dragDrop: {
      draggingCategoryId: dragDrop.draggingCategoryId,
      dropTargetCategoryId: dragDrop.dropTargetCategoryId,
      dropAsRoot: dragDrop.dropAsRoot,
    },
    actions: {
      onChangeEditingName: setEditingName,
      onChangeEditingColor: setEditingColor,
      onBeginEdit: (node) => beginEdit(node.category),
      onCancelEdit: cancelEdit,
      onSaveEdit: handleSaveEdit,
      onDelete: onDeleteCategory,
      onDragStart: dragDrop.beginDrag,
      onDragEnd: dragDrop.resetDragState,
      onDragEnterTarget: dragDrop.markDropTarget,
      onDropOnTarget: dragDrop.performDrop,
    },
  };

  return (
    <div className={rootClassName}>
      <CategoryCreationSidebar
        newName={newName}
        newColor={newColor}
        canCreate={canCreate}
        isSaving={isSaving}
        onChangeName={setNewName}
        onChangeColor={setNewColor}
        onCreate={handleCreate}
      />
      <CategoryHierarchySection
        tree={tree}
        isLoading={isLoading}
        isSaving={isSaving}
        isDeleting={isDeleting}
        treeScrollClassName={treeScrollClassName}
        interaction={interaction}
      />
    </div>
  );
};
