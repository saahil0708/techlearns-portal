import { Test, TestingModule } from '@nestjs/testing';
import { InterviewPrepResolver } from './interview-prep.resolver.js';
import { InterviewPrepService } from './interview-prep.service.js';
import { CompanyTier } from './dto/interview-prep.dto.js';
import { Role } from '@prisma/client';

describe('InterviewPrepResolver', () => {
  let resolver: InterviewPrepResolver;

  const mockService = {
    getCompanies: vi.fn().mockResolvedValue([{ id: 'comp-1', name: 'Google', slug: 'google' }]),
    getCompanyBySlug: vi.fn().mockResolvedValue({ id: 'comp-1', name: 'Google', slug: 'google' }),
    getAssessments: vi.fn().mockResolvedValue([{ id: 'mock-1', title: 'Google OA' }]),
    getAssessmentById: vi.fn().mockResolvedValue({ id: 'mock-1', title: 'Google OA' }),
    getGuides: vi.fn().mockResolvedValue([{ id: 'g1', title: '14 Patterns' }]),
    getUserReadiness: vi.fn().mockResolvedValue({ overallReadinessPct: 80 }),
    startAssessment: vi.fn().mockResolvedValue({ sessionId: 's1', expiresAt: Date.now() + 3600000 }),
    submitAssessment: vi.fn().mockResolvedValue({ success: true, score: 90, verdict: 'PASSED' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InterviewPrepResolver,
        { provide: InterviewPrepService, useValue: mockService },
      ],
    }).compile();

    resolver = module.get<InterviewPrepResolver>(InterviewPrepResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  it('should resolve interviewCompanies query', async () => {
    const res = await resolver.getCompanies(CompanyTier.FAANG, 'graph');
    expect(res).toEqual([{ id: 'comp-1', name: 'Google', slug: 'google' }]);
  });

  it('should resolve startMockAssessment and submitMockAssessment mutations', async () => {
    const user = { id: 'u1', email: 'test@campus.edu', name: 'Alex', globalRole: Role.STUDENT, memberships: [] };
    const startRes = await resolver.startMockAssessment('mock-1', user);
    expect(startRes.sessionId).toBe('s1');

    const submitRes = await resolver.submitMockAssessment('s1', { answers: [] }, user);
    expect(submitRes.verdict).toBe('PASSED');
  });
});
