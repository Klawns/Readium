import { useMemo } from 'react';
import { VIEWPORT_TOUCH_ACTION, VIEWPORT_TOUCH_ACTION_SELECTION_LOCK } from './pdfViewport.constants';
import { isTouchCapableDevice } from './pdfViewport.utils';

interface UsePdfViewportTouchActionParams {
  currentZoomLevel: number;
}

export const usePdfViewportTouchAction = ({
  currentZoomLevel: _currentZoomLevel,
}: UsePdfViewportTouchActionParams) =>
  useMemo(() => {
    if (!isTouchCapableDevice()) {
      return VIEWPORT_TOUCH_ACTION;
    }

    // Keep horizontal pan disabled on touch devices to avoid browser gesture
    // arbitration blocking long-press drag selection.
    return VIEWPORT_TOUCH_ACTION_SELECTION_LOCK;
  }, []);
