import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
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
import { CommunityService } from './community.service.js';
import {
  CreateCommunityPostDto,
  CreateCommunityReplyDto,
} from './dto/create-community-post.dto.js';
import { QueryCommunityDto } from './dto/query-community.dto.js';

@ApiTags('community')
@Controller('community')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new discussion post' })
  @ApiResponse({ status: 201, description: 'Post created successfully' })
  async create(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreateCommunityPostDto,
  ) {
    return this.communityService.createPost(user.id, dto, user);
  }

  @Get()
  @ApiOperation({ summary: 'List all community discussion posts' })
  async findAll(
    @Query() query: QueryCommunityDto,
    @CurrentUser() user?: CurrentUserPayload,
  ) {
    return this.communityService.findAll(query, user);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get single discussion post with thread replies' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.communityService.findOne(id, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete discussion post' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.communityService.deletePost(id, user);
  }

  @Post(':id/upvote')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Upvote a discussion post' })
  async upvote(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.communityService.upvotePost(id, user);
  }

  @Post(':id/replies')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Reply to a discussion post' })
  async addReply(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreateCommunityReplyDto,
  ) {
    return this.communityService.addReply(id, user.id, dto, user);
  }

  @Post(':id/replies/:replyId/upvote')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Upvote a discussion reply' })
  async upvoteReply(
    @Param('id') id: string,
    @Param('replyId') replyId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.communityService.upvoteReply(id, replyId, user);
  }
}
