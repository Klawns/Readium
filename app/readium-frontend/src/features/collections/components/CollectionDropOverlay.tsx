import type { DragEvent } from 'react';
import type { ReactNode } from 'react';
import { ArrowRightLeft, Folder, FolderOpenDot } from 'lucide-react';
import type { ReadingCollection } from '@/types';

type DropTarget = number | 'unassigned' | null;

interface CollectionDropOverlayProps {
  collections: ReadingCollection[];
  dropTarget: DropTarget;
  isVisible: boolean;
  onDragOverTarget: (target: number | 'unassigned') => void;
  onDragLeaveTarget: () => void;
  onDropOnCollection: (collectionId: number) => Promise<void>;
  onDropOnUnassigned: () => Promise<void>;
}

const OverlayTarget = ({
  active,
  label,
  icon,
  onDragOver,
  onDragLeave,
  onDrop,
}: {
  active: boolean;
  label: string;
  icon: ReactNode;
  onDragOver: () => void;
  onDragLeave: () => void;
  onDrop: () => Promise<void>;
}) => {
  const handleDragOver = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    onDragOver();
  };

  const handleDrop = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    void onDrop();
  };

  return (
    <button
      type="button"
      onDragOver={handleDragOver}
      onDragLeave={onDragLeave}
      onDrop={handleDrop}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition ${
        active
          ? 'border-slate-900 bg-slate-900 text-white'
          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
      }`}
    >
      {icon}
      <span className="max-w-32 truncate">{label}</span>
    </button>
  );
};

export const CollectionDropOverlay = ({
  collections,
  dropTarget,
  isVisible,
  onDragOverTarget,
  onDragLeaveTarget,
  onDropOnCollection,
  onDropOnUnassigned,
}: CollectionDropOverlayProps) => {
  if (!isVisible) {
    return null;
  }

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 top-20 z-40 flex justify-center px-4">
        <div className="pointer-events-auto flex w-full max-w-5xl items-center gap-2 overflow-x-auto rounded-xl border border-slate-200 bg-white/95 p-2 shadow-lg backdrop-blur">
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] text-slate-600">
            <ArrowRightLeft className="h-3.5 w-3.5" />
            Solte para mover
          </span>
          <OverlayTarget
            active={dropTarget === 'unassigned'}
            label="Sem colecao"
            icon={<FolderOpenDot className="h-3.5 w-3.5" />}
            onDragOver={() => onDragOverTarget('unassigned')}
            onDragLeave={onDragLeaveTarget}
            onDrop={onDropOnUnassigned}
          />
          {collections.map((collection) => (
            <OverlayTarget
              key={collection.id}
              active={dropTarget === collection.id}
              label={collection.name}
              icon={<Folder className="h-3.5 w-3.5" />}
              onDragOver={() => onDragOverTarget(collection.id)}
              onDragLeave={onDragLeaveTarget}
              onDrop={() => onDropOnCollection(collection.id)}
            />
          ))}
        </div>
      </div>

      <div className="pointer-events-none fixed right-4 top-36 z-40 hidden w-56 xl:block">
        <div className="pointer-events-auto space-y-2 rounded-xl border border-slate-200 bg-white/95 p-2 shadow-lg backdrop-blur">
          <p className="px-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Destinos rapidos
          </p>
          <OverlayTarget
            active={dropTarget === 'unassigned'}
            label="Sem colecao"
            icon={<FolderOpenDot className="h-3.5 w-3.5" />}
            onDragOver={() => onDragOverTarget('unassigned')}
            onDragLeave={onDragLeaveTarget}
            onDrop={onDropOnUnassigned}
          />
          {collections.map((collection) => (
            <OverlayTarget
              key={`side-${collection.id}`}
              active={dropTarget === collection.id}
              label={collection.name}
              icon={<Folder className="h-3.5 w-3.5" />}
              onDragOver={() => onDragOverTarget(collection.id)}
              onDragLeave={onDragLeaveTarget}
              onDrop={() => onDropOnCollection(collection.id)}
            />
          ))}
        </div>
      </div>
    </>
  );
};
