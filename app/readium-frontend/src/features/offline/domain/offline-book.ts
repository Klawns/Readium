export interface OfflineBookDownload {
  bookId: number;
  title: string;
  author: string | null;
  pages: number | null;
  storageType: 'native-filesystem' | 'indexeddb';
  filePath: string;
  fileUri: string;
  webViewUrl: string;
  fileBlob?: Blob | null;
  sizeBytes: number;
  downloadedAt: string;
  updatedAt: string;
}

export interface OfflineBookBlobRecord {
  bookId: number;
  blob: Blob;
  updatedAt: string;
}
