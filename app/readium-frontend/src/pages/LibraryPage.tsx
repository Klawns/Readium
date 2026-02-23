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

export default function LibraryPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { statusFilter, page, searchQuery, categoryId, updateParams } = useLibrarySearchParams();

  const {
    books,
    totalPages,
    isLoading,
    isError,
    uploadBook,
    updateStatus,
    isUploading,
    uploadProgress,
  } = useLibrary({ page, statusFilter, searchQuery, categoryId });

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
    layoutMode,
    setLayoutMode,
    savedViews,
    saveCurrentView,
    deleteSavedView,
  } = useLibraryViewPreferences();

  const [uploadOpen, setUploadOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [selectedBookForCategories, setSelectedBookForCategories] = useState<Book | null>(null);

  const {
    bookCategories,
    isLoading: bookCategoriesLoading,
    setBookCategories,
    isSaving: bookCategoriesSaving,
  } = useBookCategories(selectedBookForCategories?.id ?? null);

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
      page: 0,
    });
  };

  const handleSaveCurrentView = (name: string) => {
    saveCurrentView(name, {
      statusFilter,
      searchQuery: localSearch,
      categoryId,
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
      layoutMode={layoutMode}
      savedViews={savedViews}
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
      onOpenCategoryManager={() => setCategoriesOpen(true)}
      onBookManageCategories={(book) => setSelectedBookForCategories(book)}
      onLayoutModeChange={setLayoutMode}
      onApplySavedView={handleApplySavedView}
      onSaveCurrentView={handleSaveCurrentView}
      onDeleteSavedView={deleteSavedView}
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
    </>
  );
}
