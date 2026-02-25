import React from 'react';
import type { ReaderAnnotation } from '../domain/models';
import type { ReaderTranslationOverlay } from '../ui/readerTypes';
import type {
  AnnotationOverlayInteractPayload,
  TranslationOverlayInteractPayload,
} from '../ui/hooks/pdf-viewport/PdfDocumentViewport.types';
import { usePdfViewportSelectionLayerBackground } from '../ui/hooks/pdf-viewport/usePdfViewportSelectionLayerBackground';
import { PdfViewportPageSurface } from './PdfViewportPageSurface';
import { PdfViewportAnnotationOverlays } from './PdfViewportAnnotationOverlays';
import { PdfViewportTranslationOverlays } from './PdfViewportTranslationOverlays';

interface PdfViewportPageProps {
  activeDocumentId: string;
  pageIndex: number;
  width: number;
  height: number;
  scale?: number;
  touchAction: string;
  showTouchSelectionRects: boolean;
  pageAnnotations: ReaderAnnotation[];
  pageOverlays: ReaderTranslationOverlay[];
  onTranslationOverlayInteract?: (payload: TranslationOverlayInteractPayload) => void;
  onAnnotationOverlayInteract?: (payload: AnnotationOverlayInteractPayload) => void;
  preventNativeDrag: (event: React.DragEvent) => void;
  preventMobileContextMenu: (event: React.MouseEvent) => void;
}

export const PdfViewportPage: React.FC<PdfViewportPageProps> = ({
  activeDocumentId,
  pageIndex,
  width,
  height,
  scale,
  touchAction,
  showTouchSelectionRects,
  pageAnnotations,
  pageOverlays,
  onTranslationOverlayInteract,
  onAnnotationOverlayInteract,
  preventNativeDrag,
  preventMobileContextMenu,
}) => {
  const selectionLayerBackground = usePdfViewportSelectionLayerBackground(showTouchSelectionRects);

  return (
    <PdfViewportPageSurface
      activeDocumentId={activeDocumentId}
      pageIndex={pageIndex}
      width={width}
      height={height}
      scale={scale}
      touchAction={touchAction}
      selectionLayerBackground={selectionLayerBackground}
      preventNativeDrag={preventNativeDrag}
      preventMobileContextMenu={preventMobileContextMenu}
    >
      <PdfViewportAnnotationOverlays annotations={pageAnnotations} onInteract={onAnnotationOverlayInteract} />
      <PdfViewportTranslationOverlays overlays={pageOverlays} onInteract={onTranslationOverlayInteract} />
    </PdfViewportPageSurface>
  );
};
