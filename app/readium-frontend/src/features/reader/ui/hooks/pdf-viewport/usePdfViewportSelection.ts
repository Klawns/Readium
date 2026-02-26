import { useEffect, useRef } from 'react';
import type { SelectionCapability } from '@embedpdf/plugin-selection/react';
import { createLogger } from '@/lib/logger.ts';
import type { PendingSelection } from '../../readerTypes';
import { isTouchCapableDevice } from './pdfViewport.utils';
import { resolveViewportSelection } from './pdfViewport.selectionResolver';
import { bindSelectionCleanupListeners } from './pdfViewport.selectionCleanup';

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
  touchPointerEndSignal: number;
}

const SELECTION_CLEAR_GRACE_MS = 250;
const RECT_COMPARISON_EPSILON = 0.0001;
const logger = createLogger('reader-viewport-selection');

const isRectEquivalent = (
  left: PendingSelection['rects'][number],
  right: PendingSelection['rects'][number],
): boolean =>
  Math.abs(left.x - right.x) <= RECT_COMPARISON_EPSILON &&
  Math.abs(left.y - right.y) <= RECT_COMPARISON_EPSILON &&
  Math.abs(left.width - right.width) <= RECT_COMPARISON_EPSILON &&
  Math.abs(left.height - right.height) <= RECT_COMPARISON_EPSILON;

const isSelectionEquivalent = (left: PendingSelection | null, right: PendingSelection | null): boolean => {
  if (left === right) {
    return true;
  }

  if (!left || !right) {
    return false;
  }

  if (
    left.page !== right.page ||
    left.text !== right.text ||
    left.rects.length !== right.rects.length ||
    Math.abs(left.popupPosition.x - right.popupPosition.x) > RECT_COMPARISON_EPSILON ||
    Math.abs(left.popupPosition.y - right.popupPosition.y) > RECT_COMPARISON_EPSILON
  ) {
    return false;
  }

  for (let index = 0; index < left.rects.length; index += 1) {
    if (!isRectEquivalent(left.rects[index], right.rects[index])) {
      return false;
    }
  }

  return true;
};

export const usePdfViewportSelection = ({
  selectionCapability,
  activeDocumentId,
  activeDocument,
  containerRef,
  onSelectionResolved,
  lastPointerTypeRef,
  lastTouchSelectionAllowedRef,
  touchPointerEndSignal,
}: UsePdfViewportSelectionParams) => {
  const isResolvingSelectionRef = useRef(false);
  const lastResolvedSelectionAtRef = useRef<number | null>(null);
  const hasActivePendingSelectionRef = useRef(false);
  const lastEmittedSelectionRef = useRef<PendingSelection | null>(null);
  const resolveTouchSelectionOnPointerEndRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!selectionCapability || !activeDocumentId || !activeDocument) {
      return;
    }

    let disposed = false;
    const selectionScope = selectionCapability.forDocument(activeDocumentId);
    const isTouchDevice = isTouchCapableDevice();
    isResolvingSelectionRef.current = false;
    lastResolvedSelectionAtRef.current = null;
    hasActivePendingSelectionRef.current = false;
    lastEmittedSelectionRef.current = null;

    const emitSelection = (selection: PendingSelection | null) => {
      if (!disposed) {
        if (isSelectionEquivalent(lastEmittedSelectionRef.current, selection)) {
          return;
        }
        lastEmittedSelectionRef.current = selection;
        if (selection) {
          hasActivePendingSelectionRef.current = true;
          lastResolvedSelectionAtRef.current = performance.now();
        } else {
          hasActivePendingSelectionRef.current = false;
          lastResolvedSelectionAtRef.current = null;
        }
        logger.debug('emit selection', {
          activeDocumentId,
          hasSelection: Boolean(selection),
          page: selection?.page ?? null,
          rectCount: selection?.rects.length ?? 0,
          textLength: selection?.text.length ?? 0,
        });
        onSelectionResolved(selection);
      }
    };
    const isDisposed = () => disposed;
    const hasNativeSelectionText = () => Boolean(window.getSelection()?.toString().trim());
    const resolveSelectionSnapshot = (isTouchSelection: boolean) => {
      if (isResolvingSelectionRef.current) {
        logger.debug('skip selection resolve: already resolving', {
          activeDocumentId,
          isTouchSelection,
        });
        return;
      }

      isResolvingSelectionRef.current = true;
      const shouldRetryForTouch = isTouchSelection || isTouchDevice;
      logger.debug('start selection resolve', {
        activeDocumentId,
        isTouchSelection,
        isTouchDevice,
        retries: shouldRetryForTouch ? 6 : 3,
        retryDelayMs: shouldRetryForTouch ? 50 : 30,
      });
      void resolveViewportSelection({
        selectionScope,
        activeDocument,
        containerRef,
        emitSelection,
        isDisposed,
        retries: shouldRetryForTouch ? 6 : 3,
        retryDelayMs: shouldRetryForTouch ? 50 : 30,
      }).finally(() => {
        isResolvingSelectionRef.current = false;
        logger.debug('finish selection resolve', { activeDocumentId });
      });
    };
    resolveTouchSelectionOnPointerEndRef.current = () => {
      const isTouchSelection = lastPointerTypeRef.current === 'touch';
      if (!isTouchSelection || !lastTouchSelectionAllowedRef.current) {
        return;
      }

      logger.debug('resolving selection after touch pointer end', { activeDocumentId });
      resolveSelectionSnapshot(true);
    };

    const unsubscribeSelectionBegin = selectionScope.onBeginSelection(() => {
      logger.debug('selection begin', {
        activeDocumentId,
        pointerType: lastPointerTypeRef.current,
      });
      isResolvingSelectionRef.current = false;
      lastResolvedSelectionAtRef.current = null;
      if (hasActivePendingSelectionRef.current) {
        emitSelection(null);
      }
    });

    const unsubscribeSelectionEnd = selectionScope.onEndSelection(() => {
      const isTouchSelection = lastPointerTypeRef.current === 'touch';
      logger.debug('selection end', {
        activeDocumentId,
        pointerType: lastPointerTypeRef.current,
        isTouchSelection,
        touchSelectionAllowed: lastTouchSelectionAllowedRef.current,
      });
      if (isTouchSelection && !lastTouchSelectionAllowedRef.current) {
        logger.debug('selection cleared: touch selection not allowed yet', { activeDocumentId });
        selectionScope.clear();
        emitSelection(null);
        return;
      }

      if (isTouchSelection) {
        logger.debug('defer touch selection resolve until pointer end event', { activeDocumentId });
        return;
      }

      resolveSelectionSnapshot(false);
    });

    const unsubscribeSelectionChange = selectionScope.onSelectionChange((selection) => {
      const isTouchSelection = lastPointerTypeRef.current === 'touch';
      logger.debug('selection change', {
        activeDocumentId,
        hasSelection: Boolean(selection),
        pointerType: lastPointerTypeRef.current,
        isTouchSelection,
        touchSelectionAllowed: lastTouchSelectionAllowedRef.current,
      });
      if (selection && isTouchSelection && !lastTouchSelectionAllowedRef.current) {
        // Keep the underlying selection session alive until long-press is confirmed.
        // Clearing here prevents subsequent drag expansion on Android touch devices.
        logger.debug('selection change ignored until long-press unlock', { activeDocumentId });
        return;
      }

      if (selection) {
        if (isTouchSelection) {
          logger.debug('defer touch selection resolve until pointer end', { activeDocumentId });
          return;
        }

        resolveSelectionSnapshot(false);
        return;
      }

      if (!selection) {
        if (hasActivePendingSelectionRef.current) {
          return;
        }

        const resolvedAt = lastResolvedSelectionAtRef.current;
        const isWithinGraceWindow =
          resolvedAt !== null && performance.now() - resolvedAt <= SELECTION_CLEAR_GRACE_MS;
        if (isResolvingSelectionRef.current || isWithinGraceWindow) {
          logger.debug('skip clear selection', {
            activeDocumentId,
            isResolving: isResolvingSelectionRef.current,
            isWithinGraceWindow,
          });
          return;
        }
        emitSelection(null);
      }
    });

    const unbindCleanupListeners = bindSelectionCleanupListeners({
      selectionScope,
      isDisposed,
      hasNativeSelectionText,
      emitSelection: () => emitSelection(null),
    });

    return () => {
      disposed = true;
      resolveTouchSelectionOnPointerEndRef.current = null;
      unsubscribeSelectionBegin();
      unsubscribeSelectionEnd();
      unsubscribeSelectionChange();
      unbindCleanupListeners();
    };
  }, [
    selectionCapability,
    activeDocumentId,
    activeDocument,
    containerRef,
    onSelectionResolved,
    lastPointerTypeRef,
    lastTouchSelectionAllowedRef,
  ]);

  useEffect(() => {
    resolveTouchSelectionOnPointerEndRef.current?.();
  }, [touchPointerEndSignal]);
};
