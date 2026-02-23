import type { Book, ReadingCollection } from '@/types';
import { GripVertical } from 'lucide-react';
import type { DragEvent } from 'react';

type BookDropTarget = number | 'unassigned';

interface CollectionCompactTableProps {
  books: Book[];
  collections: ReadingCollection[];
  bookCollectionsById: Record<number, ReadingCollection[]>;
  isSaving: boolean;
  onOpenBook: (bookId: number) => void;
  onDragStartBook: (bookId: number) => void;
  onDragEndBook: () => void;
  onMoveBookToTarget: (bookId: number, target: BookDropTarget) => Promise<void>;
}

const DEFAULT_ACTION_VALUE = '';

export const CollectionCompactTable = ({
  books,
  collections,
  bookCollectionsById,
  isSaving,
  onOpenBook,
  onDragStartBook,
  onDragEndBook,
  onMoveBookToTarget,
}: CollectionCompactTableProps) => {
  if (books.length === 0) {
    return (
      <div className="flex min-h-72 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-4 text-center text-sm text-slate-500">
        Nenhum livro para organizar neste filtro.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="max-h-[560px] overflow-auto">
        <table className="min-w-full border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-slate-50">
            <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-3 py-2">Livro</th>
              <th className="px-3 py-2">Colecoes atuais</th>
              <th className="px-3 py-2">Acao rapida</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book) => {
              const assigned = bookCollectionsById[book.id] ?? [];
              const knownPages = book.pages ?? 0;
              const lastReadPage = Math.max(0, Math.min(book.lastReadPage ?? 0, knownPages || Number.MAX_SAFE_INTEGER));

              const handleDragStart = (event: DragEvent<HTMLTableRowElement>) => {
                event.dataTransfer.effectAllowed = 'move';
                event.dataTransfer.setData('text/plain', String(book.id));
                onDragStartBook(book.id);
              };

              return (
                <tr
                  key={book.id}
                  draggable
                  onDragStart={handleDragStart}
                  onDragEnd={onDragEndBook}
                  className="group border-b border-slate-100 transition hover:bg-slate-50 last:border-b-0"
                >
                  <td className="px-3 py-2.5 align-top">
                    <button type="button" onClick={() => onOpenBook(book.id)} className="text-left">
                      <div className="inline-flex items-center gap-1.5">
                        <GripVertical className="h-3.5 w-3.5 text-slate-300 opacity-0 transition group-hover:opacity-100" />
                        <p className="font-medium text-slate-900 hover:text-slate-700">{book.title}</p>
                      </div>
                      <p className="text-xs text-slate-500">{book.author ?? 'Autor desconhecido'}</p>
                      {knownPages > 0 ? (
                        <p className="mt-0.5 text-[11px] text-slate-500">{lastReadPage}/{knownPages} pags</p>
                      ) : null}
                    </button>
                  </td>
                  <td className="px-3 py-2.5 align-top">
                    <div className="flex flex-wrap gap-1">
                      {assigned.length === 0 ? (
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] text-slate-500">
                          Sem colecao
                        </span>
                      ) : (
                        assigned.map((collection) => (
                          <span
                            key={`${book.id}-${collection.id}`}
                            className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] text-slate-600"
                          >
                            <span
                              className="h-1.5 w-1.5 rounded-full"
                              style={{ backgroundColor: collection.color }}
                            />
                            {collection.name}
                          </span>
                        ))
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2.5 align-top">
                    <select
                      defaultValue={DEFAULT_ACTION_VALUE}
                      disabled={isSaving}
                      onChange={(event) => {
                        const value = event.target.value;
                        if (!value) {
                          return;
                        }
                        if (value === 'unassigned') {
                          void onMoveBookToTarget(book.id, 'unassigned');
                        } else {
                          const targetId = Number(value);
                          if (Number.isFinite(targetId) && targetId > 0) {
                            void onMoveBookToTarget(book.id, targetId);
                          }
                        }
                        event.target.value = DEFAULT_ACTION_VALUE;
                      }}
                      className="h-9 w-full max-w-56 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700"
                    >
                      <option value={DEFAULT_ACTION_VALUE}>Mover para...</option>
                      <option value="unassigned">Sem colecao</option>
                      {collections.map((collection) => (
                        <option key={collection.id} value={collection.id}>
                          {collection.name}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
