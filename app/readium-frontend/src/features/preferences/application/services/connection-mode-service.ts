export type ConnectionMode = 'SERVER' | 'LOCAL';

const CONNECTION_MODE_STORAGE_KEY = 'readium:connection-mode';
const DEFAULT_CONNECTION_MODE: ConnectionMode = 'SERVER';

const isBrowserStorageAvailable = (): boolean =>
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const isConnectionMode = (value: string | null): value is ConnectionMode =>
  value === 'SERVER' || value === 'LOCAL';

const readStoredConnectionMode = (): ConnectionMode | null => {
  if (!isBrowserStorageAvailable()) {
    return null;
  }

  try {
    const stored = window.localStorage.getItem(CONNECTION_MODE_STORAGE_KEY);
    return isConnectionMode(stored) ? stored : null;
  } catch {
    return null;
  }
};

const persistConnectionMode = (mode: ConnectionMode): void => {
  if (!isBrowserStorageAvailable()) {
    return;
  }

  try {
    window.localStorage.setItem(CONNECTION_MODE_STORAGE_KEY, mode);
  } catch {
    // Keep app functional even when storage is unavailable.
  }
};

const clearStoredConnectionMode = (): void => {
  if (!isBrowserStorageAvailable()) {
    return;
  }

  try {
    window.localStorage.removeItem(CONNECTION_MODE_STORAGE_KEY);
  } catch {
    // Ignore storage cleanup failures.
  }
};

let currentConnectionMode: ConnectionMode = readStoredConnectionMode() ?? DEFAULT_CONNECTION_MODE;

export const getConnectionMode = (): ConnectionMode => currentConnectionMode;

export const isLocalConnectionMode = (): boolean => getConnectionMode() === 'LOCAL';

export const saveConnectionMode = (mode: ConnectionMode): ConnectionMode => {
  currentConnectionMode = mode;
  persistConnectionMode(mode);
  return currentConnectionMode;
};

export const resetConnectionMode = (): ConnectionMode => {
  clearStoredConnectionMode();
  currentConnectionMode = DEFAULT_CONNECTION_MODE;
  return currentConnectionMode;
};

