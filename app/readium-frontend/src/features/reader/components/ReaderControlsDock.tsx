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
}

const ReaderControlsDock: React.FC<ReaderControlsDockProps> = ({
  currentPage,
  totalPages,
  zoomLevel,
  onPageChange,
  onZoomIn,
  onZoomOut,
  onZoomReset,
}) => (
  <div className="pointer-events-none absolute inset-x-0 bottom-2 z-30 flex justify-center px-2 pb-[env(safe-area-inset-bottom)] sm:bottom-4 sm:px-4">
    <div className="pointer-events-auto flex w-fit max-w-full items-center gap-1 rounded-full border border-border/70 bg-background/85 p-1 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/75 sm:gap-2 sm:p-1.5">
      <PageNavigator currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
      <ZoomControls zoomLevel={zoomLevel} onZoomOut={onZoomOut} onZoomIn={onZoomIn} onZoomReset={onZoomReset} />
    </div>
  </div>
);

export default ReaderControlsDock;
