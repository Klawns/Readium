import React from 'react';
import { isTouchCapableDevice } from './pdfViewport.utils';

export const usePdfViewportSelectionLayerBackground = (
  showTouchSelectionRects: boolean,
  hasPendingSelectionRects: boolean,
) => {
  const isTouchDevice = React.useMemo(() => isTouchCapableDevice(), []);
  return isTouchDevice && !showTouchSelectionRects && !hasPendingSelectionRects ? 'transparent' : undefined;
};
