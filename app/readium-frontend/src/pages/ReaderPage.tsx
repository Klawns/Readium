import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getBook,
  getBookFileUrl,
  getOcrStatus,
  getTextLayerQuality,
  triggerOcr,
  updateBookStatus,
} from '@/services/bookApi.ts';
import PdfReader from '@/features/reader/components/PdfReader.tsx';
import { BookStatus } from '@/types';
import { toast } from 'sonner';

export default function ReaderPage() {
  const { id } = useParams<{ id: string }>();
  const bookId = Number(id);
  const queryClient = useQueryClient();

  const { data: book, isLoading, error } = useQuery({
    queryKey: ['book', bookId],
    queryFn: () => getBook(bookId),
    enabled: !!bookId,
  });

  const { data: ocrStatus } = useQuery({
    queryKey: ['book', bookId, 'ocr-status'],
    queryFn: () => getOcrStatus(bookId),
    enabled: !!bookId,
    retry: 1,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === 'PENDING' || status === 'RUNNING') {
        return 2000;
      }
      return false;
    },
  });

  const { data: textLayerQuality } = useQuery({
    queryKey: ['book', bookId, 'text-layer-quality'],
    queryFn: () => getTextLayerQuality(bookId),
    enabled: !!bookId && !!ocrStatus,
    retry: 1,
    refetchInterval:
      ocrStatus?.status === 'PENDING' || ocrStatus?.status === 'RUNNING'
        ? 2000
        : false,
  });

  const updateStatusMutation = useMutation({
    mutationFn: (status: BookStatus) => updateBookStatus(bookId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['book', bookId] });
      toast.success('Status atualizado!');
    },
    onError: () => {
      toast.error('Erro ao atualizar status.');
    },
  });

  const triggerOcrMutation = useMutation({
    mutationFn: () => triggerOcr(bookId),
    onSuccess: () => {
      toast.success('OCR iniciado.');
      queryClient.invalidateQueries({ queryKey: ['book', bookId, 'ocr-status'] });
      queryClient.invalidateQueries({ queryKey: ['book', bookId, 'text-layer-quality'] });
    },
    onError: () => {
      toast.error('Erro ao iniciar OCR.');
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <span className="text-sm text-muted-foreground">Carregando livro...</span>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <span className="text-sm text-destructive">Erro ao carregar livro.</span>
      </div>
    );
  }

  if (book.format !== 'PDF') {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <span className="text-sm text-muted-foreground">Formato nao suportado pelo leitor de PDF.</span>
      </div>
    );
  }

  const ocrScore = textLayerQuality?.score ?? ocrStatus?.score ?? null;
  const fileVersion = ocrStatus?.updatedAt ?? null;

  return (
    <div className="h-screen w-full bg-gray-100">
      <PdfReader
        fileUrl={getBookFileUrl(bookId, fileVersion)}
        bookId={bookId}
        initialPage={book.lastReadPage || 1}
        bookStatus={book.status}
        onStatusChange={updateStatusMutation.mutate}
        totalPages={book.pages || 0}
        ocrStatus={ocrStatus?.status}
        ocrScore={ocrScore}
        onTriggerOcr={() => triggerOcrMutation.mutate()}
        isTriggeringOcr={triggerOcrMutation.isPending}
      />
    </div>
  );
}
