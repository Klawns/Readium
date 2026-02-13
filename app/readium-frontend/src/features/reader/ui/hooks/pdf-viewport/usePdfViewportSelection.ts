import { useEffect } from 'react';
import type { SelectionCapability } from '@embedpdf/plugin-selection/react';
import { createLogger } from '@/lib/logger.ts';
import type { PendingSelection } from '../../readerTypes';

const logger = createLogger('reader-viewport');

interface UsePdfViewportSelectionParams {
  selectionCapability: Readonly<SelectionCapability> | null;
  activeDocumentId?: string;
  activeDocument: {
    document?: {
      pages: Array<{ size: { width: number; height: number } }>;
    };
  } | null;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onSelectionResolved: (selection: PendingSelection | null) => void;
  lastPointerTypeRef: React.MutableRefObject<string | null>;
  lastTouchSelectionAllowedRef: React.MutableRefObject<boolean>;
  touchGestureRef: React.MutableRefObject<{ longPressArmed: boolean }>;
}

export const usePdfViewportSelection = ({
  selectionCapability,
  activeDocumentId,
  activeDocument,
  containerRef,
  onSelectionResolved,
  lastPointerTypeRef,
  lastTouchSelectionAllowedRef,
  touchGestureRef,
}: UsePdfViewportSelectionParams) => {
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
        logger.error('failed to retrieve selected text', error);
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
      const isTouchSelection = lastPointerTypeRef.current === 'touch';
      const allowTouchSelection = lastTouchSelectionAllowedRef.current || touchGestureRef.current.longPressArmed;

      if (isTouchSelection && !allowTouchSelection) {
        selectionScope.clear();
        onSelectionResolved(null);
        return;
      }

      if (isTouchSelection) {
        lastTouchSelectionAllowedRef.current = false;
      }

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
  }, [
    selectionCapability,
    activeDocumentId,
    activeDocument,
    containerRef,
    onSelectionResolved,
    lastPointerTypeRef,
    lastTouchSelectionAllowedRef,
    touchGestureRef,
  ]);
};
