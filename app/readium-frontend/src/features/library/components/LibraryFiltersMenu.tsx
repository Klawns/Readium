import { useMemo, useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import type { ReadingCollection } from '@/types';
import type { CategoryTreeNode } from '@/features/classification/domain/category-tree';
import { Button } from '@/components/ui/button.tsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx';
import { useIsMobile } from '@/hooks/use-mobile.tsx';
import { LibraryFiltersNestedSection, type LibraryNestedFilterOption } from './LibraryFiltersNestedSection';

interface LibraryFiltersMenuProps {
  flattenedCategories: CategoryTreeNode[];
  collections: ReadingCollection[];
  selectedCategoryId: number | null;
  selectedCollectionId: number | null;
  selectedCategoryName: string;
  selectedCollectionName: string;
  onCategoryChange: (categoryId: number | null) => void;
  onCollectionChange: (collectionId: number | null) => void;
  onOpenCategoryManager: () => void;
  onOpenCollectionManager: () => void;
}

const toCategoryOptions = (flattenedCategories: CategoryTreeNode[]): LibraryNestedFilterOption[] =>
  flattenedCategories.map((node) => ({
    id: node.category.id,
    name: node.category.name,
    depth: node.depth,
  }));

const toCollectionOptions = (collections: ReadingCollection[]): LibraryNestedFilterOption[] =>
  collections.map((collection) => ({
    id: collection.id,
    name: collection.name,
    depth: 0,
  }));

export const LibraryFiltersMenu = ({
  flattenedCategories,
  collections,
  selectedCategoryId,
  selectedCollectionId,
  selectedCategoryName,
  selectedCollectionName,
  onCategoryChange,
  onCollectionChange,
  onOpenCategoryManager,
  onOpenCollectionManager,
}: LibraryFiltersMenuProps) => {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileCategoriesOpen, setIsMobileCategoriesOpen] = useState(false);
  const [isMobileCollectionsOpen, setIsMobileCollectionsOpen] = useState(false);

  const categoryOptions = useMemo(() => toCategoryOptions(flattenedCategories), [flattenedCategories]);
  const collectionOptions = useMemo(() => toCollectionOptions(collections), [collections]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setIsMobileCategoriesOpen(false);
      setIsMobileCollectionsOpen(false);
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 gap-2 border-slate-200">
          <SlidersHorizontal className="h-4 w-4" />
          Filtros
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={isMobile ? 'center' : 'end'}
        sideOffset={8}
        className="w-[min(18rem,calc(100vw-1rem))] max-h-[80dvh] overflow-y-auto"
      >
        <DropdownMenuLabel>Filtros da biblioteca</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <LibraryFiltersNestedSection
          isMobile={isMobile}
          title="Categorias"
          selectedLabel={selectedCategoryName}
          options={categoryOptions}
          selectedId={selectedCategoryId}
          allLabel="Todas as categorias"
          emptyLabel="Nenhuma categoria cadastrada"
          manageLabel="Gerenciar/Cadastrar categorias"
          isExpanded={isMobileCategoriesOpen}
          onExpandedChange={setIsMobileCategoriesOpen}
          onSelect={onCategoryChange}
          onManage={onOpenCategoryManager}
        />

        {isMobile ? <DropdownMenuSeparator /> : null}

        <LibraryFiltersNestedSection
          isMobile={isMobile}
          title="Colecoes"
          selectedLabel={selectedCollectionName}
          options={collectionOptions}
          selectedId={selectedCollectionId}
          allLabel="Todas as colecoes"
          emptyLabel="Nenhuma colecao cadastrada"
          manageLabel="Gerenciar/Cadastrar colecoes"
          isExpanded={isMobileCollectionsOpen}
          onExpandedChange={setIsMobileCollectionsOpen}
          onSelect={onCollectionChange}
          onManage={onOpenCollectionManager}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
