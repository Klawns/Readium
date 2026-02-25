import {
  useActiveDocument,
  useDocumentManagerCapability,
} from '@embedpdf/plugin-document-manager/react';
import { useScrollCapability } from '@embedpdf/plugin-scroll/react';
import { useInteractionManagerCapability } from '@embedpdf/plugin-interaction-manager/react';
import { useSelectionCapability } from '@embedpdf/plugin-selection/react';
import { useAnnotationCapability } from '@embedpdf/plugin-annotation/react';

export const usePdfViewportCapabilities = () => {
  const { provides: documentManager } = useDocumentManagerCapability();
  const { activeDocumentId, activeDocument } = useActiveDocument();
  const { provides: selectionCapability } = useSelectionCapability();
  const { provides: annotationCapability } = useAnnotationCapability();
  const { provides: scrollCapability } = useScrollCapability();
  const { provides: interactionCapability } = useInteractionManagerCapability();

  return {
    documentManager: documentManager ?? null,
    activeDocumentId,
    activeDocument: activeDocument ?? null,
    selectionCapability: selectionCapability ?? null,
    annotationCapability: annotationCapability ?? null,
    scrollCapability: scrollCapability ?? null,
    interactionCapability: interactionCapability ?? null,
  };
};
