import { useEffect, useRef } from 'react';
import type { InteractionManagerCapability, InteractionMode } from '@embedpdf/plugin-interaction-manager/react';
import type { SelectionCapability } from '@embedpdf/plugin-selection/react';
import { createLogger } from '@/lib/logger.ts';
import { TOUCH_SCROLL_MODE_ID } from './pdfViewport.constants';

const logger = createLogger('reader-viewport');

interface UsePdfViewportTouchModeParams {
  activeDocumentId?: string;
  interactionCapability: Readonly<InteractionManagerCapability> | null;
  selectionCapability: Readonly<SelectionCapability> | null;
  onCleanup: () => void;
}

export const usePdfViewportTouchMode = ({
  activeDocumentId,
  interactionCapability,
  selectionCapability,
  onCleanup,
}: UsePdfViewportTouchModeParams) => {
  const registeredInteractionCapabilitiesRef = useRef<WeakSet<object>>(new WeakSet());

  useEffect(() => {
    if (!activeDocumentId || !interactionCapability || !selectionCapability) {
      return;
    }

    const touchScrollMode: InteractionMode = {
      id: TOUCH_SCROLL_MODE_ID,
      scope: 'page',
      exclusive: false,
      cursor: 'auto',
      wantsRawTouch: false,
    };

    if (!registeredInteractionCapabilitiesRef.current.has(interactionCapability as object)) {
      interactionCapability.registerMode(touchScrollMode);
      registeredInteractionCapabilitiesRef.current.add(interactionCapability as object);
    }

    if (!selectionCapability.isEnabledForMode(TOUCH_SCROLL_MODE_ID, activeDocumentId)) {
      selectionCapability.enableForMode(TOUCH_SCROLL_MODE_ID, { showRects: true }, activeDocumentId);
    }

    const scope = interactionCapability.forDocument(activeDocumentId);
    if (scope.getActiveMode() !== TOUCH_SCROLL_MODE_ID) {
      scope.activate(TOUCH_SCROLL_MODE_ID);
      logger.debug('activated touch scroll mode');
    }

    return () => {
      onCleanup();

      const activeScope = interactionCapability.forDocument(activeDocumentId);
      if (activeScope.getActiveMode() === TOUCH_SCROLL_MODE_ID) {
        activeScope.activateDefaultMode();
      }
    };
  }, [activeDocumentId, interactionCapability, onCleanup, selectionCapability]);
};
