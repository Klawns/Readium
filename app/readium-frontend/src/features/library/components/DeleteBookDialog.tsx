import React from 'react';
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog.tsx';
import { useIsMobile } from '@/hooks/use-mobile.tsx';

interface DeleteBookDialogProps {
  open: boolean;
  bookTitle: string | null;
  isDeleting: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmDelete: () => Promise<void> | void;
}

const useIsPortrait = () => {
  const [isPortrait, setIsPortrait] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia('(orientation: portrait)');
    const handleChange = () => setIsPortrait(mediaQuery.matches);
    handleChange();

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return isPortrait;
};

export const DeleteBookDialog: React.FC<DeleteBookDialogProps> = ({
  open,
  bookTitle,
  isDeleting,
  onOpenChange,
  onConfirmDelete,
}) => {
  const isMobile = useIsMobile();
  const isPortrait = useIsPortrait();
  const shouldShiftDownForMobilePortrait = isMobile && isPortrait;

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (isDeleting) {
          return;
        }
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent
        mobilePosition="center"
        className={`w-[min(92vw,28rem)] rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 ${
          shouldShiftDownForMobilePortrait ? 'top-[68%]' : ''
        }`}
      >
        <DialogHeader className="space-y-2 text-left">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-600">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <DialogTitle className="text-base sm:text-lg">Apagar livro</DialogTitle>
          <DialogDescription className="text-sm text-slate-600">
            Essa acao remove permanentemente o livro <strong className="text-slate-900">"{bookTitle ?? ''}"</strong>.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-2 gap-2 sm:mt-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => {
              void onConfirmDelete();
            }}
            disabled={isDeleting}
            className="w-full sm:w-auto"
          >
            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            {isDeleting ? 'Apagando...' : 'Confirmar exclusao'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
