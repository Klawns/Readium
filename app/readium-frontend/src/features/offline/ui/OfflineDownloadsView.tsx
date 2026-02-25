import { Download, HardDriveDownload } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout.tsx';
import { formatBytes } from '../application/services/offline-byte-format';
import type { OfflineBookDownload } from '../domain/offline-book';
import { OfflineDownloadListItem } from '../components/OfflineDownloadListItem';
import type { OfflineBookReadingSnapshot } from './models/offline-book-reading-snapshot';

interface OfflineDownloadsViewProps {
  downloads: OfflineBookDownload[];
  totalSizeBytes: number;
  isLoading: boolean;
  isError: boolean;
  readingSnapshotByBookId: Map<number, OfflineBookReadingSnapshot>;
  downloadingBookId: number | null;
  downloadingBookProgressPercent: number | null;
  removingBookId: number | null;
  onOpenUpload: () => void;
  onOpenBook: (bookId: number) => void;
  onRemoveDownload: (bookId: number) => void;
}

export const OfflineDownloadsView = ({
  downloads,
  totalSizeBytes,
  isLoading,
  isError,
  readingSnapshotByBookId,
  downloadingBookId,
  downloadingBookProgressPercent,
  removingBookId,
  onOpenUpload,
  onOpenBook,
  onRemoveDownload,
}: OfflineDownloadsViewProps) => (
  <AppLayout onUploadClick={onOpenUpload}>
    <div className="container mx-auto max-w-5xl space-y-6 px-4 py-8 animate-fade-in">
      <header className="space-y-3">
        <div className="space-y-1.5">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Downloads</h1>
          <p className="text-muted-foreground">
            Livros salvos localmente para leitura offline.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600">
            {downloads.length} arquivo(s)
          </span>
          <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600">
            {formatBytes(totalSizeBytes)}
          </span>
        </div>
      </header>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-28 animate-pulse rounded-xl border border-slate-200 bg-white" />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
          Nao foi possivel carregar os downloads offline.
        </div>
      ) : downloads.length === 0 ? (
        <section className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
          <HardDriveDownload className="mx-auto h-10 w-10 text-slate-400" />
          <h2 className="mt-3 text-lg font-medium text-slate-900">Nenhum download offline ainda</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            Na biblioteca, use o botao de download para salvar PDFs e abrir sem internet.
          </p>
        </section>
      ) : (
        <div className="space-y-3">
          {downloads.map((item) => (
            <OfflineDownloadListItem
              key={item.bookId}
              item={item}
              readingSnapshot={readingSnapshotByBookId.get(item.bookId)}
              isDownloading={downloadingBookId === item.bookId}
              downloadingProgressPercent={
                downloadingBookId === item.bookId ? downloadingBookProgressPercent : null
              }
              isRemoving={removingBookId === item.bookId}
              onOpenBook={onOpenBook}
              onRemove={onRemoveDownload}
            />
          ))}
        </div>
      )}

      <footer className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
        <Download className="h-3.5 w-3.5" />
        Remover um item apaga apenas o arquivo local. O livro continua na biblioteca do servidor.
      </footer>
    </div>
  </AppLayout>
);
