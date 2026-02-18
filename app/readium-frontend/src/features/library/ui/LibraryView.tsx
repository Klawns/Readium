import { Search, BookOpen, CheckCircle2, Clock, Plus } from 'lucide-react';
import type { Book, BookStatus, StatusFilter } from '@/types';
import AppLayout from '@/components/layout/AppLayout.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Button } from '@/components/ui/button.tsx';
import BookCard from '../components/BookCard.tsx';
import BookFilter from '../components/BookFilter.tsx';
import UploadModal from '../components/UploadModal.tsx';

interface LibraryViewProps {
  books: Book[];
  totalPages: number;
  isLoading: boolean;
  isError: boolean;
  page: number;
  statusFilter: StatusFilter;
  searchQuery: string;
  localSearch: string;
  uploadOpen: boolean;
  isUploading: boolean;
  uploadProgress: number | null;
  onSearchChange: (value: string) => void;
  onOpenUpload: () => void;
  onCloseUpload: () => void;
  onUpload: (file: File) => Promise<void> | void;
  onFilterChange: (status: StatusFilter) => void;
  onRetry: () => void;
  onBookClick: (bookId: number) => void;
  onBookStatusChange: (bookId: number, status: BookStatus) => void;
  onPageChange: (page: number) => void;
}

const getEmptyStateMessage = (statusFilter: StatusFilter, searchQuery: string) => {
  if (searchQuery) {
    return { title: 'Nenhum livro encontrado', desc: `Nao encontramos resultados para "${searchQuery}".` };
  }
  switch (statusFilter) {
    case 'READING':
      return {
        title: 'Voce nao esta lendo nada',
        desc: 'Comece um livro da sua lista "Para Ler".',
        icon: <BookOpen className="mb-4 h-12 w-12 text-muted-foreground/30" />,
      };
    case 'TO_READ':
      return {
        title: 'Sua lista de leitura esta vazia',
        desc: 'Adicione novos livros para ler depois.',
        icon: <Clock className="mb-4 h-12 w-12 text-muted-foreground/30" />,
      };
    case 'READ':
      return {
        title: 'Nenhum livro concluido',
        desc: 'Termine sua primeira leitura para ve-la aqui.',
        icon: <CheckCircle2 className="mb-4 h-12 w-12 text-muted-foreground/30" />,
      };
    default:
      return {
        title: 'Sua biblioteca esta vazia',
        desc: 'Faca upload do seu primeiro livro para comecar.',
        icon: <BookOpen className="mb-4 h-12 w-12 text-muted-foreground/30" />,
      };
  }
};

export default function LibraryView({
  books,
  totalPages,
  isLoading,
  isError,
  page,
  statusFilter,
  searchQuery,
  localSearch,
  uploadOpen,
  isUploading,
  uploadProgress,
  onSearchChange,
  onOpenUpload,
  onCloseUpload,
  onUpload,
  onFilterChange,
  onRetry,
  onBookClick,
  onBookStatusChange,
  onPageChange,
}: LibraryViewProps) {
  const emptyState = getEmptyStateMessage(statusFilter, searchQuery);

  return (
    <AppLayout onUploadClick={onOpenUpload}>
      <div className="container mx-auto max-w-7xl space-y-8 px-4 py-8 animate-fade-in">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Biblioteca</h1>
            <p className="text-muted-foreground">Gerencie e organize sua colecao pessoal.</p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por titulo ou autor..."
                value={localSearch}
                onChange={(event) => onSearchChange(event.target.value)}
                className="bg-background/50 pl-9 backdrop-blur-sm"
              />
            </div>
            <BookFilter active={statusFilter} onChange={onFilterChange} />
            <Button onClick={onOpenUpload} size="icon" className="shrink-0 lg:hidden">
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {Array.from({ length: 12 }).map((_, index) => (
              <div key={index} className="space-y-3">
                <div className="aspect-[2/3] animate-pulse rounded-xl bg-muted" />
                <div className="space-y-2">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-destructive/10 bg-destructive/5 py-24 text-destructive">
            <p className="text-lg font-medium">Erro ao carregar livros</p>
            <p className="mt-1 text-sm text-muted-foreground">Verifique sua conexao e tente novamente.</p>
            <Button variant="outline" className="mt-4" onClick={onRetry}>
              Tentar novamente
            </Button>
          </div>
        ) : books.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center animate-fade-in">
            {emptyState.icon}
            <h3 className="mb-2 text-xl font-semibold text-foreground">{emptyState.title}</h3>
            <p className="mx-auto mb-6 max-w-sm text-muted-foreground">{emptyState.desc}</p>
            {statusFilter === 'ALL' && !searchQuery && (
              <Button onClick={onOpenUpload}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Livro
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
              {books.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  onClick={() => onBookClick(book.id)}
                  onStatusChange={(status) => onBookStatusChange(book.id, status)}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-12 flex justify-center gap-2">
                <Button variant="outline" disabled={page === 0} onClick={() => onPageChange(page - 1)}>
                  Anterior
                </Button>
                <div className="flex items-center px-4 text-sm font-medium text-muted-foreground">
                  Pagina {page + 1} de {totalPages}
                </div>
                <Button
                  variant="outline"
                  disabled={page >= totalPages - 1}
                  onClick={() => onPageChange(page + 1)}
                >
                  Proxima
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <UploadModal
        open={uploadOpen}
        onClose={onCloseUpload}
        onUpload={onUpload}
        isUploading={isUploading}
        uploadProgress={uploadProgress}
      />
    </AppLayout>
  );
}
