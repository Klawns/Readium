import React, { useCallback, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { createPluginRegistration } from '@embedpdf/core';
import { EmbedPDF } from '@embedpdf/core/react';
import {
  DocumentContent,
  DocumentManagerPluginPackage,
  useActiveDocument,
  useDocumentManagerCapability,
} from '@embedpdf/plugin-document-manager/react';
import { ViewportPluginPackage, Viewport } from '@embedpdf/plugin-viewport/react';
import { ScrollPluginPackage, Scroller, useScroll } from '@embedpdf/plugin-scroll/react';
import { RenderPluginPackage, RenderLayer } from '@embedpdf/plugin-render/react';
import { AnnotationPluginPackage, AnnotationLayer, useAnnotationCapability } from '@embedpdf/plugin-annotation/react';
import { SelectionPluginPackage, SelectionLayer, useSelectionCapability } from '@embedpdf/plugin-selection/react';
import { InteractionManagerPluginPackage, PagePointerProvider } from '@embedpdf/plugin-interaction-manager/react';
import { ZoomGestureWrapper, ZoomMode, ZoomPluginPackage, useZoom } from '@embedpdf/plugin-zoom/react';
import { PdfAnnotationSubtype, PdfBlendMode } from '@embedpdf/models';
import type { PdfEngine, PdfHighlightAnnoObject, Rect } from '@embedpdf/models';
import type { ReaderAnnotation, ReaderRect } from '../domain/models';
import type { PendingSelection, ReaderViewportActions, ReaderViewportState } from './readerTypes';

const DEFAULT_ZOOM_LEVEL = 1.7;
const MOBILE_QUERY = '(max-width: 768px)';

const getPreferredZoomLevel = () => {
  if (typeof window !== 'undefined' && window.matchMedia(MOBILE_QUERY).matches) {
    return ZoomMode.FitWidth;
  }
  return DEFAULT_ZOOM_LEVEL;
};

interface PdfDocumentViewportProps {
  engine: PdfEngine;
  fileUrl: string;
  containerRef: React.RefObject<HTMLDivElement | null>;
  annotations: ReaderAnnotation[];
  initialPage: number;
  onSelectionResolved: (selection: PendingSelection | null) => void;
  onViewportStateChange?: (state: ReaderViewportState) => void;
  onViewportActionsReady?: (actions: ReaderViewportActions | null) => void;
  onTextLayerQualityEvaluated?: (lowTextLayerQuality: boolean) => void;
}

interface PdfDocumentViewportContentProps {
  engine: PdfEngine;
  fileUrl: string;
  containerRef: React.RefObject<HTMLDivElement | null>;
  annotations: ReaderAnnotation[];
  initialPage: number;
  onSelectionResolved: (selection: PendingSelection | null) => void;
  onViewportStateChange?: (state: ReaderViewportState) => void;
  onViewportActionsReady?: (actions: ReaderViewportActions | null) => void;
  onTextLayerQualityEvaluated?: (lowTextLayerQuality: boolean) => void;
}

interface ViewportStateBridgeProps {
  activeDocumentId: string;
  initialPage: number;
  onViewportStateChange?: (state: ReaderViewportState) => void;
  onViewportActionsReady?: (actions: ReaderViewportActions | null) => void;
}

const pluginRegistrations = [
  createPluginRegistration(DocumentManagerPluginPackage),
  createPluginRegistration(ViewportPluginPackage),
  createPluginRegistration(ScrollPluginPackage),
  createPluginRegistration(RenderPluginPackage),
  createPluginRegistration(InteractionManagerPluginPackage),
  createPluginRegistration(SelectionPluginPackage),
  createPluginRegistration(AnnotationPluginPackage, { autoCommit: false }),
  createPluginRegistration(ZoomPluginPackage, { defaultZoomLevel: DEFAULT_ZOOM_LEVEL }),
];

const clampPage = (page: number, totalPages: number): number => {
  if (totalPages <= 0) {
    return Math.max(1, page);
  }
  return Math.min(Math.max(1, page), totalPages);
};

const toPdfRect = (rect: ReaderRect, pageSize: { width: number; height: number }): Rect => ({
  origin: {
    x: rect.x * pageSize.width,
    y: rect.y * pageSize.height,
  },
  size: {
    width: rect.width * pageSize.width,
    height: rect.height * pageSize.height,
  },
});

const getBoundingRect = (rects: Rect[]): Rect => {
  const [firstRect, ...rest] = rects;
  let minX = firstRect.origin.x;
  let minY = firstRect.origin.y;
  let maxX = firstRect.origin.x + firstRect.size.width;
  let maxY = firstRect.origin.y + firstRect.size.height;

  rest.forEach((rect) => {
    minX = Math.min(minX, rect.origin.x);
    minY = Math.min(minY, rect.origin.y);
    maxX = Math.max(maxX, rect.origin.x + rect.size.width);
    maxY = Math.max(maxY, rect.origin.y + rect.size.height);
  });

  return {
    origin: { x: minX, y: minY },
    size: { width: maxX - minX, height: maxY - minY },
  };
};

const ViewportStateBridge: React.FC<ViewportStateBridgeProps> = ({
  activeDocumentId,
  initialPage,
  onViewportStateChange,
  onViewportActionsReady,
}) => {
  const { state: scrollState, provides: scrollScope } = useScroll(activeDocumentId);
  const { state: zoomState, provides: zoomScope } = useZoom(activeDocumentId);
  const initializedDocumentRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    onViewportStateChange?.({
      currentPage: Math.max(1, scrollState.currentPage),
      totalPages: scrollState.totalPages,
      zoomLevel: zoomState.currentZoomLevel || DEFAULT_ZOOM_LEVEL,
    });
  }, [onViewportStateChange, scrollState.currentPage, scrollState.totalPages, zoomState.currentZoomLevel]);

  useEffect(() => {
    if (!scrollScope || !zoomScope) {
      onViewportActionsReady?.(null);
      return;
    }

    const actions: ReaderViewportActions = {
      goToPage: (page: number) => {
        scrollScope.scrollToPage({
          pageNumber: clampPage(page, scrollState.totalPages),
          behavior: 'smooth',
          alignY: 4,
        });
      },
      zoomIn: () => {
        zoomScope.zoomIn();
      },
      zoomOut: () => {
        zoomScope.zoomOut();
      },
      resetZoom: () => {
        zoomScope.requestZoom(getPreferredZoomLevel());
      },
    };

    onViewportActionsReady?.(actions);
    return () => onViewportActionsReady?.(null);
  }, [onViewportActionsReady, scrollScope, scrollState.totalPages, zoomScope]);

  useEffect(() => {
    if (!scrollScope || !zoomScope || scrollState.totalPages <= 0) {
      return;
    }
    if (initializedDocumentRef.current.has(activeDocumentId)) {
      return;
    }

    initializedDocumentRef.current.add(activeDocumentId);

    const applyInitialView = () => {
      zoomScope.requestZoom(getPreferredZoomLevel());
      scrollScope.scrollToPage({
        pageNumber: clampPage(initialPage, scrollState.totalPages),
        behavior: 'auto',
        alignY: 4,
      });
    };

    const animation = window.requestAnimationFrame(applyInitialView);
    const retryTimer = window.setTimeout(applyInitialView, 160);

    return () => {
      window.cancelAnimationFrame(animation);
      window.clearTimeout(retryTimer);
    };
  }, [activeDocumentId, initialPage, scrollScope, scrollState.totalPages, zoomScope]);

  useEffect(() => {
    if (!zoomScope || !scrollState.totalPages) {
      return;
    }

    if (zoomState.currentZoomLevel > 0.01) {
      return;
    }

    const animation = window.requestAnimationFrame(() => {
      zoomScope.requestZoom(getPreferredZoomLevel());
    });

    return () => window.cancelAnimationFrame(animation);
  }, [scrollState.totalPages, zoomScope, zoomState.currentZoomLevel]);

  return null;
};

const PdfDocumentViewportContent: React.FC<PdfDocumentViewportContentProps> = ({
  engine,
  fileUrl,
  containerRef,
  annotations,
  initialPage,
  onSelectionResolved,
  onViewportStateChange,
  onViewportActionsReady,
  onTextLayerQualityEvaluated,
}) => {
  const { provides: documentManager } = useDocumentManagerCapability();
  const { activeDocumentId, activeDocument } = useActiveDocument();
  const { provides: selectionCapability } = useSelectionCapability();
  const { provides: annotationCapability } = useAnnotationCapability();
  const lastOpenedUrlRef = useRef<string | null>(null);
  const syncedAnnotationIdsRef = useRef<Map<string, Map<string, number>>>(new Map());
  const analyzedDocumentIdsRef = useRef<Set<string>>(new Set());

  const preventNativeDrag = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);

  useEffect(() => {
    if (!documentManager || !fileUrl || lastOpenedUrlRef.current === fileUrl) {
      return;
    }

    console.info('[EmbedPDF Reader] opening document', fileUrl);
    documentManager.openDocumentUrl({
      url: fileUrl,
    });
    lastOpenedUrlRef.current = fileUrl;
  }, [documentManager, fileUrl]);

  useEffect(() => {
    if (activeDocumentId) {
      console.info('[EmbedPDF Reader] activeDocumentId', activeDocumentId);
      return;
    }

    onViewportActionsReady?.(null);
    onViewportStateChange?.({
      currentPage: 1,
      totalPages: 0,
      zoomLevel: DEFAULT_ZOOM_LEVEL,
    });
  }, [activeDocumentId, onViewportActionsReady, onViewportStateChange]);

  useEffect(() => {
    if (!selectionCapability || !activeDocumentId || !activeDocument) {
      return;
    }

    const selectionScope = selectionCapability.forDocument(activeDocumentId);

    const resolveSelection = async () => {
      const [selectedRect] = selectionScope.getBoundingRects();
      if (!selectedRect) {
        onSelectionResolved(null);
        return;
      }

      const pageIndex = selectedRect.page;
      const page = activeDocument.document?.pages[pageIndex];
      if (!page) {
        return;
      }

      const pageElement = containerRef.current?.querySelector<HTMLElement>(`[data-reader-page-index="${pageIndex}"]`);
      if (!pageElement) {
        return;
      }

      const pageClientRect = pageElement.getBoundingClientRect();
      const pageRects = selectionScope.getHighlightRectsForPage(pageIndex);
      if (pageRects.length === 0) {
        onSelectionResolved(null);
        return;
      }

      let selectedText = '';
      try {
        const textSlices = await selectionScope.getSelectedText().toPromise();
        selectedText = textSlices.join(' ').trim();
      } catch (error: unknown) {
        console.error('[EmbedPDF Reader] failed to retrieve selected text', error);
        return;
      }

      if (!selectedText) {
        onSelectionResolved(null);
        return;
      }

      const scaleX = pageClientRect.width / page.size.width;
      const scaleY = pageClientRect.height / page.size.height;

      onSelectionResolved({
        text: selectedText,
        page: pageIndex + 1,
        rects: pageRects.map((rect) => ({
          x: rect.origin.x / page.size.width,
          y: rect.origin.y / page.size.height,
          width: rect.size.width / page.size.width,
          height: rect.size.height / page.size.height,
        })),
        popupPosition: {
          x: pageClientRect.left + (selectedRect.rect.origin.x + selectedRect.rect.size.width / 2) * scaleX,
          y: pageClientRect.top + selectedRect.rect.origin.y * scaleY,
        },
      });
    };

    const unsubscribeSelectionEnd = selectionScope.onEndSelection(() => {
      void resolveSelection();
    });

    const unsubscribeSelectionChange = selectionScope.onSelectionChange((selection) => {
      if (!selection) {
        onSelectionResolved(null);
      }
    });

    const clearStuckSelection = () => {
      window.setTimeout(() => {
        const state = selectionScope.getState();
        if (state.selecting) {
          selectionScope.clear();
          onSelectionResolved(null);
        }
      }, 0);
    };

    window.addEventListener('pointerup', clearStuckSelection);
    window.addEventListener('mouseup', clearStuckSelection);
    window.addEventListener('dragend', clearStuckSelection);
    window.addEventListener('blur', clearStuckSelection);

    return () => {
      unsubscribeSelectionEnd();
      unsubscribeSelectionChange();
      window.removeEventListener('pointerup', clearStuckSelection);
      window.removeEventListener('mouseup', clearStuckSelection);
      window.removeEventListener('dragend', clearStuckSelection);
      window.removeEventListener('blur', clearStuckSelection);
    };
  }, [selectionCapability, activeDocumentId, activeDocument, containerRef, onSelectionResolved]);

  useEffect(() => {
    if (!activeDocumentId || !activeDocument?.document || analyzedDocumentIdsRef.current.has(activeDocumentId)) {
      return;
    }

    analyzedDocumentIdsRef.current.add(activeDocumentId);
    const document = activeDocument.document;
    const pageCount = document.pageCount;
    const sampleCount = Math.min(pageCount, 3);
    const sampleIndexes = Array.from({ length: sampleCount }, (_, index) => {
      if (sampleCount === 1) {
        return 0;
      }
      return Math.round((index * (pageCount - 1)) / (sampleCount - 1));
    });

    engine
      .extractText(document, sampleIndexes)
      .toPromise()
      .then((rawText) => {
        const normalizedText = rawText.replace(/\s+/g, '').trim();
        onTextLayerQualityEvaluated?.(normalizedText.length < 80);
      })
      .catch((error: unknown) => {
        console.warn('[EmbedPDF Reader] text-layer analysis failed', error);
      });
  }, [activeDocument, activeDocumentId, engine, onTextLayerQualityEvaluated]);

  useEffect(() => {
    if (!annotationCapability || !activeDocumentId || !activeDocument?.document) {
      return;
    }

    const annotationScope = annotationCapability.forDocument(activeDocumentId);
    const syncedForDocument = syncedAnnotationIdsRef.current.get(activeDocumentId) ?? new Map<string, number>();

    syncedForDocument.forEach((pageIndex, annotationId) => {
      annotationScope.purgeAnnotation(pageIndex, annotationId);
    });

    const nextSynced = new Map<string, number>();
    const importItems: Array<{ annotation: PdfHighlightAnnoObject }> = [];

    annotations.forEach((annotation) => {
      const pageIndex = annotation.page - 1;
      const page = activeDocument.document?.pages[pageIndex];
      if (!page || annotation.rects.length === 0) {
        return;
      }

      const segmentRects = annotation.rects.map((rect) => toPdfRect(rect, page.size));
      const highlightId = `backend-highlight-${annotation.id}`;
      nextSynced.set(highlightId, pageIndex);

      importItems.push({
        annotation: {
          id: highlightId,
          type: PdfAnnotationSubtype.HIGHLIGHT,
          pageIndex,
          rect: getBoundingRect(segmentRects),
          segmentRects,
          strokeColor: annotation.color,
          color: annotation.color,
          opacity: 0.42,
          blendMode: PdfBlendMode.Multiply,
          contents: annotation.note ?? annotation.selectedText,
          custom: { backendAnnotationId: annotation.id },
          flags: ['print'],
        },
      });
    });

    if (importItems.length > 0) {
      annotationScope.importAnnotations(importItems);
    }

    syncedAnnotationIdsRef.current.set(activeDocumentId, nextSynced);
  }, [annotationCapability, activeDocumentId, activeDocument, annotations]);

  if (!activeDocumentId) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <ViewportStateBridge
        activeDocumentId={activeDocumentId}
        initialPage={initialPage}
        onViewportStateChange={onViewportStateChange}
        onViewportActionsReady={onViewportActionsReady}
      />
      <DocumentContent documentId={activeDocumentId}>
        {({ isLoaded, isError, documentState }) => {
          if (isError) {
            return (
              <div className="flex h-full items-center justify-center px-4 text-center text-sm text-destructive">
                Falha ao carregar PDF: {documentState.error ?? 'erro desconhecido'}.
              </div>
            );
          }

          if (!isLoaded) {
            console.info('[EmbedPDF Reader] document loading', activeDocumentId);
            return (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            );
          }

          return (
            <Viewport documentId={activeDocumentId} className="h-full w-full bg-muted/15">
              <ZoomGestureWrapper documentId={activeDocumentId}>
                <Scroller
                  documentId={activeDocumentId}
                  renderPage={({ pageIndex, width, height, scale }) => (
                    <div
                      key={`${activeDocumentId}-${pageIndex}`}
                      data-reader-page-index={pageIndex}
                      style={{ width, height, position: 'relative' }}
                      className="px-1 py-2 sm:px-2 sm:py-3 md:px-3"
                      onDragStart={preventNativeDrag}
                      onDrop={preventNativeDrag}
                    >
                      <PagePointerProvider
                        documentId={activeDocumentId}
                        pageIndex={pageIndex}
                        scale={scale}
                        style={{
                          width: '100%',
                          height: '100%',
                          userSelect: 'text',
                          WebkitUserSelect: 'text',
                          WebkitTouchCallout: 'default',
                          borderRadius: '0.5rem',
                          overflow: 'hidden',
                          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.08)',
                          background: 'white',
                        }}
                        onDragStart={preventNativeDrag}
                        onDrop={preventNativeDrag}
                      >
                        <RenderLayer documentId={activeDocumentId} pageIndex={pageIndex} scale={scale} />
                        <SelectionLayer documentId={activeDocumentId} pageIndex={pageIndex} />
                        <AnnotationLayer documentId={activeDocumentId} pageIndex={pageIndex} />
                      </PagePointerProvider>
                    </div>
                  )}
                />
              </ZoomGestureWrapper>
            </Viewport>
          );
        }}
      </DocumentContent>
    </>
  );
};

export const PdfDocumentViewport: React.FC<PdfDocumentViewportProps> = ({
  engine,
  fileUrl,
  containerRef,
  annotations,
  initialPage,
  onSelectionResolved,
  onViewportStateChange,
  onViewportActionsReady,
  onTextLayerQualityEvaluated,
}) => (
  <EmbedPDF engine={engine} plugins={pluginRegistrations}>
    <PdfDocumentViewportContent
      engine={engine}
      fileUrl={fileUrl}
      containerRef={containerRef}
      annotations={annotations}
      initialPage={initialPage}
      onSelectionResolved={onSelectionResolved}
      onViewportStateChange={onViewportStateChange}
      onViewportActionsReady={onViewportActionsReady}
      onTextLayerQualityEvaluated={onTextLayerQualityEvaluated}
    />
  </EmbedPDF>
);
