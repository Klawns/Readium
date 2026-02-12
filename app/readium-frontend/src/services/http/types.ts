export interface HttpRequest<T = unknown> {
  url: string;
  method?: 'get' | 'post' | 'put' | 'delete' | 'patch';
  body?: T;
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
  keepalive?: boolean;
}

export interface HttpResponse<T = unknown> {
  data: T;
  status: number;
}

export interface HttpClient {
  request<T = unknown>(data: HttpRequest<T>): Promise<HttpResponse<T>>;
  get<T = unknown>(url: string, config?: Omit<HttpRequest, 'url' | 'method'>): Promise<HttpResponse<T>>;
  post<T = unknown>(url: string, body?: unknown, config?: Omit<HttpRequest, 'url' | 'method' | 'body'>): Promise<HttpResponse<T>>;
  put<T = unknown>(url: string, body?: unknown, config?: Omit<HttpRequest, 'url' | 'method' | 'body'>): Promise<HttpResponse<T>>;
  delete<T = unknown>(url: string, config?: Omit<HttpRequest, 'url' | 'method'>): Promise<HttpResponse<T>>;
  patch<T = unknown>(url: string, body?: unknown, config?: Omit<HttpRequest, 'url' | 'method' | 'body'>): Promise<HttpResponse<T>>;
}
