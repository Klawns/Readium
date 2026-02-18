import React, { useEffect, useMemo, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { EmbedPDF } from '@embedpdf/core/react';
import {
  DocumentContent,
  useActiveDocument,
  useDocumentManagerCapability,
} from '@embedpdf/plugin-document-manager/react';
import { Viewport } from '@embedpdf/plugin-viewport/react';
import { Scroller } from '@embedpdf/plugin-scroll/react';
import { GlobalPointerProvider, useInteractionManagerCapability } from '@embedpdf/plugin-interaction-manager/react';
import { ZoomGestureWrapper } from '@embedpdf/plugin-zoom/react';
import { useSelectionCapability } from '@embedpdf/plugin-selection/react';
import { useAnnotationCapability } from '@embedpdf/plugin-annotation/react';
import { createLogger } from '@/lib/logger.ts';
import type { PdfDocumentViewportProps } from '../ui/hooks/pdf-viewport/PdfDocumentViewport.types';
import { PdfViewportStateBridge } from './PdfViewportStateBridge';
import { PdfViewportPage } from './PdfViewportPage';
import { usePdfViewportTouchInteractions } from '../ui/hooks/pdf-viewport/usePdfViewportTouchInteractions';
import { usePdfViewportSelection } from '../ui/hooks/pdf-viewport/usePdfViewportSelection';
import { usePdfViewportTextLayerQuality } from '../ui/hooks/pdf-viewport/usePdfViewportTextLayerQuality';
import { usePdfViewportAnnotationSync } from '../ui/hooks/pdf-viewport/usePdfViewportAnnotationSync';
import { usePdfViewportDocumentLoader } from '../ui/hooks/pdf-viewport/usePdfViewportDocumentLoader';
import { VIEWPORT_TOUCH_ACTION } from '../ui/hooks/pdf-viewport/pdfViewport.constants';
import { pdfViewportPluginRegistrations } from '../ui/hooks/pdf-viewport/pdfViewport.plugins';

const logger = createLogger('reader-viewport');

const PdfDocumentViewportContent: React.FC<PdfDocumentViewportProps> = ({
  engine,
  fileUrl,
  containerRef,
  annotations,
  translationOverlays,
  initialPage,
  onSelectionResolved,
  onTranslationOverlayInteract,
  onAnnotationOverlayInteract,
  onViewportStateChange,
  onViewportActionsReady,
  onTextLayerQualityEvaluated,
  onViewportTap,
}) => {
  const { provides: documentManager } = useDocumentManagerCapability();
  const { activeDocumentId, activeDocument } = useActiveDocument();
  const { provides: selectionCapability } = useSelectionCapability();
  const { provides: annotationCapability } = useAnnotationCapability();
  const { provides: interactionCapability } = useInteractionManagerCapability();

  const translationOverlaysByPage = useMemo(() => {
    const byPage = new Map<number, typeof translationOverlays>();
    for (const overlay of translationOverlays) {
      const pageItems = byPage.get(overlay.page);
      if (pageItems) {
        pageItems.push(overlay);
      } else {
        byPage.set(overlay.page, [overlay]);
      }
    }
    return byPage;
  }, [translationOverlays]);

  const annotationsByPage = useMemo(() => {
    const byPage = new Map<number, typeof annotations>();
    for (const annotation of annotations) {
      const pageItems = byPage.get(annotation.page);
      if (pageItems) {
        pageItems.push(annotation);
      } else {
        byPage.set(annotation.page, [annotation]);
      }
    }
    return byPage;
  }, [annotations]);

  const annotationIdsWithTranslation = useMemo(
    () => new Set(translationOverlays.map((overlay) => overlay.annotationId)),
    [translationOverlays],
  );
  const lastDocumentContentStateRef = useRef<string>('');
  const loggedRenderPagesRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    logger.debug('viewport active document', {
      activeDocumentId,
      hasDocument: Boolean(activeDocument?.document),
      overlays: translationOverlays.length,
      annotations: annotations.length,
    });
  }, [activeDocumentId, activeDocument?.document, translationOverlays.length, annotations.length]);

  useEffect(() => {
    loggedRenderPagesRef.current.clear();
  }, [activeDocumentId]);

  usePdfViewportDocumentLoader({
    documentManager: documentManager ?? null,
    fileUrl,
    activeDocumentId,
    onViewportActionsReady,
    onViewportStateChange,
  });

  const touchInteractions = usePdfViewportTouchInteractions({
    activeDocumentId,
    interactionCapability: interactionCapability ?? null,
    selectionCapability: selectionCapability ?? null,
    onViewportTap,
  });

  usePdfViewportSelection({
    selectionCapability: selectionCapability ?? null,
    activeDocumentId,
    activeDocument: activeDocument ?? null,
    containerRef,
    onSelectionResolved,
    lastPointerTypeRef: touchInteractions.lastPointerTypeRef,
    lastTouchSelectionAllowedRef: touchInteractions.lastTouchSelectionAllowedRef,
    touchGestureRef: touchInteractions.touchGestureRef,
  });

  usePdfViewportTextLayerQuality({
    engine,
    activeDocumentId,
    activeDocument: activeDocument ?? null,
    onTextLayerQualityEvaluated,
  });

  usePdfViewportAnnotationSync({
    annotationCapability: annotationCapability ?? null,
    activeDocumentId,
    activeDocument: activeDocument ?? null,
    annotations,
    annotationIdsWithTranslation,
  });

  if (!activeDocumentId) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <PdfViewportStateBridge
        activeDocumentId={activeDocumentId}
        initialPage={initialPage}
        onViewportStateChange={onViewportStateChange}
        onViewportActionsReady={onViewportActionsReady}
      />
      <DocumentContent documentId={activeDocumentId}>
        {({ isLoaded, isError, documentState }) => {
          const contentState = isError ? 'error' : isLoaded ? 'loaded' : 'loading';
          if (lastDocumentContentStateRef.current !== contentState) {
            lastDocumentContentStateRef.current = contentState;
            logger.debug('document content state', {
              documentId: activeDocumentId,
              state: contentState,
              error: documentState.error ?? null,
            });
          }

          if (isError) {
            return (
              <div className="flex h-full items-center justify-center px-4 text-center text-sm text-destructive">
                Falha ao carregar PDF: {documentState.error ?? 'erro desconhecido'}.
              </div>
            );
          }

          if (!isLoaded) {
            logger.debug('document loading', activeDocumentId);
            return (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            );
          }

          return (
            <Viewport
              documentId={activeDocumentId}
              className="h-full w-full bg-muted/15"
              style={{ touchAction: VIEWPORT_TOUCH_ACTION }}
              onDragStartCapture={touchInteractions.preventNativeDrag}
              onDropCapture={touchInteractions.preventNativeDrag}
              onContextMenu={touchInteractions.preventMobileContextMenu}
              onPointerDownCapture={touchInteractions.handlePointerDownCapture}
              onPointerMoveCapture={touchInteractions.handlePointerMoveCapture}
              onPointerUpCapture={touchInteractions.handlePointerEndCapture}
              onPointerCancelCapture={touchInteractions.handlePointerEndCapture}
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
                          pageAnnotations={annotationsByPage.get(pageIndex + 1) ?? []}
                          pageOverlays={translationOverlaysByPage.get(pageIndex + 1) ?? []}
                          onTranslationOverlayInteract={onTranslationOverlayInteract}
                          onAnnotationOverlayInteract={onAnnotationOverlayInteract}
                          preventNativeDrag={touchInteractions.preventNativeDrag}
                          preventMobileContextMenu={touchInteractions.preventMobileContextMenu}
                        />
                      );
                    }}
                  />
                </ZoomGestureWrapper>
              </GlobalPointerProvider>
            </Viewport>
          );
        }}
      </DocumentContent>
    </>
  );
};

export const PdfDocumentViewport: React.FC<PdfDocumentViewportProps> = (props) => (
  <EmbedPDF engine={props.engine} plugins={pdfViewportPluginRegistrations}>
    <PdfDocumentViewportContent {...props} />
  </EmbedPDF>
);
