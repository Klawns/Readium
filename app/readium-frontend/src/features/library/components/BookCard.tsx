import type { Book, BookStatus } from '@/types';
import {
  Book as BookIcon,
  BookOpen,
  CheckCircle2,
  Clock,
  Download,
  FolderTree,
  Loader2,
  MoreHorizontal,
  Trash2,
} from 'lucide-react';
import { getBookReadingProgress } from '@/lib/book-reading-progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx';
import { BOOK_STATUS_LABEL } from '../domain/status-metadata';
import StatusSelector from './StatusSelector.tsx';

interface BookCardProps {
  book: Book;
  onClick: () => void;
  onStatusChange?: (status: BookStatus) => void;
  onManageCategories?: () => void;
  onManageCollections?: () => void;
  isOfflineAvailable?: boolean;
  isDownloadingOffline?: boolean;
  offlineDownloadProgressPercent?: number | null;
  onDownloadOffline?: () => void;
  onRemoveOffline?: () => void;
  density?: 'comfortable' | 'compact';
}

export default function BookCard({
  book,
  onClick,
  onStatusChange,
  onManageCategories,
  onManageCollections,
  isOfflineAvailable = false,
  isDownloadingOffline = false,
  offlineDownloadProgressPercent = null,
  onDownloadOffline,
  onRemoveOffline,
  density = 'comfortable',
}: BookCardProps) {
  const statusColorByBookStatus: Record<BookStatus, string> = {
    TO_READ: 'bg-red-500',
    READING: 'bg-amber-500',
    READ: 'bg-emerald-500',
  };
  const statusIconByBookStatus: Record<BookStatus, typeof Clock> = {
    TO_READ: Clock,
    READING: BookOpen,
    READ: CheckCircle2,
  };
  const statusOptions: BookStatus[] = ['TO_READ', 'READING', 'READ'];
  const readingProgress = getBookReadingProgress({
    status: book.status,
    pages: book.pages,
    lastReadPage: book.lastReadPage,
  });

  const normalizedAuthor = book.author?.trim() || null;
  const isMetadataPending = !normalizedAuthor && book.pages == null;
  const pageProgressLabel = readingProgress.knownPages > 0
    ? `${readingProgress.readPages}/${readingProgress.knownPages} pags`
    : null;
  const downloadLabel = isDownloadingOffline
    ? (
      offlineDownloadProgressPercent == null
        ? 'Baixando...'
        : `Baixando ${offlineDownloadProgressPercent}%`
    )
    : (isOfflineAvailable ? 'Offline' : 'Baixar');
  const hasTaxonomyActions = Boolean(onManageCategories || onManageCollections);
  const hasLibraryActions = Boolean(onManageCategories || onManageCollections || onDownloadOffline);
  const hasSecondaryActions = Boolean(onStatusChange || hasLibraryActions);
  const canRemoveOffline = isOfflineAvailable && Boolean(onRemoveOffline);
  const shouldRenderInlineProgressBar = readingProgress.shouldRenderProgressBar && density !== 'compact';

  const handleOfflineAction = () => {
    if (!onDownloadOffline || isDownloadingOffline) {
      return;
    }
    if (canRemoveOffline && onRemoveOffline) {
      onRemoveOffline();
      return;
    }
    onDownloadOffline();
  };

  return (
    <div
      onClick={onClick}
      className={`group relative flex cursor-pointer flex-col animate-fade-in ${density === 'compact' ? 'gap-2' : 'gap-2.5'}`}
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-muted shadow-sm transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-lg">
        {book.coverUrl ? (
          <img
            src={book.coverUrl}
            alt={book.title}
            width={400}
            height={600}
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 20vw"
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-secondary/30 text-muted-foreground/40">
            <BookIcon className="h-12 w-12" strokeWidth={1} />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-black/5 to-black/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        {onStatusChange ? (
          <div className="absolute left-2 top-2 z-10" onClick={(event) => event.stopPropagation()}>
            <StatusSelector status={book.status} onChange={onStatusChange} variant="dot" />
          </div>
        ) : (
          <span
            className={`absolute left-2 top-2 z-10 h-2.5 w-2.5 rounded-full ring-2 ring-white/90 shadow-sm ${statusColorByBookStatus[book.status]}`}
            aria-hidden="true"
          />
        )}

        {hasSecondaryActions ? (
          <div className="absolute right-2 top-2 z-10" onClick={(event) => event.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 sm:h-7 sm:w-7"
                  aria-label="Abrir acoes do livro"
                >
                  <MoreHorizontal className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[min(18rem,calc(100vw-2rem))] max-h-[70dvh]">
                {onStatusChange ? (
                  <>
                    <DropdownMenuLabel>Status</DropdownMenuLabel>
                    {statusOptions.map((statusOption) => {
                      const ItemIcon = statusIconByBookStatus[statusOption];
                      const isSelected = statusOption === book.status;
                      return (
                        <DropdownMenuItem
                          key={statusOption}
                          onClick={(event) => {
                            event.stopPropagation();
                            onStatusChange(statusOption);
                          }}
                          className="justify-between gap-2"
                        >
                          <span className="flex items-center gap-2">
                            <span className={`h-2 w-2 rounded-full ${statusColorByBookStatus[statusOption]}`} />
                            <ItemIcon className="h-3.5 w-3.5 text-slate-500" />
                            <span>{BOOK_STATUS_LABEL[statusOption]}</span>
                          </span>
                          {isSelected ? <CheckCircle2 className="h-3.5 w-3.5 text-slate-400" /> : null}
                        </DropdownMenuItem>
                      );
                    })}
                  </>
                ) : null}
                {hasLibraryActions ? (
                  <>
                    {onStatusChange ? <DropdownMenuSeparator /> : null}
                    <DropdownMenuLabel>Acoes</DropdownMenuLabel>
                    {onManageCategories ? (
                      <DropdownMenuItem
                        onClick={(event) => {
                          event.stopPropagation();
                          onManageCategories();
                        }}
                      >
                        <FolderTree className="mr-2 h-4 w-4 text-slate-500" />
                        Categorias
                      </DropdownMenuItem>
                    ) : null}
                    {onManageCollections ? (
                      <DropdownMenuItem
                        onClick={(event) => {
                          event.stopPropagation();
                          onManageCollections();
                        }}
                      >
                        <BookIcon className="mr-2 h-4 w-4 text-slate-500" />
                        Colecoes
                      </DropdownMenuItem>
                    ) : null}
                    {onDownloadOffline ? (
                      <>
                        {hasTaxonomyActions ? <DropdownMenuSeparator /> : null}
                        <DropdownMenuItem onClick={handleOfflineAction} disabled={isDownloadingOffline}>
                          {isDownloadingOffline ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin text-slate-500" />
                          ) : canRemoveOffline ? (
                            <Trash2 className="mr-2 h-4 w-4 text-slate-500" />
                          ) : isOfflineAvailable ? (
                            <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-600" />
                          ) : (
                            <Download className="mr-2 h-4 w-4 text-slate-500" />
                          )}
                          {canRemoveOffline ? 'Remover offline' : downloadLabel}
                        </DropdownMenuItem>
                      </>
                    ) : null}
                  </>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : null}

      </div>

      <div className={`space-y-1.5 ${density === 'compact' ? 'min-h-[3.6rem]' : 'min-h-[4.2rem]'}`}>
        <h3 className="line-clamp-2 text-sm font-medium leading-tight text-foreground transition-colors group-hover:text-primary" title={book.title}>
          {book.title}
        </h3>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {normalizedAuthor ? (
            <p className="max-w-full truncate text-xs text-muted-foreground" title={normalizedAuthor}>
              {normalizedAuthor}
            </p>
          ) : isMetadataPending ? (
            <p className="animate-pulse text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50">
              Processando metadados...
            </p>
          ) : (
            <p className="text-[10px] font-medium uppercase tracking-wider text-amber-700/80" title="Autor nao encontrado nos metadados do arquivo">
              Autor desconhecido
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {pageProgressLabel ? (
            <span className="rounded-full border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
              {pageProgressLabel}
            </span>
          ) : null}
          {!shouldRenderInlineProgressBar && readingProgress.shouldRenderProgressBar ? (
            <span className="rounded-full border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
              {readingProgress.progressPercent}%
            </span>
          ) : null}
        </div>

        {shouldRenderInlineProgressBar ? (
          <div className="mt-1.5 flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200/70">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 transition-[width] duration-500 ease-out"
                style={{ width: `${readingProgress.progressPercent}%` }}
              />
            </div>
            <span className="text-[10px] font-medium tabular-nums text-slate-500">
              {readingProgress.progressPercent}%
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
