import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import type { BookOcrStatusResponse } from '@/types';

interface UseReaderOcrFailureNoticeParams {
  ocrStatus: BookOcrStatusResponse | undefined;
}

export const useReaderOcrFailureNotice = ({ ocrStatus }: UseReaderOcrFailureNoticeParams) => {
  const lastFailedAtRef = useRef<string | null>(null);

  useEffect(() => {
    if (!ocrStatus || ocrStatus.status !== 'FAILED') {
      return;
    }

    const failureKey = `${ocrStatus.updatedAt ?? ''}:${ocrStatus.details ?? ''}`;
    if (lastFailedAtRef.current === failureKey) {
      return;
    }
    lastFailedAtRef.current = failureKey;

    if (ocrStatus.details) {
      toast.error(ocrStatus.details);
    }
  }, [ocrStatus]);
};
