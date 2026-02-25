import React from 'react';
import type { ReaderAnnotation, ReaderRect } from '../domain/models';
import type { AnnotationOverlayInteractPayload } from '../ui/hooks/pdf-viewport/PdfDocumentViewport.types';
import { PdfViewportRectButton } from './PdfViewportRectButton';

interface PdfViewportAnnotationOverlaysProps {
  annotations: ReaderAnnotation[];
  onInteract?: (payload: AnnotationOverlayInteractPayload) => void;
}

interface AnnotationRectOverlay {
  key: string;
  annotation: ReaderAnnotation;
  rect: ReaderRect;
}

const buildAnnotationRectOverlays = (annotations: ReaderAnnotation[]): AnnotationRectOverlay[] =>
  annotations.flatMap((annotation) =>
    annotation.rects.map((rect, index) => ({
      key: `annotation-${annotation.id}-${index}`,
      annotation,
      rect,
    })),
  );

export const PdfViewportAnnotationOverlays: React.FC<PdfViewportAnnotationOverlaysProps> = ({
  annotations,
  onInteract,
}) => {
  const rectOverlays = React.useMemo(() => buildAnnotationRectOverlays(annotations), [annotations]);

  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      {rectOverlays.map((overlay) => (
        <PdfViewportRectButton
          key={overlay.key}
          rect={overlay.rect}
          className="bg-transparent"
          title="Adicionar/editar anotacao"
          onClick={(event) =>
            onInteract?.({
              annotation: overlay.annotation,
              position: { x: event.clientX, y: event.clientY },
            })
          }
        />
      ))}
    </div>
  );
};
