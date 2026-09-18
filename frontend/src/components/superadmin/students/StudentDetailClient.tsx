'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  Chip,
  Button,
  TextField,
  InputAdornment,
  Avatar,
  Tooltip,
  LinearProgress,
  Menu,
  MenuItem,
  ListItemIcon,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Select,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import Link from 'next/link';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import { FluidArrowLeft } from '@/utils/fluid_arrow';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import TableChartRoundedIcon from '@mui/icons-material/TableChartRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import PublicRoundedIcon from '@mui/icons-material/PublicRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import WhatshotRoundedIcon from '@mui/icons-material/WhatshotRounded';
import MilitaryTechRoundedIcon from '@mui/icons-material/MilitaryTechRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';
import FirstPageRoundedIcon from '@mui/icons-material/FirstPageRounded';
import LastPageRoundedIcon from '@mui/icons-material/LastPageRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import TerminalRoundedIcon from '@mui/icons-material/TerminalRounded';

// Components
import FloatingSidebar from '@/components/superadmin/layout/CurvedSidebar';
import Navbar from '@/components/superadmin/layout/Navbar';
import { StudentDirectoryEntity } from '@/components/superadmin/students/StudentsDirectoryClient';
import { useToast } from '@/context/ToastContext';
import { MuiCenterLoader } from '@/components/shared/MuiLoadingFallback';
import StatsCard from '@/components/superadmin/shared/StatsCard';
import PieChartRoundedIcon from '@mui/icons-material/PieChartRounded';
import RadialDonutGauge from '@/components/superadmin/shared/RadialDonutGauge';

// Sub-Interfaces
export interface StudentSubmissionItem {
  id: string;
  problemTitle: string;
  problemCode: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  language: 'C++20' | 'Python 3' | 'Java 21' | 'TypeScript';
  verdict: 'Accepted' | 'Wrong Answer' | 'Time Limit Exceeded' | 'Runtime Error';
  runtimeMs: number;
  memoryKb: number;
  submittedAt: string;
  codeSnippet: string;
}

export interface StudentCourseItem {
  id: string;
  title: string;
  code: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  instructor: string;
  modulesCompleted: number;
  totalModules: number;
  progressPct: number;
  status: 'In Progress' | 'Completed';
}

export interface StudentContestItem {
  id: string;
  contestName: string;
  contestDate: string;
  rank: number;
  totalParticipants: number;
  problemsSolved: number;
  penaltyTime: string;
  ratingDelta: number;
  newRating: number;
}

export interface StudentTopicItem {
  id: string;
  topicName: string;
  solvedCount: number;
  totalAvailable: number;
  accuracy: string;
  levelMastery: 'Master' | 'Proficient' | 'Intermediate' | 'Learning';
}

export interface StudentBadgeItem {
  id: string;
  title: string;
  category: 'Contest Medal' | 'Course Certificate' | 'Milestone';
  issuer: string;
  issueDate: string;
  credentialId: string;
}

interface StudentDetailClientProps {
  student: StudentDirectoryEntity;
  initialSubmissions: StudentSubmissionItem[];
  initialCourses: StudentCourseItem[];
  initialContests: StudentContestItem[];
  initialTopics: StudentTopicItem[];
  initialBadges: StudentBadgeItem[];
}

interface PaginationToolbarProps {
  totalEntries: number;
  currentPage: number;
  rowsPerPage: number;
  onPageChange: (newPage: number) => void;
  onRowsPerPageChange: (newRows: number) => void;
  itemLabel?: string;
  rowsOptions?: number[];
}

function PaginationToolbar({
  totalEntries,
  currentPage,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  itemLabel = 'items',
  rowsOptions = [5, 10, 25, 50],
}: PaginationToolbarProps) {
  const totalPages = Math.max(1, Math.ceil(totalEntries / rowsPerPage));
  const safePage = Math.min(currentPage, totalPages - 1);
  const startEntry = totalEntries === 0 ? 0 : safePage * rowsPerPage + 1;
  const endEntry = Math.min((safePage + 1) * rowsPerPage, totalEntries);

  const getPaginationRange = (current: number, total: number) => {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i);
    if (current <= 3) return [0, 1, 2, 3, 4, 'ellipsis', total - 1];
    if (current >= total - 4) return [0, 'ellipsis', total - 5, total - 4, total - 3, total - 2, total - 1];
    return [0, 'ellipsis-start', current - 1, current, current + 1, 'ellipsis-end', total - 1];
  };

  return (
    <Card
      elevation={0}
      sx={{
        p: 2,
        px: 3,
        borderRadius: '14px',
        bgcolor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
        <Typography sx={{ fontSize: '0.78rem', color: '#64748B' }}>
          Showing <strong style={{ color: '#0F172A', fontWeight: 600 }}>{startEntry}–{endEntry}</strong> of <strong style={{ color: '#0F172A', fontWeight: 600 }}>{totalEntries}</strong> {itemLabel}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography sx={{ fontSize: '0.76rem', color: '#64748B' }}>Rows per page:</Typography>
          <Select
            value={rowsPerPage}
            onChange={(e) => {
              onRowsPerPageChange(Number(e.target.value));
              onPageChange(0);
            }}
            size="small"
            sx={{
              height: 28,
              fontSize: '0.76rem',
              fontWeight: 600,
              color: '#0F172A',
              bgcolor: '#FFFFFF',
              borderRadius: '9999px',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0', borderRadius: '9999px' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#CBD5E1' },
              '& .MuiSvgIcon-root': { color: '#64748B', fontSize: 18 },
            }}
          >
            {rowsOptions.map((opt) => (
              <MenuItem key={opt} value={opt}>{opt}</MenuItem>
            ))}
          </Select>
        </Box>
      </Box>

      {/* Pagination Controls */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
        <IconButton
          size="small"
          disabled={safePage === 0}
          onClick={() => onPageChange(0)}
          sx={{
            width: 32,
            height: 32,
            color: '#64748B',
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '9999px',
            p: 0.5,
            '&:hover': { bgcolor: '#F1F5F9', color: '#0F172A' },
            '&.Mui-disabled': { opacity: 0.4, color: '#94A3B8' },
          }}
        >
          <FirstPageRoundedIcon sx={{ fontSize: 18 }} />
        </IconButton>

        <IconButton
          size="small"
          disabled={safePage === 0}
          onClick={() => onPageChange(Math.max(0, safePage - 1))}
          sx={{
            width: 32,
            height: 32,
            color: '#64748B',
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '9999px',
            p: 0.5,
            '&:hover': { bgcolor: '#F1F5F9', color: '#0F172A' },
            '&.Mui-disabled': { opacity: 0.4, color: '#94A3B8' },
          }}
        >
          <ChevronLeftRoundedIcon sx={{ fontSize: 18 }} />
        </IconButton>

        {/* Smart Long-List Pagination Pills */}
        {getPaginationRange(safePage, totalPages).map((item, idx) => {
          if (typeof item === 'string') {
            return (
              <Box
                key={`ellipsis-${idx}`}
                sx={{
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#94A3B8',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  userSelect: 'none',
                }}
              >
                •••
              </Box>
            );
          }

          const pageIndex = item as number;
          const isActive = safePage === pageIndex;

          return (
            <Box
              key={pageIndex}
              onClick={() => onPageChange(pageIndex)}
              sx={{
                minWidth: 32,
                height: 32,
                px: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '9999px',
                cursor: 'pointer',
                fontSize: '0.78rem',
                fontWeight: isActive ? 800 : 600,
                color: isActive ? '#FFFFFF' : '#64748B',
                bgcolor: isActive ? '#2563EB' : '#FFFFFF',
                border: isActive ? '1px solid #2563EB' : '1px solid #E2E8F0',
                boxShadow: isActive ? '0 2px 8px rgba(37, 99, 235, 0.3)' : 'none',
                transition: 'all 0.15s ease',
                '&:hover': {
                  bgcolor: isActive ? '#1D4ED8' : '#F1F5F9',
                  color: isActive ? '#FFFFFF' : '#0F172A',
                  borderColor: isActive ? '#1D4ED8' : '#CBD5E1',
                },
              }}
            >
              {pageIndex + 1}
            </Box>
          );
        })}

        <IconButton
          size="small"
          disabled={safePage >= totalPages - 1}
          onClick={() => onPageChange(Math.min(totalPages - 1, safePage + 1))}
          sx={{
            width: 32,
            height: 32,
            color: '#64748B',
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '9999px',
            p: 0.5,
            '&:hover': { bgcolor: '#F1F5F9', color: '#0F172A' },
            '&.Mui-disabled': { opacity: 0.4, color: '#94A3B8' },
          }}
        >
          <ChevronRightRoundedIcon sx={{ fontSize: 18 }} />
        </IconButton>

        <IconButton
          size="small"
          disabled={safePage >= totalPages - 1}
          onClick={() => onPageChange(totalPages - 1)}
          sx={{
            width: 32,
            height: 32,
            color: '#64748B',
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '9999px',
            p: 0.5,
            '&:hover': { bgcolor: '#F1F5F9', color: '#0F172A' },
            '&.Mui-disabled': { opacity: 0.4, color: '#94A3B8' },
          }}
        >
          <LastPageRoundedIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>
    </Card>
  );
}

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

  // Filter & Pagination states for Tab 0: Submissions
  const [subSearch, setSubSearch] = useState('');
  const [subVerdictFilter, setSubVerdictFilter] = useState('ALL');
  const [subPage, setSubPage] = useState<number>(0);
  const [subRowsPerPage, setSubRowsPerPage] = useState<number>(10);
  const [viewCodeModal, setViewCodeModal] = useState<StudentSubmissionItem | null>(null);

  // Filter & Pagination states for Tab 1: Courses
  const [courseSearch, setCourseSearch] = useState('');
  const [coursePage, setCoursePage] = useState<number>(0);
  const [courseRowsPerPage, setCourseRowsPerPage] = useState<number>(10);

  // Filter & Pagination states for Tab 2: Contests
  const [contestSearch, setContestSearch] = useState('');
  const [contestPage, setContestPage] = useState<number>(0);
  const [contestRowsPerPage, setContestRowsPerPage] = useState<number>(10);

  // Filter & Pagination states for Tab 3: Topics
  const [topicSearch, setTopicSearch] = useState('');
  const [topicPage, setTopicPage] = useState<number>(0);
  const [topicRowsPerPage, setTopicRowsPerPage] = useState<number>(10);

  // Filter & Pagination states for Tab 4: Badges
  const [badgeSearch, setBadgeSearch] = useState('');
  const [badgePage, setBadgePage] = useState<number>(0);
  const [badgeRowsPerPage, setBadgeRowsPerPage] = useState<number>(10);

  // Export Menu state
  const [downloadAnchorEl, setDownloadAnchorEl] = useState<null | HTMLElement>(null);

  const handleOpenDownloadMenu = (event: React.MouseEvent<HTMLElement>) => {
    setDownloadAnchorEl(event.currentTarget);
  };

  const handleCloseDownloadMenu = () => {
    setDownloadAnchorEl(null);
  };

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
          <tr style="background-color: #2563EB; color: #FFFFFF; font-weight: bold;">
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
    handleCloseDownloadMenu();
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
    handleCloseDownloadMenu();
    toast.success(`Exported ${student.name}'s analytics report to CSV`, 'Export Completed');
  };

  // Filtered Submissions
  const filteredSubmissions = submissions.filter((s) => {
    if (subVerdictFilter !== 'ALL' && s.verdict !== subVerdictFilter) return false;
    if (
      subSearch &&
      !s.problemTitle.toLowerCase().includes(subSearch.toLowerCase()) &&
      !s.problemCode.toLowerCase().includes(subSearch.toLowerCase()) &&
      !s.language.toLowerCase().includes(subSearch.toLowerCase())
    ) {
      return false;
    }
    return true;
  });
  const paginatedSubmissions = filteredSubmissions.slice(
    subPage * subRowsPerPage,
    subPage * subRowsPerPage + subRowsPerPage
  );

  // Filtered Courses
  const filteredCourses = courses.filter((c) => {
    if (
      courseSearch &&
      !c.title.toLowerCase().includes(courseSearch.toLowerCase()) &&
      !c.code.toLowerCase().includes(courseSearch.toLowerCase()) &&
      !c.instructor.toLowerCase().includes(courseSearch.toLowerCase())
    ) {
      return false;
    }
    return true;
  });
  const paginatedCourses = filteredCourses.slice(
    coursePage * courseRowsPerPage,
    coursePage * courseRowsPerPage + courseRowsPerPage
  );

  // Filtered Contests
  const filteredContests = contests.filter((c) => {
    if (
      contestSearch &&
      !c.contestName.toLowerCase().includes(contestSearch.toLowerCase())
    ) {
      return false;
    }
    return true;
  });
  const paginatedContests = filteredContests.slice(
    contestPage * contestRowsPerPage,
    contestPage * contestRowsPerPage + contestRowsPerPage
  );

  // Filtered Topics
  const filteredTopics = topics.filter((t) => {
    if (
      topicSearch &&
      !t.topicName.toLowerCase().includes(topicSearch.toLowerCase())
    ) {
      return false;
    }
    return true;
  });
  const paginatedTopics = filteredTopics.slice(
    topicPage * topicRowsPerPage,
    topicPage * topicRowsPerPage + topicRowsPerPage
  );

  // Filtered Badges
  const filteredBadges = badges.filter((b) => {
    if (
      badgeSearch &&
      !b.title.toLowerCase().includes(badgeSearch.toLowerCase()) &&
      !b.issuer.toLowerCase().includes(badgeSearch.toLowerCase())
    ) {
      return false;
    }
    return true;
  });
  const paginatedBadges = filteredBadges.slice(
    badgePage * badgeRowsPerPage,
    badgePage * badgeRowsPerPage + badgeRowsPerPage
  );

  const borderColor = '#E2E8F0';

  // Derived Student Gauge Metrics
  const parsedAccuracy = parseInt((student.accuracy || '').replace('%', ''), 10);
  const accuracyPercentage = Number.isFinite(parsedAccuracy) ? parsedAccuracy : 84;
  const accuracyBadge = !Number.isFinite(parsedAccuracy)
    ? 'Sample Data'
    : accuracyPercentage >= 80
      ? 'High Precision'
      : accuracyPercentage >= 60
        ? 'Moderate'
        : 'Developing';

  // Course completion derived from courses
  const hasCourses = courses && courses.length > 0;
  const completedCoursesCount = hasCourses ? courses.filter((c) => c.status === 'Completed').length : 0;
  const avgCourseProgress = hasCourses
    ? Math.round(courses.reduce((acc, c) => acc + (c.progressPct || 0), 0) / courses.length)
    : 0;
  const courseCompletionPct = hasCourses ? avgCourseProgress : 88;
  const courseBadge = hasCourses
    ? courseCompletionPct >= 80
      ? 'Ahead of Pace'
      : courseCompletionPct >= 50
        ? 'On Track'
        : 'In Progress'
    : 'Sample Data';
  const courseSublabel = hasCourses
    ? `${completedCoursesCount} of ${courses.length} courses completed`
    : 'Sample: No assigned courses';

  // Practice consistency derived from streak & activity
  const hasStreakData = typeof student.streakDays === 'number' && Number.isFinite(student.streakDays);
  const streakDays = hasStreakData ? student.streakDays : 0;
  const practiceConsistencyPct = hasStreakData
    ? Math.min(100, Math.round((streakDays / 14) * 100))
    : 92;
  const consistencyBadge = hasStreakData
    ? streakDays >= 14
      ? 'Dedicated'
      : streakDays >= 5
        ? 'Active Streak'
        : streakDays > 0
          ? 'Building Habit'
          : 'Zero Streak'
    : 'Sample Data';
  const consistencySublabel = hasStreakData
    ? `${streakDays} day active streak`
    : 'Sample: 0 day streak recorded';

  // Contest benchmark derived from contest rating / contests
  const latestContestWithRating = contests?.find((c) => typeof c.newRating === 'number' && c.newRating > 0);
  const derivedRating = (typeof student.contestRating === 'number' && student.contestRating > 0)
    ? student.contestRating
    : latestContestWithRating?.newRating;

  const hasValidRating = typeof derivedRating === 'number' && derivedRating > 0;

  const contestBenchmarkPct = hasValidRating
    ? Math.min(100, Math.max(0, Math.round((derivedRating / 2400) * 100)))
    : 0;
  const contestBadge = hasValidRating
    ? student.ratingTier || (contestBenchmarkPct >= 80 ? 'Top 15%' : 'Ranked')
    : 'Unrated';
  const contestSublabel = hasValidRating
    ? `Rating: ${derivedRating} (${student.ratingTier || 'Ranked'})`
    : 'Unrated: No valid contest rating.';

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
      {/* 1. Left Curved Navigation Sidebar */}
      <FloatingSidebar />

      {/* Main Content Area */}
      <Box component="main" sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Unified Layout Container: Navbar + Page Content */}
        <Box sx={{ maxWidth: 1400, width: '100%', mx: 'auto', px: { xs: 3, md: 5 }, display: 'flex', flexDirection: 'column', gap: 4, pb: { xs: 4, md: 6 } }}>
          {/* 2. Top Header Navbar */}
          <Navbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

          {/* Breadcrumb & Top Bar */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Button
                component={Link}
                href="/superadmin/students"
                startIcon={<FluidArrowLeft size={18} />}
                sx={{
                  color: '#64748B',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.84rem',
                }}
              >
                Back to Students
              </Button>
              <Typography sx={{ color: '#94A3B8', fontSize: '0.85rem' }}>/</Typography>
              <Typography sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.9rem' }}>
                {student.name}
              </Typography>
              <Chip
                label={`@${student.handle}`}
                size="small"
                sx={{ height: 22, fontSize: '0.72rem', fontWeight: 700, bgcolor: '#EFF6FF', color: '#2563EB', borderRadius: '5px' }}
              />
            </Box>

            {/* Actions: Export Report */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <Tooltip title="Export Student Analytics">
                <Button
                  onClick={handleOpenDownloadMenu}
                  startIcon={<FileDownloadRoundedIcon sx={{ fontSize: 18 }} />}
                  sx={{
                    bgcolor: '#FFFFFF',
                    color: '#475569',
                    border: `1px solid ${borderColor}`,
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.84rem',
                    px: 1.75,
                    py: 0.75,
                    '&:hover': { bgcolor: '#EFF6FF', color: '#2563EB', borderColor: '#BFDBFE' },
                  }}
                >
                  Export Report
                </Button>
              </Tooltip>

              <Menu
                anchorEl={downloadAnchorEl}
                open={Boolean(downloadAnchorEl)}
                onClose={handleCloseDownloadMenu}
                slotProps={{
                  paper: {
                    elevation: 4,
                    sx: {
                      borderRadius: '14px',
                      border: '1px solid #E2E8F0',
                      mt: 1,
                      minWidth: 210,
                      p: 0.5,
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08)',
                    },
                  },
                }}
              >
                <MenuItem onClick={downloadStudentReportExcel} sx={{ borderRadius: '8px', py: 1 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <TableChartRoundedIcon sx={{ fontSize: 18, color: '#16A34A' }} />
                  </ListItemIcon>
                  <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#0F172A' }}>
                    Download Excel (.xls)
                  </Typography>
                </MenuItem>
                <MenuItem onClick={downloadStudentReportCSV} sx={{ borderRadius: '8px', py: 1 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <DescriptionRoundedIcon sx={{ fontSize: 18, color: '#2563EB' }} />
                  </ListItemIcon>
                  <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#0F172A' }}>
                    Download CSV (.csv)
                  </Typography>
                </MenuItem>
              </Menu>
            </Box>
          </Box>

          {/* 4 Summary Metric Cards */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2.5 }}>
            <StatsCard
              title="Problems Solved"
              value={student.problemsSolved}
              icon={<CodeRoundedIcon sx={{ fontSize: 20 }} />}
              variant="blue"
              shape="orbital"
              subtitle={
                <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center' }}>
                  <Typography sx={{ fontSize: '0.72rem', color: '#4ADE80', fontWeight: 700 }}>
                    {student.solvedEasy}E
                  </Typography>
                  <Typography sx={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>•</Typography>
                  <Typography sx={{ fontSize: '0.72rem', color: '#60A5FA', fontWeight: 700 }}>
                    {student.solvedMedium}M
                  </Typography>
                  <Typography sx={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>•</Typography>
                  <Typography sx={{ fontSize: '0.72rem', color: '#F87171', fontWeight: 700 }}>
                    {student.solvedHard}H
                  </Typography>
                </Box>
              }
            />

            <StatsCard
              title="Contest Rating"
              value={student.contestRating}
              icon={<MilitaryTechRoundedIcon sx={{ fontSize: 20 }} />}
              variant="black"
              shape="topography"
              subtitle={`${student.ratingTier} • Rank #${student.globalRank}`}
            />

            <StatsCard
              title="Accuracy Rate"
              value={student.accuracy}
              icon={<CheckCircleRoundedIcon sx={{ fontSize: 20 }} />}
              variant="blue"
              shape="hex-grid"
              subtitle={`${submissions.length} Total Submissions`}
            />

            <StatsCard
              title="Active Streak"
              value={`${student.streakDays} Days`}
              icon={<WhatshotRoundedIcon sx={{ fontSize: 20 }} />}
              variant="black"
              shape="aurora-waves"
              subtitle="Personal Best: 65 Days"
            />
          </Box>

          {/* Student Competency & Execution Radial Donut Gauges */}
          <Card
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: '16px',
              bgcolor: '#FFFFFF',
              border: `1px solid ${borderColor}`,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '10px',
                    bgcolor: '#EFF6FF',
                    color: '#2563EB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <PieChartRoundedIcon sx={{ fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '0.96rem', fontWeight: 800, color: '#0F172A' }}>
                    Student Mastery & Execution Health
                  </Typography>
                  <Typography sx={{ fontSize: '0.74rem', color: '#64748B' }}>
                    First-pass testbench accuracy, syllabus adherence, and contest readiness
                  </Typography>
                </Box>
              </Box>
              <Chip
                size="small"
                label={student.ratingTier || 'Candidate Master'}
                sx={{
                  height: 22,
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  bgcolor: '#EFF6FF',
                  color: '#2563EB',
                  border: '1px solid #BFDBFE',
                  borderRadius: '6px',
                }}
              />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2 }}>
              <RadialDonutGauge
                percentage={accuracyPercentage}
                color="#2563EB"
                label="First-Pass Accuracy"
                sublabel={Number.isFinite(parsedAccuracy) ? 'Accepted on first run' : 'Sample: No submissions yet'}
                badge={accuracyBadge}
              />
              <RadialDonutGauge
                percentage={courseCompletionPct}
                color="#059669"
                label="Course Completion"
                sublabel={courseSublabel}
                badge={courseBadge}
              />
              <RadialDonutGauge
                percentage={practiceConsistencyPct}
                color="#7C3AED"
                label="Practice Consistency"
                sublabel={consistencySublabel}
                badge={consistencyBadge}
              />
              <RadialDonutGauge
                percentage={contestBenchmarkPct}
                color="#D97706"
                label="Contest Benchmark"
                sublabel={contestSublabel}
                badge={contestBadge}
              />
            </Box>
          </Card>

          {/* 365-Day Activity Heatmap Matrix (GitHub / LeetCode Style) */}
          <Card
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: '16px',
              bgcolor: '#FFFFFF',
              border: `1px solid ${borderColor}`,
              boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WhatshotRoundedIcon sx={{ color: '#F97316', fontSize: 20 }} />
                <Typography sx={{ fontWeight: 800, fontSize: '0.92rem', color: '#0F172A' }}>
                  Annual Submission Activity
                </Typography>
                <Chip
                  label="648 Submissions in Past Year"
                  size="small"
                  sx={{
                    bgcolor: '#EFF6FF',
                    color: '#2563EB',
                    fontWeight: 700,
                    fontSize: '0.72rem',
                    borderRadius: '9999px',
                  }}
                />
              </Box>

              {/* Heatmap Legend */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Typography sx={{ fontSize: '0.72rem', color: '#64748B', mr: 0.5 }}>Less</Typography>
                <Box sx={{ width: 11, height: 11, borderRadius: '2px', bgcolor: '#F1F5F9', border: '1px solid #E2E8F0' }} />
                <Box sx={{ width: 11, height: 11, borderRadius: '2px', bgcolor: '#BBF7D0' }} />
                <Box sx={{ width: 11, height: 11, borderRadius: '2px', bgcolor: '#4ADE80' }} />
                <Box sx={{ width: 11, height: 11, borderRadius: '2px', bgcolor: '#16A34A' }} />
                <Box sx={{ width: 11, height: 11, borderRadius: '2px', bgcolor: '#15803D' }} />
                <Typography sx={{ fontSize: '0.72rem', color: '#64748B', ml: 0.5 }}>More</Typography>
              </Box>
            </Box>

            {/* Scrollable Heatmap Grid */}
            <Box sx={{ overflowX: 'auto', pb: 1 }}>
              <Box sx={{ display: 'flex', gap: '3px', minWidth: 780 }}>
                {Array.from({ length: 52 }, (_, weekIdx) => (
                  <Box key={weekIdx} sx={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    {Array.from({ length: 7 }, (_, dayIdx) => {
                      // Deterministic mock activity pattern based on streak and solved counts
                      const seed = (weekIdx * 7 + dayIdx + student.problemsSolved) % 19;
                      const intensity =
                        weekIdx > 46 && dayIdx <= 4
                          ? (weekIdx + dayIdx) % 3 + 2 // high recent streak
                          : seed === 0
                          ? 0
                          : seed < 7
                          ? 1
                          : seed < 13
                          ? 2
                          : seed < 17
                          ? 3
                          : 4;

                      const colors = ['#F1F5F9', '#BBF7D0', '#4ADE80', '#16A34A', '#15803D'];
                      const subCounts = [0, 1, 3, 6, 9];

                      return (
                        <Tooltip
                          key={dayIdx}
                          title={`Week ${weekIdx + 1}, Day ${dayIdx + 1}: ${subCounts[intensity]} submissions`}
                          arrow
                          placement="top"
                        >
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: '3px',
                              bgcolor: colors[intensity],
                              border: intensity === 0 ? '1px solid #E2E8F0' : 'none',
                              cursor: 'pointer',
                              transition: 'transform 0.1s ease',
                              '&:hover': {
                                transform: 'scale(1.25)',
                                zIndex: 2,
                              },
                            }}
                          />
                        </Tooltip>
                      );
                    })}
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Heatmap Footer Stats */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                pt: 1.5,
                mt: 1,
                borderTop: '1px solid #F1F5F9',
                flexWrap: 'wrap',
                gap: 2,
              }}
            >
              <Typography sx={{ fontSize: '0.75rem', color: '#64748B' }}>
                Active on <strong style={{ color: '#0F172A' }}>284 of 365 days</strong> (77.8% platform consistency)
              </Typography>
              <Box sx={{ display: 'flex', gap: 3 }}>
                <Typography sx={{ fontSize: '0.75rem', color: '#64748B' }}>
                  Current Streak: <strong style={{ color: '#D97706' }}>🔥 {student.streakDays} Days</strong>
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: '#64748B' }}>
                  Longest Streak: <strong style={{ color: '#2563EB' }}>⚡ 65 Days</strong>
                </Typography>
              </Box>
            </Box>
          </Card>

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
                  '&.Mui-selected': { color: '#2563EB' },
                },
                '& .MuiTabs-indicator': {
                  bgcolor: '#2563EB',
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

          {isTabLoading ? (
            <MuiCenterLoader minHeight="380px" message="Loading student dataset..." />
          ) : (
            <>
          {/* TAB 0: Submissions History */}
          {activeTab === 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Filter bar */}
              <Card elevation={0} sx={{ p: 2, px: 2.5, borderRadius: '14px', bgcolor: '#FFFFFF', border: `1px solid ${borderColor}`, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, flexWrap: 'wrap' }}>
                  <TextField
                    size="small"
                    placeholder="Search submissions by problem title, code, language..."
                    value={subSearch}
                    onChange={(e) => {
                      setSubSearch(e.target.value);
                      setSubPage(0);
                    }}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon sx={{ color: '#64748B', fontSize: 18 }} />
                          </InputAdornment>
                        ),
                      },
                    }}
                    sx={{
                      minWidth: { xs: '100%', sm: 300 },
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                        bgcolor: '#F8FAFC',
                        fontSize: '0.84rem',
                        height: 36,
                        '& fieldset': { borderColor: '#E2E8F0' },
                      },
                    }}
                  />

                  <Select
                    size="small"
                    value={subVerdictFilter}
                    onChange={(e) => {
                      setSubVerdictFilter(e.target.value);
                      setSubPage(0);
                    }}
                    sx={{
                      height: 36,
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      bgcolor: '#F8FAFC',
                      borderRadius: '8px',
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' },
                    }}
                  >
                    <MenuItem value="ALL">All Verdicts</MenuItem>
                    <MenuItem value="Accepted">Accepted</MenuItem>
                    <MenuItem value="Wrong Answer">Wrong Answer</MenuItem>
                    <MenuItem value="Time Limit Exceeded">Time Limit Exceeded</MenuItem>
                  </Select>
                </Box>

                <Typography sx={{ fontSize: '0.82rem', color: '#64748B' }}>
                  Showing <strong style={{ color: '#0F172A' }}>{filteredSubmissions.length}</strong> submissions
                </Typography>
              </Card>

              {/* Submissions Table */}
              <Card elevation={0} sx={{ borderRadius: '16px', bgcolor: '#FFFFFF', border: `1px solid ${borderColor}`, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                <TableContainer>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                      <TableRow>
                        <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', pl: 3, py: 1.5 }}>PROBLEM</TableCell>
                        <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5 }}>DIFFICULTY</TableCell>
                        <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5 }}>LANGUAGE</TableCell>
                        <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5 }}>VERDICT</TableCell>
                        <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5 }}>RUNTIME</TableCell>
                        <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5 }}>MEMORY</TableCell>
                        <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5 }}>SUBMITTED TIME</TableCell>
                        <TableCell align="right" sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', pr: 3, py: 1.5 }}>ACTIONS</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedSubmissions.map((sub) => (
                        <TableRow key={sub.id} hover sx={{ '& td': { borderBottom: '1px solid #F1F5F9' } }}>
                          <TableCell sx={{ pl: 3, py: 1.6 }}>
                            <Typography sx={{ fontSize: '0.86rem', fontWeight: 700, color: '#0F172A' }}>
                              {sub.problemTitle}
                            </Typography>
                            <Typography sx={{ fontSize: '0.72rem', color: '#64748B', fontFamily: 'monospace' }}>
                              {sub.problemCode}
                            </Typography>
                          </TableCell>

                          <TableCell sx={{ py: 1.6 }}>
                            <Chip
                              label={sub.difficulty}
                              size="small"
                              sx={{
                                height: 22,
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                bgcolor:
                                  sub.difficulty === 'Easy'
                                    ? '#ECFDF5'
                                    : sub.difficulty === 'Medium'
                                    ? '#EFF6FF'
                                    : '#FEF2F2',
                                color:
                                  sub.difficulty === 'Easy'
                                    ? '#059669'
                                    : sub.difficulty === 'Medium'
                                    ? '#2563EB'
                                    : '#DC2626',
                                borderRadius: '5px',
                              }}
                            />
                          </TableCell>

                          <TableCell sx={{ py: 1.6 }}>
                            <Chip
                              label={sub.language}
                              size="small"
                              sx={{ height: 22, fontSize: '0.72rem', fontWeight: 600, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', color: '#334155', borderRadius: '5px' }}
                            />
                          </TableCell>

                          <TableCell sx={{ py: 1.6 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              {sub.verdict === 'Accepted' ? (
                                <CheckCircleRoundedIcon sx={{ fontSize: 16, color: '#16A34A' }} />
                              ) : (
                                <CancelRoundedIcon sx={{ fontSize: 16, color: '#EF4444' }} />
                              )}
                              <Typography
                                sx={{
                                  fontSize: '0.8rem',
                                  fontWeight: 700,
                                  color: sub.verdict === 'Accepted' ? '#16A34A' : '#EF4444',
                                }}
                              >
                                {sub.verdict}
                              </Typography>
                            </Box>
                          </TableCell>

                          <TableCell sx={{ py: 1.6, fontFamily: 'monospace', fontSize: '0.78rem', color: '#475569' }}>
                            {sub.runtimeMs} ms
                          </TableCell>

                          <TableCell sx={{ py: 1.6, fontFamily: 'monospace', fontSize: '0.78rem', color: '#475569' }}>
                            {sub.memoryKb} KB
                          </TableCell>

                          <TableCell sx={{ py: 1.6, fontSize: '0.76rem', color: '#64748B' }}>
                            {sub.submittedAt}
                          </TableCell>

                          <TableCell align="right" sx={{ pr: 3, py: 1.6 }}>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => setViewCodeModal(sub)}
                              sx={{
                                textTransform: 'none',
                                fontWeight: 700,
                                fontSize: '0.74rem',
                                color: '#2563EB',
                                borderColor: '#DBEAFE',
                                bgcolor: '#EFF6FF',
                                borderRadius: '6px',
                                px: 1.25,
                                py: 0.35,
                                '&:hover': { bgcolor: '#DBEAFE', borderColor: '#93C5FD' },
                              }}
                            >
                              View Code
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>

              {/* Submissions Pagination */}
              <PaginationToolbar
                totalEntries={filteredSubmissions.length}
                currentPage={subPage}
                rowsPerPage={subRowsPerPage}
                onPageChange={setSubPage}
                onRowsPerPageChange={setSubRowsPerPage}
                itemLabel="submissions"
                rowsOptions={[5, 10, 25, 50]}
              />
            </Box>
          )}

          {/* TAB 1: Enrolled Courses & Coding Labs */}
          {activeTab === 1 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Courses Filter bar */}
              <Card elevation={0} sx={{ p: 2, px: 2.5, borderRadius: '14px', bgcolor: '#FFFFFF', border: `1px solid ${borderColor}`, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                <TextField
                  size="small"
                  placeholder="Search course title, code, instructor..."
                  value={courseSearch}
                  onChange={(e) => {
                    setCourseSearch(e.target.value);
                    setCoursePage(0);
                  }}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: '#64748B', fontSize: 18 }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{
                    minWidth: { xs: '100%', sm: 300 },
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                      bgcolor: '#F8FAFC',
                      fontSize: '0.84rem',
                      height: 36,
                      '& fieldset': { borderColor: '#E2E8F0' },
                    },
                  }}
                />

                <Typography sx={{ fontSize: '0.82rem', color: '#64748B' }}>
                  Showing <strong style={{ color: '#0F172A' }}>{filteredCourses.length}</strong> enrolled tracks
                </Typography>
              </Card>

              {/* Courses Table */}
              <Card elevation={0} sx={{ borderRadius: '16px', bgcolor: '#FFFFFF', border: `1px solid ${borderColor}`, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                <TableContainer>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                      <TableRow>
                        <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', pl: 3, py: 1.5 }}>TRACK TITLE & CODE</TableCell>
                        <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5 }}>LEVEL</TableCell>
                        <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5 }}>MODULES COMPLETED</TableCell>
                        <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5, minWidth: 200 }}>CURRICULUM PROGRESS</TableCell>
                        <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5 }}>INSTRUCTOR</TableCell>
                        <TableCell align="right" sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', pr: 3, py: 1.5 }}>STATUS</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedCourses.map((c) => (
                        <TableRow key={c.id} hover sx={{ '& td': { borderBottom: '1px solid #F1F5F9' } }}>
                          <TableCell sx={{ pl: 3, py: 1.75 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                              <Box sx={{ width: 34, height: 34, borderRadius: '8px', bgcolor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <MenuBookRoundedIcon sx={{ fontSize: 18 }} />
                              </Box>
                              <Box>
                                <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A' }}>{c.title}</Typography>
                                <Typography sx={{ fontSize: '0.72rem', color: '#64748B', fontFamily: 'monospace' }}>{c.code}</Typography>
                              </Box>
                            </Box>
                          </TableCell>

                          <TableCell sx={{ py: 1.75 }}>
                            <Chip label={c.level} size="small" sx={{ height: 22, fontSize: '0.7rem', fontWeight: 700, bgcolor: '#EFF6FF', color: '#2563EB', borderRadius: '5px' }} />
                          </TableCell>

                          <TableCell sx={{ py: 1.75 }}>
                            <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>
                              {c.modulesCompleted} / {c.totalModules} Modules
                            </Typography>
                          </TableCell>

                          <TableCell sx={{ py: 1.75 }}>
                            <Box sx={{ minWidth: 160 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                <Typography sx={{ fontSize: '0.76rem', fontWeight: 700, color: '#0F172A' }}>
                                  {c.progressPct}% Complete
                                </Typography>
                              </Box>
                              <LinearProgress
                                variant="determinate"
                                value={c.progressPct}
                                sx={{ height: 5, borderRadius: 3, bgcolor: '#E2E8F0', '& .MuiLinearProgress-bar': { bgcolor: c.progressPct === 100 ? '#10B981' : '#2563EB', borderRadius: 3 } }}
                              />
                            </Box>
                          </TableCell>

                          <TableCell sx={{ py: 1.75 }}>
                            <Typography sx={{ fontSize: '0.84rem', fontWeight: 600, color: '#334155' }}>
                              {c.instructor}
                            </Typography>
                          </TableCell>

                          <TableCell align="right" sx={{ pr: 3, py: 1.75 }}>
                            <Chip
                              label={c.status}
                              size="small"
                              sx={{
                                height: 22,
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                bgcolor: c.status === 'Completed' ? '#ECFDF5' : '#EFF6FF',
                                color: c.status === 'Completed' ? '#059669' : '#2563EB',
                                border: c.status === 'Completed' ? '1px solid #A7F3D0' : '1px solid #DBEAFE',
                                borderRadius: '5px',
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>

              {/* Courses Pagination */}
              <PaginationToolbar
                totalEntries={filteredCourses.length}
                currentPage={coursePage}
                rowsPerPage={courseRowsPerPage}
                onPageChange={setCoursePage}
                onRowsPerPageChange={setCourseRowsPerPage}
                itemLabel="courses"
                rowsOptions={[5, 10, 20]}
              />
            </Box>
          )}

          {/* TAB 2: Competitive Contests & Rating History */}
          {activeTab === 2 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Contest Filter bar */}
              <Card elevation={0} sx={{ p: 2, px: 2.5, borderRadius: '14px', bgcolor: '#FFFFFF', border: `1px solid ${borderColor}`, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                <TextField
                  size="small"
                  placeholder="Search contest title..."
                  value={contestSearch}
                  onChange={(e) => {
                    setContestSearch(e.target.value);
                    setContestPage(0);
                  }}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: '#64748B', fontSize: 18 }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{
                    minWidth: { xs: '100%', sm: 300 },
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                      bgcolor: '#F8FAFC',
                      fontSize: '0.84rem',
                      height: 36,
                      '& fieldset': { borderColor: '#E2E8F0' },
                    },
                  }}
                />

                <Typography sx={{ fontSize: '0.82rem', color: '#64748B' }}>
                  Showing <strong style={{ color: '#0F172A' }}>{filteredContests.length}</strong> contested matches
                </Typography>
              </Card>

              {/* Contest Table */}
              <Card elevation={0} sx={{ borderRadius: '16px', bgcolor: '#FFFFFF', border: `1px solid ${borderColor}`, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                <TableContainer>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                      <TableRow>
                        <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', pl: 3, py: 1.5 }}>CONTEST NAME</TableCell>
                        <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5 }}>DATE</TableCell>
                        <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5 }}>RANK SECURED</TableCell>
                        <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5 }}>SOLVED IN MATCH</TableCell>
                        <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5 }}>PENALTY TIME</TableCell>
                        <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5 }}>RATING DELTA</TableCell>
                        <TableCell align="right" sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', pr: 3, py: 1.5 }}>NEW RATING</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedContests.map((cnt) => (
                        <TableRow key={cnt.id} hover sx={{ '& td': { borderBottom: '1px solid #F1F5F9' } }}>
                          <TableCell sx={{ pl: 3, py: 1.75 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                              <Box sx={{ width: 34, height: 34, borderRadius: '8px', bgcolor: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <EmojiEventsRoundedIcon sx={{ fontSize: 18 }} />
                              </Box>
                              <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A' }}>
                                {cnt.contestName}
                              </Typography>
                            </Box>
                          </TableCell>

                          <TableCell sx={{ py: 1.75, fontSize: '0.8rem', color: '#64748B' }}>
                            {cnt.contestDate}
                          </TableCell>

                          <TableCell sx={{ py: 1.75 }}>
                            <Typography sx={{ fontSize: '0.84rem', fontWeight: 800, color: '#0F172A' }}>
                              #{cnt.rank}{' '}
                              <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 500 }}>/ {cnt.totalParticipants}</span>
                            </Typography>
                          </TableCell>

                          <TableCell sx={{ py: 1.75 }}>
                            <Chip label={`${cnt.problemsSolved} Solved`} size="small" sx={{ height: 22, fontSize: '0.72rem', fontWeight: 700, bgcolor: '#ECFDF5', color: '#059669', borderRadius: '5px' }} />
                          </TableCell>

                          <TableCell sx={{ py: 1.75, fontFamily: 'monospace', fontSize: '0.8rem', color: '#475569' }}>
                            {cnt.penaltyTime}
                          </TableCell>

                          <TableCell sx={{ py: 1.75 }}>
                            <Typography
                              sx={{
                                fontSize: '0.84rem',
                                fontWeight: 800,
                                color: cnt.ratingDelta >= 0 ? '#16A34A' : '#DC2626',
                              }}
                            >
                              {cnt.ratingDelta >= 0 ? `+${cnt.ratingDelta}` : cnt.ratingDelta}
                            </Typography>
                          </TableCell>

                          <TableCell align="right" sx={{ pr: 3, py: 1.75 }}>
                            <Typography sx={{ fontSize: '0.9rem', fontWeight: 900, color: '#0F172A' }}>
                              {cnt.newRating}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>

              {/* Contests Pagination */}
              <PaginationToolbar
                totalEntries={filteredContests.length}
                currentPage={contestPage}
                rowsPerPage={contestRowsPerPage}
                onPageChange={setContestPage}
                onRowsPerPageChange={setContestRowsPerPage}
                itemLabel="contests"
                rowsOptions={[5, 10, 20]}
              />
            </Box>
          )}

          {/* TAB 3: Problem Solving by Topic / Category */}
          {activeTab === 3 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Topic Filter bar */}
              <Card elevation={0} sx={{ p: 2, px: 2.5, borderRadius: '14px', bgcolor: '#FFFFFF', border: `1px solid ${borderColor}`, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                <TextField
                  size="small"
                  placeholder="Search topic domain..."
                  value={topicSearch}
                  onChange={(e) => {
                    setTopicSearch(e.target.value);
                    setTopicPage(0);
                  }}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: '#64748B', fontSize: 18 }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{
                    minWidth: { xs: '100%', sm: 300 },
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                      bgcolor: '#F8FAFC',
                      fontSize: '0.84rem',
                      height: 36,
                      '& fieldset': { borderColor: '#E2E8F0' },
                    },
                  }}
                />

                <Typography sx={{ fontSize: '0.82rem', color: '#64748B' }}>
                  Showing <strong style={{ color: '#0F172A' }}>{filteredTopics.length}</strong> skill domains
                </Typography>
              </Card>

              {/* Topics Table */}
              <Card elevation={0} sx={{ borderRadius: '16px', bgcolor: '#FFFFFF', border: `1px solid ${borderColor}`, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                <TableContainer>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                      <TableRow>
                        <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', pl: 3, py: 1.5 }}>TOPIC DOMAIN</TableCell>
                        <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5 }}>SOLVED COUNT</TableCell>
                        <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5, minWidth: 200 }}>CATALOG COMPLETION</TableCell>
                        <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5 }}>ACCURACY</TableCell>
                        <TableCell align="right" sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', pr: 3, py: 1.5 }}>MASTERY LEVEL</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedTopics.map((top) => {
                        const pct = Math.round((top.solvedCount / top.totalAvailable) * 100);

                        return (
                          <TableRow key={top.id} hover sx={{ '& td': { borderBottom: '1px solid #F1F5F9' } }}>
                            <TableCell sx={{ pl: 3, py: 1.75 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                                <Box sx={{ width: 34, height: 34, borderRadius: '8px', bgcolor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <CategoryRoundedIcon sx={{ fontSize: 18 }} />
                                </Box>
                                <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A' }}>
                                  {top.topicName}
                                </Typography>
                              </Box>
                            </TableCell>

                            <TableCell sx={{ py: 1.75 }}>
                              <Typography sx={{ fontSize: '0.86rem', fontWeight: 800, color: '#0F172A' }}>
                                {top.solvedCount}{' '}
                                <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 500 }}>/ {top.totalAvailable}</span>
                              </Typography>
                            </TableCell>

                            <TableCell sx={{ py: 1.75 }}>
                              <Box sx={{ minWidth: 160 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                  <Typography sx={{ fontSize: '0.76rem', fontWeight: 700, color: '#0F172A' }}>
                                    {pct}% Solved
                                  </Typography>
                                </Box>
                                <LinearProgress
                                  variant="determinate"
                                  value={pct}
                                  sx={{ height: 5, borderRadius: 3, bgcolor: '#E2E8F0', '& .MuiLinearProgress-bar': { bgcolor: '#2563EB', borderRadius: 3 } }}
                                />
                              </Box>
                            </TableCell>

                            <TableCell sx={{ py: 1.75 }}>
                              <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#059669' }}>
                                {top.accuracy}
                              </Typography>
                            </TableCell>

                            <TableCell align="right" sx={{ pr: 3, py: 1.75 }}>
                              <Chip
                                label={top.levelMastery}
                                size="small"
                                sx={{
                                  height: 22,
                                  fontSize: '0.7rem',
                                  fontWeight: 700,
                                  bgcolor: top.levelMastery === 'Master' ? '#FEF2F2' : top.levelMastery === 'Proficient' ? '#EFF6FF' : '#F1F5F9',
                                  color: top.levelMastery === 'Master' ? '#DC2626' : top.levelMastery === 'Proficient' ? '#2563EB' : '#475569',
                                  borderRadius: '5px',
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>

              {/* Topics Pagination */}
              <PaginationToolbar
                totalEntries={filteredTopics.length}
                currentPage={topicPage}
                rowsPerPage={topicRowsPerPage}
                onPageChange={setTopicPage}
                onRowsPerPageChange={setTopicRowsPerPage}
                itemLabel="topics"
                rowsOptions={[5, 10, 20]}
              />
            </Box>
          )}

          {/* TAB 4: Badges & Credentials Table */}
          {activeTab === 4 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Badges Filter bar */}
              <Card elevation={0} sx={{ p: 2, px: 2.5, borderRadius: '14px', bgcolor: '#FFFFFF', border: `1px solid ${borderColor}`, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                <TextField
                  size="small"
                  placeholder="Search credentials & badges..."
                  value={badgeSearch}
                  onChange={(e) => {
                    setBadgeSearch(e.target.value);
                    setBadgePage(0);
                  }}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: '#64748B', fontSize: 18 }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{
                    minWidth: { xs: '100%', sm: 300 },
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                      bgcolor: '#F8FAFC',
                      fontSize: '0.84rem',
                      height: 36,
                      '& fieldset': { borderColor: '#E2E8F0' },
                    },
                  }}
                />

                <Typography sx={{ fontSize: '0.82rem', color: '#64748B' }}>
                  Showing <strong style={{ color: '#0F172A' }}>{filteredBadges.length}</strong> verified credentials
                </Typography>
              </Card>

              {/* Badges Table */}
              <Card elevation={0} sx={{ borderRadius: '16px', bgcolor: '#FFFFFF', border: `1px solid ${borderColor}`, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                <TableContainer>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                      <TableRow>
                        <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', pl: 3, py: 1.5 }}>CREDENTIAL / BADGE</TableCell>
                        <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5 }}>CATEGORY</TableCell>
                        <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5 }}>ISSUER</TableCell>
                        <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5 }}>ISSUE DATE</TableCell>
                        <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5 }}>CREDENTIAL ID</TableCell>
                        <TableCell align="right" sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', pr: 3, py: 1.5 }}>STATUS</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedBadges.map((b) => (
                        <TableRow key={b.id} hover sx={{ '& td': { borderBottom: '1px solid #F1F5F9' } }}>
                          <TableCell sx={{ pl: 3, py: 1.75 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                              <Box sx={{ width: 34, height: 34, borderRadius: '8px', bgcolor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <MilitaryTechRoundedIcon sx={{ fontSize: 18 }} />
                              </Box>
                              <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A' }}>
                                {b.title}
                              </Typography>
                            </Box>
                          </TableCell>

                          <TableCell sx={{ py: 1.75 }}>
                            <Chip label={b.category} size="small" sx={{ height: 22, fontSize: '0.7rem', fontWeight: 700, bgcolor: '#F1F5F9', color: '#475569', borderRadius: '5px' }} />
                          </TableCell>

                          <TableCell sx={{ py: 1.75, fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>
                            {b.issuer}
                          </TableCell>

                          <TableCell sx={{ py: 1.75, fontSize: '0.78rem', color: '#64748B' }}>
                            {b.issueDate}
                          </TableCell>

                          <TableCell sx={{ py: 1.75, fontFamily: 'monospace', fontSize: '0.76rem', color: '#475569' }}>
                            {b.credentialId}
                          </TableCell>

                          <TableCell align="right" sx={{ pr: 3, py: 1.75 }}>
                            <Chip
                              icon={<CheckCircleRoundedIcon sx={{ fontSize: 14 }} />}
                              label="Verified"
                              size="small"
                              sx={{ height: 22, fontSize: '0.7rem', fontWeight: 700, bgcolor: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0', borderRadius: '5px' }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>

              {/* Badges Pagination */}
              <PaginationToolbar
                totalEntries={filteredBadges.length}
                currentPage={badgePage}
                rowsPerPage={badgeRowsPerPage}
                onPageChange={setBadgePage}
                onRowsPerPageChange={setBadgeRowsPerPage}
                itemLabel="credentials"
                rowsOptions={[5, 10, 20]}
              />
            </Box>
          )}
          </>
          )}
        </Box>
      </Box>

      {/* View Code Snippet Modal Dialog */}
      <Dialog
        open={Boolean(viewCodeModal)}
        onClose={() => setViewCodeModal(null)}
        slotProps={{
          paper: {
            sx: { borderRadius: '18px', width: '100%', maxWidth: 640, p: 1 },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: '1.15rem', color: '#0F172A', display: 'flex', alignItems: 'center', gap: 1 }}>
          <TerminalRoundedIcon sx={{ color: '#2563EB', fontSize: 22 }} />
          <span>{viewCodeModal?.problemTitle}</span>
          <Chip label={viewCodeModal?.language} size="small" sx={{ ml: 'auto', fontWeight: 700 }} />
        </DialogTitle>
        <DialogContent sx={{ px: 3, pt: '24px !important', pb: 2.5 }}>
          <Box sx={{ p: 2, bgcolor: '#0F172A', color: '#F8FAFC', borderRadius: '10px', fontFamily: 'monospace', fontSize: '0.82rem', overflowX: 'auto' }}>
            <pre style={{ margin: 0 }}>{viewCodeModal?.codeSnippet}</pre>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
            <Typography sx={{ fontSize: '0.78rem', color: '#64748B' }}>
              Verdict: <strong style={{ color: viewCodeModal?.verdict === 'Accepted' ? '#16A34A' : '#EF4444' }}>{viewCodeModal?.verdict}</strong>
            </Typography>
            <Typography sx={{ fontSize: '0.78rem', color: '#64748B' }}>
              Runtime: <strong>{viewCodeModal?.runtimeMs} ms</strong> • Memory: <strong>{viewCodeModal?.memoryKb} KB</strong>
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setViewCodeModal(null)} sx={{ textTransform: 'none', color: '#2563EB', fontWeight: 700 }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
