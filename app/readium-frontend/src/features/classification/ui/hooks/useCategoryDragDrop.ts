import { useState } from 'react';
import type { MoveCategoryHandler } from '../../domain/category-actions';

interface UseCategoryDragDropParams {
  onMove: MoveCategoryHandler;
}

export const useCategoryDragDrop = ({ onMove }: UseCategoryDragDropParams) => {
  const [draggingCategoryId, setDraggingCategoryId] = useState<number | null>(null);
  const [dropTargetCategoryId, setDropTargetCategoryId] = useState<number | null>(null);
  const [dropAsRoot, setDropAsRoot] = useState(false);

  const resetDragState = () => {
    setDraggingCategoryId(null);
    setDropTargetCategoryId(null);
    setDropAsRoot(false);
  };

  const beginDrag = (categoryId: number) => {
    setDraggingCategoryId(categoryId);
    setDropTargetCategoryId(null);
    setDropAsRoot(false);
  };

  const markDropTarget = (targetCategoryId: number | null) => {
    setDropTargetCategoryId(targetCategoryId);
    setDropAsRoot(targetCategoryId == null);
  };

  const performDrop = async (targetParentId: number | null) => {
    if (draggingCategoryId == null) {
      return;
    }
    try {
      await onMove({
        categoryId: draggingCategoryId,
        parentId: targetParentId,
      });
    } catch {
      // Errors are surfaced by the category mutation toast.
    } finally {
      resetDragState();
    }
  };

  return {
    draggingCategoryId,
    dropTargetCategoryId,
    dropAsRoot,
    beginDrag,
    markDropTarget,
    performDrop,
    resetDragState,
  };
};
