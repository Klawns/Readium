import { useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';

interface UseReaderOcrHintParams {
  fileUrl: string;
}

export const useReaderOcrHint = ({ fileUrl }: UseReaderOcrHintParams) => {
  const shownByFileRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    shownByFileRef.current.delete(fileUrl);
  }, [fileUrl]);

  const handleTextLayerQualityEvaluated = useCallback(
    (lowTextLayerQuality: boolean) => {
      if (!lowTextLayerQuality || shownByFileRef.current.has(fileUrl)) {
        return;
      }

      toast.warning('Este PDF parece ter OCR fraco. A selecao pode ficar imprecisa em alguns trechos.');
      shownByFileRef.current.add(fileUrl);
    },
    [fileUrl],
  );

  return { handleTextLayerQualityEvaluated };
};
