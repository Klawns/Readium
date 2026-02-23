import type { Category } from '@/types';
import { categoryApi } from '@/services/categoryApi';
import type { CategoryRepository, SaveCategoryCommand } from '../../domain/ports/CategoryRepository';

export class CategoryHttpRepository implements CategoryRepository {
  list(query?: string): Promise<Category[]> {
    return categoryApi.getCategories(query);
  }

  create(command: SaveCategoryCommand): Promise<Category> {
    return categoryApi.createCategory(command);
  }

  update(categoryId: number, command: SaveCategoryCommand): Promise<Category> {
    return categoryApi.updateCategory(categoryId, command);
  }

  move(categoryId: number, parentId: number | null): Promise<Category> {
    return categoryApi.moveCategory(categoryId, { parentId });
  }

  delete(categoryId: number): Promise<void> {
    return categoryApi.deleteCategory(categoryId);
  }

  listByBook(bookId: number): Promise<Category[]> {
    return categoryApi.getBookCategories(bookId);
  }

  setBookCategories(bookId: number, categoryIds: number[]): Promise<Category[]> {
    return categoryApi.setBookCategories(bookId, categoryIds);
  }
}
