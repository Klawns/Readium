import { nowIso } from '@/features/offline/application/services/offline-time';
import {
  createUniqueSlug,
  DEFAULT_COLLECTION_ICON,
  DEFAULT_COLLECTION_TEMPLATE_ID,
  matchesSearchQuery,
  normalizeColorFromName,
  normalizeLowercaseOrFallback,
  normalizeOptionalText,
  normalizeRequiredName,
  sanitizePositiveIds,
} from '@/features/offline/application/services/offline-library-metadata-utils';
import type {
  LocalBookCollectionRecord,
  LocalReadingCollectionRecord,
} from '@/features/offline/domain/offline-library-metadata';
import type { ReadingCollection } from '@/types';
import type {
  ReadingCollectionRepository,
  SaveReadingCollectionCommand,
} from '../../domain/ports/ReadingCollectionRepository';
import {
  getLocalReadingCollectionRecord,
  listLocalBookCollectionRecords,
  listLocalBookCollectionRecordsByBook,
  listLocalBookCollectionRecordsByCollection,
  listLocalReadingCollectionRecords,
  removeLocalBookCollectionRecordsByCollection,
  removeLocalReadingCollectionRecord,
  replaceLocalBookCollectionRecordsByBook,
  saveLocalReadingCollectionRecord,
  saveLocalReadingCollectionRecords,
} from './reading-collection-local-store';

const normalizeTargetIndex = (targetIndex: number, totalItems: number): number => {
  if (totalItems <= 1) {
    return 0;
  }
  if (!Number.isFinite(targetIndex)) {
    return 0;
  }
  const index = Math.trunc(targetIndex);
  if (index <= 0) {
    return 0;
  }
  if (index >= totalItems - 1) {
    return totalItems - 1;
  }
  return index;
};

const sortRecords = (records: LocalReadingCollectionRecord[]): LocalReadingCollectionRecord[] =>
  [...records].sort(
    (left, right) => left.sortOrder - right.sortOrder || left.name.localeCompare(right.name) || left.id - right.id,
  );

const withSequentialSortOrder = (
  records: LocalReadingCollectionRecord[],
  updatedAt: string,
): LocalReadingCollectionRecord[] =>
  sortRecords(records).map((record, index) =>
    record.sortOrder === index
      ? record
      : {
          ...record,
          sortOrder: index,
          updatedAt,
        },
  );

const getNextCollectionId = (records: LocalReadingCollectionRecord[]): number =>
  records.reduce((maxId, record) => Math.max(maxId, record.id), 0) + 1;

const countBooksByCollectionId = (links: LocalBookCollectionRecord[]): Map<number, number> => {
  const booksByCollectionId = new Map<number, Set<number>>();
  links.forEach((link) => {
    const books = booksByCollectionId.get(link.collectionId) ?? new Set<number>();
    books.add(link.bookId);
    booksByCollectionId.set(link.collectionId, books);
  });

  const counts = new Map<number, number>();
  booksByCollectionId.forEach((bookIds, collectionId) => {
    counts.set(collectionId, bookIds.size);
  });
  return counts;
};

const toReadingCollection = (
  record: LocalReadingCollectionRecord,
  booksCountByCollectionId: Map<number, number>,
): ReadingCollection => ({
  id: record.id,
  name: record.name,
  slug: record.slug,
  description: record.description,
  color: record.color,
  icon: record.icon,
  sortOrder: record.sortOrder,
  templateId: record.templateId,
  booksCount: booksCountByCollectionId.get(record.id) ?? 0,
});

const filterRecordsByQuery = (
  records: LocalReadingCollectionRecord[],
  query: string | undefined,
): LocalReadingCollectionRecord[] => {
  const normalizedQuery = query?.trim() ?? '';
  if (!normalizedQuery) {
    return records;
  }

  return records.filter((record) =>
    matchesSearchQuery(record.name, normalizedQuery) ||
    matchesSearchQuery(record.description ?? '', normalizedQuery),
  );
};

export class ReadingCollectionLocalRepository implements ReadingCollectionRepository {
  async list(query?: string): Promise<ReadingCollection[]> {
    const [records, links] = await Promise.all([
      listLocalReadingCollectionRecords(),
      listLocalBookCollectionRecords(),
    ]);

    const sorted = sortRecords(filterRecordsByQuery(records, query));
    const booksCountByCollectionId = countBooksByCollectionId(links);
    return sorted.map((record) => toReadingCollection(record, booksCountByCollectionId));
  }

  async create(command: SaveReadingCollectionCommand): Promise<ReadingCollection> {
    const records = await listLocalReadingCollectionRecords();
    const name = normalizeRequiredName(command.name, 'colecao');
    const now = nowIso();

    const slug = createUniqueSlug(name, (candidate) => records.some((record) => record.slug === candidate));
    const record: LocalReadingCollectionRecord = {
      id: getNextCollectionId(records),
      name,
      slug,
      description: normalizeOptionalText(command.description),
      color: normalizeColorFromName(command.color, name),
      icon: normalizeLowercaseOrFallback(command.icon, DEFAULT_COLLECTION_ICON),
      sortOrder: records.length,
      templateId: normalizeLowercaseOrFallback(command.templateId, DEFAULT_COLLECTION_TEMPLATE_ID),
      createdAt: now,
      updatedAt: now,
    };

    await saveLocalReadingCollectionRecord(record);
    return toReadingCollection(record, new Map());
  }

  async update(collectionId: number, command: SaveReadingCollectionCommand): Promise<ReadingCollection> {
    const [existing, records] = await Promise.all([
      getLocalReadingCollectionRecord(collectionId),
      listLocalReadingCollectionRecords(),
    ]);
    if (!existing) {
      throw new Error(`Colecao com ID ${collectionId} nao encontrada.`);
    }

    const name = normalizeRequiredName(command.name, 'colecao');
    const slug = createUniqueSlug(
      name,
      (candidate) => records.some((record) => record.slug === candidate && record.id !== collectionId),
    );

    const updatedRecord: LocalReadingCollectionRecord = {
      ...existing,
      name,
      slug,
      description: normalizeOptionalText(command.description),
      color: normalizeColorFromName(command.color, name),
      icon: normalizeLowercaseOrFallback(command.icon, DEFAULT_COLLECTION_ICON),
      templateId: normalizeLowercaseOrFallback(command.templateId, DEFAULT_COLLECTION_TEMPLATE_ID),
      updatedAt: nowIso(),
    };

    await saveLocalReadingCollectionRecord(updatedRecord);
    const links = await listLocalBookCollectionRecordsByCollection(collectionId);
    return toReadingCollection(updatedRecord, countBooksByCollectionId(links));
  }

  async move(collectionId: number, targetIndex: number): Promise<ReadingCollection> {
    const records = sortRecords(await listLocalReadingCollectionRecords());
    if (records.length === 0) {
      throw new Error('Nenhuma colecao encontrada para reordenacao.');
    }

    const currentIndex = records.findIndex((record) => record.id === collectionId);
    if (currentIndex < 0) {
      throw new Error(`Colecao com ID ${collectionId} nao encontrada.`);
    }

    const normalizedTargetIndex = normalizeTargetIndex(targetIndex, records.length);
    if (normalizedTargetIndex === currentIndex) {
      const currentRecord = records[currentIndex];
      const links = await listLocalBookCollectionRecordsByCollection(collectionId);
      return toReadingCollection(currentRecord, countBooksByCollectionId(links));
    }

    const [movingRecord] = records.splice(currentIndex, 1);
    records.splice(normalizedTargetIndex, 0, movingRecord);

    const reorderedRecords = withSequentialSortOrder(records, nowIso());
    await saveLocalReadingCollectionRecords(reorderedRecords);

    const moved = reorderedRecords.find((record) => record.id === collectionId);
    if (!moved) {
      throw new Error('Falha ao mover colecao.');
    }

    const links = await listLocalBookCollectionRecordsByCollection(collectionId);
    return toReadingCollection(moved, countBooksByCollectionId(links));
  }

  async delete(collectionId: number): Promise<void> {
    const existing = await getLocalReadingCollectionRecord(collectionId);
    if (!existing) {
      throw new Error(`Colecao com ID ${collectionId} nao encontrada.`);
    }

    const records = sortRecords(await listLocalReadingCollectionRecords()).filter((record) => record.id !== collectionId);
    const reorderedRecords = withSequentialSortOrder(records, nowIso());

    await removeLocalReadingCollectionRecord(collectionId);
    await removeLocalBookCollectionRecordsByCollection(collectionId);
    await saveLocalReadingCollectionRecords(reorderedRecords);
  }

  async listByBook(bookId: number): Promise<ReadingCollection[]> {
    const [records, linksByBook, allLinks] = await Promise.all([
      listLocalReadingCollectionRecords(),
      listLocalBookCollectionRecordsByBook(bookId),
      listLocalBookCollectionRecords(),
    ]);

    const collectionIdSet = new Set(linksByBook.map((link) => link.collectionId));
    const selectedRecords = sortRecords(records.filter((record) => collectionIdSet.has(record.id)));
    const booksCountByCollectionId = countBooksByCollectionId(allLinks);
    return selectedRecords.map((record) => toReadingCollection(record, booksCountByCollectionId));
  }

  async setBookCollections(bookId: number, collectionIds: number[]): Promise<ReadingCollection[]> {
    const normalizedCollectionIds = sanitizePositiveIds(collectionIds);
    const records = await listLocalReadingCollectionRecords();
    const recordById = new Map(records.map((record) => [record.id, record]));

    const missingIds = normalizedCollectionIds.filter((collectionId) => !recordById.has(collectionId));
    if (missingIds.length > 0) {
      throw new Error(`Colecoes nao encontradas para os IDs: ${missingIds.join(', ')}`);
    }

    await replaceLocalBookCollectionRecordsByBook(bookId, normalizedCollectionIds, nowIso());

    const allLinks = await listLocalBookCollectionRecords();
    const booksCountByCollectionId = countBooksByCollectionId(allLinks);

    return sortRecords(
      normalizedCollectionIds
        .map((collectionId) => recordById.get(collectionId))
        .filter((record): record is LocalReadingCollectionRecord => Boolean(record)),
    ).map((record) => toReadingCollection(record, booksCountByCollectionId));
  }
}

