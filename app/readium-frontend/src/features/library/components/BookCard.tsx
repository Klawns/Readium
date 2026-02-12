import type { Book, BookStatus } from '@/types';
import { Book as BookIcon } from 'lucide-react';
import StatusSelector from './StatusSelector.tsx';

interface BookCardProps {
  book: Book;
  onClick: () => void;
  onStatusChange?: (status: BookStatus) => void;
}

export default function BookCard({ book, onClick, onStatusChange }: BookCardProps) {
  // Calcular progresso
  let progressPercentage = 0;
  if (book.status === 'READ' || (book.pages && book.lastReadPage && book.lastReadPage >= book.pages)) {
    progressPercentage = 100;
  } else if (book.pages && book.lastReadPage) {
    progressPercentage = Math.round((book.lastReadPage / book.pages) * 100);
  } else if (book.status === 'READING') {
    progressPercentage = 5; // Valor inicial visual para livros em andamento sem dados precisos
  }

  const normalizedAuthor = book.author?.trim() || null;
  const isMetadataPending = !normalizedAuthor && book.pages == null;

  return (
    <div
      onClick={onClick}
      className="group relative flex flex-col gap-3 cursor-pointer animate-fade-in"
    >
      {/* Cover Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-muted shadow-sm transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1">
        {book.coverUrl ? (
          <img
            src={book.coverUrl}
            alt={book.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full w-full bg-secondary/30 text-muted-foreground/40 gap-2">
            <BookIcon className="h-12 w-12" strokeWidth={1} />
          </div>
        )}
        
        {/* Hover Overlay - Visível apenas em desktop no hover */}
        <div className="absolute inset-0 bg-black/0 transition-colors duration-300 md:group-hover:bg-black/5" />
        
        {/* Status Badge (Floating) */}
        {/* Em mobile (telas pequenas), mostra sempre. Em desktop, mostra no hover. */}
        <div 
          className="absolute top-2 right-2 z-10 transition-all duration-300 opacity-100 md:opacity-0 md:group-hover:opacity-100 md:translate-y-2 md:group-hover:translate-y-0" 
          onClick={(e) => e.stopPropagation()}
        >
           {onStatusChange ? (
             <StatusSelector 
               status={book.status} 
               onChange={onStatusChange} 
               variant="badge" 
               className="shadow-sm bg-background/90 backdrop-blur-sm"
             />
           ) : null}
        </div>
      </div>

      {/* Info */}
      <div className="space-y-1 min-h-[3.5rem]">
        <h3 className="font-medium text-sm leading-tight line-clamp-2 text-foreground group-hover:text-primary transition-colors" title={book.title}>
          {book.title}
        </h3>
        {normalizedAuthor ? (
          <p className="text-xs text-muted-foreground truncate" title={normalizedAuthor}>{normalizedAuthor}</p>
        ) : isMetadataPending ? (
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground/50 font-medium animate-pulse">
            Processando metadados...
          </p>
        ) : (
          <p className="text-[10px] uppercase tracking-wider text-amber-700/80 font-medium" title="Autor nao encontrado nos metadados do arquivo">
            Autor desconhecido
          </p>
        )}
        
        {/* Progress Bar */}
        {(book.status === 'READING' || (progressPercentage > 0 && progressPercentage < 100)) && (
           <div className="space-y-1 mt-2">
             <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
               <div 
                 className="h-full bg-primary/80 rounded-full transition-all duration-500 ease-out" 
                 style={{ width: `${progressPercentage}%` }}
               />
             </div>
             <p className="text-[10px] text-muted-foreground text-right font-medium">
               {progressPercentage}%
             </p>
           </div>
        )}
      </div>
    </div>
  );
}
