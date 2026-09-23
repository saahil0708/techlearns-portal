import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SkillOsService } from './skillos.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { GitHubProvisioningService } from './providers/github-provisioning.service.js';
import { JiraProvisioningService } from './providers/jira-provisioning.service.js';

describe('SkillOsService', () => {
  let service: SkillOsService;
  let prisma: PrismaService;

  const mockUser = {
    id: 'user-1234',
    name: 'Alex Johnson',
    email: 'alex@campus.edu',
    rollNo: 'TL-2026-DEV-1234',
    githubUrl: 'alex-dev',
  };

  const mockWorkspace = {
    id: 'ws-1',
    userId: 'user-1234',
    corporateId: 'TL-2026-DEV-1234',
    corporateEmail: 'alex.johnson.user@techlearns.corp',
    trackCode: 'DEV',
    trackName: 'Generative AI & Full Stack CEL Sprint',
    githubUsername: 'alex-dev',
    githubTeamName: '@techlearns-cel/sprint-alpha',
    githubAssignedRepo: 'https://github.com/techlearns-cel/genai-live-sprint',
    githubInviteStatus: 'invited',
    jiraAccountId: 'jira-1234',
    jiraBoardUrl: 'https://jira.techlearns.in/secure/RapidBoard.jspa?rapidView=14',
    jiraActiveSprint: 'Active Sprint 04',
    webIdeUrl: 'https://ide.techlearns.in/?workspace=TL-2026-DEV-1234',
    containerStatus: 'ready',
    passportScore: 88,
    prsMerged: 14,
    jiraPointsBurned: 42,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SkillOsService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: vi.fn(),
            },
            skillOsWorkspace: {
              findUnique: vi.fn(),
              upsert: vi.fn(),
              update: vi.fn(),
            },
          },
        },
        {
          provide: GitHubProvisioningService,
          useValue: {
            provisionUser: vi.fn().mockResolvedValue({
              success: true,
              teamName: '@techlearns-cel/sprint-alpha',
              assignedRepo: 'https://github.com/techlearns-cel/genai-live-sprint',
              inviteStatus: 'invited',
            }),
          },
        },
        {
          provide: JiraProvisioningService,
          useValue: {
            provisionUser: vi.fn().mockResolvedValue({
              success: true,
              accountId: 'jira-1234',
              boardUrl: 'https://jira.techlearns.in/secure/RapidBoard.jspa?rapidView=14',
              activeSprint: 'Active Sprint 04',
            }),
          },
        },
      ],
    }).compile();

    service = module.get<SkillOsService>(SkillOsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should generate corporateId with global uniqueness', () => {
    expect(service.generateCorporateId(mockUser)).toBe('TL-2026-DEV-1234');
    expect(service.generateCorporateId({ id: 'abcd-efgh-1234' })).toBe('TL-2026-DEV-ABCDEFGH1234');
  });

  it('should generate corporateEmail alias with user suffix', () => {
    expect(service.generateCorporateEmail(mockUser)).toBe('alex.johnson.user@techlearns.corp');
    expect(service.generateCorporateEmail({ id: 'u123', name: null, email: 'dev@gmail.com' })).toBe('dev.u123@techlearns.corp');
  });

  it('should return formatted workspace when workspace exists', async () => {
    vi.spyOn(prisma.user, 'findUnique').mockResolvedValue({
      ...mockUser,
      skillOsWorkspace: mockWorkspace,
    } as any);

    const result = await service.getWorkspaceForUser('user-1234');
    expect(result.corporateId).toBe('TL-2026-DEV-1234');
    expect(result.tools).toHaveLength(4);
    expect(result.tools[0].name).toBe('GitHub Enterprise Team');
    expect(result.tools[2].name).toBe('Cloud Web IDE Sandbox');
  });

  it('should provision new workspace if user has no workspace yet', async () => {
    vi.spyOn(prisma.user, 'findUnique').mockResolvedValue({
      ...mockUser,
      skillOsWorkspace: null,
    } as any);

    vi.spyOn(prisma.skillOsWorkspace, 'upsert').mockResolvedValue(mockWorkspace as any);

    const result = await service.getWorkspaceForUser('user-1234');
    expect(result.corporateId).toBe('TL-2026-DEV-1234');
    expect(result.passportScore).toBe(88);
  });

  it('should update telemetry metrics using atomic updates', async () => {
    vi.spyOn(prisma.skillOsWorkspace, 'findUnique').mockResolvedValue(mockWorkspace as any);
    vi.spyOn(prisma.skillOsWorkspace, 'update').mockResolvedValue({
      ...mockWorkspace,
      prsMerged: 16,
      jiraPointsBurned: 50,
      passportScore: 92,
    } as any);

    const result = await service.updateTelemetry('TL-2026-DEV-1234', {
      prsMergedDelta: 2,
      jiraPointsDelta: 8,
    });

    expect(result.prsMerged).toBe(16);
    expect(result.jiraPointsBurned).toBe(50);
  });
});
