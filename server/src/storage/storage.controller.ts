import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  ParseEnumPipe,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { CurrentUserPayload } from '../common/types/current-user.interface.js';
import { FOLDER_MIME_ALLOWLIST, GLOBAL_ALLOWED_MIMES, StorageService } from './storage.service.js';
import { GenerateSasUrlDto, StorageFolder } from './dto/generate-sas-url.dto.js';

export interface UploadedFilePayload {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@ApiTags('Storage')
@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('sas-url')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Generate Azure Blob SAS upload URL for direct browser uploads',
  })
  @ApiResponse({
    status: 201,
    description: 'SAS URL generated successfully',
  })
  async generateSasUrl(
    @Body() dto: GenerateSasUrlDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    const institutionId = user.memberships?.[0]?.institutionId;
    return this.storageService.generateUploadSasUrl(dto, user.id, institutionId);
  }

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 50 * 1024 * 1024, // 50 MiB limit
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Direct server-side multipart file upload to Azure Blob Storage',
  })
  async uploadFile(
    @UploadedFile() file: UploadedFilePayload,
    @Query('folder', new ParseEnumPipe(StorageFolder, { optional: true }))
    folder: StorageFolder = StorageFolder.ATTACHMENTS,
    @CurrentUser() user?: CurrentUserPayload,
  ) {
    if (!file || !file.buffer || file.buffer.length === 0) {
      throw new BadRequestException('No file uploaded or file payload is empty');
    }

    const allowedMimes = FOLDER_MIME_ALLOWLIST[folder] || GLOBAL_ALLOWED_MIMES;
    if (!allowedMimes.includes(file.mimetype.toLowerCase())) {
      throw new BadRequestException(
        `File MIME type "${file.mimetype}" is not permitted for folder "${folder}".`,
      );
    }

    const institutionId = user?.memberships?.[0]?.institutionId;

    return this.storageService.uploadBuffer(
      file.buffer,
      file.originalname,
      file.mimetype,
      folder,
      institutionId,
      user?.id,
    );
  }

  @Delete('file')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.INSTITUTION_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a blob from Azure Storage' })
  async deleteFile(
    @Query('path') path: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    if (!path || typeof path !== 'string') {
      throw new BadRequestException('Query parameter "path" is required');
    }

    // Verify INSTITUTION_ADMIN belongs to the institution associated with the blob
    if (user.globalRole === Role.INSTITUTION_ADMIN) {
      const allowedInstitutionIds = (user.memberships || [])
        .filter((m) => m.role === Role.INSTITUTION_ADMIN)
        .map((m) => m.institutionId);

      const metadata = await this.storageService.getBlobMetadata(path);
      let isAuthorized = false;

      if (metadata && metadata.institutionid) {
        isAuthorized = allowedInstitutionIds.includes(metadata.institutionid);
      } else {
        // Fallback to path/filename prefix if metadata is not recorded (legacy blobs)
        const segments = path.split('/');
        const fileName = segments[segments.length - 1] || '';
        isAuthorized = allowedInstitutionIds.some(
          (instId) => fileName.startsWith(`${instId}-`) || fileName === instId,
        );
      }

      if (!isAuthorized) {
        throw new ForbiddenException(
          'You do not have permission to delete assets outside your assigned institution.',
        );
      }
    }

    const success = await this.storageService.deleteBlob(path);
    return { success, path };
  }
}

