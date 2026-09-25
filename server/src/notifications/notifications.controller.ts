import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import type { CurrentUserPayload } from '../common/types/current-user.interface.js';
import { RegisterFcmTokenDto } from './dto/register-fcm-token.dto.js';
import { SendNotificationDto } from './dto/send-notification.dto.js';
import { NotificationsService } from './notifications.service.js';

@ApiTags('notifications')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('send')
  @Roles(Role.SUPER_ADMIN, Role.PLATFORM_ADMIN, Role.INSTITUTION_ADMIN, Role.FACULTY)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Broadcast or send targeted push notifications (Faculty & Admins only; Students blocked)',
  })
  @ApiResponse({ status: 200, description: 'Notification dispatched successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden: Students cannot send notifications' })
  async sendNotification(
    @Body() dto: SendNotificationDto,
    @CurrentUser() currentUser: CurrentUserPayload,
  ) {
    return this.notificationsService.sendNotification(currentUser, dto);
  }

  @Post('fcm-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Register FCM device push token for the current user' })
  async registerFcmToken(
    @Body() dto: RegisterFcmTokenDto,
    @CurrentUser() currentUser: CurrentUserPayload,
  ) {
    return this.notificationsService.registerToken(currentUser.id, dto.fcmToken);
  }

  @Get()
  @ApiOperation({ summary: 'Get current user notification ledger' })
  async getMyNotifications(@CurrentUser() currentUser: CurrentUserPayload) {
    return this.notificationsService.getUserNotifications(currentUser);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark specific notification as read' })
  async markAsRead(
    @Param('id') id: string,
    @CurrentUser() currentUser: CurrentUserPayload,
  ) {
    return this.notificationsService.markAsRead(currentUser, id);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read for current user' })
  async markAllAsRead(@CurrentUser() currentUser: CurrentUserPayload) {
    return this.notificationsService.markAllAsRead(currentUser);
  }

  @Delete('clear-all')
  @ApiOperation({ summary: 'Clear all notifications for current user' })
  async clearAllNotifications(@CurrentUser() currentUser: CurrentUserPayload) {
    return this.notificationsService.deleteAllNotifications(currentUser);
  }

  @Delete()
  @ApiOperation({ summary: 'Clear all notifications for current user' })
  async deleteAllNotifications(@CurrentUser() currentUser: CurrentUserPayload) {
    return this.notificationsService.deleteAllNotifications(currentUser);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete/dismiss specific notification for current user' })
  async deleteNotification(
    @Param('id') id: string,
    @CurrentUser() currentUser: CurrentUserPayload,
  ) {
    return this.notificationsService.deleteNotification(currentUser, id);
  }
}
