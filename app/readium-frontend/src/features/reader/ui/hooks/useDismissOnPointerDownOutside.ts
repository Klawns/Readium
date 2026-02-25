import { useEffect } from 'react';
import type { RefObject } from 'react';

export const useDismissOnPointerDownOutside = <T extends HTMLElement>(
  ref: RefObject<T | null>,
  onDismiss: () => void,
) => {
  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const targetNode = event.target;
      if (!(targetNode instanceof Node)) {
        return;
      }

      if (ref.current && !ref.current.contains(targetNode)) {
        onDismiss();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [onDismiss, ref]);
};
