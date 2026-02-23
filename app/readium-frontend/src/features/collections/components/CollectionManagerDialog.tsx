import type { FC } from 'react';
import { ArrowDown, ArrowUp, BookmarkPlus, Palette, Save, Trash2, X } from 'lucide-react';
import type { ReadingCollection } from '@/types';
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

interface CollectionManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collections: ReadingCollection[];
  isLoading: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  onCreateCollection: (payload: {
    name: string;
    description?: string | null;
    color?: string;
    icon?: string;
    templateId?: string;
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
  onCreateCollection,
  onUpdateCollection,
  onMoveCollection,
  onDeleteCollection,
}) => {
  const state = useReadingCollectionManagerState();
  const order = useCollectionManualOrder({
    collections,
    onMoveCollection,
  });

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
    });
    state.clearCreate();
  };

  const handleUpdate = async (collectionId: number) => {
    const name = state.editingName.trim();
    if (!name) {
      return;
    }

    await onUpdateCollection({
      collectionId,
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
      <DialogContent className="max-w-3xl border-0 bg-gradient-to-b from-slate-50 to-white p-0">
        <DialogHeader className="rounded-t-xl border-b border-slate-200 bg-slate-900 px-6 py-5 text-slate-100">
          <DialogTitle className="text-xl">Gerenciar colecoes</DialogTitle>
          <DialogDescription className="text-slate-300">
            Crie colecoes personalizadas para organizar seus livros por objetivos e temas.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 px-6 py-5">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="mb-3 text-sm font-semibold text-slate-700">Nova colecao</p>
            <div className="grid gap-3 md:grid-cols-2">
              <Input
                value={state.newName}
                onChange={(event) => state.setNewName(event.target.value)}
                placeholder="Ex: Arquitetura em foco"
                className="md:col-span-2"
              />
              <textarea
                value={state.newDescription}
                onChange={(event) => state.setNewDescription(event.target.value)}
                placeholder="Descricao opcional para ajudar no contexto da colecao"
                className="min-h-20 rounded-md border border-input bg-background px-3 py-2 text-sm md:col-span-2"
              />
              <div className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2">
                <Palette className="h-4 w-4 text-slate-500" />
                <input
                  type="color"
                  value={state.newColor}
                  onChange={(event) => state.setNewColor(event.target.value)}
                  className="h-8 w-10 cursor-pointer rounded border border-slate-200 bg-transparent p-1"
                />
                <Input
                  value={state.newColor}
                  onChange={(event) => state.setNewColor(event.target.value)}
                  className="h-8"
                />
              </div>
              <Input
                value={state.newIcon}
                onChange={(event) => state.setNewIcon(event.target.value)}
                placeholder="Icone (ex: books, target, rocket)"
              />
              <div className="md:col-span-2">
                <CollectionTemplateSelect
                  value={state.newTemplateId}
                  onChange={(templateId) => state.setNewTemplateId(templateId)}
                />
              </div>
            </div>
            <div className="mt-4">
              <Button onClick={() => void handleCreate()} disabled={!state.canCreate || isSaving} className="gap-2">
                <BookmarkPlus className="h-4 w-4" />
                Criar colecao
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-700">Colecoes existentes</p>
            <div className="max-h-[360px] space-y-2 overflow-y-auto pr-1">
              {isLoading ? (
                <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500">
                  Carregando colecoes...
                </div>
              ) : collections.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
                  Nenhuma colecao criada ainda.
                </div>
              ) : (
                order.orderedCollections.map((collection) => {
                  const isEditing = state.editingCollectionId === collection.id;
                  const template = resolveCollectionTemplate(collection.templateId);
                  return (
                    <div
                      key={collection.id}
                      className={`flex flex-col gap-3 rounded-lg border bg-gradient-to-r p-3 shadow-sm ${template.panelClassName}`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="h-3 w-10 rounded-full"
                          style={{
                            backgroundColor: state.normalizeHexColor(
                              isEditing ? state.editingColor : collection.color,
                            ),
                          }}
                        />
                        <span className="text-xs uppercase tracking-wide text-slate-500">{collection.icon}</span>
                      </div>

                      {isEditing ? (
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
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={state.editingColor}
                              onChange={(event) => state.setEditingColor(event.target.value)}
                              className="h-8 w-10 cursor-pointer rounded border border-slate-200 bg-transparent p-1"
                            />
                            <Input
                              value={state.editingColor}
                              onChange={(event) => state.setEditingColor(event.target.value)}
                              className="h-8"
                            />
                          </div>
                          <Input
                            value={state.editingIcon}
                            onChange={(event) => state.setEditingIcon(event.target.value)}
                            className="h-8"
                          />
                          <div className="md:col-span-2">
                            <CollectionTemplateSelect
                              value={state.editingTemplateId}
                              onChange={(templateId) => state.setEditingTemplateId(templateId)}
                            />
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className="truncate text-sm font-medium text-slate-800">{collection.name}</p>
                          {collection.description ? (
                            <p className="mt-1 line-clamp-2 text-xs text-slate-500">{collection.description}</p>
                          ) : null}
                          <p className={`mt-2 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium ${template.chipClassName}`}>
                            {template.label}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">{collection.booksCount} livros</p>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        {isEditing ? (
                          <>
                            <Button
                              size="sm"
                              onClick={() => void handleUpdate(collection.id)}
                              disabled={isSaving || !state.editingName.trim()}
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={state.cancelEdit}>
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button size="sm" variant="outline" onClick={() => state.beginEdit(collection)}>
                              Editar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => void order.moveUp(collection.id)}
                              disabled={!order.canMoveUp(collection.id) || isSaving}
                            >
                              <ArrowUp className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => void order.moveDown(collection.id)}
                              disabled={!order.canMoveDown(collection.id) || isSaving}
                            >
                              <ArrowDown className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-200 text-red-600 hover:bg-red-50"
                              onClick={() => void onDeleteCollection(collection.id)}
                              disabled={isDeleting}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
