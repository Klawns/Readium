import type { DragEvent } from 'react';
import { GripVertical } from 'lucide-react';
import type { Book } from '@/types';

interface FolderBookCardProps {
  book: Book;
  onOpenBook: (bookId: number) => void;
  onDragStart: (bookId: number) => void;
  onDragEnd: () => void;
}

export const FolderBookCard = ({
  book,
  onOpenBook,
  onDragStart,
  onDragEnd,
}: FolderBookCardProps) => {
  const handleDragStart = (event: DragEvent<HTMLDivElement>) => {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', String(book.id));
    onDragStart(book.id);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      className="group flex cursor-grab items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-2 shadow-sm transition hover:border-slate-300 active:cursor-grabbing"
    >
      <GripVertical className="h-3.5 w-3.5 shrink-0 text-slate-400" />
      <button type="button" onClick={() => onOpenBook(book.id)} className="min-w-0 flex-1 text-left">
        <p className="truncate text-sm font-medium text-slate-800">{book.title}</p>
        <p className="truncate text-xs text-slate-500">{book.author ?? 'Autor desconhecido'}</p>
      </button>
    </div>
  );
};
