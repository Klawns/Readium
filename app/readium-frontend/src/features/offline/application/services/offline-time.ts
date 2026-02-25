export const nowIso = (): string => new Date().toISOString();

export const isoAfterDelay = (delayMs: number): string =>
  new Date(Date.now() + Math.max(0, delayMs)).toISOString();
