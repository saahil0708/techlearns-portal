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
import { ExplainProblemDto, ProgressiveHintDto, DiagnoseFailureDto, ChatAssistantDto } from './dto/ide-assistant.dto.js';
import { GenerateProblemDto } from './dto/generate-problem.dto.js';

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

  @Post('chat')
  @ApiOperation({ summary: 'Interactive IDE assistant chat with code and problem context' })
  @ApiResponse({ status: 200, description: 'AI assistant conversational response' })
  async chatWithAssistant(@Body() dto: ChatAssistantDto) {
    return this.aiCoachService.chatWithAssistant(dto);
  }

  @Delete('history')
  @ApiOperation({ summary: 'Clear chat history with AI Coach' })
  async clearHistory(@CurrentUser() user: CurrentUserPayload) {
    return this.aiCoachService.clearHistory(user.id);
  }

  @Post('explain')
  @ApiOperation({ summary: 'Generate structured problem explanation with step-by-step trace walkthrough' })
  async explainProblem(@Body() dto: ExplainProblemDto) {
    return this.aiCoachService.explainProblem(dto);
  }

  @Post('hint')
  @ApiOperation({ summary: 'Request a progressive Socratic hint (level 1, 2, or 3)' })
  async getProgressiveHint(@Body() dto: ProgressiveHintDto) {
    return this.aiCoachService.getProgressiveHint(dto);
  }

  @Post('diagnose')
  @ApiOperation({ summary: 'Diagnose runtime error, TLE, or failed test case' })
  async diagnoseFailure(@Body() dto: DiagnoseFailureDto) {
    return this.aiCoachService.diagnoseFailure(dto);
  }

  @Post('generate-problem')
  @ApiOperation({ summary: 'AI Problem Authoring: generate problem statement, sample cases, and hidden test cases' })
  async generateProblem(@Body() dto: GenerateProblemDto) {
    return this.aiCoachService.generateProblem(dto);
  }
}

