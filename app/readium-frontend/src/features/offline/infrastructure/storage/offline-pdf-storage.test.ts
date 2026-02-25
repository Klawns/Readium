import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  mockCapacitor,
  mockAddListener,
  mockDownloadFile,
  mockFilesystem,
} = vi.hoisted(() => ({
  mockCapacitor: {
    getPlatform: vi.fn(() => 'web'),
    isNativePlatform: vi.fn(() => false),
    convertFileSrc: vi.fn((uri: string) => `webview://${uri}`),
  },
  mockAddListener: vi.fn(),
  mockDownloadFile: vi.fn(),
  mockFilesystem: {
    mkdir: vi.fn(),
    getUri: vi.fn(),
    stat: vi.fn(),
    deleteFile: vi.fn(),
  },
}));

vi.mock('@capacitor/core', () => ({
  Capacitor: mockCapacitor,
}));

vi.mock('@capacitor/file-transfer', () => ({
  FileTransfer: {
    addListener: mockAddListener,
    downloadFile: mockDownloadFile,
  },
}));

vi.mock('@capacitor/filesystem', () => ({
  Directory: {
    Data: 'DATA',
  },
  Filesystem: mockFilesystem,
}));

import {
  downloadOfflinePdfToNativeStorage,
  removeOfflinePdf,
  storeOfflinePdfInIndexedDb,
} from './offline-pdf-storage';

describe('offline-pdf-storage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCapacitor.getPlatform.mockReturnValue('web');
    mockCapacitor.isNativePlatform.mockReturnValue(false);
    mockCapacitor.convertFileSrc.mockImplementation((uri: string) => `webview://${uri}`);
    mockFilesystem.mkdir.mockResolvedValue(undefined);
    mockFilesystem.getUri.mockResolvedValue({ uri: 'file:///offline-books/book-7.pdf' });
    mockFilesystem.stat.mockResolvedValue({ size: 987 });
    mockFilesystem.deleteFile.mockResolvedValue(undefined);
    mockDownloadFile.mockResolvedValue({ path: 'file:///offline-books/book-7.pdf' });
    mockAddListener.mockResolvedValue({ remove: vi.fn().mockResolvedValue(undefined) });
  });

  it('salva PDF em IndexedDB no web como Blob', async () => {
    const buffer = new Uint8Array([1, 2, 3, 4]).buffer;

    const stored = await storeOfflinePdfInIndexedDb(buffer);

    expect(stored.storageType).toBe('indexeddb');
    expect(stored.fileBlob).toBeInstanceOf(Blob);
    expect(stored.sizeBytes).toBe(4);
    expect(stored.filePath).toBe('');
  });

  it('falha ao tentar download nativo fora de plataforma nativa', async () => {
    await expect(downloadOfflinePdfToNativeStorage(7, {
      fileUrl: 'https://api.readium.local/books/7/file',
    })).rejects.toThrow('Download nativo indisponivel');
  });

  it('faz download nativo com progress e remove listener ao final', async () => {
    mockCapacitor.isNativePlatform.mockReturnValue(true);
    mockCapacitor.getPlatform.mockReturnValue('android');

    const removeListener = vi.fn().mockResolvedValue(undefined);
    mockAddListener.mockResolvedValue({ remove: removeListener });

    const onProgress = vi.fn();
    const promise = downloadOfflinePdfToNativeStorage(7, {
      fileUrl: 'https://api.readium.local/books/7/file',
      onProgress,
    });

    await vi.waitFor(() => expect(mockAddListener).toHaveBeenCalledTimes(1));
    const progressCallback = mockAddListener.mock.calls[0][1] as (progress: {
      type: 'download';
      url: string;
      bytes: number;
      contentLength: number;
      lengthComputable: boolean;
    }) => void;

    progressCallback({
      type: 'download',
      url: 'https://api.readium.local/books/7/file',
      bytes: 50,
      contentLength: 100,
      lengthComputable: true,
    });

    const stored = await promise;

    expect(mockDownloadFile).toHaveBeenCalledWith(expect.objectContaining({
      url: 'https://api.readium.local/books/7/file',
      progress: true,
    }));
    expect(onProgress).toHaveBeenCalledWith(expect.objectContaining({
      bytes: 50,
      progressPercent: 50,
    }));
    expect(removeListener).toHaveBeenCalled();
    expect(stored.storageType).toBe('native-filesystem');
    expect(stored.sizeBytes).toBe(987);
  });

  it('remove listener mesmo quando download falha', async () => {
    mockCapacitor.isNativePlatform.mockReturnValue(true);
    mockCapacitor.getPlatform.mockReturnValue('android');

    const removeListener = vi.fn().mockResolvedValue(undefined);
    mockAddListener.mockResolvedValue({ remove: removeListener });
    mockDownloadFile.mockRejectedValue(new Error('falha de rede'));

    await expect(downloadOfflinePdfToNativeStorage(7, {
      fileUrl: 'https://api.readium.local/books/7/file',
      onProgress: vi.fn(),
    })).rejects.toThrow('falha de rede');

    expect(removeListener).toHaveBeenCalled();
  });

  it('ignora remocao quando filePath vazio', async () => {
    await removeOfflinePdf('');
    expect(mockFilesystem.deleteFile).not.toHaveBeenCalled();
  });
});
