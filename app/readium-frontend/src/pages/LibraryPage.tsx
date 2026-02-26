import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useLibrary } from '@/features/library/hooks/useLibrary.ts';
import { useLibrarySearchParams } from '@/features/library/hooks/useLibrarySearchParams.ts';
import { useLibraryPageState } from '@/features/library/hooks/useLibraryPageState.ts';
import LibraryView from '@/features/library/ui/LibraryView.tsx';
import { queryKeys } from '@/lib/query-keys';
import { useCategories } from '@/features/classification/ui/hooks/useCategories.ts';
import { BookCategoryDialog } from '@/features/classification/components/BookCategoryDialog.tsx';
import { useBookCategories } from '@/features/classification/ui/hooks/useBookCategories.ts';
import { useReadingCollections } from '@/features/collections/ui/hooks/useReadingCollections.ts';
import { CollectionManagerDialog } from '@/features/collections/components/CollectionManagerDialog.tsx';
import { useBookCollections } from '@/features/collections/ui/hooks/useBookCollections.ts';
import { BookCollectionDialog } from '@/features/collections/components/BookCollectionDialog.tsx';
import { useLibraryBookLookup } from '@/features/library/ui/hooks/useLibraryBookLookup.ts';
import { useAssignCollectionToBooks } from '@/features/collections/ui/hooks/useAssignCollectionToBooks.ts';
import { useOfflineBooks } from '@/features/offline/ui/hooks/useOfflineBooks';
import { DeleteBookDialog } from '@/features/library/components/DeleteBookDialog.tsx';

export default function LibraryPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [bookPendingDeletion, setBookPendingDeletion] = React.useState<{ id: number; title: string } | null>(null);
  const { statusFilter, page, searchQuery, categoryId, collectionId, updateParams } = useLibrarySearchParams();

  const {
    books,
    totalPages,
    isLoading,
    isError,
    isOfflineFallback,
    uploadBook,
    updateStatus,
    deleteBook,
    deletingBookId,
    isUploading,
    uploadProgress,
  } = useLibrary({ page, statusFilter, searchQuery, categoryId, collectionId });

  const {
    categories,
  } = useCategories();
  const {
    collections,
    isLoading: collectionsLoading,
    createCollection,
    updateCollection,
    moveCollection,
    deleteCollection,
    isSaving: collectionsSaving,
    isDeleting: collectionsDeleting,
  } = useReadingCollections();
  const pageState = useLibraryPageState({
    searchQuery,
    categoryId,
    collectionId,
    categories,
    collections,
    updateParams,
  });

  const {
    bookCategories,
    isLoading: bookCategoriesLoading,
    setBookCategories,
    isSaving: bookCategoriesSaving,
  } = useBookCategories(pageState.selectedBookForCategories?.id ?? null);
  const {
    bookCollections,
    isLoading: bookCollectionsLoading,
    setBookCollections,
    isSaving: bookCollectionsSaving,
  } = useBookCollections(pageState.selectedBookForCollections?.id ?? null);
  const {
    books: selectableBooks,
    totalBooks: selectableBooksTotal,
    isLoading: selectableBooksLoading,
  } = useLibraryBookLookup(pageState.collectionBooksQuery);
  const { assignCollectionToBooks, isAssigningBooks } = useAssignCollectionToBooks();
  const {
    downloadedByBookId,
    downloadBook,
    removeDownload,
    isDownloadingBookId,
    downloadingBookProgressPercent,
    isRemovingBookId,
  } = useOfflineBooks();

  const handleUpload = async (file: File) => {
    await uploadBook(file);
    pageState.closeUploadModal();
  };

  const handleOpenDeleteDialog = React.useCallback((bookId: number, title: string) => {
    setBookPendingDeletion({ id: bookId, title });
  }, []);

  const handleDeleteDialogOpenChange = React.useCallback((open: boolean) => {
    if (deletingBookId != null) {
      return;
    }
    if (!open) {
      setBookPendingDeletion(null);
    }
  }, [deletingBookId]);

  const handleConfirmDelete = React.useCallback(async () => {
    if (!bookPendingDeletion) {
      return;
    }
    try {
      await deleteBook(bookPendingDeletion.id);
      setBookPendingDeletion(null);
    } catch {
      // O hook useLibrary ja dispara toast de erro; mantemos o modal aberto para nova tentativa.
    }
  }, [bookPendingDeletion, deleteBook]);

  return (
    <>
      <LibraryView
      books={books}
      totalPages={totalPages}
      isLoading={isLoading}
      isError={isError}
      isOfflineFallback={isOfflineFallback}
      page={page}
      statusFilter={statusFilter}
      searchQuery={searchQuery}
      localSearch={pageState.localSearch}
      uploadOpen={pageState.uploadOpen}
      isUploading={isUploading}
      uploadProgress={uploadProgress}
      categories={categories}
      selectedCategoryId={categoryId}
      collections={collections}
      selectedCollectionId={collectionId}
      downloadedByBookId={downloadedByBookId}
      downloadingBookId={isDownloadingBookId}
      downloadingBookProgressPercent={downloadingBookProgressPercent}
      removingOfflineBookId={isRemovingBookId}
      deletingBookId={deletingBookId}
      onSearchChange={pageState.setLocalSearch}
      onOpenUpload={pageState.openUploadModal}
      onCloseUpload={pageState.closeUploadModal}
      onUpload={handleUpload}
      onFilterChange={(nextFilter) => updateParams({ status: nextFilter, page: 0 })}
      onRetry={() => queryClient.invalidateQueries({ queryKey: queryKeys.booksRoot() })}
      onBookClick={(bookId) => navigate(`/books/${bookId}`)}
      onBookStatusChange={(bookId, status) => updateStatus(bookId, status)}
      onPageChange={(nextPage) => updateParams({ page: nextPage })}
      onCategoryFilterChange={(nextCategoryId) => updateParams({ categoryId: nextCategoryId, page: 0 })}
      onCollectionFilterChange={(nextCollectionId) => updateParams({ collectionId: nextCollectionId, page: 0 })}
      onClearAllFilters={() => updateParams({
        status: 'ALL',
        categoryId: null,
        collectionId: null,
        page: 0,
      })}
      onOpenCategoryManager={() => navigate('/books/categories')}
      onOpenCollectionManager={pageState.openCollectionsManager}
      onBookManageCategories={pageState.openCategoryDialog}
      onBookManageCollections={pageState.openCollectionDialog}
      onBookDownloadOffline={(book) => {
        void downloadBook(book);
      }}
      onBookRemoveOffline={(bookId) => {
        void removeDownload(bookId);
      }}
      onBookDelete={isOfflineFallback
        ? undefined
        : (book) => handleOpenDeleteDialog(book.id, book.title)}
      />

      <DeleteBookDialog
      open={Boolean(bookPendingDeletion)}
      bookTitle={bookPendingDeletion?.title ?? null}
      isDeleting={deletingBookId === bookPendingDeletion?.id}
      onOpenChange={handleDeleteDialogOpenChange}
      onConfirmDelete={handleConfirmDelete}
      />

      <CollectionManagerDialog
      open={pageState.collectionsOpen}
      onOpenChange={pageState.onCollectionsOpenChange}
      collections={collections}
      isLoading={collectionsLoading}
      isSaving={collectionsSaving || isAssigningBooks}
      isDeleting={collectionsDeleting}
      availableBooks={selectableBooks}
      booksSearchQuery={pageState.collectionBooksQuery}
      booksTotal={selectableBooksTotal}
      isLoadingBooks={selectableBooksLoading}
      onBooksSearchQueryChange={pageState.setCollectionBooksQuery}
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

      <BookCategoryDialog
      open={Boolean(pageState.selectedBookForCategories)}
      onOpenChange={(open) => {
        if (!open) {
          pageState.closeCategoryDialog();
        }
      }}
      bookTitle={pageState.selectedBookForCategories?.title ?? ''}
      categories={categories}
      selectedCategories={bookCategories}
      isLoading={bookCategoriesLoading}
      isSaving={bookCategoriesSaving}
      onSave={setBookCategories}
      />

      <BookCollectionDialog
      open={Boolean(pageState.selectedBookForCollections)}
      onOpenChange={(open) => {
        if (!open) {
          pageState.closeCollectionDialog();
        }
      }}
      bookTitle={pageState.selectedBookForCollections?.title ?? ''}
      collections={collections}
      selectedCollections={bookCollections}
      isLoading={bookCollectionsLoading}
      isSaving={bookCollectionsSaving}
      onSave={setBookCollections}
      />
    </>
  );
}
