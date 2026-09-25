import { Injectable, Logger, OnModuleDestroy, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

interface MemoryCacheEntry<T> {
  value: T;
  expiresAt: number;
}

interface InFlightFetch<T> {
  generation: number;
  promise: Promise<T>;
}

interface InvalidationMessage {
  type: 'key' | 'prefix';
  target: string;
}

const INVALIDATION_CHANNEL = 'app-cache:invalidation';

@Injectable()
export class AppCacheService implements OnModuleDestroy {
  private readonly logger = new Logger(AppCacheService.name);
  private readonly l1Cache = new Map<string, MemoryCacheEntry<any>>();
  private readonly inFlightFetches = new Map<string, InFlightFetch<any>>();
  private readonly activeOperations = new Map<string, number>();
  private readonly keyGenerations = new Map<string, number>();
  private readonly prefixGenerations = new Map<string, number>();
  private readonly redis: Redis | null = null;
  private readonly redisSub: Redis | null = null;
  private readonly maxL1Entries = 5000;
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor(@Optional() private readonly configService?: ConfigService) {
    const host: string | undefined = this.configService?.get('redis.host') ?? process.env.REDIS_HOST;
    const isRedisConfigured = Boolean(host && host.trim() !== '');

    if (isRedisConfigured && host) {
      try {
        const port: number =
          this.configService?.get('redis.port') ??
          (process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379);
        const password: string | undefined =
          this.configService?.get('redis.password') ?? process.env.REDIS_PASSWORD;

        const redisOptions = {
          host,
          port,
          password: password || undefined,
          lazyConnect: true,
          enableOfflineQueue: false, // Reject operations promptly when disconnected rather than queueing
          maxRetriesPerRequest: 1,
          retryStrategy: (times: number) => {
            // Keep retrying reconnection indefinitely with a capped delay of 3 seconds
            return Math.min(times * 200, 3000);
          },
        };

        this.redis = new Redis(redisOptions);
        this.redisSub = new Redis(redisOptions);

        this.redis.connect().catch((err) => {
          this.logger.warn(
            `Redis L2 cache unavailable, operating on in-memory L1 cache: ${err.message}`,
          );
        });

        this.redisSub
          .connect()
          .then(() => {
            this.redisSub?.subscribe(INVALIDATION_CHANNEL, (err) => {
              if (err) {
                this.logger.warn(
                  `Failed to subscribe to cross-instance invalidation channel: ${err.message}`,
                );
              }
            });

            this.redisSub?.on('message', (channel, message) => {
              if (channel === INVALIDATION_CHANNEL) {
                try {
                  const payload: InvalidationMessage = JSON.parse(message);
                  if (payload.type === 'key') {
                    this.l1Cache.delete(payload.target);
                    this.bumpKeyGeneration(payload.target);
                  } else if (payload.type === 'prefix') {
                    for (const key of Array.from(this.l1Cache.keys())) {
                      if (key.startsWith(payload.target)) {
                        this.l1Cache.delete(key);
                      }
                    }
                    this.bumpPrefixGeneration(payload.target);
                  }
                } catch (err: any) {
                  this.logger.debug(`Error handling invalidation message: ${err.message}`);
                }
              }
            });
          })
          .catch((err) => {
            this.logger.warn(
              `Redis subscriber unavailable for cross-instance invalidations: ${err.message}`,
            );
          });
      } catch (err: any) {
        this.logger.warn(`Failed to initialize Redis for AppCacheService: ${err.message}`);
      }
    }

    // Periodic sweep for expired L1 entries and unused generations every 60s
    this.cleanupTimer = setInterval(() => this.purgeExpiredL1(), 60_000);
    if (this.cleanupTimer.unref) {
      this.cleanupTimer.unref();
    }
  }

  onModuleDestroy() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    if (this.redis) {
      this.redis.disconnect();
    }
    if (this.redisSub) {
      this.redisSub.disconnect();
    }
  }

  private acquireOperation(key: string): void {
    this.activeOperations.set(key, (this.activeOperations.get(key) || 0) + 1);
  }

  private releaseOperation(key: string): void {
    const count = (this.activeOperations.get(key) || 0) - 1;
    if (count <= 0) {
      this.activeOperations.delete(key);
    } else {
      this.activeOperations.set(key, count);
    }
  }

  private hasActiveOperations(key: string): boolean {
    return (this.activeOperations.get(key) || 0) > 0;
  }

  private getKeyGeneration(key: string): number {
    let gen = this.keyGenerations.get(key) || 0;
    for (const [prefix, pGen] of this.prefixGenerations.entries()) {
      if (key.startsWith(prefix)) {
        gen += pGen;
      }
    }
    return gen;
  }

  private bumpKeyGeneration(key: string): void {
    this.keyGenerations.set(key, (this.keyGenerations.get(key) || 0) + 1);
  }

  private bumpPrefixGeneration(prefix: string): void {
    this.prefixGenerations.set(prefix, (this.prefixGenerations.get(prefix) || 0) + 1);
    for (const k of Array.from(this.keyGenerations.keys())) {
      if (k.startsWith(prefix)) {
        this.keyGenerations.set(k, (this.keyGenerations.get(k) || 0) + 1);
      }
    }
  }

  private purgeExpiredL1(): void {
    const now = Date.now();
    for (const [key, entry] of this.l1Cache.entries()) {
      if (entry.expiresAt <= now) {
        this.l1Cache.delete(key);
      }
    }

    // Clean up generations for keys that have no active in-flight fetches, no active operations, and no L1 entries
    for (const key of Array.from(this.keyGenerations.keys())) {
      if (!this.inFlightFetches.has(key) && !this.l1Cache.has(key) && !this.hasActiveOperations(key)) {
        this.keyGenerations.delete(key);
      }
    }

    // Clean up unused prefix generations
    for (const prefix of Array.from(this.prefixGenerations.keys())) {
      const hasL1Match = Array.from(this.l1Cache.keys()).some((k) => k.startsWith(prefix));
      const hasInFlightMatch = Array.from(this.inFlightFetches.keys()).some((k) =>
        k.startsWith(prefix),
      );
      const hasActiveOpMatch = Array.from(this.activeOperations.keys()).some(
        (k) => k.startsWith(prefix) && (this.activeOperations.get(k) || 0) > 0,
      );
      if (!hasL1Match && !hasInFlightMatch && !hasActiveOpMatch) {
        this.prefixGenerations.delete(prefix);
      }
    }
  }

  /**
   * Retrieve cached value across L1 (Memory) and L2 (Redis)
   */
  async get<T>(key: string): Promise<T | null> {
    const now = Date.now();

    // 1. Check L1 Memory Cache
    const l1Entry = this.l1Cache.get(key);
    if (l1Entry) {
      if (l1Entry.expiresAt > now) {
        return l1Entry.value as T;
      }
      this.l1Cache.delete(key);
    }

    // 2. Check L2 Redis Cache
    if (this.redis) {
      this.acquireOperation(key);
      try {
        const genBefore = this.getKeyGeneration(key);
        const [raw, remainingTtl] = await Promise.all([
          this.redis.get(key),
          this.redis.ttl(key),
        ]);

        if (raw !== null && raw !== undefined) {
          // If key was expired or deleted in Redis (TTL = -2), skip refill and return null
          if (remainingTtl === -2) {
            return null;
          }

          const parsed = JSON.parse(raw);
          const genAfter = this.getKeyGeneration(key);

          // If generation changed during pending read, return cache miss instead of stale value
          if (genBefore !== genAfter) {
            return null;
          }

          const effectiveTtl =
            remainingTtl > 0 ? remainingTtl : remainingTtl === -1 ? 60 : 1;
          this.setL1(key, parsed, effectiveTtl);

          return parsed as T;
        }
      } catch (err: any) {
        this.logger.debug(`Redis get failed for key "${key}": ${err.message}`);
      } finally {
        this.releaseOperation(key);
      }
    }

    return null;
  }

  /**
   * Set cached value in both L1 (Memory) and L2 (Redis)
   */
  async set<T>(key: string, value: T, ttlSeconds = 60): Promise<void> {
    this.setL1(key, value, ttlSeconds);

    if (this.redis) {
      try {
        await this.redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
      } catch (err: any) {
        this.logger.debug(`Redis set failed for key "${key}": ${err.message}`);
      }
    }
  }

  private setL1<T>(key: string, value: T, ttlSeconds: number): void {
    if (this.l1Cache.size >= this.maxL1Entries) {
      this.purgeExpiredL1();
      if (this.l1Cache.size >= this.maxL1Entries) {
        // Evict oldest entry
        const firstKey = this.l1Cache.keys().next().value;
        if (firstKey) this.l1Cache.delete(firstKey);
      }
    }

    this.l1Cache.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  /**
   * High-level cache helper: gets from cache or fetches and caches automatically,
   * sharing one in-flight fetcher promise per key for its current generation,
   * starting a new fetch when invalidations advance generations, and ensuring
   * old promise cleanups only remove their own active entries.
   */
  async getOrSet<T>(key: string, ttlSeconds: number, fetcher: () => Promise<T>): Promise<T> {
    // 1. Fast path: check synchronous L1 memory cache
    const now = Date.now();
    const l1Entry = this.l1Cache.get(key);
    if (l1Entry && l1Entry.expiresAt > now) {
      return l1Entry.value as T;
    }

    const currentGen = this.getKeyGeneration(key);

    // 2. Check if an in-flight fetcher is already active for this key's current generation
    const inFlight = this.inFlightFetches.get(key);
    if (inFlight && inFlight.generation === currentGen) {
      return inFlight.promise as Promise<T>;
    }

    // 3. Launch new fetch promise for current generation
    this.acquireOperation(key);
    let selfPromise: Promise<T> | undefined;
    const fetchPromise: Promise<T> = (async () => {
      try {
        // Check L2 Redis cache before invoking fetcher
        const cached = await this.get<T>(key);
        if (cached !== null && cached !== undefined) {
          return cached;
        }

        const fresh = await fetcher();
        if (fresh !== null && fresh !== undefined) {
          // Only cache if the key's invalidation generation did not change during fetch
          if (this.getKeyGeneration(key) === currentGen) {
            await this.set(key, fresh, ttlSeconds);
          }
        }
        return fresh;
      } finally {
        // Only delete from inFlightFetches if it still refers to this specific promise
        const active = this.inFlightFetches.get(key);
        if (active && active.promise === selfPromise) {
          this.inFlightFetches.delete(key);
        }
        this.releaseOperation(key);
      }
    })();
    selfPromise = fetchPromise;

    this.inFlightFetches.set(key, { generation: currentGen, promise: fetchPromise });
    return fetchPromise;
  }

  /**
   * Invalidate a single key across L1, L2, and all app instances via Pub/Sub
   */
  async invalidate(key: string): Promise<void> {
    this.l1Cache.delete(key);
    this.bumpKeyGeneration(key);

    if (this.redis) {
      try {
        await this.redis.del(key);
        await this.redis.publish(
          INVALIDATION_CHANNEL,
          JSON.stringify({ type: 'key', target: key }),
        );
      } catch (err: any) {
        this.logger.debug(`Redis del/publish failed for key "${key}": ${err.message}`);
      }
    }
  }

  /**
   * Invalidate all keys matching a prefix across L1, L2, and all app instances via Pub/Sub
   */
  async invalidatePrefix(prefix: string): Promise<void> {
    // Invalidate local L1
    for (const key of Array.from(this.l1Cache.keys())) {
      if (key.startsWith(prefix)) {
        this.l1Cache.delete(key);
      }
    }
    this.bumpPrefixGeneration(prefix);

    // Invalidate L2 Redis & broadcast to other instances
    if (this.redis) {
      try {
        let cursor = '0';
        do {
          const [nextCursor, keys] = await this.redis.scan(
            cursor,
            'MATCH',
            `${prefix}*`,
            'COUNT',
            100,
          );
          cursor = nextCursor;
          if (keys.length > 0) {
            await this.redis.del(...keys);
          }
        } while (cursor !== '0');

        await this.redis.publish(
          INVALIDATION_CHANNEL,
          JSON.stringify({ type: 'prefix', target: prefix }),
        );
      } catch (err: any) {
        this.logger.debug(`Redis prefix invalidation/publish failed for "${prefix}": ${err.message}`);
      }
    }
  }
}
