import type { BookStatus } from '@/types';

interface ReadingProgressInput {
  status: BookStatus | null | undefined;
  pages: number | null | undefined;
  lastReadPage: number | null | undefined;
}

export interface ReadingProgressState {
  progressPercent: number;
  knownPages: number;
  readPages: number;
  shouldRenderProgressBar: boolean;
}

const toSafePositiveInt = (value: number | null | undefined): number => {
  if (!Number.isFinite(value) || value == null) {
    return 0;
  }
  return Math.max(0, Math.floor(value));
};

const clampPercentage = (value: number): number => Math.max(0, Math.min(100, value));

export const getBookReadingProgress = ({
  status,
  pages,
  lastReadPage,
}: ReadingProgressInput): ReadingProgressState => {
  const knownPages = toSafePositiveInt(pages);
  const rawLastReadPage = toSafePositiveInt(lastReadPage);
  const readPages = knownPages > 0
    ? Math.max(0, Math.min(rawLastReadPage, knownPages))
    : rawLastReadPage;

  let progressPercent = 0;

  if (status === 'READ' || (knownPages > 0 && readPages >= knownPages)) {
    progressPercent = 100;
  } else if (knownPages > 0 && readPages > 0) {
    progressPercent = Math.round((readPages / knownPages) * 100);
  } else if (status === 'READING') {
    progressPercent = 5;
  }

  const normalizedProgressPercent = clampPercentage(progressPercent);

  return {
    progressPercent: normalizedProgressPercent,
    knownPages,
    readPages,
    shouldRenderProgressBar: status === 'READING'
      || (normalizedProgressPercent > 0 && normalizedProgressPercent < 100),
  };
};
