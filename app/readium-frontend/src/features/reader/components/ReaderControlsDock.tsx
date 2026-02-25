import React from 'react';
import PageNavigator from './PageNavigator';
import ZoomControls from './ZoomControls';

interface ReaderControlsDockProps {
  currentPage: number;
  totalPages: number;
  zoomLevel: number;
  onPageChange: (page: number) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  isVisible?: boolean;
}

const ReaderControlsDock: React.FC<ReaderControlsDockProps> = ({
  currentPage,
  totalPages,
  zoomLevel,
  onPageChange,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  isVisible = true,
}) => (
  <div
    className={`reader-motion-premium pointer-events-none fixed inset-x-0 bottom-2 z-30 flex justify-center px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] sm:bottom-3 sm:px-4 ${
      isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
    }`}
  >
    <div className={`flex w-fit max-w-full items-center gap-1 bg-transparent p-1 sm:gap-2 sm:p-1.5 ${isVisible ? 'pointer-events-auto' : 'pointer-events-none'}`}>
      <PageNavigator currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
      <ZoomControls zoomLevel={zoomLevel} onZoomOut={onZoomOut} onZoomIn={onZoomIn} onZoomReset={onZoomReset} />
    </div>
  </div>
);

export default ReaderControlsDock;
