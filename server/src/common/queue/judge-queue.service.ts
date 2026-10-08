import { Injectable, Logger, OnModuleDestroy, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ServiceBusClient, ServiceBusSender } from '@azure/service-bus';

export interface SubmissionJobPayload {
  submissionId: string;
}

@Injectable()
export class JudgeQueueService implements OnModuleDestroy {
  private readonly logger = new Logger(JudgeQueueService.name);
  private sbClient: ServiceBusClient | null = null;
  private sender: ServiceBusSender | null = null;
  private readonly queueName: string;

  constructor(@Optional() private readonly configService?: ConfigService) {
    const connectionString =
      this.configService?.get<string>('azureServiceBus.connectionString') ||
      process.env.AZURE_SERVICE_BUS_CONNECTION_STRING;

    this.queueName =
      this.configService?.get<string>('azureServiceBus.queueName') ||
      process.env.AZURE_SERVICE_BUS_QUEUE_NAME ||
      'submissions';

    if (connectionString && connectionString.trim() !== '') {
      try {
        this.sbClient = new ServiceBusClient(connectionString);
        this.sender = this.sbClient.createSender(this.queueName);
        this.logger.log(`Azure Service Bus initialized for queue "${this.queueName}"`);
      } catch (err: any) {
        this.logger.error(`Failed to initialize Azure Service Bus client: ${err.message}`, err.stack);
      }
    } else {
      this.logger.warn(
        `AZURE_SERVICE_BUS_CONNECTION_STRING is not configured. Judge queue is in local fallback mode.`,
      );
    }
  }

  /**
   * Enqueue a submission ID for worker evaluation
   */
  async sendSubmissionJob(submissionId: string): Promise<void> {
    if (!this.sender) {
      const err = new Error('Azure Service Bus sender is unavailable. Submission could not be queued for evaluation.');
      this.logger.error(err.message);
      throw err;
    }

    try {
      await this.sender.sendMessages({
        body: { submissionId },
        contentType: 'application/json',
        messageId: `sub-${submissionId}`,
        subject: 'evaluate-submission',
      });
      this.logger.log(`Dispatched submission ${submissionId} to Azure Service Bus queue "${this.queueName}"`);
    } catch (err: any) {
      this.logger.error(`Failed to send submission ${submissionId} to Service Bus: ${err.message}`, err.stack);
      throw err;
    }
  }

  async onModuleDestroy() {
    try {
      if (this.sender) {
        await this.sender.close();
      }
      if (this.sbClient) {
        await this.sbClient.close();
      }
    } catch (err: any) {
      this.logger.debug(`Error closing Service Bus client: ${err.message}`);
    }
  }
}
