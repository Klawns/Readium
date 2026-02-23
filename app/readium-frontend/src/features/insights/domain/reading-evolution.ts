export interface ReadingMetricsSnapshot {
  dateKey: string;
  pagesRead: number;
  completionPercent: number;
  readingBooks: number;
  readBooks: number;
  totalBooks: number;
}

export interface ReadingEvolutionSummary {
  totalPagesRead: number;
  pagesDelta7: number;
  completionPercent: number;
  completionDelta7: number;
  avgPagesPerDay7: number;
  activeDays14: number;
  streakDays: number;
}

export interface ReadingDailyProgressPoint {
  dateKey: string;
  label: string;
  pagesRead: number;
  booksTouched: number;
  progressUpdates: number;
}

export interface ReadingEvolutionContext {
  totalPages30: number;
  activeDays30: number;
  totalBooksTouched30: number;
  totalProgressUpdates30: number;
  bestDayLabel: string;
  bestDayPages: number;
}
