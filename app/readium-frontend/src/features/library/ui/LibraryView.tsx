import { BookOpen, CheckCircle2, Clock, Plus } from 'lucide-react';
import type {
  Book,
  BookStatus,
  Category,
  ReadingCollection,
  StatusFilter,
} from '@/types';
import AppLayout from '@/components/layout/AppLayout.tsx';
import { Button } from '@/components/ui/button.tsx';
import BookCard from '../components/BookCard.tsx';
import { LibraryCommandBar } from '../components/LibraryCommandBar.tsx';
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
  categories: Category[];
  selectedCategoryId: number | null;
  collections: ReadingCollection[];
  selectedCollectionId: number | null;
  onSearchChange: (value: string) => void;
  onOpenUpload: () => void;
  onCloseUpload: () => void;
  onUpload: (file: File) => Promise<void> | void;
  onFilterChange: (status: StatusFilter) => void;
  onRetry: () => void;
  onBookClick: (bookId: number) => void;
  onBookStatusChange: (bookId: number, status: BookStatus) => void;
  onBookManageCategories: (book: Book) => void;
  onBookManageCollections: (book: Book) => void;
  onPageChange: (page: number) => void;
  onCategoryFilterChange: (categoryId: number | null) => void;
  onCollectionFilterChange: (collectionId: number | null) => void;
  onClearAllFilters: () => void;
  onOpenCategoryManager: () => void;
  onOpenCollectionManager: () => void;
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
  categories,
  selectedCategoryId,
  collections,
  selectedCollectionId,
  onSearchChange,
  onOpenUpload,
  onCloseUpload,
  onUpload,
  onFilterChange,
  onRetry,
  onBookClick,
  onBookStatusChange,
  onBookManageCategories,
  onBookManageCollections,
  onPageChange,
  onCategoryFilterChange,
  onCollectionFilterChange,
  onClearAllFilters,
  onOpenCategoryManager,
  onOpenCollectionManager,
}: LibraryViewProps) {
  const emptyState = getEmptyStateMessage(statusFilter, searchQuery);

  return (
    <AppLayout onUploadClick={onOpenUpload}>
      <div className="container mx-auto max-w-7xl space-y-6 px-4 py-8 animate-fade-in">
        <div className="space-y-3">
          <div className="space-y-1.5">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Biblioteca</h1>
            <p className="text-muted-foreground">Gerencie e organize sua colecao pessoal.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600">
              {books.length} livros na pagina
            </span>
            <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600">
              {totalPages} pagina(s)
            </span>
          </div>
        </div>

        <div className="sticky top-0 z-20 -mx-1 border-b border-slate-200/70 bg-slate-50/85 px-1 py-2 backdrop-blur supports-[backdrop-filter]:bg-slate-50/70">
          <LibraryCommandBar
            searchValue={localSearch}
            statusFilter={statusFilter}
            categories={categories}
            collections={collections}
            selectedCategoryId={selectedCategoryId}
            selectedCollectionId={selectedCollectionId}
            onSearchChange={onSearchChange}
            onStatusChange={onFilterChange}
            onCategoryChange={onCategoryFilterChange}
            onCollectionChange={onCollectionFilterChange}
            onClearAllFilters={onClearAllFilters}
            onOpenCategoryManager={onOpenCategoryManager}
            onOpenCollectionManager={onOpenCollectionManager}
            onOpenUpload={onOpenUpload}
          />
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
                  onManageCategories={() => onBookManageCategories(book)}
                  onManageCollections={() => onBookManageCollections(book)}
                  density="comfortable"
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
