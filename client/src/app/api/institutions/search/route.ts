import { NextRequest, NextResponse } from 'next/server';
import { POPULAR_INSTITUTIONS, RecognizedInstitution } from '@/data/popularInstitutions';

export interface UniversitySearchResult {
  name: string;
  code: string;
  domain?: string;
  state?: string;
  city?: string;
  country?: string;
  pincode?: string;
  source: 'database' | 'directory' | 'wikidata' | 'wikipedia' | 'global_api';
}

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Delhi',
  'Chandigarh',
  'Jammu and Kashmir',
  'Ladakh',
  'Puducherry',
];

const ABBREVIATION_MAP: Record<string, string> = {
  govt: 'government',
  gov: 'government',
  engg: 'engineering',
  eng: 'engineering',
  tech: 'technology',
  inst: 'institute',
  instt: 'institute',
  univ: 'university',
  uni: 'university',
  poly: 'polytechnic',
  clg: 'college',
  coll: 'college',
  mgmt: 'management',
  mgt: 'management',
  dept: 'department',
  sec: 'sector',
  coet: 'college of engineering',
  coe: 'college of engineering',
};

const PERSON_OR_MEDIA_TERMS = [
  'researcher',
  'scientist',
  'professor',
  'academic',
  'scholar',
  'biologist',
  'chemist',
  'physicist',
  'economist',
  'historian',
  'politician',
  'actor',
  'actress',
  'cricketer',
  'footballer',
  'film',
  'movie',
  'cinema',
  'album',
  'song',
  'singer',
  'musician',
  'director',
  'producer',
  'novelist',
  'author',
  'writer',
  'poet',
  'village',
  'district',
  'municipality',
  'station',
  'railway',
  'airport',
  'disambiguation',
];

const INSTITUTION_STRONG_TERMS = [
  'college',
  'colleges',
  'institute',
  'institutes',
  'institution',
  'institutions',
  'university',
  'universities',
  'polytechnic',
  'vidyapeeth',
  'vidyapith',
  'mahavidyalaya',
  'shikshan',
  'sanstha',
  'academy of technology',
  'academy of engineering',
  'campus',
  'school of engineering',
  'school of management',
  'school of technology',
  'faculty of technology',
  'faculty of engineering',
  'iit',
  'nit',
  'iiit',
  'bits',
];

function expandAbbreviations(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .map((word) => ABBREVIATION_MAP[word] || word)
    .join(' ');
}

function isEducationalEntity(title: string, description?: string): boolean {
  const normTitle = title.toLowerCase();
  const normDesc = (description || '').toLowerCase();
  const combined = `${normTitle} ${normDesc}`;

  // If description indicates a person or media entity, reject unless title explicitly has College/University/Institute
  const isPersonOrMedia = PERSON_OR_MEDIA_TERMS.some((term) => new RegExp(`\\b${term}\\b`, 'i').test(normDesc));
  const hasStrongInstitutionTitle = INSTITUTION_STRONG_TERMS.some((term) =>
    new RegExp(`\\b${term}\\b`, 'i').test(normTitle)
  );

  if (isPersonOrMedia && !hasStrongInstitutionTitle) {
    return false;
  }

  // Must have at least one strong institution term in title or description
  const hasStrongTerm = INSTITUTION_STRONG_TERMS.some((term) =>
    new RegExp(`\\b${term}\\b`, 'i').test(combined)
  );

  return hasStrongTerm;
}

function extractLocationDetails(text: string): { state?: string; city?: string; isIndia: boolean } {
  let matchedState: string | undefined;
  for (const st of INDIAN_STATES) {
    if (new RegExp(`\\b${st}\\b`, 'i').test(text)) {
      matchedState = st;
      break;
    }
  }

  const commonCities = [
    'Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad', 'Kolhapur', 'Solapur', 'Amravati', 'Sangli', 'Jalgaon',
    'Delhi', 'New Delhi', 'Noida', 'Greater Noida', 'Ghaziabad', 'Gurugram', 'Faridabad', 'Panipat', 'Sonipat', 'Karnal', 'Rohtak', 'Hisar', 'Ambala', 'Kurukshetra',
    'Chandigarh', 'Mohali', 'Patiala', 'Ludhiana', 'Jalandhar', 'Amritsar', 'Bathinda', 'Ropar', 'Rajpura', 'Phagwara', 'Fatehgarh Sahib',
    'Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer', 'Bikaner', 'Pilani', 'Bhilwara', 'Alwar',
    'Bhopal', 'Indore', 'Gwalior', 'Jabalpur', 'Ujjain',
    'Lucknow', 'Kanpur', 'Varanasi', 'Prayagraj', 'Agra', 'Aligarh', 'Meerut', 'Bareilly', 'Gorakhpur', 'Mathura', 'Jhansi', 'Sultanpur',
    'Dehradun', 'Roorkee', 'Haridwar', 'Nainital', 'Solan', 'Shimla', 'Hamirpur', 'Mandi', 'Jammu', 'Srinagar',
    'Bengaluru', 'Bangalore', 'Mysuru', 'Mysore', 'Mangaluru', 'Mangalore', 'Hubballi', 'Belagavi', 'Davangere', 'Tumakuru', 'Manipal',
    'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Vellore', 'Erode', 'Thanjavur',
    'Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam',
    'Visakhapatnam', 'Vijayawada', 'Guntur', 'Tirupati', 'Kurnool', 'Nellore', 'Kakinada', 'Rajahmundry', 'Bhimavaram', 'Bapatla',
    'Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam', 'Kottayam', 'Palakkad', 'Kannur', 'Alappuzha',
    'Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Kalyani', 'Haldia', 'Kharagpur',
    'Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur', 'Burla',
    'Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Darbhanga', 'Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro',
    'Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Shillong', 'Agartala', 'Imphal', 'Aizawl', 'Kohima', 'Itanagar', 'Gangtok'
  ];

  let matchedCity: string | undefined;
  for (const city of commonCities) {
    if (new RegExp(`\\b${city}\\b`, 'i').test(text)) {
      matchedCity = city;
      break;
    }
  }

  const isIndia = Boolean(
    matchedState ||
    matchedCity ||
    /\bindia\b/i.test(text) ||
    /\bindian\b/i.test(text) ||
    /\b(iit|nit|iiit|bits|aicte|ugc|vtu|anna university|ptu|mdu|kuk|rtu|bput|rgpv|aktu|unipune|mu)\b/i.test(text)
  );

  return {
    state: matchedState,
    city: matchedCity,
    isIndia,
  };
}

function generateCodeFromName(name: string): string {
  const parenMatch = name.match(/\(([^)]+)\)/);
  if (parenMatch && parenMatch[1]) {
    const raw = parenMatch[1].trim().replace(/[^a-zA-Z0-9]/g, '');
    if (raw.length >= 2 && raw.length <= 12) return raw.toUpperCase();
  }

  const words = name
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .split(/\s+/)
    .filter(
      (w) =>
        !['of', 'and', '&', 'the', 'in', 'at', 'for', 'to', 'de', 'la', 'technology', 'university', 'institute', 'college'].includes(
          w.toLowerCase()
        )
    );

  if (words.length >= 2) {
    const acronym = words.map((w) => w[0]).join('').toUpperCase();
    if (acronym.length >= 2 && acronym.length <= 8) return acronym;
  }

  return name
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, 8)
    .toUpperCase();
}

function generateDomainFromName(name: string, code: string): string {
  const cleanCode = code.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (cleanCode.length >= 3 && cleanCode.length <= 8) {
    return `${cleanCode}.ac.in`;
  }
  const cleanName = name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 16);
  return `${cleanName}.edu.in`;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawQuery = (searchParams.get('q') || '').trim();

  if (!rawQuery || rawQuery.length < 1) {
    return NextResponse.json({
      results: POPULAR_INSTITUTIONS.slice(0, 25).map((inst) => ({
        ...inst,
        country: 'India',
        source: 'directory',
      })),
    });
  }

  const expandedQuery = expandAbbreviations(rawQuery);
  const queryTokens = expandedQuery.split(/\s+/).filter(Boolean);
  const resultsMap = new Map<string, UniversitySearchResult>();

  // 1. Curated master catalog search with abbreviation expansion (Strictly Indian Institutions)
  for (const inst of POPULAR_INSTITUTIONS) {
    const fullSearchable = expandAbbreviations(
      `${inst.name} ${inst.code} ${inst.city || ''} ${inst.state || ''}`
    );
    const matchesAllTokens = queryTokens.every((token) => fullSearchable.includes(token));

    if (matchesAllTokens) {
      resultsMap.set(inst.name.toLowerCase(), {
        name: inst.name,
        code: inst.code,
        domain: inst.domain,
        state: inst.state,
        city: inst.city,
        pincode: inst.pincode,
        country: 'India',
        source: 'directory',
      });
    }
  }

  // 2. Parallel fetch from Wikidata + Wikipedia + Hipolabs (India Filtered)
  const httpHeaders = {
    'User-Agent': 'TechLearns-CodePlatform/1.0 (https://techlearns.edu; platform@techlearns.edu)',
    Accept: 'application/json',
  };

  const searchPromises: Promise<void>[] = [];

  // A. Wikidata Entity Search (Strictly India)
  searchPromises.push(
    (async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2800);

        const wikiDataUrl = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(
          rawQuery
        )}&language=en&type=item&limit=15&format=json&origin=*`;

        const res = await fetch(wikiDataUrl, {
          signal: controller.signal,
          headers: httpHeaders,
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data?.search)) {
            for (const item of data.search) {
              const label = item.label?.trim();
              const desc = item.description?.trim();
              if (!label) continue;

              if (isEducationalEntity(label, desc)) {
                const loc = extractLocationDetails(`${label} ${desc || ''}`);
                // Enforce strictly India
                if (!loc.isIndia) continue;

                const key = label.toLowerCase();
                if (!resultsMap.has(key)) {
                  const code = generateCodeFromName(label);
                  const domain = generateDomainFromName(label, code);

                  resultsMap.set(key, {
                    name: label,
                    code,
                    domain,
                    state: loc.state,
                    city: loc.city,
                    country: 'India',
                    source: 'wikidata',
                  });
                }
              }
            }
          }
        }
      } catch {
        // Fallback gracefully
      }
    })()
  );

  // B. Wikipedia Full-Text Search (Strictly India)
  searchPromises.push(
    (async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2800);

        const wikiSearchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
          rawQuery + ' college institute university india'
        )}&format=json&origin=*`;

        const res = await fetch(wikiSearchUrl, {
          signal: controller.signal,
          headers: httpHeaders,
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data?.query?.search)) {
            for (const item of data.query.search.slice(0, 10)) {
              const title = item.title?.trim();
              const snippet = item.snippet?.replace(/<[^>]+>/g, '');
              if (!title) continue;

              if (isEducationalEntity(title, snippet)) {
                const loc = extractLocationDetails(`${title} ${snippet || ''}`);
                // Enforce strictly India
                if (!loc.isIndia) continue;

                const key = title.toLowerCase();
                if (!resultsMap.has(key)) {
                  const code = generateCodeFromName(title);
                  const domain = generateDomainFromName(title, code);

                  resultsMap.set(key, {
                    name: title,
                    code,
                    domain,
                    state: loc.state,
                    city: loc.city,
                    country: 'India',
                    source: 'wikipedia',
                  });
                }
              }
            }
          }
        }
      } catch {
        // Fallback gracefully
      }
    })()
  );

  // C. Hipolabs Universities API (Filtered to Country=India)
  searchPromises.push(
    (async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);

        const apiUrl = `https://universities.hipolabs.com/search?country=India&name=${encodeURIComponent(rawQuery)}`;
        const res = await fetch(apiUrl, {
          signal: controller.signal,
          headers: httpHeaders,
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            for (const item of data.slice(0, 15)) {
              if (!item.name) continue;
              const key = item.name.toLowerCase();
              if (!resultsMap.has(key)) {
                const domain = Array.isArray(item.domains) && item.domains.length > 0 ? item.domains[0] : undefined;
                const state = item['state-province'] || undefined;
                const code = generateCodeFromName(item.name);

                resultsMap.set(key, {
                  name: item.name,
                  code,
                  domain,
                  state,
                  country: 'India',
                  source: 'global_api',
                });
              }
            }
          }
        }
      } catch {
        // Fallback gracefully
      }
    })()
  );

  await Promise.allSettled(searchPromises);

  // Sort results: exact / prefix matches and curated directory first
  const normalizedRaw = rawQuery.toLowerCase();
  const allResults = Array.from(resultsMap.values()).sort((a, b) => {
    const aName = a.name.toLowerCase();
    const bName = b.name.toLowerCase();

    const aExact = aName === normalizedRaw ? 1 : 0;
    const bExact = bName === normalizedRaw ? 1 : 0;
    if (aExact !== bExact) return bExact - aExact;

    const aStartsWith = aName.startsWith(normalizedRaw) ? 1 : 0;
    const bStartsWith = bName.startsWith(normalizedRaw) ? 1 : 0;
    if (aStartsWith !== bStartsWith) return bStartsWith - aStartsWith;

    const aDir = a.source === 'directory' ? 1 : 0;
    const bDir = b.source === 'directory' ? 1 : 0;
    if (aDir !== bDir) return bDir - aDir;

    return 0;
  });

  return NextResponse.json({ results: allResults.slice(0, 35) });
}
