import { useState } from 'react';
import type {
  BookCollectionDropTarget,
  CollectionDropTarget,
} from '../../domain/collection-actions';

interface UseCollectionFolderBoardDragDropParams {
  onMoveBookToTarget: (bookId: number, target: BookCollectionDropTarget) => Promise<void>;
}

export const useCollectionFolderBoardDragDrop = ({
  onMoveBookToTarget,
}: UseCollectionFolderBoardDragDropParams) => {
  const [draggingBookId, setDraggingBookId] = useState<number | null>(null);
  const [dropTarget, setDropTarget] = useState<CollectionDropTarget>(null);

  const stopDragging = () => {
    setDraggingBookId(null);
    setDropTarget(null);
  };

  const dropIntoCollection = async (collectionId: number) => {
    if (draggingBookId == null) {
      return;
    }
    await onMoveBookToTarget(draggingBookId, collectionId);
    stopDragging();
  };

  const dropIntoUnassigned = async () => {
    if (draggingBookId == null) {
      return;
    }
    await onMoveBookToTarget(draggingBookId, 'unassigned');
    stopDragging();
  };

  return {
    draggingBookId,
    isDragging: draggingBookId != null,
    dropTarget,
    startDragging: (bookId: number) => setDraggingBookId(bookId),
    stopDragging,
    highlightTarget: (target: BookCollectionDropTarget) => setDropTarget(target),
    clearTarget: () => setDropTarget(null),
    dropIntoCollection,
    dropIntoUnassigned,
  };
};
