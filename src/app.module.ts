import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { createObserveModule } from '@nestjs/observe';
import { join } from 'path';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { BatchesModule } from './batches/batches.module.js';
import { CollegesModule } from './colleges/colleges.module.js';
import { registerGraphQLEnums } from './common/graphql/register-enums.js';
import configuration from './config/configuration.js';
import { validateEnvironment } from './config/env.validation.js';
import { ContestsModule } from './contests/contests.module.js';
import { CoursesModule } from './courses/courses.module.js';
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
    ...dynamicObserveImports,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: true,
      introspection: true,
      context: ({ req, res }: { req: any; res: any }) => ({ req, res }),
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    CollegesModule,
    BatchesModule,
    CoursesModule,
    ProblemsModule,
    ContestsModule,
    SubmissionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
