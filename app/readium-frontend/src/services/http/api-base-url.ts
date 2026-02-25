import { Capacitor } from '@capacitor/core';

const API_PREFIX = '/api';
const WEB_DEFAULT_API_BASE_URL = API_PREFIX;
const MOBILE_DEFAULT_API_BASE_URL = API_PREFIX;
const API_BASE_URL_STORAGE_KEY = 'readium:api-base-url';

const hasHttpProtocol = (value: string): boolean => /^https?:\/\//i.test(value);

const trimTrailingSlashes = (value: string): string => value.replace(/\/+$/, '');

const ensureApiPath = (path: string): string => {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (normalized.startsWith(API_PREFIX)) {
    return normalized;
  }
  return `${API_PREFIX}${normalized}`;
};

export const normalizeApiBaseUrl = (rawValue: string): string => {
  const value = trimTrailingSlashes(rawValue.trim());
  if (!value) {
    return WEB_DEFAULT_API_BASE_URL;
  }

  if (hasHttpProtocol(value)) {
    return value.endsWith(API_PREFIX) ? value : `${value}${API_PREFIX}`;
  }

  if (value === '/') {
    return WEB_DEFAULT_API_BASE_URL;
  }

  const normalized = value.startsWith('/') ? value : `/${value}`;
  return normalized.endsWith(API_PREFIX) ? normalized : `${normalized}${API_PREFIX}`;
};

const isStorageAvailable = (): boolean => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const readStoredApiBaseUrl = (): string | null => {
  if (!isStorageAvailable()) {
    return null;
  }

  try {
    return window.localStorage.getItem(API_BASE_URL_STORAGE_KEY);
  } catch {
    return null;
  }
};

const persistApiBaseUrl = (value: string): void => {
  if (!isStorageAvailable()) {
    return;
  }

  try {
    window.localStorage.setItem(API_BASE_URL_STORAGE_KEY, value);
  } catch {
    // Em alguns dispositivos o storage pode estar indisponivel.
  }
};

const clearStoredApiBaseUrl = (): void => {
  if (!isStorageAvailable()) {
    return;
  }

  try {
    window.localStorage.removeItem(API_BASE_URL_STORAGE_KEY);
  } catch {
    // Sem impacto funcional caso a limpeza falhe.
  }
};

const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const configuredMobileApiBaseUrl = import.meta.env.VITE_MOBILE_API_BASE_URL?.trim();

const resolveDefaultApiBaseUrl = (): string => {
  if (Capacitor.isNativePlatform()) {
    return configuredMobileApiBaseUrl || configuredApiBaseUrl || MOBILE_DEFAULT_API_BASE_URL;
  }
  return configuredApiBaseUrl || WEB_DEFAULT_API_BASE_URL;
};

const resolveFallbackApiBaseUrl = (): string => normalizeApiBaseUrl(resolveDefaultApiBaseUrl());

const resolveInitialApiBaseUrl = (): string => {
  const stored = readStoredApiBaseUrl();
  if (stored && stored.trim()) {
    return normalizeApiBaseUrl(stored);
  }
  return resolveFallbackApiBaseUrl();
};

let currentApiBaseUrl = resolveInitialApiBaseUrl();

export const getApiBaseUrl = (): string => currentApiBaseUrl;

export const setApiBaseUrl = (rawValue: string): string => {
  currentApiBaseUrl = normalizeApiBaseUrl(rawValue);
  return currentApiBaseUrl;
};

export const saveApiBaseUrlOverride = (rawValue: string): string => {
  const normalized = setApiBaseUrl(rawValue);
  persistApiBaseUrl(normalized);
  return normalized;
};

export const resetApiBaseUrlOverride = (): string => {
  clearStoredApiBaseUrl();
  currentApiBaseUrl = resolveFallbackApiBaseUrl();
  return currentApiBaseUrl;
};

export const toApiUrlWithBase = (apiBaseUrl: string, path: string): string => {
  const normalizedApiBaseUrl = normalizeApiBaseUrl(apiBaseUrl);
  if (hasHttpProtocol(path)) {
    return path;
  }

  const apiPath = ensureApiPath(path);
  if (hasHttpProtocol(normalizedApiBaseUrl)) {
    return `${normalizedApiBaseUrl}${apiPath.slice(API_PREFIX.length)}`;
  }
  return apiPath;
};

export const toApiUrl = (path: string): string => {
  return toApiUrlWithBase(currentApiBaseUrl, path);
};

export const toApiAssetUrl = (value: string | null): string | null => {
  if (!value) {
    return null;
  }

  if (hasHttpProtocol(value)) {
    try {
      const parsed = new URL(value);
      const pathWithQuery = `${parsed.pathname}${parsed.search ?? ''}`;
      return toApiUrlWithBase(currentApiBaseUrl, pathWithQuery);
    } catch {
      return value;
    }
  }

  return toApiUrlWithBase(currentApiBaseUrl, value);
};
