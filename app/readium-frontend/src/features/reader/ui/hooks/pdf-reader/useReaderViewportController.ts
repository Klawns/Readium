import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReaderViewportActions, ReaderViewportState } from '../../readerTypes';
import { DEFAULT_ZOOM_LEVEL } from './pdfReader.constants';

interface UseReaderViewportControllerParams {
  initialPage: number;
  totalPagesFromProps: number;
  fileUrl: string;
}

export const useReaderViewportController = ({
  initialPage,
  totalPagesFromProps,
  fileUrl,
}: UseReaderViewportControllerParams) => {
  const [viewportState, setViewportState] = useState<ReaderViewportState>({
    currentPage: initialPage,
    totalPages: totalPagesFromProps,
    zoomLevel: DEFAULT_ZOOM_LEVEL,
  });

  const viewportActionsRef = useRef<ReaderViewportActions | null>(null);
  const initializedViewByFileRef = useRef<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement | null>(null);

  const currentPage = Math.max(1, viewportState.currentPage);
  const totalPages = viewportState.totalPages > 0 ? viewportState.totalPages : totalPagesFromProps;
  const zoomLevel = viewportState.zoomLevel || DEFAULT_ZOOM_LEVEL;

  const goToPage = useCallback((page: number) => {
    viewportActionsRef.current?.goToPage(page);
  }, []);

  const zoomIn = useCallback(() => {
    viewportActionsRef.current?.zoomIn();
  }, []);

  const zoomOut = useCallback(() => {
    viewportActionsRef.current?.zoomOut();
  }, []);

  const resetZoom = useCallback(() => {
    viewportActionsRef.current?.resetZoom();
  }, []);

  const handleViewportStateChange = useCallback((nextState: ReaderViewportState) => {
    setViewportState((previous) => {
      if (
        previous.currentPage === nextState.currentPage &&
        previous.totalPages === nextState.totalPages &&
        previous.zoomLevel === nextState.zoomLevel
      ) {
        return previous;
      }

      return nextState;
    });
  }, []);

  const handleViewportActionsReady = useCallback((actions: ReaderViewportActions | null) => {
    viewportActionsRef.current = actions;

    if (!actions || initializedViewByFileRef.current.has(fileUrl)) {
      return;
    }

    requestAnimationFrame(() => {
      actions.goToPage(initialPage);
      actions.resetZoom();
      initializedViewByFileRef.current.add(fileUrl);
    });
  }, [fileUrl, initialPage]);

  useEffect(() => {
    setViewportState((previous) => ({
      ...previous,
      currentPage: initialPage,
    }));

    if (viewportActionsRef.current) {
      viewportActionsRef.current.goToPage(initialPage);
    }
  }, [initialPage]);

  useEffect(() => {
    initializedViewByFileRef.current.delete(fileUrl);
  }, [fileUrl]);

  return {
    containerRef,
    currentPage,
    totalPages,
    zoomLevel,
    goToPage,
    zoomIn,
    zoomOut,
    resetZoom,
    handleViewportStateChange,
    handleViewportActionsReady,
  };
};
