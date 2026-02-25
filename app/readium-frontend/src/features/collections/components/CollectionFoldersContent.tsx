import type { Book, ReadingCollection } from '@/types';
import type { BookCollectionDropTarget } from '../domain/collection-actions';
import { CollectionCompactTable } from './CollectionCompactTable';
import { CollectionExplorerSidebar } from './CollectionExplorerSidebar';

type CollectionExplorerFilter = 'all' | 'unassigned' | number;

interface CollectionFoldersContentProps {
  books: Book[];
  collections: ReadingCollection[];
  visibleBooks: Book[];
  collectionCounts: Record<number, number>;
  unassignedCount: number;
  totalBooks: number;
  bookCollectionsById: Record<number, ReadingCollection[]>;
  activeFilter: CollectionExplorerFilter;
  contentTitle: string;
  contentSubtitle: string;
  isLoading: boolean;
  isError: boolean;
  isDropping: boolean;
  onSelectFilter: (filter: CollectionExplorerFilter) => void;
  onOpenManageCollections: () => void;
  onOpenBook: (bookId: number) => void;
  onDragStartBook: (bookId: number) => void;
  onDragEndBook: () => void;
  onMoveBookToTarget: (bookId: number, target: BookCollectionDropTarget) => Promise<void>;
}

export const CollectionFoldersContent = ({
  books,
  collections,
  visibleBooks,
  collectionCounts,
  unassignedCount,
  totalBooks,
  bookCollectionsById,
  activeFilter,
  contentTitle,
  contentSubtitle,
  isLoading,
  isError,
  isDropping,
  onSelectFilter,
  onOpenManageCollections,
  onOpenBook,
  onDragStartBook,
  onDragEndBook,
  onMoveBookToTarget,
}: CollectionFoldersContentProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
        <div className="h-[520px] animate-pulse rounded-xl border border-slate-200 bg-white" />
        <div className="h-[520px] animate-pulse rounded-xl border border-slate-200 bg-white" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
        Erro ao carregar livros para organizar.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
      <CollectionExplorerSidebar
        collections={collections}
        booksByCollectionId={collectionCounts}
        unassignedCount={unassignedCount}
        totalBooks={totalBooks}
        activeFilter={activeFilter}
        onSelectFilter={onSelectFilter}
        onOpenManageCollections={onOpenManageCollections}
      />

      <section className="min-w-0 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <div>
            <h2 className="text-base font-semibold text-slate-900">{contentTitle}</h2>
            <p className="text-xs text-slate-500">{contentSubtitle}</p>
          </div>
          {isDropping ? (
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs text-slate-600">
              Salvando movimento...
            </span>
          ) : null}
        </div>

        <CollectionCompactTable
          books={visibleBooks}
          collections={collections}
          bookCollectionsById={bookCollectionsById}
          isSaving={isDropping}
          onOpenBook={onOpenBook}
          onDragStartBook={onDragStartBook}
          onDragEndBook={onDragEndBook}
          onMoveBookToTarget={onMoveBookToTarget}
        />
      </section>
    </div>
  );
};
