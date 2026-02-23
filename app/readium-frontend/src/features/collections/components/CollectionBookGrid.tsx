import type { Book } from '@/types';
import { CollectionBookTile } from './CollectionBookTile';

interface CollectionBookGridProps {
  books: Book[];
  emptyState: string;
  onOpenBook: (bookId: number) => void;
  onDragStartBook: (bookId: number) => void;
  onDragEndBook: () => void;
}

export const CollectionBookGrid = ({
  books,
  emptyState,
  onOpenBook,
  onDragStartBook,
  onDragEndBook,
}: CollectionBookGridProps) => {
  if (books.length === 0) {
    return (
      <div className="flex min-h-72 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-4 text-center text-sm text-slate-500">
        {emptyState}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {books.map((book) => (
        <CollectionBookTile
          key={book.id}
          book={book}
          onOpenBook={onOpenBook}
          onDragStart={onDragStartBook}
          onDragEnd={onDragEndBook}
        />
      ))}
    </div>
  );
};

