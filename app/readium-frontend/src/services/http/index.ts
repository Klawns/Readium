import { AxiosHttpClient } from './axios-client.ts';
import { HttpClient } from './types.ts';

// Em produção (Docker), o Nginx fará o proxy de /api para o backend.
// Em desenvolvimento local, usamos o proxy do Vite que também redireciona /api.
// Portanto, a baseURL deve ser sempre relativa '/api' para garantir que passe pelo proxy.
const baseURL = '/api';

export const httpClient: HttpClient = new AxiosHttpClient(baseURL);

export * from './types.ts';
