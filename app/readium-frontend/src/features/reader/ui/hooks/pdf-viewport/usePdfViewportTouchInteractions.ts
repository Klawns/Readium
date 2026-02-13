import { useCallback, useEffect, useRef } from 'react';
import type { InteractionManagerCapability, InteractionMode } from '@embedpdf/plugin-interaction-manager/react';
import type { SelectionCapability } from '@embedpdf/plugin-selection/react';
import { createLogger } from '@/lib/logger.ts';
import {
  TAP_MAX_DURATION_MS,
  TAP_MAX_MOVEMENT_PX,
  TOUCH_LONG_PRESS_MS,
  TOUCH_SCROLL_MODE_ID,
} from './pdfViewport.constants';
import { isTouchCapableDevice } from './pdfViewport.utils';

const logger = createLogger('reader-viewport');

interface TouchGestureState {
  pointerId: number | null;
  startX: number;
  startY: number;
  startTimeMs: number;
  moved: boolean;
  longPressArmed: boolean;
}

const createTouchGestureState = (): TouchGestureState => ({
  pointerId: null,
  startX: 0,
  startY: 0,
  startTimeMs: 0,
  moved: false,
  longPressArmed: false,
});

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
  const touchGestureRef = useRef<TouchGestureState>(createTouchGestureState());
  const longPressTimerRef = useRef<number | null>(null);
  const lastPointerTypeRef = useRef<string | null>(null);
  const lastTouchSelectionAllowedRef = useRef(false);

  const clearLongPressTimer = useCallback(() => {
    if (longPressTimerRef.current == null) {
      return;
    }

    window.clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = null;
  }, []);

  const preventNativeDrag = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);

  const preventMobileContextMenu = useCallback((event: React.MouseEvent) => {
    if (!isTouchCapableDevice()) {
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

      clearLongPressTimer();
      lastTouchSelectionAllowedRef.current = false;
      touchGestureRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        startTimeMs: performance.now(),
        moved: false,
        longPressArmed: false,
      };

      longPressTimerRef.current = window.setTimeout(() => {
        const state = touchGestureRef.current;
        if (state.pointerId !== event.pointerId || state.moved) {
          return;
        }

        touchGestureRef.current = {
          ...state,
          longPressArmed: true,
        };
      }, TOUCH_LONG_PRESS_MS);
    },
    [clearLongPressTimer],
  );

  const handlePointerMoveCapture = useCallback(
    (event: React.PointerEvent) => {
      if (event.pointerType !== 'touch') {
        return;
      }

      const state = touchGestureRef.current;
      if (state.pointerId !== event.pointerId) {
        return;
      }

      const movedX = Math.abs(event.clientX - state.startX);
      const movedY = Math.abs(event.clientY - state.startY);
      if (movedX <= TAP_MAX_MOVEMENT_PX && movedY <= TAP_MAX_MOVEMENT_PX) {
        return;
      }

      if (!state.moved) {
        touchGestureRef.current = {
          ...state,
          moved: true,
        };

        if (!state.longPressArmed) {
          clearLongPressTimer();
        }
      }
    },
    [clearLongPressTimer],
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
        !state.longPressArmed &&
        !state.moved &&
        durationMs <= TAP_MAX_DURATION_MS &&
        deltaX <= TAP_MAX_MOVEMENT_PX &&
        deltaY <= TAP_MAX_MOVEMENT_PX;

      lastTouchSelectionAllowedRef.current = state.longPressArmed;

      if (isTap) {
        onViewportTap?.({ x: event.clientX, y: event.clientY });
      }

      touchGestureRef.current = createTouchGestureState();
    },
    [clearLongPressTimer, onViewportTap],
  );

  useEffect(() => {
    if (!activeDocumentId || !interactionCapability || !selectionCapability || !isTouchCapableDevice()) {
      return;
    }

    const touchScrollMode: InteractionMode = {
      id: TOUCH_SCROLL_MODE_ID,
      scope: 'page',
      exclusive: false,
      cursor: 'auto',
      wantsRawTouch: false,
    };

    interactionCapability.registerMode(touchScrollMode);

    selectionCapability.enableForMode(TOUCH_SCROLL_MODE_ID, { showRects: true }, activeDocumentId);

    const scope = interactionCapability.forDocument(activeDocumentId);
    if (scope.getActiveMode() !== TOUCH_SCROLL_MODE_ID) {
      scope.activate(TOUCH_SCROLL_MODE_ID);
      logger.debug('activated touch scroll mode');
    }
  }, [activeDocumentId, interactionCapability, selectionCapability]);

  useEffect(() => () => clearLongPressTimer(), [clearLongPressTimer]);

  return {
    lastPointerTypeRef,
    lastTouchSelectionAllowedRef,
    touchGestureRef,
    preventNativeDrag,
    preventMobileContextMenu,
    handlePointerDownCapture,
    handlePointerMoveCapture,
    handlePointerEndCapture,
  };
};
