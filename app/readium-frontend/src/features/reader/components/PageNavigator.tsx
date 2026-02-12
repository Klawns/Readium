import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PageNavigatorProps {
 currentPage: number;
 totalPages: number;
 onPageChange: (page: number) => void;
}

const PageNavigator: React.FC<PageNavigatorProps> = ({ currentPage, totalPages, onPageChange }) => {
  const [inputPage, setInputPage] = useState(currentPage.toString());
  const hasKnownTotalPages = totalPages > 0;

  useEffect(() => setInputPage(currentPage.toString()), [currentPage]);

  const commitInputPage = () => {
    const parsedPage = Number(inputPage);
    if (!Number.isFinite(parsedPage)) {
      setInputPage(currentPage.toString());
      return;
    }
    if (!hasKnownTotalPages) {
      return;
    }
    const nextPage = Math.min(Math.max(1, parsedPage), totalPages);
    onPageChange(nextPage);
  };

  return (
    <div className="inline-flex items-center rounded-full border border-border/70 bg-background/80 p-0.5 shadow-sm">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-7 w-7 rounded-full sm:h-8 sm:w-8"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasKnownTotalPages || currentPage <= 1}
        aria-label="Pagina anterior"
      >
        <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      </Button>
      <div className="mx-0.5 flex items-center rounded-full bg-muted/40 px-1.5 py-0.5 sm:mx-1 sm:gap-2 sm:px-2 sm:py-1">
        <span className="px-1 text-[10px] font-semibold text-foreground sm:hidden">
          {currentPage}/{hasKnownTotalPages ? totalPages : '--'}
        </span>
        <Input
          value={inputPage}
          onChange={(event) => setInputPage(event.target.value)}
          onBlur={commitInputPage}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              commitInputPage();
            }
          }}
          disabled={!hasKnownTotalPages}
          className="hidden h-7 w-12 border-0 bg-transparent px-0 text-center text-xs font-semibold shadow-none focus-visible:ring-0 sm:block"
        />
        <span className="hidden text-xs text-muted-foreground sm:inline">/ {hasKnownTotalPages ? totalPages : '--'}</span>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-7 w-7 rounded-full sm:h-8 sm:w-8"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasKnownTotalPages || currentPage >= totalPages}
        aria-label="Proxima pagina"
      >
        <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      </Button>
    </div>
  );
};

export default PageNavigator;
