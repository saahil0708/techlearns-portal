export interface StudentDirectoryEntity {
  id: string;
  name: string;
  handle: string;
  email: string;
  studentId: string;
  institutionType: 'Institute' | 'Independent';
  institutionName: string;
  cohort: string;
  problemsSolved: number;
  solvedEasy: number;
  solvedMedium: number;
  solvedHard: number;
  hasVerifiedDifficulty?: boolean;
  contestRating: number;
  ratingTier: 'Master' | 'Candidate Master' | 'Expert' | 'Specialist' | 'Pupil' | 'Newbie';
  globalRank: number;
  accuracy: string;
  streakDays: number;
  lastActive?: string;
  status: 'Active' | 'Inactive' | 'Invited' | 'Suspended';
  avatarUrl?: string;
  avatarColor: string;
}

export type SortField =
  | 'name'
  | 'problemsSolved'
  | 'contestRating'
  | 'globalRank'
  | 'accuracy'
  | 'streakDays'
  | 'institutionName';
export type SortDirection = 'asc' | 'desc';

export const getRatingTierColor = (tier: StudentDirectoryEntity['ratingTier']) => {
  switch (tier) {
    case 'Master':
      return { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' };
    case 'Candidate Master':
      return { bg: '#FAF5FF', text: '#7C3AED', border: '#E9D5FF' };
    case 'Expert':
      return { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE' };
    case 'Specialist':
      return { bg: '#ECFEFF', text: '#0891B2', border: '#A5F3FC' };
    case 'Pupil':
      return { bg: '#F0FDF4', text: '#16A34A', border: '#BBF7D0' };
    case 'Newbie':
    default:
      return { bg: '#F1F5F9', text: '#64748B', border: '#CBD5E1' };
  }
};
