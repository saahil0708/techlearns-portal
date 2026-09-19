/**
 * Shared API & GraphQL Client Core
 * Centralized HTTP request transport, JWT auth injection, and query deduplication.
 */

import { fetchGraphQL } from '@/lib/graphql';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// In-flight request deduplication map
const inFlightRequests = new Map<string, Promise<any>>();

/**
 * Executes a deduplicated GraphQL query (if identical query is in flight, reuses the promise)
 */
export async function deduplicatedQuery<T>(query: string, variables: Record<string, any> = {}): Promise<T> {
  const key = `${query}::${JSON.stringify(variables)}`;

  if (inFlightRequests.has(key)) {
    return inFlightRequests.get(key) as Promise<T>;
  }

  const promise = fetchGraphQL<T>(query, variables).finally(() => {
    inFlightRequests.delete(key);
  });

  inFlightRequests.set(key, promise);
  return promise;
}

/**
 * Resolves JWT Authorization headers seamlessly across Browser and Next.js SSR boundaries.
 */
export async function getAuthHeaders(explicitToken?: string): Promise<Record<string, string>> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  let token = explicitToken;

  if (!token && typeof window !== 'undefined') {
    const match = document.cookie.match(/(?:^|;\s*)access_token=([^;]*)/);
    if (match) {
      token = decodeURIComponent(match[1]);
    }
  }

  if (!token && typeof window === 'undefined') {
    try {
      const { cookies } = await import('next/headers');
      const cookieStore = await cookies();
      token = cookieStore.get('access_token')?.value;
    } catch {
      // Called outside request context
    }
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}
