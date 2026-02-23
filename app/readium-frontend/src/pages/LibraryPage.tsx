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
import { useLibraryViewPreferences } from '@/features/library/ui/hooks/useLibraryViewPreferences.ts';
import type { SavedLibraryView } from '@/features/library/domain/library-view';
import { useInsights } from '@/features/insights/ui/hooks/useInsights.ts';
import { useReadingCollections } from '@/features/collections/ui/hooks/useReadingCollections.ts';
import { CollectionManagerDialog } from '@/features/collections/components/CollectionManagerDialog.tsx';
import { useBookCollections } from '@/features/collections/ui/hooks/useBookCollections.ts';
import { BookCollectionDialog } from '@/features/collections/components/BookCollectionDialog.tsx';

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
  const {
    layoutMode,
    setLayoutMode,
    savedViews,
    saveCurrentView,
    deleteSavedView,
  } = useLibraryViewPreferences();
  const {
    metrics,
    smartCollections,
    recommendations,
    isLoading: insightsLoading,
    isError: insightsError,
  } = useInsights({ recommendationLimit: 6 });

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

  const handleApplySavedView = (savedView: SavedLibraryView) => {
    setLayoutMode(savedView.layoutMode);
    setLocalSearch(savedView.searchQuery);
    updateParams({
      status: savedView.statusFilter,
      query: savedView.searchQuery,
      categoryId: savedView.categoryId,
      collectionId: savedView.collectionId ?? null,
      page: 0,
    });
  };

  const handleSaveCurrentView = (name: string) => {
    saveCurrentView(name, {
      statusFilter,
      searchQuery: localSearch,
      categoryId,
      collectionId,
      layoutMode,
    });
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
      layoutMode={layoutMode}
      savedViews={savedViews}
      insightMetrics={metrics}
      insightSmartCollections={smartCollections}
      insightRecommendations={recommendations}
      insightsLoading={insightsLoading}
      insightsError={insightsError}
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
      onOpenCategoryManager={() => setCategoriesOpen(true)}
      onOpenCollectionManager={() => setCollectionsOpen(true)}
      onBookManageCategories={(book) => setSelectedBookForCategories(book)}
      onBookManageCollections={(book) => setSelectedBookForCollections(book)}
      onLayoutModeChange={setLayoutMode}
      onApplySavedView={handleApplySavedView}
      onSaveCurrentView={handleSaveCurrentView}
      onDeleteSavedView={deleteSavedView}
      onOpenInsightBook={(bookId) => navigate(`/books/${bookId}`)}
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
      onOpenChange={setCollectionsOpen}
      collections={collections}
      isLoading={collectionsLoading}
      isSaving={collectionsSaving}
      isDeleting={collectionsDeleting}
      onCreateCollection={createCollection}
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
