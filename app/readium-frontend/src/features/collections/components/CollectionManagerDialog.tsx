import { useEffect, type FC } from 'react';
import type { Book, ReadingCollection } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog.tsx';
import type {
  CreateReadingCollectionAction,
  MoveReadingCollectionAction,
  UpdateReadingCollectionAction,
} from '../domain/collection-actions';
import { useReadingCollectionManagerState } from '../ui/hooks/useReadingCollectionManagerState';
import { useCollectionManualOrder } from '../ui/hooks/useCollectionManualOrder';
import { useCollectionInitialBooksState } from '../ui/hooks/useCollectionInitialBooksState';
import { CollectionManagerCreateForm } from './CollectionManagerCreateForm';
import { CollectionManagerEditForm } from './CollectionManagerEditForm';
import { CollectionManagerList } from './CollectionManagerList';

interface CollectionManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collections: ReadingCollection[];
  isLoading: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  availableBooks: Book[];
  booksSearchQuery: string;
  booksTotal: number;
  isLoadingBooks: boolean;
  onBooksSearchQueryChange: (query: string) => void;
  onCreateCollection: (payload: CreateReadingCollectionAction) => Promise<unknown>;
  onUpdateCollection: (payload: UpdateReadingCollectionAction) => Promise<unknown>;
  onMoveCollection: (payload: MoveReadingCollectionAction) => Promise<unknown>;
  onDeleteCollection: (collectionId: number) => Promise<unknown>;
}

export const CollectionManagerDialog: FC<CollectionManagerDialogProps> = ({
  open,
  onOpenChange,
  collections,
  isLoading,
  isSaving,
  isDeleting,
  availableBooks,
  booksSearchQuery,
  booksTotal,
  isLoadingBooks,
  onBooksSearchQueryChange,
  onCreateCollection,
  onUpdateCollection,
  onMoveCollection,
  onDeleteCollection,
}) => {
  const state = useReadingCollectionManagerState();
  const initialBooks = useCollectionInitialBooksState();
  const { clearSelectedBooks } = initialBooks;
  const order = useCollectionManualOrder({
    collections,
    onMoveCollection,
  });

  const editingCollection = order.orderedCollections.find(
    (collection) => collection.id === state.editingCollectionId,
  );

  useEffect(() => {
    if (open) {
      return;
    }
    clearSelectedBooks();
    onBooksSearchQueryChange('');
  }, [clearSelectedBooks, onBooksSearchQueryChange, open]);

  const handleCreate = async () => {
    const name = state.newName.trim();
    if (!name) {
      return;
    }

    await onCreateCollection({
      name,
      description: state.newDescription.trim() || null,
      color: state.normalizeHexColor(state.newColor),
      icon: state.normalizeIcon(state.newIcon),
      templateId: state.normalizeTemplateId(state.newTemplateId),
      initialBookIds: initialBooks.selectedBookIds,
    });
    state.clearCreate();
    initialBooks.clearSelectedBooks();
    onBooksSearchQueryChange('');
  };

  const handleUpdate = async () => {
    const name = state.editingName.trim();
    if (!name || state.editingCollectionId == null) {
      return;
    }

    await onUpdateCollection({
      collectionId: state.editingCollectionId,
      command: {
        name,
        description: state.editingDescription.trim() || null,
        color: state.normalizeHexColor(state.editingColor),
        icon: state.normalizeIcon(state.editingIcon),
        templateId: state.normalizeTemplateId(state.editingTemplateId),
      },
    });
    state.cancelEdit();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-6xl overflow-hidden border border-slate-200 bg-slate-50 p-0">
        <DialogHeader className="border-b border-slate-200 bg-white px-5 py-4">
          <DialogTitle className="text-lg text-slate-900">Colecoes</DialogTitle>
          <DialogDescription className="text-slate-600">
            Cadastre e ordene colecoes para manter a biblioteca organizada sem poluir a tela.
          </DialogDescription>
        </DialogHeader>

        <div className="grid max-h-[calc(90vh-82px)] grid-cols-1 overflow-y-auto md:grid-cols-[320px_1fr] md:overflow-hidden">
          <CollectionManagerCreateForm
            name={state.newName}
            description={state.newDescription}
            color={state.newColor}
            icon={state.newIcon}
            templateId={state.newTemplateId}
            canCreate={state.canCreate}
            isSaving={isSaving}
            onNameChange={state.setNewName}
            onDescriptionChange={state.setNewDescription}
            onColorChange={state.setNewColor}
            onIconChange={state.setNewIcon}
            onTemplateChange={state.setNewTemplateId}
            onCreate={() => void handleCreate()}
            availableBooks={availableBooks}
            booksSearchQuery={booksSearchQuery}
            booksTotal={booksTotal}
            isLoadingBooks={isLoadingBooks}
            selectedBooksCount={initialBooks.selectedBooksCount}
            isBookSelected={initialBooks.isBookSelected}
            onBooksSearchQueryChange={onBooksSearchQueryChange}
            onToggleBook={initialBooks.toggleBook}
            onSelectVisibleBooks={() => initialBooks.selectBooks(availableBooks.map((book) => book.id))}
            onClearSelectedBooks={initialBooks.clearSelectedBooks}
          />

          <section className="flex min-h-0 flex-col p-4">
            {editingCollection ? (
              <CollectionManagerEditForm
                collection={editingCollection}
                name={state.editingName}
                description={state.editingDescription}
                color={state.editingColor}
                icon={state.editingIcon}
                templateId={state.editingTemplateId}
                isSaving={isSaving}
                onNameChange={state.setEditingName}
                onDescriptionChange={state.setEditingDescription}
                onColorChange={state.setEditingColor}
                onIconChange={state.setEditingIcon}
                onTemplateChange={state.setEditingTemplateId}
                onCancel={state.cancelEdit}
                onSave={() => void handleUpdate()}
              />
            ) : null}

            <CollectionManagerList
              collections={order.orderedCollections}
              isLoading={isLoading}
              isSaving={isSaving}
              isDeleting={isDeleting}
              editingCollectionId={state.editingCollectionId}
              onMoveUp={order.moveUp}
              onMoveDown={order.moveDown}
              onBeginEdit={state.beginEdit}
              onDeleteCollection={onDeleteCollection}
              canMoveUp={order.canMoveUp}
              canMoveDown={order.canMoveDown}
            />
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
};
