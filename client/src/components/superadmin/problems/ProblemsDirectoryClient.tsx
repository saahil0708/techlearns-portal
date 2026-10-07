'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  ListItemIcon,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import TableChartRoundedIcon from '@mui/icons-material/TableChartRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import WhatshotRoundedIcon from '@mui/icons-material/WhatshotRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import dynamic from 'next/dynamic';

import FloatingSidebar from '@/components/superadmin/layout/CurvedSidebar';
import Navbar from '@/components/superadmin/layout/Navbar';
import { apiService } from '@/lib/api-service';
import { useToast } from '@/context/ToastContext';
import ProblemsStatsBanner from './directory/ProblemsStatsBanner';
import ProblemsFilterToolbar from './directory/ProblemsFilterToolbar';
import ProblemsDataTable, { SortField, SortDirection } from './directory/ProblemsDataTable';
import {
  ProblemEntity,
  ProblemCategory,
  NewProblemData,
} from '@/types/problem';

const ProblemQuickPeekDrawer = dynamic(() => import('@/components/superadmin/problems/ProblemQuickPeekDrawer'), { loading: () => null });
const CreateProblemModal = dynamic(() => import('@/components/superadmin/problems/CreateProblemModal'), { loading: () => null });
const BulkImportProblemsModal = dynamic(() => import('@/components/superadmin/problems/BulkImportProblemsModal'), { loading: () => null });
const SetPotdModal = dynamic(() => import('@/components/superadmin/problems/SetPotdModal'), { loading: () => null });
const BulkActionBar = dynamic(() => import('@/components/superadmin/shared/BulkActionBar'), { loading: () => null });

interface ProblemsDirectoryClientProps {
  initialProblems: ProblemEntity[];
}

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
          const mapped: ProblemEntity[] = liveData.items.map((item: any, idx: number) => {
            const titleLower = String(item.title || '').toLowerCase();
            const rawTags: string[] = Array.isArray(item.tags) ? item.tags : [];
            let category: ProblemCategory = (item.category as ProblemCategory) || 'Arrays & Two Pointers';
            let tags = rawTags.length > 0 ? rawTags : ['Algorithms', 'Data Structures'];

            if (!item.category) {
              if (titleLower.includes('even') || titleLower.includes('odd') || titleLower.includes('math') || titleLower.includes('prime')) {
                category = 'Math & Number Theory';
                tags = rawTags.length > 0 ? rawTags : ['Math', 'Number Theory', 'Conditionals'];
              } else if (titleLower.includes('coin') || titleLower.includes('knapsack') || titleLower.includes('subsequence')) {
                category = 'Dynamic Programming';
                tags = rawTags.length > 0 ? rawTags : ['Dynamic Programming', 'Optimization'];
              } else if (titleLower.includes('tree') || titleLower.includes('bst')) {
                category = 'Trees & Binary Search Trees';
                tags = rawTags.length > 0 ? rawTags : ['Trees', 'Binary Search Tree'];
              } else if (titleLower.includes('graph') || titleLower.includes('bfs') || titleLower.includes('dfs')) {
                category = 'Graph Theory & BFS/DFS';
                tags = rawTags.length > 0 ? rawTags : ['Graph Theory', 'BFS/DFS'];
              } else if (titleLower.includes('string') || titleLower.includes('palindrome') || titleLower.includes('anagram')) {
                category = 'Strings & Tries';
                tags = rawTags.length > 0 ? rawTags : ['Strings', 'Parsing'];
              }
            }

            const diff = item.difficulty === 'HARD' ? 'Hard' : item.difficulty === 'MEDIUM' ? 'Medium' : 'Easy';
            const totalSubmissions = item.totalSubmissions ?? item._count?.submissions ?? 0;
            const acceptedSubmissions = item.acceptedSubmissions ?? item.acceptedCount ?? 0;
            const acceptanceRate = item.acceptanceRate !== undefined && item.acceptanceRate !== null
              ? item.acceptanceRate
              : (totalSubmissions > 0 ? Number(((acceptedSubmissions / totalSubmissions) * 100).toFixed(1)) : 0);
            const points = item.points || (diff === 'Easy' ? 100 : diff === 'Hard' ? 350 : 200);

            return {
              id: item.id,
              code: item.code || `PROB-${String(idx + 1).padStart(3, '0')}`,
              slug: item.slug,
              title: item.title,
              category,
              difficulty: diff,
              acceptanceRate,
              totalSubmissions,
              acceptedSubmissions,
              testCasesCount: item._count?.testCases || item.testCasesCount || 0,
              authorName: item.authorName || 'Faculty',
              tags,
              status: item.status === 'PUBLISHED' ? 'Published' : 'Draft',
              points,
              timeLimitMs: item.timeLimit || item.timeLimitMs || 1000,
              memoryLimitMb: item.memoryLimit || item.memoryLimitMb || 256,
              likes: item.likes || 0,
              dislikes: item.dislikes || 0,
              premium: item.premium || false,
              companies: item.companies || [],
              statementMarkdown: item.statement || item.statementMarkdown || '',
              sampleTestCases: item.sampleTestCases || [],
            };
          });
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
  const [isBulkImportModalOpen, setIsBulkImportModalOpen] = useState(false);
  const [isSetPotdModalOpen, setIsSetPotdModalOpen] = useState(false);
  const [potdSelectedProblem, setPotdSelectedProblem] = useState<ProblemEntity | null>(null);
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
    setSelectedIds([]);
    const failedIds: string[] = [];
    for (const id of idsToDelete) {
      try {
        await apiService.deleteProblem(id);
      } catch {
        failedIds.push(id);
      }
    }
    if (failedIds.length > 0) {
      setProblems((prev) => prev.filter((p) => !idsToDelete.includes(p.id) || failedIds.includes(p.id)));
      toast.error(`Failed to delete ${failedIds.length} problem${failedIds.length > 1 ? 's' : ''}. They remain on the server.`, 'Partial Failure');
    } else {
      setProblems((prev) => prev.filter((p) => !idsToDelete.includes(p.id)));
      toast.success(`Deleted ${idsToDelete.length} coding problem${idsToDelete.length > 1 ? 's' : ''} from platform.`, 'Problem Repository');
    }
  };

  const handleDeleteSingleProblem = async (id: string) => {
    try {
      await apiService.deleteProblem(id);
      setProblems((prev) => prev.filter((p) => p.id !== id));
      setSelectedIds((prev) => prev.filter((item) => item !== id));
      toast.success('Problem deleted successfully.', 'Problem Repository');
    } catch {
      toast.error('Failed to delete problem. Please try again.', 'Server Error');
    }
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
  const currentPage = Math.max(0, Math.min(page, totalPages - 1));
  const paginatedProblems = filteredProblems.slice(
    currentPage * rowsPerPage,
    currentPage * rowsPerPage + rowsPerPage
  );
  const startEntry = totalEntries === 0 ? 0 : currentPage * rowsPerPage + 1;
  const endEntry = Math.min((currentPage + 1) * rowsPerPage, totalEntries);

  const handleCreateProblem = async (data: NewProblemData): Promise<void> => {
    const tempId = `prob-${Date.now()}`;
    const sampleCases = data.testCases
      ? data.testCases
          .filter((tc) => !tc.isHidden)
          .map((tc) => ({ input: tc.input, output: tc.expectedOutput, explanation: tc.explanation }))
      : [];

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
      testCasesCount: data.testCases?.length ?? data.testCasesCount ?? 0,
      authorName: 'Administrator',
      likes: 0,
      dislikes: 0,
      premium: false,
      companies: ['Community'],
      statementMarkdown: data.statementMarkdown,
      sampleTestCases: sampleCases,
    };
    setProblems((prev) => [newEntry, ...prev]);

    try {
      const created = await apiService.createProblem({
        title: data.title,
        slug: data.slug || undefined,
        code: data.code || undefined,
        statement: data.statementMarkdown,
        category: data.category,
        tags: data.tags,
        status: data.status === 'Draft' ? 'DRAFT' : 'PUBLISHED',
        points: data.points,
        difficulty:
          data.difficulty === 'Hard'
            ? 'HARD'
            : data.difficulty === 'Easy'
            ? 'EASY'
            : 'MEDIUM',
        timeLimit: data.timeLimitMs,
        memoryLimit: data.memoryLimitMb,
        institutionId: data.institutionId || undefined,
        courseId: data.courseId || undefined,
        moduleId: data.moduleId || undefined,
        lessonId: data.lessonId || undefined,
        testCases: data.testCases && data.testCases.length > 0 ? data.testCases : undefined,
      });
      if (created?.id) {
        setProblems((prev) =>
          prev.map((p) => (p.id === tempId ? { ...p, id: created.id } : p))
        );
      }
      toast.success(`Problem "${data.title}" created with ${data.testCases?.length ?? 0} test case(s).`, 'Problem Created');
    } catch (err: any) {
      setProblems((prev) => prev.filter((p) => p.id !== tempId));
      toast.error(err?.message || `Failed to create problem "${data.title}".`, 'Creation Failed');
      throw err;
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
    const csvEscape = (val: string | number) => `"${String(val).replace(/"/g, '""')}"`;
    const headers = ['Code', 'Title', 'Category', 'Difficulty', 'Status', 'AcceptanceRate', 'TotalSubmissions', 'Points', 'Tags'];
    const rows = filteredProblems.map((p) => [
      csvEscape(p.code),
      csvEscape(p.title),
      csvEscape(p.category),
      csvEscape(p.difficulty),
      csvEscape(p.status),
      csvEscape(`${p.acceptanceRate}%`),
      p.totalSubmissions,
      p.points,
      csvEscape(p.tags.join(';')),
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

  const borderColor = '#E2E8F0';

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        bgcolor: '#F8FAFC',
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
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
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
                variant="outlined"
                onClick={() => {
                  setPotdSelectedProblem(null);
                  setIsSetPotdModalOpen(true);
                }}
                sx={{
                  borderColor: '#CBD5E1',
                  bgcolor: '#FFFFFF',
                  color: '#0F172A',
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  px: 2,
                  py: 0.75,
                  '&:hover': { bgcolor: '#F8FAFC', borderColor: '#94A3B8' },
                }}
              >
                Manage POTD & Queue
              </Button>

              <Button
                variant="outlined"
                startIcon={<CloudUploadRoundedIcon sx={{ fontSize: 18 }} />}
                onClick={() => setIsBulkImportModalOpen(true)}
                sx={{
                  borderColor: '#CBD5E1',
                  color: '#334155',
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  px: 2,
                  py: 0.75,
                  '&:hover': { bgcolor: '#F1F5F9', borderColor: '#94A3B8' },
                }}
              >
                Bulk Import CSV
              </Button>

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
          <ProblemsStatsBanner
            totalCount={totalCount}
            easyCount={easyCount}
            mediumCount={mediumCount}
            hardCount={hardCount}
            publishedCount={publishedCount}
            underReviewCount={underReviewCount}
            draftCount={draftCount}
            totalPlatformSubmissions={totalPlatformSubmissions}
            avgAcceptance={avgAcceptance}
          />

          {/* 4. Controls & Filters Toolbar with MUI Tabs */}
          <ProblemsFilterToolbar
            searchQuery={searchQuery}
            onSearchChange={(val) => {
              setSearchQuery(val);
              setPage(0);
            }}
            selectedCategory={selectedCategory}
            onCategoryChange={(cat) => {
              setSelectedCategory(cat);
              setPage(0);
            }}
            selectedDifficulty={selectedDifficulty}
            onDifficultyChange={(diff) => {
              setSelectedDifficulty(diff);
              setPage(0);
            }}
            selectedStatus={selectedStatus}
            onStatusChange={(status) => {
              setSelectedStatus(status);
              setPage(0);
            }}
            onResetFilters={() => {
              setSearchQuery('');
              setSelectedCategory('All Topics');
              setSelectedDifficulty('ALL');
              setSelectedStatus('ALL');
              setPage(0);
            }}
            getCategoryCount={getCategoryCount}
            filteredCount={filteredProblems.length}
            totalCount={totalCount}
          />

          {/* Floating Fixed Bottom Bulk Action Bar */}
          <BulkActionBar
            selectedCount={selectedIds.length}
            onClear={() => setSelectedIds([])}
            onExport={downloadProblemsExcel}
            onDelete={handleDeleteSelected}
            itemLabel="Problems"
          />

          {/* 5. Main Content: List Table View (Rule 10 Standard) */}
          <ProblemsDataTable
            problems={problems}
            paginatedProblems={paginatedProblems}
            selectedIds={selectedIds}
            onToggleSelectRow={handleToggleSelectRow}
            onSelectAll={handleSelectAll}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
            onPeek={(p) => setPeekProblem(p)}
            onSetPotd={(p) => {
              setPotdSelectedProblem(p);
              setIsSetPotdModalOpen(true);
            }}
            onDeleteSingle={handleDeleteSingleProblem}
            page={currentPage}
            rowsPerPage={rowsPerPage}
            onPageChange={setPage}
            onRowsPerPageChange={(rows) => {
              setRowsPerPage(rows);
              setPage(0);
            }}
            startEntry={startEntry}
            endEntry={endEntry}
            totalEntries={filteredProblems.length}
            totalPages={totalPages}
          />
        </Box>
      </Box>

      {/* 6. Quick Peek Drawer */}
      <ProblemQuickPeekDrawer
        problem={peekProblem}
        open={Boolean(peekProblem)}
        onClose={() => setPeekProblem(null)}
      />

      {/* 7. Create Problem Modal */}
      <CreateProblemModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateProblem}
      />

      {/* 8. Bulk Import Problems Modal */}
      <BulkImportProblemsModal
        open={isBulkImportModalOpen}
        onClose={() => setIsBulkImportModalOpen(false)}
        onImportSuccess={(importedList) => {
          setProblems((prev) => [...importedList, ...prev]);
        }}
      />

      {/* 9. Set Problem of the Day Modal */}
      <SetPotdModal
        open={isSetPotdModalOpen}
        onClose={() => {
          setIsSetPotdModalOpen(false);
          setPotdSelectedProblem(null);
        }}
        problems={problems}
        initialSelectedProblem={potdSelectedProblem}
      />
    </Box>
  );
}
