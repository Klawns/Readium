import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { createLogger } from '@/lib/logger.ts';
import { HttpClient, HttpRequest, HttpResponse } from './types.ts';

const logger = createLogger('http');

export class AxiosHttpClient implements HttpClient {
  private readonly api: AxiosInstance;
  private readonly baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.api = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        logger.error('API error', error);
        return Promise.reject(error);
      }
    );
  }

  async request<T = unknown>(data: HttpRequest): Promise<HttpResponse<T>> {
    // Se keepalive for true, usamos fetch nativo para garantir envio no unload
    if (data.keepalive) {
      const url = `${this.baseURL}${data.url}`;
      try {
        const response = await fetch(url, {
          method: data.method?.toUpperCase() || 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...data.headers,
          },
          body: data.body ? JSON.stringify(data.body) : undefined,
          keepalive: true,
        });
        
        // Fetch não lança erro em 4xx/5xx, precisamos verificar ok
        if (!response.ok) {
           // Em caso de beacon/keepalive, muitas vezes ignoramos o erro ou logamos apenas
           logger.warn(`Keepalive request failed: ${response.status}`);
        }

        // Para keepalive, geralmente não esperamos resposta JSON útil no unload,
        // mas mantemos a assinatura
        return {
          data: {} as T,
          status: response.status,
        };
      } catch (error) {
        logger.error('Keepalive fetch error', error);
        throw error;
      }
    }

    let response: AxiosResponse;
    try {
      response = await this.api.request({
        url: data.url,
        method: data.method,
        data: data.body,
        headers: data.headers,
        params: data.params,
        onUploadProgress: data.onUploadProgress
          ? (event) => {
              const total = event.total ?? 0;
              if (total <= 0) {
                return;
              }
              const progressPercent = Math.min(100, Math.max(0, Math.round((event.loaded * 100) / total)));
              data.onUploadProgress?.(progressPercent);
            }
          : undefined,
      });
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        response = error.response;
      } else {
        throw error;
      }
    }
    return {
      data: response.data,
      status: response.status,
    };
  }

  async get<T = unknown>(url: string, config?: Omit<HttpRequest, 'url' | 'method'>): Promise<HttpResponse<T>> {
    return this.request<T>({ ...config, url, method: 'get' });
  }

  async post<T = unknown>(url: string, body?: unknown, config?: Omit<HttpRequest, 'url' | 'method' | 'body'>): Promise<HttpResponse<T>> {
    return this.request<T>({ ...config, url, body, method: 'post' });
  }

  async put<T = unknown>(url: string, body?: unknown, config?: Omit<HttpRequest, 'url' | 'method' | 'body'>): Promise<HttpResponse<T>> {
    return this.request<T>({ ...config, url, body, method: 'put' });
  }

  async delete<T = unknown>(url: string, config?: Omit<HttpRequest, 'url' | 'method'>): Promise<HttpResponse<T>> {
    return this.request<T>({ ...config, url, method: 'delete' });
  }

  async patch<T = unknown>(url: string, body?: unknown, config?: Omit<HttpRequest, 'url' | 'method' | 'body'>): Promise<HttpResponse<T>> {
    return this.request<T>({ ...config, url, body, method: 'patch' });
  }
}
