import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
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

@Injectable()
export class StorageService {
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
      'techlearns-uploads';

    this.accountName =
      this.configService.get<string>('AZURE_STORAGE_ACCOUNT_NAME') ||
      this.configService.get<string>('azureStorage.accountName') ||
      'techlearnsstorage01';

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

  private ensureConfigured(): BlobServiceClient {
    if (!this.blobServiceClient) {
      throw new BadRequestException('Azure Blob Storage is not configured on this server.');
    }
    return this.blobServiceClient;
  }

  /**
   * Generates a temporary SAS upload URL for direct browser-to-Azure uploads.
   */
  async generateUploadSasUrl(dto: GenerateSasUrlDto, userId?: string): Promise<SasUploadResult> {
    this.ensureConfigured();

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
        },
        sharedKeyCredential,
      ).toString();

      sasUrl = `${blobClient.url}?${sasToken}`;
    } catch (err: any) {
      this.logger.error(`Error generating Azure SAS URL: ${err.message}`, err.stack);
      throw new InternalServerErrorException(`Could not generate Azure upload SAS token: ${err.message}`);
    }

    const publicBlobUrl = blobClient.url.split('?')[0];

    return {
      uploadUrl: sasUrl,
      blobUrl: publicBlobUrl,
      blobPath: blobName,
      expiresOn,
    };
  }

  /**
   * Direct server-side upload of raw buffer (e.g. testcases zip, system backups, generated certificates)
   */
  async uploadBuffer(
    buffer: Buffer,
    originalName: string,
    fileType: string,
    folder: StorageFolder,
  ): Promise<{ blobUrl: string; blobPath: string }> {
    this.ensureConfigured();

    const ext = (originalName.split('.').pop() || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '');
    const blobName = `${folder}/${randomUUID()}-${originalName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    const containerClient = this.blobServiceClient!.getContainerClient(this.containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.uploadData(buffer, {
      blobHTTPHeaders: {
        blobContentType: fileType,
        blobCacheControl: 'public, max-age=31536000',
      },
    });

    return {
      blobUrl: blockBlobClient.url,
      blobPath: blobName,
    };
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
