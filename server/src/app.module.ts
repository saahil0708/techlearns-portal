import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ThrottlerModule } from '@nestjs/throttler';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { BatchesModule } from './batches/batches.module.js';
import { InstitutionsModule } from './institutions/institutions.module.js';
import { registerGraphQLEnums } from './common/graphql/register-enums.js';
import { GqlThrottlerGuard } from './common/guards/throttler.guard.js';
import configuration from './config/configuration.js';
import { validateEnvironment } from './config/env.validation.js';
import { ContestsModule } from './contests/contests.module.js';
import { CoursesModule } from './courses/courses.module.js';
import { JudgeModule } from './judge/judge.module.js';
import { MailModule } from './mail/mail.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { ProblemsModule } from './problems/problems.module.js';
import { SubmissionsModule } from './submissions/submissions.module.js';
import { UsersModule } from './users/users.module.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

// Register GraphQL Enums with Prisma types
registerGraphQLEnums();

const hasValidObserveKeys = Boolean(
  process.env.OBSERVE_APP_KEY &&
  process.env.OBSERVE_APP_KEY !== 'YOUR_APP_KEY' &&
  process.env.OBSERVE_APP_SECRET &&
  process.env.OBSERVE_APP_SECRET !== 'YOUR_APP_SECRET'
);

const dynamicObserveImports = hasValidObserveKeys
  ? [
      ObserveModule.forRoot({
        appKey: process.env.OBSERVE_APP_KEY!,
        appSecret: process.env.OBSERVE_APP_SECRET!,
        serviceId: 'cc',
      }),
    ]
  : [];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate: validateEnvironment,
      envFilePath: ['.env'],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 100,
      },
    ]),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('redis.host', 'localhost'),
          port: configService.get<number>('redis.port', 6379),
          password: configService.get<string>('redis.password') || undefined,
          maxRetriesPerRequest: null,
          enableReadyCheck: false,
        },
      }),
    }),
    ...dynamicObserveImports,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      sortSchema: true,
      playground: process.env.NODE_ENV !== 'production',
      introspection: process.env.NODE_ENV !== 'production',
      context: ({ req, res }: { req: any; res: any }) => ({ req, res }),
    }),
    PrismaModule,
    MailModule,
    UsersModule,
    AuthModule,
    InstitutionsModule,
    BatchesModule,
    CoursesModule,
    ProblemsModule,
    ContestsModule,
    SubmissionsModule,
    JudgeModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: GqlThrottlerGuard,
    },
  ],
})
export class AppModule {}
