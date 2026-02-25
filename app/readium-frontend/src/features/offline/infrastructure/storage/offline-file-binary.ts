import { httpClient } from '@/services/http';

const toDownloadErrorMessage = (status: number): string => {
  if (status === 401 || status === 403) {
    return 'Falha ao baixar arquivo offline: acesso nao autorizado.';
  }
  if (status === 404) {
    return 'Falha ao baixar arquivo offline: livro nao encontrado no servidor.';
  }
  if (status >= 500) {
    return 'Falha ao baixar arquivo offline: servidor indisponivel.';
  }
  return `Falha ao baixar arquivo (${status}).`;
};

export const fetchArrayBuffer = async (url: string): Promise<ArrayBuffer> => {
  try {
    const response = await httpClient.get<ArrayBuffer>(url, { responseType: 'arraybuffer' });
    if (response.status >= 400) {
      throw new Error(toDownloadErrorMessage(response.status));
    }
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Falha ao baixar arquivo offline.');
  }
};
