import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils.ts';
import { useReaderPopupLayout } from '../hooks/useReaderPopupLayout';

const HIGHLIGHT_COLORS = ['#FFF59D', '#A5D6A7', '#90CAF9', '#F48FB1', '#FFCC80'] as const;

interface SelectionActionPopupProps {
  position: { x: number; y: number };
  onSelectColor: (color: string) => void;
  onCopy: () => void;
  onTranslate: () => void;
  onClose: () => void;
}

export function SelectionActionPopup({
  position,
  onSelectColor,
  onCopy,
  onTranslate,
  onClose,
}: SelectionActionPopupProps) {
  const { isMobile, style } = useReaderPopupLayout({
    position,
    desktopWidth: 520,
    desktopOffset: 10,
    desktopTopSafeZone: 180,
  });

  return (
    <div
      className={cn(
        'reader-popup-surface fixed z-[1000]',
        isMobile
          ? 'w-auto rounded-2xl p-3 animate-in fade-in-90 slide-in-from-bottom-2'
          : 'w-fit max-w-[min(calc(100vw-1.5rem),32rem)] rounded-2xl p-2 animate-in fade-in-90 zoom-in-95',
      )}
      style={style}
    >
      <div className={cn(isMobile ? 'grid grid-cols-[1fr_1fr_auto] items-center gap-2' : 'flex items-center gap-2')}>
        <div
          className={cn(
            'grid grid-cols-5 gap-1 rounded-xl border border-slate-900/10 bg-white p-1.5',
            isMobile && 'col-span-3',
          )}
        >
          {HIGHLIGHT_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => onSelectColor(color)}
              className="h-7 w-7 rounded-md border border-slate-300 transition-colors hover:border-slate-500"
              style={{ backgroundColor: color }}
              aria-label={`Selecionar cor ${color}`}
            />
          ))}
        </div>
        <Button
          type="button"
          size={isMobile ? 'default' : 'sm'}
          variant="secondary"
          onClick={onCopy}
          className={cn(
            'border border-slate-900/10 bg-white text-xs text-slate-700 hover:bg-slate-100',
            isMobile ? 'h-9' : 'h-8',
          )}
        >
          Copiar
        </Button>
        <Button
          type="button"
          size={isMobile ? 'default' : 'sm'}
          variant="secondary"
          onClick={onTranslate}
          className={cn(
            'border border-slate-900/10 bg-white text-xs text-slate-700 hover:bg-slate-100',
            isMobile ? 'h-9' : 'h-8',
          )}
        >
          Traduzir
        </Button>
        <button
          type="button"
          onClick={onClose}
          className={cn(
            'inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-900/10 bg-white text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700',
            !isMobile && 'h-8 w-8',
          )}
          aria-label="Fechar popup de selecao"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
