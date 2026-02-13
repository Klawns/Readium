import React from 'react';
import { PagePointerProvider } from '@embedpdf/plugin-interaction-manager/react';
import { RenderLayer } from '@embedpdf/plugin-render/react';
import { SelectionLayer } from '@embedpdf/plugin-selection/react';
import { AnnotationLayer } from '@embedpdf/plugin-annotation/react';
import type { ReaderTranslationOverlay } from '../ui/readerTypes';
import type { TranslationOverlayInteractPayload } from '../ui/hooks/pdf-viewport/PdfDocumentViewport.types';
import { VIEWPORT_TOUCH_ACTION } from '../ui/hooks/pdf-viewport/pdfViewport.constants';

interface PdfViewportPageProps {
  activeDocumentId: string;
  pageIndex: number;
  width: number;
  height: number;
  scale?: number;
  pageOverlays: ReaderTranslationOverlay[];
  onTranslationOverlayInteract?: (payload: TranslationOverlayInteractPayload) => void;
  preventNativeDrag: (event: React.DragEvent) => void;
  preventMobileContextMenu: (event: React.MouseEvent) => void;
}

export const PdfViewportPage: React.FC<PdfViewportPageProps> = ({
  activeDocumentId,
  pageIndex,
  width,
  height,
  scale,
  pageOverlays,
  onTranslationOverlayInteract,
  preventNativeDrag,
  preventMobileContextMenu,
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
      style={{
        width: '100%',
        height: '100%',
        touchAction: VIEWPORT_TOUCH_ACTION,
        userSelect: 'text',
        WebkitUserSelect: 'text',
        WebkitTouchCallout: 'none',
        borderRadius: '0.5rem',
        overflow: 'hidden',
        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.08)',
        background: 'white',
        position: 'relative',
      }}
      draggable={false}
      onDragStart={preventNativeDrag}
      onDrop={preventNativeDrag}
      onContextMenu={preventMobileContextMenu}
    >
      <RenderLayer documentId={activeDocumentId} pageIndex={pageIndex} scale={scale} />
      <SelectionLayer documentId={activeDocumentId} pageIndex={pageIndex} />
      <AnnotationLayer documentId={activeDocumentId} pageIndex={pageIndex} />
      <div className="pointer-events-none absolute inset-0 z-20">
        {pageOverlays.map((overlay) => (
          <button
            key={overlay.key}
            type="button"
            className="pointer-events-auto absolute border-b-2 border-blue-700 bg-transparent"
            style={{
              left: `${overlay.rect.x * 100}%`,
              top: `${overlay.rect.y * 100}%`,
              width: `${overlay.rect.width * 100}%`,
              height: `${overlay.rect.height * 100}%`,
            }}
            title={`${overlay.translation.originalText} -> ${overlay.translation.translatedText}`}
            onMouseEnter={(event) =>
              onTranslationOverlayInteract?.({
                translation: overlay.translation,
                position: { x: event.clientX, y: event.clientY },
              })
            }
            onClick={(event) =>
              onTranslationOverlayInteract?.({
                translation: overlay.translation,
                position: { x: event.clientX, y: event.clientY },
              })
            }
          />
        ))}
      </div>
    </PagePointerProvider>
  </div>
);
