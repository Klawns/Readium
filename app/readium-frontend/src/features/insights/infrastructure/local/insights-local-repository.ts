import { offlineBooksDb } from '@/features/offline/infrastructure/storage/offline-books-db';
import type { Book, BookMetrics, BookRecommendation, ReadingEvolutionPoint, SmartCollection } from '@/types';
import type { InsightsRepository } from '../../domain/ports/InsightsRepository';

const DEFAULT_DAYS = 30;
const MIN_DAYS = 7;
const MAX_DAYS = 180;
const PREVIEW_SIZE = 4;

const toSafeStatus = (value: string | null): Book['status'] => {
  if (value === 'READING' || value === 'READ') {
    return value;
  }
  return 'TO_READ';
};

const toSafeFormat = (value: string | null): Book['format'] => (value === 'EPUB' ? 'EPUB' : 'PDF');

const safePositive = (value: number | null | undefined): number =>
  typeof value === 'number' && Number.isFinite(value) && value > 0 ? Math.trunc(value) : 0;

const safeProgressRatio = (book: Book, progressByBookId: Map<number, number>): number => {
  const pages = safePositive(book.pages);
  if (pages <= 0) {
    return 0;
  }
  const lastReadPage = Math.max(safePositive(book.lastReadPage), progressByBookId.get(book.id) ?? 0);
  return Math.min(1, lastReadPage / pages);
};

const estimateReadPages = (book: Book, progressByBookId: Map<number, number>): number => {
  const pages = safePositive(book.pages);
  const lastReadPage = Math.max(safePositive(book.lastReadPage), progressByBookId.get(book.id) ?? 0);
  if (pages <= 0) {
    return lastReadPage;
  }
  return Math.min(lastReadPage, pages);
};

const percent = (numerator: number, denominator: number): number => {
  if (denominator <= 0) {
    return 0;
  }
  return Math.round((numerator * 100) / denominator);
};

const sanitizeDays = (requestedDays?: number): number => {
  if (typeof requestedDays !== 'number' || !Number.isFinite(requestedDays)) {
    return DEFAULT_DAYS;
  }
  const days = Math.trunc(requestedDays);
  return Math.max(MIN_DAYS, Math.min(MAX_DAYS, days));
};

const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseDate = (value: string): Date | null => {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const listLocalBooks = async (): Promise<Book[]> => {
  const snapshots = await offlineBooksDb.booksOffline.toArray();
  return snapshots.map((snapshot) => ({
    id: snapshot.bookId,
    title: snapshot.title ?? `Livro ${snapshot.bookId}`,
    author: snapshot.author ?? null,
    pages: snapshot.pages ?? null,
    format: toSafeFormat(snapshot.format),
    status: toSafeStatus(snapshot.status),
    coverUrl: snapshot.coverUrl ?? null,
    lastReadPage: snapshot.lastReadPage ?? null,
  }));
};

const mapProgressByBookId = async (): Promise<Map<number, number>> => {
  const records = await offlineBooksDb.readingProgressLocal.toArray();
  return new Map(
    records.map((record) => [record.bookId, safePositive(record.page)]),
  );
};

const mapCategorizedBooks = async (): Promise<Set<number>> => {
  const links = await offlineBooksDb.bookCategoriesLocal.toArray();
  return new Set(links.map((link) => link.bookId));
};

const toPreviewBooks = (
  books: Book[],
  progressByBookId: Map<number, number>,
): Book[] =>
  [...books]
    .sort((left, right) => {
      const progressDelta = safeProgressRatio(right, progressByBookId) - safeProgressRatio(left, progressByBookId);
      if (progressDelta !== 0) {
        return progressDelta;
      }
      return right.id - left.id;
    })
    .slice(0, PREVIEW_SIZE);

const buildSmartCollections = (
  books: Book[],
  categorizedBookIds: Set<number>,
  progressByBookId: Map<number, number>,
): SmartCollection[] => {
  const readingBooks = books.filter((book) => book.status === 'READING');
  const almostFinished = readingBooks.filter((book) => {
    const progress = safeProgressRatio(book, progressByBookId);
    return progress >= 0.8 && progress < 1;
  });
  const uncategorized = books.filter((book) => !categorizedBookIds.has(book.id));
  const quickWins = books.filter(
    (book) => book.status === 'TO_READ' && safePositive(book.pages) > 0 && safePositive(book.pages) <= 220,
  );

  return [
    {
      id: 'continue-reading',
      name: 'Continuar lendo',
      description: 'Livros em andamento para manter consistencia.',
      totalBooks: readingBooks.length,
      previewBooks: toPreviewBooks(readingBooks, progressByBookId),
    },
    {
      id: 'almost-finished',
      name: 'Quase finalizados',
      description: 'Titulos acima de 80% para fechar rapido.',
      totalBooks: almostFinished.length,
      previewBooks: toPreviewBooks(almostFinished, progressByBookId),
    },
    {
      id: 'uncategorized',
      name: 'Sem categoria',
      description: 'Livros que ainda nao foram classificados.',
      totalBooks: uncategorized.length,
      previewBooks: toPreviewBooks(uncategorized, progressByBookId),
    },
    {
      id: 'quick-wins',
      name: 'Leituras rapidas',
      description: 'Titulos curtos para ganhar tracao de leitura.',
      totalBooks: quickWins.length,
      previewBooks: toPreviewBooks(quickWins, progressByBookId),
    },
  ];
};

const buildRecommendations = (
  books: Book[],
  categorizedBookIds: Set<number>,
  progressByBookId: Map<number, number>,
  limit: number,
): BookRecommendation[] =>
  books
    .filter((book) => book.status !== 'READ')
    .map((book) => {
      const progress = safeProgressRatio(book, progressByBookId);
      const pages = safePositive(book.pages);
      const quickWin = pages > 0 && pages <= 220;
      const categorized = categorizedBookIds.has(book.id);

      let score = book.status === 'READING' ? 80 : 34;
      score += progress * 35;
      if (quickWin) {
        score += 15;
      }
      if (!categorized) {
        score -= 4;
      }
      score += (book.id % 7) * 0.1;

      let reason = 'Boa opcao para a fila de leitura atual.';
      if (book.status === 'READING' && progress >= 0.8) {
        reason = 'Voce esta perto de concluir este livro.';
      } else if (book.status === 'READING') {
        reason = 'Voce ja iniciou este livro e manter ritmo acelera a conclusao.';
      } else if (quickWin) {
        reason = 'Leitura curta para gerar tracao rapida.';
      } else if (!categorized) {
        reason = 'Boa opcao para ler e depois classificar.';
      }

      return {
        book,
        reason,
        score: Math.round(score * 10) / 10,
      };
    })
    .sort((left, right) => right.score - left.score || right.book.id - left.book.id)
    .slice(0, Math.max(1, Math.min(12, Math.trunc(limit))));

const buildEvolution = async (days: number): Promise<ReadingEvolutionPoint[]> => {
  const end = new Date();
  end.setHours(0, 0, 0, 0);
  const start = new Date(end);
  start.setDate(start.getDate() - (days - 1));

  const progressRecords = await offlineBooksDb.readingProgressLocal.toArray();
  const byDate = new Map<string, ReadingEvolutionPoint>();

  progressRecords.forEach((record) => {
    const parsedDate = parseDate(record.updatedAt);
    if (!parsedDate) {
      return;
    }

    parsedDate.setHours(0, 0, 0, 0);
    if (parsedDate < start || parsedDate > end) {
      return;
    }

    const dateKey = formatDate(parsedDate);
    const current = byDate.get(dateKey) ?? {
      date: dateKey,
      pagesRead: 0,
      booksTouched: 0,
      progressUpdates: 0,
    };

    byDate.set(dateKey, {
      date: dateKey,
      pagesRead: current.pagesRead + safePositive(record.page),
      booksTouched: current.booksTouched + 1,
      progressUpdates: current.progressUpdates + 1,
    });
  });

  const response: ReadingEvolutionPoint[] = [];
  for (let i = 0; i < days; i += 1) {
    const cursor = new Date(start);
    cursor.setDate(start.getDate() + i);
    const dateKey = formatDate(cursor);
    response.push(
      byDate.get(dateKey) ?? {
        date: dateKey,
        pagesRead: 0,
        booksTouched: 0,
        progressUpdates: 0,
      },
    );
  }
  return response;
};

export class InsightsLocalRepository implements InsightsRepository {
  async getMetrics(): Promise<BookMetrics> {
    const [books, categorizedBookIds, progressByBookId] = await Promise.all([
      listLocalBooks(),
      mapCategorizedBooks(),
      mapProgressByBookId(),
    ]);

    const totalBooks = books.length;
    const toReadBooks = books.filter((book) => book.status === 'TO_READ').length;
    const readingBooks = books.filter((book) => book.status === 'READING').length;
    const readBooks = books.filter((book) => book.status === 'READ').length;
    const categorizedBooks = books.filter((book) => categorizedBookIds.has(book.id)).length;
    const uncategorizedBooks = Math.max(0, totalBooks - categorizedBooks);
    const totalPagesKnown = books.reduce((total, book) => total + safePositive(book.pages), 0);
    const pagesRead = books.reduce((total, book) => total + estimateReadPages(book, progressByBookId), 0);

    const booksWithKnownPages = books.filter((book) => safePositive(book.pages) > 0);
    const averageProgressPercent = booksWithKnownPages.length === 0
      ? 0
      : Math.round(
          (booksWithKnownPages.reduce(
            (total, book) => total + safeProgressRatio(book, progressByBookId),
            0,
          ) /
            booksWithKnownPages.length) *
            100,
        );

    return {
      totalBooks,
      toReadBooks,
      readingBooks,
      readBooks,
      categorizedBooks,
      uncategorizedBooks,
      totalPagesKnown,
      pagesRead,
      averageProgressPercent,
      completionPercent: percent(readBooks, totalBooks),
    };
  }

  async getSmartCollections(): Promise<SmartCollection[]> {
    const [books, categorizedBookIds, progressByBookId] = await Promise.all([
      listLocalBooks(),
      mapCategorizedBooks(),
      mapProgressByBookId(),
    ]);
    return buildSmartCollections(books, categorizedBookIds, progressByBookId);
  }

  async getRecommendations(limit = 6): Promise<BookRecommendation[]> {
    const [books, categorizedBookIds, progressByBookId] = await Promise.all([
      listLocalBooks(),
      mapCategorizedBooks(),
      mapProgressByBookId(),
    ]);
    return buildRecommendations(books, categorizedBookIds, progressByBookId, limit);
  }

  async getEvolution(days = DEFAULT_DAYS): Promise<ReadingEvolutionPoint[]> {
    return buildEvolution(sanitizeDays(days));
  }
}
