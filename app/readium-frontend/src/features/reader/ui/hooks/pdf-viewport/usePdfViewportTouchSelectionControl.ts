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

  return {
    lastTouchSelectionAllowedRef,
    showTouchSelectionRects,
    resetTouchSelectionControl,
    allowTouchSelection,
  };
};
