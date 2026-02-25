import { useNavigate } from 'react-router-dom';
import { OfflineDownloadsView } from '@/features/offline/ui/OfflineDownloadsView';
import { useOfflineBooks } from '@/features/offline/ui/hooks/useOfflineBooks';

export default function OfflineDownloadsPage() {
  const navigate = useNavigate();
  const {
    downloads,
    totalSizeBytes,
    isLoading,
    isError,
    readingSnapshotByBookId,
    removeDownload,
    isDownloadingBookId,
    downloadingBookProgressPercent,
    isRemovingBookId,
  } = useOfflineBooks();

  return (
    <OfflineDownloadsView
      downloads={downloads}
      totalSizeBytes={totalSizeBytes}
      isLoading={isLoading}
      isError={isError}
      readingSnapshotByBookId={readingSnapshotByBookId}
      downloadingBookId={isDownloadingBookId}
      downloadingBookProgressPercent={downloadingBookProgressPercent}
      removingBookId={isRemovingBookId}
      onOpenUpload={() => navigate('/books')}
      onOpenBook={(bookId) => navigate(`/books/${bookId}`)}
      onRemoveDownload={(bookId) => {
        void removeDownload(bookId);
      }}
    />
  );
}
