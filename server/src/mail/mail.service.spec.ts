import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { MailService } from './mail.service.js';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';

describe('MailService', () => {
  let service: MailService;
  let configService: ConfigService;
  let mockSendMail: any;

  beforeEach(async () => {
    mockSendMail = vi.fn().mockResolvedValue({ messageId: 'msg-mock-123' });
    vi.spyOn(nodemailer, 'createTransport').mockReturnValue({
      sendMail: mockSendMail,
    } as any);

    configService = new ConfigService({
      mail: {
        host: 'localhost',
        port: 1025,
        secure: false,
        devMode: true,
        from: '"TechLearns" <no-reply@techlearns.com>',
      },
    });
    service = new MailService(configService);
    await service.onModuleInit();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should format and dispatch an invitation email when SMTP transport succeeds', async () => {
    const result = await service.sendInvitationEmail({
      to: 'student@campus.edu',
      name: 'Alex Johnson',
      activationUrl: 'http://localhost:3000/accept-invitation?token=test-123',
      collegeName: 'Stanford Engineering',
      batchName: 'S60',
      expiresInHours: 72,
    });

    expect(result.success).toBe(true);
    expect(result.messageId).toBe('msg-mock-123');
    expect(mockSendMail).toHaveBeenCalledTimes(1);
    const sentArgs = mockSendMail.mock.calls[0][0];
    expect(sentArgs.to).toBe('student@campus.edu');
    expect(sentArgs.subject).toContain('Batch S60');
    expect(sentArgs.html).toContain('http://localhost:3000/accept-invitation?token=test-123');

    const recent = service.getRecentEmails();
    expect(recent.length).toBe(1);
    expect(recent[0].to).toBe('student@campus.edu');
    expect(recent[0].activationUrl).toContain('token=test-123');
  });

  it('should return success: false when SMTP transport rejects', async () => {
    mockSendMail.mockRejectedValueOnce(new Error('Connection refused'));

    const result = await service.sendInvitationEmail({
      to: 'student-fail@campus.edu',
      name: 'Samantha Reed',
      activationUrl: 'http://localhost:3000/accept-invitation?token=test-fail',
      collegeName: 'Stanford Engineering',
      batchName: 'S60',
      expiresInHours: 72,
    });

    expect(result.success).toBe(false);
    expect(result.messageId).toBeUndefined();
    // In dev mode, recent emails still logs for local inspection
    const recent = service.getRecentEmails();
    expect(recent.some((r) => r.to === 'student-fail@campus.edu')).toBe(true);
  });

  it('should not store recentEmails when devMode is false (production default)', async () => {
    const prodConfig = new ConfigService({
      mail: {
        host: 'smtp.mailgun.org',
        port: 587,
        secure: false,
        devMode: false,
        user: 'user',
        pass: 'pass',
        from: '"TechLearns" <no-reply@techlearns.com>',
      },
    });
    const prodService = new MailService(prodConfig);
    await prodService.onModuleInit();

    const result = await prodService.sendInvitationEmail({
      to: 'prod-student@campus.edu',
      name: 'Prod Student',
      activationUrl: 'http://localhost:3000/accept-invitation?token=secret-token-123',
      collegeName: 'Stanford Engineering',
      batchName: 'S60',
    });

    expect(result.success).toBe(true);
    // In production mode (devMode: false), recentEmails must NOT store tokens
    expect(prodService.getRecentEmails().length).toBe(0);
  });

  it('should dispatch assessment invitation using Azure Communication Services when configured', async () => {
    const azureConfig = new ConfigService({
      mail: { devMode: false },
      azureEmail: {
        connectionString: 'endpoint=https://mock.communication.azure.com/;accesskey=mockKey123',
        senderAddress: 'DoNotReply@techlearns.com',
      },
    });
    const azureService = new MailService(azureConfig);

    // Mock Azure EmailClient beginSend
    const mockPollUntilDone = vi.fn().mockResolvedValue({ id: 'azure-msg-123', status: 'Succeeded' });
    const mockBeginSend = vi.fn().mockResolvedValue({ pollUntilDone: mockPollUntilDone });
    (azureService as any).azureEmailClient = {
      beginSend: mockBeginSend,
    };

    const result = await azureService.sendAssessmentInvitationEmail({
      to: 'candidate@university.edu',
      name: 'Candidate One',
      assessmentTitle: 'Full-Stack Technical Assessment',
      assessmentUrl: 'http://localhost:3000/assessments/test-123?token=tok-456',
      institutionName: 'Stanford University',
      cohortName: 'B.Tech CSE 2026',
      durationMinutes: 90,
    });

    expect(result.success).toBe(true);
    expect(result.messageId).toBe('azure-msg-123');
    expect(mockBeginSend).toHaveBeenCalledTimes(1);
    const emailPayload = mockBeginSend.mock.calls[0][0];
    expect(emailPayload.senderAddress).toBe('DoNotReply@techlearns.com');
    expect(emailPayload.recipients.to[0].address).toBe('candidate@university.edu');
    expect(emailPayload.content.subject).toContain('SkillOS Assessment Invitation');
  });
});
