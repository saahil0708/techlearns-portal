import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { GitHubProvisioningService } from './providers/github-provisioning.service.js';
import { JiraProvisioningService } from './providers/jira-provisioning.service.js';
import { ProvisionWorkspaceDto, UpdateSkillOsTelemetryDto } from './dto/provision-workspace.dto.js';

export interface FormattedSkillOsWorkspace {
  corporateId: string;
  corporateEmail: string;
  track: string;
  status: string;
  passportScore: number;
  prsMerged: number;
  jiraPointsBurned: number;
  tools: Array<{
    name: string;
    iconType: string;
    url: string;
    badge: string;
    status: string;
    description: string;
  }>;
}

@Injectable()
export class SkillOsService {
  private readonly logger = new Logger(SkillOsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly githubProvisioner: GitHubProvisioningService,
    private readonly jiraProvisioner: JiraProvisioningService,
  ) {}

  /**
   * Derive a globally unique corporate ID from user details
   */
  public generateCorporateId(user: { id: string; rollNo?: string | null; email?: string }): string {
    if (user.rollNo) {
      const cleanRoll = user.rollNo.trim();
      return cleanRoll.toUpperCase().startsWith('TL-') ? cleanRoll : `TL-2026-DEV-${cleanRoll}`;
    }
    const cleanId = user.id.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    return `TL-2026-DEV-${cleanId}`;
  }

  /**
   * Derive a standardized corporate email alias with collision resistance
   */
  public generateCorporateEmail(user: { id?: string; name?: string | null; email?: string }): string {
    let localPart = '';
    if (user.name) {
      localPart = user.name.toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.+|\.+$/g, '');
    }
    if (!localPart && user.email) {
      localPart = user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.+|\.+$/g, '');
    }
    if (!localPart) {
      localPart = 'developer';
    }
    const idSuffix = user.id ? user.id.replace(/[^a-z0-9]/gi, '').slice(0, 4).toLowerCase() : '';
    const finalLocal = idSuffix ? `${localPart}.${idSuffix}` : localPart;
    return `${finalLocal}@techlearns.corp`;
  }

  /**
   * Format database workspace record or default payload into the frontend SkillOS tool contract
   */
  public formatWorkspacePayload(workspace: {
    corporateId: string;
    corporateEmail: string;
    trackName?: string;
    containerStatus?: string;
    passportScore?: number;
    prsMerged?: number;
    jiraPointsBurned?: number;
    githubTeamName?: string | null;
    githubAssignedRepo?: string | null;
    jiraBoardUrl?: string | null;
    jiraActiveSprint?: string | null;
    webIdeUrl?: string | null;
  }): FormattedSkillOsWorkspace {
    const corporateId = workspace.corporateId;
    const webIdeUrl = workspace.webIdeUrl || `https://ide.techlearns.in/?workspace=${encodeURIComponent(corporateId)}`;
    const githubRepo = workspace.githubAssignedRepo || 'https://github.com/techlearns-cel/genai-live-sprint';
    const githubTeam = workspace.githubTeamName || '@techlearns-cel/sprint-alpha';
    const jiraBoard = workspace.jiraBoardUrl || 'https://jira.techlearns.in/secure/RapidBoard.jspa?rapidView=14';
    const jiraSprint = workspace.jiraActiveSprint || 'Active Sprint 04';
    const passportScore = workspace.passportScore ?? 0;
    const prsMerged = workspace.prsMerged ?? 0;
    const jiraPointsBurned = workspace.jiraPointsBurned ?? 0;

    const passportBadge =
      passportScore > 0 ? `Score: ${passportScore}/100 · Verified` : 'Score: 0/100 · Pending Verification';

    return {
      corporateId,
      corporateEmail: workspace.corporateEmail,
      track: workspace.trackName || 'Generative AI & Full Stack CEL Sprint',
      status: workspace.containerStatus || 'active',
      passportScore,
      prsMerged,
      jiraPointsBurned,
      tools: [
        {
          name: 'GitHub Enterprise Team',
          iconType: 'github',
          url: githubRepo,
          badge: githubTeam,
          status: 'active',
          description: 'Starter Repo + CI/CD + Mentor PR Reviews',
        },
        {
          name: 'Jira Agile Sprint Board',
          iconType: 'jira',
          url: jiraBoard,
          badge: jiraSprint,
          status: 'active',
          description: 'Live Backlog & Standup Epics',
        },
        {
          name: 'Cloud Web IDE Sandbox',
          iconType: 'ide',
          url: webIdeUrl,
          badge: 'VSCode Container Ready',
          status: 'ready',
          description: '1-Click Cloud Runtime with Docker & Node 20',
        },
        {
          name: 'Verified Skill Passport',
          iconType: 'passport',
          url: `/students/skill-passport`,
          badge: passportBadge,
          status: passportScore > 0 ? 'verified' : 'pending',
          description: 'Cryptographic Skill Verification Transcript',
        },
      ],
    };
  }

  /**
   * Retrieve the SkillOS workspace for a user, provisioning on demand if not yet created in DB
   */
  async getWorkspaceForUser(userId: string): Promise<FormattedSkillOsWorkspace> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { skillOsWorkspace: true },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (user.skillOsWorkspace) {
      return this.formatWorkspacePayload(user.skillOsWorkspace);
    }

    // Provision default persistent workspace for user
    return this.provisionWorkspace(userId);
  }

  /**
   * Provision a full SkillOS workspace in the database and trigger external provider tasks
   */
  async provisionWorkspace(
    userId: string,
    dto: ProvisionWorkspaceDto = {},
  ): Promise<FormattedSkillOsWorkspace> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const corporateId = this.generateCorporateId(user);
    const corporateEmail = this.generateCorporateEmail(user);
    const trackCode = dto.trackCode || 'DEV';
    const webIdeUrl = `https://ide.techlearns.in/?workspace=${encodeURIComponent(corporateId)}`;

    // Dispatch background external tasks
    const [githubRes, jiraRes] = await Promise.all([
      this.githubProvisioner.provisionUser(dto.githubUsername || user.githubUrl || undefined, trackCode),
      this.jiraProvisioner.provisionUser(corporateEmail, user.name),
    ]);

    try {
      const workspace = await this.prisma.skillOsWorkspace.upsert({
        where: { userId },
        create: {
          userId,
          corporateId,
          corporateEmail,
          trackCode,
          trackName: 'Generative AI & Full Stack CEL Sprint',
          githubUsername: dto.githubUsername || null,
          githubTeamName: githubRes.teamName,
          githubAssignedRepo: githubRes.assignedRepo,
          githubInviteStatus: githubRes.inviteStatus,
          jiraAccountId: jiraRes.accountId,
          jiraBoardUrl: jiraRes.boardUrl,
          jiraActiveSprint: jiraRes.activeSprint,
          webIdeUrl,
          containerStatus: 'ready',
          passportScore: 0,
          prsMerged: 0,
          jiraPointsBurned: 0,
        },
        update: {
          trackCode,
          githubUsername: dto.githubUsername || undefined,
          githubTeamName: githubRes.teamName,
          githubAssignedRepo: githubRes.assignedRepo,
          githubInviteStatus: githubRes.inviteStatus,
          jiraAccountId: jiraRes.accountId,
          jiraBoardUrl: jiraRes.boardUrl,
          jiraActiveSprint: jiraRes.activeSprint,
          webIdeUrl,
        },
      });

      this.logger.log(`SkillOS Workspace provisioned for user ${userId} (${corporateId})`);
      return this.formatWorkspacePayload(workspace);
    } catch (err: any) {
      if (err.code === 'P2002') {
        this.logger.warn(`P2002 unique constraint encountered for user ${userId}, reading existing workspace`);
        const existing = await this.prisma.skillOsWorkspace.findUnique({
          where: { userId },
        });
        if (existing) {
          return this.formatWorkspacePayload(existing);
        }
      }
      throw err;
    }
  }

  /**
   * Update telemetry (merged PRs, story points, passport score) using atomic Prisma increments
   */
  async updateTelemetry(corporateId: string, dto: UpdateSkillOsTelemetryDto) {
    const existing = await this.prisma.skillOsWorkspace.findUnique({
      where: { corporateId },
    });

    if (!existing) {
      throw new NotFoundException(`Workspace with corporate ID ${corporateId} not found`);
    }

    const updated = await this.prisma.skillOsWorkspace.update({
      where: { corporateId },
      data: {
        ...(dto.prsMergedDelta ? { prsMerged: { increment: dto.prsMergedDelta } } : {}),
        ...(dto.jiraPointsDelta ? { jiraPointsBurned: { increment: dto.jiraPointsDelta } } : {}),
        ...(dto.passportScore !== undefined ? { passportScore: dto.passportScore } : {}),
      },
    });

    if (dto.passportScore === undefined && (dto.prsMergedDelta || dto.jiraPointsDelta)) {
      const recalculatedScore = Math.min(60 + updated.prsMerged * 2 + Math.floor(updated.jiraPointsBurned / 5), 100);
      const final = await this.prisma.skillOsWorkspace.update({
        where: { corporateId },
        data: { passportScore: recalculatedScore },
      });
      return this.formatWorkspacePayload(final);
    }

    return this.formatWorkspacePayload(updated);
  }
}
