import { AxiosHttpClient } from './axios-client.ts';
import { getApiBaseUrl, setApiBaseUrl, toApiUrlWithBase } from './api-base-url.ts';
import type { HttpClient, HttpRequest, HttpResponse } from './types.ts';

let currentHttpClient: HttpClient = new AxiosHttpClient(getApiBaseUrl());

const withClient = <T>(callback: (client: HttpClient) => Promise<T>): Promise<T> => callback(currentHttpClient);

export const reconfigureHttpClient = (rawApiBaseUrl: string): string => {
  const normalizedApiBaseUrl = setApiBaseUrl(rawApiBaseUrl);
  currentHttpClient = new AxiosHttpClient(normalizedApiBaseUrl);
  return normalizedApiBaseUrl;
};

export const probeApiBaseUrl = async (
  apiBaseUrl: string,
  endpoint: string,
  timeoutMs: number,
): Promise<number> => {
  const probeUrl = toApiUrlWithBase(apiBaseUrl, endpoint);
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(probeUrl, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Servidor respondeu com status ${response.status}.`);
    }
    return response.status;
  } catch (error: unknown) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('Timeout ao conectar no servidor. Verifique IP/porta e rede.');
    }
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
};

export const httpClient: HttpClient = {
  request: <T = unknown>(data: HttpRequest): Promise<HttpResponse<T>> =>
    withClient((client) => client.request<T>(data)),
  get: <T = unknown>(url: string, config?: Omit<HttpRequest, 'url' | 'method'>): Promise<HttpResponse<T>> =>
    withClient((client) => client.get<T>(url, config)),
  post: <T = unknown>(url: string, body?: unknown, config?: Omit<HttpRequest, 'url' | 'method' | 'body'>): Promise<HttpResponse<T>> =>
    withClient((client) => client.post<T>(url, body, config)),
  put: <T = unknown>(url: string, body?: unknown, config?: Omit<HttpRequest, 'url' | 'method' | 'body'>): Promise<HttpResponse<T>> =>
    withClient((client) => client.put<T>(url, body, config)),
  delete: <T = unknown>(url: string, config?: Omit<HttpRequest, 'url' | 'method'>): Promise<HttpResponse<T>> =>
    withClient((client) => client.delete<T>(url, config)),
  patch: <T = unknown>(url: string, body?: unknown, config?: Omit<HttpRequest, 'url' | 'method' | 'body'>): Promise<HttpResponse<T>> =>
    withClient((client) => client.patch<T>(url, body, config)),
};

export * from './types.ts';
