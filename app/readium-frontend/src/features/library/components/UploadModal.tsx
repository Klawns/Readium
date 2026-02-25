import { useState, useRef, useEffect } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { FileText, Upload, X } from 'lucide-react';
import { Dialog, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog.tsx';
import { Button } from '@/components/ui/button.tsx';
import { cn } from '@/lib/utils.ts';

interface UploadModalProps {
  open: boolean;
  onClose: () => void;
  onUpload: (file: File) => Promise<void> | void;
  isUploading?: boolean;
  uploadProgress?: number | null;
}

export default function UploadModal({
  open,
  onClose,
  onUpload,
  isUploading = false,
  uploadProgress = null,
}: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      setFile(null);
      setDragOver(false);
    }
  }, [open]);

  const handleFile = (nextFile: File) => {
    const ext = nextFile.name.split('.').pop()?.toLowerCase();
    if (ext === 'pdf' || ext === 'epub') {
      setFile(nextFile);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      return;
    }
    await onUpload(file);
  };

  return (
    <Dialog open={open} onOpenChange={(value) => { if (!value && !isUploading) onClose(); }}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className="fixed inset-0 z-50 bg-black/55 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
        />
        <DialogPrimitive.Content
          className={cn(
            'fixed inset-x-4 bottom-4 z-50 w-auto max-h-[calc(100svh-1rem)] overflow-hidden rounded-2xl border border-border/60 bg-background shadow-2xl duration-200',
            'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
            'landscape:inset-x-auto landscape:left-1/2 landscape:top-1/2 landscape:bottom-auto',
            'landscape:w-[min(42rem,calc(100%-2rem))] landscape:translate-x-[-50%] landscape:translate-y-[-50%]',
            'landscape:data-[state=closed]:zoom-out-95 landscape:data-[state=open]:zoom-in-95',
            'landscape:data-[state=closed]:slide-out-to-left-1/2 landscape:data-[state=closed]:slide-out-to-top-[48%]',
            'landscape:data-[state=open]:slide-in-from-left-1/2 landscape:data-[state=open]:slide-in-from-top-[48%]',
            'sm:w-[min(42rem,calc(100%-3rem))] sm:max-h-[calc(100svh-2rem)]',
          )}
        >
          <div className="max-h-[calc(100svh-1rem)] overflow-y-auto p-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] landscape:max-h-[calc(100svh-1rem)] sm:max-h-[calc(100svh-2rem)] sm:p-6 sm:pb-6">
            <DialogHeader>
              <DialogTitle>Adicionar livro</DialogTitle>
              <DialogDescription>
                Selecione um arquivo PDF ou EPUB para incluir na biblioteca.
              </DialogDescription>
            </DialogHeader>

            <div
              onDragOver={(event) => {
                event.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDragOver(false);
                const droppedFile = event.dataTransfer.files[0];
                if (droppedFile) {
                  handleFile(droppedFile);
                }
              }}
              onClick={() => !isUploading && inputRef.current?.click()}
              className={`mt-4 rounded-xl border border-dashed p-5 transition sm:p-6 md:p-8 ${
                dragOver ? 'border-primary bg-primary/5' : 'border-slate-300 bg-slate-50/50 hover:border-slate-400'
              } ${isUploading ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
            >
              <div className="flex flex-col items-center justify-center gap-3 text-center">
                {file ? (
                  <>
                    <div className="rounded-full border border-slate-200 bg-white p-3">
                      <FileText className="h-6 w-6 text-slate-700" />
                    </div>
                    <div className="w-full max-w-full">
                      <p className="break-all text-sm font-medium text-slate-800">{file.name}</p>
                      <p className="mt-1 text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                    </div>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setFile(null);
                      }}
                      className="text-xs text-slate-500 hover:text-slate-700"
                      disabled={isUploading}
                    >
                      Remover arquivo
                    </button>
                  </>
                ) : (
                  <>
                    <div className="rounded-full border border-slate-200 bg-white p-3">
                      <Upload className="h-6 w-6 text-slate-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">
                        Arraste e solte ou <span className="font-medium text-slate-900">clique para selecionar</span>
                      </p>
                      <p className="mt-1 text-xs text-slate-500">Formatos aceitos: PDF, EPUB</p>
                    </div>
                  </>
                )}
              </div>

              <input
                ref={inputRef}
                type="file"
                accept=".pdf,.epub"
                className="hidden"
                onChange={(event) => {
                  const selectedFile = event.target.files?.[0];
                  if (selectedFile) {
                    handleFile(selectedFile);
                  }
                  event.target.value = '';
                }}
                disabled={isUploading}
              />
            </div>

            {isUploading && uploadProgress !== null ? (
              <div className="mt-4 space-y-1">
                <div className="h-1.5 overflow-hidden rounded bg-slate-200">
                  <div
                    className="h-full rounded bg-primary transition-all duration-150"
                    style={{ width: `${Math.max(0, Math.min(100, uploadProgress))}%` }}
                  />
                </div>
                <p className="text-right text-[11px] text-slate-500">{uploadProgress}% enviado</p>
              </div>
            ) : null}

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={onClose} disabled={isUploading}>
                Cancelar
              </Button>
              <Button onClick={() => { void handleSubmit(); }} disabled={!file || isUploading}>
                {isUploading ? `Enviando${uploadProgress !== null ? ` (${uploadProgress}%)` : '...'}` : 'Enviar livro'}
              </Button>
            </div>
          </div>
          
          <DialogPrimitive.Close className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none sm:right-4 sm:top-4">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </Dialog>
  );
}
