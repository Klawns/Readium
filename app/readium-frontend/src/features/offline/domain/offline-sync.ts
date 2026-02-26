import type { BookStatus } from '@/types';

export type OfflineSyncEntityType = 'READING_PROGRESS' | 'ANNOTATION' | 'BOOK';

export type OfflineSyncOperationType =
  | 'UPSERT_PROGRESS'
  | 'UPSERT_BOOK_STATUS'
  | 'CREATE_ANNOTATION'
  | 'UPDATE_ANNOTATION'
  | 'DELETE_ANNOTATION';

export type OfflineSyncQueueStatus = 'PENDING' | 'FAILED';

export type LocalSyncStatus = 'PENDING' | 'SYNCED';

export interface OfflineBookSnapshot {
  bookId: number;
  title: string | null;
  author: string | null;
  pages: number | null;
  format: 'PDF' | 'EPUB' | null;
  status: BookStatus | null;
  coverUrl: string | null;
  lastReadPage: number | null;
  updatedAt: string;
}

export interface LocalReadingProgressRecord {
  bookId: number;
  page: number;
  updatedAt: string;
  syncedAt: string | null;
  syncStatus: LocalSyncStatus;
}

export interface LocalAnnotationRecord {
  localId: number;
  remoteId: number | null;
  bookId: number;
  page: number;
  rectsJson: string;
  color: string;
  selectedText: string;
  note: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  syncStatus: LocalSyncStatus;
}

export interface SyncQueueRecord {
  operationId: string;
  entityType: OfflineSyncEntityType;
  entityId: string;
  operationType: OfflineSyncOperationType;
  payloadJson: string;
  status: OfflineSyncQueueStatus;
  attemptCount: number;
  lastError: string | null;
  nextRetryAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertProgressQueuePayload {
  bookId: number;
  page: number;
  mode?: 'MAX' | 'EXACT';
}

export interface UpsertBookStatusQueuePayload {
  bookId: number;
  status: BookStatus;
}

export interface AnnotationCreateQueuePayload {
  localId: number;
}

export interface AnnotationUpdateQueuePayload {
  localId: number;
}

export interface AnnotationDeleteQueuePayload {
  localId: number;
  remoteId: number | null;
}
