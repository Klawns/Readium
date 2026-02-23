import { httpClient } from './http';
import type { ReadingCollection } from '@/types';
import { ReadingCollectionListSchema, ReadingCollectionSchema } from './schemas.ts';

export interface SaveReadingCollectionPayload {
  name: string;
  description?: string | null;
  color?: string;
  icon?: string;
}

export const collectionApi = {
  getCollections: async (query?: string): Promise<ReadingCollection[]> => {
    const params: Record<string, string> = {};
    if (query && query.trim()) {
      params.query = query.trim();
    }

    const response = await httpClient.get<ReadingCollection[]>('/collections', { params });
    if (response.status >= 400) {
      throw new Error(`Erro ao buscar colecoes: ${response.status}`);
    }
    return ReadingCollectionListSchema.parse(response.data);
  },

  createCollection: async (payload: SaveReadingCollectionPayload): Promise<ReadingCollection> => {
    const response = await httpClient.post<ReadingCollection>('/collections', payload);
    if (response.status >= 400) {
      throw new Error(`Erro ao criar colecao: ${response.status}`);
    }
    return ReadingCollectionSchema.parse(response.data);
  },

  updateCollection: async (
    collectionId: number,
    payload: SaveReadingCollectionPayload,
  ): Promise<ReadingCollection> => {
    const response = await httpClient.patch<ReadingCollection>(`/collections/${collectionId}`, payload);
    if (response.status >= 400) {
      throw new Error(`Erro ao atualizar colecao: ${response.status}`);
    }
    return ReadingCollectionSchema.parse(response.data);
  },

  deleteCollection: async (collectionId: number): Promise<void> => {
    const response = await httpClient.delete(`/collections/${collectionId}`);
    if (response.status >= 400) {
      throw new Error(`Erro ao excluir colecao: ${response.status}`);
    }
  },

  getBookCollections: async (bookId: number): Promise<ReadingCollection[]> => {
    const response = await httpClient.get<ReadingCollection[]>(`/books/${bookId}/collections`);
    if (response.status >= 400) {
      throw new Error(`Erro ao buscar colecoes do livro: ${response.status}`);
    }
    return ReadingCollectionListSchema.parse(response.data);
  },

  setBookCollections: async (bookId: number, collectionIds: number[]): Promise<ReadingCollection[]> => {
    const response = await httpClient.put<ReadingCollection[]>(`/books/${bookId}/collections`, { collectionIds });
    if (response.status >= 400) {
      throw new Error(`Erro ao atualizar colecoes do livro: ${response.status}`);
    }
    return ReadingCollectionListSchema.parse(response.data);
  },
};

