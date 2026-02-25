import type { SaveCategoryCommand } from './ports/CategoryRepository';

export interface UpdateCategoryCommand extends SaveCategoryCommand {
  categoryId: number;
}

export interface MoveCategoryCommand {
  categoryId: number;
  parentId: number | null;
}

export type CreateCategoryHandler = (payload: SaveCategoryCommand) => Promise<unknown>;
export type UpdateCategoryHandler = (payload: UpdateCategoryCommand) => Promise<unknown>;
export type MoveCategoryHandler = (payload: MoveCategoryCommand) => Promise<unknown>;
export type DeleteCategoryHandler = (categoryId: number) => Promise<unknown>;
