import { apiService } from './api-service';

export type StorageFolder = 'avatars' | 'institutions' | 'courses' | 'blogs' | 'problems' | 'attachments';

export interface UploadOptions {
  folder?: StorageFolder;
  entityId?: string;
  onProgress?: (progressPercent: number) => void;
  maxSizeBytes?: number;
  allowedTypes?: string[];
}

export interface UploadResult {
  blobUrl: string;
  blobPath: string;
  fileName: string;
  fileSize: number;
}

/**
 * Uploads a file directly to Azure Blob Storage using a temporary secure SAS Token.
 * If direct browser-to-Azure fails (e.g. restrictive network/CORS), it falls back to the backend proxy.
 */
export async function uploadFileToAzureBlob(
  file: File,
  options: UploadOptions = {},
): Promise<UploadResult> {
  const {
    folder = 'attachments',
    entityId,
    onProgress,
    maxSizeBytes = 50 * 1024 * 1024, // 50MB default
    allowedTypes,
  } = options;

  // Validation
  if (file.size > maxSizeBytes) {
    const maxMb = Math.round(maxSizeBytes / (1024 * 1024));
    throw new Error(`File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds limit of ${maxMb} MB.`);
  }

  if (allowedTypes && allowedTypes.length > 0) {
    const isAllowed = allowedTypes.some((type) => {
      if (type.endsWith('/*')) {
        const category = type.split('/')[0];
        return file.type.startsWith(`${category}/`);
      }
      return file.type === type;
    });

    if (!isAllowed) {
      throw new Error(`File type "${file.type || 'unknown'}" is not supported. Allowed: ${allowedTypes.join(', ')}`);
    }
  }

  // 1. Request SAS Token and pre-computed Blob URL from NestJS
  let sasData: { uploadUrl: string; blobUrl: string; blobPath: string };
  try {
    sasData = await apiService.getStorageSasUrl({
      fileName: file.name,
      fileType: file.type || 'application/octet-stream',
      folder,
      entityId,
    });
  } catch (sasErr: any) {
    const status = Number(sasErr?.response?.status ?? sasErr?.status ?? 0);
    const rawMessage = sasErr?.response?.data?.message ?? sasErr?.message;
    const message = typeof rawMessage === 'string' ? rawMessage.toLowerCase() : '';
    const isAccountKeyUnavailable =
      status === 400 &&
      (message.includes('account credentials') ||
        message.includes('account key') ||
        message.includes('upload proxy') ||
        message.includes('unavailable'));

    if (isAccountKeyUnavailable) {
      console.warn('Azure Storage account key unavailable for SAS, routing upload through server proxy endpoint (/api/storage/upload):', sasErr);
      const fallbackRes = await apiService.uploadStorageFileDirect(file, folder);
      return {
        blobUrl: fallbackRes.blobUrl,
        blobPath: fallbackRes.blobPath,
        fileName: file.name,
        fileSize: file.size,
      };
    }

    // Propagate all other SAS errors (401, 403, 500, network, etc.)
    throw sasErr;
  }

  const { uploadUrl, blobUrl, blobPath } = sasData;

  // 2. Upload file directly to Azure Blob Storage
  let isNetworkError = false;
  try {
    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', uploadUrl, true);

      // Azure Blob Storage required headers
      xhr.setRequestHeader('x-ms-blob-type', 'BlockBlob');
      xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');

      if (xhr.upload && onProgress) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            onProgress(percent);
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          if (onProgress) onProgress(100);
          resolve();
        } else {
          // HTTP error status (403, 400, etc.) - do not retry via proxy fallback
          reject(new Error(`Azure Blob upload failed with status ${xhr.status}: ${xhr.statusText}`));
        }
      };

      xhr.onerror = () => {
        isNetworkError = true;
        reject(new Error('Network error connecting to Azure Blob Storage'));
      };

      xhr.send(file);
    });

    return {
      blobUrl,
      blobPath,
      fileName: file.name,
      fileSize: file.size,
    };
  } catch (err: any) {
    if (isNetworkError) {
      console.warn('Transport failure on direct Azure Blob upload, retrying via server upload proxy:', err);
      const fallbackRes = await apiService.uploadStorageFileDirect(file, folder);
      if (onProgress) onProgress(100);
      return {
        blobUrl: fallbackRes.blobUrl || fallbackRes.url || '',
        blobPath: fallbackRes.blobPath || fallbackRes.path || '',
        fileName: file.name,
        fileSize: file.size,
      };
    }
    throw err;
  }
}
