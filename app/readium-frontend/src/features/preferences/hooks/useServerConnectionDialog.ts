import { useEffect, useState } from 'react';
import { useQueryClient, type QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getConnectionMode,
  resetConnectionMode,
  saveConnectionMode,
  type ConnectionMode,
} from '@/features/preferences/application/services/connection-mode-service.ts';
import {
  getServerAddressInputValue,
  resolveApiBaseUrlFromServerAddress,
  restoreDefaultServerApiBaseUrl,
  saveServerApiBaseUrl,
  testServerConnection,
} from '@/features/preferences/application/services/server-connection-service.ts';

type ConnectionNotice = {
  type: 'success' | 'error';
  message: string;
};

type PendingAction = 'save' | 'test' | 'reset' | null;

interface UseServerConnectionDialogOptions {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return fallback;
};

const refreshServerBackedData = async (queryClient: QueryClient): Promise<void> => {
  await queryClient.invalidateQueries({ refetchType: 'active' });
};

export const useServerConnectionDialog = ({ open, onOpenChange }: UseServerConnectionDialogOptions) => {
  const queryClient = useQueryClient();
  const [connectionMode, setConnectionMode] = useState<ConnectionMode>(() => getConnectionMode());
  const [serverAddress, setServerAddress] = useState(() => getServerAddressInputValue());
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [notice, setNotice] = useState<ConnectionNotice | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    setConnectionMode(getConnectionMode());
    setServerAddress(getServerAddressInputValue());
    setNotice(null);
  }, [open]);

  const resolveApiBaseUrl = (): string => resolveApiBaseUrlFromServerAddress(serverAddress);

  const handleTestConnection = async (): Promise<void> => {
    setPendingAction('test');
    setNotice(null);

    try {
      const apiBaseUrl = resolveApiBaseUrl();
      const status = await testServerConnection(apiBaseUrl);
      setNotice({
        type: 'success',
        message: `Conexao validada com sucesso (HTTP ${status}).`,
      });
    } catch (error: unknown) {
      setNotice({
        type: 'error',
        message: getErrorMessage(error, 'Falha ao conectar ao servidor informado.'),
      });
    } finally {
      setPendingAction(null);
    }
  };

  const handleSave = async (): Promise<void> => {
    setPendingAction('save');
    setNotice(null);

    try {
      if (connectionMode === 'LOCAL') {
        saveConnectionMode('LOCAL');
      } else {
        const apiBaseUrl = resolveApiBaseUrl();
        saveServerApiBaseUrl(apiBaseUrl);
        saveConnectionMode('SERVER');
      }
      await refreshServerBackedData(queryClient);
      toast.success(connectionMode === 'LOCAL' ? 'Modo local ativado.' : 'Servidor atualizado.');
      onOpenChange(false);
    } catch (error: unknown) {
      const message = getErrorMessage(error, 'Falha ao salvar configuracao do servidor.');
      setNotice({ type: 'error', message });
      toast.error(message);
    } finally {
      setPendingAction(null);
    }
  };

  const handleResetDefault = async (): Promise<void> => {
    setPendingAction('reset');

    try {
      restoreDefaultServerApiBaseUrl();
      const mode = resetConnectionMode();
      await refreshServerBackedData(queryClient);
      setConnectionMode(mode);
      setServerAddress(getServerAddressInputValue());
      setNotice({
        type: 'success',
        message: 'Configuracao padrao restaurada.',
      });
      toast.success('Configuracao padrao restaurada.');
    } catch (error: unknown) {
      const message = getErrorMessage(error, 'Nao foi possivel restaurar a configuracao padrao.');
      setNotice({
        type: 'error',
        message,
      });
      toast.error(message);
    } finally {
      setPendingAction(null);
    }
  };

  return {
    connectionMode,
    setConnectionMode,
    serverAddress,
    setServerAddress,
    notice,
    isBusy: pendingAction !== null,
    isTesting: pendingAction === 'test',
    isSaving: pendingAction === 'save',
    isResetting: pendingAction === 'reset',
    handleTestConnection,
    handleSave,
    handleResetDefault,
  };
};
