import { useCallback } from 'react';
import type { MutableRefObject } from 'react';
import {
  TAP_MAX_DURATION_MS,
  TAP_MAX_MOVEMENT_PX,
  TOUCH_LONG_PRESS_CANCEL_MOVEMENT_PX,
} from './pdfViewport.constants';
import type { TouchGestureState } from './usePdfViewportTouchGestureTimer';

interface UsePdfViewportTouchTapDetectorParams {
  touchGestureRef: MutableRefObject<TouchGestureState>;
  clearLongPressTimer: () => void;
  resetTouchGesture: () => void;
  hasActiveTouchSelection: () => boolean;
  resetTouchSelectionControl: () => void;
  lockTouchSelectionOnNextTick: () => void;
  onViewportTap?: (payload: { x: number; y: number }) => void;
}

export const usePdfViewportTouchTapDetector = ({
  touchGestureRef,
  clearLongPressTimer,
  resetTouchGesture,
  hasActiveTouchSelection,
  resetTouchSelectionControl,
  lockTouchSelectionOnNextTick,
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

      if (state.longPressTriggered) {
        event.preventDefault();
        return;
      }

      const movedX = Math.abs(event.clientX - state.startX);
      const movedY = Math.abs(event.clientY - state.startY);
      if (movedX <= TAP_MAX_MOVEMENT_PX && movedY <= TAP_MAX_MOVEMENT_PX) {
        if (!state.longPressTriggered && !state.longPressCanceled) {
          event.stopPropagation();
        }
        return;
      }

      if (!state.moved) {
        state.moved = true;
      }

      const longPressShouldCancel =
        movedX > TOUCH_LONG_PRESS_CANCEL_MOVEMENT_PX || movedY > TOUCH_LONG_PRESS_CANCEL_MOVEMENT_PX;

      if (!state.longPressTriggered && longPressShouldCancel) {
        state.longPressCanceled = true;
        clearLongPressTimer();
      }

      if (!state.longPressTriggered && !state.longPressCanceled) {
        event.stopPropagation();
      }
    },
    [clearLongPressTimer, touchGestureRef],
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
        !state.longPressTriggered &&
        !state.moved &&
        durationMs <= TAP_MAX_DURATION_MS &&
        deltaX <= TAP_MAX_MOVEMENT_PX &&
        deltaY <= TAP_MAX_MOVEMENT_PX;

      if (isTap) {
        onViewportTap?.({ x: event.clientX, y: event.clientY });
      }

      if (state.longPressTriggered) {
        // Keep permission during pointerup dispatch so SelectionPlugin can finalize this gesture,
        // then lock selection again to require a fresh long-press for the next gesture.
        lockTouchSelectionOnNextTick();
      }

      if (!state.longPressTriggered && !hasActiveTouchSelection()) {
        resetTouchSelectionControl();
      }

      resetTouchGesture();
    },
    [
      clearLongPressTimer,
      hasActiveTouchSelection,
      lockTouchSelectionOnNextTick,
      onViewportTap,
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
