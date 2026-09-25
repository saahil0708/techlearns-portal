import { Test, TestingModule } from '@nestjs/testing';
import { InterviewPrepController } from './interview-prep.controller.js';
import { InterviewPrepService } from './interview-prep.service.js';
import { Role } from '@prisma/client';

describe('InterviewPrepController', () => {
  let controller: InterviewPrepController;

  const mockService = {
    getCompanies: vi.fn().mockResolvedValue([{ id: 'comp-1', name: 'Google', slug: 'google' }]),
    getCompanyBySlug: vi.fn().mockResolvedValue({ id: 'comp-1', name: 'Google', slug: 'google' }),
    getAssessments: vi.fn().mockResolvedValue([{ id: 'mock-1', title: 'Google OA' }]),
    getAssessmentById: vi.fn().mockResolvedValue({ id: 'mock-1', title: 'Google OA' }),
    startAssessment: vi.fn().mockResolvedValue({ sessionId: 'session-123', expiresAt: Date.now() + 3600000 }),
    submitAssessment: vi.fn().mockResolvedValue({ success: true, score: 90, verdict: 'PASSED' }),
    getGuides: vi.fn().mockResolvedValue([{ id: 'g1', title: '14 Patterns' }]),
    getUserReadiness: vi.fn().mockResolvedValue({ overallReadinessPct: 80 }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InterviewPrepController],
      providers: [{ provide: InterviewPrepService, useValue: mockService }],
    }).compile();

    controller = module.get<InterviewPrepController>(InterviewPrepController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should delegate getCompanies', async () => {
    const res = await controller.getCompanies({});
    expect(res).toEqual([{ id: 'comp-1', name: 'Google', slug: 'google' }]);
  });

  it('should delegate startAssessment and submitAssessment', async () => {
    const user = { id: 'u1', email: 'test@campus.edu', name: 'Alex', globalRole: Role.STUDENT, memberships: [] };
    const startRes = await controller.startAssessment('mock-1', user);
    expect(startRes.sessionId).toBe('session-123');

    const submitRes = await controller.submitAssessment('session-123', { answers: [] }, user);
    expect(submitRes.verdict).toBe('PASSED');
  });
});
