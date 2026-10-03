import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
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
import {
  CreateTicketDto,
  SubmitPrDto,
  UpdateTicketDto,
} from './dto/create-ticket.dto.js';
import { QueryTicketDto } from './dto/query-ticket.dto.js';
import { SimulationsService } from './simulations.service.js';

@ApiTags('simulations')
@Controller('simulations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class SimulationsController {
  constructor(private readonly simulationsService: SimulationsService) {}

  @Post('tickets')
  @ApiOperation({ summary: 'Create a new sprint simulation ticket' })
  @ApiResponse({ status: 201, description: 'Ticket created successfully' })
  async create(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreateTicketDto,
  ) {
    return this.simulationsService.createTicket(user.id, dto, user);
  }

  @Get('tickets')
  @ApiOperation({ summary: 'List all sprint tickets with filters' })
  async findAll(
    @Query() query: QueryTicketDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.simulationsService.findAll(query, user);
  }

  @Get('tickets/:idOrKey')
  @ApiOperation({ summary: 'Get single ticket details by ID or Key' })
  async findOne(
    @Param('idOrKey') idOrKey: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.simulationsService.findOne(idOrKey, user);
  }

  @Patch('tickets/:id')
  @ApiOperation({ summary: 'Update sprint ticket status/details' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTicketDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.simulationsService.updateTicket(id, dto, user);
  }

  @Post('tickets/:id/submit-pr')
  @ApiOperation({ summary: 'Submit PR for ticket review' })
  async submitPr(
    @Param('id') id: string,
    @Body() dto: SubmitPrDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.simulationsService.submitPullRequest(id, dto.prNumber, user);
  }

  @Delete('tickets/:id')
  @ApiOperation({ summary: 'Delete sprint ticket' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.simulationsService.deleteTicket(id, user);
  }
}
