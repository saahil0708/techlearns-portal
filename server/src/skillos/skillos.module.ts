import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { GitHubProvisioningService } from './providers/github-provisioning.service.js';
import { JiraProvisioningService } from './providers/jira-provisioning.service.js';
import { SkillOsController } from './skillos.controller.js';
import { SkillOsService } from './skillos.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [SkillOsController],
  providers: [SkillOsService, GitHubProvisioningService, JiraProvisioningService],
  exports: [SkillOsService],
})
export class SkillOsModule {}
