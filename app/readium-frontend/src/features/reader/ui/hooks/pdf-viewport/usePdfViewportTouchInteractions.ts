import { useCallback, useRef } from 'react';
import type { InteractionManagerCapability } from '@embedpdf/plugin-interaction-manager/react';
import type { SelectionCapability } from '@embedpdf/plugin-selection/react';
import { TOUCH_LONG_PRESS_HAPTIC_MS } from './pdfViewport.constants';
import { triggerHapticFeedback } from './pdfViewport.utils';
import { usePdfViewportTouchSelectionControl } from './usePdfViewportTouchSelectionControl';
import { usePdfViewportTouchGestureTimer } from './usePdfViewportTouchGestureTimer';
import { usePdfViewportTouchMode } from './usePdfViewportTouchMode';
import { usePdfViewportTouchTapDetector } from './usePdfViewportTouchTapDetector';

interface UsePdfViewportTouchInteractionsParams {
  activeDocumentId?: string;
  interactionCapability: Readonly<InteractionManagerCapability> | null;
  selectionCapability: Readonly<SelectionCapability> | null;
  onViewportTap?: (payload: { x: number; y: number }) => void;
}

export const usePdfViewportTouchInteractions = ({
  activeDocumentId,
  interactionCapability,
  selectionCapability,
  onViewportTap,
}: UsePdfViewportTouchInteractionsParams) => {
  const lastPointerTypeRef = useRef<string | null>(null);
  const {
    lastTouchSelectionAllowedRef,
    showTouchSelectionRects,
    resetTouchSelectionControl,
    allowTouchSelection,
  } = usePdfViewportTouchSelectionControl();
  const { touchGestureRef, clearLongPressTimer, resetTouchGesture, beginTouchGesture } =
    usePdfViewportTouchGestureTimer({
      onLongPress: () => {
        allowTouchSelection();
        triggerHapticFeedback(TOUCH_LONG_PRESS_HAPTIC_MS);
      },
    });

  const hasActiveTouchSelection = useCallback(() => {
    if (!selectionCapability || !activeDocumentId) {
      return false;
    }

    return selectionCapability.forDocument(activeDocumentId).getBoundingRects().length > 0;
  }, [activeDocumentId, selectionCapability]);
  const { handlePointerMoveCapture, handlePointerEndCapture } = usePdfViewportTouchTapDetector({
    touchGestureRef,
    clearLongPressTimer,
    resetTouchGesture,
    hasActiveTouchSelection,
    resetTouchSelectionControl,
    onViewportTap,
  });

  const preventNativeDrag = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);

  const preventMobileContextMenu = useCallback((event: React.MouseEvent) => {
    if (lastPointerTypeRef.current !== 'touch') {
      return;
    }
    event.preventDefault();
  }, []);

  const handlePointerDownCapture = useCallback(
    (event: React.PointerEvent) => {
      lastPointerTypeRef.current = event.pointerType;

      if (event.pointerType !== 'touch') {
        return;
      }

      resetTouchSelectionControl();
      beginTouchGesture(event);
    },
    [beginTouchGesture, resetTouchSelectionControl],
  );

  usePdfViewportTouchMode({
    activeDocumentId,
    interactionCapability,
    selectionCapability,
    onCleanup: () => {
      clearLongPressTimer();
      resetTouchSelectionControl();
      resetTouchGesture();
    },
  });

  return {
    lastPointerTypeRef,
    lastTouchSelectionAllowedRef,
    showTouchSelectionRects,
    preventNativeDrag,
    preventMobileContextMenu,
    handlePointerDownCapture,
    handlePointerMoveCapture,
    handlePointerEndCapture,
  };
};
