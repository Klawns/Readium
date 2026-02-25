import { Check, Search } from 'lucide-react';
import type { Book } from '@/types';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';

export interface CollectionManagerBookPickerProps {
  availableBooks: Book[];
  booksSearchQuery: string;
  booksTotal: number;
  isLoadingBooks: boolean;
  selectedBooksCount: number;
  isBookSelected: (bookId: number) => boolean;
  onBooksSearchQueryChange: (query: string) => void;
  onToggleBook: (bookId: number) => void;
  onSelectVisibleBooks: () => void;
  onClearSelectedBooks: () => void;
}

export const CollectionManagerBookPicker = ({
  availableBooks,
  booksSearchQuery,
  booksTotal,
  isLoadingBooks,
  selectedBooksCount,
  isBookSelected,
  onBooksSearchQueryChange,
  onToggleBook,
  onSelectVisibleBooks,
  onClearSelectedBooks,
}: CollectionManagerBookPickerProps) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between gap-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Livros iniciais</p>
      <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] text-slate-500">
        {selectedBooksCount} selecionados
      </span>
    </div>
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 px-2 text-xs"
        onClick={onSelectVisibleBooks}
        disabled={isLoadingBooks || availableBooks.length === 0}
      >
        Selecionar visiveis
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 px-2 text-xs text-slate-600"
        onClick={onClearSelectedBooks}
        disabled={selectedBooksCount === 0}
      >
        Limpar
      </Button>
    </div>
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
      <Input
        value={booksSearchQuery}
        onChange={(event) => onBooksSearchQueryChange(event.target.value)}
        placeholder="Buscar livro..."
        className="h-9 pl-8"
      />
    </div>
    <div className="max-h-52 space-y-1 overflow-y-auto rounded-md border border-slate-200 bg-slate-50 p-1.5">
      {isLoadingBooks ? (
        <div className="px-2 py-3 text-xs text-slate-500">Carregando livros...</div>
      ) : availableBooks.length === 0 ? (
        <div className="px-2 py-3 text-xs text-slate-500">Nenhum livro encontrado.</div>
      ) : (
        availableBooks.map((book) => {
          const selected = isBookSelected(book.id);
          return (
            <button
              key={book.id}
              type="button"
              onClick={() => onToggleBook(book.id)}
              className={`flex w-full items-center gap-2 rounded-md border px-2 py-1.5 text-left text-xs transition ${
                selected
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-transparent bg-white text-slate-700 hover:border-slate-200'
              }`}
            >
              <span className="inline-flex h-4 w-4 items-center justify-center rounded border border-current/40">
                {selected ? <Check className="h-3 w-3" /> : null}
              </span>
              <span className="min-w-0 flex-1 truncate">{book.title}</span>
            </button>
          );
        })
      )}
    </div>
    <p className="text-[11px] text-slate-500">Mostrando ate {availableBooks.length} de {booksTotal} livros.</p>
  </div>
);
