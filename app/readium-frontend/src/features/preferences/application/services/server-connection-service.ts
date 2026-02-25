import {
  getApiBaseUrl,
  normalizeApiBaseUrl,
  resetApiBaseUrlOverride,
  saveApiBaseUrlOverride,
} from '@/services/http/api-base-url.ts';
import { probeApiBaseUrl, reconfigureHttpClient } from '@/services/http';

const DEFAULT_TEST_TIMEOUT_MS = 6_000;

const hasHttpProtocol = (value: string): boolean => /^https?:\/\//i.test(value);

const sanitizeServerAddress = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error('Informe o IP ou URL do servidor.');
  }

  if (trimmed.startsWith('/') || hasHttpProtocol(trimmed)) {
    return trimmed;
  }

  return `http://${trimmed}`;
};

export const getServerAddressInputValue = (): string => {
  const apiBaseUrl = getApiBaseUrl();
  if (!hasHttpProtocol(apiBaseUrl)) {
    return apiBaseUrl;
  }
  return apiBaseUrl.replace(/\/api$/i, '');
};

export const resolveApiBaseUrlFromServerAddress = (serverAddress: string): string =>
  normalizeApiBaseUrl(sanitizeServerAddress(serverAddress));

export const saveServerApiBaseUrl = (apiBaseUrl: string): string => {
  const normalized = saveApiBaseUrlOverride(apiBaseUrl);
  reconfigureHttpClient(normalized);
  return normalized;
};

export const restoreDefaultServerApiBaseUrl = (): string => {
  const fallbackApiBaseUrl = resetApiBaseUrlOverride();
  reconfigureHttpClient(fallbackApiBaseUrl);
  return fallbackApiBaseUrl;
};

export const testServerConnection = async (
  apiBaseUrl: string,
  timeoutMs: number = DEFAULT_TEST_TIMEOUT_MS,
): Promise<number> => probeApiBaseUrl(apiBaseUrl, '/books?page=0&size=1', timeoutMs);
