'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Box, Tabs, Tab } from '@mui/material';
import {
  StudentProfileData,
  StudentSubmission,
  StudentContestHistory,
  StudentCourseProgress,
  StudentTopicSkill,
  StudentCertification,
} from '@/types/student-profile';

export type { StudentProfileData };
import { useAppSelector } from '@/store/hooks';
import { useToast } from '@/context/ToastContext';
import { MuiCenterLoader, MuiPageLoader } from '@/components/shared/MuiLoadingFallback';
import { apiService } from '@/lib/api-service';

// Layout & Modular Child Components
import StudentAppLayout from '@/components/students/layout/StudentAppLayout';
import StudentProfileHeader from './StudentProfileHeader';
import StudentMetricsGrid from './StudentMetricsGrid';
import StudentOverviewTab from './StudentOverviewTab';
import StudentPracticeTab from './StudentPracticeTab';
import StudentSubmissionsTab from './StudentSubmissionsTab';
import StudentContestsTab from './StudentContestsTab';
import StudentCoursesTab from './StudentCoursesTab';
import StudentSettingsTab from './StudentSettingsTab';
import EditStudentProfileModal from './EditStudentProfileModal';
import ViewSubmissionCodeModal from './ViewSubmissionCodeModal';
import ViewCertificateModal from './ViewCertificateModal';
import UploadResumeModal from './UploadResumeModal';

interface StudentProfileClientProps {
  initialProfile?: Partial<StudentProfileData>;
  isOwner?: boolean;
}

const getInitialOwnerProfile = (): Partial<StudentProfileData> => {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('codeplatform_user');
      if (stored) {
        const u = JSON.parse(stored);
        if (u?.name) {
          return {
            id: u.id,
            name: u.name,
            handle: u.email ? u.email.split('@')[0] : 'coder',
            email: u.email,
            role: u.globalRole || 'STUDENT',
          };
        }
      }
    } catch {}
  }
  return {};
};

export default function StudentProfileClient({
  initialProfile,
  isOwner = true,
}: StudentProfileClientProps) {
  const toast = useToast();
  const searchParams = useSearchParams();
  const currentUser = useAppSelector((state) => state.auth.user);

  const validTabs = ['overview', 'practice', 'submissions', 'contests', 'courses', 'settings'] as const;
  type TabType = typeof validTabs[number];

  const initialTabParam = searchParams.get('tab') as TabType | null;
  const [currentTab, setCurrentTab] = useState<TabType>(
    initialTabParam && validTabs.includes(initialTabParam)
      ? initialTabParam
      : 'overview'
  );

  useEffect(() => {
    const tab = searchParams.get('tab') as TabType | null;
    if (tab && validTabs.includes(tab)) {
      setCurrentTab(tab);
    }
  }, [searchParams]);

  const [isTabLoading, setIsTabLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const initialOwner = getInitialOwnerProfile();
  const [isPageLoading, setIsPageLoading] = useState<boolean>(
    isOwner && !initialProfile?.name && !currentUser?.name && !initialOwner.name
  );

  // Profile data state
  const [profile, setProfile] = useState<StudentProfileData>({
    id: initialProfile?.id || currentUser?.id || initialOwner.id || 'stu-default',
    name: initialProfile?.name || currentUser?.name || initialOwner.name || '',
    handle: initialProfile?.handle || (currentUser?.email ? currentUser.email.split('@')[0] : initialOwner.handle || 'student_coder'),
    email: initialProfile?.email || currentUser?.email || initialOwner.email || '',
    role: initialProfile?.role || currentUser?.globalRole || initialOwner.role || 'STUDENT',
    avatarUrl: initialProfile?.avatarUrl,
    bannerGradient: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 50%, #3B82F6 100%)',
    bio: initialProfile?.bio || 'Competitive programmer & USACO Gold contender. Focused on graph algorithms, segment trees, and dynamic programming optimization.',
    institution: initialProfile?.institution || 'Stuyvesant High School of Science',
    location: initialProfile?.location || 'New York, NY, USA',
    joinedDate: initialProfile?.joinedDate || 'January 2025',
    githubUrl: initialProfile?.githubUrl || 'https://github.com',
    linkedinUrl: initialProfile?.linkedinUrl || 'https://linkedin.com',
    websiteUrl: initialProfile?.websiteUrl || 'https://codeplatform.io',
    contestRating: initialProfile?.contestRating || 2380,
    ratingTier: initialProfile?.ratingTier || 'Master',
    globalRank: initialProfile?.globalRank || 1,
    solvedTotal: initialProfile?.solvedTotal || 680,
    solvedEasy: initialProfile?.solvedEasy || 240,
    solvedMedium: initialProfile?.solvedMedium || 310,
    solvedHard: initialProfile?.solvedHard || 130,
    totalSubmissions: initialProfile?.totalSubmissions || 1840,
    accuracyRate: initialProfile?.accuracyRate || '96.4%',
    currentStreakDays: initialProfile?.currentStreakDays || 48,
    maxStreakDays: initialProfile?.maxStreakDays || 65,
  });

  // 1. Sync when Redux currentUser state arrives or updates
  useEffect(() => {
    if (isOwner && currentUser?.name) {
      setProfile((prev) => ({
        ...prev,
        id: currentUser.id || prev.id,
        name: currentUser.name,
        handle: currentUser.email ? currentUser.email.split('@')[0] : prev.handle,
        email: currentUser.email || prev.email,
        role: currentUser.globalRole || prev.role,
      }));
      setIsPageLoading(false);
    }
  }, [currentUser, isOwner]);

  // 2. Query live profile directly from backend /auth/me or localStorage
  useEffect(() => {
    if (!isOwner) return;

    // Check localStorage immediately
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('codeplatform_user');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.name) {
            setProfile((prev) => ({
              ...prev,
              id: parsed.id || prev.id,
              name: parsed.name,
              handle: parsed.email ? parsed.email.split('@')[0] : prev.handle,
              email: parsed.email || prev.email,
              role: parsed.globalRole || prev.role,
            }));
            setIsPageLoading(false);
          }
        }
      } catch {}
    }

    // Query backend /auth/me
    async function fetchLiveProfile() {
      try {
        const res = await apiService.getProfile();
        const liveUser = res?.data || res;
        if (liveUser && liveUser.name) {
          setProfile((prev) => ({
            ...prev,
            id: liveUser.id || prev.id,
            name: liveUser.name,
            handle: liveUser.email ? liveUser.email.split('@')[0] : prev.handle,
            email: liveUser.email || prev.email,
            role: liveUser.globalRole || prev.role,
          }));
        }
      } catch {
      } finally {
        setIsPageLoading(false);
      }
    }
    fetchLiveProfile();
  }, [isOwner]);

  // Modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [codeModalOpen, setCodeModalOpen] = useState(false);
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const [selectedCert, setSelectedCert] = useState<StudentCertification | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<StudentSubmission | null>(null);

  // Submissions state
  const [submissions] = useState<StudentSubmission[]>([
    {
      id: 'sub-9912',
      problemTitle: 'Two Sum & Pair Target Lookups',
      problemSlug: 'two-sum',
      problemCode: 'PROB-001',
      difficulty: 'Easy',
      language: 'C++20',
      verdict: 'Accepted',
      runtimeMs: 4,
      memoryKb: 10400,
      submittedAt: 'Today, 10:24 AM',
      codeSnippet: `#include <vector>\n#include <unordered_map>\nusing namespace std;\n\nvector<int> twoSum(vector<int>& nums, int target) {\n    unordered_map<int, int> mp;\n    for (int i = 0; i < nums.size(); ++i) {\n        int comp = target - nums[i];\n        if (mp.count(comp)) return {mp[comp], i};\n        mp[nums[i]] = i;\n    }\n    return {};\n}`,
    },
    {
      id: 'sub-9890',
      problemTitle: 'Trapping Rain Water II (3D Grid)',
      problemSlug: 'trapping-rain-water-ii',
      problemCode: 'PROB-407',
      difficulty: 'Hard',
      language: 'C++20',
      verdict: 'Accepted',
      runtimeMs: 18,
      memoryKb: 14200,
      submittedAt: 'Yesterday, 09:14 PM',
      codeSnippet: `// Priority queue Dijkstra-like 3D boundary propagation...`,
    },
    {
      id: 'sub-9844',
      problemTitle: 'Optimal Subarray Frequency XOR',
      problemSlug: 'optimal-subarray-frequency-xor',
      problemCode: 'PROB-B',
      difficulty: 'Medium',
      language: 'Python 3',
      verdict: 'Accepted',
      runtimeMs: 52,
      memoryKb: 19800,
      submittedAt: '2 days ago',
      codeSnippet: `class Solution:\n    def solve(self, A: List[int]) -> int:\n        # Prefix XOR hash map\n        pass`,
    },
    {
      id: 'sub-9788',
      problemTitle: 'Course Schedule IV (Prerequisites Graph)',
      problemSlug: 'course-schedule-iv',
      problemCode: 'PROB-1462',
      difficulty: 'Medium',
      language: 'Java 21',
      verdict: 'Time Limit Exceeded',
      runtimeMs: 2040,
      memoryKb: 48000,
      submittedAt: '3 days ago',
      codeSnippet: `// Naive BFS per query leading to TLE; optimized via reachability matrix next run.`,
    },
  ]);

  // Contests History
  const [contests] = useState<StudentContestHistory[]>([
    {
      id: 'cnt-142',
      contestName: 'Weekly Competitive Grand Prix #142',
      contestDate: 'Mar 01, 2026',
      rank: 3,
      totalParticipants: 4820,
      score: 750,
      penaltyTime: '01:14:22',
      ratingDelta: +48,
      newRating: 2380,
    },
    {
      id: 'cnt-88',
      contestName: 'Global Biweekly Clash #88',
      contestDate: 'Feb 15, 2026',
      rank: 8,
      totalParticipants: 5120,
      score: 600,
      penaltyTime: '01:28:10',
      ratingDelta: +32,
      newRating: 2332,
    },
    {
      id: 'cnt-cup',
      contestName: 'Collegiate Invitational Cup 2026',
      contestDate: 'Feb 02, 2026',
      rank: 12,
      totalParticipants: 2400,
      score: 550,
      penaltyTime: '02:05:40',
      ratingDelta: +25,
      newRating: 2300,
    },
  ]);

  // Courses Progress
  const [courses] = useState<StudentCourseProgress[]>([
    {
      id: 'crs-1',
      title: 'Data Structures & Algorithms Mastery',
      slug: 'data-structures-and-algorithms-mastery',
      instructor: 'Prof. Thomas Cormen',
      modulesCompleted: 12,
      totalModules: 12,
      progressPct: 100,
      status: 'Completed',
    },
    {
      id: 'crs-2',
      title: 'Advanced Graph Algorithms & Network Flow',
      slug: 'advanced-graph-algorithms',
      instructor: 'Dr. Robert Sedgewick',
      modulesCompleted: 14,
      totalModules: 16,
      progressPct: 88,
      status: 'In Progress',
    },
    {
      id: 'crs-3',
      title: 'Distributed Systems & Consensus Protocols',
      slug: 'distributed-systems',
      instructor: 'Prof. Leslie Lamport',
      modulesCompleted: 6,
      totalModules: 10,
      progressPct: 60,
      status: 'In Progress',
    },
  ]);

  // Topic Skills
  const topics: StudentTopicSkill[] = [
    { name: 'Dynamic Programming & Memoization', solved: 142, total: 160, pct: 89 },
    { name: 'Graph Theory & Shortest Path', solved: 118, total: 130, pct: 91 },
    { name: 'Trees & Binary Search Trees', solved: 95, total: 110, pct: 86 },
    { name: 'Arrays & Two Pointers', solved: 88, total: 95, pct: 93 },
    { name: 'String Algorithms (KMP, Tries)', solved: 64, total: 80, pct: 80 },
    { name: 'Math & Number Theory', solved: 58, total: 75, pct: 77 },
  ];

  const handleTabChange = (_: React.SyntheticEvent, newTab: TabType) => {
    if (newTab !== currentTab) {
      setIsTabLoading(true);
      setCurrentTab(newTab);
      setTimeout(() => setIsTabLoading(false), 160);
    }
  };

  const handleSaveProfile = async (updated: Partial<StudentProfileData>) => {
    try {
      if (profile.id) {
        await apiService.updateUser(profile.id, {
          name: updated.name,
        }).catch(() => null);
      }

      setProfile((prev) => ({
        ...prev,
        ...updated,
      }));

      toast.success('Your student profile changes have been saved.', 'Profile Updated');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update profile', 'Update Failed');
    }
  };

  const handleShareProfile = () => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/students/${profile.handle}`;
      navigator.clipboard.writeText(url);
      toast.success(`Profile URL copied: ${url}`, 'Link Copied');
    }
  };

  const handleViewCode = (sub: StudentSubmission) => {
    setSelectedSubmission(sub);
    setCodeModalOpen(true);
  };

  return (
    <StudentAppLayout
      streakDays={profile.currentStreakDays}
      contestRating={profile.contestRating}
      ratingTier={profile.ratingTier}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
    >
      {isPageLoading ? (
        <MuiPageLoader minHeight="75vh" />
      ) : (
        <Box sx={{ width: '100%' }}>
          {/* Main Tab Content View */}
          {isTabLoading ? (
            <MuiCenterLoader minHeight="380px" />
          ) : (
            <>
              {(!currentTab || currentTab === 'overview') && (
                <StudentOverviewTab
                  profile={profile}
                  isOwner={isOwner}
                  onEditProfile={() => setEditModalOpen(true)}
                  onUploadResume={() => setResumeModalOpen(true)}
                  onViewCert={(cert) => {
                    setSelectedCert(cert);
                    setCertModalOpen(true);
                  }}
                  onRemoveResume={() => {
                    setProfile((prev) => ({ ...prev, resumeFileName: undefined, resumeUrl: undefined }));
                    toast.info('Resume removed from profile.', 'Resume Removed');
                  }}
                />
              )}
              {currentTab === 'practice' && <StudentPracticeTab />}
              {currentTab === 'submissions' && (
                <StudentSubmissionsTab
                  submissions={submissions}
                  studentHandle={profile.handle}
                  onViewCode={handleViewCode}
                />
              )}
              {currentTab === 'contests' && <StudentContestsTab contests={contests} />}
              {currentTab === 'courses' && <StudentCoursesTab courses={courses} />}
              {currentTab === 'settings' && isOwner && <StudentSettingsTab />}
            </>
          )}

          {/* Modals */}
          <EditStudentProfileModal
            open={editModalOpen}
            profile={profile}
            onClose={() => setEditModalOpen(false)}
            onSave={handleSaveProfile}
          />

          <ViewSubmissionCodeModal
            open={codeModalOpen}
            submission={selectedSubmission}
            onClose={() => setCodeModalOpen(false)}
          />

          <ViewCertificateModal
            open={certModalOpen}
            cert={selectedCert}
            studentName={profile.name || 'Student'}
            onClose={() => setCertModalOpen(false)}
          />

          <UploadResumeModal
            open={resumeModalOpen}
            currentResumeName={profile.resumeFileName}
            onClose={() => setResumeModalOpen(false)}
            onUpload={(fileName) => {
              setProfile((prev) => ({ ...prev, resumeFileName: fileName }));
            }}
          />
        </Box>
      )}
    </StudentAppLayout>
  );
}

