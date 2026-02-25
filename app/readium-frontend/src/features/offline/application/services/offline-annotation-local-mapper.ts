import type { ReaderAnnotation, ReaderRect } from '@/features/reader/domain/models';
import type { CreateAnnotationCommand } from '@/features/reader/domain/ports/AnnotationRepository';
import type { LocalAnnotationRecord } from '../../domain/offline-sync';
import { nowIso } from './offline-time';

const parseRects = (rectsJson: string): ReaderRect[] => {
  try {
    const parsed = JSON.parse(rectsJson) as ReaderRect[];
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed;
  } catch {
    return [];
  }
};

const stringifyRects = (rects: ReaderRect[]): string => JSON.stringify(rects ?? []);

export const toReaderAnnotation = (record: LocalAnnotationRecord): ReaderAnnotation => ({
  id: record.localId,
  bookId: record.bookId,
  page: record.page,
  rects: parseRects(record.rectsJson),
  color: record.color,
  selectedText: record.selectedText,
  note: record.note,
});

export const toCreateAnnotationCommand = (record: LocalAnnotationRecord): CreateAnnotationCommand => ({
  bookId: record.bookId,
  page: record.page,
  rects: parseRects(record.rectsJson),
  color: record.color,
  selectedText: record.selectedText,
  note: record.note ?? undefined,
});

export const createLocalAnnotationRecord = (
  localId: number,
  command: CreateAnnotationCommand,
): LocalAnnotationRecord => {
  const now = nowIso();
  return {
    localId,
    remoteId: null,
    bookId: command.bookId,
    page: command.page,
    rectsJson: stringifyRects(command.rects),
    color: command.color,
    selectedText: command.selectedText,
    note: command.note ?? null,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    syncStatus: 'PENDING',
  };
};

export const toSyncedLocalAnnotationRecord = (annotation: ReaderAnnotation): LocalAnnotationRecord => {
  const now = nowIso();
  return {
    localId: annotation.id,
    remoteId: annotation.id,
    bookId: annotation.bookId,
    page: annotation.page,
    rectsJson: stringifyRects(annotation.rects),
    color: annotation.color,
    selectedText: annotation.selectedText,
    note: annotation.note ?? null,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    syncStatus: 'SYNCED',
  };
};
