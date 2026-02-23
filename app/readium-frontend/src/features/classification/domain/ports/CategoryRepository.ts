import type { Category } from '@/types';

export interface SaveCategoryCommand {
  name: string;
  color?: string;
}

export interface CategoryRepository {
  list(query?: string): Promise<Category[]>;
  create(command: SaveCategoryCommand): Promise<Category>;
  update(categoryId: number, command: SaveCategoryCommand): Promise<Category>;
  delete(categoryId: number): Promise<void>;
  listByBook(bookId: number): Promise<Category[]>;
  setBookCategories(bookId: number, categoryIds: number[]): Promise<Category[]>;
}
