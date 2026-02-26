import React from 'react';
import { Hand, Highlighter } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ReaderTouchModeFabProps {
  isTouchSelectionModeEnabled: boolean;
  onToggleTouchSelectionMode: () => void;
}

export const ReaderTouchModeFab: React.FC<ReaderTouchModeFabProps> = ({
  isTouchSelectionModeEnabled,
  onToggleTouchSelectionMode,
}) => {
  const nextModeLabel = isTouchSelectionModeEnabled ? 'Rolar' : 'Selecionar';

  return (
    <div className="pointer-events-none fixed bottom-2 left-3 z-40 pb-[max(env(safe-area-inset-bottom),0.5rem)] sm:bottom-3">
      <Button
        type="button"
        size="icon"
        variant="secondary"
        onClick={onToggleTouchSelectionMode}
        className={`pointer-events-auto h-12 w-12 rounded-full border border-slate-900/10 shadow-lg ${
          isTouchSelectionModeEnabled
            ? 'bg-sky-600 text-white hover:bg-sky-700'
            : 'bg-white/95 text-slate-700 hover:bg-slate-100'
        }`}
        aria-label={`Alternar para modo ${nextModeLabel}`}
        title={`Alternar para modo ${nextModeLabel}`}
      >
        {isTouchSelectionModeEnabled ? (
          <Hand className="h-5 w-5" />
        ) : (
          <Highlighter className="h-5 w-5" />
        )}
      </Button>
    </div>
  );
};

