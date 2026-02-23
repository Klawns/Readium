import type { DragEvent } from 'react';
import { GripVertical } from 'lucide-react';
import type { Book } from '@/types';

interface CollectionBookTileProps {
  book: Book;
  onOpenBook: (bookId: number) => void;
  onDragStart: (bookId: number) => void;
  onDragEnd: () => void;
}

const coverFallback = (title: string) => (title.trim().charAt(0) || '?').toUpperCase();

export const CollectionBookTile = ({
  book,
  onOpenBook,
  onDragStart,
  onDragEnd,
}: CollectionBookTileProps) => {
  const handleDragStart = (event: DragEvent<HTMLElement>) => {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', String(book.id));
    onDragStart(book.id);
  };

  const progress = book.pages && book.pages > 0
    ? Math.min(100, Math.round(((book.lastReadPage ?? 0) / book.pages) * 100))
    : null;

  return (
    <article
      draggable
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:border-slate-300 hover:shadow-md"
    >
      <button type="button" onClick={() => onOpenBook(book.id)} className="w-full text-left">
        <div className="relative aspect-[16/9] bg-slate-100">
          {book.coverUrl ? (
            <img src={book.coverUrl} alt={book.title} className="h-full w-full object-cover" loading="lazy" />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-2xl font-semibold text-slate-500">
              {coverFallback(book.title)}
            </div>
          )}
          <span className="absolute right-2 top-2 rounded-full border border-white/70 bg-black/45 px-2 py-0.5 text-[10px] text-white backdrop-blur">
            {book.format}
          </span>
        </div>
        <div className="space-y-1.5 p-3">
          <p className="line-clamp-1 text-sm font-semibold text-slate-900">{book.title}</p>
          <p className="line-clamp-1 text-xs text-slate-500">{book.author ?? 'Autor desconhecido'}</p>
          {progress != null ? (
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>{book.lastReadPage ?? 0}/{book.pages} pags</span>
              <span>{progress}%</span>
            </div>
          ) : null}
        </div>
      </button>

      <div className="pointer-events-none absolute bottom-2 right-2 inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-400 shadow-sm opacity-0 transition group-hover:opacity-100">
        <GripVertical className="h-3.5 w-3.5" />
      </div>
    </article>
  );
};

