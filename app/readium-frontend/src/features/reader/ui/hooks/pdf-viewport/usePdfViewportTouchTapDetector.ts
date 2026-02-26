import { useCallback } from 'react';
import type { MutableRefObject } from 'react';
import { createLogger } from '@/lib/logger.ts';
import {
  TAP_MAX_DURATION_MS,
  TAP_MAX_MOVEMENT_PX,
  TOUCH_LONG_PRESS_CANCEL_MOVEMENT_PX,
} from './pdfViewport.constants';
import type { TouchGestureState } from './usePdfViewportTouchGestureTimer';

const logger = createLogger('reader-viewport-touch');

interface UsePdfViewportTouchTapDetectorParams {
  touchGestureRef: MutableRefObject<TouchGestureState>;
  clearLongPressTimer: () => void;
  triggerLongPressIfElapsed: (pointerId: number) => boolean;
  resetTouchGesture: () => void;
  persistTouchSelectionControl: boolean;
  hasActiveTouchSelection: () => boolean;
  clearActiveTouchSelection: () => void;
  resetTouchSelectionControl: () => void;
  onTouchPointerEnd?: () => void;
  onViewportTap?: (payload: { x: number; y: number }) => void;
}

export const usePdfViewportTouchTapDetector = ({
  touchGestureRef,
  clearLongPressTimer,
  triggerLongPressIfElapsed,
  resetTouchGesture,
  persistTouchSelectionControl,
  hasActiveTouchSelection,
  clearActiveTouchSelection,
  resetTouchSelectionControl,
  onTouchPointerEnd,
  onViewportTap,
}: UsePdfViewportTouchTapDetectorParams) => {
  const handlePointerMoveCapture = useCallback(
    (event: React.PointerEvent) => {
      if (event.pointerType !== 'touch') {
        return;
      }

      const state = touchGestureRef.current;
      if (state.pointerId !== event.pointerId) {
        return;
      }

      const promotedToLongPress = triggerLongPressIfElapsed(event.pointerId);
      if (promotedToLongPress) {
        logger.debug('promoted touch gesture to long-press on move', {
          pointerId: event.pointerId,
        });
      }

      if (state.selectionActiveAtStart) {
        return;
      }

      if (state.longPressTriggered) {
        return;
      }

      const movedX = Math.abs(event.clientX - state.startX);
      const movedY = Math.abs(event.clientY - state.startY);
      if (movedX <= TAP_MAX_MOVEMENT_PX && movedY <= TAP_MAX_MOVEMENT_PX) {
        return;
      }

      if (!state.moved) {
        state.moved = true;
        logger.debug('touch gesture exceeded tap movement threshold', {
          pointerId: event.pointerId,
          movedX,
          movedY,
        });
      }

      const isVerticalDominantMovement = movedY > movedX * 1.25;
      const longPressShouldCancel =
        movedY > TOUCH_LONG_PRESS_CANCEL_MOVEMENT_PX && isVerticalDominantMovement;

      if (!state.longPressTriggered && !state.longPressCanceled && longPressShouldCancel) {
        const hasSelectionRects = hasActiveTouchSelection();
        state.longPressCanceled = true;
        clearLongPressTimer();
        if (hasSelectionRects) {
          clearActiveTouchSelection();
          logger.debug('cleared pre-unlock touch selection while canceling long-press for scroll', {
            pointerId: event.pointerId,
            movedX,
            movedY,
          });
        }
        logger.debug('canceled long-press due to movement', {
          pointerId: event.pointerId,
          movedX,
          movedY,
          isVerticalDominantMovement,
          cancelThreshold: TOUCH_LONG_PRESS_CANCEL_MOVEMENT_PX,
        });
      }
    },
    [
      clearActiveTouchSelection,
      clearLongPressTimer,
      hasActiveTouchSelection,
      touchGestureRef,
      triggerLongPressIfElapsed,
    ],
  );

  const handlePointerEndCapture = useCallback(
    (event: React.PointerEvent) => {
      if (event.pointerType !== 'touch') {
        return;
      }

      const state = touchGestureRef.current;
      if (state.pointerId !== event.pointerId) {
        return;
      }

      clearLongPressTimer();

      const durationMs = performance.now() - state.startTimeMs;
      const deltaX = Math.abs(event.clientX - state.startX);
      const deltaY = Math.abs(event.clientY - state.startY);
      const isTap =
        !state.selectionActiveAtStart &&
        !state.longPressTriggered &&
        !state.moved &&
        durationMs <= TAP_MAX_DURATION_MS &&
        deltaX <= TAP_MAX_MOVEMENT_PX &&
        deltaY <= TAP_MAX_MOVEMENT_PX;

      if (isTap) {
        onViewportTap?.({ x: event.clientX, y: event.clientY });
      }

      const hasSelectionRects = hasActiveTouchSelection();
      const shouldClearPreUnlockSelection =
        hasSelectionRects &&
        !persistTouchSelectionControl &&
        !state.selectionActiveAtStart &&
        !state.longPressTriggered;
      if (shouldClearPreUnlockSelection) {
        logger.debug('clearing pre-unlock touch selection at pointer end', {
          pointerId: event.pointerId,
        });
        clearActiveTouchSelection();
      }

      logger.debug('pointer end capture', {
        pointerId: event.pointerId,
        isTap,
        selectionActiveAtStart: state.selectionActiveAtStart,
        longPressTriggered: state.longPressTriggered,
        moved: state.moved,
        durationMs,
        deltaX,
        deltaY,
        hasSelectionRects,
      });

      if (!persistTouchSelectionControl) {
        const selectionControlResetDelayMs = state.longPressTriggered ? 420 : 0;
        window.setTimeout(() => {
          resetTouchSelectionControl();
        }, selectionControlResetDelayMs);
      }

      onTouchPointerEnd?.();
      resetTouchGesture();
    },
    [
      clearLongPressTimer,
      clearActiveTouchSelection,
      hasActiveTouchSelection,
      onTouchPointerEnd,
      onViewportTap,
      persistTouchSelectionControl,
      resetTouchGesture,
      resetTouchSelectionControl,
      touchGestureRef,
    ],
  );

  return {
    handlePointerMoveCapture,
    handlePointerEndCapture,
  };
};
