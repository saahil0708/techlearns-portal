import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
export declare class MailService implements OnModuleInit {
    private readonly configService;
    private readonly logger;
    private transporter;
    private readonly recentEmails;
    private isDevMode;
    constructor(configService: ConfigService);
    onModuleInit(): Promise<void>;
    getRecentEmails(): SentEmailRecord[];
    clearRecentEmails(): void;
    sendInvitationEmail(options: SendInvitationEmailOptions): Promise<{
        success: boolean;
        messageId?: string;
    }>;
}
