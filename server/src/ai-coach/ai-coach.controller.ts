import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import type { CurrentUserPayload } from '../common/types/current-user.interface.js';
import { AICoachService } from './ai-coach.service.js';
import { SendCoachMessageDto } from './dto/send-coach-message.dto.js';

@ApiTags('ai-coach')
@Controller('ai-coach')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class AICoachController {
  constructor(private readonly aiCoachService: AICoachService) {}

  @Get('history')
  @ApiOperation({ summary: 'Get current user chat history with AI Coach' })
  async getHistory(@CurrentUser() user: CurrentUserPayload) {
    return this.aiCoachService.getHistory(user.id);
  }

  @Post('message')
  @ApiOperation({ summary: 'Send message / query to AI Coach' })
  @ApiResponse({ status: 201, description: 'Message processed and answered' })
  async sendMessage(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: SendCoachMessageDto,
  ) {
    return this.aiCoachService.sendMessage(user.id, dto);
  }

  @Delete('history')
  @ApiOperation({ summary: 'Clear chat history with AI Coach' })
  async clearHistory(@CurrentUser() user: CurrentUserPayload) {
    return this.aiCoachService.clearHistory(user.id);
  }
}
