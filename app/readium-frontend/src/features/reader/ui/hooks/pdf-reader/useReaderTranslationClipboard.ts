import { useCallback } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { toast } from 'sonner';
import type { PendingSelection } from '../../readerTypes';
import { copyTextToClipboard } from './readerClipboard';

interface UseReaderTranslationClipboardParams {
  pendingSelection: PendingSelection | null;
  setPendingSelection: Dispatch<SetStateAction<PendingSelection | null>>;
}

export const useReaderTranslationClipboard = ({
  pendingSelection,
  setPendingSelection,
}: UseReaderTranslationClipboardParams) => {
  const copyPendingSelection = useCallback(async () => {
    if (!pendingSelection) {
      return;
    }

    try {
      const copied = await copyTextToClipboard(pendingSelection.text);
      if (copied) {
        toast.success('Texto copiado.');
        setPendingSelection(null);
        return;
      }
    } catch {
      // Fallback message below.
    }

    toast.error('Nao foi possivel copiar o texto selecionado.');
  }, [pendingSelection, setPendingSelection]);

  const clearPendingSelection = useCallback(() => {
    setPendingSelection(null);
  }, [setPendingSelection]);

  return {
    copyPendingSelection,
    clearPendingSelection,
  };
};
