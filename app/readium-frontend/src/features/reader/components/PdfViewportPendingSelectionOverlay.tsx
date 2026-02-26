import React from 'react';
import type { ReaderRect } from '../domain/models';

interface PdfViewportPendingSelectionOverlayProps {
  rects: ReaderRect[];
}

export const PdfViewportPendingSelectionOverlay: React.FC<PdfViewportPendingSelectionOverlayProps> = ({ rects }) => {
  if (rects.length === 0) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-30">
      {rects.map((rect, index) => (
        <div
          key={`pending-selection-rect-${index}`}
          className="absolute rounded-[2px]"
          style={{
            left: `${rect.x * 100}%`,
            top: `${rect.y * 100}%`,
            width: `${rect.width * 100}%`,
            height: `${rect.height * 100}%`,
            backgroundColor: 'rgba(30, 64, 175, 0.42)',
          }}
        />
      ))}
    </div>
  );
};
