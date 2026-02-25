import type { Book, ReadingCollection } from '@/types';
import AppLayout from '@/components/layout/AppLayout.tsx';
import { Button } from '@/components/ui/button.tsx';
import { CollectionDropOverlay } from '../components/CollectionDropOverlay';
import { CollectionFoldersContent } from '../components/CollectionFoldersContent';
import { CollectionFoldersHeader } from '../components/CollectionFoldersHeader';
import type { BookCollectionDropTarget } from '../domain/collection-actions';
import { useCollectionExplorerState } from './hooks/useCollectionExplorerState';

interface CollectionFoldersViewProps {
  books: Book[];
  collections: ReadingCollection[];
  booksByCollectionId: Record<number, Book[]>;
  bookCollectionsById: Record<number, ReadingCollection[]>;
  unassignedBooks: Book[];
  isLoading: boolean;
  isError: boolean;
  isDropping: boolean;
  isDragging: boolean;
  page: number;
  totalPages: number;
  searchQuery: string;
  dropTarget: number | 'unassigned' | null;
  onSearchChange: (value: string) => void;
  onOpenBook: (bookId: number) => void;
  onOpenUpload: () => void;
  onOpenManageCollections: () => void;
  onPageChange: (page: number) => void;
  onDragStartBook: (bookId: number) => void;
  onDragEndBook: () => void;
  onDragOverTarget: (target: BookCollectionDropTarget) => void;
  onDragLeaveTarget: () => void;
  onDropOnCollection: (collectionId: number) => Promise<void>;
  onDropOnUnassigned: () => Promise<void>;
  onMoveBookToTarget: (bookId: number, target: BookCollectionDropTarget) => Promise<void>;
}

export const CollectionFoldersView = ({
  books,
  collections,
  booksByCollectionId,
  bookCollectionsById,
  unassignedBooks,
  isLoading,
  isError,
  isDropping,
  isDragging,
  page,
  totalPages,
  searchQuery,
  dropTarget,
  onSearchChange,
  onOpenBook,
  onOpenUpload,
  onOpenManageCollections,
  onPageChange,
  onDragStartBook,
  onDragEndBook,
  onDragOverTarget,
  onDragLeaveTarget,
  onDropOnCollection,
  onDropOnUnassigned,
  onMoveBookToTarget,
}: CollectionFoldersViewProps) => {
  const state = useCollectionExplorerState({
    books,
    collections,
    booksByCollectionId,
    unassignedBooks,
  });

  const collectionCounts = collections.reduce<Record<number, number>>((acc, collection) => {
    acc[collection.id] = (booksByCollectionId[collection.id] ?? []).length;
    return acc;
  }, {});

  return (
    <AppLayout onUploadClick={onOpenUpload}>
      <div className="container mx-auto max-w-7xl space-y-6 px-4 py-8 animate-fade-in">
        <CollectionFoldersHeader
          collectionsCount={collections.length}
          visibleBooksCount={state.visibleBooks.length}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          onOpenManageCollections={onOpenManageCollections}
        />

        <CollectionFoldersContent
          books={books}
          collections={collections}
          visibleBooks={state.visibleBooks}
          collectionCounts={collectionCounts}
          unassignedCount={unassignedBooks.length}
          totalBooks={books.length}
          bookCollectionsById={bookCollectionsById}
          activeFilter={state.activeFilter}
          contentTitle={state.contentTitle}
          contentSubtitle={state.contentSubtitle}
          isLoading={isLoading}
          isError={isError}
          isDropping={isDropping}
          onSelectFilter={state.setActiveFilter}
          onOpenManageCollections={onOpenManageCollections}
          onOpenBook={onOpenBook}
          onDragStartBook={onDragStartBook}
          onDragEndBook={onDragEndBook}
          onMoveBookToTarget={onMoveBookToTarget}
        />

        <CollectionDropOverlay
          collections={collections}
          dropTarget={dropTarget}
          isVisible={isDragging}
          onDragOverTarget={onDragOverTarget}
          onDragLeaveTarget={onDragLeaveTarget}
          onDropOnCollection={onDropOnCollection}
          onDropOnUnassigned={onDropOnUnassigned}
        />

        {totalPages > 1 ? (
          <div className="flex justify-center gap-2">
            <Button variant="outline" disabled={page === 0} onClick={() => onPageChange(page - 1)}>
              Anterior
            </Button>
            <div className="flex items-center px-4 text-sm text-slate-600">
              Pagina {page + 1} de {totalPages}
            </div>
            <Button variant="outline" disabled={page >= totalPages - 1} onClick={() => onPageChange(page + 1)}>
              Proxima
            </Button>
          </div>
        ) : null}
      </div>
    </AppLayout>
  );
};
