import { useCallback, useEffect, useRef, useState } from 'react';
import type { InteractionManagerCapability } from '@embedpdf/plugin-interaction-manager/react';
import type { SelectionCapability } from '@embedpdf/plugin-selection/react';
import { createLogger } from '@/lib/logger.ts';
import { TOUCH_LONG_PRESS_HAPTIC_MS } from './pdfViewport.constants';
import { triggerHapticFeedback } from './pdfViewport.utils';
import { usePdfViewportTouchSelectionControl } from './usePdfViewportTouchSelectionControl';
import { usePdfViewportTouchGestureTimer } from './usePdfViewportTouchGestureTimer';
import { usePdfViewportTouchMode } from './usePdfViewportTouchMode';
import { usePdfViewportTouchTapDetector } from './usePdfViewportTouchTapDetector';

const logger = createLogger('reader-viewport-touch');

interface UsePdfViewportTouchInteractionsParams {
  activeDocumentId?: string;
  interactionCapability: Readonly<InteractionManagerCapability> | null;
  selectionCapability: Readonly<SelectionCapability> | null;
  isTouchSelectionModeEnabled: boolean;
  onViewportTap?: (payload: { x: number; y: number }) => void;
}

export const usePdfViewportTouchInteractions = ({
  activeDocumentId,
  interactionCapability,
  selectionCapability,
  isTouchSelectionModeEnabled,
  onViewportTap,
}: UsePdfViewportTouchInteractionsParams) => {
  const lastPointerTypeRef = useRef<string | null>(null);
  const activeTouchPointerIdRef = useRef<number | null>(null);
  const [touchPointerEndSignal, setTouchPointerEndSignal] = useState(0);
  const [isTouchPointerActive, setIsTouchPointerActive] = useState(false);
  const {
    lastTouchSelectionAllowedRef,
    showTouchSelectionRects,
    isTouchSelectionLocked,
    resetTouchSelectionControl,
    allowTouchSelection,
  } = usePdfViewportTouchSelectionControl();
  const {
    touchGestureRef,
    clearLongPressTimer,
    triggerLongPressIfElapsed,
    resetTouchGesture,
    beginTouchGesture,
  } =
    usePdfViewportTouchGestureTimer({
      onLongPress: () => {
        allowTouchSelection();
        triggerHapticFeedback(TOUCH_LONG_PRESS_HAPTIC_MS);
        logger.debug('touch selection allowed after long-press', {
          activeDocumentId,
        });
      },
    });

  const hasActiveTouchSelection = useCallback(() => {
    if (!selectionCapability || !activeDocumentId) {
      return false;
    }

    return selectionCapability.forDocument(activeDocumentId).getBoundingRects().length > 0;
  }, [activeDocumentId, selectionCapability]);
  const clearActiveTouchSelection = useCallback(() => {
    if (!selectionCapability || !activeDocumentId) {
      return;
    }
    selectionCapability.forDocument(activeDocumentId).clear();
  }, [activeDocumentId, selectionCapability]);
  const handleTouchPointerEnd = useCallback(() => {
    activeTouchPointerIdRef.current = null;
    setIsTouchPointerActive(false);
    setTouchPointerEndSignal((signal) => signal + 1);
  }, []);
  const { handlePointerMoveCapture, handlePointerEndCapture } = usePdfViewportTouchTapDetector({
    touchGestureRef,
    clearLongPressTimer,
    triggerLongPressIfElapsed,
    resetTouchGesture,
    persistTouchSelectionControl: isTouchSelectionModeEnabled,
    hasActiveTouchSelection,
    clearActiveTouchSelection,
    resetTouchSelectionControl,
    onTouchPointerEnd: handleTouchPointerEnd,
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
      logger.debug('pointer down capture', {
        pointerType: event.pointerType,
        pointerId: event.pointerId,
        x: event.clientX,
        y: event.clientY,
      });

      if (event.pointerType !== 'touch') {
        activeTouchPointerIdRef.current = null;
        setIsTouchPointerActive(false);
        return;
      }

      if (!event.isPrimary) {
        logger.debug('ignored non-primary touch pointer', {
          activeDocumentId,
          pointerId: event.pointerId,
        });
        return;
      }

      if (
        activeTouchPointerIdRef.current !== null &&
        activeTouchPointerIdRef.current !== event.pointerId
      ) {
        const activePointerId = activeTouchPointerIdRef.current;
        const state = touchGestureRef.current;
        if (state.pointerId === activePointerId && !state.longPressTriggered) {
          state.longPressCanceled = true;
          clearLongPressTimer();
        }
        logger.debug('ignored secondary touch pointer while tracking active gesture', {
          activeDocumentId,
          activePointerId,
          ignoredPointerId: event.pointerId,
        });
        return;
      }

      activeTouchPointerIdRef.current = event.pointerId;
      setIsTouchPointerActive(true);
      const hasSelectionRects = hasActiveTouchSelection();
      if (hasSelectionRects && !isTouchSelectionModeEnabled) {
        clearActiveTouchSelection();
        logger.debug('cleared existing touch selection before starting new long-press cycle', {
          activeDocumentId,
          pointerId: event.pointerId,
        });
      }

      if (isTouchSelectionModeEnabled) {
        allowTouchSelection();
      } else {
        resetTouchSelectionControl();
      }
      beginTouchGesture(event, {
        scheduleLongPress: false,
        selectionActiveAtStart: isTouchSelectionModeEnabled && hasSelectionRects,
      });
    },
    [
      activeDocumentId,
      allowTouchSelection,
      beginTouchGesture,
      clearLongPressTimer,
      clearActiveTouchSelection,
      hasActiveTouchSelection,
      isTouchSelectionModeEnabled,
      resetTouchSelectionControl,
      touchGestureRef,
    ],
  );

  const handleTouchModeCleanup = useCallback(() => {
    activeTouchPointerIdRef.current = null;
    setIsTouchPointerActive(false);
    clearLongPressTimer();
    resetTouchSelectionControl();
    resetTouchGesture();
  }, [clearLongPressTimer, resetTouchSelectionControl, resetTouchGesture]);

  useEffect(() => {
    if (isTouchSelectionModeEnabled) {
      allowTouchSelection();
      return;
    }

    clearLongPressTimer();
    resetTouchSelectionControl();
    resetTouchGesture();
  }, [
    allowTouchSelection,
    clearLongPressTimer,
    isTouchSelectionModeEnabled,
    resetTouchGesture,
    resetTouchSelectionControl,
  ]);

  useEffect(() => {
    logger.debug('touch selection lock changed', {
      activeDocumentId,
      isTouchSelectionLocked,
      showTouchSelectionRects,
      touchAllowed: lastTouchSelectionAllowedRef.current,
    });
  }, [activeDocumentId, isTouchSelectionLocked, showTouchSelectionRects, lastTouchSelectionAllowedRef]);

  usePdfViewportTouchMode({
    activeDocumentId,
    interactionCapability,
    selectionCapability,
    isTouchSelectionModeEnabled,
    onCleanup: handleTouchModeCleanup,
  });

  return {
    lastPointerTypeRef,
    lastTouchSelectionAllowedRef,
    touchPointerEndSignal,
    isTouchPointerActive,
    showTouchSelectionRects,
    isTouchSelectionLocked,
    preventNativeDrag,
    preventMobileContextMenu,
    handlePointerDownCapture,
    handlePointerMoveCapture,
    handlePointerEndCapture,
  };
};
