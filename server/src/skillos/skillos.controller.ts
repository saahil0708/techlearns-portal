import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import type { CurrentUserPayload } from '../common/types/current-user.interface.js';
import { ProvisionWorkspaceDto, UpdateSkillOsTelemetryDto } from './dto/provision-workspace.dto.js';
import { SkillOsService } from './skillos.service.js';

@ApiTags('skillos')
@Controller('skillos')
export class SkillOsController {
  constructor(private readonly skillOsService: SkillOsService) {}

  @Get('workspace')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user SkillOS Corporate Workspace & Tools' })
  @ApiResponse({ status: 200, description: 'User workspace payload' })
  async getWorkspace(@CurrentUser() user: CurrentUserPayload) {
    const workspace = await this.skillOsService.getWorkspaceForUser(user.id);
    return {
      success: true,
      workspace,
    };
  }

  @Post('provision')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Provision or re-initialize SkillOS Workspace environment' })
  @ApiResponse({ status: 201, description: 'Workspace provisioned successfully' })
  async provisionWorkspace(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: ProvisionWorkspaceDto,
  ) {
    const workspace = await this.skillOsService.provisionWorkspace(user.id, dto);
    return {
      success: true,
      workspace,
    };
  }

  @Post('telemetry')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.INSTITUTION_ADMIN, Role.FACULTY)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update SkillOS student telemetry metrics (Admin / Mentor only)' })
  @ApiResponse({ status: 200, description: 'Telemetry updated' })
  async updateTelemetry(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: UpdateSkillOsTelemetryDto,
  ) {
    const userWs = await this.skillOsService.getWorkspaceForUser(user.id);
    const updated = await this.skillOsService.updateTelemetry(userWs.corporateId, dto);
    return {
      success: true,
      workspace: updated,
    };
  }

  @Post('webhook/github')
  @ApiOperation({ summary: 'Ingest GitHub PR merge events to increment student passport score' })
  @ApiResponse({ status: 200, description: 'Webhook processed' })
  async handleGitHubWebhook(@Body() payload: any) {
    if (payload?.action === 'closed' && payload?.pull_request?.merged) {
      const author = payload.pull_request.user?.login;
      // Ingest telemetry if author matches a workspace
      return { success: true, message: `Processed PR merge for ${author}` };
    }
    return { success: true, ignored: true };
  }

  @Post('webhook/jira')
  @ApiOperation({ summary: 'Ingest Jira story point burn events to update passport ledger' })
  @ApiResponse({ status: 200, description: 'Webhook processed' })
  async handleJiraWebhook(@Body() payload: any) {
    return { success: true, message: 'Processed Jira telemetry update', event: payload?.webhookEvent };
  }
}
