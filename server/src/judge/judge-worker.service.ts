import { Injectable, Logger, OnModuleDestroy, OnModuleInit, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ServiceBusClient, ServiceBusReceivedMessage, ServiceBusReceiver } from '@azure/service-bus';
import { JudgeService } from './judge.service.js';

@Injectable()
export class JudgeWorkerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(JudgeWorkerService.name);
  private sbClient: ServiceBusClient | null = null;
  private receiver: ServiceBusReceiver | null = null;
  private subscription: { close(): Promise<void> } | null = null;

  constructor(
    private readonly judgeService: JudgeService,
    @Optional() private readonly configService?: ConfigService,
  ) {}

  async onModuleInit() {
    const isExplicitlyDisabled =
      process.env.DISABLE_IN_PROCESS_JUDGE === 'true' ||
      this.configService?.get('judge.disableInProcess') === true;

    // In production on Azure Container Apps, in-process judging is disabled so VM handles it.
    // In development or when explicitly enabled, it starts automatically alongside the API server!
    const isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
    const isExplicitlyEnabled = process.env.ENABLE_IN_PROCESS_JUDGE === 'true';

    if (isExplicitlyDisabled || (!isDev && !isExplicitlyEnabled)) {
      this.logger.log('In-process judge runner is disabled (dedicated VM worker handles judging).');
      return;
    }

    const connectionString =
      this.configService?.get<string>('azureServiceBus.connectionString') ||
      process.env.AZURE_SERVICE_BUS_CONNECTION_STRING;

    const queueName =
      this.configService?.get<string>('azureServiceBus.queueName') ||
      process.env.AZURE_SERVICE_BUS_QUEUE_NAME ||
      'submissions';

    const concurrency = parseInt(process.env.MAX_CONCURRENT_JOBS || '5', 10);

    if (!connectionString || connectionString.trim() === '') {
      this.logger.log('Judge worker listener waiting for AZURE_SERVICE_BUS_CONNECTION_STRING.');
      return;
    }

    try {
      this.sbClient = new ServiceBusClient(connectionString);
      this.receiver = this.sbClient.createReceiver(queueName, {
        receiveMode: 'peekLock',
      });

      this.subscription = this.receiver.subscribe(
        {
          processMessage: async (message: ServiceBusReceivedMessage) => {
            let submissionId: string | undefined;

            try {
              if (typeof message.body === 'string') {
                const parsed = JSON.parse(message.body);
                submissionId = parsed.submissionId;
              } else if (message.body && typeof message.body === 'object') {
                submissionId = (message.body as any).submissionId;
              }
            } catch {
              submissionId = undefined;
            }

            if (!submissionId) {
              if (this.receiver) {
                await this.receiver.deadLetterMessage(message, {
                  deadLetterReason: 'InvalidPayload',
                  deadLetterErrorDescription: 'Missing submissionId',
                });
              }
              return;
            }

            const startedAt = Date.now();
            this.logger.log(`[Auto-Judge] Evaluating submission ${submissionId}...`);

            try {
              await this.judgeService.evaluateSubmission(submissionId);
              if (this.receiver) {
                await this.receiver.completeMessage(message);
              }
              const duration = Date.now() - startedAt;
              this.logger.log(`[Auto-Judge] Submission ${submissionId} evaluated in ${duration}ms.`);
            } catch (err: any) {
              this.logger.error(`[Auto-Judge] Error on submission ${submissionId}: ${err.message}`, err.stack);
              if (this.receiver) {
                await this.receiver.abandonMessage(message);
              }
            }
          },
          processError: async (args) => {
            this.logger.error(`Service Bus queue error: ${args.error.message}`, args.error.stack);
          },
        },
        {
          maxConcurrentCalls: concurrency,
          autoCompleteMessages: false,
        },
      );

      this.logger.log(`⚡ In-process Judge Worker active on queue "${queueName}" (Runs automatically with server).`);
    } catch (err: any) {
      this.logger.warn(`Failed to initialize in-process judge listener: ${err.message}`);
    }
  }

  async onModuleDestroy() {
    try {
      if (this.subscription) {
        await this.subscription.close();
      }
      if (this.receiver) {
        await this.receiver.close();
      }
      if (this.sbClient) {
        await this.sbClient.close();
      }
    } catch (err: any) {
      this.logger.debug(`Error closing in-process judge worker: ${err.message}`);
    }
  }
}
