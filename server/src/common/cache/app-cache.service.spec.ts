import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { AppCacheService } from './app-cache.service.js';

describe('AppCacheService', () => {
  let service: AppCacheService;

  beforeEach(() => {
    service = new AppCacheService();
  });

  afterEach(() => {
    service.onModuleDestroy();
  });

  it('should store and retrieve from in-memory L1 cache', async () => {
    await service.set('test:key1', { message: 'hello' }, 10);
    const result = await service.get<{ message: string }>('test:key1');
    expect(result).toEqual({ message: 'hello' });
  });

  it('should return null for expired L1 cache entries', async () => {
    await service.set('test:expired', { val: 123 }, -1); // already expired
    const result = await service.get('test:expired');
    expect(result).toBeNull();
  });

  it('should share single in-flight fetcher promise across concurrent getOrSet calls', async () => {
    let fetchCount = 0;
    const slowFetcher = async () => {
      fetchCount++;
      await new Promise((resolve) => setTimeout(resolve, 50));
      return { data: 'shared-result' };
    };

    const [res1, res2, res3] = await Promise.all([
      service.getOrSet('test:concurrent', 60, slowFetcher),
      service.getOrSet('test:concurrent', 60, slowFetcher),
      service.getOrSet('test:concurrent', 60, slowFetcher),
    ]);

    expect(res1).toEqual({ data: 'shared-result' });
    expect(res2).toEqual({ data: 'shared-result' });
    expect(res3).toEqual({ data: 'shared-result' });
    expect(fetchCount).toBe(1); // Fetched exactly once
  });

  it('should allow retry after a failed in-flight fetcher', async () => {
    let attempts = 0;
    const failingFetcher = async () => {
      attempts++;
      if (attempts === 1) {
        throw new Error('Initial fetch failed');
      }
      return { success: true };
    };

    await expect(service.getOrSet('test:retry', 60, failingFetcher)).rejects.toThrow('Initial fetch failed');
    
    // Retry should not be stuck on failed in-flight promise
    const retryResult = await service.getOrSet('test:retry', 60, failingFetcher);
    expect(retryResult).toEqual({ success: true });
    expect(attempts).toBe(2);
  });

  it('should invalidate individual keys and prefixes', async () => {
    await service.set('problems:1', { id: 1 }, 60);
    await service.set('problems:2', { id: 2 }, 60);
    await service.set('courses:1', { id: 1 }, 60);

    await service.invalidate('problems:1');
    expect(await service.get('problems:1')).toBeNull();
    expect(await service.get('problems:2')).toEqual({ id: 2 });

    await service.invalidatePrefix('problems:');
    expect(await service.get('problems:2')).toBeNull();
    expect(await service.get('courses:1')).toEqual({ id: 1 });
  });

  it('should not cache value if key is invalidated while fetcher is in-flight', async () => {
    const slowFetcher = async () => {
      // Invalidate the key mid-flight
      await service.invalidate('test:in-flight-invalidated');
      return { val: 'stale' };
    };

    const result = await service.getOrSet('test:in-flight-invalidated', 60, slowFetcher);
    expect(result).toEqual({ val: 'stale' });

    // Subsequent get should return null because invalidation generation changed during fetch
    expect(await service.get('test:in-flight-invalidated')).toBeNull();
  });

  it('should allow unrelated keys to cache when an unrelated prefix is invalidated', async () => {
    const slowFetcher = async () => {
      // Invalidate unrelated prefix 'courses:'
      await service.invalidatePrefix('courses:');
      return { problem: 'p1' };
    };

    const result = await service.getOrSet('problems:1', 60, slowFetcher);
    expect(result).toEqual({ problem: 'p1' });

    // Since 'problems:1' is not matched by 'courses:', it should be successfully cached
    expect(await service.get('problems:1')).toEqual({ problem: 'p1' });
  });

  it('should start a new fetch when invalidation occurs during in-flight fetch rather than reusing stale promise', async () => {
    let callCount = 0;
    let resolveFirst: () => void;
    const firstPromise = new Promise<void>((r) => {
      resolveFirst = r;
    });

    const dynamicFetcher = async () => {
      callCount++;
      if (callCount === 1) {
        await firstPromise;
        return { version: 1 };
      }
      return { version: 2 };
    };

    // Start first fetch
    const p1 = service.getOrSet('user:profile', 60, dynamicFetcher);

    // Invalidate user:profile while first is still pending
    await service.invalidate('user:profile');

    // Start second fetch after invalidation
    const p2 = service.getOrSet('user:profile', 60, dynamicFetcher);

    resolveFirst!();

    const [res1, res2] = await Promise.all([p1, p2]);
    expect(res1).toEqual({ version: 1 });
    expect(res2).toEqual({ version: 2 });
    expect(callCount).toBe(2);

    // Cache should contain the second (latest) version
    expect(await service.get('user:profile')).toEqual({ version: 2 });
  });

  it('should prevent a pending superseded older fetch from restoring stale value when newer fetch returns null', async () => {
    let resolveOldFetch: () => void;
    const oldFetchGate = new Promise<void>((r) => {
      resolveOldFetch = r;
    });

    let fetchCount = 0;
    const testFetcher = async () => {
      fetchCount++;
      if (fetchCount === 1) {
        // First/older fetch is slow and will return stale value
        await oldFetchGate;
        return { data: 'stale-data' };
      }
      // Newer fetch returns null
      return null as any;
    };

    // 1. Launch older fetch
    const p1 = service.getOrSet('test:superseded', 60, testFetcher);

    // 2. Invalidate the key while older fetch is still pending
    await service.invalidate('test:superseded');

    // 3. Newer fetch runs and returns null
    const res2 = await service.getOrSet('test:superseded', 60, testFetcher);
    expect(res2).toBeNull();

    // 4. Trigger purge/cleanup while old fetch is still pending
    (service as any).purgeExpiredL1();

    // 5. Older fetch finally completes with stale value
    resolveOldFetch!();
    const res1 = await p1;
    expect(res1).toEqual({ data: 'stale-data' });

    // 6. Verify older fetch could NOT restore its stale value to the cache
    expect(await service.get('test:superseded')).toBeNull();
  });
});
