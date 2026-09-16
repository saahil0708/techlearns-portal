import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { type Transporter } from 'nodemailer';

export interface SendInvitationEmailOptions {
  to: string;
  name: string;
  activationUrl: string;
  institutionName?: string;
  collegeName?: string;
  batchName?: string;
  expiresInHours?: number;
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
  private readonly recentEmails: SentEmailRecord[] = [];
  private isDevMode = false;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const host = this.configService.get<string>('mail.host') || 'localhost';
    const port = this.configService.get<number>('mail.port') || 1025;
    const secure = this.configService.get<boolean>('mail.secure') || false;
    const user = this.configService.get<string>('mail.user');
    const pass = this.configService.get<string>('mail.pass');
    this.isDevMode = this.configService.get<boolean>('mail.devMode') === true;

    if (user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass },
      });
      this.logger.log(`Configured SMTP transport via ${host}:${port} (secure: ${secure})`);
    } else {
      // Stream/JSON transport for local development without external SMTP credentials
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
    const from = this.configService.get<string>('mail.from') || '"CodePlatform" <no-reply@codeplatform.local>';
    const college = options.institutionName || options.collegeName || 'Your Academic Department';
    const batch = options.batchName ? `Batch ${options.batchName}` : 'Student Cohort';
    const hours = options.expiresInHours || 72;
    const subject = `Welcome to CodePlatform - You've been invited to ${batch}`;

    const textContent = `
Hello ${options.name},

You have been invited to join ${college} on CodePlatform in ${batch}.

Please click the link below to set your password and activate your account:
${options.activationUrl}

This activation link will expire in ${hours} hours.

If you did not expect this invitation, please ignore this email.

Best regards,
CodePlatform Team
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
<body style="margin: 0; padding: 0; background-color: #0F172A; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #F8FAFC;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="min-width: 100%; background-color: #0F172A;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; background-color: #1E293B; border-radius: 16px; border: 1px solid #334155; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.4);">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 24px 32px; border-bottom: 1px solid #334155; background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%);">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <div style="font-size: 20px; font-weight: 800; color: #38BDF8; letter-spacing: -0.5px;">
                      ⚡ CODE<span style="color: #F8FAFC;">PLATFORM</span>
                    </div>
                    <div style="font-size: 12px; color: #94A3B8; margin-top: 4px; font-weight: 500;">
                      ${safeCollege}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 32px;">
              <h1 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: #F8FAFC; letter-spacing: -0.3px;">
                You've been invited to join ${safeBatch}
              </h1>
              <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #CBD5E1;">
                Hello <strong>${safeName}</strong>,
              </p>
              <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #CBD5E1;">
                Your instructor has created your account on CodePlatform for <strong>${safeCollege}</strong>. You'll have access to hands-on coding challenges, real-time code evaluation, interactive courses, and competitive contests.
              </p>

              <!-- CTA Button -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 28px 0;">
                <tr>
                  <td align="center" style="border-radius: 10px; background-color: #2563EB;">
                    <a href="${safeActivationUrl}" target="_blank" style="display: inline-block; padding: 14px 32px; font-size: 15px; font-weight: 700; color: #FFFFFF; text-decoration: none; border-radius: 10px; background-color: #2563EB; letter-spacing: 0.2px;">
                      Activate Your Account &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Expiration Alert -->
              <div style="margin: 24px 0 0 0; padding: 14px 16px; background-color: #0F172A; border-left: 4px solid #38BDF8; border-radius: 8px;">
                <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #94A3B8;">
                  ⏱️ <strong>Note:</strong> This activation link is single-use and will expire in <strong>${hours} hours</strong>.
                </p>
              </div>

              <!-- Fallback URL -->
              <p style="margin: 24px 0 8px 0; font-size: 13px; color: #64748B;">
                If the button above does not work, copy and paste this link into your browser:
              </p>
              <p style="margin: 0; font-size: 12px; line-height: 1.4; color: #38BDF8; word-break: break-all; font-family: monospace; background-color: #0F172A; padding: 10px; border-radius: 6px; border: 1px solid #334155;">
                ${safeActivationUrl}
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; border-top: 1px solid #334155; background-color: #0F172A; text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 12px; color: #64748B;">
                This invitation was dispatched for ${safeTo}
              </p>
              <p style="margin: 0; font-size: 11px; color: #475569;">
                &copy; ${new Date().getFullYear()} CodePlatform. All rights reserved.
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

      if (this.transporter) {
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

        // Keep recent emails bounded to last 100
        if (this.recentEmails.length > 100) {
          this.recentEmails.shift();
        }

        // Log clear developer banner with activation URL only in development
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
}
