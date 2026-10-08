import 'reflect-metadata';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { Logger } from '@nestjs/common';
import { ServiceBusClient, ServiceBusReceivedMessage, ServiceBusReceiver } from '@azure/service-bus';
import { JudgeService } from './judge/judge.service.js';
import { DockerSandboxProvider } from './judge/sandbox/docker-sandbox.provider.js';
import { FallbackSandboxProvider } from './judge/sandbox/fallback-sandbox.provider.js';
import { PrismaService } from './prisma/prisma.service.js';

// Auto-load environment file if process.loadEnvFile is available
try {
  if (typeof (process as any).loadEnvFile === 'function') {
    const envJudgePath = path.resolve(process.cwd(), '.env.judge');
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envJudgePath)) {
      (process as any).loadEnvFile(envJudgePath);
    } else if (fs.existsSync(envPath)) {
      (process as any).loadEnvFile(envPath);
    }
  }
} catch {
  // Environment already set via container or systemd
}

const logger = new Logger('JudgeWorker');

async function bootstrap() {
  const connectionString = process.env.AZURE_SERVICE_BUS_CONNECTION_STRING;
  const queueName = process.env.AZURE_SERVICE_BUS_QUEUE_NAME || 'submissions';
  const concurrency = parseInt(process.env.MAX_CONCURRENT_JOBS || '5', 10);

  if (!connectionString || connectionString.trim() === '') {
    logger.error('CRITICAL: AZURE_SERVICE_BUS_CONNECTION_STRING environment variable is not set.');
    logger.error('Please configure AZURE_SERVICE_BUS_CONNECTION_STRING in .env, .env.judge, or environment.');
    process.exit(1);
  }

  logger.log('Starting standalone Judge Worker process...');

  // Initialize Database ORM with retry
  const prisma = new PrismaService();
  let dbConnected = false;
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      await prisma.$connect();
      dbConnected = true;
      logger.log('Connected to PostgreSQL database');
      break;
    } catch (dbErr: any) {
      logger.warn(`PostgreSQL connection attempt ${attempt}/5 failed: ${dbErr.message}. Retrying in 2s...`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  if (!dbConnected) {
    logger.error('Failed to connect to PostgreSQL after 5 attempts. Exiting...');
    process.exit(1);
  }

  // Initialize Judge Service and Sandbox Providers
  const dockerSandbox = new DockerSandboxProvider();
  const fallbackSandbox = new FallbackSandboxProvider();
  const judgeService = new JudgeService(prisma, dockerSandbox, fallbackSandbox);

  // Initialize Service Bus Client & Receiver
  const sbClient = new ServiceBusClient(connectionString);
  const receiver: ServiceBusReceiver = sbClient.createReceiver(queueName, {
    receiveMode: 'peekLock',
  });

  logger.log(`Listening for submissions on Azure Service Bus queue "${queueName}" (Concurrency: ${concurrency})...`);

  const subscription = receiver.subscribe(
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
          logger.warn(`Received invalid message payload without submissionId: ${JSON.stringify(message.body)}`);
          await receiver.deadLetterMessage(message, {
            deadLetterReason: 'InvalidPayload',
            deadLetterErrorDescription: 'Payload does not contain a valid submissionId string',
          });
          return;
        }

        const startedAt = Date.now();
        logger.log(`[Job Started] Evaluating submission ${submissionId}... (MessageId: ${message.messageId})`);

        try {
          await judgeService.evaluateSubmission(submissionId);
          await receiver.completeMessage(message);
          const duration = Date.now() - startedAt;
          logger.log(`[Job Completed] Submission ${submissionId} finished evaluation in ${duration}ms.`);
        } catch (evalError: any) {
          logger.error(
            `[Job Failed] Evaluation error for submission ${submissionId}: ${evalError.message}`,
            evalError.stack,
          );
          // Abandon message so Service Bus can re-deliver it according to queue retry policy
          await receiver.abandonMessage(message);
        }
      },
      processError: async (args) => {
        logger.error(`Azure Service Bus error on queue "${args.entityPath}": ${args.error.message}`, args.error.stack);
      },
    },
    {
      maxConcurrentCalls: concurrency,
      autoCompleteMessages: false, // Explicit peek-lock ACK upon completion
    },
  );

  // Graceful shutdown handlers
  let isShuttingDown = false;
  const shutdown = async (signal: string) => {
    if (isShuttingDown) return;
    isShuttingDown = true;
    logger.log(`Received ${signal}. Shutting down Judge Worker gracefully...`);

    try {
      await subscription.close();
      await receiver.close();
      await sbClient.close();
      await prisma.$disconnect();
      logger.log('Judge Worker stopped successfully.');
      process.exit(0);
    } catch (err: any) {
      logger.error(`Error during graceful shutdown: ${err.message}`);
      process.exit(1);
    }
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

bootstrap().catch((err) => {
  logger.error(`Fatal Judge Worker startup error: ${err.message}`, err.stack);
  process.exit(1);
});
