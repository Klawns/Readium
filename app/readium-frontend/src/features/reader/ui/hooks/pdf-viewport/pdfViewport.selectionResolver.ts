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
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    if (isDisposed()) {
      return;
    }

    const [selectedRect] = selectionScope.getBoundingRects();
    if (!selectedRect) {
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
      return;
    }

    const pageElement = containerRef.current?.querySelector<HTMLElement>(`[data-reader-page-index="${pageIndex}"]`);
    if (!pageElement) {
      if (attempt < retries) {
        await waitForSelectionSync(retryDelayMs);
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
    return;
  }
};
