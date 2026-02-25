import { BookOpen, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import { getBookReadingProgress } from '@/lib/book-reading-progress';
import type { OfflineBookDownload } from '../domain/offline-book';
import { formatBytes } from '../application/services/offline-byte-format';
import type { OfflineBookReadingSnapshot } from '../ui/models/offline-book-reading-snapshot';

interface OfflineDownloadListItemProps {
  item: OfflineBookDownload;
  readingSnapshot?: OfflineBookReadingSnapshot;
  isDownloading: boolean;
  downloadingProgressPercent: number | null;
  isRemoving: boolean;
  onOpenBook: (bookId: number) => void;
  onRemove: (bookId: number) => void;
}

export const OfflineDownloadListItem = ({
  item,
  readingSnapshot,
  isDownloading,
  downloadingProgressPercent,
  isRemoving,
  onOpenBook,
  onRemove,
}: OfflineDownloadListItemProps) => {
  const readingProgress = getBookReadingProgress({
    status: readingSnapshot?.status,
    pages: readingSnapshot?.pages ?? item.pages,
    lastReadPage: readingSnapshot?.lastReadPage,
  });
  const showReadingProgress = readingProgress.progressPercent > 0 || readingSnapshot?.status === 'READING';
  const downloadProgressLabel = downloadingProgressPercent == null
    ? 'Baixando arquivo...'
    : `Baixando ${downloadingProgressPercent}%`;

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-2">
          <h3 className="truncate text-base font-semibold text-slate-900">{item.title}</h3>
          <p className="truncate text-sm text-slate-500">{item.author ?? 'Autor desconhecido'}</p>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5">
              {formatBytes(item.sizeBytes)}
            </span>
            {readingProgress.knownPages > 0 ? (
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5">
                {readingProgress.readPages}/{readingProgress.knownPages} pags
              </span>
            ) : null}
            {showReadingProgress ? (
              <span className="rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 font-medium text-sky-700">
                Leitura {readingProgress.progressPercent}%
              </span>
            ) : null}
          </div>

          {showReadingProgress ? (
            <div className="space-y-1 pt-1">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-sky-500 transition-all duration-500 ease-out"
                  style={{ width: `${readingProgress.progressPercent}%` }}
                />
              </div>
            </div>
          ) : null}

          {isDownloading ? (
            <div className="space-y-1 pt-1">
              <p className="text-xs font-medium text-slate-600">{downloadProgressLabel}</p>
              {downloadingProgressPercent != null ? (
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-300 ease-out"
                    style={{ width: `${downloadingProgressPercent}%` }}
                  />
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => onOpenBook(item.bookId)}>
            <BookOpen className="h-4 w-4" />
            Abrir
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-red-600 hover:bg-red-50 hover:text-red-700"
            disabled={isRemoving}
            onClick={() => onRemove(item.bookId)}
          >
            <Trash2 className="h-4 w-4" />
            Remover
          </Button>
        </div>
      </div>
    </article>
  );
};
