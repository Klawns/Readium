import { useEffect, useRef } from 'react';
import type { InteractionManagerCapability, InteractionMode } from '@embedpdf/plugin-interaction-manager/react';
import type { SelectionCapability } from '@embedpdf/plugin-selection/react';
import { createLogger } from '@/lib/logger.ts';
import { TOUCH_SCROLL_MODE_ID, TOUCH_SELECTION_MODE_ID } from './pdfViewport.constants';

const logger = createLogger('reader-viewport');

interface UsePdfViewportTouchModeParams {
  activeDocumentId?: string;
  interactionCapability: Readonly<InteractionManagerCapability> | null;
  selectionCapability: Readonly<SelectionCapability> | null;
  isTouchSelectionModeEnabled: boolean;
  onCleanup: () => void;
}

export const usePdfViewportTouchMode = ({
  activeDocumentId,
  interactionCapability,
  selectionCapability,
  isTouchSelectionModeEnabled,
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
    const touchSelectionMode: InteractionMode = {
      id: TOUCH_SELECTION_MODE_ID,
      scope: 'page',
      exclusive: false,
      cursor: 'text',
      wantsRawTouch: true,
    };

    if (!registeredInteractionCapabilitiesRef.current.has(interactionCapability as object)) {
      interactionCapability.registerMode(touchScrollMode);
      interactionCapability.registerMode(touchSelectionMode);
      registeredInteractionCapabilitiesRef.current.add(interactionCapability as object);
      logger.debug('registered touch scroll mode', {
        modeId: TOUCH_SCROLL_MODE_ID,
        wantsRawTouch: touchScrollMode.wantsRawTouch,
      });
      logger.debug('registered touch selection mode', {
        modeId: TOUCH_SELECTION_MODE_ID,
        wantsRawTouch: touchSelectionMode.wantsRawTouch,
      });
    }

    selectionCapability.enableForMode(TOUCH_SELECTION_MODE_ID, { showRects: true }, activeDocumentId);
    logger.debug('enabled selection for touch selection mode', {
      modeId: TOUCH_SELECTION_MODE_ID,
      activeDocumentId,
      showRects: true,
    });

    const scope = interactionCapability.forDocument(activeDocumentId);
    const targetMode = isTouchSelectionModeEnabled ? TOUCH_SELECTION_MODE_ID : TOUCH_SCROLL_MODE_ID;
    if (scope.getActiveMode() !== targetMode) {
      scope.activate(targetMode);
      logger.debug('activated touch interaction mode', {
        activeDocumentId,
        modeId: targetMode,
      });
    }

    return () => {
      onCleanup();

      const activeScope = interactionCapability.forDocument(activeDocumentId);
      const activeMode = activeScope.getActiveMode();
      if (activeMode === TOUCH_SCROLL_MODE_ID || activeMode === TOUCH_SELECTION_MODE_ID) {
        activeScope.activateDefaultMode();
        logger.debug('restored default interaction mode on cleanup', { activeDocumentId });
      }
    };
  }, [
    activeDocumentId,
    interactionCapability,
    isTouchSelectionModeEnabled,
    onCleanup,
    selectionCapability,
  ]);
};
