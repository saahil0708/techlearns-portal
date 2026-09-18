import { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import StudentProfileClient, { StudentProfileData } from '@/components/students/profile/StudentProfileClient';
import { apiService } from '@/lib/api-service';

// Seed master student directory lookup
const SEED_STUDENTS: Record<string, Partial<StudentProfileData>> = {
  'mayalin_cs': {
    id: 'stu-1',
    name: 'Maya Lin',
    handle: 'mayalin_cs',
    email: 'm.lin@iitb.ac.in',
    role: 'STUDENT',
    bio: 'Competitive programmer & ICPC Regional Finalist at IIT Bombay. Focused on graph algorithms, segment trees, and dynamic programming optimization.',
    institution: 'IIT Bombay - Dept of Computer Science',
    location: 'Mumbai, India',
    contestRating: 2380,
    ratingTier: 'Master',
    globalRank: 1,
    solvedTotal: 680,
    solvedEasy: 240,
    solvedMedium: 310,
    solvedHard: 130,
    totalSubmissions: 1840,
    accuracyRate: '96.4%',
    currentStreakDays: 48,
    maxStreakDays: 65,
  },
  'liam_vance': {
    id: 'stu-2',
    name: 'Liam Vance',
    handle: 'liam_vance',
    email: 'l.vance@stanford.edu',
    role: 'STUDENT',
    bio: 'CS undergraduate at Stanford. Passionate about concurrent distributed systems, memory models, and algorithmic game theory.',
    institution: 'Stanford University - Dept of CS',
    location: 'Stanford, CA, USA',
    contestRating: 2310,
    ratingTier: 'Master',
    globalRank: 2,
    solvedTotal: 650,
    solvedEasy: 210,
    solvedMedium: 320,
    solvedHard: 120,
    totalSubmissions: 1650,
    accuracyRate: '94.8%',
    currentStreakDays: 42,
    maxStreakDays: 58,
  },
  'alex_mercer': {
    id: 'stu-3',
    name: 'Alex Mercer',
    handle: 'alex_mercer',
    email: 'alex.m@mit.edu',
    role: 'STUDENT',
    bio: 'EECS undergraduate at MIT. Building high-performance systems and competing in ICPC Div 1.',
    institution: 'Massachusetts Inst of Technology (MIT)',
    location: 'Cambridge, MA, USA',
    contestRating: 2240,
    ratingTier: 'Master',
    globalRank: 3,
    solvedTotal: 620,
    solvedEasy: 190,
    solvedMedium: 310,
    solvedHard: 120,
    totalSubmissions: 1520,
    accuracyRate: '92.1%',
    currentStreakDays: 36,
    maxStreakDays: 48,
  },
  'alex_vance': {
    id: 'usr-001',
    name: 'Alexander Vance',
    handle: 'alex_vance',
    email: 'alex.vance@codeplatform.io',
    role: 'SUPER_ADMIN',
    bio: 'Full-stack systems architect & platform administrator. Enthusiastic about algorithm complexity, graph flows, and distributed sandboxes.',
    institution: 'Stanford University - Dept of CS',
    location: 'San Francisco, CA, USA',
    contestRating: 2380,
    ratingTier: 'Master',
    globalRank: 1,
    solvedTotal: 482,
    solvedEasy: 190,
    solvedMedium: 212,
    solvedHard: 80,
    totalSubmissions: 1240,
    accuracyRate: '86.4%',
    currentStreakDays: 38,
    maxStreakDays: 52,
  },
};

interface PageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  const match = SEED_STUDENTS[username] || { name: `@${username}` };
  return {
    title: `${match.name} (@${username}) | CodePlatform Student Profile`,
    description: `View ${match.name}'s competitive programming profile, contest standings, and solved problems.`,
  };
}

export default async function DynamicStudentProfilePage({ params }: PageProps) {
  const { username } = await params;
  let profileData: Partial<StudentProfileData> | undefined = SEED_STUDENTS[username];

  try {
    const liveProfile = await apiService.getStudentProfile(username);
    if (liveProfile && liveProfile.name) {
      profileData = liveProfile;
    } else {
      const liveUsers = await apiService.getUsers({ search: username, limit: 5 });
      const match = liveUsers?.items?.find(
        (u: any) => u.email?.toLowerCase().split('@')[0] === username.toLowerCase() || u.id === username
      );
      if (match) {
        profileData = {
          id: match.id,
          name: match.name,
          handle: match.email ? match.email.split('@')[0] : username,
          email: match.email,
          role: match.globalRole || 'STUDENT',
          institution: match.institution || 'Campus / Institute Division',
          location: match.location || 'Global',
          joinedDate: match.createdAt ? new Date(match.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently',
          contestRating: match.contestRating || 2100,
          ratingTier: match.ratingTier || 'Candidate Master',
          globalRank: 15,
          solvedTotal: 340,
          solvedEasy: 140,
          solvedMedium: 160,
          solvedHard: 40,
          totalSubmissions: 820,
          accuracyRate: '88.2%',
          currentStreakDays: 14,
          maxStreakDays: 30,
        };
      }
    }
  } catch (err) {
    console.warn('Live student query fallback:', err);
  }

  if (!profileData) {
    notFound();
  }

  return (
    <Suspense fallback={null}>
      <StudentProfileClient initialProfile={profileData} isOwner={false} />
    </Suspense>
  );
}
