import { useEffect } from 'react';
import type { AnnotationCapability } from '@embedpdf/plugin-annotation/react';
import type { ScrollCapability } from '@embedpdf/plugin-scroll/react';
import {
  PdfActionType,
  PdfAnnotationSubtype,
  type PdfDestinationObject,
  type PdfLinkAnnoObject,
  type PdfLinkTarget,
} from '@embedpdf/models';
import { createLogger } from '@/lib/logger.ts';

interface UsePdfViewportLinkNavigationParams {
  annotationCapability: Readonly<AnnotationCapability> | null;
  scrollCapability: Readonly<ScrollCapability> | null;
  activeDocumentId?: string;
}

const logger = createLogger('reader-viewport-link-navigation');

const toPageNumber = (destination: PdfDestinationObject, totalPages: number): number => {
  const destinationPage = destination.pageIndex + 1;
  if (totalPages <= 0) {
    return Math.max(1, destinationPage);
  }
  return Math.min(Math.max(destinationPage, 1), totalPages);
};

const openExternalUri = (uri: string): boolean => {
  const normalized = uri.trim();
  if (!normalized) {
    return false;
  }

  if (/^javascript:/i.test(normalized)) {
    logger.warn('blocked unsafe javascript URI in PDF link', { uri: normalized });
    return false;
  }

  const openedWindow = window.open(normalized, '_blank', 'noopener,noreferrer');
  return openedWindow !== null;
};

const navigateLinkTarget = (
  target: PdfLinkTarget | undefined,
  navigateToDestination: (destination: PdfDestinationObject) => void,
): boolean => {
  if (!target) {
    return false;
  }

  if (target.type === 'destination') {
    navigateToDestination(target.destination);
    return true;
  }

  if (target.action.type === PdfActionType.Goto || target.action.type === PdfActionType.RemoteGoto) {
    navigateToDestination(target.action.destination);
    return true;
  }

  if (target.action.type === PdfActionType.URI) {
    return openExternalUri(target.action.uri);
  }

  return false;
};

export const usePdfViewportLinkNavigation = ({
  annotationCapability,
  scrollCapability,
  activeDocumentId,
}: UsePdfViewportLinkNavigationParams) => {
  useEffect(() => {
    if (!annotationCapability || !scrollCapability || !activeDocumentId) {
      return;
    }

    const annotationScope = annotationCapability.forDocument(activeDocumentId);
    const scrollScope = scrollCapability.forDocument(activeDocumentId);
    let resetSelectionTimer: number | null = null;
    let lastHandledSelection = '';

    const clearResetSelectionTimer = () => {
      if (resetSelectionTimer === null) {
        return;
      }
      window.clearTimeout(resetSelectionTimer);
      resetSelectionTimer = null;
    };

    const scheduleSelectionReset = (annotationId: string) => {
      clearResetSelectionTimer();
      resetSelectionTimer = window.setTimeout(() => {
        const selectedIds = annotationScope.getSelectedAnnotationIds();
        if (selectedIds.length === 1 && selectedIds[0] === annotationId) {
          annotationScope.deselectAnnotation();
        }
      }, 0);
    };

    const navigateToDestination = (destination: PdfDestinationObject) => {
      const pageNumber = toPageNumber(destination, scrollScope.getTotalPages());
      scrollScope.scrollToPage({
        pageNumber,
        behavior: 'smooth',
        alignY: 4,
      });
    };

    const unsubscribe = annotationScope.onStateChange((state) => {
      const selectedIds = state.selectedUids;
      if (selectedIds.length !== 1) {
        lastHandledSelection = '';
        return;
      }

      const selectedId = selectedIds[0];
      if (selectedId === lastHandledSelection) {
        return;
      }

      const selectedAnnotation = annotationScope.getAnnotationById(selectedId);
      if (!selectedAnnotation || selectedAnnotation.object.type !== PdfAnnotationSubtype.LINK) {
        lastHandledSelection = '';
        return;
      }

      const didNavigate = navigateLinkTarget(
        (selectedAnnotation.object as PdfLinkAnnoObject).target,
        navigateToDestination,
      );

      if (!didNavigate) {
        return;
      }

      lastHandledSelection = selectedId;
      scheduleSelectionReset(selectedId);
    });

    return () => {
      clearResetSelectionTimer();
      unsubscribe();
    };
  }, [annotationCapability, scrollCapability, activeDocumentId]);
};
