import { FolderKanban, Plus, Search } from 'lucide-react';
import type { Book, ReadingCollection } from '@/types';
import AppLayout from '@/components/layout/AppLayout.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import { CollectionCompactTable } from '../components/CollectionCompactTable';
import { CollectionDropOverlay } from '../components/CollectionDropOverlay';
import { CollectionExplorerSidebar } from '../components/CollectionExplorerSidebar';
import { useCollectionExplorerState } from './hooks/useCollectionExplorerState';

type BookDropTarget = number | 'unassigned';

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
  onDragOverTarget: (target: number | 'unassigned') => void;
  onDragLeaveTarget: () => void;
  onDropOnCollection: (collectionId: number) => Promise<void>;
  onDropOnUnassigned: () => Promise<void>;
  onMoveBookToTarget: (bookId: number, target: BookDropTarget) => Promise<void>;
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
        <header className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Colecoes</h1>
              <p className="text-sm text-muted-foreground">Organize sua biblioteca por colecoes de forma objetiva.</p>
            </div>
            <Button onClick={onOpenManageCollections} className="gap-2">
              <Plus className="h-4 w-4" />
              Gerenciar colecoes
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="relative min-w-64 flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar livro para organizar..."
                value={searchQuery}
                onChange={(event) => onSearchChange(event.target.value)}
                className="pl-9"
              />
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600">
              <FolderKanban className="h-3.5 w-3.5" />
              {collections.length} colecoes
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600">
              {state.visibleBooks.length} livros visiveis
            </div>
          </div>
        </header>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
            <div className="h-[520px] animate-pulse rounded-xl border border-slate-200 bg-white" />
            <div className="h-[520px] animate-pulse rounded-xl border border-slate-200 bg-white" />
          </div>
        ) : isError ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
            Erro ao carregar livros para organizar.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
            <CollectionExplorerSidebar
              collections={collections}
              booksByCollectionId={collectionCounts}
              unassignedCount={unassignedBooks.length}
              totalBooks={books.length}
              activeFilter={state.activeFilter}
              onSelectFilter={state.setActiveFilter}
              onOpenManageCollections={onOpenManageCollections}
            />

            <section className="min-w-0 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">{state.contentTitle}</h2>
                  <p className="text-xs text-slate-500">{state.contentSubtitle}</p>
                </div>
                {isDropping ? (
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs text-slate-600">
                    Salvando movimento...
                  </span>
                ) : null}
              </div>

              <CollectionCompactTable
                books={state.visibleBooks}
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
        )}

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
