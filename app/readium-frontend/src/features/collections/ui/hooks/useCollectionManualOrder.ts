import type { ReadingCollection } from '@/types';
import type { MoveReadingCollectionAction } from '../../domain/collection-actions';

interface UseCollectionManualOrderParams {
  collections: ReadingCollection[];
  onMoveCollection: (payload: MoveReadingCollectionAction) => Promise<unknown>;
}

const sortCollections = (collections: ReadingCollection[]): ReadingCollection[] =>
  [...collections].sort((left, right) => left.sortOrder - right.sortOrder || left.name.localeCompare(right.name));

export const useCollectionManualOrder = ({
  collections,
  onMoveCollection,
}: UseCollectionManualOrderParams) => {
  const orderedCollections = sortCollections(collections);

  const canMoveUp = (collectionId: number): boolean => {
    const index = orderedCollections.findIndex((collection) => collection.id === collectionId);
    return index > 0;
  };

  const canMoveDown = (collectionId: number): boolean => {
    const index = orderedCollections.findIndex((collection) => collection.id === collectionId);
    return index >= 0 && index < orderedCollections.length - 1;
  };

  const moveByDelta = async (collectionId: number, delta: number) => {
    const currentIndex = orderedCollections.findIndex((collection) => collection.id === collectionId);
    if (currentIndex < 0) {
      return;
    }

    const targetIndex = Math.max(0, Math.min(orderedCollections.length - 1, currentIndex + delta));
    if (targetIndex === currentIndex) {
      return;
    }

    await onMoveCollection({ collectionId, targetIndex });
  };

  return {
    orderedCollections,
    canMoveUp,
    canMoveDown,
    moveUp: (collectionId: number) => moveByDelta(collectionId, -1),
    moveDown: (collectionId: number) => moveByDelta(collectionId, 1),
  };
};
