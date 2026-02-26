import { createLogger } from '@/lib/logger.ts';

const logger = createLogger('reader-viewport-selection');

interface SelectionScopeLike {
  getState(): { selecting: boolean };
  getBoundingRects(): Array<unknown>;
  clear(): void;
}

interface BindSelectionCleanupListenersParams {
  selectionScope: SelectionScopeLike;
  isDisposed: () => boolean;
  hasNativeSelectionText: () => boolean;
  emitSelection: () => void;
}

export const bindSelectionCleanupListeners = ({
  selectionScope,
  isDisposed,
  hasNativeSelectionText,
  emitSelection,
}: BindSelectionCleanupListenersParams) => {
  const clearStuckSelection = () => {
    window.setTimeout(() => {
      if (isDisposed()) {
        return;
      }

      const state = selectionScope.getState();
      const hasSelectionRects = selectionScope.getBoundingRects().length > 0;
      if (state.selecting && !hasSelectionRects && !hasNativeSelectionText()) {
        logger.debug('cleanup stale selection state');
        selectionScope.clear();
        emitSelection();
      }
    }, 420);
  };

  window.addEventListener('pointerup', clearStuckSelection);
  window.addEventListener('mouseup', clearStuckSelection);
  window.addEventListener('touchend', clearStuckSelection);
  window.addEventListener('dragend', clearStuckSelection);
  window.addEventListener('blur', clearStuckSelection);

  return () => {
    window.removeEventListener('pointerup', clearStuckSelection);
    window.removeEventListener('mouseup', clearStuckSelection);
    window.removeEventListener('touchend', clearStuckSelection);
    window.removeEventListener('dragend', clearStuckSelection);
    window.removeEventListener('blur', clearStuckSelection);
  };
};
