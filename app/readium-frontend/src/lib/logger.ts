type LoggerLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent';

const LEVEL_PRIORITY: Record<LoggerLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  silent: 100,
};

const normalizeLevel = (value?: string | null): LoggerLevel | null => {
  if (!value) {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === 'debug' || normalized === 'info' || normalized === 'warn' || normalized === 'error' || normalized === 'silent') {
    return normalized;
  }

  return null;
};

const getStorageLevel = (): LoggerLevel | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return normalizeLevel(window.localStorage.getItem('readium:log-level'));
  } catch {
    return null;
  }
};

const resolveLogLevel = (): LoggerLevel =>
  getStorageLevel() ??
  normalizeLevel(import.meta.env.VITE_LOG_LEVEL) ??
  'silent';

const canLog = (level: Exclude<LoggerLevel, 'silent'>): boolean =>
  LEVEL_PRIORITY[level] >= LEVEL_PRIORITY[resolveLogLevel()];

const write = (scope: string, level: Exclude<LoggerLevel, 'silent'>, args: unknown[]) => {
  if (!canLog(level)) {
    return;
  }

  const prefix = `[${scope}]`;
  const payload = [prefix, ...args];

  if (level === 'debug' || level === 'info') {
    console.info(...payload);
    return;
  }

  if (level === 'warn') {
    console.warn(...payload);
    return;
  }

  console.error(...payload);
};

export const createLogger = (scope: string) => ({
  debug: (...args: unknown[]) => write(scope, 'debug', args),
  info: (...args: unknown[]) => write(scope, 'info', args),
  warn: (...args: unknown[]) => write(scope, 'warn', args),
  error: (...args: unknown[]) => write(scope, 'error', args),
});

