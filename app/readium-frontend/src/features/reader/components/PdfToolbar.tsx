import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpenText, Loader2, RotateCcw, Save, ScanSearch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import StatusSelector from '@/features/library/components/StatusSelector';
import { BookStatus, OcrStatus } from '@/types';

interface PdfToolbarProps {
  bookStatus?: BookStatus;
  onStatusChange?: (status: BookStatus) => void;
  ocrStatus?: OcrStatus;
  ocrScore?: number | null;
  ocrDetails?: string | null;
  onTriggerOcr?: () => void;
  isTriggeringOcr?: boolean;
  currentPage: number;
  totalPages: number;
  onSetManualProgress: (page: number) => Promise<void>;
  onResetProgress: () => Promise<void>;
  isSavingManualProgress?: boolean;
  isVisible?: boolean;
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
  ocrDetails,
  onTriggerOcr,
  isTriggeringOcr,
  currentPage,
  totalPages,
  onSetManualProgress,
  onResetProgress,
  isSavingManualProgress = false,
  isVisible = true,
}) => {
  const [manualPageInput, setManualPageInput] = React.useState(currentPage.toString());
  const isOcrBusy = isTriggeringOcr || ocrStatus === 'PENDING' || ocrStatus === 'RUNNING';
  const isProgressActionBusy = isSavingManualProgress;

  React.useEffect(() => {
    setManualPageInput(currentPage.toString());
  }, [currentPage]);

  const handleApplyManualProgress = React.useCallback(async () => {
    const parsed = Number(manualPageInput);
    if (!Number.isFinite(parsed)) {
      setManualPageInput(currentPage.toString());
      return;
    }

    const safeTotal = totalPages > 0 ? totalPages : Number.POSITIVE_INFINITY;
    const nextPage = Math.min(Math.max(1, Math.floor(parsed)), safeTotal);
    if (!Number.isFinite(nextPage)) {
      return;
    }

    setManualPageInput(nextPage.toString());
    await onSetManualProgress(nextPage);
  }, [currentPage, manualPageInput, onSetManualProgress, totalPages]);

  return (
    <div
      className={`reader-toolbar-surface reader-motion-premium fixed inset-x-0 top-0 z-50 px-3 py-2 pt-[max(env(safe-area-inset-top),0.5rem)] md:px-4 ${
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
      }`}
    >
      <div className="mx-auto flex w-full max-w-[1180px] items-center justify-between gap-2">
        <Button type="button" variant="ghost" size="sm" asChild className="h-8 rounded-full px-3 text-slate-700 hover:bg-white/70">
          <Link to="/books" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Biblioteca</span>
          </Link>
        </Button>

        <div className="hidden items-center gap-1.5 text-xs text-slate-500 lg:flex">
          <BookOpenText className="h-3.5 w-3.5" />
          <span>Leitor PDF</span>
          {ocrStatus && (
            <span
              className="ml-2 rounded-full border border-slate-900/10 bg-white/70 px-2 py-0.5 text-[11px] text-slate-600"
              title={ocrDetails ?? undefined}
            >
              {ocrStatusLabel[ocrStatus]}
              {ocrScore != null && ` (${ocrScore.toFixed(0)}%)`}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1.5">
            <Input
              type="number"
              min={1}
              max={totalPages > 0 ? totalPages : undefined}
              value={manualPageInput}
              onChange={(event) => setManualPageInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  void handleApplyManualProgress();
                }
              }}
              className="h-8 w-12 border-slate-900/10 bg-white/65 px-2 text-center text-xs tabular-nums sm:w-16"
              disabled={isProgressActionBusy}
              aria-label="Pagina de progresso manual"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 rounded-full border border-slate-900/10 bg-white/65 px-2 text-slate-700 hover:bg-white"
              disabled={isProgressActionBusy}
              onClick={() => {
                void handleApplyManualProgress();
              }}
            >
              {isProgressActionBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              <span className="ml-1 hidden text-[11px] sm:inline">Ajustar</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 rounded-full border border-slate-900/10 bg-white/65 px-2 text-slate-700 hover:bg-white"
              disabled={isProgressActionBusy}
              onClick={() => {
                void onResetProgress();
              }}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="ml-1 hidden text-[11px] sm:inline">Resetar</span>
            </Button>
          </div>

          {onTriggerOcr && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 rounded-full border border-slate-900/10 bg-white/65 px-3 text-slate-700 hover:bg-white"
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
              <StatusSelector status={bookStatus} onChange={onStatusChange} variant="minimal" className="rounded-full border border-slate-900/10 bg-white/65 hover:bg-white" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PdfToolbar;
