import type { DragEvent, ReactNode } from 'react';
import { FolderOpenDot } from 'lucide-react';
import type { Book } from '@/types';
import { FolderBookCard } from './FolderBookCard';

interface FolderDropColumnProps {
  title: string;
  badgeText: string;
  books: Book[];
  emptyState: string;
  icon?: ReactNode;
  isDropActive: boolean;
  onDragOver: () => void;
  onDragLeave: () => void;
  onDrop: () => Promise<void>;
  onOpenBook: (bookId: number) => void;
  onDragStartBook: (bookId: number) => void;
  onDragEndBook: () => void;
}

export const FolderDropColumn = ({
  title,
  badgeText,
  books,
  emptyState,
  icon,
  isDropActive,
  onDragOver,
  onDragLeave,
  onDrop,
  onOpenBook,
  onDragStartBook,
  onDragEndBook,
}: FolderDropColumnProps) => {
  const handleDragOver = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    onDragOver();
  };

  const handleDrop = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    void onDrop();
  };

  return (
    <section
      onDragOver={handleDragOver}
      onDragLeave={onDragLeave}
      onDrop={handleDrop}
      className={`flex min-h-64 w-[300px] shrink-0 flex-col rounded-xl border bg-white/95 p-3 shadow-sm transition ${
        isDropActive ? 'border-primary ring-2 ring-primary/30' : 'border-slate-200'
      }`}
    >
      <header className="mb-3 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {icon ?? <FolderOpenDot className="h-4 w-4 text-slate-500" />}
            <h2 className="truncate text-sm font-semibold text-slate-800">{title}</h2>
          </div>
        </div>
        <span className="rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
          {badgeText}
        </span>
      </header>

      <div className="flex flex-1 flex-col gap-2">
        {books.length === 0 ? (
          <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-2 text-center text-xs text-slate-500">
            {emptyState}
          </div>
        ) : (
          books.map((book) => (
            <FolderBookCard
              key={`${title}-${book.id}`}
              book={book}
              onOpenBook={onOpenBook}
              onDragStart={onDragStartBook}
              onDragEnd={onDragEndBook}
            />
          ))
        )}
      </div>
    </section>
  );
};
