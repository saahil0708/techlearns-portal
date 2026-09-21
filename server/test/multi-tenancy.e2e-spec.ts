import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppModule } from '../src/app.module.js';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter.js';
import { ResponseInterceptor } from '../src/common/interceptors/response.interceptor.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

describe('MultiTenancy & CollegeAccessGuard (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        $connect: vi.fn().mockResolvedValue(undefined),
        $disconnect: vi.fn().mockResolvedValue(undefined),
        institution: {
          findUnique: vi.fn().mockResolvedValue({ id: 'inst-1', name: 'Campus A' }),
          findMany: vi.fn().mockResolvedValue([]),
        },
        batch: {
          findMany: vi.fn().mockResolvedValue([]),
        },
        problem: {
          findMany: vi.fn().mockResolvedValue([]),
          findFirst: vi.fn().mockResolvedValue(null),
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();

    const reflector = app.get(Reflector);
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalInterceptors(new ResponseInterceptor(reflector));
    app.useGlobalFilters(new HttpExceptionFilter());

    await app.init();
  });

  it('/batches/institution/inst-1 (GET) - blocks unauthenticated requests', async () => {
    const res = await request(app.getHttpServer())
      .get('/batches/institution/inst-1')
      .expect(401);

    expect(res.body.success).toBe(false);
  });

  it('/contests/leaderboard/colleges (GET) - publicly accessible inter-college ranking', async () => {
    const res = await request(app.getHttpServer())
      .get('/contests/leaderboard/colleges')
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('/problems/potd/today (GET) - accessible and returns POTD or null if no published problems', async () => {
    const res = await request(app.getHttpServer())
      .get('/problems/potd/today')
      .expect(200);

    expect(res.body.success).toBe(true);
  });

  afterEach(async () => {
    await app.close();
  });
});
