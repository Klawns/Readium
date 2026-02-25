import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import type { CreateTranslationCommand } from '../../domain/ports/TranslationRepository';
import {
  getBookTranslationsUseCase,
  persistTranslationUseCase,
  translateSelectionUseCase,
} from '../../application/use-cases/translation-use-case-factory';

export const useReaderTranslationsData = (bookId: number) => {
  const queryClient = useQueryClient();
  const translationsQueryKey = queryKeys.readerTranslations(bookId);

  const translationsQuery = useQuery({
    queryKey: translationsQueryKey,
    queryFn: () => getBookTranslationsUseCase.execute(bookId),
    enabled: Number.isFinite(bookId) && bookId > 0,
    staleTime: 20_000,
    retry: 1,
  });

  const autoTranslateMutation = useMutation({
    mutationFn: (selectedText: string) => translateSelectionUseCase.execute(selectedText),
    retry: 1,
  });

  const persistTranslationMutation = useMutation<unknown, Error, CreateTranslationCommand>({
    mutationFn: async (input: CreateTranslationCommand) => persistTranslationUseCase.execute(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: translationsQueryKey });
    },
  });

  const persistTranslation: (input: CreateTranslationCommand) => Promise<unknown> = (input) =>
    persistTranslationMutation.mutateAsync(input);

  const translatedDictionary = useMemo(() => {
    const dictionary = new Map<string, string>();
    for (const item of translationsQuery.data ?? []) {
      dictionary.set(item.originalText.trim().toLowerCase(), item.translatedText);
    }
    return dictionary;
  }, [translationsQuery.data]);

  return {
    translations: translationsQuery.data ?? [],
    translatedDictionary,
    isLoading: translationsQuery.isLoading,
    autoTranslate: autoTranslateMutation.mutateAsync,
    persistTranslation,
    isTranslating: autoTranslateMutation.isPending || persistTranslationMutation.isPending,
  };
};
