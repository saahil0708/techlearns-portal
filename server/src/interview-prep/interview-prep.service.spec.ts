import { Test, TestingModule } from '@nestjs/testing';
import { InterviewPrepService } from './interview-prep.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CompanyTier } from './dto/interview-prep.dto.js';
import { Role } from '@prisma/client';

describe('InterviewPrepService', () => {
  let service: InterviewPrepService;

  const mockPrisma = {
    submission: {
      count: vi.fn().mockResolvedValue(18),
      findMany: vi.fn().mockResolvedValue([
        { problemId: 'gq-1', problem: { id: 'gq-1', slug: 'word-ladder-ii' }, verdict: 'ACCEPTED', totalTestCases: 10, passedTestCases: 10 },
        { problemId: 'gq-3', problem: { id: 'gq-3', slug: 'snapshot-array' }, verdict: 'ACCEPTED', totalTestCases: 10, passedTestCases: 10 },
      ]),
      findFirst: vi.fn().mockResolvedValue(null),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InterviewPrepService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<InterviewPrepService>(InterviewPrepService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return all companies and support tier filtering', async () => {
    const all = await service.getCompanies();
    expect(all.length).toBeGreaterThanOrEqual(5);

    const faangOnly = await service.getCompanies({ tier: CompanyTier.FAANG });
    expect(faangOnly.every((c) => c.tier === CompanyTier.FAANG)).toBe(true);
  });

  it('should return company by slug', async () => {
    const google = await service.getCompanyBySlug('google');
    expect(google).toBeDefined();
    expect(google.name).toBe('Google');
    expect(google.questions.length).toBeGreaterThan(0);
  });

  it('should throw error for unknown company slug', async () => {
    await expect(service.getCompanyBySlug('unknown-xyz')).rejects.toThrow();
  });

  it('should start, evaluate, and score a mock assessment', async () => {
    const currentUser = {
      id: 'user-test-123',
      email: 'student@campus.edu',
      name: 'Alex Johnson',
      globalRole: Role.STUDENT,
      memberships: [],
    };

    const sessionData = await service.startAssessment('mock-google-oa', currentUser);
    expect(sessionData.sessionId).toBeDefined();
    expect(sessionData.assessment.id).toBe('mock-google-oa');

    const result = await service.submitAssessment(
      sessionData.sessionId,
      {
        answers: [
          { problemId: 'gq-3', scorePercentage: 100 },
          { problemId: 'gq-1', scorePercentage: 80 },
        ],
      },
      currentUser,
    );

    expect(result.success).toBe(true);
    expect(result.score).toBeGreaterThan(70);
    expect(result.verdict).toBe('PASSED');

    // Repeat submission should be rejected because session is removed/completed
    await expect(
      service.submitAssessment(
        sessionData.sessionId,
        { answers: [] },
        currentUser,
      ),
    ).rejects.toThrow();
  });

  it('should reject expired assessment session', async () => {
    const currentUser = {
      id: 'user-test-123',
      email: 'student@campus.edu',
      name: 'Alex Johnson',
      globalRole: Role.STUDENT,
      memberships: [],
    };

    const sessionData = await service.startAssessment('mock-google-oa', currentUser);
    // Artificially expire the session by mutating its start time
    const session = (service as any).activeSessions.get(sessionData.sessionId);
    if (session) {
      session.startTime = Date.now() - 10000 * 60 * 1000;
    }

    await expect(
      service.submitAssessment(
        sessionData.sessionId,
        { answers: [] },
        currentUser,
      ),
    ).rejects.toThrow();
  });

  it('should compute user interview readiness', async () => {
    const currentUser = {
      id: 'user-test-123',
      email: 'student@campus.edu',
      name: 'Alex Johnson',
      globalRole: Role.STUDENT,
      memberships: [],
    };

    const readiness = await service.getUserReadiness(currentUser);
    expect(readiness.overallReadinessPct).toBeGreaterThan(0);
    expect(readiness.companyBreakdowns.length).toBeGreaterThan(0);
    expect(readiness.strengths.length).toBeGreaterThan(0);
    expect(readiness.totalSolvedProblems).toBe(2);
  });

  it('should return empty strengths when no questions are solved', async () => {
    mockPrisma.submission.findMany.mockResolvedValueOnce([]);
    const currentUser = {
      id: 'user-new',
      email: 'new@campus.edu',
      name: 'Newbie',
      globalRole: Role.STUDENT,
      memberships: [],
    };

    const readiness = await service.getUserReadiness(currentUser);
    expect(readiness.strengths).toEqual([]);
    expect(readiness.totalSolvedProblems).toBe(0);
  });
});
