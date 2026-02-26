import { useEffect } from 'react';
import type { SelectionCapability } from '@embedpdf/plugin-selection/react';
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
}

export const usePdfViewportSelection = ({
  selectionCapability,
  activeDocumentId,
  activeDocument,
  containerRef,
  onSelectionResolved,
  lastPointerTypeRef,
  lastTouchSelectionAllowedRef,
}: UsePdfViewportSelectionParams) => {
  useEffect(() => {
    if (!selectionCapability || !activeDocumentId || !activeDocument) {
      return;
    }

    let disposed = false;
    const selectionScope = selectionCapability.forDocument(activeDocumentId);
    const isTouchDevice = isTouchCapableDevice();
    const emitSelection = (selection: PendingSelection | null) => {
      if (!disposed) {
        onSelectionResolved(selection);
      }
    };
    const isDisposed = () => disposed;
    const hasNativeSelectionText = () => Boolean(window.getSelection()?.toString().trim());

    const unsubscribeSelectionEnd = selectionScope.onEndSelection(() => {
      const isTouchSelection = lastPointerTypeRef.current === 'touch';
      if (isTouchSelection && !lastTouchSelectionAllowedRef.current) {
        selectionScope.clear();
        emitSelection(null);
        return;
      }

      const shouldRetryForTouch = isTouchSelection || isTouchDevice;
      void resolveViewportSelection({
        selectionScope,
        activeDocument,
        containerRef,
        emitSelection,
        isDisposed,
        retries: shouldRetryForTouch ? 6 : 3,
        retryDelayMs: shouldRetryForTouch ? 50 : 30,
      });
    });

    const unsubscribeSelectionChange = selectionScope.onSelectionChange((selection) => {
      const isTouchSelection = lastPointerTypeRef.current === 'touch';
      if (selection && isTouchSelection && !lastTouchSelectionAllowedRef.current) {
        // Keep the underlying selection session alive until long-press is confirmed.
        // Clearing here prevents subsequent drag expansion on Android touch devices.
        return;
      }

      if (!selection) {
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
};
