import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useLibrary } from '@/features/library/hooks/useLibrary.ts';
import { useLibrarySearchParams } from '@/features/library/hooks/useLibrarySearchParams.ts';
import LibraryView from '@/features/library/ui/LibraryView.tsx';
import { queryKeys } from '@/lib/query-keys';
import { useCategories } from '@/features/classification/ui/hooks/useCategories.ts';
import { CategoryManagerDialog } from '@/features/classification/components/CategoryManagerDialog.tsx';
import { BookCategoryDialog } from '@/features/classification/components/BookCategoryDialog.tsx';
import { useBookCategories } from '@/features/classification/ui/hooks/useBookCategories.ts';
import type { Book } from '@/types';
import { useReadingCollections } from '@/features/collections/ui/hooks/useReadingCollections.ts';
import { CollectionManagerDialog } from '@/features/collections/components/CollectionManagerDialog.tsx';
import { useBookCollections } from '@/features/collections/ui/hooks/useBookCollections.ts';
import { BookCollectionDialog } from '@/features/collections/components/BookCollectionDialog.tsx';
import { useLibraryBookLookup } from '@/features/library/ui/hooks/useLibraryBookLookup.ts';
import { useAssignCollectionToBooks } from '@/features/collections/ui/hooks/useAssignCollectionToBooks.ts';

export default function LibraryPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { statusFilter, page, searchQuery, categoryId, collectionId, updateParams } = useLibrarySearchParams();

  const {
    books,
    totalPages,
    isLoading,
    isError,
    uploadBook,
    updateStatus,
    isUploading,
    uploadProgress,
  } = useLibrary({ page, statusFilter, searchQuery, categoryId, collectionId });

  const {
    categories,
    isLoading: categoriesLoading,
    createCategory,
    updateCategory,
    moveCategory,
    deleteCategory,
    isSaving: categoriesSaving,
    isDeleting: categoriesDeleting,
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

  const [uploadOpen, setUploadOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const [selectedBookForCategories, setSelectedBookForCategories] = useState<Book | null>(null);
  const [selectedBookForCollections, setSelectedBookForCollections] = useState<Book | null>(null);

  const {
    bookCategories,
    isLoading: bookCategoriesLoading,
    setBookCategories,
    isSaving: bookCategoriesSaving,
  } = useBookCategories(selectedBookForCategories?.id ?? null);
  const {
    bookCollections,
    isLoading: bookCollectionsLoading,
    setBookCollections,
    isSaving: bookCollectionsSaving,
  } = useBookCollections(selectedBookForCollections?.id ?? null);
  const [collectionBooksQuery, setCollectionBooksQuery] = useState('');
  const {
    books: selectableBooks,
    totalBooks: selectableBooksTotal,
    isLoading: selectableBooksLoading,
  } = useLibraryBookLookup(collectionBooksQuery);
  const { assignCollectionToBooks, isAssigningBooks } = useAssignCollectionToBooks();

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const normalized = localSearch.trim();
      if (normalized !== searchQuery) {
        updateParams({ query: normalized, page: 0 });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [localSearch, searchQuery, updateParams]);

  useEffect(() => {
    if (categoryId == null) {
      return;
    }
    if (categories.some((category) => category.id === categoryId)) {
      return;
    }
    updateParams({ categoryId: null, page: 0 });
  }, [categories, categoryId, updateParams]);

  useEffect(() => {
    if (collectionId == null) {
      return;
    }
    if (collections.some((collection) => collection.id === collectionId)) {
      return;
    }
    updateParams({ collectionId: null, page: 0 });
  }, [collections, collectionId, updateParams]);

  const handleUpload = async (file: File) => {
    await uploadBook(file);
    setUploadOpen(false);
  };

  return (
    <>
      <LibraryView
      books={books}
      totalPages={totalPages}
      isLoading={isLoading}
      isError={isError}
      page={page}
      statusFilter={statusFilter}
      searchQuery={searchQuery}
      localSearch={localSearch}
      uploadOpen={uploadOpen}
      isUploading={isUploading}
      uploadProgress={uploadProgress}
      categories={categories}
      selectedCategoryId={categoryId}
      collections={collections}
      selectedCollectionId={collectionId}
      onSearchChange={setLocalSearch}
      onOpenUpload={() => setUploadOpen(true)}
      onCloseUpload={() => setUploadOpen(false)}
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
      onOpenCategoryManager={() => setCategoriesOpen(true)}
      onOpenCollectionManager={() => setCollectionsOpen(true)}
      onBookManageCategories={(book) => setSelectedBookForCategories(book)}
      onBookManageCollections={(book) => setSelectedBookForCollections(book)}
      />

      <CategoryManagerDialog
      open={categoriesOpen}
      onOpenChange={setCategoriesOpen}
      categories={categories}
      isLoading={categoriesLoading}
      isSaving={categoriesSaving}
      isDeleting={categoriesDeleting}
      onCreateCategory={createCategory}
      onUpdateCategory={({ categoryId: targetCategoryId, name, color, parentId }) =>
        updateCategory({ categoryId: targetCategoryId, payload: { name, color, parentId } })
      }
      onMoveCategory={({ categoryId: targetCategoryId, parentId }) =>
        moveCategory({ categoryId: targetCategoryId, parentId })
      }
      onDeleteCategory={deleteCategory}
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
      onUpdateCollection={({ collectionId: targetCollectionId, name, description, color, icon, templateId }) =>
        updateCollection({
          collectionId: targetCollectionId,
          payload: { name, description, color, icon, templateId },
        })
      }
      onMoveCollection={({ collectionId: targetCollectionId, targetIndex }) =>
        moveCollection({ collectionId: targetCollectionId, targetIndex })
      }
      onDeleteCollection={deleteCollection}
      />

      <BookCategoryDialog
      open={Boolean(selectedBookForCategories)}
      onOpenChange={(open) => {
        if (!open) {
          setSelectedBookForCategories(null);
        }
      }}
      bookTitle={selectedBookForCategories?.title ?? ''}
      categories={categories}
      selectedCategories={bookCategories}
      isLoading={bookCategoriesLoading}
      isSaving={bookCategoriesSaving}
      onSave={setBookCategories}
      />

      <BookCollectionDialog
      open={Boolean(selectedBookForCollections)}
      onOpenChange={(open) => {
        if (!open) {
          setSelectedBookForCollections(null);
        }
      }}
      bookTitle={selectedBookForCollections?.title ?? ''}
      collections={collections}
      selectedCollections={bookCollections}
      isLoading={bookCollectionsLoading}
      isSaving={bookCollectionsSaving}
      onSave={setBookCollections}
      />
    </>
  );
}
