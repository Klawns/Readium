import type { BookMetrics, ReadingEvolutionPoint } from '@/types';
import type {
  ReadingEvolutionContext,
  ReadingDailyProgressPoint,
  ReadingEvolutionSummary,
} from '../../domain/reading-evolution';

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

const toLabel = (dateKey: string): string => {
  const [year, month, day] = dateKey.split('-').map(Number);
  if (!year || !month || !day) {
    return dateKey;
  }
  return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}`;
};

const sumPages = (points: ReadingDailyProgressPoint[]): number => (
  points.reduce((total, point) => total + point.pagesRead, 0)
);

const calculateStreak = (points: ReadingDailyProgressPoint[]): number => {
  let streak = 0;
  for (let index = points.length - 1; index >= 0; index -= 1) {
    if (points[index].pagesRead > 0) {
      streak += 1;
      continue;
    }
    break;
  }
  return streak;
};

export const mapEvolutionPointsToDailyProgress = (
  points: ReadingEvolutionPoint[],
): ReadingDailyProgressPoint[] => (
  points
    .slice()
    .sort((left, right) => left.date.localeCompare(right.date))
    .map((point) => ({
      dateKey: point.date,
      label: toLabel(point.date),
      pagesRead: Math.max(0, Math.round(point.pagesRead)),
      booksTouched: Math.max(0, Math.round(point.booksTouched)),
      progressUpdates: Math.max(0, Math.round(point.progressUpdates)),
    }))
);

export const buildReadingEvolutionSummary = (
  metrics: BookMetrics,
  dailyProgress: ReadingDailyProgressPoint[],
  paceWindowDays = 7,
  consistencyWindowDays = 14,
): ReadingEvolutionSummary => {
  const series7 = dailyProgress.slice(-Math.max(1, paceWindowDays));
  const series14 = dailyProgress.slice(-Math.max(1, consistencyWindowDays));

  const pagesDelta7 = sumPages(series7);
  const activeDays14 = series14.filter((point) => point.pagesRead > 0).length;

  const completionPercent = clamp(metrics.completionPercent, 0, 100);
  let completionDelta7 = 0;
  if (metrics.totalPagesKnown > 0) {
    const baselinePagesRead = Math.max(0, metrics.pagesRead - pagesDelta7);
    const baselineCompletion = clamp((baselinePagesRead / metrics.totalPagesKnown) * 100, 0, 100);
    completionDelta7 = completionPercent - baselineCompletion;
  }

  return {
    totalPagesRead: Math.max(0, Math.round(metrics.pagesRead)),
    pagesDelta7,
    completionPercent,
    completionDelta7,
    avgPagesPerDay7: pagesDelta7 / Math.max(1, series7.length),
    activeDays14,
    streakDays: calculateStreak(series14),
  };
};

export const buildReadingEvolutionContext = (
  dailyProgress: ReadingDailyProgressPoint[],
): ReadingEvolutionContext => {
  const normalized = dailyProgress.slice();

  const totalPages30 = sumPages(normalized);
  const activeDays30 = normalized.filter((point) => point.pagesRead > 0).length;
  const totalBooksTouched30 = normalized.reduce((total, point) => total + point.booksTouched, 0);
  const totalProgressUpdates30 = normalized.reduce((total, point) => total + point.progressUpdates, 0);

  const bestDay = normalized.reduce<ReadingDailyProgressPoint | null>((best, current) => {
    if (!best) {
      return current;
    }
    if (current.pagesRead > best.pagesRead) {
      return current;
    }
    return best;
  }, null);

  return {
    totalPages30,
    activeDays30,
    totalBooksTouched30,
    totalProgressUpdates30,
    bestDayLabel: bestDay ? bestDay.label : '-',
    bestDayPages: bestDay ? bestDay.pagesRead : 0,
  };
};
