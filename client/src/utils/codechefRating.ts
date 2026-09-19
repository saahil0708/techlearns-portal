/**
 * CodeChef-style Star Rating and Division calculation utility
 */

export interface RatingTierInfo {
  stars: number;
  starString: string;
  division: string;
  tierName: string;
  minRating: number;
  maxRating: number;
  color: string;
  bgColor: string;
  borderColor: string;
  badgeGradient: string;
  textColor: string;
}

export const RATING_TIERS: RatingTierInfo[] = [
  {
    stars: 1,
    starString: '★',
    division: 'Div 4',
    tierName: '1★ (Beginner)',
    minRating: 0,
    maxRating: 1399,
    color: '#64748B',
    bgColor: '#F1F5F9',
    borderColor: '#CBD5E1',
    badgeGradient: 'linear-gradient(135deg, #64748B 0%, #475569 100%)',
    textColor: '#334155',
  },
  {
    stars: 2,
    starString: '★★',
    division: 'Div 3',
    tierName: '2★ (Intermediate)',
    minRating: 1400,
    maxRating: 1599,
    color: '#16A34A',
    bgColor: '#F0FDF4',
    borderColor: '#BBF7D0',
    badgeGradient: 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)',
    textColor: '#166534',
  },
  {
    stars: 3,
    starString: '★★★',
    division: 'Div 2',
    tierName: '3★ (Skilled)',
    minRating: 1600,
    maxRating: 1799,
    color: '#2563EB',
    bgColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    badgeGradient: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
    textColor: '#1E40AF',
  },
  {
    stars: 4,
    starString: '★★★★',
    division: 'Div 2',
    tierName: '4★ (Advanced)',
    minRating: 1800,
    maxRating: 1999,
    color: '#9333EA',
    bgColor: '#FAF5FF',
    borderColor: '#E9D5FF',
    badgeGradient: 'linear-gradient(135deg, #9333EA 0%, #7E22CE 100%)',
    textColor: '#6B21A8',
  },
  {
    stars: 5,
    starString: '★★★★★',
    division: 'Div 1',
    tierName: '5★ (Expert)',
    minRating: 2000,
    maxRating: 2199,
    color: '#D97706',
    bgColor: '#FFFBEB',
    borderColor: '#FDE68A',
    badgeGradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
    textColor: '#92400E',
  },
  {
    stars: 6,
    starString: '★★★★★★',
    division: 'Div 1',
    tierName: '6★ (Master)',
    minRating: 2200,
    maxRating: 2499,
    color: '#EA580C',
    bgColor: '#FFF7ED',
    borderColor: '#FFEDD5',
    badgeGradient: 'linear-gradient(135deg, #F97316 0%, #C2410C 100%)',
    textColor: '#9A3412',
  },
  {
    stars: 7,
    starString: '★★★★★★★',
    division: 'Div 1',
    tierName: '7★ (Grandmaster)',
    minRating: 2500,
    maxRating: Infinity,
    color: '#DC2626',
    bgColor: '#FEF2F2',
    borderColor: '#FECACA',
    badgeGradient: 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)',
    textColor: '#991B1B',
  },
];

/**
 * Returns complete rating tier details for any given numeric rating.
 */
export function getRatingTier(rating: number = 1500): RatingTierInfo {
  const safeRating = Math.max(0, rating);
  const matchedTier = RATING_TIERS.find(
    (t) => safeRating >= t.minRating && safeRating <= t.maxRating
  );
  return matchedTier || RATING_TIERS[0];
}

export const getRatingTierInfo = getRatingTier;

/**
 * Returns stars count (1 to 7) for a given rating.
 */
export function getStarsCount(rating: number = 1500): number {
  return getRatingTier(rating).stars;
}

/**
 * Returns division ('Div 1' | 'Div 2' | 'Div 3' | 'Div 4') for a given rating.
 */
export function getDivision(rating: number = 1500): string {
  return getRatingTier(rating).division;
}

export const getDivisionFromRating = getDivision;

/**
 * Maps problem difficulty to standard numeric rating fallback when difficultyRating is not specified.
 */
export function getDifficultyFallbackRating(difficulty?: string): number {
  if (difficulty === 'Easy') return 480;
  if (difficulty === 'Medium') return 1420;
  if (difficulty === 'Hard') return 2240;
  return 1420;
}

export function getProblemRating(problem: { difficultyRating?: number; difficulty?: string }): number {
  if (typeof problem.difficultyRating === 'number') {
    return problem.difficultyRating;
  }
  return getDifficultyFallbackRating(problem.difficulty);
}
