import axios from 'axios';
import { UniversitySearchResult } from '@/app/api/institutions/search/route';

const cache = new Map<string, UniversitySearchResult[]>();

export async function searchUniversitiesLive(query: string): Promise<UniversitySearchResult[]> {
  const trimmed = query.trim();
  const cacheKey = trimmed.toLowerCase();

  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)!;
  }

  try {
    const baseUrl = typeof window !== 'undefined' ? '' : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');
    const res = await axios.get<{ results: UniversitySearchResult[] }>(
      `${baseUrl}/api/institutions/search?q=${encodeURIComponent(trimmed)}`
    );
    const results: UniversitySearchResult[] = res.data?.results || [];
    cache.set(cacheKey, results);
    return results;
  } catch (err) {
    console.warn('Live institution search error:', err);
    return [];
  }
}
