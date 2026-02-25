import React from 'react';
import { PagePointerProvider } from '@embedpdf/plugin-interaction-manager/react';
import { RenderLayer } from '@embedpdf/plugin-render/react';
import { SelectionLayer } from '@embedpdf/plugin-selection/react';
import { AnnotationLayer } from '@embedpdf/plugin-annotation/react';

interface PdfViewportPageSurfaceProps {
  activeDocumentId: string;
  pageIndex: number;
  width: number;
  height: number;
  scale?: number;
  touchAction: string;
  selectionLayerBackground?: string;
  preventNativeDrag: (event: React.DragEvent) => void;
  preventMobileContextMenu: (event: React.MouseEvent) => void;
  children: React.ReactNode;
}

const pagePointerProviderStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  userSelect: 'text',
  WebkitUserSelect: 'text',
  WebkitTouchCallout: 'none',
  borderRadius: '0.625rem',
  overflow: 'hidden',
  border: '1px solid rgba(15, 23, 42, 0.08)',
  boxShadow: '0 18px 32px -28px rgba(15, 23, 42, 0.65)',
  background: 'white',
  position: 'relative',
};

export const PdfViewportPageSurface: React.FC<PdfViewportPageSurfaceProps> = ({
  activeDocumentId,
  pageIndex,
  width,
  height,
  scale,
  touchAction,
  selectionLayerBackground,
  preventNativeDrag,
  preventMobileContextMenu,
  children,
}) => (
  <div
    data-reader-page-index={pageIndex}
    style={{ width, height, position: 'relative', boxSizing: 'border-box' }}
    draggable={false}
    onDragStart={preventNativeDrag}
    onDrop={preventNativeDrag}
    onContextMenu={preventMobileContextMenu}
  >
    <PagePointerProvider
      documentId={activeDocumentId}
      pageIndex={pageIndex}
      scale={scale}
      style={{ ...pagePointerProviderStyle, touchAction }}
      draggable={false}
      onDragStart={preventNativeDrag}
      onDrop={preventNativeDrag}
      onContextMenu={preventMobileContextMenu}
    >
      <RenderLayer documentId={activeDocumentId} pageIndex={pageIndex} scale={scale} />
      <SelectionLayer documentId={activeDocumentId} pageIndex={pageIndex} background={selectionLayerBackground} />
      <AnnotationLayer documentId={activeDocumentId} pageIndex={pageIndex} />
      {children}
    </PagePointerProvider>
  </div>
);
