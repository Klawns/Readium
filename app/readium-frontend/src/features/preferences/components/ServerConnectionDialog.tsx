import { HardDrive, Loader2, RotateCcw, Save, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs.tsx';
import { cn } from '@/lib/utils.ts';
import { useServerConnectionDialog } from '@/features/preferences/hooks/useServerConnectionDialog.ts';

interface ServerConnectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ServerConnectionDialog = ({ open, onOpenChange }: ServerConnectionDialogProps) => {
  const {
    connectionMode,
    setConnectionMode,
    serverAddress,
    setServerAddress,
    notice,
    isBusy,
    isTesting,
    isSaving,
    isResetting,
    handleTestConnection,
    handleSave,
    handleResetDefault,
  } = useServerConnectionDialog({ open, onOpenChange });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        mobilePosition="bottom"
        className="max-h-[92dvh] w-full overflow-y-auto overflow-x-hidden rounded-t-xl p-4 pb-5 sm:max-h-[min(90vh,48rem)] sm:w-[min(92vw,42rem)] sm:max-w-[42rem] sm:rounded-lg sm:p-6"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 pr-8">
            <Wifi className="h-4 w-4" />
            Servidor mobile
          </DialogTitle>
          <DialogDescription className="break-words pr-8">
            Informe o IP/URL da maquina que esta rodando o Readium. O sufixo <code className="break-all">/api</code>{' '}
            e adicionado automaticamente quando necessario.
          </DialogDescription>
        </DialogHeader>

        <div className="min-w-0 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Modo de execucao</label>
            <Tabs
              value={connectionMode}
              onValueChange={(value) => {
                if (value === 'SERVER' || value === 'LOCAL') {
                  setConnectionMode(value);
                }
              }}
            >
              <TabsList className="grid h-auto min-w-0 w-full grid-cols-2 gap-1">
                <TabsTrigger
                  value="SERVER"
                  className="h-auto min-h-9 min-w-0 whitespace-normal break-words px-2 py-1.5 text-center text-xs leading-tight sm:text-sm"
                >
                  Conectado ao servidor
                </TabsTrigger>
                <TabsTrigger
                  value="LOCAL"
                  className="h-auto min-h-9 min-w-0 whitespace-normal break-words px-2 py-1.5 text-center text-xs leading-tight sm:text-sm"
                >
                  Local no celular
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {connectionMode === 'SERVER' ? (
            <div className="space-y-1.5">
              <label htmlFor="server-address" className="text-sm font-medium">
                IP ou URL do servidor
              </label>
              <Input
                id="server-address"
                className="min-w-0"
                value={serverAddress}
                onChange={(event) => setServerAddress(event.target.value)}
                placeholder="192.168.0.22:7717"
                autoCapitalize="off"
                autoCorrect="off"
                autoComplete="off"
                spellCheck={false}
                disabled={isBusy}
              />
              <p className="break-words text-xs text-muted-foreground">
                Exemplo: <code className="break-all">192.168.0.22:7717</code> ou{' '}
                <code className="break-all">http://192.168.0.22:7717</code>
              </p>
            </div>
          ) : (
            <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
              <p className="flex items-center gap-1.5 font-medium">
                <HardDrive className="h-3.5 w-3.5" />
                Modo local ativo
              </p>
              <p className="mt-1 text-slate-600">
                Colecoes, categorias e insights passam a usar armazenamento local do dispositivo.
              </p>
            </div>
          )}

          {notice && (
            <p
              role="status"
              aria-live="polite"
              className={cn(
                'rounded-md border px-3 py-2 text-xs break-words',
                notice.type === 'success'
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                  : 'border-destructive/30 bg-destructive/10 text-destructive',
              )}
            >
              {notice.message}
            </p>
          )}
        </div>

        <DialogFooter className="flex-col gap-2 border-t pt-4 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <Button
            type="button"
            variant="ghost"
            className="w-full justify-center sm:w-auto sm:justify-start"
            onClick={handleResetDefault}
            disabled={isBusy}
          >
            {isResetting ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
            Restaurar padrao
          </Button>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:justify-end">
            {connectionMode === 'SERVER' ? (
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={handleTestConnection}
                disabled={isBusy}
              >
                {isTesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wifi className="h-4 w-4" />}
                Testar conexao
              </Button>
            ) : null}
            <Button type="button" className="w-full sm:w-auto" onClick={handleSave} disabled={isBusy}>
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Salvar configuracao
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
