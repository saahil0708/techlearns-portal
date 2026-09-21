import { useEffect, useRef, useState, useCallback } from 'react';

export interface PollingOptions {
  /** Polling interval in milliseconds. Default: 20000 (20 seconds) */
  intervalMs?: number;
  /** Whether polling is active. Default: true */
  enabled?: boolean;
  /** Automatically trigger refetch when user refocuses the tab. Default: true */
  revalidateOnFocus?: boolean;
  /** Pause polling when the document is hidden/backgrounded. Default: true */
  pauseOnHidden?: boolean;
}

export interface PollingResult<T> {
  data: T | null;
  isRefreshing: boolean;
  error: Error | null;
  lastUpdated: Date | null;
  refetch: () => Promise<void>;
}

/**
 * High-performance, zero-overhead polling hook.
 * - Pauses polling when the browser tab is hidden to save CPU and network bandwidth.
 * - Pauses polling when offline.
 * - Prevents request stacking (never fires a new request if the previous one is still in-flight).
 * - Immediately syncs on tab re-focus.
 */
export function usePolling<T>(
  fetcher: () => Promise<T>,
  options: PollingOptions = {}
): PollingResult<T> {
  const {
    intervalMs = 20000,
    enabled = true,
    revalidateOnFocus = true,
    pauseOnHidden = true,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const isFetchingRef = useRef(false);
  const fetcherRef = useRef(fetcher);

  useEffect(() => {
    fetcherRef.current = fetcher;
  }, [fetcher]);

  const execute = useCallback(async () => {
    // Avoid concurrent overlapping requests or running when offline
    if (isFetchingRef.current) return;
    if (typeof navigator !== 'undefined' && !navigator.onLine) return;

    isFetchingRef.current = true;
    setIsRefreshing(true);
    try {
      const result = await fetcherRef.current();
      setData(result);
      setError(null);
      setLastUpdated(new Date());
    } catch (err: unknown) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      isFetchingRef.current = false;
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    // Initial fetch on mount (deferred to next tick to avoid synchronous setState in effect)
    const initialTimer = setTimeout(() => {
      void execute();
    }, 0);

    let timer: NodeJS.Timeout | null = null;

    const startTimer = () => {
      if (timer) clearInterval(timer);
      timer = setInterval(() => {
        if (pauseOnHidden && typeof document !== 'undefined' && document.hidden) {
          return;
        }
        execute();
      }, intervalMs);
    };

    startTimer();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        if (revalidateOnFocus) {
          execute();
        }
        startTimer();
      }
    };

    const handleFocus = () => {
      if (revalidateOnFocus) {
        execute();
      }
      startTimer();
    };

    if (pauseOnHidden || revalidateOnFocus) {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    if (revalidateOnFocus && typeof window !== 'undefined') {
      window.addEventListener('focus', handleFocus);
    }

    return () => {
      clearTimeout(initialTimer);
      if (timer) clearInterval(timer);
      if (pauseOnHidden || revalidateOnFocus) {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
      if (revalidateOnFocus && typeof window !== 'undefined') {
        window.removeEventListener('focus', handleFocus);
      }
    };
  }, [intervalMs, enabled, pauseOnHidden, revalidateOnFocus, execute]);

  return {
    data,
    isRefreshing,
    error,
    lastUpdated,
    refetch: execute,
  };
}
