'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Box } from '@mui/material';
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

export type StudentTabType = 'overview' | 'practice' | 'submissions' | 'contests' | 'courses' | 'settings';

interface StudentProfileClientProps {
  initialProfile?: Partial<StudentProfileData>;
  isOwner?: boolean;
  defaultTab?: StudentTabType;
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

const validTabs: StudentTabType[] = ['overview', 'practice', 'submissions', 'contests', 'courses', 'settings'];

export default function StudentProfileClient({
  initialProfile,
  isOwner = true,
  defaultTab = 'overview',
}: StudentProfileClientProps) {
  const toast = useToast();
  const searchParams = useSearchParams();
  const currentUser = useAppSelector((state) => state.auth.user);

  const initialTabParam = searchParams.get('tab') as StudentTabType | null;
  const [currentTab, setCurrentTab] = useState<StudentTabType>(
    initialTabParam && validTabs.includes(initialTabParam)
      ? initialTabParam
      : defaultTab
  );

  useEffect(() => {
    const tab = searchParams.get('tab') as StudentTabType | null;
    if (tab && validTabs.includes(tab)) {
      setCurrentTab(tab);
    } else if (!tab && defaultTab) {
      setCurrentTab(defaultTab);
    }
  }, [searchParams, defaultTab]);

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

  // Submissions state
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([
    {
      id: 'sub-9912',
      problemTitle: 'Two Sum & Pair Target Lookups',
      problemSlug: 'two-sum',
      problemCode: 'PROB-001',
      difficulty: 'Easy',
      language: 'CPP',
      verdict: 'Accepted',
      runtimeMs: 4,
      memoryKb: 10400,
      submittedAt: 'Today, 10:24 AM',
      codeSnippet: `#include <vector>\n#include <unordered_map>\nusing namespace std;\n\nvector<int> twoSum(vector<int>& nums, int target) {\n    unordered_map<int, int> mp;\n    for (int i = 0; i < nums.size(); ++i) {\n        int comp = target - nums[i];\n        if (mp.count(comp)) return {mp[comp], i};\n        mp[nums[i]] = i;\n    }\n    return {};\n}`,
    },
  ]);

  // Contests History
  const [contests, setContests] = useState<StudentContestHistory[]>([
    {
      id: 'cnt-1',
      contestName: 'CodePlatform Global Round #42 (Div. 1 + 2)',
      contestDate: 'Aug 24, 2025',
      rank: 14,
      totalParticipants: 4820,
      score: 1850,
      penaltyTime: '01:14:22',
      ratingDelta: +48,
      newRating: 2380,
    },
  ]);

  // Courses Progress
  const [courses, setCourses] = useState<StudentCourseProgress[]>([
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
  ]);

  // Topic Skills
  const [topics, setTopics] = useState<StudentTopicSkill[]>([
    { name: 'Dynamic Programming & Memoization', solved: 142, total: 160, pct: 89 },
    { name: 'Graph Theory & Shortest Path', solved: 118, total: 130, pct: 91 },
    { name: 'Trees & Binary Search Trees', solved: 95, total: 110, pct: 86 },
    { name: 'Arrays & Two Pointers', solved: 88, total: 95, pct: 93 },
    { name: 'String Algorithms (KMP, Tries)', solved: 64, total: 80, pct: 80 },
    { name: 'Math & Number Theory', solved: 58, total: 75, pct: 77 },
  ]);

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
    }
  }, [currentUser, isOwner]);

  // 2. Query live comprehensive profile statistics from backend
  useEffect(() => {
    async function fetchLiveProfile() {
      try {
        const handleOrId = initialProfile?.handle || initialProfile?.id || (currentUser?.email ? currentUser.email.split('@')[0] : 'me');
        const liveData = await apiService.getStudentProfile(handleOrId);
        if (liveData && liveData.name) {
          setProfile((prev) => ({
            ...prev,
            ...liveData,
            role: liveData.role || prev.role,
          }));
          if (liveData.submissions && liveData.submissions.length > 0) {
            setSubmissions(liveData.submissions);
          }
          if (liveData.contests && liveData.contests.length > 0) {
            setContests(liveData.contests);
          }
          if (liveData.courses && liveData.courses.length > 0) {
            setCourses(liveData.courses);
          }
          if (liveData.topics && liveData.topics.length > 0) {
            setTopics(liveData.topics);
          }
        }
      } catch (err) {
        console.warn('Student profile live query failed:', err);
      } finally {
        setIsPageLoading(false);
      }
    }
    fetchLiveProfile();
  }, [isOwner, currentUser, initialProfile]);

  // Modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [codeModalOpen, setCodeModalOpen] = useState(false);
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const [selectedCert, setSelectedCert] = useState<StudentCertification | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<StudentSubmission | null>(null);

  const handleTabChange = (newTab: StudentTabType) => {
    if (newTab !== currentTab) {
      setIsTabLoading(true);
      setCurrentTab(newTab);

      // Keep browser URL and history state in sync
      if (typeof window !== 'undefined') {
        const newUrl = newTab === 'overview' ? '/students' : `/students?tab=${newTab}`;
        window.history.pushState(null, '', newUrl);
      }

      setTimeout(() => setIsTabLoading(false), 120);
    }
  };

  const handleSaveProfile = async (updated: Partial<StudentProfileData>) => {
    try {
      if (profile.id) {
        await apiService.updateUser(profile.id, {
          name: updated.name,
          phone: updated.phone,
          bio: updated.bio,
        });
      }
      setProfile((prev) => ({ ...prev, ...updated }));
      toast.success('Your profile changes were saved successfully.', 'Profile Updated');
      setEditModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile.', 'Error');
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
