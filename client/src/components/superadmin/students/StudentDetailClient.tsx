'use client';

import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
} from '@mui/material';

// Icons
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';
import MilitaryTechRoundedIcon from '@mui/icons-material/MilitaryTechRounded';

// Layout & Context
import FloatingSidebar from '@/components/superadmin/layout/CurvedSidebar';
import Navbar from '@/components/superadmin/layout/Navbar';
import { useToast } from '@/context/ToastContext';
import { MuiCenterLoader } from '@/components/shared/MuiLoadingFallback';

// Subcomponents & Types
import {
  StudentSubmissionItem,
  StudentCourseItem,
  StudentContestItem,
  StudentTopicItem,
  StudentBadgeItem,
  StudentDetailClientProps,
} from './detail/types';
import StudentHeaderStats from './detail/StudentHeaderStats';
import StudentSubmissionsTab from './detail/StudentSubmissionsTab';
import StudentCoursesTab from './detail/StudentCoursesTab';
import StudentContestsTab from './detail/StudentContestsTab';
import StudentTopicsTab from './detail/StudentTopicsTab';
import StudentBadgesTab from './detail/StudentBadgesTab';
import StudentViewCodeModal from './detail/StudentViewCodeModal';

export type {
  StudentSubmissionItem,
  StudentCourseItem,
  StudentContestItem,
  StudentTopicItem,
  StudentBadgeItem,
};

export default function StudentDetailClient({
  student,
  initialSubmissions,
  initialCourses,
  initialContests,
  initialTopics,
  initialBadges,
}: StudentDetailClientProps) {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<number>(0);
  const [isTabLoading, setIsTabLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleTabChange = (_: any, val: number) => {
    if (val === activeTab) return;
    setIsTabLoading(true);
    setActiveTab(val);
    setTimeout(() => setIsTabLoading(false), 180);
  };

  const [submissions] = useState<StudentSubmissionItem[]>(initialSubmissions);
  const [courses] = useState<StudentCourseItem[]>(initialCourses);
  const [contests] = useState<StudentContestItem[]>(initialContests);
  const [topics] = useState<StudentTopicItem[]>(initialTopics);
  const [badges] = useState<StudentBadgeItem[]>(initialBadges);
  const [viewCodeModal, setViewCodeModal] = useState<StudentSubmissionItem | null>(null);

  const downloadStudentReportExcel = () => {
    const tableContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="utf-8"/></head>
      <body>
        <h2>${student.name} (@${student.handle}) - Student Analytics Report</h2>
        <p>Institution: ${student.institutionName} | Cohort: ${student.cohort} | Rank: #${student.globalRank} | Rating: ${student.contestRating} (${student.ratingTier})</p>
        <p>Problems Solved: ${student.problemsSolved} (${student.solvedEasy}E / ${student.solvedMedium}M / ${student.solvedHard}H) | Accuracy: ${student.accuracy} | Streak: ${student.streakDays} days</p>
        <br/>
        <h3>Submissions History</h3>
        <table border="1">
          <tr style="background-color: #0B1F3A; color: #FFFFFF; font-weight: bold;">
            <th>Problem Title</th>
            <th>Problem Code</th>
            <th>Difficulty</th>
            <th>Language</th>
            <th>Verdict</th>
            <th>Runtime</th>
            <th>Memory</th>
            <th>Submitted Time</th>
          </tr>
          ${submissions
            .map(
              (s) => `
            <tr>
              <td>${s.problemTitle}</td>
              <td>${s.problemCode}</td>
              <td>${s.difficulty}</td>
              <td>${s.language}</td>
              <td>${s.verdict}</td>
              <td align="right">${s.runtimeMs} ms</td>
              <td align="right">${s.memoryKb} KB</td>
              <td>${s.submittedAt}</td>
            </tr>`
            )
            .join('')}
        </table>
      </body>
      </html>
    `;
    const blob = new Blob([tableContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${student.handle}_analytics_report_${new Date().toISOString().slice(0, 10)}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Exported ${student.name}'s analytics report to Excel (.xls)`, 'Export Completed');
  };

  const downloadStudentReportCSV = () => {
    const headers = ['Type', 'Problem/Contest/Course', 'Code/ID', 'Detail/Verdict', 'Metric 1', 'Metric 2', 'Date'];
    const subRows = submissions.map((s) => [
      '"Submission"',
      `"${s.problemTitle}"`,
      `"${s.problemCode}"`,
      `"${s.verdict}"`,
      `"${s.language}"`,
      `"${s.runtimeMs}ms / ${s.memoryKb}KB"`,
      `"${s.submittedAt}"`,
    ]);

    const csvContent = [headers.join(','), ...subRows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${student.handle}_analytics_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Exported ${student.name}'s analytics report to CSV`, 'Export Completed');
  };

  const borderColor = '#E2E8F0';

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        bgcolor: '#F4F5F7',
        backgroundImage: `
          radial-gradient(ellipse at 15% 10%, rgba(91, 45, 144, 0.06) 0%, transparent 45%),
          radial-gradient(ellipse at 85% 20%, rgba(91, 45, 144, 0.04) 0%, transparent 45%),
          radial-gradient(ellipse at 50% 90%, rgba(91, 45, 144, 0.04) 0%, transparent 50%)
        `,
        color: '#0F172A',
        p: { xs: 1.5, sm: 2, md: 2.5 },
        pl: { xs: '82px', sm: '90px', md: '102px' },
        gap: { xs: 2, md: 3 },
      }}
    >
      {/* 1. Left Curved Navigation Sidebar */}
      <FloatingSidebar />

      {/* Main Content Area */}
      <Box component="main" sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Unified Layout Container: Navbar + Page Content */}
        <Box sx={{ maxWidth: 1400, width: '100%', mx: 'auto', px: { xs: 3, md: 5 }, display: 'flex', flexDirection: 'column', gap: 4, pb: { xs: 4, md: 6 } }}>
          {/* 2. Top Header Navbar */}
          <Navbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

          {/* Student Header Stats & Metric Banners */}
          <StudentHeaderStats
            student={student}
            submissions={submissions}
            courses={courses}
            contests={contests}
            onDownloadExcel={downloadStudentReportExcel}
            onDownloadCSV={downloadStudentReportCSV}
          />

          {/* Navigation Tabs */}
          <Box sx={{ borderBottom: `1px solid ${borderColor}` }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  color: '#64748B',
                  minHeight: 48,
                  px: 2.5,
                  '&.Mui-selected': { color: '#0B1F3A' },
                },
                '& .MuiTabs-indicator': {
                  bgcolor: '#0B1F3A',
                  height: 3,
                  borderRadius: '3px 3px 0 0',
                },
              }}
            >
              <Tab icon={<HistoryRoundedIcon sx={{ fontSize: 18, mr: 0.5 }} />} iconPosition="start" label="Submissions History" />
              <Tab icon={<MenuBookRoundedIcon sx={{ fontSize: 18, mr: 0.5 }} />} iconPosition="start" label="Enrolled Courses & Labs" />
              <Tab icon={<EmojiEventsRoundedIcon sx={{ fontSize: 18, mr: 0.5 }} />} iconPosition="start" label="Contest Rating History" />
              <Tab icon={<CategoryRoundedIcon sx={{ fontSize: 18, mr: 0.5 }} />} iconPosition="start" label="Topic Mastery" />
              <Tab icon={<MilitaryTechRoundedIcon sx={{ fontSize: 18, mr: 0.5 }} />} iconPosition="start" label="Badges & Credentials" />
            </Tabs>
          </Box>

          <Box sx={{ position: 'relative' }}>
            {isTabLoading && (
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  bgcolor: 'rgba(255, 255, 255, 0.75)',
                  backdropFilter: 'blur(2px)',
                  zIndex: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '380px',
                  borderRadius: '16px',
                }}
              >
                <MuiCenterLoader minHeight="200px" message="Loading student dataset..." />
              </Box>
            )}

            {/* TAB 0: Submissions History */}
            <Box sx={{ display: activeTab === 0 ? 'block' : 'none' }}>
              <StudentSubmissionsTab
                submissions={submissions}
                onViewCode={setViewCodeModal}
              />
            </Box>

            {/* TAB 1: Enrolled Courses & Coding Labs */}
            <Box sx={{ display: activeTab === 1 ? 'block' : 'none' }}>
              <StudentCoursesTab courses={courses} />
            </Box>

            {/* TAB 2: Competitive Contests & Rating History */}
            <Box sx={{ display: activeTab === 2 ? 'block' : 'none' }}>
              <StudentContestsTab contests={contests} />
            </Box>

            {/* TAB 3: Problem Solving by Topic / Category */}
            <Box sx={{ display: activeTab === 3 ? 'block' : 'none' }}>
              <StudentTopicsTab topics={topics} />
            </Box>

            {/* TAB 4: Badges & Credentials Table */}
            <Box sx={{ display: activeTab === 4 ? 'block' : 'none' }}>
              <StudentBadgesTab badges={badges} />
            </Box>
          </Box>
        </Box>
      </Box>

      {/* View Code Snippet Modal Dialog */}
      <StudentViewCodeModal
        submission={viewCodeModal}
        onClose={() => setViewCodeModal(null)}
      />
    </Box>
  );
}
