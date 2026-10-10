import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { type Transporter } from 'nodemailer';
import { EmailClient, type EmailMessage } from '@azure/communication-email';

export interface SendInvitationEmailOptions {
  to: string;
  name: string;
  activationUrl: string;
  institutionName?: string;
  collegeName?: string;
  batchName?: string;
  expiresInHours?: number;
}

export interface SendAssessmentInvitationEmailOptions {
  to: string;
  name?: string;
  assessmentTitle: string;
  assessmentUrl: string;
  institutionName?: string;
  cohortName?: string;
  institutionLogo?: string;
  durationMinutes?: number;
  startTime?: Date | string;
}

export interface SentEmailRecord {
  to: string;
  subject: string;
  activationUrl: string;
  sentAt: Date;
  previewUrl?: string;
}

function escapeHtml(val: string | number | null | undefined): string {
  if (val === null || val === undefined) return '';
  return String(val)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

@Injectable()
export class MailService implements OnModuleInit {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter | null = null;
  private azureEmailClient: EmailClient | null = null;
  private readonly recentEmails: SentEmailRecord[] = [];
  private isDevMode = false;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    this.isDevMode = this.configService.get<boolean>('mail.devMode') === true;

    // 1. Check for Azure Communication Services Email connection string
    const azureConn =
      this.configService.get<string>('azureEmail.connectionString') ||
      process.env.AZURE_COMMUNICATION_SERVICES_CONNECTION_STRING ||
      process.env.AZURE_EMAIL_CONNECTION_STRING;

    if (azureConn && !azureConn.includes('placeholder')) {
      try {
        this.azureEmailClient = new EmailClient(azureConn);
        this.logger.log('Configured Azure Communication Services (ACS) Email Transport');
      } catch (err: any) {
        this.logger.warn(`Failed to initialize Azure EmailClient: ${err.message}`);
      }
    }

    // 2. SMTP Transport Configuration as backup/default
    const host = this.configService.get<string>('mail.host') || 'localhost';
    const port = this.configService.get<number>('mail.port') || 1025;
    const secure = this.configService.get<boolean>('mail.secure') || false;
    const user = this.configService.get<string>('mail.user');
    const pass = this.configService.get<string>('mail.pass');

    if (user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass },
      });
      this.logger.log(`Configured SMTP transport via ${host}:${port} (secure: ${secure})`);
    } else {
      // Local development transporter without external SMTP credentials
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: false,
        ignoreTLS: true,
      });
      this.logger.log(`Initialized local dev mail transport for ${host}:${port}`);
    }
  }

  getRecentEmails(): SentEmailRecord[] {
    return [...this.recentEmails];
  }

  clearRecentEmails(): void {
    this.recentEmails.length = 0;
  }

  async sendInvitationEmail(options: SendInvitationEmailOptions): Promise<{ success: boolean; messageId?: string }> {
    const from =
      this.configService.get<string>('azureEmail.senderAddress') ||
      this.configService.get<string>('mail.from') ||
      'DoNotReply@techlearns.com';
    const college = options.institutionName || options.collegeName || 'Your Academic Department';
    const batch = options.batchName ? `Batch ${options.batchName}` : 'Student Cohort';
    const hours = options.expiresInHours || 72;
    const subject = `Welcome to TechLearns - You've been invited to ${batch}`;

    const textContent = `
Hello ${options.name},

You have been invited to join ${college} on TechLearns in ${batch}.

Please click the link below to set your password and activate your account:
${options.activationUrl}

This activation link will expire in ${hours} hours.

If you did not expect this invitation, please ignore this email.

Best regards,
TechLearns Team
    `.trim();

    const safeName = escapeHtml(options.name);
    const safeCollege = escapeHtml(college);
    const safeBatch = escapeHtml(batch);
    const safeTo = escapeHtml(options.to);
    const safeActivationUrl = escapeHtml(options.activationUrl);
    const safeSubject = escapeHtml(subject);

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeSubject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0F172A;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="min-width: 100%; background-color: #F8FAFC;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; background-color: #FFFFFF; border-radius: 20px; border: 1px solid #E2E8F0; overflow: hidden; box-shadow: 0 10px 30px rgba(11,31,58,0.06);">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 24px 32px; border-bottom: 1px solid #E2E8F0; background: linear-gradient(135deg, #0B1F3A 0%, #5B2D90 100%);">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <div style="font-size: 22px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.5px;">
                      ⚡ TECH<span style="color: #C084FC;">LEARNS</span>
                    </div>
                    <div style="font-size: 13px; color: #E2E8F0; margin-top: 4px; font-weight: 600;">
                      ${safeCollege}
                    </div>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; background-color: rgba(255,255,255,0.15); color: #FFFFFF; font-size: 11px; font-weight: 800; padding: 5px 12px; border-radius: 12px; text-transform: uppercase; letter-spacing: 0.05em;">
                      Official Invitation
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Body -->
          <tr>
            <td style="padding: 36px 32px 28px 32px;">
              <h1 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 800; color: #0F172A; letter-spacing: -0.02em;">
                Activate Your TechLearns Account
              </h1>
              
              <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #334155;">
                Hello <strong>${safeName}</strong>,
              </p>
              
              <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #475569;">
                You have been invited to join <strong>${safeCollege}</strong> on the TechLearns platform under cohort <strong>${safeBatch}</strong>. Click below to verify your email and set up your password:
              </p>

              <!-- CTA Button -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 28px 0; width: 100%;">
                <tr>
                  <td align="center" style="border-radius: 12px; background: linear-gradient(135deg, #0B1F3A 0%, #5B2D90 100%);">
                    <a href="${safeActivationUrl}" target="_blank" style="display: block; padding: 15px 32px; font-size: 15px; font-weight: 800; color: #FFFFFF; text-decoration: none; border-radius: 12px; letter-spacing: 0.02em;">
                      Activate Account & Access Portal &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Notice Box -->
              <div style="margin: 24px 0; padding: 16px; background-color: #FAF5FF; border-left: 4px solid #5B2D90; border-radius: 4px;">
                <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #5B2D90; font-weight: 600;">
                  ⏱️ Security Window: This personalized activation link will expire in <strong>${hours} hours</strong>.
                </p>
              </div>

              <!-- Fallback Link -->
              <p style="margin: 24px 0 8px 0; font-size: 12px; color: #64748B;">
                If the button above does not work, copy and paste this link into your browser:
              </p>
              <p style="margin: 0; font-size: 12px; line-height: 1.4; color: #5B2D90; word-break: break-all; font-family: monospace; background-color: #F8FAFC; padding: 10px; border-radius: 8px; border: 1px solid #E2E8F0;">
                ${safeActivationUrl}
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; border-top: 1px solid #F1F5F9; background-color: #F8FAFC; text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 12px; color: #64748B;">
                This invitation was delivered to <strong>${safeTo}</strong>.
              </p>
              <p style="margin: 0; font-size: 11px; color: #94A3B8;">
                &copy; ${new Date().getFullYear()} TechLearns Platform. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    try {
      let messageId: string | undefined;
      let transportSuccess = true;

      // Primary: Azure Communication Services Email
      if (this.azureEmailClient) {
        try {
          const senderAddress =
            this.configService.get<string>('azureEmail.senderAddress') ||
            process.env.AZURE_EMAIL_SENDER_ADDRESS ||
            'DoNotReply@techlearns.com';

          const emailMessage: EmailMessage = {
            senderAddress,
            content: {
              subject,
              plainText: textContent,
              html: htmlContent,
            },
            recipients: {
              to: [{ address: options.to, displayName: options.name }],
            },
          };

          const poller = await this.azureEmailClient.beginSend(emailMessage);
          const response = await poller.pollUntilDone();
          messageId = response.id;
          transportSuccess = response.status === 'Succeeded';
          this.logger.log(`Azure Communication Services email sent to ${options.to} [ID: ${response.id}, Status: ${response.status}]`);
        } catch (azureErr: any) {
          transportSuccess = false;
          this.logger.warn(`Azure Communication Services email error for ${options.to}: ${azureErr.message}`);
        }
      } else if (this.transporter) {
        // Fallback: SMTP transporter
        try {
          const info = await this.transporter.sendMail({
            from,
            to: options.to,
            subject,
            text: textContent,
            html: htmlContent,
          });
          messageId = info?.messageId || 'mock-message-id';
        } catch (transportErr: any) {
          transportSuccess = false;
          this.logger.warn(`SMTP transport error for ${options.to}: ${transportErr.message}`);
        }
      }

      if (this.isDevMode) {
        this.recentEmails.push({
          to: options.to,
          subject,
          activationUrl: options.activationUrl,
          sentAt: new Date(),
        });

        if (this.recentEmails.length > 100) {
          this.recentEmails.shift();
        }

        this.logger.log(
          `\n╔═══════════════════════════════════════════════════════════════════════╗\n` +
          `║ ✉️  INVITATION EMAIL DISPATCHED (LOCAL DEV)                           ║\n` +
          `╠═══════════════════════════════════════════════════════════════════════╣\n` +
          `║ To:         ${options.to.padEnd(57)} ║\n` +
          `║ Name:       ${options.name.padEnd(57)} ║\n` +
          `║ Batch:      ${batch.padEnd(57)} ║\n` +
          `║ Link:       ${options.activationUrl.padEnd(57)} ║\n` +
          `╚═══════════════════════════════════════════════════════════════════════╝`
        );
      } else if (transportSuccess) {
        this.logger.log(`Invitation email successfully dispatched to ${options.to}`);
      }

      return { success: transportSuccess, messageId };
    } catch (err: any) {
      this.logger.error(`Failed to dispatch invitation email to ${options.to}: ${err.message}`, err.stack);
      return { success: false };
    }
  }

  async sendAssessmentInvitationEmail(options: SendAssessmentInvitationEmailOptions): Promise<{ success: boolean; messageId?: string }> {
    const from =
      this.configService.get<string>('azureEmail.senderAddress') ||
      this.configService.get<string>('mail.from') ||
      'DoNotReply@techlearns.com';
    const college = options.institutionName || 'Authorized Institution';
    const cohort = options.cohortName ? `Cohort ${options.cohortName}` : 'Candidate Evaluation Deck';
    const duration = options.durationMinutes || 90;
    const recipientName = options.name || options.to.split('@')[0];
    const subject = `SkillOS Assessment Invitation: ${options.assessmentTitle} (${college})`;

    const textContent = `
Hello ${recipientName},

You have been invited to participate in the proctored technical evaluation:
"${options.assessmentTitle}" organized by ${college} (${cohort}).

Duration: ${duration} Minutes
Assessment Link: ${options.assessmentUrl}

Important Guidelines:
- This is a secure proctored session with automated integrity monitoring.
- Ensure you have a functioning webcam, microphone, and a stable internet connection.
- Use fullscreen mode; excessive tab switches will terminate your evaluation.

Click the link below to access your candidate registration and launch the exam:
${options.assessmentUrl}

Best regards,
TechLearns SkillOS Team
    `.trim();

    const safeTo = escapeHtml(options.to);
    const safeName = escapeHtml(recipientName);
    const safeTitle = escapeHtml(options.assessmentTitle);
    const safeCollege = escapeHtml(college);
    const safeCohort = escapeHtml(cohort);
    const safeUrl = escapeHtml(options.assessmentUrl);
    const safeSubject = escapeHtml(subject);
    const logoHtml = options.institutionLogo
      ? `<img src="${options.institutionLogo}" alt="${safeCollege} Logo" style="max-height: 40px; max-width: 140px; border-radius: 8px; object-fit: contain;" />`
      : `<div style="font-size: 20px; font-weight: 800; color: #5B2D90; letter-spacing: -0.5px;">⚡ TECH<span style="color: #0B1F3A;">LEARNS</span></div>`;

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeSubject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0F172A;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="min-width: 100%; background-color: #F8FAFC;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #FFFFFF; border-radius: 20px; border: 1px solid #E2E8F0; overflow: hidden; box-shadow: 0 10px 30px rgba(11,31,58,0.06);">
          <!-- Header Bar with Logo -->
          <tr>
            <td style="padding: 28px 32px; border-bottom: 1px solid #F1F5F9; background-color: #FFFFFF;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="left" style="vertical-align: middle;">
                    ${logoHtml}
                  </td>
                  <td align="right" style="vertical-align: middle;">
                    <span style="display: inline-block; background-color: #FAF5FF; color: #5B2D90; font-size: 11px; font-weight: 800; padding: 6px 12px; border-radius: 20px; border: 1px solid #E9D5FF; text-transform: uppercase; letter-spacing: 0.05em;">
                      SkillOS Assessment
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Banner -->
          <tr>
            <td style="padding: 32px; background: linear-gradient(135deg, #0B1F3A 0%, #5B2D90 100%); color: #FFFFFF;">
              <div style="font-size: 12px; font-weight: 700; color: #E9D5FF; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">
                ${safeCollege} &bull; ${safeCohort}
              </div>
              <h1 style="margin: 0 0 12px 0; font-size: 22px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.02em;">
                ${safeTitle}
              </h1>
              <div style="display: inline-block; background-color: rgba(255,255,255,0.15); padding: 6px 14px; border-radius: 8px; font-size: 13px; font-weight: 700; color: #FFFFFF;">
                ⏱️ Allocated Duration: <strong>${duration} Minutes</strong>
              </div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 32px;">
              <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #334155;">
                Hello <strong>${safeName}</strong>,
              </p>
              <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #475569;">
                You have been selected to take the technical assessment for <strong>${safeCollege}</strong>. Your personalized 1-click token is ready below:
              </p>

              <!-- CTA Button -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 28px 0; width: 100%;">
                <tr>
                  <td align="center" style="border-radius: 12px; background: linear-gradient(135deg, #0B1F3A 0%, #5B2D90 100%);">
                    <a href="${safeUrl}" target="_blank" style="display: block; padding: 16px 32px; font-size: 16px; font-weight: 800; color: #FFFFFF; text-decoration: none; border-radius: 12px; letter-spacing: 0.02em;">
                      ⚡ Enter Verified Exam Room &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Requirements Card -->
              <div style="margin: 20px 0; padding: 18px 20px; background-color: #FAF5FF; border: 1px solid #E9D5FF; border-radius: 12px;">
                <div style="font-size: 13px; font-weight: 800; color: #0B1F3A; margin-bottom: 8px;">
                  🛡️ Pre-Assessment Guidelines:
                </div>
                <ul style="margin: 0; padding-left: 18px; font-size: 13px; line-height: 1.7; color: #475569;">
                  <li>Supported browsers: Modern Chrome, Brave, Edge, or Firefox</li>
                  <li>Enable webcam & microphone permissions upon entry</li>
                  <li>Do not leave full-screen mode during the test</li>
                </ul>
              </div>

              <!-- Direct Link Fallback -->
              <p style="margin: 24px 0 8px 0; font-size: 12px; color: #94A3B8;">
                If the button above does not work, copy and paste this link into your browser:
              </p>
              <p style="margin: 0; font-size: 12px; line-height: 1.4; color: #5B2D90; word-break: break-all; font-family: monospace; background-color: #F8FAFC; padding: 10px; border-radius: 8px; border: 1px solid #E2E8F0;">
                ${safeUrl}
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; border-top: 1px solid #F1F5F9; background-color: #F8FAFC; text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 12px; color: #64748B;">
                This assessment invitation was dispatched for <strong>${safeTo}</strong>
              </p>
              <p style="margin: 0; font-size: 11px; color: #94A3B8;">
                &copy; ${new Date().getFullYear()} TechLearns SkillOS Engine. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    try {
      let messageId: string | undefined;
      let transportSuccess = true;

      // Primary: Azure Communication Services Email
      if (this.azureEmailClient) {
        try {
          const senderAddress =
            this.configService.get<string>('azureEmail.senderAddress') ||
            process.env.AZURE_EMAIL_SENDER_ADDRESS ||
            'DoNotReply@techlearns.com';

          const emailMessage: EmailMessage = {
            senderAddress,
            content: {
              subject,
              plainText: textContent,
              html: htmlContent,
            },
            recipients: {
              to: [{ address: options.to, displayName: options.name || recipientName }],
            },
          };

          const poller = await this.azureEmailClient.beginSend(emailMessage);
          const response = await poller.pollUntilDone();
          messageId = response.id;
          transportSuccess = response.status === 'Succeeded';
          this.logger.log(`Azure Communication Services assessment invitation sent to ${options.to} [ID: ${response.id}, Status: ${response.status}]`);
        } catch (azureErr: any) {
          transportSuccess = false;
          this.logger.warn(`Azure Communication Services email error for candidate ${options.to}: ${azureErr.message}`);
        }
      } else if (this.transporter) {
        // Fallback: SMTP transporter
        try {
          const info = await this.transporter.sendMail({
            from,
            to: options.to,
            subject,
            text: textContent,
            html: htmlContent,
          });
          messageId = info?.messageId || 'mock-assessment-message-id';
        } catch (transportErr: any) {
          transportSuccess = false;
          this.logger.warn(`SMTP transport error for candidate ${options.to}: ${transportErr.message}`);
        }
      }

      if (this.isDevMode) {
        this.recentEmails.push({
          to: options.to,
          subject,
          activationUrl: options.assessmentUrl,
          sentAt: new Date(),
        });

        if (this.recentEmails.length > 100) {
          this.recentEmails.shift();
        }

        this.logger.log(
          `\n╔═══════════════════════════════════════════════════════════════════════╗\n` +
          `║ 🎯 CANDIDATE ASSESSMENT EMAIL DISPATCHED (LOCAL DEV)                  ║\n` +
          `╠═══════════════════════════════════════════════════════════════════════╣\n` +
          `║ To:         ${options.to.padEnd(57)} ║\n` +
          `║ Assessment: ${options.assessmentTitle.padEnd(57)} ║\n` +
          `║ Cohort:     ${cohort.padEnd(57)} ║\n` +
          `║ Exam Link:  ${options.assessmentUrl.padEnd(57)} ║\n` +
          `╚═══════════════════════════════════════════════════════════════════════╝`
        );
      } else if (transportSuccess) {
        this.logger.log(`Candidate assessment invitation sent to ${options.to}`);
      }

      return { success: transportSuccess, messageId };
    } catch (err: any) {
      this.logger.error(`Failed to dispatch candidate assessment email to ${options.to}: ${err.message}`, err.stack);
      return { success: false };
    }
  }
}
