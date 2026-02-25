import { useCallback, useRef } from 'react';
import { TOUCH_LONG_PRESS_DURATION_MS } from './pdfViewport.constants';

export interface TouchGestureState {
  pointerId: number | null;
  startX: number;
  startY: number;
  startTimeMs: number;
  moved: boolean;
  longPressTriggered: boolean;
  longPressCanceled: boolean;
  longPressTimerId: number | null;
}

const createTouchGestureState = (): TouchGestureState => ({
  pointerId: null,
  startX: 0,
  startY: 0,
  startTimeMs: 0,
  moved: false,
  longPressTriggered: false,
  longPressCanceled: false,
  longPressTimerId: null,
});

interface UsePdfViewportTouchGestureTimerParams {
  onLongPress: () => void;
}

export const usePdfViewportTouchGestureTimer = ({ onLongPress }: UsePdfViewportTouchGestureTimerParams) => {
  const touchGestureRef = useRef<TouchGestureState>(createTouchGestureState());

  const clearLongPressTimer = useCallback(() => {
    const timerId = touchGestureRef.current.longPressTimerId;
    if (timerId === null) {
      return;
    }
    window.clearTimeout(timerId);
    touchGestureRef.current.longPressTimerId = null;
  }, []);

  const resetTouchGesture = useCallback(() => {
    clearLongPressTimer();
    touchGestureRef.current = createTouchGestureState();
  }, [clearLongPressTimer]);

  const beginTouchGesture = useCallback(
    (event: React.PointerEvent) => {
      touchGestureRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        startTimeMs: performance.now(),
        moved: false,
        longPressTriggered: false,
        longPressCanceled: false,
        longPressTimerId: null,
      };

      const pointerId = event.pointerId;
      touchGestureRef.current.longPressTimerId = window.setTimeout(() => {
        const state = touchGestureRef.current;
        if (state.pointerId !== pointerId || state.longPressCanceled || state.longPressTriggered) {
          return;
        }

        state.longPressTriggered = true;
        onLongPress();
      }, TOUCH_LONG_PRESS_DURATION_MS);
    },
    [onLongPress],
  );

  return {
    touchGestureRef,
    clearLongPressTimer,
    resetTouchGesture,
    beginTouchGesture,
  };
};
