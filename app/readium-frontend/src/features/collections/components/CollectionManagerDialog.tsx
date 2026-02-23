import { useEffect, type FC } from 'react';
import { ArrowDown, ArrowUp, BookmarkPlus, Check, Palette, Pencil, Save, Search, Trash2, X } from 'lucide-react';
import type { Book, ReadingCollection } from '@/types';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog.tsx';
import { useReadingCollectionManagerState } from '../ui/hooks/useReadingCollectionManagerState';
import { CollectionTemplateSelect } from './CollectionTemplateSelect';
import { useCollectionManualOrder } from '../ui/hooks/useCollectionManualOrder';
import { resolveCollectionTemplate } from '../application/services/collection-template-presets';
import { useCollectionInitialBooksState } from '../ui/hooks/useCollectionInitialBooksState';

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
  onCreateCollection: (payload: {
    name: string;
    description?: string | null;
    color?: string;
    icon?: string;
    templateId?: string;
    initialBookIds?: number[];
  }) => Promise<unknown>;
  onUpdateCollection: (payload: {
    collectionId: number;
    name: string;
    description?: string | null;
    color?: string;
    icon?: string;
    templateId?: string;
  }) => Promise<unknown>;
  onMoveCollection: (payload: {
    collectionId: number;
    targetIndex: number;
  }) => Promise<unknown>;
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
      name,
      description: state.editingDescription.trim() || null,
      color: state.normalizeHexColor(state.editingColor),
      icon: state.normalizeIcon(state.editingIcon),
      templateId: state.normalizeTemplateId(state.editingTemplateId),
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
          <aside className="border-b border-slate-200 bg-white p-4 md:min-h-0 md:overflow-y-auto md:border-b-0 md:border-r">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Nova colecao</p>
            <div className="mt-3 space-y-3">
              <Input
                value={state.newName}
                onChange={(event) => state.setNewName(event.target.value)}
                placeholder="Ex: Arquitetura em foco"
              />
              <textarea
                value={state.newDescription}
                onChange={(event) => state.setNewDescription(event.target.value)}
                placeholder="Descricao opcional"
                className="min-h-20 rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <Input
                  value={state.newColor}
                  onChange={(event) => state.setNewColor(event.target.value)}
                  className="h-9"
                />
                <label className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-2.5 py-2 text-xs text-slate-600">
                  <Palette className="h-4 w-4" />
                  <input
                    type="color"
                    value={state.newColor}
                    onChange={(event) => state.setNewColor(event.target.value)}
                    className="h-6 w-8 cursor-pointer border-0 bg-transparent p-0"
                  />
                </label>
              </div>
              <Input
                value={state.newIcon}
                onChange={(event) => state.setNewIcon(event.target.value)}
                placeholder="Icone (ex: books)"
                className="h-9"
              />
              <CollectionTemplateSelect
                value={state.newTemplateId}
                onChange={(templateId) => state.setNewTemplateId(templateId)}
              />
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Livros iniciais</p>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] text-slate-500">
                    {initialBooks.selectedBooksCount} selecionados
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => initialBooks.selectBooks(availableBooks.map((book) => book.id))}
                    disabled={isLoadingBooks || availableBooks.length === 0}
                  >
                    Selecionar visiveis
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs text-slate-600"
                    onClick={initialBooks.clearSelectedBooks}
                    disabled={initialBooks.selectedBooksCount === 0}
                  >
                    Limpar
                  </Button>
                </div>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={booksSearchQuery}
                    onChange={(event) => onBooksSearchQueryChange(event.target.value)}
                    placeholder="Buscar livro..."
                    className="h-9 pl-8"
                  />
                </div>
                <div className="max-h-52 space-y-1 overflow-y-auto rounded-md border border-slate-200 bg-slate-50 p-1.5">
                  {isLoadingBooks ? (
                    <div className="px-2 py-3 text-xs text-slate-500">Carregando livros...</div>
                  ) : availableBooks.length === 0 ? (
                    <div className="px-2 py-3 text-xs text-slate-500">Nenhum livro encontrado.</div>
                  ) : (
                    availableBooks.map((book) => {
                      const selected = initialBooks.isBookSelected(book.id);
                      return (
                        <button
                          key={book.id}
                          type="button"
                          onClick={() => initialBooks.toggleBook(book.id)}
                          className={`flex w-full items-center gap-2 rounded-md border px-2 py-1.5 text-left text-xs transition ${
                            selected
                              ? 'border-slate-900 bg-slate-900 text-white'
                              : 'border-transparent bg-white text-slate-700 hover:border-slate-200'
                          }`}
                        >
                          <span className="inline-flex h-4 w-4 items-center justify-center rounded border border-current/40">
                            {selected ? <Check className="h-3 w-3" /> : null}
                          </span>
                          <span className="min-w-0 flex-1 truncate">{book.title}</span>
                        </button>
                      );
                    })
                  )}
                </div>
                <p className="text-[11px] text-slate-500">Mostrando ate {availableBooks.length} de {booksTotal} livros.</p>
              </div>
              <Button onClick={() => void handleCreate()} disabled={!state.canCreate || isSaving} className="w-full gap-2">
                <BookmarkPlus className="h-4 w-4" />
                Criar colecao
              </Button>
            </div>
          </aside>

          <section className="flex min-h-0 flex-col p-4">
            {editingCollection ? (
              <div className="mb-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Editando: {editingCollection.name}
                  </p>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={state.cancelEdit}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid gap-2 md:grid-cols-2">
                  <Input
                    value={state.editingName}
                    onChange={(event) => state.setEditingName(event.target.value)}
                    className="md:col-span-2"
                  />
                  <textarea
                    value={state.editingDescription}
                    onChange={(event) => state.setEditingDescription(event.target.value)}
                    className="min-h-16 rounded-md border border-input bg-background px-3 py-2 text-sm md:col-span-2"
                  />
                  <div className="grid grid-cols-[1fr_auto] gap-2">
                    <Input
                      value={state.editingColor}
                      onChange={(event) => state.setEditingColor(event.target.value)}
                      className="h-9"
                    />
                    <input
                      type="color"
                      value={state.editingColor}
                      onChange={(event) => state.setEditingColor(event.target.value)}
                      className="h-9 w-10 cursor-pointer rounded border border-slate-200 bg-transparent p-1"
                    />
                  </div>
                  <Input
                    value={state.editingIcon}
                    onChange={(event) => state.setEditingIcon(event.target.value)}
                    className="h-9"
                  />
                  <div className="md:col-span-2">
                    <CollectionTemplateSelect
                      value={state.editingTemplateId}
                      onChange={(templateId) => state.setEditingTemplateId(templateId)}
                    />
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => void handleUpdate()}
                    disabled={isSaving || !state.editingName.trim()}
                    className="gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Salvar
                  </Button>
                  <Button size="sm" variant="outline" onClick={state.cancelEdit}>
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : null}

            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-slate-700">Colecoes existentes</p>
              <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] text-slate-500">
                {order.orderedCollections.length} itens
              </span>
            </div>

            <div className="min-h-0 space-y-2 overflow-y-auto pr-1">
              {isLoading ? (
                <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500">
                  Carregando colecoes...
                </div>
              ) : order.orderedCollections.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
                  Nenhuma colecao criada ainda.
                </div>
              ) : (
                order.orderedCollections.map((collection) => {
                  const template = resolveCollectionTemplate(collection.templateId);
                  const isEditing = state.editingCollectionId === collection.id;

                  return (
                    <article
                      key={collection.id}
                      className={`rounded-lg border bg-white p-3 shadow-sm transition ${
                        isEditing ? 'border-slate-900 ring-1 ring-slate-900/20' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: collection.color }} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-slate-800">{collection.name}</p>
                          {collection.description ? (
                            <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">{collection.description}</p>
                          ) : null}
                          <div className="mt-1 flex flex-wrap items-center gap-1.5">
                            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${template.chipClassName}`}>
                              {template.label}
                            </span>
                            <span className="text-[11px] text-slate-500">{collection.booksCount} livros</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => void order.moveUp(collection.id)}
                            disabled={!order.canMoveUp(collection.id) || isSaving}
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => void order.moveDown(collection.id)}
                            disabled={!order.canMoveDown(collection.id) || isSaving}
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => state.beginEdit(collection)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700"
                            onClick={() => void onDeleteCollection(collection.id)}
                            disabled={isDeleting}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
};
