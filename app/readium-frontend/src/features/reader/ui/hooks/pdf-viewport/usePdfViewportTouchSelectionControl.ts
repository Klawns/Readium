import { useCallback, useRef, useState } from 'react';
import { createLogger } from '@/lib/logger.ts';

const logger = createLogger('reader-viewport-touch');

export const usePdfViewportTouchSelectionControl = () => {
  const lastTouchSelectionAllowedRef = useRef(false);
  const [showTouchSelectionRects, setShowTouchSelectionRects] = useState(false);
  const [isTouchSelectionLocked, setIsTouchSelectionLocked] = useState(false);

  const resetTouchSelectionControl = useCallback(() => {
    lastTouchSelectionAllowedRef.current = false;
    setShowTouchSelectionRects(false);
    setIsTouchSelectionLocked(false);
    logger.debug('reset touch selection control');
  }, []);

  const allowTouchSelection = useCallback(() => {
    lastTouchSelectionAllowedRef.current = true;
    setShowTouchSelectionRects(true);
    setIsTouchSelectionLocked(true);
    logger.debug('allow touch selection control');
  }, []);

  return {
    lastTouchSelectionAllowedRef,
    showTouchSelectionRects,
    isTouchSelectionLocked,
    resetTouchSelectionControl,
    allowTouchSelection,
  };
};
