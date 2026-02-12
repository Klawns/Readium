import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AnnotationHttpRepository } from '../../infrastructure/api/annotation-http-repository';
import { TranslationHttpRepository } from '../../infrastructure/api/translation-http-repository';
import { BackendTranslationProvider } from '../../infrastructure/translation/backend-translation-provider';
import {
  CreateAnnotationUseCase,
  DeleteAnnotationUseCase,
  UpdateAnnotationUseCase,
} from '../../application/use-cases/annotation-use-cases';
import {
  PersistTranslationUseCase,
  TranslateSelectionUseCase,
} from '../../application/use-cases/translation-use-cases';
import type { ReaderRect } from '../../domain/models';

const annotationRepository = new AnnotationHttpRepository();
const translationRepository = new TranslationHttpRepository();
const translationProvider = new BackendTranslationProvider();

const createAnnotationUseCase = new CreateAnnotationUseCase(annotationRepository);
const updateAnnotationUseCase = new UpdateAnnotationUseCase(annotationRepository);
const deleteAnnotationUseCase = new DeleteAnnotationUseCase(annotationRepository);

const translateSelectionUseCase = new TranslateSelectionUseCase(translationProvider);
const persistTranslationUseCase = new PersistTranslationUseCase(translationRepository);

interface CreateReaderAnnotationInput {
  bookId: number;
  page: number;
  rects: ReaderRect[];
  color: string;
  selectedText: string;
  note?: string;
}

export const useReaderData = (bookId: number, currentPage: number) => {
  const queryClient = useQueryClient();
  const annotationsQueryKey = ['reader', 'annotations', bookId] as const;
  const pageAnnotationsQueryKey = ['reader', 'annotations', bookId, 'page', currentPage] as const;
  const translationsQueryKey = ['reader', 'translations', bookId] as const;

  const annotationsQuery = useQuery({
    queryKey: annotationsQueryKey,
    queryFn: () => annotationRepository.getByBook(bookId),
    enabled: Number.isFinite(bookId) && bookId > 0,
    staleTime: 5_000,
    retry: 2,
  });

  const pageAnnotationsQuery = useQuery({
    queryKey: pageAnnotationsQueryKey,
    queryFn: () => annotationRepository.getByBookAndPage(bookId, currentPage),
    enabled: Number.isFinite(bookId) && bookId > 0 && currentPage > 0,
    staleTime: 2_000,
    retry: 2,
  });

  const translationsQuery = useQuery({
    queryKey: translationsQueryKey,
    queryFn: () => translationRepository.getByBook(bookId),
    enabled: Number.isFinite(bookId) && bookId > 0,
    staleTime: 5_000,
    retry: 2,
  });

  const createAnnotationMutation = useMutation({
    mutationFn: (input: CreateReaderAnnotationInput) => createAnnotationUseCase.execute(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: annotationsQueryKey });
      queryClient.invalidateQueries({ queryKey: pageAnnotationsQueryKey });
    },
  });

  const updateAnnotationMutation = useMutation({
    mutationFn: updateAnnotationUseCase.execute.bind(updateAnnotationUseCase),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: annotationsQueryKey });
      queryClient.invalidateQueries({ queryKey: pageAnnotationsQueryKey });
    },
  });

  const deleteAnnotationMutation = useMutation({
    mutationFn: deleteAnnotationUseCase.execute.bind(deleteAnnotationUseCase),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: annotationsQueryKey });
      queryClient.invalidateQueries({ queryKey: pageAnnotationsQueryKey });
    },
  });

  const autoTranslateMutation = useMutation({
    mutationFn: (selectedText: string) => translateSelectionUseCase.execute(selectedText),
    retry: 1,
  });

  const persistTranslationMutation = useMutation({
    mutationFn: persistTranslationUseCase.execute.bind(persistTranslationUseCase),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: translationsQueryKey });
    },
  });

  const translatedDictionary = useMemo(() => {
    const dictionary = new Map<string, string>();
    for (const item of translationsQuery.data ?? []) {
      dictionary.set(item.originalText.trim().toLowerCase(), item.translatedText);
    }
    return dictionary;
  }, [translationsQuery.data]);

  return {
    annotations: annotationsQuery.data ?? [],
    pageAnnotations: pageAnnotationsQuery.data ?? [],
    translations: translationsQuery.data ?? [],
    translatedDictionary,
    isLoading: annotationsQuery.isLoading || translationsQuery.isLoading,
    isPageLoading: pageAnnotationsQuery.isLoading,
    createAnnotation: createAnnotationMutation.mutateAsync,
    updateAnnotation: updateAnnotationMutation.mutateAsync,
    deleteAnnotation: deleteAnnotationMutation.mutateAsync,
    autoTranslate: autoTranslateMutation.mutateAsync,
    persistTranslation: persistTranslationMutation.mutateAsync,
    isTranslating: autoTranslateMutation.isPending || persistTranslationMutation.isPending,
  };
};
