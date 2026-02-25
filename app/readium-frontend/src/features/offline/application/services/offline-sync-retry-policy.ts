const INITIAL_RETRY_DELAY_MS = 2_000;
const MAX_RETRY_DELAY_MS = 60_000;

export const computeRetryDelayMs = (attemptCount: number): number => {
  const exponentialDelay = INITIAL_RETRY_DELAY_MS * 2 ** Math.max(0, attemptCount - 1);
  return Math.min(MAX_RETRY_DELAY_MS, exponentialDelay);
};
