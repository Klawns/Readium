import { useCallback, useRef, useState } from 'react';

export const usePdfViewportTouchSelectionControl = () => {
  const lastTouchSelectionAllowedRef = useRef(false);
  const [showTouchSelectionRects, setShowTouchSelectionRects] = useState(false);

  const resetTouchSelectionControl = useCallback(() => {
    lastTouchSelectionAllowedRef.current = false;
    setShowTouchSelectionRects(false);
  }, []);

  const allowTouchSelection = useCallback(() => {
    lastTouchSelectionAllowedRef.current = true;
    setShowTouchSelectionRects(true);
  }, []);

  const lockTouchSelectionOnNextTick = useCallback(() => {
    window.setTimeout(() => {
      lastTouchSelectionAllowedRef.current = false;
    }, 0);
  }, []);

  return {
    lastTouchSelectionAllowedRef,
    showTouchSelectionRects,
    resetTouchSelectionControl,
    allowTouchSelection,
    lockTouchSelectionOnNextTick,
  };
};
