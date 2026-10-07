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

import dynamic from 'next/dynamic';
import StudentAppLayout from '@/components/students/layout/StudentAppLayout';
import StudentOverviewTab from '@/components/students/profile/StudentOverviewTab';
import StudentGoalsTab from '@/components/students/profile/StudentGoalsTab';
import StudentSubmissionsTab from '@/components/students/profile/StudentSubmissionsTab';
import StudentContestsTab from '@/components/students/profile/StudentContestsTab';
import StudentCoursesTab from '@/components/students/profile/StudentCoursesTab';
import StudentSettingsTab from '@/components/students/profile/StudentSettingsTab';
import { Tabs, Tab, Dialog, DialogContent } from '@mui/material';

// Dynamic import for on-demand modals only
const EditStudentProfileModal = dynamic(() => import('@/components/students/profile/EditStudentProfileModal'), { ssr: false });
const ViewSubmissionCodeModal = dynamic(() => import('@/components/students/profile/ViewSubmissionCodeModal'), { ssr: false });
const ViewCertificateModal = dynamic(() => import('@/components/students/profile/ViewCertificateModal'), { ssr: false });
const UploadResumeModal = dynamic(() => import('@/components/students/profile/UploadResumeModal'), { ssr: false });
const IdentityDiagnosticWizard = dynamic(() => import('@/components/students/diagnostic/IdentityDiagnosticWizard'), { ssr: false });

// Icons for Tab Switcher
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import TrackChangesRoundedIcon from '@mui/icons-material/TrackChangesRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';

export type StudentTabType = 'overview' | 'goals' | 'submissions' | 'contests' | 'courses' | 'settings';

interface StudentProfileClientProps {
  initialProfile?: Partial<StudentProfileData>;
  isOwner?: boolean;
  defaultTab?: StudentTabType;
}

const SAMPLE_ENROLLED_COURSES: StudentCourseProgress[] = [
  {
    id: 'crs-python-fundamentals',
    title: 'Python 3 Programming: From Fundamentals to Algorithmic Problem Solving',
    slug: 'crs-python-fundamentals',
    instructor: 'Prof. Alan Turing',
    modulesCompleted: 1,
    totalModules: 4,
    progressPct: 25,
    status: 'In Progress',
  },
  {
    id: 'crs-fullstack-architecture',
    title: 'Full-Stack Web Architecture & Cloud Microservices',
    slug: 'crs-fullstack-architecture',
    instructor: 'Prof. Alan Turing',
    modulesCompleted: 2,
    totalModules: 3,
    progressPct: 50,
    status: 'In Progress',
  },
  {
    id: 'crs-dsa-advanced',
    title: 'Advanced Data Structures & Algorithmic Problem Solving',
    slug: 'crs-dsa-advanced',
    instructor: 'Prof. Thomas Cormen',
    modulesCompleted: 1,
    totalModules: 1,
    progressPct: 100,
    status: 'Completed',
  },
  {
    id: 'crs-cloud-devops',
    title: 'Cloud DevOps, Docker Sandboxing & CI/CD Pipelines',
    slug: 'crs-cloud-devops',
    instructor: 'Prof. Alan Turing',
    modulesCompleted: 0,
    totalModules: 1,
    progressPct: 0,
    status: 'In Progress',
  },
];

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

const validTabs: StudentTabType[] = ['overview', 'goals', 'submissions', 'contests', 'courses', 'settings'];

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
  const [courses, setCourses] = useState<StudentCourseProgress[]>(
    initialProfile?.courses?.length ? initialProfile.courses : []
  );

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
        let calculatedActivityData: Array<{ date: string; count: number }> | undefined = undefined;
        if (Array.isArray(liveData.submissions)) {
          setSubmissions(liveData.submissions);
          const dateMap = new Map<string, number>();
          liveData.submissions.forEach((sub: any) => {
            const rawDate = sub.createdAt || sub.submittedAt;
            if (rawDate) {
              const d = new Date(rawDate);
              if (!isNaN(d.getTime())) {
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                const key = `${year}-${month}-${day}`;
                dateMap.set(key, (dateMap.get(key) || 0) + 1);
              }
            }
          });
          calculatedActivityData = Array.from(dateMap.entries()).map(([date, count]) => ({ date, count }));
        }

        const normalizedContestsHistory = Array.isArray(liveData.contests)
          ? liveData.contests.map((c: any) => ({
              contestId: c.contestId || c.id || '',
              contestName: c.contestName || c.contest?.title || c.title || 'Rated Contest',
              date: c.date || c.contestDate || c.createdAt || '',
              delta: c.delta ?? c.ratingDelta ?? 0,
              rating: c.rating ?? c.newRating ?? c.userRating ?? 1500,
              rank: c.rank ?? c.userRank ?? 0,
            }))
          : undefined;

        setProfile((prev) => ({
          ...prev,
          ...liveData,
          role: liveData.role || prev.role,
          activityData: liveData.activityData ?? calculatedActivityData ?? prev.activityData,
          ratingHistory: Array.isArray(liveData.ratingHistory)
            ? liveData.ratingHistory
            : (normalizedContestsHistory ?? prev.ratingHistory),
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
  const [diagnosticModalOpen, setDiagnosticModalOpen] = useState(false);
  const [selectedCert, setSelectedCert] = useState<StudentCertification | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<StudentSubmission | null>(null);

  const handleTabChange = (newTab: StudentTabType) => {
    if (newTab !== currentTab) {
      setCurrentTab(newTab);

      // Keep browser URL in sync instantly
      if (typeof window !== 'undefined') {
        const pathname = window.location.pathname;
        const newUrl = newTab === 'overview' ? pathname : `${pathname}?tab=${newTab}`;
        window.history.replaceState(null, '', newUrl);
      }
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
          department: (updated as any).department,
          location: updated.location,
          avatarUrl: updated.avatarUrl,
          githubUrl: updated.githubUrl,
          linkedinUrl: updated.linkedinUrl,
          websiteUrl: updated.websiteUrl,
          rollNo: (updated as any).rollNo,
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
          {/* Top Profile Tab Navigation Bar (MUI Tabs) */}
          <Box
            sx={{
              borderBottom: '1px solid #E2E8F0',
              mb: 3.5,
            }}
          >
            <Tabs
              value={currentTab || 'overview'}
              onChange={(_, val) => handleTabChange(val as StudentTabType)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                minHeight: 48,
                '& .MuiTabs-indicator': {
                  bgcolor: '#2563EB',
                  height: 3,
                  borderRadius: '3px 3px 0 0',
                },
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  color: '#64748B',
                  minHeight: 48,
                  px: { xs: 2, sm: 2.5 },
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    color: '#0F172A',
                  },
                  '&.Mui-selected': {
                    color: '#2563EB',
                    fontWeight: 700,
                  },
                },
              }}
            >
              <Tab
                value="overview"
                label="Overview"
                icon={<GridViewRoundedIcon sx={{ fontSize: 18 }} />}
                iconPosition="start"
              />
              <Tab
                value="goals"
                label="Target & Goals"
                icon={<TrackChangesRoundedIcon sx={{ fontSize: 18 }} />}
                iconPosition="start"
              />
              <Tab
                value="submissions"
                label="Submissions History"
                icon={<HistoryRoundedIcon sx={{ fontSize: 18 }} />}
                iconPosition="start"
              />
              <Tab
                value="contests"
                label="Contests History"
                icon={<EmojiEventsRoundedIcon sx={{ fontSize: 18 }} />}
                iconPosition="start"
              />
              <Tab
                value="courses"
                label="Enrolled Courses"
                icon={<SchoolRoundedIcon sx={{ fontSize: 18 }} />}
                iconPosition="start"
              />
              {isOwner && (
                <Tab
                  value="settings"
                  label="Settings"
                  icon={<SettingsRoundedIcon sx={{ fontSize: 18 }} />}
                  iconPosition="start"
                />
              )}
            </Tabs>
          </Box>

          {/* Main Tab Content View - Preserved in DOM for instant 0ms switching */}
          <Box sx={{ display: (!currentTab || currentTab === 'overview') ? 'block' : 'none' }}>
            <StudentOverviewTab
              profile={profile}
              isOwner={isOwner}
              onEditProfile={() => setEditModalOpen(true)}
              onUploadResume={() => setResumeModalOpen(true)}
              onOpenDiagnostic={() => setDiagnosticModalOpen(true)}
              onViewCert={(cert) => {
                setSelectedCert(cert);
                setCertModalOpen(true);
              }}
              onRemoveResume={() => {
                setProfile((prev) => ({ ...prev, resumeFileName: undefined, resumeUrl: undefined }));
                toast.info('Resume removed from profile.', 'Resume Removed');
              }}
            />
          </Box>

          <Box sx={{ display: currentTab === 'goals' ? 'block' : 'none' }}>
            <StudentGoalsTab
              profile={profile}
              isOwner={isOwner}
              onOpenDiagnostic={() => setDiagnosticModalOpen(true)}
            />
          </Box>

          <Box sx={{ display: currentTab === 'submissions' ? 'block' : 'none' }}>
            <StudentSubmissionsTab
              submissions={submissions}
              studentHandle={profile.handle}
              onViewCode={handleViewCode}
            />
          </Box>

          <Box sx={{ display: currentTab === 'contests' ? 'block' : 'none' }}>
            <StudentContestsTab contests={contests} />
          </Box>

          <Box sx={{ display: currentTab === 'courses' ? 'block' : 'none' }}>
            <StudentCoursesTab courses={courses} />
          </Box>

          {isOwner && (
            <Box sx={{ display: currentTab === 'settings' ? 'block' : 'none' }}>
              <StudentSettingsTab />
            </Box>
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

          {/* First-Time Onboarding & Re-calibrating Diagnostic Modal */}
          <Dialog
            open={diagnosticModalOpen}
            onClose={() => setDiagnosticModalOpen(false)}
            maxWidth="lg"
            fullWidth
            slotProps={{
              paper: {
                sx: {
                  bgcolor: 'transparent',
                  boxShadow: 'none',
                  backgroundImage: 'none',
                  m: { xs: 1.5, sm: 2 },
                },
              },
            }}
          >
            <DialogContent sx={{ p: 0 }}>
              <IdentityDiagnosticWizard
                isModal={true}
                userId={profile.id}
                onClose={() => setDiagnosticModalOpen(false)}
                onComplete={() => {
                  setDiagnosticModalOpen(false);
                  fetchLiveProfile();
                }}
              />
            </DialogContent>
          </Dialog>
        </Box>
      )}
    </StudentAppLayout>
  );
}
