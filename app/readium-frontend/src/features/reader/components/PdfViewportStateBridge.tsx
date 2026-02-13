import React, { useEffect, useRef } from 'react';
import { useScroll, useScrollCapability } from '@embedpdf/plugin-scroll/react';
import { useZoom } from '@embedpdf/plugin-zoom/react';
import type { ReaderViewportActions, ReaderViewportState } from '../ui/readerTypes';
import { DEFAULT_ZOOM_LEVEL } from '../ui/hooks/pdf-viewport/pdfViewport.constants';
import { clampPage, getPreferredZoomLevel } from '../ui/hooks/pdf-viewport/pdfViewport.utils';
import { createLogger } from '@/lib/logger.ts';

const logger = createLogger('reader-viewport-state');

interface PdfViewportStateBridgeProps {
  activeDocumentId: string;
  initialPage: number;
  onViewportStateChange?: (state: ReaderViewportState) => void;
  onViewportActionsReady?: (actions: ReaderViewportActions | null) => void;
}

export const PdfViewportStateBridge: React.FC<PdfViewportStateBridgeProps> = ({
  activeDocumentId,
  initialPage,
  onViewportStateChange,
  onViewportActionsReady,
}) => {
  const { state: scrollState, provides: scrollScope } = useScroll(activeDocumentId);
  const { provides: scrollCapability } = useScrollCapability();
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
    if (!scrollCapability || !scrollScope || !zoomScope) {
      return;
    }

    return scrollCapability.onLayoutReady((event) => {
      if (event.documentId !== activeDocumentId) {
        return;
      }

      if (initializedDocumentRef.current.has(activeDocumentId)) {
        return;
      }

      initializedDocumentRef.current.add(activeDocumentId);

      const totalPages = Math.max(event.totalPages, scrollScope.getTotalPages(), scrollState.totalPages);
      const targetPage = clampPage(initialPage, totalPages);

      logger.debug('layout ready, applying initial view', {
        activeDocumentId,
        initialPage,
        totalPages,
        eventIsInitial: event.isInitial,
      });

      const applyInitialView = () => {
        zoomScope.requestZoom(getPreferredZoomLevel());
        scrollScope.scrollToPage({
          pageNumber: targetPage,
          behavior: 'auto',
          alignY: 4,
        });
      };

      const animation = window.requestAnimationFrame(applyInitialView);
      const retryTimer = window.setTimeout(applyInitialView, 180);

      window.setTimeout(() => {
        window.cancelAnimationFrame(animation);
        window.clearTimeout(retryTimer);
      }, 220);
    });
  }, [scrollCapability, activeDocumentId, initialPage, scrollScope, scrollState.totalPages, zoomScope]);

  useEffect(() => {
    if (!zoomScope) {
      return;
    }

    if (zoomState.currentZoomLevel > 0.01) {
      return;
    }

    logger.warn('zoom level invalid, forcing fallback zoom', {
      activeDocumentId,
      zoomLevel: zoomState.currentZoomLevel,
    });

    const animation = window.requestAnimationFrame(() => {
      zoomScope.requestZoom(DEFAULT_ZOOM_LEVEL);
    });
    const retryTimer = window.setTimeout(() => {
      zoomScope.requestZoom(DEFAULT_ZOOM_LEVEL);
    }, 140);

    return () => {
      window.cancelAnimationFrame(animation);
      window.clearTimeout(retryTimer);
    };
  }, [zoomScope, zoomState.currentZoomLevel]);

  return null;
};
