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
  const popupStyle = isMobile
    ? {
        ...style,
        left: '50%',
        right: 'auto',
        transform: 'translateX(-50%)',
        width: 'min(calc(100vw - 1.25rem), 21rem)',
      }
    : style;

  return (
    <div
      className={cn(
        'reader-popup-surface fixed z-[1000]',
        isMobile
          ? 'w-[min(calc(100vw-1.25rem),21rem)] rounded-xl p-2.5 animate-in fade-in-90 slide-in-from-bottom-2'
          : 'w-fit max-w-[min(calc(100vw-1.5rem),32rem)] rounded-2xl p-2 animate-in fade-in-90 zoom-in-95',
      )}
      style={popupStyle}
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
              className={cn(
                'rounded-md border border-slate-300 transition-colors hover:border-slate-500',
                isMobile ? 'h-6 w-6' : 'h-7 w-7',
              )}
              style={{ backgroundColor: color }}
              aria-label={`Selecionar cor ${color}`}
            />
          ))}
        </div>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={onCopy}
          className={cn(
            'border border-slate-900/10 bg-white text-slate-700 hover:bg-slate-100',
            isMobile ? 'h-8 px-2 text-[11px]' : 'h-8 text-xs',
          )}
        >
          Copiar
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={onTranslate}
          className={cn(
            'border border-slate-900/10 bg-white text-slate-700 hover:bg-slate-100',
            isMobile ? 'h-8 px-2 text-[11px]' : 'h-8 text-xs',
          )}
        >
          Traduzir
        </Button>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-900/10 bg-white text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
          aria-label="Fechar popup de selecao"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
