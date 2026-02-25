import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Book, BookStatus } from '@/types';
import { queryKeys } from '@/lib/query-keys';
import { useOfflineBookDownload } from '@/features/offline/ui/hooks/useOfflineBooks';
import type { OfflineBookDownload } from '@/features/offline/domain/offline-book';
import {
  getOfflineBookSnapshot,
  upsertOfflineBookSnapshot,
} from '@/features/offline/application/services/offline-book-snapshot-service';

const FALLBACK_READER_STATUS: BookStatus = 'TO_READ';

const buildOfflineFallbackBook = (
  bookId: number,
  snapshot: Awaited<ReturnType<typeof getOfflineBookSnapshot>>,
  offlineDownload: OfflineBookDownload | null | undefined,
): Book | null => {
  if (!snapshot && !offlineDownload) {
    return null;
  }

  return {
    id: bookId,
    title: snapshot?.title ?? offlineDownload?.title ?? `Livro ${bookId}`,
    author: snapshot?.author ?? offlineDownload?.author ?? null,
    pages: snapshot?.pages ?? offlineDownload?.pages ?? null,
    format: offlineDownload ? 'PDF' : (snapshot?.format ?? 'PDF'),
    status: snapshot?.status ?? FALLBACK_READER_STATUS,
    coverUrl: snapshot?.coverUrl ?? null,
    lastReadPage: snapshot?.lastReadPage ?? null,
  };
};

interface UseReaderOfflineBookSourceParams {
  bookId: number;
  isValidBookId: boolean;
  remoteBook: Book | undefined;
  remoteFileUrl: string;
}

export const useReaderOfflineBookSource = ({
  bookId,
  isValidBookId,
  remoteBook,
  remoteFileUrl,
}: UseReaderOfflineBookSourceParams) => {
  const [offlineBlobUrl, setOfflineBlobUrl] = useState<string | null>(null);
  const offlineDownloadQuery = useOfflineBookDownload(bookId);
  const offlineSnapshotQuery = useQuery({
    queryKey: queryKeys.offlineBookSnapshot(bookId),
    queryFn: () => getOfflineBookSnapshot(bookId),
    enabled: isValidBookId,
    staleTime: 2_000,
  });

  useEffect(() => {
    const blob = offlineDownloadQuery.data?.fileBlob;
    if (!blob) {
      setOfflineBlobUrl(null);
      return undefined;
    }

    const objectUrl = URL.createObjectURL(blob);
    setOfflineBlobUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [offlineDownloadQuery.data?.fileBlob]);

  useEffect(() => {
    if (!remoteBook) {
      return;
    }
    void upsertOfflineBookSnapshot(remoteBook);
  }, [remoteBook]);

  const preferredOfflineFileUrl = offlineBlobUrl ?? offlineDownloadQuery.data?.webViewUrl ?? null;
  const fileUrl = preferredOfflineFileUrl ?? (offlineDownloadQuery.isFetched ? remoteFileUrl : '');
  const fallbackBook = buildOfflineFallbackBook(bookId, offlineSnapshotQuery.data, offlineDownloadQuery.data);
  const book = remoteBook ?? fallbackBook;

  return {
    book,
    fileUrl,
  };
};
