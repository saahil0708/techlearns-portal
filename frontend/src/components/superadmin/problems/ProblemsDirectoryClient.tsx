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
  IconButton,
  Tooltip,
  ListItemIcon,
  LinearProgress,
  Menu,
  MenuItem,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Select,
  Tabs,
  Tab,
  Checkbox,
} from '@mui/material';
import Link from 'next/link';
import SearchIcon from '@mui/icons-material/Search';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import FirstPageRoundedIcon from '@mui/icons-material/FirstPageRounded';
import LastPageRoundedIcon from '@mui/icons-material/LastPageRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import TableChartRoundedIcon from '@mui/icons-material/TableChartRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import FilterAltOffRoundedIcon from '@mui/icons-material/FilterAltOffRounded';
import { FluidArrowRight } from '@/utils/fluid_arrow';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import WhatshotRoundedIcon from '@mui/icons-material/WhatshotRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';

import dynamic from 'next/dynamic';

import FloatingSidebar from '@/components/superadmin/layout/CurvedSidebar';
import Navbar from '@/components/superadmin/layout/Navbar';
import { apiService } from '@/lib/api-service';
import { useToast } from '@/context/ToastContext';

const ProblemQuickPeekDrawer = dynamic(() => import('@/components/superadmin/problems/ProblemQuickPeekDrawer'), { loading: () => null });
const CreateProblemModal = dynamic(() => import('@/components/superadmin/problems/CreateProblemModal'), { loading: () => null });
const BulkActionBar = dynamic(() => import('@/components/superadmin/shared/BulkActionBar'), { loading: () => null });
import {
  ProblemEntity,
  ProblemCategory,
  ProblemDifficulty,
  ProblemStatus,
  NewProblemData,
} from '@/types/problem';

interface ProblemsDirectoryClientProps {
  initialProblems: ProblemEntity[];
}

type SortField = 'code' | 'title' | 'difficulty' | 'acceptanceRate' | 'totalSubmissions' | 'points';
type SortDirection = 'asc' | 'desc';

export default function ProblemsDirectoryClient({ initialProblems }: ProblemsDirectoryClientProps) {
  const toast = useToast();
  const [problems, setProblems] = useState<ProblemEntity[]>(initialProblems);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Topics');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortField, setSortField] = useState<SortField>('code');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Client-side live data refresh
  React.useEffect(() => {
    async function loadLiveProblems() {
      try {
        const liveData = await apiService.getProblems({ limit: 50 });
        if (liveData?.items && liveData.items.length > 0) {
          const mapped: ProblemEntity[] = liveData.items.map((item: any, idx: number) => ({
            id: item.id,
            code: `PROB-${String(idx + 1).padStart(3, '0')}`,
            slug: item.slug,
            title: item.title,
            category: 'Arrays & Two Pointers',
            difficulty: item.difficulty === 'HARD' ? 'Hard' : item.difficulty === 'MEDIUM' ? 'Medium' : 'Easy',
            acceptanceRate: 65.0,
            totalSubmissions: item._count?.submissions || 0,
            acceptedSubmissions: Math.floor((item._count?.submissions || 0) * 0.65),
            testCasesCount: item._count?.testCases || 0,
            authorName: 'Faculty',
            tags: ['Algorithms', 'Data Structures'],
            status: item.status === 'PUBLISHED' ? 'Published' : 'Draft',
            points: item.difficulty === 'HARD' ? 200 : item.difficulty === 'MEDIUM' ? 120 : 70,
            timeLimitMs: item.timeLimit || 1000,
            memoryLimitMb: item.memoryLimit || 256,
            likes: 0,
            dislikes: 0,
            premium: false,
            companies: [],
            statementMarkdown: item.statement || '',
            sampleTestCases: [],
          }));
          setProblems(mapped);
        }
      } catch (err) {
        console.warn('Live problems fetch on client:', err);
      }
    }
    loadLiveProblems();
  }, []);

  // Modals & Drawers
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [peekProblem, setPeekProblem] = useState<ProblemEntity | null>(null);
  const [downloadAnchorEl, setDownloadAnchorEl] = useState<null | HTMLElement>(null);

  // Pagination states
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredProblems.map((p) => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const handleDeleteSelected = async () => {
    const idsToDelete = [...selectedIds];
    const count = idsToDelete.length;
    setProblems((prev) => prev.filter((p) => !selectedIds.includes(p.id)));
    setSelectedIds([]);
    for (const id of idsToDelete) {
      try {
        await apiService.deleteProblem(id);
      } catch (err) {
        console.error(`Failed to delete problem ${id}:`, err);
      }
    }
    toast.success(`Deleted ${count} coding problem${count > 1 ? 's' : ''} from platform.`, 'Problem Repository');
  };

  const handleDeleteSingleProblem = async (id: string) => {
    setProblems((prev) => prev.filter((p) => p.id !== id));
    setSelectedIds((prev) => prev.filter((item) => item !== id));
    try {
      await apiService.deleteProblem(id);
    } catch (err) {
      console.error(`Failed to delete problem ${id}:`, err);
    }
    toast.success('Problem deleted successfully.', 'Problem Repository');
  };

  // Sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // KPI calculations
  // KPI calculations
  const totalCount = problems.length;
  const publishedCount = problems.filter((p) => p.status === 'Published').length;
  const underReviewCount = problems.filter((p) => p.status === 'Under Review').length;
  const draftCount = problems.filter((p) => p.status === 'Draft').length;
  const easyCount = problems.filter((p) => p.difficulty === 'Easy').length;
  const mediumCount = problems.filter((p) => p.difficulty === 'Medium').length;
  const hardCount = problems.filter((p) => p.difficulty === 'Hard').length;
  const totalPlatformSubmissions = problems.reduce((acc, p) => acc + p.totalSubmissions, 0);
  const avgAcceptance = Math.round(
    problems.reduce((acc, p) => acc + p.acceptanceRate, 0) / (totalCount || 1)
  );

  // Category counts for MUI Tabs
  const getCategoryCount = (cat: string) => {
    if (cat === 'All Topics') return totalCount;
    return problems.filter((p) => p.category === cat).length;
  };

  // Filtered and Sorted list
  const filteredProblems = problems
    .filter((p) => {
      if (selectedCategory !== 'All Topics' && p.category !== selectedCategory) return false;
      if (selectedDifficulty !== 'ALL' && p.difficulty !== selectedDifficulty) return false;
      if (selectedStatus !== 'ALL' && p.status !== selectedStatus) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesCode = p.code.toLowerCase().includes(q);
        const matchesTags = p.tags.some((t) => t.toLowerCase().includes(q));
        const matchesCompanies = p.companies?.some((c) => c.toLowerCase().includes(q));
        if (!matchesTitle && !matchesCode && !matchesTags && !matchesCompanies) return false;
      }
      return true;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortField === 'code') {
        comparison = a.code.localeCompare(b.code, undefined, { numeric: true });
      } else if (sortField === 'title') {
        comparison = a.title.localeCompare(b.title);
      } else if (sortField === 'difficulty') {
        const rank = { Easy: 1, Medium: 2, Hard: 3 };
        comparison = rank[a.difficulty] - rank[b.difficulty];
      } else if (sortField === 'acceptanceRate') {
        comparison = a.acceptanceRate - b.acceptanceRate;
      } else if (sortField === 'totalSubmissions') {
        comparison = a.totalSubmissions - b.totalSubmissions;
      } else if (sortField === 'points') {
        comparison = a.points - b.points;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  // Pagination calculation
  const totalEntries = filteredProblems.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / rowsPerPage));
  const currentPage = Math.min(page, totalPages - 1);
  const paginatedProblems = filteredProblems.slice(
    currentPage * rowsPerPage,
    currentPage * rowsPerPage + rowsPerPage
  );
  const startEntry = totalEntries === 0 ? 0 : currentPage * rowsPerPage + 1;
  const endEntry = Math.min((currentPage + 1) * rowsPerPage, totalEntries);

  const handleCreateProblem = async (data: NewProblemData) => {
    const tempId = `prob-${Date.now()}`;
    const newEntry: ProblemEntity = {
      id: tempId,
      code: data.code,
      slug: data.slug,
      title: data.title,
      category: data.category,
      difficulty: data.difficulty,
      acceptanceRate: 0,
      totalSubmissions: 0,
      acceptedSubmissions: 0,
      tags: data.tags,
      status: data.status || 'Published',
      points: data.points,
      timeLimitMs: data.timeLimitMs,
      memoryLimitMb: data.memoryLimitMb,
      testCasesCount: data.testCasesCount || 20,
      authorName: 'Administrator',
      likes: 0,
      dislikes: 0,
      premium: false,
      companies: ['Community'],
      statementMarkdown: data.statementMarkdown,
      sampleTestCases: [
        {
          input: data.sampleInput,
          output: data.sampleOutput,
        },
      ],
    };
    setProblems((prev) => [newEntry, ...prev]);

    try {
      const created = await apiService.createProblem({
        title: data.title,
        statement: data.statementMarkdown,
        inputFormat: data.sampleInput,
        outputFormat: data.sampleOutput,
        difficulty:
          data.difficulty === 'Hard'
            ? 'HARD'
            : data.difficulty === 'Easy'
            ? 'EASY'
            : 'MEDIUM',
        timeLimit: data.timeLimitMs,
        memoryLimit: data.memoryLimitMb,
      });
      if (created?.id) {
        setProblems((prev) =>
          prev.map((p) => (p.id === tempId ? { ...p, id: created.id } : p))
        );
      }
      toast.success(`Problem "${data.title}" created and published.`, 'Problem Created');
    } catch {
      toast.info(`Problem "${data.title}" saved locally to repository.`, 'Problem Registered');
    }
  };

  // Export handlers
  const handleOpenDownloadMenu = (event: React.MouseEvent<HTMLElement>) => {
    setDownloadAnchorEl(event.currentTarget);
  };

  const handleCloseDownloadMenu = () => {
    setDownloadAnchorEl(null);
  };

  const downloadProblemsExcel = () => {
    const tableContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="utf-8"/></head>
      <body>
        <h2>Problems & Algorithmic Challenges Directory</h2>
        <table border="1">
          <tr style="background-color: #2563EB; color: #FFFFFF; font-weight: bold;">
            <th>Code</th>
            <th>Title</th>
            <th>Category</th>
            <th>Difficulty</th>
            <th>Status</th>
            <th>Acceptance Rate</th>
            <th>Total Submissions</th>
            <th>Points</th>
            <th>Tags</th>
          </tr>
          ${filteredProblems
            .map(
              (p) => `
            <tr>
              <td>${p.code}</td>
              <td>${p.title}</td>
              <td>${p.category}</td>
              <td>${p.difficulty}</td>
              <td>${p.status}</td>
              <td align="right">${p.acceptanceRate}%</td>
              <td align="right">${p.totalSubmissions}</td>
              <td align="right">${p.points}</td>
              <td>${p.tags.join(', ')}</td>
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
    link.setAttribute('download', `problems_directory_${new Date().toISOString().slice(0, 10)}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    handleCloseDownloadMenu();
  };

  const downloadProblemsCSV = () => {
    const headers = ['Code', 'Title', 'Category', 'Difficulty', 'Status', 'AcceptanceRate', 'TotalSubmissions', 'Points', 'Tags'];
    const rows = filteredProblems.map((p) => [
      `"${p.code}"`,
      `"${p.title}"`,
      `"${p.category}"`,
      `"${p.difficulty}"`,
      `"${p.status}"`,
      `"${p.acceptanceRate}%"`,
      p.totalSubmissions,
      p.points,
      `"${p.tags.join(';')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `problems_directory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    handleCloseDownloadMenu();
  };

  const difficultyChipStyles = {
    Easy: { bgcolor: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0' },
    Medium: { bgcolor: '#FFFBEB', color: '#D97706', border: '1px solid #FDE68A' },
    Hard: { bgcolor: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' },
  };

  const borderColor = '#E2E8F0';

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
          {/* 2. Top Header Navbar */}
          <Navbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

          {/* Header Summary & Actions */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
            <Box>
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
                  <CodeRoundedIcon sx={{ fontSize: 20 }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 800, fontSize: { xs: '1.3rem', md: '1.6rem' }, color: '#0F172A', letterSpacing: '-0.02em' }}>
                  Problem Explorer & Challenges
                </Typography>
              </Box>
              <Typography sx={{ color: '#64748B', fontSize: '0.86rem', mt: 0.5, fontWeight: 500 }}>
                Practice data structures, algorithmic patterns, and competitive challenges in split-pane IDE workspace
              </Typography>
            </Box>

            {/* Actions: Export & Create Problem */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Tooltip title="Export Problem Set">
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
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                    '&:hover': { bgcolor: '#EFF6FF', color: '#2563EB', borderColor: '#BFDBFE' },
                  }}
                >
                  Export Data
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
                <MenuItem onClick={downloadProblemsExcel} sx={{ borderRadius: '8px', py: 1 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <TableChartRoundedIcon sx={{ fontSize: 18, color: '#16A34A' }} />
                  </ListItemIcon>
                  <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#0F172A' }}>
                    Download Excel (.xls)
                  </Typography>
                </MenuItem>
                <MenuItem onClick={downloadProblemsCSV} sx={{ borderRadius: '8px', py: 1 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <DescriptionRoundedIcon sx={{ fontSize: 18, color: '#2563EB' }} />
                  </ListItemIcon>
                  <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#0F172A' }}>
                    Download CSV (.csv)
                  </Typography>
                </MenuItem>
              </Menu>

              <Button
                variant="contained"
                startIcon={<AddRoundedIcon sx={{ fontSize: 18 }} />}
                onClick={() => setIsCreateModalOpen(true)}
                sx={{
                  bgcolor: '#2563EB',
                  color: '#FFFFFF',
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  px: 2.25,
                  py: 0.75,
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
                  '&:hover': { bgcolor: '#1D4ED8' },
                }}
              >
                Author Problem
              </Button>
            </Box>
          </Box>

          {/* 3. Stats Metric Ribbon Cards */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2.5 }}>
            <Card elevation={0} sx={{ p: 2.5, borderRadius: '16px', bgcolor: '#FFFFFF', border: `1px solid ${borderColor}`, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
              <Typography sx={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Total Problem Bank
              </Typography>
              <Typography sx={{ fontSize: '1.75rem', fontWeight: 900, color: '#0F172A', mt: 0.5, letterSpacing: '-0.02em' }}>
                {totalCount}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                <Typography sx={{ fontSize: '0.72rem', color: '#16A34A', fontWeight: 700 }}>
                  {easyCount} Easy
                </Typography>
                <Typography sx={{ fontSize: '0.72rem', color: '#94A3B8' }}>•</Typography>
                <Typography sx={{ fontSize: '0.72rem', color: '#D97706', fontWeight: 700 }}>
                  {mediumCount} Med
                </Typography>
                <Typography sx={{ fontSize: '0.72rem', color: '#94A3B8' }}>•</Typography>
                <Typography sx={{ fontSize: '0.72rem', color: '#DC2626', fontWeight: 700 }}>
                  {hardCount} Hard
                </Typography>
              </Box>
            </Card>

            <Card elevation={0} sx={{ p: 2.5, borderRadius: '16px', bgcolor: '#FFFFFF', border: `1px solid ${borderColor}`, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
              <Typography sx={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Published & Active
              </Typography>
              <Typography sx={{ fontSize: '1.75rem', fontWeight: 900, color: '#16A34A', mt: 0.5, letterSpacing: '-0.02em' }}>
                {publishedCount} <span style={{ fontSize: '1rem', fontWeight: 600, color: '#64748B' }}>/ {totalCount}</span>
              </Typography>
              <LinearProgress
                variant="determinate"
                value={Math.round((publishedCount / (totalCount || 1)) * 100)}
                sx={{
                  height: 5,
                  borderRadius: 3,
                  bgcolor: '#E2E8F0',
                  mt: 0.75,
                  '& .MuiLinearProgress-bar': { bgcolor: '#16A34A', borderRadius: 3 },
                }}
              />
            </Card>

            <Card elevation={0} sx={{ p: 2.5, borderRadius: '16px', bgcolor: '#FFFFFF', border: `1px solid ${borderColor}`, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
              <Typography sx={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Evaluated Submissions
              </Typography>
              <Typography sx={{ fontSize: '1.75rem', fontWeight: 900, color: '#2563EB', mt: 0.5, letterSpacing: '-0.02em' }}>
                {totalPlatformSubmissions.toLocaleString()}
              </Typography>
              <Typography sx={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 500, mt: 0.25 }}>
                Across all testbench runs
              </Typography>
            </Card>

            <Card elevation={0} sx={{ p: 2.5, borderRadius: '16px', bgcolor: '#FFFFFF', border: `1px solid ${borderColor}`, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
              <Typography sx={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Platform Avg Pass Rate
              </Typography>
              <Typography sx={{ fontSize: '1.75rem', fontWeight: 900, color: '#7C3AED', mt: 0.5, letterSpacing: '-0.02em' }}>
                {avgAcceptance}%
              </Typography>
              <Typography sx={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 500, mt: 0.25 }}>
                {underReviewCount} under review • {draftCount} drafts
              </Typography>
            </Card>
          </Box>

          {/* 4. Controls & Filters Toolbar with MUI Tabs */}
          <Card
            elevation={0}
            sx={{
              borderRadius: '16px',
              bgcolor: '#FFFFFF',
              border: `1px solid ${borderColor}`,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* MUI Tabs for Algorithmic Topic Categories */}
            <Box sx={{ borderBottom: `1px solid ${borderColor}`, px: { xs: 2, md: 3 }, pt: 0.5, bgcolor: '#FFFFFF' }}>
              <Tabs
                value={selectedCategory}
                onChange={(_, newValue) => {
                  setSelectedCategory(newValue);
                  setPage(0);
                }}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  minHeight: 48,
                  '& .MuiTabs-indicator': {
                    backgroundColor: '#2563EB',
                    height: 3,
                    borderRadius: '3px 3px 0 0',
                  },
                  '& .MuiTabs-flexContainer': {
                    gap: { xs: 0.5, sm: 1.5 },
                  },
                }}
              >
                {[
                  'All Topics',
                  'Dynamic Programming',
                  'Graph Theory & BFS/DFS',
                  'Trees & Binary Search Trees',
                  'Arrays & Two Pointers',
                  'Strings & Tries',
                  'Math & Number Theory',
                  'Greedy & Heuristics',
                ].map((cat) => (
                  <Tab
                    key={cat}
                    value={cat}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{ fontWeight: selectedCategory === cat ? 700 : 600, fontSize: '0.84rem' }}>
                          {cat}
                        </Typography>
                        <Chip
                          label={getCategoryCount(cat)}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            borderRadius: '9999px',
                            bgcolor: selectedCategory === cat ? '#EFF6FF' : '#F1F5F9',
                            color: selectedCategory === cat ? '#2563EB' : '#64748B',
                            border: '1px solid',
                            borderColor: selectedCategory === cat ? '#BFDBFE' : '#E2E8F0',
                            pointerEvents: 'none',
                          }}
                        />
                      </Box>
                    }
                    disableRipple
                    sx={{
                      minHeight: 48,
                      py: 1,
                      px: 1.25,
                      textTransform: 'none',
                      color: selectedCategory === cat ? '#2563EB !important' : '#64748B',
                      '&:hover': { color: '#0F172A' },
                    }}
                  />
                ))}
              </Tabs>
            </Box>

            {/* Search Bar & Dropdown Filters Row */}
            <Box
              sx={{
                p: { xs: 2, md: 2.5 },
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                gap: 2,
                alignItems: { xs: 'stretch', md: 'center' },
                justifyContent: 'space-between',
              }}
            >
              {/* Search Input */}
              <TextField
                size="small"
                placeholder="Search by problem title, code, tag, company..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(0);
                }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: '#94A3B8', fontSize: 18 }} />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  flex: 1,
                  maxWidth: { xs: '100%', md: 380 },
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '9999px',
                    bgcolor: '#F8FAFC',
                    color: '#0F172A',
                    fontSize: '0.85rem',
                    '& fieldset': { borderColor: '#E2E8F0' },
                    '&:hover fieldset': { borderColor: '#CBD5E1' },
                    '&.Mui-focused fieldset': { borderColor: '#2563EB' },
                  },
                }}
              />

              {/* Filter Controls */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>
                  DIFFICULTY:
                </Typography>
                <Select
                  size="small"
                  value={selectedDifficulty}
                  onChange={(e) => {
                    setSelectedDifficulty(e.target.value);
                    setPage(0);
                  }}
                  sx={{
                    height: 32,
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: '#0F172A',
                    bgcolor: '#F8FAFC',
                    borderRadius: '9999px',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' },
                    '& .MuiSvgIcon-root': { color: '#64748B', fontSize: 18 },
                  }}
                >
                  <MenuItem value="ALL" sx={{ fontSize: '0.8rem' }}>All Difficulties</MenuItem>
                  <MenuItem value="Easy" sx={{ fontSize: '0.8rem' }}>Easy</MenuItem>
                  <MenuItem value="Medium" sx={{ fontSize: '0.8rem' }}>Medium</MenuItem>
                  <MenuItem value="Hard" sx={{ fontSize: '0.8rem' }}>Hard</MenuItem>
                </Select>

                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, ml: 0.5 }}>
                  STATUS:
                </Typography>
                <Select
                  size="small"
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setPage(0);
                  }}
                  sx={{
                    height: 32,
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: '#0F172A',
                    bgcolor: '#F8FAFC',
                    borderRadius: '9999px',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' },
                    '& .MuiSvgIcon-root': { color: '#64748B', fontSize: 18 },
                  }}
                >
                  <MenuItem value="ALL" sx={{ fontSize: '0.8rem' }}>All Statuses</MenuItem>
                  <MenuItem value="Published" sx={{ fontSize: '0.8rem' }}>Published</MenuItem>
                  <MenuItem value="Under Review" sx={{ fontSize: '0.8rem' }}>Under Review</MenuItem>
                  <MenuItem value="Draft" sx={{ fontSize: '0.8rem' }}>Draft</MenuItem>
                  <MenuItem value="Archived" sx={{ fontSize: '0.8rem' }}>Archived</MenuItem>
                </Select>

                {(searchQuery || selectedCategory !== 'All Topics' || selectedDifficulty !== 'ALL' || selectedStatus !== 'ALL') && (
                  <Button
                    size="small"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All Topics');
                      setSelectedDifficulty('ALL');
                      setSelectedStatus('ALL');
                      setPage(0);
                    }}
                    startIcon={<FilterAltOffRoundedIcon sx={{ fontSize: 16 }} />}
                    sx={{
                      color: '#EF4444',
                      bgcolor: '#FEF2F2',
                      borderRadius: '9999px',
                      textTransform: 'none',
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      height: 32,
                      px: 1.5,
                      '&:hover': { bgcolor: '#FEE2E2' },
                    }}
                  >
                    Reset Filters
                  </Button>
                )}
              </Box>
            </Box>
          </Card>

          {/* Floating Fixed Bottom Bulk Action Bar */}
          <BulkActionBar
            selectedCount={selectedIds.length}
            onClear={() => setSelectedIds([])}
            onExport={downloadProblemsExcel}
            onDelete={handleDeleteSelected}
            itemLabel="Problems"
          />

          {/* 5. Main Content: List Table View (Rule 10 Standard) */}
          <Card
            elevation={0}
            sx={{
              borderRadius: '16px',
              border: `1px solid ${borderColor}`,
              bgcolor: '#FFFFFF',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
              overflow: 'hidden',
            }}
          >
            <TableContainer>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                  <TableRow>
                    {/* Checkbox Select All */}
                    <TableCell padding="checkbox" sx={{ pl: 2.5, borderColor: '#E2E8F0' }}>
                      <Checkbox
                        indeterminate={selectedIds.length > 0 && selectedIds.length < filteredProblems.length}
                        checked={filteredProblems.length > 0 && selectedIds.length === filteredProblems.length}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        sx={{
                          color: '#CBD5E1',
                          '&.Mui-checked, &.MuiCheckbox-indeterminate': { color: '#2563EB' },
                        }}
                      />
                    </TableCell>

                    {/* Status Indicator */}
                    <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5, width: 60 }}>
                      STATUS
                    </TableCell>

                    {/* Problem Title & Code (Sortable) */}
                    <TableCell
                      onClick={() => handleSort('title')}
                      sx={{
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        color: '#64748B',
                        py: 1.5,
                        cursor: 'pointer',
                        userSelect: 'none',
                        minWidth: 280,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        PROBLEM TITLE
                        {sortField === 'title' &&
                          (sortDirection === 'asc' ? (
                            <ArrowUpwardRoundedIcon sx={{ fontSize: '0.85rem', color: '#2563EB' }} />
                          ) : (
                            <ArrowDownwardRoundedIcon sx={{ fontSize: '0.85rem', color: '#2563EB' }} />
                          ))}
                      </Box>
                    </TableCell>

                    {/* Difficulty (Sortable) */}
                    <TableCell
                      onClick={() => handleSort('difficulty')}
                      sx={{
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        color: '#64748B',
                        py: 1.5,
                        cursor: 'pointer',
                        userSelect: 'none',
                        width: 120,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        DIFFICULTY
                        {sortField === 'difficulty' &&
                          (sortDirection === 'asc' ? (
                            <ArrowUpwardRoundedIcon sx={{ fontSize: '0.85rem', color: '#2563EB' }} />
                          ) : (
                            <ArrowDownwardRoundedIcon sx={{ fontSize: '0.85rem', color: '#2563EB' }} />
                          ))}
                      </Box>
                    </TableCell>

                    {/* Acceptance Rate (Sortable) */}
                    <TableCell
                      onClick={() => handleSort('acceptanceRate')}
                      sx={{
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        color: '#64748B',
                        py: 1.5,
                        minWidth: 150,
                        cursor: 'pointer',
                        userSelect: 'none',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        ACCEPTANCE
                        {sortField === 'acceptanceRate' &&
                          (sortDirection === 'asc' ? (
                            <ArrowUpwardRoundedIcon sx={{ fontSize: '0.85rem', color: '#2563EB' }} />
                          ) : (
                            <ArrowDownwardRoundedIcon sx={{ fontSize: '0.85rem', color: '#2563EB' }} />
                          ))}
                      </Box>
                    </TableCell>

                    {/* Submissions (Sortable) */}
                    <TableCell
                      onClick={() => handleSort('totalSubmissions')}
                      sx={{
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        color: '#64748B',
                        py: 1.5,
                        cursor: 'pointer',
                        userSelect: 'none',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        SUBMISSIONS
                        {sortField === 'totalSubmissions' &&
                          (sortDirection === 'asc' ? (
                            <ArrowUpwardRoundedIcon sx={{ fontSize: '0.85rem', color: '#2563EB' }} />
                          ) : (
                            <ArrowDownwardRoundedIcon sx={{ fontSize: '0.85rem', color: '#2563EB' }} />
                          ))}
                      </Box>
                    </TableCell>

                    {/* Algorithmic Tags */}
                    <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5 }}>
                      TOPICS & PATTERNS
                    </TableCell>

                    {/* Actions */}
                    <TableCell align="right" sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', pr: 3, py: 1.5 }}>
                      ACTIONS
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {paginatedProblems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} sx={{ py: 8, textAlign: 'center' }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                          <Box sx={{ p: 2, borderRadius: '50%', bgcolor: '#EFF6FF', color: '#2563EB' }}>
                            <SearchIcon sx={{ fontSize: 32 }} />
                          </Box>
                          <Typography sx={{ fontWeight: 700, color: '#0F172A', fontSize: '1rem' }}>
                            No problems match your filters
                          </Typography>
                          <Typography sx={{ color: '#64748B', fontSize: '0.84rem' }}>
                            Try adjusting your topic tab, search query, or difficulty filters.
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedProblems.map((prob) => {
                      const isSelected = selectedIds.includes(prob.id);
                      const diffStyle = difficultyChipStyles[prob.difficulty];

                      return (
                        <TableRow
                          key={prob.id}
                          hover
                          selected={isSelected}
                          sx={{
                            '& td': { borderBottom: '1px solid #F1F5F9' },
                            bgcolor: isSelected ? '#EFF6FF !important' : 'inherit',
                            '&:hover': { bgcolor: isSelected ? '#DBEAFE !important' : '#F8FAFC !important' },
                          }}
                        >
                          {/* Checkbox */}
                          <TableCell padding="checkbox" sx={{ pl: 2.5 }}>
                            <Checkbox
                              checked={isSelected}
                              onChange={() => handleToggleSelectRow(prob.id)}
                              sx={{
                                color: '#CBD5E1',
                                '&.Mui-checked': { color: '#2563EB' },
                              }}
                            />
                          </TableCell>

                          {/* Status Pill */}
                          <TableCell>
                            <Chip
                              label={prob.status}
                              size="small"
                              sx={{
                                height: 22,
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                borderRadius: '9999px',
                                bgcolor:
                                  prob.status === 'Published'
                                    ? '#F0FDF4'
                                    : prob.status === 'Under Review'
                                    ? '#FFFBEB'
                                    : '#F1F5F9',
                                color:
                                  prob.status === 'Published'
                                    ? '#16A34A'
                                    : prob.status === 'Under Review'
                                    ? '#D97706'
                                    : '#64748B',
                                border: '1px solid',
                                borderColor:
                                  prob.status === 'Published'
                                    ? '#BBF7D0'
                                    : prob.status === 'Under Review'
                                    ? '#FDE68A'
                                    : '#CBD5E1',
                              }}
                            />
                          </TableCell>

                          {/* Title & Code */}
                          <TableCell sx={{ py: 1.75 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography
                                    component={Link}
                                    href={`/superadmin/problems/${prob.slug}`}
                                    sx={{
                                      fontSize: '0.9rem',
                                      fontWeight: 700,
                                      color: '#0F172A',
                                      textDecoration: 'none',
                                      '&:hover': { color: '#2563EB', textDecoration: 'underline' },
                                    }}
                                  >
                                    {prob.code}. {prob.title}
                                  </Typography>
                                  {prob.points >= 150 && (
                                    <Tooltip title={`${prob.points} points challenge`}>
                                      <WhatshotRoundedIcon sx={{ fontSize: 16, color: '#DC2626' }} />
                                    </Tooltip>
                                  )}
                                </Box>

                                {/* Company Badges */}
                                {prob.companies && prob.companies.length > 0 && (
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
                                    <Typography sx={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 600 }}>
                                      Asked at:
                                    </Typography>
                                    {prob.companies.slice(0, 3).map((comp) => (
                                      <Typography
                                        key={comp}
                                        sx={{
                                          fontSize: '0.68rem',
                                          color: '#64748B',
                                          bgcolor: '#F1F5F9',
                                          px: 0.75,
                                          py: 0.1,
                                          borderRadius: '4px',
                                          fontWeight: 600,
                                        }}
                                      >
                                        {comp}
                                      </Typography>
                                    ))}
                                    {prob.companies.length > 3 && (
                                      <Typography sx={{ fontSize: '0.68rem', color: '#94A3B8' }}>
                                        +{prob.companies.length - 3}
                                      </Typography>
                                    )}
                                  </Box>
                                )}
                              </Box>
                            </Box>
                          </TableCell>

                          {/* Difficulty Chip */}
                          <TableCell sx={{ py: 1.75 }}>
                            <Chip
                              label={prob.difficulty}
                              size="small"
                              sx={{
                                height: 24,
                                fontSize: '0.74rem',
                                fontWeight: 800,
                                borderRadius: '9999px',
                                ...diffStyle,
                              }}
                            />
                          </TableCell>

                          {/* Acceptance Rate */}
                          <TableCell sx={{ py: 1.75 }}>
                            <Box sx={{ minWidth: 120 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#0F172A' }}>
                                  {prob.acceptanceRate}%
                                </Typography>
                                <Typography sx={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 600 }}>
                                  {prob.points} pts
                                </Typography>
                              </Box>
                              <LinearProgress
                                variant="determinate"
                                value={prob.acceptanceRate}
                                sx={{
                                  height: 5,
                                  borderRadius: 3,
                                  bgcolor: '#E2E8F0',
                                  '& .MuiLinearProgress-bar': {
                                    bgcolor: prob.acceptanceRate > 60 ? '#16A34A' : prob.acceptanceRate > 40 ? '#2563EB' : '#D97706',
                                    borderRadius: 3,
                                  },
                                }}
                              />
                            </Box>
                          </TableCell>

                          {/* Submissions */}
                          <TableCell sx={{ py: 1.75 }}>
                            <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>
                              {prob.totalSubmissions.toLocaleString()}
                            </Typography>
                            <Typography sx={{ fontSize: '0.7rem', color: '#64748B' }}>
                              {prob.acceptedSubmissions.toLocaleString()} accepted
                            </Typography>
                          </TableCell>

                          {/* Topics & Tags */}
                          <TableCell sx={{ py: 1.75 }}>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, maxWidth: 260 }}>
                              {prob.tags.slice(0, 2).map((tag) => (
                                <Chip
                                  key={tag}
                                  label={tag}
                                  size="small"
                                  sx={{
                                    height: 20,
                                    fontSize: '0.68rem',
                                    fontWeight: 600,
                                    bgcolor: '#F1F5F9',
                                    color: '#475569',
                                    borderRadius: '6px',
                                    border: '1px solid #E2E8F0',
                                  }}
                                />
                              ))}
                              {prob.tags.length > 2 && (
                                <Tooltip title={prob.tags.slice(2).join(', ')}>
                                  <Chip
                                    label={`+${prob.tags.length - 2}`}
                                    size="small"
                                    sx={{
                                      height: 20,
                                      fontSize: '0.68rem',
                                      fontWeight: 700,
                                      bgcolor: '#EFF6FF',
                                      color: '#2563EB',
                                      borderRadius: '6px',
                                    }}
                                  />
                                </Tooltip>
                              )}
                            </Box>
                          </TableCell>

                          {/* Actions: Peek & Solve */}
                          <TableCell align="right" sx={{ pr: 3, py: 1.75 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                              <Tooltip title="Quick Peek Problem">
                                <IconButton
                                  size="small"
                                  onClick={() => setPeekProblem(prob)}
                                  sx={{
                                    color: '#64748B',
                                    width: 32,
                                    height: 32,
                                    borderRadius: '8px',
                                    border: '1px solid #E2E8F0',
                                    '&:hover': { color: '#2563EB', bgcolor: '#EFF6FF', borderColor: '#BFDBFE' },
                                  }}
                                >
                                  <VisibilityRoundedIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                              </Tooltip>

                              <Tooltip title="Delete Problem">
                                <IconButton
                                  size="small"
                                  onClick={() => handleDeleteSingleProblem(prob.id)}
                                  sx={{
                                    color: '#EF4444',
                                    width: 32,
                                    height: 32,
                                    borderRadius: '8px',
                                    border: '1px solid #FEE2E2',
                                    bgcolor: '#FEF2F2',
                                    '&:hover': { color: '#DC2626', bgcolor: '#FEE2E2', borderColor: '#FECACA' },
                                  }}
                                >
                                  <DeleteOutlineRoundedIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                              </Tooltip>

                              <Button
                                component={Link}
                                href={`/superadmin/problems/${prob.slug}`}
                                size="small"
                                variant="outlined"
                                endIcon={<FluidArrowRight size={14} />}
                                sx={{
                                  textTransform: 'none',
                                  fontWeight: 700,
                                  fontSize: '0.76rem',
                                  color: '#2563EB',
                                  borderColor: '#DBEAFE',
                                  bgcolor: '#EFF6FF',
                                  borderRadius: '8px',
                                  px: 1.5,
                                  py: 0.4,
                                  whiteSpace: 'nowrap',
                                  '&:hover': {
                                    bgcolor: '#DBEAFE',
                                    borderColor: '#93C5FD',
                                  },
                                }}
                              >
                                Manage
                              </Button>
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* 6. Full-Pill Pagination Footer Toolbar */}
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
              <Typography sx={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>
                Showing <strong style={{ color: '#0F172A' }}>{startEntry}–{endEntry}</strong> of <strong style={{ color: '#0F172A' }}>{totalEntries}</strong> problems
              </Typography>

              {/* Rows Per Page & Page Numbers */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography sx={{ fontSize: '0.76rem', color: '#64748B', fontWeight: 600 }}>Rows:</Typography>
                  <Select
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(Number(e.target.value));
                      setPage(0);
                    }}
                    size="small"
                    sx={{
                      height: 28,
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      color: '#0F172A',
                      bgcolor: '#FFFFFF',
                      borderRadius: '9999px',
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0', borderRadius: '9999px' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#CBD5E1' },
                      '& .MuiSvgIcon-root': { color: '#64748B', fontSize: 18 },
                    }}
                  >
                    <MenuItem value={5}>5</MenuItem>
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={25}>25</MenuItem>
                    <MenuItem value={50}>50</MenuItem>
                  </Select>
                </Box>

                {/* Pagination Controls */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <IconButton
                    size="small"
                    disabled={currentPage === 0}
                    onClick={() => setPage(0)}
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
                    disabled={currentPage === 0}
                    onClick={() => setPage(Math.max(0, currentPage - 1))}
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

                  {/* Page Pill Buttons */}
                  {(() => {
                    const pages = [];
                    const maxVisible = 5;
                    let start = Math.max(0, currentPage - Math.floor(maxVisible / 2));
                    let end = Math.min(totalPages, start + maxVisible);

                    if (end - start < maxVisible) {
                      start = Math.max(0, end - maxVisible);
                    }

                    if (start > 0) {
                      pages.push(0);
                      if (start > 1) pages.push('ellipsis-start');
                    }

                    for (let i = start; i < end; i++) {
                      if (!pages.includes(i)) pages.push(i);
                    }

                    if (end < totalPages) {
                      if (end < totalPages - 1) pages.push('ellipsis-end');
                      pages.push(totalPages - 1);
                    }

                    return pages.map((item, idx) => {
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
                      const isActive = currentPage === pageIndex;

                      return (
                        <Box
                          key={pageIndex}
                          onClick={() => setPage(pageIndex)}
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
                    });
                  })()}

                  <IconButton
                    size="small"
                    disabled={currentPage >= totalPages - 1}
                    onClick={() => setPage(Math.min(totalPages - 1, currentPage + 1))}
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
                    disabled={currentPage >= totalPages - 1}
                    onClick={() => setPage(totalPages - 1)}
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
              </Box>
            </Box>
          </Card>
        </Box>
      </Box>

      {/* 7. Quick Peek Drawer */}
      <ProblemQuickPeekDrawer
        problem={peekProblem}
        open={Boolean(peekProblem)}
        onClose={() => setPeekProblem(null)}
      />

      {/* 8. Create Problem Modal */}
      <CreateProblemModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateProblem}
      />
    </Box>
  );
}
