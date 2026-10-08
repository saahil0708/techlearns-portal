import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';

interface MemoryCacheEntry<T> {
  value: T;
  expiresAt: number;
}

interface InFlightFetch<T> {
  generation: number;
  promise: Promise<T>;
}

@Injectable()
export class AppCacheService implements OnModuleDestroy {
  private readonly logger = new Logger(AppCacheService.name);
  private readonly l1Cache = new Map<string, MemoryCacheEntry<any>>();
  private readonly inFlightFetches = new Map<string, InFlightFetch<any>>();
  private readonly activeOperations = new Map<string, number>();
  private readonly keyGenerations = new Map<string, number>();
  private readonly prefixGenerations = new Map<string, number>();
  private readonly maxL1Entries = 10000;
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor() {
    // Periodic sweep for expired cache entries and unused generations every 60s
    this.cleanupTimer = setInterval(() => this.purgeExpiredL1(), 60_000);
    if (this.cleanupTimer.unref) {
      this.cleanupTimer.unref();
    }
  }

  onModuleDestroy() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    this.l1Cache.clear();
    this.inFlightFetches.clear();
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

    // Clean up generations for keys that have no active in-flight fetches, no active operations, and no entries
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
   * Retrieve cached value from in-memory cache
   */
  async get<T>(key: string): Promise<T | null> {
    const now = Date.now();
    const entry = this.l1Cache.get(key);
    if (entry) {
      if (entry.expiresAt > now) {
        return entry.value as T;
      }
      this.l1Cache.delete(key);
    }
    return null;
  }

  /**
   * Set cached value with TTL in seconds
   */
  async set<T>(key: string, value: T, ttlSeconds = 60): Promise<void> {
    this.setL1(key, value, ttlSeconds);
  }

  private setL1<T>(key: string, value: T, ttlSeconds: number): void {
    if (this.l1Cache.size >= this.maxL1Entries) {
      this.purgeExpiredL1();
      if (this.l1Cache.size >= this.maxL1Entries) {
        // Evict oldest entry (LRU-like FIFO on Map insertion order)
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
    // 1. Fast path: check synchronous memory cache
    const now = Date.now();
    const entry = this.l1Cache.get(key);
    if (entry && entry.expiresAt > now) {
      return entry.value as T;
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
        const fresh = await fetcher();
        if (fresh !== null && fresh !== undefined) {
          // Only cache if the key's invalidation generation did not change during fetch
          if (this.getKeyGeneration(key) === currentGen) {
            this.setL1(key, fresh, ttlSeconds);
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
   * Invalidate a single key
   */
  async invalidate(key: string): Promise<void> {
    this.l1Cache.delete(key);
    this.bumpKeyGeneration(key);
  }

  /**
   * Invalidate all keys matching a prefix
   */
  async invalidatePrefix(prefix: string): Promise<void> {
    for (const key of Array.from(this.l1Cache.keys())) {
      if (key.startsWith(prefix)) {
        this.l1Cache.delete(key);
      }
    }
    this.bumpPrefixGeneration(prefix);
  }

  /**
   * Returns live cache metrics and load statistics
   */
  getStats() {
    return {
      entriesCount: this.l1Cache.size,
      maxEntries: this.maxL1Entries,
      utilizationPercent: Number(((this.l1Cache.size / this.maxL1Entries) * 100).toFixed(1)),
      activeInFlightFetches: this.inFlightFetches.size,
      activeOperations: this.activeOperations.size,
    };
  }
}
