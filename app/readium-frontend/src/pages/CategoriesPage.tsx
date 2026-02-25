import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCategories } from '@/features/classification/ui/hooks/useCategories.ts';
import { useCategoryExplorerState } from '@/features/classification/ui/hooks/useCategoryExplorerState';
import { CategoriesView } from '@/features/classification/ui/CategoriesView.tsx';

export default function CategoriesPage() {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const {
    categories,
    isLoading,
    isError,
    createCategory,
    updateCategory,
    moveCategory,
    deleteCategory,
    isSaving,
    isDeleting,
  } = useCategories(searchQuery);

  const explorer = useCategoryExplorerState({ categories });

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearchQuery(searchInput.trim());
    }, 350);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  return (
    <CategoriesView
      categories={categories}
      visibleCategories={explorer.visibleCategories}
      rootCategories={explorer.rootCategories}
      descendantCountById={explorer.descendantCountById}
      activeFilter={explorer.activeFilter}
      isLoading={isLoading}
      isError={isError}
      isSaving={isSaving}
      isDeleting={isDeleting}
      searchQuery={searchInput}
      contentTitle={explorer.contentTitle}
      contentSubtitle={explorer.contentSubtitle}
      onSearchChange={setSearchInput}
      onSelectFilter={explorer.setActiveFilter}
      onCreateCategory={createCategory}
      onUpdateCategory={({ categoryId, name, color, parentId }) =>
        updateCategory({
          categoryId,
          payload: { name, color, parentId },
        })
      }
      onMoveCategory={moveCategory}
      onDeleteCategory={deleteCategory}
      onOpenUpload={() => navigate('/books')}
    />
  );
}
