'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Box, Tabs, Tab, Card } from '@mui/material';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';

import FacultySidebar from '@/components/faculty/layout/FacultySidebar';
import FacultyNavbar from '@/components/faculty/layout/FacultyNavbar';
import FacultyMetricsRow from '@/components/faculty/profile/FacultyMetricsRow';
import FacultyAnalyticsSection from '@/components/faculty/profile/FacultyAnalyticsSection';
import FacultyBatchesTab from '@/components/faculty/profile/FacultyBatchesTab';
import FacultyCoursesTab from '@/components/faculty/profile/FacultyCoursesTab';
import FacultySecurityTab from '@/components/faculty/profile/FacultySecurityTab';
import EditFacultyBioModal from '@/components/faculty/profile/EditFacultyBioModal';

import { useToast } from '@/context/ToastContext';
import { apiService } from '@/lib/api-service';
import { useAppSelector } from '@/store/hooks';
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
  const activeCollegeId = facultyMembership?.collegeId || facultyMembership?.college?.id || user?.memberships?.[0]?.collegeId;

  const defaultProfile: FacultyProfileEntity = {
    id: user?.id || 'faculty-current',
    name: user?.name || 'Faculty Mentor',
    email: user?.email || '',
    department: (user as any)?.department || '',
    specialization: (user as any)?.specialization || '',
    officeHours: (user as any)?.officeHours || '',
    location: (user as any)?.location || '',
    phone: (user as any)?.phone || '',
    bio: (user as any)?.bio || '',
    githubUrl: (user as any)?.githubUrl || '',
    linkedinUrl: (user as any)?.linkedinUrl || '',
    websiteUrl: (user as any)?.websiteUrl || '',
    roleTitle: user?.globalRole === 'COLLEGE_ADMIN' ? 'Department Head & Campus Lead' : 'Senior Faculty Mentor',
    collegeName: facultyMembership?.college?.name || '',
    collegeCode: facultyMembership?.college?.code || '',
    collegeDomain: facultyMembership?.college?.email?.split('@')[1] || '',
    twoFactorEnabled: Boolean(user?.twoFactorEnabled),
  };

  const [profile, setProfile] = useState<FacultyProfileEntity>(initialProfile || defaultProfile);
  const [batches, setBatches] = useState<FacultyBatchItem[]>(initialBatches);
  const [courses, setCourses] = useState<FacultyCourseItem[]>(initialCourses);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Sync activeTab with URL search params (e.g. ?tab=batches, ?tab=courses, ?tab=security)
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'batches') setActiveTab(1);
    else if (tabParam === 'courses') setActiveTab(2);
    else if (tabParam === 'security') setActiveTab(3);
    else if (tabParam === 'bio' || tabParam === 'overview') setActiveTab(0);
    else setActiveTab(0);
  }, [searchParams]);

  // Hydrate with authenticated user & live college data
  React.useEffect(() => {
    if (user) {
      const authMembership = user.memberships?.find(
        (m) => m.role === 'FACULTY' || m.role === 'COLLEGE_ADMIN'
      );
      const authCollegeId = authMembership?.collegeId || authMembership?.college?.id;

      setProfile((prev) => ({
        ...prev,
        id: user.id || prev.id,
        name: user.name || prev.name,
        email: user.email || prev.email,
        department: (user as any).department !== undefined ? (user as any).department : prev.department,
        specialization: (user as any).specialization !== undefined ? (user as any).specialization : prev.specialization,
        officeHours: (user as any).officeHours !== undefined ? (user as any).officeHours : prev.officeHours,
        location: (user as any).location !== undefined ? (user as any).location : prev.location,
        phone: (user as any).phone !== undefined ? (user as any).phone : prev.phone,
        bio: (user as any).bio !== undefined ? (user as any).bio : prev.bio,
        githubUrl: (user as any).githubUrl !== undefined ? (user as any).githubUrl : prev.githubUrl,
        linkedinUrl: (user as any).linkedinUrl !== undefined ? (user as any).linkedinUrl : prev.linkedinUrl,
        websiteUrl: (user as any).websiteUrl !== undefined ? (user as any).websiteUrl : prev.websiteUrl,
        collegeName: authMembership?.college?.name || prev.collegeName,
        collegeCode: authMembership?.college?.code || prev.collegeCode,
        collegeDomain: authMembership?.college?.email?.split('@')[1] || prev.collegeDomain,
      }));

      if (authCollegeId) {
        apiService.getBatchesByCollege(authCollegeId).then((liveBatches) => {
          if (Array.isArray(liveBatches)) {
            setBatches(
              liveBatches.map((b: any) => ({
                id: b.id,
                name: b.name,
                code: b.code || `BAT-${b.id.slice(-4).toUpperCase()}`,
                studentsCount: b._count?.students || 0,
                maxCapacity: b.maxCapacity || 100,
                year: b.startDate ? new Date(b.startDate).getFullYear().toString() : '2026–2027',
                avgAccuracy: b.avgAccuracy || 'N/A',
                coursesAssigned: b._count?.courses || 0,
                status: b.status === 'ACTIVE' || !b.status ? 'Active' : b.status,
              }))
            );
          }
        }).catch(() => {});
      }
    }
  }, [user]);

  const queryLower = searchQuery.trim().toLowerCase();
  const visibleBatches = React.useMemo(() => {
    if (!queryLower) return batches;
    return batches.filter(
      (b) =>
        b.name?.toLowerCase().includes(queryLower) ||
        b.code?.toLowerCase().includes(queryLower) ||
        b.year?.toLowerCase().includes(queryLower) ||
        b.status?.toLowerCase().includes(queryLower)
    );
  }, [batches, queryLower]);

  const visibleCourses = React.useMemo(() => {
    if (!queryLower) return courses;
    return courses.filter(
      (c) =>
        c.title?.toLowerCase().includes(queryLower) ||
        c.code?.toLowerCase().includes(queryLower) ||
        c.level?.toLowerCase().includes(queryLower) ||
        c.status?.toLowerCase().includes(queryLower)
    );
  }, [courses, queryLower]);

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

          {/* 5. Navigation Tabs */}
          <Box sx={{ borderBottom: `1px solid ${borderColor}` }}>
            <Tabs
              value={activeTab}
              onChange={(_, val) => setActiveTab(val)}
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
              <Tab icon={<MenuBookRoundedIcon sx={{ fontSize: 18, mr: 0.5 }} />} iconPosition="start" label="Curriculum Courses" />
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
            />
          )}

          {/* TAB 2: Courses & Lab Curriculum */}
          {activeTab === 2 && (
            <FacultyCoursesTab
              courses={visibleCourses}
              collegeName={profile.collegeName}
            />
          )}

          {/* TAB 3: Security & Preferences */}
          {activeTab === 3 && (
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
