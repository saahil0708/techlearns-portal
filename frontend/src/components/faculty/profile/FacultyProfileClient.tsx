'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Box, Tabs, Tab, Card } from '@mui/material';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';

import FacultySidebar from '@/components/faculty/layout/FacultySidebar';
import FacultyNavbar from '@/components/faculty/layout/FacultyNavbar';
import FacultyMetricsRow from '@/components/faculty/profile/FacultyMetricsRow';
import FacultyAnalyticsSection from '@/components/faculty/profile/FacultyAnalyticsSection';
import FacultyBatchesTab from '@/components/faculty/profile/FacultyBatchesTab';
import FacultyStudentsTab from '@/components/faculty/profile/FacultyStudentsTab';
import FacultyCoursesTab from '@/components/faculty/profile/FacultyCoursesTab';
import FacultyProblemBankTab from '@/components/faculty/profile/FacultyProblemBankTab';
import FacultySecurityTab from '@/components/faculty/profile/FacultySecurityTab';
import EditFacultyBioModal from '@/components/faculty/profile/EditFacultyBioModal';

import { useToast } from '@/context/ToastContext';
import { apiService } from '@/lib/api-service';
import { useAppSelector } from '@/store/hooks';
import { generateBatchCode } from '@/utils/batch-code';
import type { FacultyProfileEntity, FacultyBatchItem, FacultyCourseItem } from '@/data';

export type { FacultyProfileEntity };

interface FacultyProfileClientProps {
  initialProfile?: FacultyProfileEntity;
  initialBatches?: FacultyBatchItem[];
  initialCourses?: FacultyCourseItem[];
}

export default function FacultyProfileClient({
  initialProfile,
  initialBatches = [],
  initialCourses = [],
}: FacultyProfileClientProps) {
  const toast = useToast();
  const searchParams = useSearchParams();
  const { user } = useAppSelector((state) => state.auth);
  const facultyMembership = user?.memberships?.find(
    (m) => m.role === 'FACULTY' || m.role === 'COLLEGE_ADMIN'
  );
  const [activeCollegeId, setActiveCollegeId] = useState<string | undefined>(
    facultyMembership?.collegeId || facultyMembership?.college?.id || user?.memberships?.[0]?.collegeId
  );

  const defaultProfile: FacultyProfileEntity = {
    id: user?.id || 'faculty-current',
    name: user?.name || 'Faculty Mentor',
    email: user?.email || '',
    department: (user as any)?.department || 'Computer Science & Engineering',
    specialization: (user as any)?.specialization || 'Data Structures, Algorithms, Competitive Programming',
    officeHours: (user as any)?.officeHours || 'Mon, Wed, Fri (14:00 - 16:00)',
    location: (user as any)?.location || 'Room 304, CS Dept Block',
    phone: (user as any)?.phone || '',
    bio: (user as any)?.bio || '',
    githubUrl: (user as any)?.githubUrl || '',
    linkedinUrl: (user as any)?.linkedinUrl || '',
    websiteUrl: (user as any)?.websiteUrl || '',
    roleTitle: user?.globalRole === 'COLLEGE_ADMIN' ? 'Department Head & Campus Lead' : 'Senior Faculty Mentor',
    collegeName: facultyMembership?.college?.name || 'Academic Institution',
    collegeCode: facultyMembership?.college?.code || 'CSE',
    collegeDomain: facultyMembership?.college?.email?.split('@')[1] || 'campus.edu',
    twoFactorEnabled: Boolean(user?.twoFactorEnabled),
  };

  const [profile, setProfile] = useState<FacultyProfileEntity>(initialProfile || defaultProfile);
  const [batches, setBatches] = useState<FacultyBatchItem[]>(initialBatches);
  const [courses, setCourses] = useState<FacultyCourseItem[]>(initialCourses);
  const [problems, setProblems] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Sync activeTab with URL search params
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'batches') setActiveTab(1);
    else if (tabParam === 'students') setActiveTab(2);
    else if (tabParam === 'courses') setActiveTab(3);
    else if (tabParam === 'problems') setActiveTab(4);
    else if (tabParam === 'security') setActiveTab(5);
    else if (tabParam === 'bio' || tabParam === 'overview') setActiveTab(0);
    else setActiveTab(0);
  }, [searchParams]);

  const loadBatches = useCallback(async (collegeId: string) => {
    try {
      const liveBatches = await apiService.getBatchesByCollege(collegeId);
      if (Array.isArray(liveBatches)) {
        setBatches(
          liveBatches.map((b: any) => ({
            id: b.id,
            name: b.name,
            code: b.code || generateBatchCode(b.name, b.id),
            studentsCount: b._count?.students || 0,
            maxCapacity: b.maxCapacity || 100,
            year: b.startDate ? new Date(b.startDate).getFullYear().toString() : '2026–2027',
            avgAccuracy: b.avgAccuracy || 'N/A',
            coursesAssigned: b._count?.courses || 0,
            status: b.status === 'ACTIVE' || !b.status ? 'Active' : b.status,
          }))
        );
      }
    } catch {
      // Fallback
    }
  }, []);

  const loadCourses = useCallback(async () => {
    try {
      const res = await apiService.getCourses({ limit: 50 });
      if (res?.items && Array.isArray(res.items)) {
        setCourses(
          res.items.map((c: any, idx: number) => ({
            id: c.id,
            title: c.title,
            code: `CRS-${String(idx + 1).padStart(3, '0')}`,
            level: 'Intermediate',
            modulesCount: c.modules?.length || c._count?.modules || 0,
            enrolledStudents: c._count?.enrollments || 0,
            status: c.status === 'PUBLISHED' ? 'Published' : c.status === 'DRAFT' ? 'Draft' : c.status || 'Published',
          }))
        );
      }
    } catch {
      // Fallback
    }
  }, []);

  const loadProblems = useCallback(async () => {
    try {
      const res = await apiService.getProblems({ limit: 50 });
      if (res?.items && Array.isArray(res.items)) {
        setProblems(res.items);
      }
    } catch {
      // Fallback
    }
  }, []);

  // Hydrate with live profile and backend endpoints
  useEffect(() => {
    async function loadLiveProfile() {
      try {
        const res = await apiService.getProfile();
        const liveUser = res?.data || res;
        if (liveUser && liveUser.id) {
          const authMembership = liveUser.memberships?.find(
            (m: any) => m.role === 'FACULTY' || m.role === 'COLLEGE_ADMIN'
          );
          const cId = authMembership?.collegeId || authMembership?.college?.id || liveUser.memberships?.[0]?.collegeId;

          setProfile((prev) => ({
            ...prev,
            id: liveUser.id,
            name: liveUser.name || prev.name,
            email: liveUser.email || prev.email,
            department: liveUser.department !== undefined && liveUser.department !== null ? liveUser.department : prev.department,
            specialization: liveUser.specialization !== undefined && liveUser.specialization !== null ? liveUser.specialization : prev.specialization,
            officeHours: liveUser.officeHours !== undefined && liveUser.officeHours !== null ? liveUser.officeHours : prev.officeHours,
            location: liveUser.location !== undefined && liveUser.location !== null ? liveUser.location : prev.location,
            phone: liveUser.phone !== undefined && liveUser.phone !== null ? liveUser.phone : prev.phone,
            bio: liveUser.bio !== undefined && liveUser.bio !== null ? liveUser.bio : prev.bio,
            githubUrl: liveUser.githubUrl !== undefined && liveUser.githubUrl !== null ? liveUser.githubUrl : prev.githubUrl,
            linkedinUrl: liveUser.linkedinUrl !== undefined && liveUser.linkedinUrl !== null ? liveUser.linkedinUrl : prev.linkedinUrl,
            websiteUrl: liveUser.websiteUrl !== undefined && liveUser.websiteUrl !== null ? liveUser.websiteUrl : prev.websiteUrl,
            collegeName: authMembership?.college?.name || prev.collegeName,
            collegeCode: authMembership?.college?.code || prev.collegeCode,
            collegeDomain: authMembership?.college?.email?.split('@')[1] || prev.collegeDomain,
            twoFactorEnabled: Boolean(liveUser.twoFactorEnabled),
          }));

          if (cId) {
            setActiveCollegeId(cId);
            loadBatches(cId);
          }
        }
      } catch {
        // Fallback to initial props or store user
      }
    }

    loadLiveProfile();
    loadCourses();
    loadProblems();
  }, [loadBatches, loadCourses, loadProblems]);

  const queryLower = searchQuery.trim().toLowerCase();
  const visibleBatches = useMemo(() => {
    if (!queryLower) return batches;
    return batches.filter(
      (b) =>
        b.name?.toLowerCase().includes(queryLower) ||
        b.code?.toLowerCase().includes(queryLower) ||
        b.year?.toLowerCase().includes(queryLower) ||
        b.status?.toLowerCase().includes(queryLower)
    );
  }, [batches, queryLower]);

  const visibleCourses = useMemo(() => {
    if (!queryLower) return courses;
    return courses.filter(
      (c) =>
        c.title?.toLowerCase().includes(queryLower) ||
        c.code?.toLowerCase().includes(queryLower) ||
        c.level?.toLowerCase().includes(queryLower) ||
        c.status?.toLowerCase().includes(queryLower)
    );
  }, [courses, queryLower]);

  const visibleProblems = useMemo(() => {
    if (!queryLower) return problems;
    return problems.filter(
      (p) =>
        p.title?.toLowerCase().includes(queryLower) ||
        p.slug?.toLowerCase().includes(queryLower) ||
        p.difficulty?.toLowerCase().includes(queryLower)
    );
  }, [problems, queryLower]);

  const borderColor = '#E2E8F0';

  const totalStudents = batches.reduce((acc, b) => acc + (b.studentsCount || 0), 0);

  const batchesWithAccuracy = batches
    .map((b) => {
      if (!b.avgAccuracy || b.avgAccuracy === 'N/A') return null;
      const num = parseFloat(b.avgAccuracy.replace('%', ''));
      return isNaN(num) ? null : num;
    })
    .filter((v): v is number => v !== null);

  const calculatedAvgAccuracy =
    batchesWithAccuracy.length > 0
      ? `${(batchesWithAccuracy.reduce((a, b) => a + b, 0) / batchesWithAccuracy.length).toFixed(1)}%`
      : 'N/A';

  const handleSaveBio = async (data: {
    bio: string;
    department: string;
    specialization: string;
    officeHours: string;
    location: string;
    phone: string;
    githubUrl: string;
    linkedinUrl: string;
    websiteUrl: string;
  }) => {
    try {
      await apiService.updateUser(profile.id, {
        bio: data.bio,
        department: data.department,
        specialization: data.specialization,
        officeHours: data.officeHours,
        location: data.location,
        phone: data.phone,
        githubUrl: data.githubUrl,
        linkedinUrl: data.linkedinUrl,
        websiteUrl: data.websiteUrl,
      });

      setProfile((prev) => ({
        ...prev,
        ...data,
      }));

      toast.success('Academic bio and credentials updated successfully.', 'Profile Updated');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update profile.', 'Error');
    }
  };

  const handleBatchCreated = (newBatch: any) => {
    if (activeCollegeId) {
      loadBatches(activeCollegeId);
    } else {
      setBatches((prev) => [
        {
          id: newBatch.id,
          name: newBatch.name,
          code: newBatch.code || generateBatchCode(newBatch.name, newBatch.id),
          studentsCount: 0,
          maxCapacity: newBatch.maxCapacity || 100,
          year: newBatch.startDate ? new Date(newBatch.startDate).getFullYear().toString() : '2026–2027',
          avgAccuracy: 'N/A',
          coursesAssigned: 0,
          status: 'Active',
        },
        ...prev,
      ]);
    }
  };

  const handleCourseCreated = () => {
    loadCourses();
  };

  const handleProblemCreated = () => {
    loadProblems();
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        bgcolor: '#F4F5F7',
        backgroundImage: `
          radial-gradient(ellipse at 15% 10%, rgba(37, 99, 235, 0.05) 0%, transparent 45%),
          radial-gradient(ellipse at 85% 20%, rgba(124, 58, 237, 0.04) 0%, transparent 45%),
          radial-gradient(ellipse at 50% 90%, rgba(5, 150, 105, 0.04) 0%, transparent 50%)
        `,
        color: '#0F172A',
        p: { xs: 1.5, sm: 2, md: 2.5 },
        pl: { xs: '82px', sm: '90px', md: '102px' },
        gap: { xs: 2, md: 3 },
      }}
    >
      {/* 1. Left Curved Navigation Sidebar */}
      <FacultySidebar />

      {/* Main Content Area */}
      <Box component="main" sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Box sx={{ maxWidth: 1400, width: '100%', mx: 'auto', px: { xs: 3, md: 5 }, display: 'flex', flexDirection: 'column', gap: 4, pb: { xs: 4, md: 6 } }}>
          {/* 2. Top Header Navbar */}
          <FacultyNavbar
            collegeName={profile.collegeName}
            collegeCode={profile.collegeCode}
            department={profile.department}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          {/* 3. Top Summary Metrics Row */}
          <FacultyMetricsRow
            batchesCount={batches.length}
            studentsCount={totalStudents}
            coursesCount={courses.length}
            avgAccuracy={calculatedAvgAccuracy}
          />

          {/* 4. Navigation Tabs */}
          <Box sx={{ borderBottom: `1px solid ${borderColor}` }}>
            <Tabs
              value={activeTab}
              onChange={(_, val) => setActiveTab(val)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  color: '#64748B',
                  minHeight: 48,
                  px: 2.5,
                  '&.Mui-selected': { color: '#2563EB' },
                },
                '& .MuiTabs-indicator': {
                  bgcolor: '#2563EB',
                  height: 3,
                  borderRadius: '3px 3px 0 0',
                },
              }}
            >
              <Tab icon={<AccountCircleRoundedIcon sx={{ fontSize: 18, mr: 0.5 }} />} iconPosition="start" label="Academic Overview & Analytics" />
              <Tab icon={<SchoolRoundedIcon sx={{ fontSize: 18, mr: 0.5 }} />} iconPosition="start" label="Assigned Cohorts" />
              <Tab icon={<GroupRoundedIcon sx={{ fontSize: 18, mr: 0.5 }} />} iconPosition="start" label="College Students Roster" />
              <Tab icon={<MenuBookRoundedIcon sx={{ fontSize: 18, mr: 0.5 }} />} iconPosition="start" label="Curriculum Courses" />
              <Tab icon={<CodeRoundedIcon sx={{ fontSize: 18, mr: 0.5 }} />} iconPosition="start" label="Lab Challenges & Question Bank" />
              <Tab icon={<SecurityRoundedIcon sx={{ fontSize: 18, mr: 0.5 }} />} iconPosition="start" label="Security & 2FA" />
            </Tabs>
          </Box>

          {/* TAB 0: Academic Overview & Analytics */}
          {activeTab === 0 && (
            <FacultyAnalyticsSection
              bio={profile.bio}
              department={profile.department}
              specialization={profile.specialization}
              officeHours={profile.officeHours}
              location={profile.location}
              githubUrl={profile.githubUrl}
              linkedinUrl={profile.linkedinUrl}
              websiteUrl={profile.websiteUrl}
              batches={batches}
              courses={courses}
              onEditBio={() => setIsEditModalOpen(true)}
              onNavigateTab={(idx) => setActiveTab(idx)}
            />
          )}

          {/* TAB 1: Assigned Cohorts & Batches */}
          {activeTab === 1 && (
            <FacultyBatchesTab
              batches={visibleBatches}
              collegeName={profile.collegeName}
              collegeId={activeCollegeId}
              onBatchCreated={handleBatchCreated}
              onRosterUpdated={() => {
                if (activeCollegeId) loadBatches(activeCollegeId);
              }}
            />
          )}

          {/* TAB 2: College Students Roster & Management */}
          {activeTab === 2 && (
            <FacultyStudentsTab
              collegeId={activeCollegeId}
              collegeName={profile.collegeName}
              batches={batches}
              onRosterUpdated={() => {
                if (activeCollegeId) loadBatches(activeCollegeId);
              }}
            />
          )}

          {/* TAB 3: Courses & Lab Curriculum */}
          {activeTab === 3 && (
            <FacultyCoursesTab
              courses={visibleCourses}
              collegeName={profile.collegeName}
              collegeId={activeCollegeId}
              onCourseCreated={handleCourseCreated}
            />
          )}

          {/* TAB 4: Lab Challenges & Question Bank */}
          {activeTab === 4 && (
            <FacultyProblemBankTab
              problems={visibleProblems}
              collegeName={profile.collegeName}
              collegeId={activeCollegeId}
              onProblemCreated={handleProblemCreated}
            />
          )}

          {/* TAB 5: Security & Preferences */}
          {activeTab === 5 && (
            <FacultySecurityTab
              twoFactorEnabled={profile.twoFactorEnabled}
            />
          )}
        </Box>
      </Box>

      {/* Edit Profile Modal Dialog */}
      <EditFacultyBioModal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialBio={profile.bio}
        initialDepartment={profile.department}
        initialSpecialization={profile.specialization}
        initialOfficeHours={profile.officeHours}
        initialLocation={profile.location}
        initialPhone={profile.phone}
        initialGithubUrl={profile.githubUrl}
        initialLinkedinUrl={profile.linkedinUrl}
        initialWebsiteUrl={profile.websiteUrl}
        onSave={handleSaveBio}
      />
    </Box>
  );
}
