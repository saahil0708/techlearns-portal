'use client';

import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Chip,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Alert,
  Tooltip,
  LinearProgress,
  Tabs,
  Tab,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import TableChartRoundedIcon from '@mui/icons-material/TableChartRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import FilterAltOffRoundedIcon from '@mui/icons-material/FilterAltOffRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import AutoStoriesRoundedIcon from '@mui/icons-material/AutoStoriesRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import FirstPageRoundedIcon from '@mui/icons-material/FirstPageRounded';
import LastPageRoundedIcon from '@mui/icons-material/LastPageRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import WhatshotRoundedIcon from '@mui/icons-material/WhatshotRounded';

import dynamic from 'next/dynamic';
import CurvedSidebar from '@/components/superadmin/layout/CurvedSidebar';
import Navbar from '@/components/superadmin/layout/Navbar';
import BulkActionBar from '@/components/superadmin/shared/BulkActionBar';
import { MuiChartLoader, MuiCenterLoader } from '@/components/shared/MuiLoadingFallback';

const AnalyticsChartsSection = dynamic(
  () => import('@/components/superadmin/analytics/AnalyticsChartsSection'),
  { loading: () => <MuiChartLoader height={400} />, ssr: false }
);

const AnalyticsDrilldownDrawer = dynamic(
  () => import('@/components/superadmin/analytics/AnalyticsDrilldownDrawer'),
  { loading: () => null }
);
import { FluidArrowRight } from '@/utils/fluid_arrow';
import type {
  AcademicKPIStats,
  CollegeBenchmarkEntity,
  DSATopicMasteryEntity,
  ContestPerformanceEntity,
  LanguageSubmissionEntity,
  AnyAnalyticsRow,
} from '@/types/analytics';

interface AnalyticsClientProps {
  stats: AcademicKPIStats;
  colleges: CollegeBenchmarkEntity[];
  topics: DSATopicMasteryEntity[];
  contests: ContestPerformanceEntity[];
  languages: LanguageSubmissionEntity[];
}

export default function AnalyticsClient({
  stats,
  colleges,
  topics,
  contests,
  languages,
}: AnalyticsClientProps) {
  // State
  const [activeTab, setActiveTab] = useState<number>(0); // 0: Colleges, 1: DSA Topics, 2: Contests, 3: Languages
  const [isTabLoading, setIsTabLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [tierFilter, setTierFilter] = useState<string>('ALL');
  
  // Pagination State
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleTabChange = (_: any, newTab: number) => {
    if (newTab === activeTab) return;
    setIsTabLoading(true);
    setActiveTab(newTab);
    setPage(0);
    setSelectedIds([]);
    setTimeout(() => {
      setIsTabLoading(false);
    }, 180);
  };

  // Quick Peek Drawer
  const [peekRow, setPeekRow] = useState<AnyAnalyticsRow | null>(null);

  // Export Menu
  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);
  const isExportOpen = Boolean(exportAnchorEl);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const primaryBlue = '#2563EB';
  const borderColor = '#E2E8F0';

  // Filtered Colleges
  const filteredColleges = useMemo(() => {
    return colleges.filter((c) => {
      if (tierFilter !== 'ALL' && c.tier !== tierFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          c.code.toLowerCase().includes(q) ||
          c.topCoderName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [colleges, tierFilter, searchQuery]);

  // Filtered Topics
  const filteredTopics = useMemo(() => {
    return topics.filter((t) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          t.name.toLowerCase().includes(q) ||
          t.topicCode.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.primaryStumblingBlock.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [topics, searchQuery]);

  // Filtered Contests
  const filteredContests = useMemo(() => {
    return contests.filter((ct) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          ct.title.toLowerCase().includes(q) ||
          ct.contestCode.toLowerCase().includes(q) ||
          ct.format.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [contests, searchQuery]);

  // Filtered Languages
  const filteredLanguages = useMemo(() => {
    return languages.filter((l) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          l.language.toLowerCase().includes(q) ||
          l.primaryErrorCode.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [languages, searchQuery]);

  // Active items count based on tab
  const currentTotal = 
    activeTab === 0 ? filteredColleges.length :
    activeTab === 1 ? filteredTopics.length :
    activeTab === 2 ? filteredContests.length :
    filteredLanguages.length;

  const totalPages = Math.ceil(currentTotal / rowsPerPage) || 1;

  // Multi-select handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      if (activeTab === 0) setSelectedIds(filteredColleges.map((c) => c.id));
      if (activeTab === 1) setSelectedIds(filteredTopics.map((t) => t.id));
      if (activeTab === 2) setSelectedIds(filteredContests.map((ct) => ct.id));
      if (activeTab === 3) setSelectedIds(filteredLanguages.map((l) => l.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const isAllSelected = currentTotal > 0 && selectedIds.length === currentTotal;
  const isSomeSelected = selectedIds.length > 0 && selectedIds.length < currentTotal;

  // Export handlers
  const handleExportCSV = () => {
    setExportAnchorEl(null);
    let rows: any[] = [];
    if (activeTab === 0) {
      rows = filteredColleges.map((c) => ({
        Code: c.code,
        College: c.name,
        Tier: c.tier,
        Active_Students: c.activeStudents,
        Problems_Solved: c.problemsSolved,
        Placement_Ready_Rate: `${c.placementReadyPercent}%`,
        Avg_Rating: c.avgContestRating,
        Top_Performer: c.topCoderName,
      }));
    } else if (activeTab === 1) {
      rows = filteredTopics.map((t) => ({
        Code: t.topicCode,
        Topic: t.name,
        Category: t.category,
        Attempts: t.studentAttempts,
        Solves: t.successfulSolves,
        Pass_Rate: `${t.passRate}%`,
        Friction_Level: t.frictionLevel,
        Identified_Friction: t.primaryStumblingBlock,
      }));
    } else if (activeTab === 2) {
      rows = filteredContests.map((ct) => ({
        Code: ct.contestCode,
        Title: ct.title,
        Format: ct.format,
        Turnout_Rate: `${ct.turnoutPercent}%`,
        Avg_Score: ct.avgScore,
        First_Solve: ct.timeToFirstSolve,
        Plagiarism_Suspects: ct.plagiarismSuspectCount,
      }));
    } else {
      rows = filteredLanguages.map((l) => ({
        Language: l.language,
        Share: `${l.sharePercent}%`,
        Pass_Rate: `${l.passRate}%`,
        Common_Error: l.primaryErrorCode,
        Avg_Exec_ms: l.avgExecutionTimeMs,
      }));
    }

    if (rows.length === 0) return;
    const headers = Object.keys(rows[0]).join(',');
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows.map((r) => Object.values(r).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `codeplatform_analytics_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setToastMessage(`Exported ${rows.length} analytics records as CSV.`);
  };

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
      <CurvedSidebar />

      {/* Main Content Area */}
      <Box component="main" sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Unified Layout Container */}
        <Box
          sx={{
            maxWidth: 1400,
            width: '100%',
            mx: 'auto',
            px: { xs: 3, md: 5 },
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            pb: { xs: 4, md: 6 },
          }}
        >
          {/* Top Navbar */}
          <Navbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

          {/* Page Header & Breadcrumb */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748B' }}>
                  Academic Governance
                </Typography>
                <Typography sx={{ fontSize: '0.8rem', color: '#94A3B8' }}>/</Typography>
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: primaryBlue }}>
                  Student Mastery & Institutional Benchmarks
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
                Academic & Competitive Intelligence
              </Typography>
              <Typography sx={{ fontSize: '0.88rem', color: '#64748B', mt: 0.25 }}>
                Student problem-solving velocity, DSA topic weakness heatmaps, college placement benchmarks, and contest outcomes.
              </Typography>
            </Box>

            {/* Quick Export Actions */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Button
                variant="outlined"
                onClick={(e) => setExportAnchorEl(e.currentTarget)}
                startIcon={<FileDownloadRoundedIcon sx={{ fontSize: 18 }} />}
                sx={{
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  color: '#334155',
                  borderColor: '#CBD5E1',
                  bgcolor: '#FFFFFF',
                  px: 2,
                  py: 0.85,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                  '&:hover': { bgcolor: '#F1F5F9', borderColor: '#94A3B8' },
                }}
              >
                Export Report
              </Button>

              <Menu
                anchorEl={exportAnchorEl}
                open={isExportOpen}
                onClose={() => setExportAnchorEl(null)}
                slotProps={{
                  paper: {
                    sx: {
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
                      border: '1px solid #E2E8F0',
                      minWidth: 200,
                      p: 0.5,
                    },
                  },
                }}
              >
                <MenuItem onClick={handleExportCSV} sx={{ borderRadius: '8px', py: 1 }}>
                  <ListItemIcon>
                    <TableChartRoundedIcon fontSize="small" sx={{ color: '#059669' }} />
                  </ListItemIcon>
                  <ListItemText primary={<Typography sx={{ fontSize: '0.84rem', fontWeight: 600 }}>Download CSV (.csv)</Typography>} />
                </MenuItem>
              </Menu>
            </Box>
          </Box>

          {/* 4 Academic KPI Top Cards */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' }, gap: 2.25 }}>
            {/* 1. Active Coders Today */}
            <Card elevation={0} sx={{ p: 2.5, borderRadius: '16px', bgcolor: '#FFFFFF', border: `1px solid ${borderColor}`, boxShadow: '0 4px 20px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: 1.25 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Active Coders Today
                </Typography>
                <Box sx={{ width: 34, height: 34, borderRadius: '8px', bgcolor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TrendingUpRoundedIcon sx={{ fontSize: 18 }} />
                </Box>
              </Box>
              <Typography sx={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>
                {stats.activeCodersToday.toLocaleString()}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Chip size="small" label={stats.activeCodersGrowth} sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700, bgcolor: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0', borderRadius: '5px' }} />
                <Typography sx={{ fontSize: '0.72rem', color: '#64748B' }}>across 32 universities</Typography>
              </Box>
            </Card>

            {/* 2. Total Problems Solved */}
            <Card elevation={0} sx={{ p: 2.5, borderRadius: '16px', bgcolor: '#FFFFFF', border: `1px solid ${borderColor}`, boxShadow: '0 4px 20px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: 1.25 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Total Problems Solved
                </Typography>
                <Box sx={{ width: 34, height: 34, borderRadius: '8px', bgcolor: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircleRoundedIcon sx={{ fontSize: 18 }} />
                </Box>
              </Box>
              <Typography sx={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>
                {stats.totalProblemsSolved.toLocaleString()}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Chip size="small" label={stats.solvedGrowth} sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700, bgcolor: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE', borderRadius: '5px' }} />
                <Typography sx={{ fontSize: '0.72rem', color: '#64748B' }}>avg 32.5 solves/student</Typography>
              </Box>
            </Card>

            {/* 3. Placement Readiness Rate */}
            <Card elevation={0} sx={{ p: 2.5, borderRadius: '16px', bgcolor: '#FFFFFF', border: `1px solid ${borderColor}`, boxShadow: '0 4px 20px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: 1.25 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Placement Ready Coders
                </Typography>
                <Box sx={{ width: 34, height: 34, borderRadius: '8px', bgcolor: '#FAF5FF', color: '#9333EA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <SchoolRoundedIcon sx={{ fontSize: 18 }} />
                </Box>
              </Box>
              <Typography sx={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>
                {stats.placementReadinessRate}%
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Chip size="small" label={stats.placementReadinessGrowth} sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700, bgcolor: '#FAF5FF', color: '#9333EA', border: '1px solid #F3E8FF', borderRadius: '5px' }} />
                <Typography sx={{ fontSize: '0.72rem', color: '#64748B' }}>100+ problem milestone</Typography>
              </Box>
            </Card>

            {/* 4. Avg Contest Score */}
            <Card elevation={0} sx={{ p: 2.5, borderRadius: '16px', bgcolor: '#FFFFFF', border: `1px solid ${borderColor}`, boxShadow: '0 4px 20px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: 1.25 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Avg Contest Score
                </Typography>
                <Box sx={{ width: 34, height: 34, borderRadius: '8px', bgcolor: '#FFFBEB', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <EmojiEventsRoundedIcon sx={{ fontSize: 18 }} />
                </Box>
              </Box>
              <Typography sx={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>
                {stats.avgContestScore} <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#64748B' }}>/ 500</span>
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Chip size="small" label={`Top: ${stats.topPerformingCollege}`} sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700, bgcolor: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0', borderRadius: '5px' }} />
              </Box>
            </Card>
          </Box>

          {/* Visual Analytics Graphs Section */}
          <AnalyticsChartsSection />

          {/* MUI Tabs for Academic Domains */}
          <Box sx={{ borderBottom: `1px solid ${borderColor}`, bgcolor: '#FFFFFF', borderRadius: '14px 14px 0 0', px: 2, pt: 1 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              sx={{
                minHeight: 48,
                '& .MuiTabs-indicator': {
                  backgroundColor: primaryBlue,
                  height: 3,
                  borderRadius: '3px 3px 0 0',
                },
              }}
            >
              <Tab label={`Campus & College Benchmarks (${colleges.length})`} sx={{ textTransform: 'none', fontWeight: activeTab === 0 ? 700 : 500, fontSize: '0.86rem', color: activeTab === 0 ? primaryBlue : '#64748B', minHeight: 48 }} />
              <Tab label={`DSA Topic Mastery & Friction (${topics.length})`} sx={{ textTransform: 'none', fontWeight: activeTab === 1 ? 700 : 500, fontSize: '0.86rem', color: activeTab === 1 ? primaryBlue : '#64748B', minHeight: 48 }} />
              <Tab label={`Contest & Tournament Turnout (${contests.length})`} sx={{ textTransform: 'none', fontWeight: activeTab === 2 ? 700 : 500, fontSize: '0.86rem', color: activeTab === 2 ? primaryBlue : '#64748B', minHeight: 48 }} />
              <Tab label={`Language & Error Distributions (${languages.length})`} sx={{ textTransform: 'none', fontWeight: activeTab === 3 ? 700 : 500, fontSize: '0.86rem', color: activeTab === 3 ? primaryBlue : '#64748B', minHeight: 48 }} />
            </Tabs>
          </Box>

          {/* Search & Filter Bar */}
          <Card
            elevation={0}
            sx={{
              p: 2,
              borderRadius: '0 0 16px 16px',
              bgcolor: '#FFFFFF',
              border: `1px solid ${borderColor}`,
              borderTop: 'none',
              display: 'flex',
              flexDirection: { xs: 'column', lg: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'stretch', lg: 'center' },
              gap: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, maxWidth: { xs: '100%', lg: 420 } }}>
              <TextField
                size="small"
                fullWidth
                placeholder={
                  activeTab === 0 ? 'Search colleges, campus codes, top performers...' :
                  activeTab === 1 ? 'Search DSA topics, algorithms, friction patterns...' :
                  activeTab === 2 ? 'Search contests, tournaments, formats...' :
                  'Search languages, error codes...'
                }
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(0);
                }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchRoundedIcon sx={{ fontSize: 19, color: '#94A3B8' }} />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '10px',
                    bgcolor: '#F8FAFC',
                    fontSize: '0.86rem',
                    '& fieldset': { borderColor: '#E2E8F0' },
                  },
                }}
              />
            </Box>

            {activeTab === 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748B' }}>Tier:</Typography>
                {(['ALL', 'Tier 1', 'Tier 2', 'State University', 'Pilot Partner'] as const).map((tier) => {
                  const isActive = tierFilter === tier;
                  return (
                    <Chip
                      key={tier}
                      label={tier}
                      onClick={() => {
                        setTierFilter(tier);
                        setPage(0);
                      }}
                      size="small"
                      sx={{
                        fontWeight: 700,
                        fontSize: '0.74rem',
                        cursor: 'pointer',
                        bgcolor: isActive ? primaryBlue : '#F1F5F9',
                        color: isActive ? '#FFFFFF' : '#475569',
                        border: `1px solid ${isActive ? primaryBlue : '#E2E8F0'}`,
                      }}
                    />
                  );
                })}
              </Box>
            )}
          </Card>

          {/* Structured List Table (Rule 10 Platform Standard) */}
          <Card
            elevation={0}
            sx={{
              borderRadius: '16px',
              bgcolor: '#FFFFFF',
              border: `1px solid ${borderColor}`,
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
            }}
          >
            {isTabLoading ? (
              <MuiCenterLoader minHeight="380px" message="Loading analytics segment..." />
            ) : (
              <TableContainer>
              <Table size="small">
                {/* 1. Tab 0: Colleges Table Head */}
                {activeTab === 0 && (
                  <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                    <TableRow>
                      <TableCell padding="checkbox" sx={{ pl: 2.5, py: 1.5 }}>
                        <Checkbox size="small" checked={isAllSelected} indeterminate={isSomeSelected} onChange={(e) => handleSelectAll(e.target.checked)} sx={{ color: '#94A3B8', '&.Mui-checked': { color: primaryBlue } }} />
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5, minWidth: 260 }}>COLLEGE & CAMPUS CODE</TableCell>
                      <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5, minWidth: 120 }}>TIER</TableCell>
                      <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5, minWidth: 140 }}>ACTIVE STUDENTS</TableCell>
                      <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5, minWidth: 150 }}>TOTAL SOLVES</TableCell>
                      <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5, minWidth: 180 }}>PLACEMENT READY RATE</TableCell>
                      <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5, minWidth: 150 }}>TOP PERFORMER</TableCell>
                      <TableCell align="right" sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', pr: 3, py: 1.5, minWidth: 140 }}>ACTIONS</TableCell>
                    </TableRow>
                  </TableHead>
                )}

                {/* 2. Tab 1: Topics Table Head */}
                {activeTab === 1 && (
                  <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                    <TableRow>
                      <TableCell padding="checkbox" sx={{ pl: 2.5, py: 1.5 }}>
                        <Checkbox size="small" checked={isAllSelected} indeterminate={isSomeSelected} onChange={(e) => handleSelectAll(e.target.checked)} sx={{ color: '#94A3B8', '&.Mui-checked': { color: primaryBlue } }} />
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5, minWidth: 260 }}>DSA TOPIC & MODULE</TableCell>
                      <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5, minWidth: 140 }}>CATEGORY</TableCell>
                      <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5, minWidth: 140 }}>ATTEMPTS / SOLVES</TableCell>
                      <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5, minWidth: 180 }}>SOLVE PASS RATE</TableCell>
                      <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5, minWidth: 140 }}>FRICTION LEVEL</TableCell>
                      <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5, minWidth: 220 }}>PRIMARY STUMBLING BLOCK</TableCell>
                      <TableCell align="right" sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', pr: 3, py: 1.5, minWidth: 140 }}>ACTIONS</TableCell>
                    </TableRow>
                  </TableHead>
                )}

                {/* 3. Tab 2: Contests Table Head */}
                {activeTab === 2 && (
                  <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                    <TableRow>
                      <TableCell padding="checkbox" sx={{ pl: 2.5, py: 1.5 }}>
                        <Checkbox size="small" checked={isAllSelected} indeterminate={isSomeSelected} onChange={(e) => handleSelectAll(e.target.checked)} sx={{ color: '#94A3B8', '&.Mui-checked': { color: primaryBlue } }} />
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5, minWidth: 260 }}>TOURNAMENT & CODE</TableCell>
                      <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5, minWidth: 120 }}>FORMAT</TableCell>
                      <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5, minWidth: 150 }}>TURNOUT & CODERS</TableCell>
                      <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5, minWidth: 140 }}>AVG / TOP SCORE</TableCell>
                      <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5, minWidth: 140 }}>FIRST SOLVE TIME</TableCell>
                      <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5, minWidth: 140 }}>PLAGIARISM FLAGGED</TableCell>
                      <TableCell align="right" sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', pr: 3, py: 1.5, minWidth: 140 }}>ACTIONS</TableCell>
                    </TableRow>
                  </TableHead>
                )}

                {/* 4. Tab 3: Languages Table Head */}
                {activeTab === 3 && (
                  <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                    <TableRow>
                      <TableCell padding="checkbox" sx={{ pl: 2.5, py: 1.5 }}>
                        <Checkbox size="small" checked={isAllSelected} indeterminate={isSomeSelected} onChange={(e) => handleSelectAll(e.target.checked)} sx={{ color: '#94A3B8', '&.Mui-checked': { color: primaryBlue } }} />
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5, minWidth: 220 }}>LANGUAGE & VERSION</TableCell>
                      <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5, minWidth: 160 }}>TOTAL SUBMISSIONS</TableCell>
                      <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5, minWidth: 180 }}>SUCCESS PASS RATE</TableCell>
                      <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5, minWidth: 240 }}>PRIMARY ERROR CAUSE</TableCell>
                      <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5, minWidth: 140 }}>AVG EXEC RUNTIME</TableCell>
                      <TableCell align="right" sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', pr: 3, py: 1.5, minWidth: 140 }}>ACTIONS</TableCell>
                    </TableRow>
                  </TableHead>
                )}

                <TableBody>
                  {/* Tab 0: Colleges Rows */}
                  {activeTab === 0 &&
                    filteredColleges.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((col) => {
                      const isSelected = selectedIds.includes(col.id);
                      return (
                        <TableRow key={col.id} hover selected={isSelected} sx={{ '& td': { borderBottom: '1px solid #F1F5F9' }, '&.Mui-selected': { bgcolor: '#EFF6FF !important' } }}>
                          <TableCell padding="checkbox" sx={{ pl: 2.5, py: 1.75 }}>
                            <Checkbox size="small" checked={isSelected} onChange={() => handleSelectOne(col.id)} sx={{ color: '#CBD5E1', '&.Mui-checked': { color: primaryBlue } }} />
                          </TableCell>
                          <TableCell sx={{ py: 1.75 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Box sx={{ width: 34, height: 34, borderRadius: '8px', bgcolor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <SchoolRoundedIcon sx={{ fontSize: 18 }} />
                              </Box>
                              <Box>
                                <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A' }}>{col.name}</Typography>
                                <Typography sx={{ fontSize: '0.72rem', color: '#64748B', fontFamily: 'monospace' }}>{col.code}</Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ py: 1.75 }}>
                            <Chip size="small" label={col.tier} sx={{ height: 22, fontSize: '0.72rem', fontWeight: 600, bgcolor: '#F1F5F9', color: '#334155', borderRadius: '5px' }} />
                          </TableCell>
                          <TableCell sx={{ py: 1.75 }}>
                            <Typography sx={{ fontSize: '0.86rem', fontWeight: 700, color: '#0F172A' }}>{col.activeStudents.toLocaleString()}</Typography>
                            <Typography sx={{ fontSize: '0.7rem', color: '#64748B' }}>of {col.totalEnrolled.toLocaleString()} enrolled</Typography>
                          </TableCell>
                          <TableCell sx={{ py: 1.75 }}>
                            <Typography sx={{ fontSize: '0.86rem', fontWeight: 700, color: '#2563EB' }}>{col.problemsSolved.toLocaleString()}</Typography>
                            <Typography sx={{ fontSize: '0.7rem', color: '#64748B' }}>{col.avgSolvesPerStudent} solves/student</Typography>
                          </TableCell>
                          <TableCell sx={{ py: 1.75 }}>
                            <Box sx={{ width: 140 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                <Typography sx={{ fontSize: '0.78rem', fontWeight: 800, color: '#059669' }}>{col.placementReadyPercent}%</Typography>
                                <Typography sx={{ fontSize: '0.68rem', color: '#64748B' }}>Target: 80%</Typography>
                              </Box>
                              <LinearProgress variant="determinate" value={col.placementReadyPercent} sx={{ height: 5, borderRadius: 3, bgcolor: '#E2E8F0', '& .MuiLinearProgress-bar': { bgcolor: '#10B981', borderRadius: 3 } }} />
                            </Box>
                          </TableCell>
                          <TableCell sx={{ py: 1.75 }}>
                            <Typography sx={{ fontSize: '0.84rem', fontWeight: 700, color: '#0F172A' }}>{col.topCoderName}</Typography>
                            <Typography sx={{ fontSize: '0.7rem', color: '#D97706', fontWeight: 600 }}>Rating: {col.avgContestRating}</Typography>
                          </TableCell>
                          <TableCell align="right" sx={{ pr: 3, py: 1.75 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                              <Tooltip title="View Diagnostic Details">
                                <IconButton size="small" onClick={() => setPeekRow({ ...col, rowType: 'college' })} sx={{ color: '#64748B', border: '1px solid #E2E8F0', borderRadius: '8px', '&:hover': { bgcolor: '#EFF6FF', color: primaryBlue } }}>
                                  <VisibilityRoundedIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                              </Tooltip>
                              <Button size="small" variant="outlined" onClick={() => setPeekRow({ ...col, rowType: 'college' })} endIcon={<FluidArrowRight size={14} />} sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.76rem', color: primaryBlue, borderColor: '#DBEAFE', bgcolor: '#EFF6FF', borderRadius: '8px', px: 1.5, py: 0.4 }}>
                                Inspect
                              </Button>
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}

                  {/* Tab 1: Topics Rows */}
                  {activeTab === 1 &&
                    filteredTopics.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((top) => {
                      const isSelected = selectedIds.includes(top.id);
                      return (
                        <TableRow key={top.id} hover selected={isSelected} sx={{ '& td': { borderBottom: '1px solid #F1F5F9' }, '&.Mui-selected': { bgcolor: '#EFF6FF !important' } }}>
                          <TableCell padding="checkbox" sx={{ pl: 2.5, py: 1.75 }}>
                            <Checkbox size="small" checked={isSelected} onChange={() => handleSelectOne(top.id)} sx={{ color: '#CBD5E1', '&.Mui-checked': { color: primaryBlue } }} />
                          </TableCell>
                          <TableCell sx={{ py: 1.75 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Box sx={{ width: 34, height: 34, borderRadius: '8px', bgcolor: top.frictionLevel === 'High Friction' ? '#FEF2F2' : '#EFF6FF', color: top.frictionLevel === 'High Friction' ? '#DC2626' : '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <AutoStoriesRoundedIcon sx={{ fontSize: 18 }} />
                              </Box>
                              <Box>
                                <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A' }}>{top.name}</Typography>
                                <Typography sx={{ fontSize: '0.72rem', color: '#64748B', fontFamily: 'monospace' }}>{top.topicCode} • {top.totalProblems} problems</Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ py: 1.75 }}>
                            <Chip size="small" label={top.category} sx={{ height: 22, fontSize: '0.72rem', fontWeight: 600, bgcolor: '#F1F5F9', color: '#334155', borderRadius: '5px' }} />
                          </TableCell>
                          <TableCell sx={{ py: 1.75 }}>
                            <Typography sx={{ fontSize: '0.86rem', fontWeight: 700, color: '#0F172A' }}>{top.successfulSolves.toLocaleString()} solves</Typography>
                            <Typography sx={{ fontSize: '0.7rem', color: '#64748B' }}>{top.studentAttempts.toLocaleString()} attempts</Typography>
                          </TableCell>
                          <TableCell sx={{ py: 1.75 }}>
                            <Box sx={{ width: 140 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                <Typography sx={{ fontSize: '0.78rem', fontWeight: 800, color: top.passRate < 60 ? '#DC2626' : '#059669' }}>{top.passRate}%</Typography>
                                <Typography sx={{ fontSize: '0.68rem', color: '#64748B' }}>{top.avgAttemptsToSolve} attempts/AC</Typography>
                              </Box>
                              <LinearProgress variant="determinate" value={top.passRate} sx={{ height: 5, borderRadius: 3, bgcolor: '#E2E8F0', '& .MuiLinearProgress-bar': { bgcolor: top.passRate > 75 ? '#10B981' : top.passRate > 55 ? '#F59E0B' : '#EF4444', borderRadius: 3 } }} />
                            </Box>
                          </TableCell>
                          <TableCell sx={{ py: 1.75 }}>
                            <Chip size="small" label={top.frictionLevel} sx={{ height: 22, fontSize: '0.72rem', fontWeight: 700, bgcolor: top.frictionLevel === 'High Friction' ? '#FEF2F2' : top.frictionLevel === 'Moderate' ? '#FFFBEB' : '#ECFDF5', color: top.frictionLevel === 'High Friction' ? '#DC2626' : top.frictionLevel === 'Moderate' ? '#D97706' : '#059669', border: `1px solid ${top.frictionLevel === 'High Friction' ? '#FECACA' : top.frictionLevel === 'Moderate' ? '#FDE68A' : '#A7F3D0'}`, borderRadius: '5px' }} />
                          </TableCell>
                          <TableCell sx={{ py: 1.75 }}>
                            <Typography sx={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.35, maxWidth: 260 }}>{top.primaryStumblingBlock}</Typography>
                          </TableCell>
                          <TableCell align="right" sx={{ pr: 3, py: 1.75 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                              <Tooltip title="View Topic Breakdown">
                                <IconButton size="small" onClick={() => setPeekRow({ ...top, rowType: 'topic' })} sx={{ color: '#64748B', border: '1px solid #E2E8F0', borderRadius: '8px', '&:hover': { bgcolor: '#EFF6FF', color: primaryBlue } }}>
                                  <VisibilityRoundedIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                              </Tooltip>
                              <Button size="small" variant="outlined" onClick={() => setPeekRow({ ...top, rowType: 'topic' })} endIcon={<FluidArrowRight size={14} />} sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.76rem', color: primaryBlue, borderColor: '#DBEAFE', bgcolor: '#EFF6FF', borderRadius: '8px', px: 1.5, py: 0.4 }}>
                                Inspect
                              </Button>
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}

                  {/* Tab 2: Contests Rows */}
                  {activeTab === 2 &&
                    filteredContests.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((ct) => {
                      const isSelected = selectedIds.includes(ct.id);
                      return (
                        <TableRow key={ct.id} hover selected={isSelected} sx={{ '& td': { borderBottom: '1px solid #F1F5F9' }, '&.Mui-selected': { bgcolor: '#EFF6FF !important' } }}>
                          <TableCell padding="checkbox" sx={{ pl: 2.5, py: 1.75 }}>
                            <Checkbox size="small" checked={isSelected} onChange={() => handleSelectOne(ct.id)} sx={{ color: '#CBD5E1', '&.Mui-checked': { color: primaryBlue } }} />
                          </TableCell>
                          <TableCell sx={{ py: 1.75 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Box sx={{ width: 34, height: 34, borderRadius: '8px', bgcolor: '#FFFBEB', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <EmojiEventsRoundedIcon sx={{ fontSize: 18 }} />
                              </Box>
                              <Box>
                                <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A' }}>{ct.title}</Typography>
                                <Typography sx={{ fontSize: '0.72rem', color: '#64748B', fontFamily: 'monospace' }}>{ct.contestCode} • {ct.dateFormatted}</Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ py: 1.75 }}>
                            <Chip size="small" label={ct.format} sx={{ height: 22, fontSize: '0.72rem', fontWeight: 600, bgcolor: '#F1F5F9', color: '#334155', borderRadius: '5px' }} />
                          </TableCell>
                          <TableCell sx={{ py: 1.75 }}>
                            <Typography sx={{ fontSize: '0.86rem', fontWeight: 700, color: '#0F172A' }}>{ct.attendedCount.toLocaleString()} coders</Typography>
                            <Typography sx={{ fontSize: '0.7rem', color: '#059669', fontWeight: 700 }}>{ct.turnoutPercent}% turnout</Typography>
                          </TableCell>
                          <TableCell sx={{ py: 1.75 }}>
                            <Typography sx={{ fontSize: '0.86rem', fontWeight: 700, color: '#2563EB' }}>{ct.avgScore} pts</Typography>
                            <Typography sx={{ fontSize: '0.7rem', color: '#64748B' }}>Top: {ct.topScore} pts</Typography>
                          </TableCell>
                          <TableCell sx={{ py: 1.75 }}>
                            <Typography sx={{ fontSize: '0.84rem', fontWeight: 700, color: '#059669' }}>{ct.timeToFirstSolve}</Typography>
                          </TableCell>
                          <TableCell sx={{ py: 1.75 }}>
                            <Chip size="small" label={`${ct.plagiarismSuspectCount} Flagged`} sx={{ height: 22, fontSize: '0.72rem', fontWeight: 700, bgcolor: ct.plagiarismSuspectCount > 0 ? '#FEF2F2' : '#ECFDF5', color: ct.plagiarismSuspectCount > 0 ? '#DC2626' : '#059669', border: `1px solid ${ct.plagiarismSuspectCount > 0 ? '#FECACA' : '#A7F3D0'}`, borderRadius: '5px' }} />
                          </TableCell>
                          <TableCell align="right" sx={{ pr: 3, py: 1.75 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                              <Tooltip title="View Tournament Scorecard">
                                <IconButton size="small" onClick={() => setPeekRow({ ...ct, rowType: 'contest' })} sx={{ color: '#64748B', border: '1px solid #E2E8F0', borderRadius: '8px', '&:hover': { bgcolor: '#EFF6FF', color: primaryBlue } }}>
                                  <VisibilityRoundedIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                              </Tooltip>
                              <Button size="small" variant="outlined" onClick={() => setPeekRow({ ...ct, rowType: 'contest' })} endIcon={<FluidArrowRight size={14} />} sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.76rem', color: primaryBlue, borderColor: '#DBEAFE', bgcolor: '#EFF6FF', borderRadius: '8px', px: 1.5, py: 0.4 }}>
                                Inspect
                              </Button>
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}

                  {/* Tab 3: Languages Rows */}
                  {activeTab === 3 &&
                    filteredLanguages.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((lang) => {
                      const isSelected = selectedIds.includes(lang.id);
                      return (
                        <TableRow key={lang.id} hover selected={isSelected} sx={{ '& td': { borderBottom: '1px solid #F1F5F9' }, '&.Mui-selected': { bgcolor: '#EFF6FF !important' } }}>
                          <TableCell padding="checkbox" sx={{ pl: 2.5, py: 1.75 }}>
                            <Checkbox size="small" checked={isSelected} onChange={() => handleSelectOne(lang.id)} sx={{ color: '#CBD5E1', '&.Mui-checked': { color: primaryBlue } }} />
                          </TableCell>
                          <TableCell sx={{ py: 1.75 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Box sx={{ width: 34, height: 34, borderRadius: '8px', bgcolor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <CodeRoundedIcon sx={{ fontSize: 18 }} />
                              </Box>
                              <Box>
                                <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A' }}>{lang.language}</Typography>
                                <Typography sx={{ fontSize: '0.72rem', color: '#64748B', fontFamily: 'monospace' }}>{lang.version}</Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ py: 1.75 }}>
                            <Typography sx={{ fontSize: '0.86rem', fontWeight: 700, color: '#0F172A' }}>{lang.submissionsCount.toLocaleString()}</Typography>
                            <Typography sx={{ fontSize: '0.7rem', color: '#9333EA', fontWeight: 700 }}>{lang.sharePercent}% platform share</Typography>
                          </TableCell>
                          <TableCell sx={{ py: 1.75 }}>
                            <Box sx={{ width: 140 }}>
                              <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: '#059669', mb: 0.5 }}>{lang.passRate}% Pass</Typography>
                              <LinearProgress variant="determinate" value={lang.passRate} sx={{ height: 5, borderRadius: 3, bgcolor: '#E2E8F0', '& .MuiLinearProgress-bar': { bgcolor: '#10B981', borderRadius: 3 } }} />
                            </Box>
                          </TableCell>
                          <TableCell sx={{ py: 1.75 }}>
                            <Chip size="small" label={lang.primaryErrorCode} sx={{ height: 22, fontSize: '0.72rem', fontWeight: 700, bgcolor: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', borderRadius: '5px', mb: 0.25 }} />
                            <Typography sx={{ fontSize: '0.72rem', color: '#64748B' }}>{lang.primaryErrorDescription}</Typography>
                          </TableCell>
                          <TableCell sx={{ py: 1.75 }}>
                            <Typography sx={{ fontSize: '0.86rem', fontWeight: 700, color: '#0F172A' }}>{lang.avgExecutionTimeMs} ms</Typography>
                          </TableCell>
                          <TableCell align="right" sx={{ pr: 3, py: 1.75 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                              <Tooltip title="View Compiler Telemetry">
                                <IconButton size="small" onClick={() => setPeekRow({ ...lang, rowType: 'submission' })} sx={{ color: '#64748B', border: '1px solid #E2E8F0', borderRadius: '8px', '&:hover': { bgcolor: '#EFF6FF', color: primaryBlue } }}>
                                  <VisibilityRoundedIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                              </Tooltip>
                              <Button size="small" variant="outlined" onClick={() => setPeekRow({ ...lang, rowType: 'submission' })} endIcon={<FluidArrowRight size={14} />} sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.76rem', color: primaryBlue, borderColor: '#DBEAFE', bgcolor: '#EFF6FF', borderRadius: '8px', px: 1.5, py: 0.4 }}>
                                Inspect
                              </Button>
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </TableContainer>
            )}

            {/* Full-Pill Pagination Footer Toolbar */}
            <Box
              sx={{
                p: '16px 24px',
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 2,
                borderTop: `1px solid ${borderColor}`,
                bgcolor: '#FFFFFF',
              }}
            >
              <Typography sx={{ fontSize: '0.84rem', color: '#64748B' }}>
                Showing{' '}
                <strong style={{ color: '#0F172A' }}>
                  {currentTotal > 0 ? page * rowsPerPage + 1 : 0}
                </strong>{' '}
                to{' '}
                <strong style={{ color: '#0F172A' }}>
                  {Math.min((page + 1) * rowsPerPage, currentTotal)}
                </strong>{' '}
                of <strong style={{ color: '#0F172A' }}>{currentTotal}</strong> records
              </Typography>

              {/* Pill Pagination Capsule */}
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.5,
                  bgcolor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '9999px',
                  p: '3px 8px',
                  boxShadow: '0 1px 4px rgba(0, 0, 0, 0.04)',
                }}
              >
                <IconButton size="small" onClick={() => setPage(0)} disabled={page === 0} sx={{ color: '#64748B', borderRadius: '9999px', p: '4px', '&:hover': { bgcolor: '#F1F5F9', color: '#0F172A' }, '&.Mui-disabled': { color: '#CBD5E1' } }}>
                  <FirstPageRoundedIcon sx={{ fontSize: 18 }} />
                </IconButton>
                <IconButton size="small" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} sx={{ color: '#64748B', borderRadius: '9999px', p: '4px', '&:hover': { bgcolor: '#F1F5F9', color: '#0F172A' }, '&.Mui-disabled': { color: '#CBD5E1' } }}>
                  <ChevronLeftRoundedIcon sx={{ fontSize: 18 }} />
                </IconButton>
                <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', px: 1.25, userSelect: 'none' }}>
                  Page <strong style={{ color: '#0F172A' }}>{page + 1}</strong> of <strong style={{ color: '#0F172A' }}>{totalPages}</strong>
                </Typography>
                <IconButton size="small" onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} sx={{ color: '#64748B', borderRadius: '9999px', p: '4px', '&:hover': { bgcolor: '#F1F5F9', color: '#0F172A' }, '&.Mui-disabled': { color: '#CBD5E1' } }}>
                  <ChevronRightRoundedIcon sx={{ fontSize: 18 }} />
                </IconButton>
                <IconButton size="small" onClick={() => setPage(totalPages - 1)} disabled={page >= totalPages - 1} sx={{ color: '#64748B', borderRadius: '9999px', p: '4px', '&:hover': { bgcolor: '#F1F5F9', color: '#0F172A' }, '&.Mui-disabled': { color: '#CBD5E1' } }}>
                  <LastPageRoundedIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Box>
            </Box>
          </Card>

          {/* Floating Fixed Bottom BulkActionBar */}
          <BulkActionBar
            selectedCount={selectedIds.length}
            onClear={() => setSelectedIds([])}
            itemLabel="Records Selected"
            exportLabel="Export Selected (.csv)"
            onExport={handleExportCSV}
          />

          {/* Quick Peek Diagnostic Drawer */}
          <AnalyticsDrilldownDrawer
            open={Boolean(peekRow)}
            onClose={() => setPeekRow(null)}
            row={peekRow}
          />

          {/* Toast Alert */}
          <Snackbar
            open={Boolean(toastMessage)}
            autoHideDuration={3000}
            onClose={() => setToastMessage(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert onClose={() => setToastMessage(null)} severity="success" sx={{ width: '100%', borderRadius: '10px' }}>
              {toastMessage}
            </Alert>
          </Snackbar>
        </Box>
      </Box>
    </Box>
  );
}
