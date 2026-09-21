import { forwardRef, Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { UsersService } from '../users/users.service.js';
import { MailService } from './mail.service.js';

export interface OutboxMetrics {
  pending: number;
  delivered: number;
  expired: number;
  failed: number;
  lastProcessedAt: Date | null;
}

@Injectable()
export class OutboxService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OutboxService.name);
  private pollerTimer: NodeJS.Timeout | null = null;
  private isProcessing = false;
  private lastRunTime: Date | null = null;
  private activeBatchPromise: Promise<{ delivered: number; expired: number }> | null = null;

  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
  ) {}

  onModuleInit() {
    // Run background outbox poller every 15 seconds in production/dev
    this.pollerTimer = setInterval(() => {
      this.processOutboxBatch().catch((err) => {
        this.logger.error(`Outbox background poller error: ${err.message}`, err.stack);
      });
    }, 15000);
    this.logger.log('Outbox background notification worker initialized');
  }

  async onModuleDestroy() {
    if (this.pollerTimer) {
      clearInterval(this.pollerTimer);
      this.pollerTimer = null;
    }
    if (this.activeBatchPromise) {
      await this.activeBatchPromise.catch(() => {});
    }
  }

  /**
   * Process a single batch of pending outbox invitation deliveries
   */
  async processOutboxBatch(): Promise<{ delivered: number; expired: number }> {
    if (this.isProcessing) {
      return { delivered: 0, expired: 0 };
    }

    this.isProcessing = true;
    const batchPromise = (async () => {
      try {
        const result = await this.usersService.processPendingDeliveries(async (delivery) => {
          try {
            const inv = await this.prisma.userInvitation.findUnique({
              where: { id: delivery.invitationId },
              include: {
                delivery: true,
              },
            });

            const emailRes = await this.mailService.sendInvitationEmail({
              to: delivery.email,
              name: inv?.name || 'Student',
              activationUrl: delivery.activationUrl,
              batchName: inv?.batchId ? `Cohort ${inv.batchId.slice(0, 6)}` : undefined,
            });

            return emailRes.success;
          } catch (err: any) {
            this.logger.warn(`Failed to dispatch email for delivery ${delivery.invitationId}: ${err.message}`);
            return false;
          }
        });

        this.lastRunTime = new Date();
        if (result.delivered > 0 || result.expired > 0) {
          this.logger.log(`Outbox batch complete: ${result.delivered} delivered, ${result.expired} expired`);
        }

        return result;
      } finally {
        this.isProcessing = false;
        this.activeBatchPromise = null;
      }
    })();

    this.activeBatchPromise = batchPromise;
    return batchPromise;
  }

  /**
   * Get current outbox statistics and queue health
   */
  async getOutboxMetrics(): Promise<OutboxMetrics> {
    const [pending, delivered, expired, failed] = await Promise.all([
      this.prisma.invitationDelivery.count({ where: { status: 'PENDING' } }),
      this.prisma.invitationDelivery.count({ where: { status: 'DELIVERED' } }),
      this.prisma.invitationDelivery.count({ where: { status: 'EXPIRED' } }),
      this.prisma.invitationDelivery.count({ where: { status: { in: ['FAILED', 'DEAD_LETTER'] } } }),
    ]);

    return {
      pending,
      delivered,
      expired,
      failed,
      lastProcessedAt: this.lastRunTime,
    };
  }
}
