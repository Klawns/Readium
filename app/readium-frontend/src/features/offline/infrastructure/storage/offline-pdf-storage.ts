import { Capacitor, type HttpHeaders } from '@capacitor/core';
import { FileTransfer, type ProgressStatus } from '@capacitor/file-transfer';
import { Directory, Filesystem } from '@capacitor/filesystem';

const OFFLINE_BOOKS_DIRECTORY = 'offline-books';

const createFilePath = (bookId: number): string => `${OFFLINE_BOOKS_DIRECTORY}/book-${bookId}.pdf`;

const ensureOfflineDirectory = async (): Promise<void> => {
  try {
    await Filesystem.mkdir({
      directory: Directory.Data,
      path: OFFLINE_BOOKS_DIRECTORY,
      recursive: true,
    });
  } catch {
    // A pasta pode ja existir; sem impacto.
  }
};

export interface StoredOfflinePdf {
  storageType: 'native-filesystem' | 'indexeddb';
  filePath: string;
  fileUri: string;
  webViewUrl: string;
  fileBlob?: Blob | null;
  sizeBytes: number;
}

export interface OfflineDownloadProgress {
  bytes: number;
  contentLength: number;
  lengthComputable: boolean;
  progressPercent: number | null;
}

interface NativeDownloadOptions {
  fileUrl: string;
  headers?: HttpHeaders;
  onProgress?: (progress: OfflineDownloadProgress) => void;
}

const toProgressPercent = (progress: ProgressStatus): number | null => {
  if (!progress.lengthComputable || progress.contentLength <= 0) {
    return null;
  }
  return Math.max(0, Math.min(100, Math.round((progress.bytes * 100) / progress.contentLength)));
};

const parseFileSize = (size: number | string | undefined): number => {
  if (typeof size === 'number' && Number.isFinite(size)) {
    return size;
  }
  if (typeof size === 'string') {
    const parsed = Number(size);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return 0;
};

const storePdfInIndexedDb = async (fileBuffer: ArrayBuffer): Promise<StoredOfflinePdf> => {
  const blob = new Blob([fileBuffer], { type: 'application/pdf' });
  return {
    storageType: 'indexeddb',
    filePath: '',
    fileUri: '',
    webViewUrl: '',
    fileBlob: blob,
    sizeBytes: blob.size,
  };
};

const buildStoredNativePdf = async (filePath: string): Promise<StoredOfflinePdf> => {
  const uri = await Filesystem.getUri({
    path: filePath,
    directory: Directory.Data,
  });
  const stats = await Filesystem.stat({
    path: filePath,
    directory: Directory.Data,
  });

  return {
    storageType: 'native-filesystem',
    filePath,
    fileUri: uri.uri,
    webViewUrl: Capacitor.convertFileSrc(uri.uri),
    fileBlob: null,
    sizeBytes: parseFileSize(stats.size),
  };
};

const attachProgressListener = async (
  fileUrl: string,
  onProgress?: (progress: OfflineDownloadProgress) => void,
) => {
  if (!onProgress) {
    return null;
  }

  return FileTransfer.addListener('progress', (progress) => {
    if (progress.type !== 'download' || progress.url !== fileUrl) {
      return;
    }

    onProgress({
      bytes: progress.bytes,
      contentLength: progress.contentLength,
      lengthComputable: progress.lengthComputable,
      progressPercent: toProgressPercent(progress),
    });
  });
};

export const downloadOfflinePdfToNativeStorage = async (
  bookId: number,
  options: NativeDownloadOptions,
): Promise<StoredOfflinePdf> => {
  if (!Capacitor.isNativePlatform()) {
    throw new Error('Download nativo indisponivel nesta plataforma.');
  }

  const filePath = createFilePath(bookId);
  await ensureOfflineDirectory();

  const destinationUri = await Filesystem.getUri({
    path: filePath,
    directory: Directory.Data,
  });

  const listener = await attachProgressListener(options.fileUrl, options.onProgress);
  try {
    await FileTransfer.downloadFile({
      url: options.fileUrl,
      path: destinationUri.uri,
      headers: options.headers,
      progress: Boolean(options.onProgress),
    });
  } finally {
    await listener?.remove();
  }

  return buildStoredNativePdf(filePath);
};

export const storeOfflinePdfInIndexedDb = async (
  fileBuffer: ArrayBuffer,
): Promise<StoredOfflinePdf> => {
  return storePdfInIndexedDb(fileBuffer);
};

export const removeOfflinePdf = async (filePath: string): Promise<void> => {
  if (!filePath) {
    return;
  }

  try {
    await Filesystem.deleteFile({
      path: filePath,
      directory: Directory.Data,
    });
  } catch {
    // Arquivo ja removido ou indisponivel.
  }
};

export const isNativeOfflineSupported = (): boolean => Capacitor.isNativePlatform();
