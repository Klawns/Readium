import React from 'react';
import { isTouchCapableDevice } from './pdfViewport.utils';

export const usePdfViewportSelectionLayerBackground = (showTouchSelectionRects: boolean) => {
  const isTouchDevice = React.useMemo(() => isTouchCapableDevice(), []);
  return isTouchDevice && !showTouchSelectionRects ? 'transparent' : undefined;
};
