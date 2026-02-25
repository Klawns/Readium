const COVER_PROCESSING_ERROR_MESSAGE = 'Falha ao processar capa offline.';

const blobToDataUrl = (blob: Blob): Promise<string> => (
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => {
      reject(new Error(COVER_PROCESSING_ERROR_MESSAGE));
    };
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
        return;
      }
      reject(new Error(COVER_PROCESSING_ERROR_MESSAGE));
    };
    reader.readAsDataURL(blob);
  })
);

export const resolveOfflineCoverUrl = async (coverUrl: string | null): Promise<string | null> => {
  if (!coverUrl) {
    return null;
  }

  try {
    const response = await fetch(coverUrl);
    if (!response.ok) {
      return coverUrl;
    }

    const blob = await response.blob();
    return blobToDataUrl(blob);
  } catch {
    return coverUrl;
  }
};
