import React from 'react';
import type { ReaderTranslationOverlay } from '../ui/readerTypes';
import type { TranslationOverlayInteractPayload } from '../ui/hooks/pdf-viewport/PdfDocumentViewport.types';
import { PdfViewportRectButton } from './PdfViewportRectButton';

interface PdfViewportTranslationOverlaysProps {
  overlays: ReaderTranslationOverlay[];
  onInteract?: (payload: TranslationOverlayInteractPayload) => void;
}

export const PdfViewportTranslationOverlays: React.FC<PdfViewportTranslationOverlaysProps> = ({ overlays, onInteract }) => {
  const emitTranslationInteraction = React.useCallback(
    (overlay: ReaderTranslationOverlay, event: React.MouseEvent<HTMLButtonElement>) => {
      onInteract?.({
        translation: overlay.translation,
        position: { x: event.clientX, y: event.clientY },
      });
    },
    [onInteract],
  );

  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      {overlays.map((overlay) => (
        <PdfViewportRectButton
          key={overlay.key}
          rect={overlay.rect}
          className="border-b border-primary/70 bg-transparent transition-colors hover:border-primary"
          title={`${overlay.translation.originalText} -> ${overlay.translation.translatedText}`}
          onMouseEnter={(event) => emitTranslationInteraction(overlay, event)}
          onClick={(event) => emitTranslationInteraction(overlay, event)}
        />
      ))}
    </div>
  );
};
