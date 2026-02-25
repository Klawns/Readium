import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLibrary } from '@/features/library/hooks/useLibrary.ts';
import { useReadingCollections } from '@/features/collections/ui/hooks/useReadingCollections.ts';
import { useCollectionFolderBoard } from '@/features/collections/ui/hooks/useCollectionFolderBoard.ts';
import { CollectionFoldersView } from '@/features/collections/ui/CollectionFoldersView.tsx';
import { CollectionManagerDialog } from '@/features/collections/components/CollectionManagerDialog.tsx';
import { useLibraryBookLookup } from '@/features/library/ui/hooks/useLibraryBookLookup.ts';
import { useAssignCollectionToBooks } from '@/features/collections/ui/hooks/useAssignCollectionToBooks.ts';

const FOLDER_PAGE_STATUS = 'ALL' as const;

export default function CollectionFoldersPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const [collectionBooksQuery, setCollectionBooksQuery] = useState('');

  const {
    books,
    totalPages,
    isLoading: booksLoading,
    isError: booksError,
  } = useLibrary({
    page,
    statusFilter: FOLDER_PAGE_STATUS,
    searchQuery,
    categoryId: null,
    collectionId: null,
  });

  const {
    collections,
    isLoading: collectionsLoading,
    isError: collectionsError,
    createCollection,
    updateCollection,
    moveCollection,
    deleteCollection,
    isSaving: collectionsSaving,
    isDeleting: collectionsDeleting,
  } = useReadingCollections();

  const board = useCollectionFolderBoard({ books, collections });
  const {
    books: selectableBooks,
    totalBooks: selectableBooksTotal,
    isLoading: selectableBooksLoading,
  } = useLibraryBookLookup(collectionBooksQuery);
  const { assignCollectionToBooks, isAssigningBooks } = useAssignCollectionToBooks();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const normalized = searchInput.trim();
      setSearchQuery(normalized);
      setPage(0);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  return (
    <>
      <CollectionFoldersView
        books={books}
        collections={collections}
        booksByCollectionId={board.booksByCollectionId}
        bookCollectionsById={board.bookCollectionsById}
        unassignedBooks={board.unassignedBooks}
        isLoading={booksLoading || collectionsLoading || board.isCollectionsLoading}
        isError={booksError || collectionsError}
        isDropping={board.isSavingDrop}
        isDragging={board.isDragging}
        page={page}
        totalPages={totalPages}
        searchQuery={searchInput}
        dropTarget={board.dropTarget}
        onSearchChange={setSearchInput}
        onOpenBook={(bookId) => navigate(`/books/${bookId}`)}
        onOpenUpload={() => navigate('/books')}
        onOpenManageCollections={() => setCollectionsOpen(true)}
        onPageChange={setPage}
        onDragStartBook={board.startDragging}
        onDragEndBook={board.stopDragging}
        onDragOverTarget={board.highlightTarget}
        onDragLeaveTarget={board.clearTarget}
        onDropOnCollection={board.dropIntoCollection}
        onDropOnUnassigned={board.dropIntoUnassigned}
        onMoveBookToTarget={board.moveBookToTarget}
      />

      <CollectionManagerDialog
        open={collectionsOpen}
        onOpenChange={(open) => {
          setCollectionsOpen(open);
          if (!open) {
            setCollectionBooksQuery('');
          }
        }}
        collections={collections}
        isLoading={collectionsLoading}
        isSaving={collectionsSaving || isAssigningBooks}
        isDeleting={collectionsDeleting}
        availableBooks={selectableBooks}
        booksSearchQuery={collectionBooksQuery}
        booksTotal={selectableBooksTotal}
        isLoadingBooks={selectableBooksLoading}
        onBooksSearchQueryChange={setCollectionBooksQuery}
        onCreateCollection={async ({ initialBookIds = [], ...payload }) => {
          const created = await createCollection(payload);
          const createdCollectionId =
            typeof created === 'object' && created !== null && 'id' in created
              ? Number((created as { id: number }).id)
              : null;

          if (createdCollectionId && initialBookIds.length > 0) {
            await assignCollectionToBooks({
              collectionId: createdCollectionId,
              bookIds: initialBookIds,
            });
          }
          return created;
        }}
        onUpdateCollection={updateCollection}
        onMoveCollection={moveCollection}
        onDeleteCollection={deleteCollection}
      />
    </>
  );
}
