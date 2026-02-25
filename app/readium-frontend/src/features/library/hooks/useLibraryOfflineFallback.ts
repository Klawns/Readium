import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { listOfflineLibraryBooks } from '@/features/offline/application/services/offline-library-books-service';

interface UseLibraryOfflineFallbackParams {
  enabled: boolean;
}

export const useLibraryOfflineFallback = ({ enabled }: UseLibraryOfflineFallbackParams) => {
  const offlineLibraryQuery = useQuery({
    queryKey: queryKeys.offlineLibraryBooks(),
    queryFn: listOfflineLibraryBooks,
    enabled,
    staleTime: 2_000,
  });

  const books = offlineLibraryQuery.data ?? [];

  return {
    books,
    isLoading: offlineLibraryQuery.isLoading,
    isUsingOfflineFallback: enabled && books.length > 0,
  };
};
