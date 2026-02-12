import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpenText, Loader2, ScanSearch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StatusSelector from '@/features/library/components/StatusSelector';
import { BookStatus, OcrStatus } from '@/types';

interface PdfToolbarProps {
  bookStatus?: BookStatus;
  onStatusChange?: (status: BookStatus) => void;
  ocrStatus?: OcrStatus;
  ocrScore?: number | null;
  onTriggerOcr?: () => void;
  isTriggeringOcr?: boolean;
}

const ocrStatusLabel: Record<OcrStatus, string> = {
  PENDING: 'OCR pendente',
  RUNNING: 'OCR em andamento',
  DONE: 'OCR concluido',
  FAILED: 'OCR falhou',
};

const PdfToolbar: React.FC<PdfToolbarProps> = ({
  bookStatus,
  onStatusChange,
  ocrStatus,
  ocrScore,
  onTriggerOcr,
  isTriggeringOcr,
}) => {
  const isOcrBusy = isTriggeringOcr || ocrStatus === 'PENDING' || ocrStatus === 'RUNNING';

  return (
    <div className="sticky top-0 z-50 border-b border-border/60 bg-background/90 px-3 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:px-4">
      <div className="flex items-center justify-between gap-2">
        <Button type="button" variant="outline" size="sm" asChild className="h-8 rounded-full px-3">
          <Link to="/books" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Biblioteca</span>
          </Link>
        </Button>

        <div className="hidden items-center gap-1 text-xs text-muted-foreground lg:flex">
          <BookOpenText className="h-3.5 w-3.5" />
          <span>Leitor PDF</span>
          {ocrStatus && (
            <span className="ml-2 rounded-full border border-border/60 bg-muted/70 px-2 py-0.5 text-[11px]">
              {ocrStatusLabel[ocrStatus]}
              {ocrScore != null && ` (${ocrScore.toFixed(0)}%)`}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onTriggerOcr && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 rounded-full px-3"
              disabled={isOcrBusy}
              onClick={onTriggerOcr}
            >
              {isOcrBusy ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <ScanSearch className="mr-1 h-4 w-4" />}
              <span className="hidden sm:inline">{isOcrBusy ? 'Processando OCR' : 'Rodar OCR'}</span>
              <span className="sm:hidden">OCR</span>
            </Button>
          )}

          {bookStatus && onStatusChange && (
            <div>
              <StatusSelector status={bookStatus} onChange={onStatusChange} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PdfToolbar;
