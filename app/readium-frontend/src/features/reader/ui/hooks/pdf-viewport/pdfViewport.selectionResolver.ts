import { createLogger } from '@/lib/logger.ts';
import type { RefObject } from 'react';
import type { PendingSelection } from '../../readerTypes';

const logger = createLogger('reader-viewport');

interface PdfRect {
  origin: { x: number; y: number };
  size: { width: number; height: number };
}

interface BoundingRect {
  page: number;
  rect: PdfRect;
}

interface SelectionScopeLike {
  getBoundingRects(): BoundingRect[];
  getHighlightRectsForPage(pageIndex: number): PdfRect[];
  getSelectedText(): { toPromise(): Promise<string[]> };
}

interface ActiveDocumentLike {
  document?: {
    pages: Array<{ size: { width: number; height: number } }>;
  };
}

interface ResolveViewportSelectionParams {
  selectionScope: SelectionScopeLike;
  activeDocument: ActiveDocumentLike;
  containerRef: RefObject<HTMLDivElement | null>;
  emitSelection: (selection: PendingSelection | null) => void;
  isDisposed: () => boolean;
  retries: number;
  retryDelayMs: number;
}

const waitForSelectionSync = (delayMs: number) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, delayMs);
  });

export const resolveViewportSelection = async ({
  selectionScope,
  activeDocument,
  containerRef,
  emitSelection,
  isDisposed,
  retries,
  retryDelayMs,
}: ResolveViewportSelectionParams) => {
  logger.debug('resolve selection snapshot started', { retries, retryDelayMs });
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    if (isDisposed()) {
      logger.debug('resolve selection aborted: disposed', { attempt });
      return;
    }

    const [selectedRect] = selectionScope.getBoundingRects();
    if (!selectedRect) {
      if (attempt < retries) {
        await waitForSelectionSync(retryDelayMs);
        continue;
      }
      logger.debug('resolve selection failed: no selected bounding rect', { attempt, retries });
      emitSelection(null);
      return;
    }

    const pageIndex = selectedRect.page;
    const page = activeDocument.document?.pages[pageIndex];
    if (!page) {
      if (attempt < retries) {
        await waitForSelectionSync(retryDelayMs);
        continue;
      }
      logger.debug('resolve selection failed: page metadata unavailable', {
        attempt,
        pageIndex,
      });
      return;
    }

    const pageElement = containerRef.current?.querySelector<HTMLElement>(`[data-reader-page-index="${pageIndex}"]`);
    if (!pageElement) {
      if (attempt < retries) {
        await waitForSelectionSync(retryDelayMs);
      }
      if (attempt === retries) {
        logger.debug('resolve selection failed: page element not found', {
          pageIndex,
          selector: `[data-reader-page-index="${pageIndex}"]`,
        });
      }
      continue;
    }

    const pageClientRect = pageElement.getBoundingClientRect();
    const pageRects = selectionScope.getHighlightRectsForPage(pageIndex);
    if (pageRects.length === 0) {
      if (attempt < retries) {
        await waitForSelectionSync(retryDelayMs);
        continue;
      }
      logger.debug('resolve selection failed: no page highlight rects', {
        attempt,
        pageIndex,
      });
      emitSelection(null);
      return;
    }

    let selectedText = '';
    try {
      const textSlices = await selectionScope.getSelectedText().toPromise();
      selectedText = textSlices.join(' ').trim();
    } catch (error: unknown) {
      if (attempt < retries) {
        await waitForSelectionSync(retryDelayMs);
        continue;
      }
      logger.error('failed to retrieve selected text', error);
      return;
    }

    if (!selectedText) {
      if (attempt < retries) {
        await waitForSelectionSync(retryDelayMs);
        continue;
      }
      logger.debug('resolve selection failed: selected text empty', {
        attempt,
        pageIndex,
      });
      emitSelection(null);
      return;
    }

    const scaleX = pageClientRect.width / page.size.width;
    const scaleY = pageClientRect.height / page.size.height;

    emitSelection({
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
    logger.debug('resolve selection succeeded', {
      page: pageIndex + 1,
      rectCount: pageRects.length,
      textLength: selectedText.length,
      attempt,
    });
    return;
  }
  logger.debug('resolve selection ended without emission');
};
