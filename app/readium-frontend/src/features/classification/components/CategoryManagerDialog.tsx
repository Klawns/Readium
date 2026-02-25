import type { FC } from 'react';
import type { Category } from '@/types';
import type {
  CreateCategoryHandler,
  DeleteCategoryHandler,
  MoveCategoryHandler,
  UpdateCategoryHandler,
} from '../domain/category-actions';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog.tsx';
import { CategoryManagementPanel } from './CategoryManagementPanel';

interface CategoryManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  isLoading: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  onCreateCategory: CreateCategoryHandler;
  onUpdateCategory: UpdateCategoryHandler;
  onMoveCategory: MoveCategoryHandler;
  onDeleteCategory: DeleteCategoryHandler;
}

export const CategoryManagerDialog: FC<CategoryManagerDialogProps> = ({
  open,
  onOpenChange,
  categories,
  isLoading,
  isSaving,
  isDeleting,
  onCreateCategory,
  onUpdateCategory,
  onMoveCategory,
  onDeleteCategory,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-5xl overflow-hidden border border-slate-200 bg-slate-50 p-0">
        <DialogHeader className="border-b border-slate-200 bg-white px-5 py-4">
          <DialogTitle className="text-lg text-slate-900">Categorias</DialogTitle>
          <DialogDescription className="text-slate-600">
            Estruture a hierarquia e arraste categorias para reorganizar.
          </DialogDescription>
        </DialogHeader>
        <CategoryManagementPanel
          categories={categories}
          isLoading={isLoading}
          isSaving={isSaving}
          isDeleting={isDeleting}
          onCreateCategory={onCreateCategory}
          onUpdateCategory={onUpdateCategory}
          onMoveCategory={onMoveCategory}
          onDeleteCategory={onDeleteCategory}
          className="max-h-[calc(90vh-82px)]"
        />
      </DialogContent>
    </Dialog>
  );
};
