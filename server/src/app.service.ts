import { Injectable, Optional } from '@nestjs/common';
import os from 'os';
import { PrismaService } from './prisma/prisma.service.js';
import { AppCacheService } from './common/cache/app-cache.service.js';

@Injectable()
export class AppService {
  constructor(
    @Optional() private readonly prisma?: PrismaService,
    @Optional() private readonly cache?: AppCacheService,
  ) {}

  async getHealth() {
    let dbStatus = 'disconnected';
    let dbPingMs = 0;

    if (this.prisma) {
      const dbStart = performance.now();
      try {
        await this.prisma.$queryRaw`SELECT 1`;
        dbStatus = 'connected';
        dbPingMs = Number((performance.now() - dbStart).toFixed(1));
      } catch (err) {
        dbStatus = 'error';
      }
    }

    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memUsage = process.memoryUsage();

    return {
      status: 'ok',
      service: 'TechLearns API',
      timestamp: new Date().toISOString(),
      system: {
        platform: os.platform(),
        arch: os.arch(),
        cpuCores: os.cpus().length,
        loadAverage: os.loadavg(),
        totalMemoryMb: Math.round(totalMem / (1024 * 1024)),
        freeMemoryMb: Math.round(freeMem / (1024 * 1024)),
        usedMemoryMb: Math.round(usedMem / (1024 * 1024)),
        usedMemoryPct: Number(((usedMem / totalMem) * 100).toFixed(1)),
        uptimeSeconds: Math.round(os.uptime()),
      },
      process: {
        nodeVersion: process.version,
        pid: process.pid,
        rssMb: Number((memUsage.rss / (1024 * 1024)).toFixed(2)),
        heapUsedMb: Number((memUsage.heapUsed / (1024 * 1024)).toFixed(2)),
        heapTotalMb: Number((memUsage.heapTotal / (1024 * 1024)).toFixed(2)),
        externalMb: Number((memUsage.external / (1024 * 1024)).toFixed(2)),
        uptimeSeconds: Math.round(process.uptime()),
      },
      database: {
        status: dbStatus,
        pingLatencyMs: dbPingMs,
      },
      cache: this.cache ? this.cache.getStats() : { status: 'n/a' },
      queue: {
        serviceBusConfigured: Boolean(process.env.AZURE_SERVICE_BUS_CONNECTION_STRING),
        queueName: process.env.AZURE_SERVICE_BUS_QUEUE_NAME || 'submissions',
      },
    };
  }
}
