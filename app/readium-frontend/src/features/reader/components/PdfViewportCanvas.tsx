import React, { useEffect, useRef } from 'react';
import { Viewport } from '@embedpdf/plugin-viewport/react';
import { Scroller } from '@embedpdf/plugin-scroll/react';
import { GlobalPointerProvider } from '@embedpdf/plugin-interaction-manager/react';
import { ZoomGestureWrapper } from '@embedpdf/plugin-zoom/react';
import { createLogger } from '@/lib/logger.ts';
import type { ReaderAnnotation } from '../domain/models';
import type { PendingSelection, ReaderTranslationOverlay } from '../ui/readerTypes';
import type {
  AnnotationOverlayInteractPayload,
  TranslationOverlayInteractPayload,
} from '../ui/hooks/pdf-viewport/PdfDocumentViewport.types';
import type { PdfViewportInteractionBindings } from '../ui/hooks/pdf-viewport/usePdfViewportInteractionController';
import { PdfViewportPage } from './PdfViewportPage';

const logger = createLogger('reader-viewport');

interface PdfViewportCanvasProps {
  activeDocumentId: string;
  touchAction: string;
  pendingSelection: PendingSelection | null;
  annotationsByPage: Map<number, ReaderAnnotation[]>;
  translationOverlaysByPage: Map<number, ReaderTranslationOverlay[]>;
  interactionBindings: PdfViewportInteractionBindings;
  onTranslationOverlayInteract?: (payload: TranslationOverlayInteractPayload) => void;
  onAnnotationOverlayInteract?: (payload: AnnotationOverlayInteractPayload) => void;
}

export const PdfViewportCanvas: React.FC<PdfViewportCanvasProps> = ({
  activeDocumentId,
  touchAction,
  pendingSelection,
  annotationsByPage,
  translationOverlaysByPage,
  interactionBindings,
  onTranslationOverlayInteract,
  onAnnotationOverlayInteract,
}) => {
  const loggedRenderPagesRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    loggedRenderPagesRef.current.clear();
  }, [activeDocumentId]);

  return (
    <Viewport
      documentId={activeDocumentId}
      className="h-full w-full bg-transparent"
      style={{ touchAction }}
      onDragStartCapture={interactionBindings.preventNativeDrag}
      onDropCapture={interactionBindings.preventNativeDrag}
      onContextMenu={interactionBindings.preventMobileContextMenu}
      onPointerDownCapture={interactionBindings.handlePointerDownCapture}
      onPointerMoveCapture={interactionBindings.handlePointerMoveCapture}
      onPointerUpCapture={interactionBindings.handlePointerEndCapture}
      onPointerCancelCapture={interactionBindings.handlePointerEndCapture}
    >
      <GlobalPointerProvider documentId={activeDocumentId}>
        <ZoomGestureWrapper documentId={activeDocumentId}>
          <Scroller
            documentId={activeDocumentId}
            renderPage={({ pageIndex, rotatedWidth, rotatedHeight }) => {
              if (pageIndex <= 2) {
                const renderKey = `${activeDocumentId}:${pageIndex}`;
                if (!loggedRenderPagesRef.current.has(renderKey)) {
                  loggedRenderPagesRef.current.add(renderKey);
                  logger.debug('renderPage invoked', {
                    documentId: activeDocumentId,
                    pageIndex,
                    rotatedWidth,
                    rotatedHeight,
                  });
                }
              }

              return (
                <PdfViewportPage
                  activeDocumentId={activeDocumentId}
                  pageIndex={pageIndex}
                  width={rotatedWidth}
                  height={rotatedHeight}
                  touchAction={touchAction}
                  showTouchSelectionRects={interactionBindings.showTouchSelectionRects}
                  pendingSelectionRects={pendingSelection?.page === pageIndex + 1 ? pendingSelection.rects : null}
                  pageAnnotations={annotationsByPage.get(pageIndex + 1) ?? []}
                  pageOverlays={translationOverlaysByPage.get(pageIndex + 1) ?? []}
                  onTranslationOverlayInteract={onTranslationOverlayInteract}
                  onAnnotationOverlayInteract={onAnnotationOverlayInteract}
                  preventNativeDrag={interactionBindings.preventNativeDrag}
                  preventMobileContextMenu={interactionBindings.preventMobileContextMenu}
                />
              );
            }}
          />
        </ZoomGestureWrapper>
      </GlobalPointerProvider>
    </Viewport>
  );
};
