import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { OfflineBookDownload } from '../../domain/offline-book';
import type { OfflineDownloadUseCases } from '../../application/use-cases/offline-download-use-cases';
import type { OfflineBookReadingSnapshot } from '../models/offline-book-reading-snapshot';

interface UseOfflineBookReadingSnapshotsInput {
  downloads: OfflineBookDownload[];
  useCases: OfflineDownloadUseCases;
}

export const useOfflineBookReadingSnapshots = ({
  downloads,
  useCases,
}: UseOfflineBookReadingSnapshotsInput): Map<number, OfflineBookReadingSnapshot> => {
  const downloadedBookIds = useMemo(
    () => downloads.map((download) => download.bookId),
    [downloads],
  );

  const snapshotsByBookIdQuery = useQuery({
    queryKey: ['offline', 'book-snapshots', downloadedBookIds],
    queryFn: () => useCases.listSnapshotsByIds(downloadedBookIds),
    enabled: downloadedBookIds.length > 0,
    staleTime: 2_000,
  });

  return useMemo(() => {
    const map = new Map<number, OfflineBookReadingSnapshot>();
    const snapshotsById = snapshotsByBookIdQuery.data;

    downloads.forEach((download) => {
      const snapshot = snapshotsById?.get(download.bookId);
      map.set(download.bookId, {
        status: snapshot?.status ?? null,
        lastReadPage: snapshot?.lastReadPage ?? null,
        pages: snapshot?.pages ?? download.pages ?? null,
      });
    });

    return map;
  }, [downloads, snapshotsByBookIdQuery.data]);
};
