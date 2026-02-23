import { httpClient } from './http';
import type { Category } from '@/types';
import { CategoryListSchema, CategorySchema } from './schemas.ts';

export interface SaveCategoryPayload {
  name: string;
  color?: string;
  parentId?: number | null;
}

export interface MoveCategoryPayload {
  parentId: number | null;
}

export const categoryApi = {
  getCategories: async (query?: string): Promise<Category[]> => {
    const params: Record<string, string> = {};
    if (query && query.trim()) {
      params.query = query.trim();
    }

    const response = await httpClient.get<Category[]>('/categories', { params });
    if (response.status >= 400) {
      throw new Error(`Erro ao buscar categorias: ${response.status}`);
    }
    return CategoryListSchema.parse(response.data);
  },

  createCategory: async (payload: SaveCategoryPayload): Promise<Category> => {
    const response = await httpClient.post<Category>('/categories', payload);
    if (response.status >= 400) {
      throw new Error(`Erro ao criar categoria: ${response.status}`);
    }
    return CategorySchema.parse(response.data);
  },

  updateCategory: async (categoryId: number, payload: SaveCategoryPayload): Promise<Category> => {
    const response = await httpClient.patch<Category>(`/categories/${categoryId}`, payload);
    if (response.status >= 400) {
      throw new Error(`Erro ao atualizar categoria: ${response.status}`);
    }
    return CategorySchema.parse(response.data);
  },

  moveCategory: async (categoryId: number, payload: MoveCategoryPayload): Promise<Category> => {
    const response = await httpClient.patch<Category>(`/categories/${categoryId}/move`, payload);
    if (response.status >= 400) {
      throw new Error(`Erro ao mover categoria: ${response.status}`);
    }
    return CategorySchema.parse(response.data);
  },

  deleteCategory: async (categoryId: number): Promise<void> => {
    const response = await httpClient.delete(`/categories/${categoryId}`);
    if (response.status >= 400) {
      throw new Error(`Erro ao excluir categoria: ${response.status}`);
    }
  },

  getBookCategories: async (bookId: number): Promise<Category[]> => {
    const response = await httpClient.get<Category[]>(`/books/${bookId}/categories`);
    if (response.status >= 400) {
      throw new Error(`Erro ao buscar categorias do livro: ${response.status}`);
    }
    return CategoryListSchema.parse(response.data);
  },

  setBookCategories: async (bookId: number, categoryIds: number[]): Promise<Category[]> => {
    const response = await httpClient.put<Category[]>(`/books/${bookId}/categories`, { categoryIds });
    if (response.status >= 400) {
      throw new Error(`Erro ao atualizar categorias do livro: ${response.status}`);
    }
    return CategoryListSchema.parse(response.data);
  },
};
