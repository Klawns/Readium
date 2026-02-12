import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ZoomControlsProps {
  zoomLevel: number;
  onZoomOut: () => void;
  onZoomIn: () => void;
  onZoomReset: () => void;
}

const ZoomControls: React.FC<ZoomControlsProps> = ({ zoomLevel, onZoomOut, onZoomIn, onZoomReset }) => {
  const percentage = Math.round(zoomLevel * 100);

  return (
    <div className="inline-flex items-center rounded-full border border-border/70 bg-background/80 p-0.5 shadow-sm">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-7 w-7 rounded-full sm:h-8 sm:w-8"
        onClick={onZoomOut}
        aria-label="Diminuir zoom"
      >
        <Minus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        className="h-7 min-w-12 rounded-full px-2 text-[10px] font-semibold text-foreground sm:h-8 sm:min-w-16 sm:px-3 sm:text-xs"
        onClick={onZoomReset}
      >
        {percentage}%
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-7 w-7 rounded-full sm:h-8 sm:w-8"
        onClick={onZoomIn}
        aria-label="Aumentar zoom"
      >
        <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      </Button>
    </div>
  );
};

export default ZoomControls;
