import { useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import type { OfflineDownloadUseCases } from '../../application/use-cases/offline-download-use-cases';
import { defaultOfflineDownloadUseCases } from '../../infrastructure/offline-download-use-cases';
import { useOfflineDownloadMutations } from './useOfflineDownloadMutations';
import { useOfflineBookReadingSnapshots } from './useOfflineBookReadingSnapshots';

export const useOfflineBooks = (
  useCases: OfflineDownloadUseCases = defaultOfflineDownloadUseCases,
) => {
  const queryClient = useQueryClient();
  const downloadsQuery = useQuery({
    queryKey: queryKeys.offlineDownloadsRoot(),
    queryFn: useCases.listDownloads,
    staleTime: 2_000,
  });

  const downloads = downloadsQuery.data ?? [];
  const downloadedBookIds = useMemo(
    () => downloads.map((download) => download.bookId),
    [downloads],
  );
  const downloadedBookIdsSignature = useMemo(
    () => downloadedBookIds.join(','),
    [downloadedBookIds],
  );
  const readingSnapshotByBookId = useOfflineBookReadingSnapshots({ downloads, useCases });
  const {
    downloadBook,
    removeDownload,
    isDownloadingBookId,
    downloadingBookProgressPercent,
    isRemovingBookId,
  } = useOfflineDownloadMutations(useCases);

  const downloadedByBookId = useMemo(() => {
    const map = new Map<number, boolean>();
    downloads.forEach((download) => {
      map.set(download.bookId, true);
    });
    return map;
  }, [downloads]);

  const totalSizeBytes = useMemo(
    () => downloads.reduce((total, item) => total + item.sizeBytes, 0),
    [downloads],
  );

  useEffect(() => {
    if (downloadedBookIds.length === 0) {
      return;
    }

    let isDisposed = false;

    const runBackfill = async (force = false): Promise<void> => {
      const updatedCount = await useCases.backfillCoverSnapshots(downloadedBookIds, { force });
      if (isDisposed || updatedCount <= 0) {
        return;
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.offlineLibraryBooks() }),
        queryClient.invalidateQueries({ queryKey: ['offline', 'book-snapshots'] }),
        queryClient.invalidateQueries({ queryKey: ['offline', 'book-snapshot'] }),
        queryClient.invalidateQueries({ queryKey: queryKeys.insightsRoot() }),
      ]);
    };

    void runBackfill(false);

    const handleOnline = () => {
      void runBackfill(true);
    };

    window.addEventListener('online', handleOnline);

    return () => {
      isDisposed = true;
      window.removeEventListener('online', handleOnline);
    };
  }, [downloadedBookIds, downloadedBookIdsSignature, queryClient, useCases]);

  return {
    downloads,
    readingSnapshotByBookId,
    downloadedByBookId,
    totalSizeBytes,
    isLoading: downloadsQuery.isLoading,
    isError: downloadsQuery.isError,
    downloadBook,
    removeDownload,
    isDownloadingBookId,
    downloadingBookProgressPercent,
    isRemovingBookId,
  };
};

export const useOfflineBookDownload = (
  bookId: number,
  useCases: OfflineDownloadUseCases = defaultOfflineDownloadUseCases,
) => {
  const isValidBookId = Number.isFinite(bookId) && bookId > 0;
  return useQuery({
    queryKey: queryKeys.offlineDownload(bookId),
    queryFn: () => useCases.getDownload(bookId),
    enabled: isValidBookId,
    staleTime: 2_000,
  });
};
