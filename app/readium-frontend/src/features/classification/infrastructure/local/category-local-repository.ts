import { nowIso } from '@/features/offline/application/services/offline-time';
import {
  createUniqueSlug,
  matchesSearchQuery,
  normalizeColorFromName,
  normalizeRequiredName,
  sanitizePositiveIds,
} from '@/features/offline/application/services/offline-library-metadata-utils';
import type {
  LocalBookCategoryRecord,
  LocalCategoryRecord,
} from '@/features/offline/domain/offline-library-metadata';
import type { Category } from '@/types';
import type { CategoryRepository, SaveCategoryCommand } from '../../domain/ports/CategoryRepository';
import {
  getLocalCategoryRecord,
  listLocalBookCategoryRecords,
  listLocalBookCategoryRecordsByBook,
  listLocalBookCategoryRecordsByCategory,
  listLocalCategoryRecords,
  removeLocalBookCategoryRecordsByCategory,
  removeLocalCategoryRecord,
  replaceLocalBookCategoryRecordsByBook,
  saveLocalCategoryRecord,
  saveLocalCategoryRecords,
} from './category-local-store';

const normalizeParentId = (parentId: number | null | undefined): number | null =>
  typeof parentId === 'number' && Number.isFinite(parentId) && parentId > 0 ? Math.trunc(parentId) : null;

const sortRecords = (records: LocalCategoryRecord[]): LocalCategoryRecord[] =>
  [...records].sort(
    (left, right) => left.sortOrder - right.sortOrder || left.name.localeCompare(right.name) || left.id - right.id,
  );

const getNextCategoryId = (records: LocalCategoryRecord[]): number =>
  records.reduce((maxId, record) => Math.max(maxId, record.id), 0) + 1;

const countBooksByCategoryId = (links: LocalBookCategoryRecord[]): Map<number, number> => {
  const booksByCategoryId = new Map<number, Set<number>>();
  links.forEach((link) => {
    const books = booksByCategoryId.get(link.categoryId) ?? new Set<number>();
    books.add(link.bookId);
    booksByCategoryId.set(link.categoryId, books);
  });

  const counts = new Map<number, number>();
  booksByCategoryId.forEach((bookIds, categoryId) => {
    counts.set(categoryId, bookIds.size);
  });
  return counts;
};

const toCategory = (record: LocalCategoryRecord, booksCountByCategoryId: Map<number, number>): Category => ({
  id: record.id,
  name: record.name,
  slug: record.slug,
  color: record.color,
  parentId: record.parentId,
  sortOrder: record.sortOrder,
  booksCount: booksCountByCategoryId.get(record.id) ?? 0,
});

const normalizeSiblingSort = (
  records: LocalCategoryRecord[],
  parentId: number | null,
  updatedAt: string,
): LocalCategoryRecord[] => {
  const siblings = sortRecords(records.filter((record) => record.parentId === parentId));
  const siblingById = new Map<number, LocalCategoryRecord>(
    siblings.map((record, index) => [
      record.id,
      record.sortOrder === index
        ? record
        : {
            ...record,
            sortOrder: index,
            updatedAt,
          },
    ]),
  );

  return records.map((record) => siblingById.get(record.id) ?? record);
};

const validateParentHierarchy = (
  records: LocalCategoryRecord[],
  categoryId: number | null,
  parentId: number | null,
): void => {
  if (parentId === null) {
    return;
  }

  const recordById = new Map(records.map((record) => [record.id, record]));
  const parent = recordById.get(parentId);
  if (!parent) {
    throw new Error(`Categoria pai com ID ${parentId} nao encontrada.`);
  }

  if (categoryId !== null && categoryId === parentId) {
    throw new Error('Uma categoria nao pode ser pai dela mesma.');
  }

  let cursor = parent.parentId;
  while (cursor !== null) {
    if (categoryId !== null && cursor === categoryId) {
      throw new Error('Nao e permitido criar ciclo na hierarquia de categorias.');
    }
    const cursorRecord = recordById.get(cursor);
    if (!cursorRecord) {
      throw new Error(`Categoria pai com ID ${cursor} nao encontrada.`);
    }
    cursor = cursorRecord.parentId;
  }
};

const filterRecordsByQuery = (records: LocalCategoryRecord[], query: string | undefined): LocalCategoryRecord[] => {
  const normalizedQuery = query?.trim() ?? '';
  if (!normalizedQuery) {
    return records;
  }
  return records.filter((record) => matchesSearchQuery(record.name, normalizedQuery));
};

export class CategoryLocalRepository implements CategoryRepository {
  async list(query?: string): Promise<Category[]> {
    const [records, links] = await Promise.all([
      listLocalCategoryRecords(),
      listLocalBookCategoryRecords(),
    ]);

    const sorted = sortRecords(filterRecordsByQuery(records, query));
    const booksCountByCategoryId = countBooksByCategoryId(links);
    return sorted.map((record) => toCategory(record, booksCountByCategoryId));
  }

  async create(command: SaveCategoryCommand): Promise<Category> {
    const records = await listLocalCategoryRecords();
    const name = normalizeRequiredName(command.name, 'categoria');
    const parentId = normalizeParentId(command.parentId);
    validateParentHierarchy(records, null, parentId);

    const now = nowIso();
    const slug = createUniqueSlug(name, (candidate) => records.some((record) => record.slug === candidate));
    const sortOrder = records.filter((record) => record.parentId === parentId).length;

    const record: LocalCategoryRecord = {
      id: getNextCategoryId(records),
      name,
      slug,
      color: normalizeColorFromName(command.color, name),
      parentId,
      sortOrder,
      createdAt: now,
      updatedAt: now,
    };

    await saveLocalCategoryRecord(record);
    return toCategory(record, new Map());
  }

  async update(categoryId: number, command: SaveCategoryCommand): Promise<Category> {
    const [existing, records] = await Promise.all([
      getLocalCategoryRecord(categoryId),
      listLocalCategoryRecords(),
    ]);
    if (!existing) {
      throw new Error(`Categoria com ID ${categoryId} nao encontrada.`);
    }

    const name = normalizeRequiredName(command.name, 'categoria');
    const nextParentId = command.parentId === undefined ? existing.parentId : normalizeParentId(command.parentId);
    validateParentHierarchy(records, categoryId, nextParentId);

    const slug = createUniqueSlug(
      name,
      (candidate) => records.some((record) => record.slug === candidate && record.id !== categoryId),
    );

    const now = nowIso();
    let nextRecords = records.map((record) =>
      record.id === categoryId
        ? {
            ...record,
            name,
            slug,
            color: normalizeColorFromName(command.color, name),
            parentId: nextParentId,
            sortOrder: record.parentId === nextParentId
              ? record.sortOrder
              : records.filter((sibling) => sibling.parentId === nextParentId && sibling.id !== categoryId).length,
            updatedAt: now,
          }
        : record,
    );

    if (existing.parentId !== nextParentId) {
      nextRecords = normalizeSiblingSort(nextRecords, existing.parentId, now);
      nextRecords = normalizeSiblingSort(nextRecords, nextParentId, now);
    }

    await saveLocalCategoryRecords(nextRecords);

    const updated = nextRecords.find((record) => record.id === categoryId);
    if (!updated) {
      throw new Error('Falha ao atualizar categoria.');
    }
    const links = await listLocalBookCategoryRecordsByCategory(categoryId);
    return toCategory(updated, countBooksByCategoryId(links));
  }

  async move(categoryId: number, parentId: number | null): Promise<Category> {
    const records = await listLocalCategoryRecords();
    const existing = records.find((record) => record.id === categoryId);
    if (!existing) {
      throw new Error(`Categoria com ID ${categoryId} nao encontrada.`);
    }

    const targetParentId = normalizeParentId(parentId);
    validateParentHierarchy(records, categoryId, targetParentId);
    if (existing.parentId === targetParentId) {
      const links = await listLocalBookCategoryRecordsByCategory(categoryId);
      return toCategory(existing, countBooksByCategoryId(links));
    }

    const now = nowIso();
    let nextRecords = records.map((record) =>
      record.id === categoryId
        ? {
            ...record,
            parentId: targetParentId,
            sortOrder: records.filter((sibling) => sibling.parentId === targetParentId && sibling.id !== categoryId).length,
            updatedAt: now,
          }
        : record,
    );

    nextRecords = normalizeSiblingSort(nextRecords, existing.parentId, now);
    nextRecords = normalizeSiblingSort(nextRecords, targetParentId, now);

    await saveLocalCategoryRecords(nextRecords);

    const moved = nextRecords.find((record) => record.id === categoryId);
    if (!moved) {
      throw new Error('Falha ao mover categoria.');
    }
    const links = await listLocalBookCategoryRecordsByCategory(categoryId);
    return toCategory(moved, countBooksByCategoryId(links));
  }

  async delete(categoryId: number): Promise<void> {
    const records = await listLocalCategoryRecords();
    const existing = records.find((record) => record.id === categoryId);
    if (!existing) {
      throw new Error(`Categoria com ID ${categoryId} nao encontrada.`);
    }

    const now = nowIso();
    let nextRecords = records
      .filter((record) => record.id !== categoryId)
      .map((record) =>
        record.parentId === categoryId
          ? {
              ...record,
              parentId: existing.parentId,
              updatedAt: now,
            }
          : record,
      );

    nextRecords = normalizeSiblingSort(nextRecords, existing.parentId, now);

    await removeLocalCategoryRecord(categoryId);
    await removeLocalBookCategoryRecordsByCategory(categoryId);
    await saveLocalCategoryRecords(nextRecords);
  }

  async listByBook(bookId: number): Promise<Category[]> {
    const [records, linksByBook, allLinks] = await Promise.all([
      listLocalCategoryRecords(),
      listLocalBookCategoryRecordsByBook(bookId),
      listLocalBookCategoryRecords(),
    ]);

    const categoryIdSet = new Set(linksByBook.map((link) => link.categoryId));
    const selectedRecords = sortRecords(records.filter((record) => categoryIdSet.has(record.id)));
    const booksCountByCategoryId = countBooksByCategoryId(allLinks);
    return selectedRecords.map((record) => toCategory(record, booksCountByCategoryId));
  }

  async setBookCategories(bookId: number, categoryIds: number[]): Promise<Category[]> {
    const normalizedCategoryIds = sanitizePositiveIds(categoryIds);
    const records = await listLocalCategoryRecords();
    const recordById = new Map(records.map((record) => [record.id, record]));

    const missingIds = normalizedCategoryIds.filter((categoryId) => !recordById.has(categoryId));
    if (missingIds.length > 0) {
      throw new Error(`Categorias nao encontradas para os IDs: ${missingIds.join(', ')}`);
    }

    await replaceLocalBookCategoryRecordsByBook(bookId, normalizedCategoryIds, nowIso());

    const allLinks = await listLocalBookCategoryRecords();
    const booksCountByCategoryId = countBooksByCategoryId(allLinks);

    return sortRecords(
      normalizedCategoryIds
        .map((categoryId) => recordById.get(categoryId))
        .filter((record): record is LocalCategoryRecord => Boolean(record)),
    ).map((record) => toCategory(record, booksCountByCategoryId));
  }
}

