'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setUser, checkCurrentUser } from '@/store/slices/authSlice';
import { useToast } from '@/context/ToastContext';
import { MuiCenterLoader, MuiPageLoader } from '@/components/shared/MuiLoadingFallback';
import { apiService } from '@/lib/api-service';
import { usePolling } from '@/utils/usePolling';

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
            handle: u.rollNo || u.handle || (u.email ? u.email.split('@')[0] : 'coder'),
            email: u.email,
            role: u.globalRole ?? 'STUDENT',
            bio: u.bio ?? '',
            institution: u.institution ?? u.memberships?.[0]?.college?.name ?? '',
            phone: u.phone ?? '',
            location: u.location ?? '',
            githubUrl: u.githubUrl ?? '',
            linkedinUrl: u.linkedinUrl ?? '',
            websiteUrl: u.websiteUrl ?? '',
            contestRating: u.contestRating ?? 1500,
            ratingTier: u.ratingTier ?? 'Novice',
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
  const router = useRouter();
  const toast = useToast();
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const currentUser = useAppSelector((state) => state.auth.user);

  // Role-based profile protection: redirect faculty or admin accounts to their dedicated profile workspaces
  useEffect(() => {
    if (isOwner) {
      const activeRole = (currentUser?.globalRole || getInitialOwnerProfile().role || '').toUpperCase();
      if (activeRole === 'FACULTY' || activeRole === 'COLLEGE_ADMIN') {
        router.replace('/faculty/profile');
      } else if (activeRole === 'SUPER_ADMIN' || activeRole === 'PLATFORM_ADMIN') {
        router.replace('/superadmin/profile');
      }
    }
  }, [currentUser, isOwner, router]);

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
    id: initialProfile?.id ?? currentUser?.id ?? initialOwner.id ?? 'stu-default',
    name: initialProfile?.name ?? currentUser?.name ?? initialOwner.name ?? '',
    handle: initialProfile?.handle ?? currentUser?.rollNo ?? currentUser?.handle ?? (currentUser?.email ? currentUser.email.split('@')[0] : initialOwner.handle ?? 'student_coder'),
    email: initialProfile?.email ?? currentUser?.email ?? initialOwner.email ?? '',
    role: initialProfile?.role ?? currentUser?.globalRole ?? initialOwner.role ?? 'STUDENT',
    avatarUrl: initialProfile?.avatarUrl ?? (currentUser as any)?.avatarUrl,
    bannerGradient: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 50%, #3B82F6 100%)',
    bio: initialProfile?.bio ?? (currentUser as any)?.bio ?? initialOwner.bio ?? '',
    institution: initialProfile?.institution ?? (currentUser as any)?.institution ?? (currentUser as any)?.memberships?.[0]?.college?.name ?? initialOwner.institution ?? '',
    location: initialProfile?.location ?? (currentUser as any)?.location ?? initialOwner.location ?? '',
    phone: initialProfile?.phone ?? (currentUser as any)?.phone ?? initialOwner.phone ?? '',
    joinedDate: initialProfile?.joinedDate ?? 'January 2026',
    githubUrl: initialProfile?.githubUrl ?? (currentUser as any)?.githubUrl ?? initialOwner.githubUrl ?? '',
    linkedinUrl: initialProfile?.linkedinUrl ?? (currentUser as any)?.linkedinUrl ?? initialOwner.linkedinUrl ?? '',
    websiteUrl: initialProfile?.websiteUrl ?? (currentUser as any)?.websiteUrl ?? initialOwner.websiteUrl ?? '',
    contestRating: initialProfile?.contestRating ?? (currentUser as any)?.contestRating ?? initialOwner.contestRating ?? 1500,
    ratingTier: initialProfile?.ratingTier ?? (currentUser as any)?.ratingTier ?? initialOwner.ratingTier ?? 'Novice',
    globalRank: initialProfile?.globalRank ?? 1,
    solvedTotal: initialProfile?.solvedTotal ?? 0,
    solvedEasy: initialProfile?.solvedEasy ?? 0,
    solvedMedium: initialProfile?.solvedMedium ?? 0,
    solvedHard: initialProfile?.solvedHard ?? 0,
    totalSubmissions: initialProfile?.totalSubmissions ?? 0,
    accuracyRate: initialProfile?.accuracyRate ?? '100%',
    currentStreakDays: initialProfile?.currentStreakDays ?? 1,
    maxStreakDays: initialProfile?.maxStreakDays ?? 1,
    topicSkills: initialProfile?.topicSkills,
    cohortResult: initialProfile?.cohortResult,
  });

  // Submissions state
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);

  // Contests History
  const [contests, setContests] = useState<StudentContestHistory[]>([]);

  // Courses Progress
  const [courses, setCourses] = useState<StudentCourseProgress[]>([]);

  // Topic Skills
  const [topics, setTopics] = useState<StudentTopicSkill[]>([]);

  // 1. Sync when Redux currentUser state arrives or updates
  useEffect(() => {
    if (isOwner) {
      if (currentUser?.name) {
        setProfile((prev) => ({
          ...prev,
          id: currentUser.id || prev.id,
          name: currentUser.name,
          handle: currentUser.rollNo || currentUser.handle || (currentUser.email ? currentUser.email.split('@')[0] : prev.handle),
          email: currentUser.email || prev.email,
          role: currentUser.globalRole || prev.role,
          bio: (currentUser as any).bio !== undefined && (currentUser as any).bio !== null ? (currentUser as any).bio : prev.bio,
          institution: (currentUser as any).institution || (currentUser as any).memberships?.[0]?.college?.name || prev.institution,
          location: (currentUser as any).location !== undefined && (currentUser as any).location !== null ? (currentUser as any).location : prev.location,
          phone: (currentUser as any).phone !== undefined && (currentUser as any).phone !== null ? (currentUser as any).phone : prev.phone,
          githubUrl: (currentUser as any).githubUrl !== undefined && (currentUser as any).githubUrl !== null ? (currentUser as any).githubUrl : prev.githubUrl,
          linkedinUrl: (currentUser as any).linkedinUrl !== undefined && (currentUser as any).linkedinUrl !== null ? (currentUser as any).linkedinUrl : prev.linkedinUrl,
          websiteUrl: (currentUser as any).websiteUrl !== undefined && (currentUser as any).websiteUrl !== null ? (currentUser as any).websiteUrl : prev.websiteUrl,
          contestRating: (currentUser as any).contestRating !== undefined ? (currentUser as any).contestRating : prev.contestRating,
          ratingTier: (currentUser as any).ratingTier || prev.ratingTier,
          avatarUrl: (currentUser as any).avatarUrl || prev.avatarUrl,
        }));
      } else if (typeof window !== 'undefined') {
        // Instant fallback hydration from localStorage while Redux boots
        try {
          const raw = localStorage.getItem('codeplatform_user');
          if (raw) {
            const u = JSON.parse(raw);
            if (u?.name) {
              setProfile((prev) => ({
                ...prev,
                id: u.id || prev.id,
                name: u.name,
                handle: u.rollNo || u.handle || (u.email ? u.email.split('@')[0] : prev.handle),
                email: u.email || prev.email,
                role: u.globalRole || prev.role,
                bio: u.bio !== undefined && u.bio !== null ? u.bio : prev.bio,
                institution: u.institution || u.memberships?.[0]?.college?.name || prev.institution,
                location: u.location !== undefined && u.location !== null ? u.location : prev.location,
                phone: u.phone !== undefined && u.phone !== null ? u.phone : prev.phone,
                githubUrl: u.githubUrl !== undefined && u.githubUrl !== null ? u.githubUrl : prev.githubUrl,
                linkedinUrl: u.linkedinUrl !== undefined && u.linkedinUrl !== null ? u.linkedinUrl : prev.linkedinUrl,
                websiteUrl: u.websiteUrl !== undefined && u.websiteUrl !== null ? u.websiteUrl : prev.websiteUrl,
                contestRating: u.contestRating !== undefined ? u.contestRating : prev.contestRating,
                ratingTier: u.ratingTier || prev.ratingTier,
                avatarUrl: u.avatarUrl || prev.avatarUrl,
              }));
            }
          }
        } catch {}
        dispatch(checkCurrentUser());
      }
    }
  }, [currentUser, isOwner, dispatch]);

  // 2. Auto-polling: Query live comprehensive profile statistics from backend with tab visibility awareness
  const fetchLiveProfile = useCallback(async () => {
    try {
      const handleOrId = initialProfile?.handle || initialProfile?.id || (currentUser?.email ? currentUser.email.split('@')[0] : 'me');
      const liveData = await apiService.getStudentProfile(handleOrId);
      if (liveData && liveData.name) {
        setProfile((prev) => ({
          ...prev,
          ...liveData,
          role: liveData.role || prev.role,
          topicSkills: Array.isArray(liveData.topics)
            ? liveData.topics.map((t: any) => {
                const solved = t.solved ?? t.solvedCount ?? 0;
                const total = t.total ?? t.totalCount ?? 0;
                const pct = t.pct ?? t.percentage ?? (total > 0 ? Math.round((solved / total) * 100) : 0);
                return {
                  name: t.name || t.topicName || t.title || '',
                  solved,
                  total,
                  pct,
                };
              })
            : (Array.isArray(liveData.topicSkills) ? liveData.topicSkills : prev.topicSkills),
          cohortResult: liveData.cohortResult || prev.cohortResult,
        }));
        if (Array.isArray(liveData.submissions)) {
          setSubmissions(liveData.submissions);
        }
        if (Array.isArray(liveData.contests)) {
          setContests(liveData.contests);
        }
        if (Array.isArray(liveData.courses)) {
          setCourses(liveData.courses);
        }
        if (Array.isArray(liveData.topics)) {
          setTopics(liveData.topics);
        }
      }
      return liveData;
    } catch (err) {
      console.warn('Student profile live query failed:', err);
      return null;
    } finally {
      setIsPageLoading(false);
    }
  }, [initialProfile, currentUser]);

  const { refetch: refetchProfile, isRefreshing: isRefreshingProfile } = usePolling(
    fetchLiveProfile,
    { intervalMs: 20000, pauseOnHidden: true, revalidateOnFocus: true }
  );

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
      let serverUpdated: any = null;
      if (profile.id) {
        serverUpdated = await apiService.updateUser(profile.id, {
          name: updated.name,
          phone: updated.phone,
          bio: updated.bio,
          institution: updated.institution,
          location: updated.location,
          githubUrl: updated.githubUrl,
          linkedinUrl: updated.linkedinUrl,
          websiteUrl: updated.websiteUrl,
        });
      }
      setProfile((prev) => ({ ...prev, ...updated }));
      if (currentUser) {
        dispatch(setUser({
          ...currentUser,
          ...updated,
          ...(serverUpdated || {}),
        } as any));
      }
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
