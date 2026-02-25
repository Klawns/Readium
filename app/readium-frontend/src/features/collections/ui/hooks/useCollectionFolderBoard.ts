import type { Book, ReadingCollection } from '@/types';
import { useCollectionFolderBoardData } from './useCollectionFolderBoardData';
import { useCollectionFolderBoardDragDrop } from './useCollectionFolderBoardDragDrop';

interface UseCollectionFolderBoardParams {
  books: Book[];
  collections: ReadingCollection[];
}

export const useCollectionFolderBoard = ({
  books,
  collections,
}: UseCollectionFolderBoardParams) => {
  const data = useCollectionFolderBoardData({
    books,
    collections,
  });
  const dragDrop = useCollectionFolderBoardDragDrop({
    onMoveBookToTarget: data.moveBookToTarget,
  });

  return {
    ...data,
    ...dragDrop,
  };
};
