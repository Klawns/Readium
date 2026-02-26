import { useEffect, useMemo, useRef } from 'react';
import { createLogger } from '@/lib/logger.ts';
import {
  HORIZONTAL_PAN_LOCK_MIN_ZOOM,
  VIEWPORT_TOUCH_ACTION,
  VIEWPORT_TOUCH_ACTION_SELECTION_LOCK,
  VIEWPORT_TOUCH_ACTION_VERTICAL_ONLY,
} from './pdfViewport.constants';
import { isTouchCapableDevice } from './pdfViewport.utils';

interface UsePdfViewportTouchActionParams {
  currentZoomLevel: number;
  isTouchSelectionLocked: boolean;
}

const logger = createLogger('reader-viewport-touch');

export const usePdfViewportTouchAction = ({
  currentZoomLevel,
  isTouchSelectionLocked,
}: UsePdfViewportTouchActionParams) => {
  const lastResolvedTouchActionRef = useRef<string | null>(null);

  const touchAction = useMemo(() => {
    if (!isTouchCapableDevice()) {
      return VIEWPORT_TOUCH_ACTION;
    }

    if (currentZoomLevel >= HORIZONTAL_PAN_LOCK_MIN_ZOOM) {
      return VIEWPORT_TOUCH_ACTION_VERTICAL_ONLY;
    }

    return isTouchSelectionLocked ? VIEWPORT_TOUCH_ACTION_SELECTION_LOCK : VIEWPORT_TOUCH_ACTION;
  }, [currentZoomLevel, isTouchSelectionLocked]);

  useEffect(() => {
    if (lastResolvedTouchActionRef.current === touchAction) {
      return;
    }

    lastResolvedTouchActionRef.current = touchAction;
    logger.debug('resolved viewport touch action', {
      touchAction,
      zoomLevel: currentZoomLevel,
      isTouchSelectionLocked,
      horizontalPanLockActive: currentZoomLevel >= HORIZONTAL_PAN_LOCK_MIN_ZOOM,
      lockMinZoom: HORIZONTAL_PAN_LOCK_MIN_ZOOM,
    });
  }, [currentZoomLevel, isTouchSelectionLocked, touchAction]);

  return touchAction;
};
