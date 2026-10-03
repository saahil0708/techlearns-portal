import { Injectable, Logger, BadRequestException, InternalServerErrorException, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  BlobServiceClient,
  BlobSASPermissions,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
} from '@azure/storage-blob';
import { randomUUID } from 'crypto';
import { GenerateSasUrlDto, StorageFolder } from './dto/generate-sas-url.dto.js';

export interface SasUploadResult {
  uploadUrl: string;
  blobUrl: string;
  blobPath: string;
  expiresOn: Date;
}

export const FOLDER_MIME_ALLOWLIST: Record<StorageFolder, string[]> = {
  [StorageFolder.AVATARS]: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  [StorageFolder.INSTITUTIONS]: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
  [StorageFolder.COURSES]: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
  [StorageFolder.BLOGS]: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  [StorageFolder.PROBLEMS]: [
    'application/zip',
    'application/x-zip-compressed',
    'text/plain',
    'application/json',
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
  ],
  [StorageFolder.ATTACHMENTS]: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
    'application/zip',
    'application/x-zip-compressed',
    'text/plain',
    'application/json',
    'text/csv',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
};

export const GLOBAL_ALLOWED_MIMES = Array.from(
  new Set(Object.values(FOLDER_MIME_ALLOWLIST).flat()),
);

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private blobServiceClient: BlobServiceClient | null = null;
  private containerName: string;
  private accountName: string;
  private accountKey: string | null = null;

  constructor(private readonly configService: ConfigService) {
    const connStr =
      this.configService.get<string>('AZURE_STORAGE_CONNECTION_STRING') ||
      this.configService.get<string>('azureStorage.connectionString');

    this.containerName =
      this.configService.get<string>('AZURE_STORAGE_CONTAINER_NAME') ||
      this.configService.get<string>('azureStorage.containerName') ||
      'cnt-techlearns-skillos-uploads-prod';

    this.accountName =
      this.configService.get<string>('AZURE_STORAGE_ACCOUNT_NAME') ||
      this.configService.get<string>('azureStorage.accountName') ||
      'sttechlearnsskillosprod1';

    if (connStr) {
      try {
        this.blobServiceClient = BlobServiceClient.fromConnectionString(connStr);
        // Extract AccountName and AccountKey if present in connection string
        const accountNameMatch = connStr.match(/AccountName=([^;]+)/);
        if (accountNameMatch && accountNameMatch[1]) {
          this.accountName = accountNameMatch[1];
        }
        const accountKeyMatch = connStr.match(/AccountKey=([^;]+)/);
        if (accountKeyMatch && accountKeyMatch[1]) {
          this.accountKey = accountKeyMatch[1];
        }
        this.logger.log(`Azure Blob Storage connected. Account: ${this.accountName}, Container: ${this.containerName}`);
      } catch (err: any) {
        this.logger.error(`Failed to initialize Azure BlobServiceClient: ${err.message}`, err.stack);
      }
    } else {
      this.logger.warn('AZURE_STORAGE_CONNECTION_STRING is not set. Storage service is disabled.');
    }
  }

  async onModuleInit() {
    if (this.blobServiceClient) {
      try {
        const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
        await containerClient.createIfNotExists();
        this.logger.log(`Azure Blob container "${this.containerName}" verified and ready (private access).`);
      } catch (err: any) {
        this.logger.warn(`Could not automatically create Azure Blob container "${this.containerName}": ${err.message}`);
      }

      try {
        await this.blobServiceClient.setProperties({
          cors: [
            {
              allowedOrigins: '*',
              allowedMethods: 'GET,HEAD,POST,PUT,OPTIONS,PATCH,DELETE',
              allowedHeaders: '*',
              exposedHeaders: '*',
              maxAgeInSeconds: 86400,
            },
          ],
        });
        this.logger.log('Azure Blob Storage CORS rules configured successfully for direct browser uploads.');
      } catch (err: any) {
        this.logger.warn(`Could not set Azure Blob CORS rules (will rely on server proxy upload fallback if needed): ${err.message}`);
      }
    }
  }

  private ensureConfigured(): BlobServiceClient {
    if (!this.blobServiceClient) {
      throw new BadRequestException('Azure Blob Storage is not configured on this server.');
    }
    return this.blobServiceClient;
  }

  /**
   * Generates a temporary SAS upload URL for direct browser-to-Azure uploads.
   */
  async generateUploadSasUrl(
    dto: GenerateSasUrlDto,
    _userId?: string,
    _institutionId?: string,
  ): Promise<SasUploadResult> {
    this.ensureConfigured();

    const allowedMimes = FOLDER_MIME_ALLOWLIST[dto.folder] || GLOBAL_ALLOWED_MIMES;
    const normalizedType = dto.fileType.toLowerCase();

    if (!allowedMimes.includes(normalizedType)) {
      throw new BadRequestException(
        `File MIME type "${dto.fileType}" is not permitted for folder "${dto.folder}".`,
      );
    }

    const isActiveContent = ['text/html', 'image/svg+xml', 'application/xhtml+xml'].includes(normalizedType);
    const contentDisposition = isActiveContent ? 'attachment' : undefined;

    const sanitizedExt = (dto.fileName.split('.').pop() || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanPrefix = dto.entityId ? `${dto.entityId}-` : '';
    const blobName = `${dto.folder}/${cleanPrefix}${randomUUID()}.${sanitizedExt}`;

    const containerClient = this.blobServiceClient!.getContainerClient(this.containerName);
    const blobClient = containerClient.getBlockBlobClient(blobName);

    // 15-minute write-only SAS Token
    const expiresOn = new Date(Date.now() + 15 * 60 * 1000);

    if (!this.accountKey) {
      throw new BadRequestException(
        'Direct SAS URL generation requires Azure account credentials. Please use the server upload proxy endpoint (/api/storage/upload).',
      );
    }

    let sasUrl = '';
    try {
      const sharedKeyCredential = new StorageSharedKeyCredential(this.accountName, this.accountKey);
      const sasToken = generateBlobSASQueryParameters(
        {
          containerName: this.containerName,
          blobName,
          permissions: BlobSASPermissions.parse('cw'), // Create, Write
          startsOn: new Date(Date.now() - 60 * 1000), // Clock skew grace period
          expiresOn,
          contentType: dto.fileType,
          contentDisposition,
        },
        sharedKeyCredential,
      ).toString();

      sasUrl = `${blobClient.url}?${sasToken}`;
    } catch (err: any) {
      this.logger.error(`Error generating Azure SAS URL: ${err.message}`, err.stack);
      throw new InternalServerErrorException(`Could not generate Azure upload SAS token: ${err.message}`);
    }

    const usableBlobUrl = this.generateReadSasUrl(blobName);

    return {
      uploadUrl: sasUrl,
      blobUrl: usableBlobUrl,
      blobPath: blobName,
      expiresOn,
    };
  }

  /**
   * Generates a read SAS URL or returns the direct blob URL for private access
   */
  generateReadSasUrl(blobName: string, durationDays = 7): string {
    if (!this.blobServiceClient) return '';
    const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
    const blobClient = containerClient.getBlockBlobClient(blobName);

    if (!this.accountKey) {
      return blobClient.url;
    }

    try {
      const sharedKeyCredential = new StorageSharedKeyCredential(this.accountName, this.accountKey);
      const expiresOn = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);
      const sasToken = generateBlobSASQueryParameters(
        {
          containerName: this.containerName,
          blobName,
          permissions: BlobSASPermissions.parse('r'), // Read
          startsOn: new Date(Date.now() - 60 * 1000),
          expiresOn,
        },
        sharedKeyCredential,
      ).toString();

      return `${blobClient.url}?${sasToken}`;
    } catch (err: any) {
      this.logger.warn(`Could not generate read SAS URL for ${blobName}: ${err.message}`);
      return blobClient.url;
    }
  }

  /**
   * Direct server-side upload of raw buffer (e.g. testcases zip, system backups, generated certificates)
   */
  async uploadBuffer(
    buffer: Buffer,
    originalName: string,
    fileType: string,
    folder: StorageFolder,
    institutionId?: string,
    userId?: string,
  ): Promise<{ blobUrl: string; blobPath: string }> {
    this.ensureConfigured();

    const allowedMimes = FOLDER_MIME_ALLOWLIST[folder] || GLOBAL_ALLOWED_MIMES;
    const normalizedType = fileType.toLowerCase();
    if (!allowedMimes.includes(normalizedType)) {
      throw new BadRequestException(
        `File MIME type "${fileType}" is not permitted for folder "${folder}".`,
      );
    }

    const isActiveContent = ['text/html', 'image/svg+xml', 'application/xhtml+xml'].includes(normalizedType);

    const blobName = `${folder}/${randomUUID()}-${originalName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    const containerClient = this.blobServiceClient!.getContainerClient(this.containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.uploadData(buffer, {
      blobHTTPHeaders: {
        blobContentType: fileType,
        blobCacheControl: 'public, max-age=31536000',
        ...(isActiveContent ? { blobContentDisposition: 'attachment' } : {}),
      },
      metadata: {
        ...(institutionId ? { institutionid: institutionId } : {}),
        ...(userId ? { ownerid: userId } : {}),
      },
    });

    const usableBlobUrl = this.generateReadSasUrl(blobName);

    return {
      blobUrl: usableBlobUrl,
      blobPath: blobName,
    };
  }

  /**
   * Get metadata properties for a blob
   */
  async getBlobMetadata(blobPath: string): Promise<Record<string, string> | null> {
    if (!this.blobServiceClient) return null;
    try {
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      const blobClient = containerClient.getBlockBlobClient(blobPath);
      const properties = await blobClient.getProperties();
      return properties.metadata || {};
    } catch {
      return null;
    }
  }

  /**
   * Delete a blob by path
   */
  async deleteBlob(blobPath: string): Promise<boolean> {
    if (!this.blobServiceClient) return false;
    try {
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      const blobClient = containerClient.getBlockBlobClient(blobPath);
      const res = await blobClient.deleteIfExists();
      return res.succeeded;
    } catch (err: any) {
      this.logger.warn(`Failed to delete blob at ${blobPath}: ${err.message}`);
      return false;
    }
  }
}
