import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import type { CurrentUserPayload } from '../common/types/current-user.interface.js';
import {
  ListCompaniesQueryDto,
  SubmitAssessmentDto,
} from './dto/interview-prep.dto.js';
import { InterviewPrepService } from './interview-prep.service.js';

@ApiTags('interview-prep')
@Controller('interview-prep')
export class InterviewPrepController {
  constructor(private readonly interviewPrepService: InterviewPrepService) {}

  @Get('companies')
  @ApiOperation({ summary: 'List all company interview preparation tracks with filtering' })
  @ApiResponse({ status: 200, description: 'List of company tracks' })
  async getCompanies(@Query() query: ListCompaniesQueryDto) {
    return this.interviewPrepService.getCompanies(query);
  }

  @Get('companies/:slug')
  @ApiOperation({ summary: 'Get specific company interview preparation track by slug' })
  @ApiResponse({ status: 200, description: 'Company track detail with interview stages and questions' })
  async getCompanyBySlug(@Param('slug') slug: string) {
    return this.interviewPrepService.getCompanyBySlug(slug);
  }

  @Get('assessments')
  @ApiOperation({ summary: 'List all company mock assessment simulations' })
  @ApiResponse({ status: 200, description: 'List of mock assessments' })
  async getAssessments(@Query('company') companySlug?: string) {
    return this.interviewPrepService.getAssessments(companySlug);
  }

  @Get('assessments/:id')
  @ApiOperation({ summary: 'Get mock assessment simulation details by ID' })
  @ApiResponse({ status: 200, description: 'Mock assessment detail' })
  async getAssessmentById(@Param('id') id: string) {
    return this.interviewPrepService.getAssessmentById(id);
  }

  @Post('assessments/:id/start')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Start a timed mock assessment simulation session' })
  @ApiResponse({ status: 201, description: 'Assessment session created with timer' })
  async startAssessment(
    @Param('id') id: string,
    @CurrentUser() currentUser: CurrentUserPayload,
  ) {
    return this.interviewPrepService.startAssessment(id, currentUser);
  }

  @Post('assessments/session/:sessionId/submit')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Submit assessment solutions and evaluate pass/fail readiness score' })
  @ApiResponse({ status: 200, description: 'Assessment scored with feedback and verdict' })
  async submitAssessment(
    @Param('sessionId') sessionId: string,
    @Body() dto: SubmitAssessmentDto,
    @CurrentUser() currentUser: CurrentUserPayload,
  ) {
    return this.interviewPrepService.submitAssessment(sessionId, dto, currentUser);
  }

  @Get('guides')
  @ApiOperation({ summary: 'List technical interview guides and system design cheatsheets' })
  @ApiResponse({ status: 200, description: 'List of interview guides' })
  async getGuides() {
    return this.interviewPrepService.getGuides();
  }

  @Get('readiness')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user interview readiness score and company breakdown' })
  @ApiResponse({ status: 200, description: 'User company readiness analytics' })
  async getUserReadiness(@CurrentUser() currentUser: CurrentUserPayload) {
    return this.interviewPrepService.getUserReadiness(currentUser);
  }
}
