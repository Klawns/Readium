import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useLibrary } from '@/features/library/hooks/useLibrary.ts';
import { useLibrarySearchParams } from '@/features/library/hooks/useLibrarySearchParams.ts';
import LibraryView from '@/features/library/ui/LibraryView.tsx';
import { queryKeys } from '@/lib/query-keys';

export default function LibraryPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { statusFilter, page, searchQuery, updateParams } = useLibrarySearchParams();

  const {
    books,
    totalPages,
    isLoading,
    isError,
    uploadBook,
    updateStatus,
    isUploading,
    uploadProgress,
  } = useLibrary({ page, statusFilter, searchQuery });

  const [uploadOpen, setUploadOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery);

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

  const handleUpload = async (file: File) => {
    await uploadBook(file);
    setUploadOpen(false);
  };

  return (
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
      onSearchChange={setLocalSearch}
      onOpenUpload={() => setUploadOpen(true)}
      onCloseUpload={() => setUploadOpen(false)}
      onUpload={handleUpload}
      onFilterChange={(nextFilter) => updateParams({ status: nextFilter, page: 0 })}
      onRetry={() => queryClient.invalidateQueries({ queryKey: queryKeys.booksRoot() })}
      onBookClick={(bookId) => navigate(`/books/${bookId}`)}
      onBookStatusChange={(bookId, status) => updateStatus(bookId, status)}
      onPageChange={(nextPage) => updateParams({ page: nextPage })}
    />
  );
}
