import { useCallback } from 'react';
import { toast } from 'sonner';
import { createLogger } from '@/lib/logger.ts';

const logger = createLogger('reader');

export const useReaderTranslationNotifier = () => {
  const notifyGoogleTranslatePopupBlocked = useCallback(() => {
    toast.warning('Nao foi possivel abrir nova aba. Use o link no popup para abrir o Google Tradutor.');
  }, []);

  const notifyAutomaticTranslationUnavailable = useCallback(() => {
    toast.warning('Nao foi possivel traduzir automaticamente esse trecho. Voce pode preencher manualmente.');
  }, []);

  const notifyAutomaticTranslationFailed = useCallback((error: unknown) => {
    logger.error('automatic translation failed', error);
    toast.error('Falha na traducao automatica. Voce pode preencher manualmente.');
  }, []);

  return {
    notifyGoogleTranslatePopupBlocked,
    notifyAutomaticTranslationUnavailable,
    notifyAutomaticTranslationFailed,
  };
};
