import type { Category } from '@/types';
import type { CategoryRepository, SaveCategoryCommand } from '../../domain/ports/CategoryRepository';

export class ListCategoriesUseCase {
  constructor(private readonly repository: CategoryRepository) {}

  execute(query?: string): Promise<Category[]> {
    return this.repository.list(query);
  }
}

export class CreateCategoryUseCase {
  constructor(private readonly repository: CategoryRepository) {}

  execute(command: SaveCategoryCommand): Promise<Category> {
    return this.repository.create(command);
  }
}

export class UpdateCategoryUseCase {
  constructor(private readonly repository: CategoryRepository) {}

  execute(categoryId: number, command: SaveCategoryCommand): Promise<Category> {
    return this.repository.update(categoryId, command);
  }
}

export class DeleteCategoryUseCase {
  constructor(private readonly repository: CategoryRepository) {}

  execute(categoryId: number): Promise<void> {
    return this.repository.delete(categoryId);
  }
}

export class ListBookCategoriesUseCase {
  constructor(private readonly repository: CategoryRepository) {}

  execute(bookId: number): Promise<Category[]> {
    return this.repository.listByBook(bookId);
  }
}

export class SetBookCategoriesUseCase {
  constructor(private readonly repository: CategoryRepository) {}

  execute(bookId: number, categoryIds: number[]): Promise<Category[]> {
    return this.repository.setBookCategories(bookId, categoryIds);
  }
}
