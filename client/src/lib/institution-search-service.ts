import { UniversitySearchResult } from '@/app/api/institutions/search/route';

const cache = new Map<string, UniversitySearchResult[]>();

export async function searchUniversitiesLive(query: string): Promise<UniversitySearchResult[]> {
  const trimmed = query.trim();
  const cacheKey = trimmed.toLowerCase();

  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)!;
  }

  try {
    const res = await fetch(`/api/institutions/search?q=${encodeURIComponent(trimmed)}`);
    if (!res.ok) throw new Error('Search failed');
    const json = await res.json();
    const results: UniversitySearchResult[] = json.results || [];
    cache.set(cacheKey, results);
    return results;
  } catch (err) {
    console.warn('Live institution search error:', err);
    return [];
  }
}
