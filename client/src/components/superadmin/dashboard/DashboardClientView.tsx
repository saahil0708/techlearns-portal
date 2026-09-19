'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Box } from '@mui/material';
import { MuiChartLoader, MuiTableLoader } from '@/components/shared/MuiLoadingFallback';

// Core Navigation
import FloatingSidebar from '@/components/superadmin/layout/CurvedSidebar';
import Navbar from '@/components/superadmin/layout/Navbar';
import type { DirectoryEntry } from '@/components/superadmin/shared/PlatformDirectoryTable';
import type { SubmissionItem } from '@/components/superadmin/shared/LiveSubmissionsFeed';
import ProblemRepositoryCard from '@/components/superadmin/shared/ProblemRepositoryCard';
import LeaderboardWidgetCard from '@/components/superadmin/shared/LeaderboardWidgetCard';
import ProblemSubmissionsWidget from '@/components/superadmin/shared/ProblemSubmissionsWidget';

// Dynamically Loaded Modular Components with MUI Fallback Loaders
const SubmissionsAnalyticsChart = dynamic(
  () => import('@/components/superadmin/shared/SubmissionsAnalyticsChart'),
  { loading: () => <MuiChartLoader height={350} />, ssr: false }
);
const LiveSubmissionsFeed = dynamic(
  () => import('@/components/superadmin/shared/LiveSubmissionsFeed'),
  { loading: () => <MuiTableLoader rows={4} /> }
);
const PlatformDirectoryTable = dynamic(
  () => import('@/components/superadmin/shared/PlatformDirectoryTable'),
  { loading: () => <MuiTableLoader rows={5} /> }
);

import { useRouter } from 'next/navigation';
import { apiService } from '@/lib/api-service';
import { isSchoolOrganization } from '@/utils/organization';

interface DashboardClientViewProps {
  initialSubmissions: SubmissionItem[];
  initialInstitutions: DirectoryEntry[];
}

export default function DashboardClientView({
  initialSubmissions,
  initialInstitutions,
}: DashboardClientViewProps) {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<SubmissionItem[]>(initialSubmissions);
  const [institutions, setInstitutions] = useState<DirectoryEntry[]>(initialInstitutions);

  const [submissionFilter, setSubmissionFilter] = useState<string>('ALL');
  const [instTab, setInstTab] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Live client-side fetch & refresh
  React.useEffect(() => {
    async function loadLiveDashboard() {
      try {
        const [submissionsData, collegesData] = await Promise.all([
          apiService.getLiveSubmissions(10).catch(() => null),
          apiService.getColleges({ limit: 50 }).catch(() => null),
        ]);

        if (Array.isArray(submissionsData)) {
          setSubmissions(
            submissionsData.map((sub: any) => ({
              id: sub.id,
              user: sub.user?.name || sub.user?.email || 'Anonymous',
              institution: 'Academic Campus',
              instType: 'College',
              problem: sub.problem?.title || 'Coding Problem',
              difficulty: 'Medium',
              language: sub.language || 'TypeScript',
              verdict: sub.verdict || sub.status || 'ACCEPTED',
              runtime: sub.runtime ? `${sub.runtime}ms` : '18ms',
              memory: sub.memory ? `${sub.memory}MB` : '16.4MB',
              timeAgo: 'Just now',
            }))
          );
        }

        if (collegesData && Array.isArray(collegesData.items)) {
          setInstitutions(
            collegesData.items.map((col: any) => {
              const studentCount = Array.isArray(col.memberships)
                ? col.memberships.filter((m: any) => m.role === 'STUDENT').length
                : (col._count?.memberships || 0);

              return {
                name: col.name,
                type: 'Institute',
                code: col.code,
                count: `${studentCount} ${studentCount === 1 ? 'student' : 'students'}`,
                detail: `${col._count?.courses || 0} courses • ${col._count?.batches || 0} cohorts`,
                region: col.region || col.location || col.address || 'Asia-Pacific',
                status: col.status === 'ACTIVE' ? 'Active' : 'Suspended',
              };
            })
          );
        }
      } catch (err) {
        console.warn('Dashboard live refresh:', err);
      }
    }
    loadLiveDashboard();
  }, []);

  const primaryBlue = '#2563eb';
  const allDirectoryList = institutions;

  // Filter Submissions
  const filteredSubmissions = submissions.filter((sub) => {
    if (submissionFilter === 'ACCEPTED' && sub.verdict !== 'ACCEPTED') return false;
    if (submissionFilter === 'FAILED' && sub.verdict === 'ACCEPTED') return false;
    return true;
  });

  // Filter Directory Entries (Institutes Only)
  const filteredDirectory = institutions.filter((item) => {
    if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        bgcolor: '#F4F5F7',
        backgroundImage: `
          radial-gradient(ellipse at 15% 10%, rgba(37, 99, 235, 0.06) 0%, transparent 45%),
          radial-gradient(ellipse at 85% 20%, rgba(37, 99, 235, 0.04) 0%, transparent 45%),
          radial-gradient(ellipse at 50% 90%, rgba(14, 165, 233, 0.04) 0%, transparent 50%)
        `,
        color: '#0F172A',
        p: { xs: 1.5, sm: 2, md: 2.5 },
        pl: { xs: '82px', sm: '90px', md: '102px' },
        gap: { xs: 2, md: 3 },
      }}
    >
      {/* 1. Left Floating Capsule Sidebar (Fixed) */}
      <FloatingSidebar />

      {/* Main Content Area */}
      <Box component="main" sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Unified Layout Container: Navbar + Dashboard Grid */}
        <Box sx={{ maxWidth: 1400, width: '100%', mx: 'auto', px: { xs: 3, md: 5 }, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {/* 2. Top Header / Navbar Component */}
          <Navbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            primaryBlue={primaryBlue}
          />

          {/* 3. 2-Column Main Section with Balanced Right Rail */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 385px' }, gap: 4, pb: { xs: 4, md: 6 } }}>
            {/* Left Column */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {/* 4. Submission Analytics Chart (Recharts) */}
              <SubmissionsAnalyticsChart />

              {/* 5. Directory Table Component */}
              <PlatformDirectoryTable
                entries={filteredDirectory}
                allEntries={allDirectoryList}
                currentTab={instTab}
                onTabChange={setInstTab}
                primaryBlue={primaryBlue}
              />

              {/* 6. Live Submissions Feed Component */}
              <LiveSubmissionsFeed
                submissions={filteredSubmissions}
                filter={submissionFilter}
                onFilterChange={setSubmissionFilter}
              />
            </Box>

            {/* Right Column */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {/* 7. Problem Submissions Bar Graph (Beside Submission Activity) */}
              <ProblemSubmissionsWidget primaryBlue={primaryBlue} />

              {/* 8. Problem Repository Card Component */}
              <ProblemRepositoryCard
                primaryBlue={primaryBlue}
                onManageClick={() => router.push('/superadmin/problems')}
              />

              {/* 9. Top Coders & Leaderboard Component */}
              <LeaderboardWidgetCard primaryBlue={primaryBlue} />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
