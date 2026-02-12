import { Button } from '@/components/ui/button';

const HIGHLIGHT_COLORS = ['#FFF59D', '#A5D6A7', '#90CAF9', '#F48FB1', '#FFCC80'] as const;

interface SelectionActionPopupProps {
  position: { x: number; y: number };
  onSelectColor: (color: string) => void;
  onTranslate: () => void;
  onClose: () => void;
}

export function SelectionActionPopup({
  position,
  onSelectColor,
  onTranslate,
  onClose,
}: SelectionActionPopupProps) {
  return (
    <div
      className="fixed z-[1000] rounded-md border bg-background px-2 py-1 shadow-md"
      style={{
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, calc(-100% - 10px))',
      }}
    >
      <div className="flex items-center gap-2">
        {HIGHLIGHT_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onSelectColor(color)}
            className="h-5 w-5 rounded-sm border border-border transition-transform hover:scale-105"
            style={{ backgroundColor: color }}
            aria-label={`Selecionar cor ${color}`}
          />
        ))}
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={onTranslate}
          className="h-7 text-xs"
        >
          Traduzir
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onClose} className="h-7 px-2 text-xs">
          Fechar
        </Button>
      </div>
    </div>
  );
}
