import { useState, useRef, useEffect } from 'react';
import { Upload, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog.tsx';
import { Button } from '@/components/ui/button.tsx';

interface UploadModalProps {
  open: boolean;
  onClose: () => void;
  onUpload: (file: File) => Promise<void> | void;
  isUploading?: boolean;
}

export default function UploadModal({ open, onClose, onUpload, isUploading = false }: UploadModalProps) {
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
    if (!file) return;
    await onUpload(file);
  };

  return (
    <Dialog open={open} onOpenChange={(value) => { if (!value && !isUploading) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload de livro</DialogTitle>
          <DialogDescription>
            Selecione um arquivo PDF ou EPUB para adicionar a sua biblioteca.
          </DialogDescription>
        </DialogHeader>

        <div
          onDragOver={(event) => { event.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragOver(false);
            const droppedFile = event.dataTransfer.files[0];
            if (droppedFile) handleFile(droppedFile);
          }}
          onClick={() => !isUploading && inputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-8 transition-colors ${
            dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/30'
          } ${isUploading ? 'cursor-not-allowed opacity-50' : ''}`}
        >
          {file ? (
            <>
              <FileText className="h-8 w-8 text-primary" />
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">{file.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(1)} MB
                </p>
              </div>
              <button
                onClick={(event) => { event.stopPropagation(); setFile(null); }}
                className="text-xs text-muted-foreground hover:text-foreground"
                disabled={isUploading}
              >
                Remover
              </button>
            </>
          ) : (
            <>
              <Upload className="h-8 w-8 text-muted-foreground" />
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Arraste um arquivo ou <span className="font-medium text-primary">clique para selecionar</span>
                </p>
                <p className="mt-1 text-xs text-muted-foreground/60">PDF ou EPUB</p>
              </div>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.epub"
            className="hidden"
            onChange={(event) => {
              const selectedFile = event.target.files?.[0];
              if (selectedFile) handleFile(selectedFile);
              event.target.value = '';
            }}
            disabled={isUploading}
          />
        </div>

        <div className="mt-2 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={isUploading}>
            Cancelar
          </Button>
          <Button onClick={() => { void handleSubmit(); }} disabled={!file || isUploading}>
            {isUploading ? 'Enviando...' : 'Enviar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
