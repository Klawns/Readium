import { useCallback, useRef } from 'react';
import { TOUCH_LONG_PRESS_DURATION_MS } from './pdfViewport.constants';
import { createLogger } from '@/lib/logger.ts';

const logger = createLogger('reader-viewport-touch');

export interface TouchGestureState {
  pointerId: number | null;
  startX: number;
  startY: number;
  startTimeMs: number;
  selectionActiveAtStart: boolean;
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
  selectionActiveAtStart: false,
  moved: false,
  longPressTriggered: false,
  longPressCanceled: false,
  longPressTimerId: null,
});

interface UsePdfViewportTouchGestureTimerParams {
  onLongPress: () => void;
}

interface BeginTouchGestureOptions {
  scheduleLongPress?: boolean;
  selectionActiveAtStart?: boolean;
}

export const usePdfViewportTouchGestureTimer = ({ onLongPress }: UsePdfViewportTouchGestureTimerParams) => {
  const touchGestureRef = useRef<TouchGestureState>(createTouchGestureState());

  const triggerLongPress = useCallback(
    (pointerId: number, reason: 'timer' | 'move') => {
      const state = touchGestureRef.current;
      if (state.pointerId !== pointerId || state.longPressCanceled || state.longPressTriggered) {
        if (reason === 'timer') {
          logger.debug('skipped long-press timer callback', {
            pointerId,
            activePointerId: state.pointerId,
            longPressCanceled: state.longPressCanceled,
            longPressTriggered: state.longPressTriggered,
          });
        }
        return false;
      }

      state.longPressTriggered = true;
      logger.debug('long-press detected', {
        pointerId,
        reason,
        elapsedMs: performance.now() - state.startTimeMs,
      });
      onLongPress();
      return true;
    },
    [onLongPress],
  );

  const clearLongPressTimer = useCallback(() => {
    const timerId = touchGestureRef.current.longPressTimerId;
    if (timerId === null) {
      return;
    }
    window.clearTimeout(timerId);
    touchGestureRef.current.longPressTimerId = null;
    logger.debug('cleared long-press timer', { timerId });
  }, []);

  const triggerLongPressIfElapsed = useCallback(
    (pointerId: number) => {
      const state = touchGestureRef.current;
      if (state.pointerId !== pointerId || state.longPressCanceled || state.longPressTriggered) {
        return false;
      }

      const elapsedMs = performance.now() - state.startTimeMs;
      if (elapsedMs < TOUCH_LONG_PRESS_DURATION_MS) {
        return false;
      }

      clearLongPressTimer();
      return triggerLongPress(pointerId, 'move');
    },
    [clearLongPressTimer, triggerLongPress],
  );

  const resetTouchGesture = useCallback(() => {
    const previous = touchGestureRef.current;
    clearLongPressTimer();
    touchGestureRef.current = createTouchGestureState();
    logger.debug('reset touch gesture state', {
      pointerId: previous.pointerId,
      selectionActiveAtStart: previous.selectionActiveAtStart,
      longPressTriggered: previous.longPressTriggered,
      longPressCanceled: previous.longPressCanceled,
      moved: previous.moved,
    });
  }, [clearLongPressTimer]);

  const beginTouchGesture = useCallback(
    (event: React.PointerEvent, options: BeginTouchGestureOptions = {}) => {
      const scheduleLongPress = options.scheduleLongPress ?? true;
      const selectionActiveAtStart = options.selectionActiveAtStart ?? false;
      touchGestureRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        startTimeMs: performance.now(),
        selectionActiveAtStart,
        moved: false,
        longPressTriggered: false,
        longPressCanceled: !scheduleLongPress,
        longPressTimerId: null,
      };
      logger.debug('begin touch gesture', {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        scheduleLongPress,
        selectionActiveAtStart,
      });

      if (!scheduleLongPress) {
        return;
      }

      const pointerId = event.pointerId;
      touchGestureRef.current.longPressTimerId = window.setTimeout(() => {
        triggerLongPress(pointerId, 'timer');
      }, TOUCH_LONG_PRESS_DURATION_MS);
    },
    [triggerLongPress],
  );

  return {
    touchGestureRef,
    clearLongPressTimer,
    triggerLongPressIfElapsed,
    resetTouchGesture,
    beginTouchGesture,
  };
};
