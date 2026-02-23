import type { BookMetrics } from '@/types';
import type {
  ReadingDailyProgressPoint,
  ReadingEvolutionSummary,
  ReadingMetricsSnapshot,
} from '../../domain/reading-evolution';

const STORAGE_KEY = 'readium:insights:evolution-history';
const MAX_SNAPSHOTS = 180;

const toDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseDateKey = (dateKey: string): Date => {
  const [year, month, day] = dateKey.split('-').map((part) => Number(part));
  return new Date(year, month - 1, day, 12, 0, 0, 0);
};

const shiftDateKey = (dateKey: string, dayOffset: number): string => {
  const date = parseDateKey(dateKey);
  date.setDate(date.getDate() + dayOffset);
  return toDateKey(date);
};

const toProgressLabel = (dateKey: string): string => {
  const date = parseDateKey(dateKey);
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
};

const isValidSnapshot = (value: unknown): value is ReadingMetricsSnapshot => {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const snapshot = value as Record<string, unknown>;
  return (
    typeof snapshot.dateKey === 'string' &&
    typeof snapshot.pagesRead === 'number' &&
    typeof snapshot.completionPercent === 'number' &&
    typeof snapshot.readingBooks === 'number' &&
    typeof snapshot.readBooks === 'number' &&
    typeof snapshot.totalBooks === 'number'
  );
};

const compareDateKey = (left: string, right: string) => left.localeCompare(right);

const findLastSnapshotAtOrBefore = (
  snapshots: ReadingMetricsSnapshot[],
  dateKey: string,
): ReadingMetricsSnapshot | null => {
  for (let index = snapshots.length - 1; index >= 0; index -= 1) {
    const snapshot = snapshots[index];
    if (compareDateKey(snapshot.dateKey, dateKey) <= 0) {
      return snapshot;
    }
  }
  return null;
};

const toSnapshot = (metrics: BookMetrics, dateKey: string): ReadingMetricsSnapshot => ({
  dateKey,
  pagesRead: Math.max(0, Math.round(metrics.pagesRead)),
  completionPercent: Math.max(0, Math.min(100, metrics.completionPercent)),
  readingBooks: Math.max(0, Math.round(metrics.readingBooks)),
  readBooks: Math.max(0, Math.round(metrics.readBooks)),
  totalBooks: Math.max(0, Math.round(metrics.totalBooks)),
});

export const readEvolutionSnapshots = (): ReadingMetricsSnapshot[] => {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed
      .filter(isValidSnapshot)
      .sort((left, right) => compareDateKey(left.dateKey, right.dateKey));
  } catch {
    return [];
  }
};

export const saveEvolutionSnapshots = (snapshots: ReadingMetricsSnapshot[]): void => {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshots));
};

export const upsertEvolutionSnapshot = (
  snapshots: ReadingMetricsSnapshot[],
  metrics: BookMetrics,
  now: Date = new Date(),
): ReadingMetricsSnapshot[] => {
  const dateKey = toDateKey(now);
  const current = toSnapshot(metrics, dateKey);
  const next = [...snapshots];

  const existingIndex = next.findIndex((snapshot) => snapshot.dateKey === dateKey);
  if (existingIndex >= 0) {
    next[existingIndex] = current;
  } else {
    next.push(current);
  }

  next.sort((left, right) => compareDateKey(left.dateKey, right.dateKey));

  if (next.length > MAX_SNAPSHOTS) {
    return next.slice(next.length - MAX_SNAPSHOTS);
  }
  return next;
};

export const buildDailyProgressSeries = (
  snapshots: ReadingMetricsSnapshot[],
  totalDays: number,
): ReadingDailyProgressPoint[] => {
  if (totalDays <= 0) {
    return [];
  }

  const endDateKey = toDateKey(new Date());
  const startDateKey = shiftDateKey(endDateKey, -(totalDays - 1));

  const snapshotBeforeStart = findLastSnapshotAtOrBefore(
    snapshots,
    shiftDateKey(startDateKey, -1),
  );
  let previousPagesRead = snapshotBeforeStart?.pagesRead ?? 0;

  const series: ReadingDailyProgressPoint[] = [];
  for (let index = 0; index < totalDays; index += 1) {
    const dateKey = shiftDateKey(startDateKey, index);
    const currentSnapshot = findLastSnapshotAtOrBefore(snapshots, dateKey);
    const currentPagesRead = currentSnapshot?.pagesRead ?? previousPagesRead;
    const pagesRead = Math.max(0, currentPagesRead - previousPagesRead);

    series.push({
      dateKey,
      label: toProgressLabel(dateKey),
      pagesRead,
    });
    previousPagesRead = currentPagesRead;
  }

  return series;
};

const calculateStreak = (series: ReadingDailyProgressPoint[]): number => {
  let streak = 0;
  for (let index = series.length - 1; index >= 0; index -= 1) {
    if (series[index].pagesRead > 0) {
      streak += 1;
    } else {
      break;
    }
  }
  return streak;
};

export const buildReadingEvolutionSummary = (
  metrics: BookMetrics,
  snapshots: ReadingMetricsSnapshot[],
): ReadingEvolutionSummary => {
  const normalizedSnapshots = snapshots
    .slice()
    .sort((left, right) => compareDateKey(left.dateKey, right.dateKey));
  const latestDateKey = toDateKey(new Date());

  const latestSnapshot = findLastSnapshotAtOrBefore(normalizedSnapshots, latestDateKey);
  const baseline7 = findLastSnapshotAtOrBefore(
    normalizedSnapshots,
    shiftDateKey(latestDateKey, -7),
  );

  const pagesDelta7 = latestSnapshot && baseline7
    ? Math.max(0, latestSnapshot.pagesRead - baseline7.pagesRead)
    : 0;
  const completionDelta7 = latestSnapshot && baseline7
    ? latestSnapshot.completionPercent - baseline7.completionPercent
    : 0;

  const series14 = buildDailyProgressSeries(normalizedSnapshots, 14);
  const series7 = series14.slice(-7);
  const totalPages7 = series7.reduce((total, point) => total + point.pagesRead, 0);
  const activeDays14 = series14.filter((point) => point.pagesRead > 0).length;

  return {
    totalPagesRead: Math.max(0, Math.round(metrics.pagesRead)),
    pagesDelta7,
    completionPercent: Math.max(0, Math.min(100, metrics.completionPercent)),
    completionDelta7,
    avgPagesPerDay7: totalPages7 / 7,
    activeDays14,
    streakDays: calculateStreak(series14),
  };
};
