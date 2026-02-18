import { useEffect } from 'react';
import { toast } from 'sonner';
import { copyTextToClipboard } from './readerClipboard';

interface UseReaderCopyShortcutParams {
  containerRef: React.RefObject<HTMLDivElement | null>;
  pendingSelectionText?: string;
  onCopyPendingSelection: () => Promise<void>;
}

const isEditableTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  if (target.isContentEditable) {
    return true;
  }
  const tagName = target.tagName.toLowerCase();
  return tagName === 'input' || tagName === 'textarea';
};

const hasSelectionInsideContainer = (
  selection: Selection,
  container: HTMLDivElement | null,
): boolean => {
  if (!container) {
    return false;
  }

  const anchorNode = selection.anchorNode;
  const focusNode = selection.focusNode;
  return Boolean(
    (anchorNode && container.contains(anchorNode))
      || (focusNode && container.contains(focusNode)),
  );
};

export const useReaderCopyShortcut = ({
  containerRef,
  pendingSelectionText,
  onCopyPendingSelection,
}: UseReaderCopyShortcutParams) => {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const isCopyShortcut = (event.ctrlKey || event.metaKey) && !event.shiftKey && event.key.toLowerCase() === 'c';
      if (!isCopyShortcut || isEditableTarget(event.target)) {
        return;
      }

      if (pendingSelectionText?.trim()) {
        event.preventDefault();
        void onCopyPendingSelection();
        return;
      }

      const selection = window.getSelection();
      const selectedText = selection?.toString().trim() ?? '';
      if (!selection || !selectedText) {
        return;
      }

      if (!hasSelectionInsideContainer(selection, containerRef.current)) {
        return;
      }

      event.preventDefault();
      void copyTextToClipboard(selectedText)
        .then((copied) => {
          if (!copied) {
            toast.error('Nao foi possivel copiar o texto selecionado.');
          }
        })
        .catch(() => {
          toast.error('Nao foi possivel copiar o texto selecionado.');
        });
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [containerRef, onCopyPendingSelection, pendingSelectionText]);
};
