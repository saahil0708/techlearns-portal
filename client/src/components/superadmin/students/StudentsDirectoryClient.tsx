'use client';

import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  Chip,
  Button,
  TextField,
  InputAdornment,
  Avatar,
  IconButton,
  Tooltip,
  ListItemIcon,
  Menu,
  MenuItem,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Select,
  Checkbox,
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import PublicRoundedIcon from '@mui/icons-material/PublicRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import FirstPageRoundedIcon from '@mui/icons-material/FirstPageRounded';
import LastPageRoundedIcon from '@mui/icons-material/LastPageRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import TableChartRoundedIcon from '@mui/icons-material/TableChartRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import { FluidArrowRight } from '@/utils/fluid_arrow';
import WhatshotRoundedIcon from '@mui/icons-material/WhatshotRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import CompareArrowsRoundedIcon from '@mui/icons-material/CompareArrowsRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import FilterAltOffRoundedIcon from '@mui/icons-material/FilterAltOffRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded';

import dynamic from 'next/dynamic';

// Layout & Modals
import FloatingSidebar from '@/components/superadmin/layout/CurvedSidebar';
import Navbar from '@/components/superadmin/layout/Navbar';
import type { NewStudentData } from '@/components/superadmin/students/CreateStudentModal';
import { apiService } from '@/lib/api-service';
import { useToast } from '@/context/ToastContext';
import { useAppSelector } from '@/store/hooks';
import YouBadge from '@/components/common/YouBadge';
import StatsCard from '@/components/superadmin/shared/StatsCard';

const CreateStudentModal = dynamic(() => import('@/components/superadmin/students/CreateStudentModal'), { loading: () => null });
const CompareStudentsModal = dynamic(() => import('@/components/superadmin/students/CompareStudentsModal'), { loading: () => null });
const StudentQuickPeekDrawer = dynamic(() => import('@/components/superadmin/students/StudentQuickPeekDrawer'), { loading: () => null });
const BulkImportStudentsModal = dynamic(() => import('@/components/superadmin/students/BulkImportStudentsModal'), { loading: () => null });
const DeleteConfirmModal = dynamic(() => import('@/components/superadmin/shared/DeleteConfirmModal'), { loading: () => null });
const BulkActionBar = dynamic(() => import('@/components/superadmin/shared/BulkActionBar'), { loading: () => null });
const AssignBatchModal = dynamic(() => import('@/components/superadmin/students/AssignBatchModal'), { loading: () => null });
import type { AssignBatchStudentTarget } from '@/components/superadmin/students/AssignBatchModal';

export interface StudentDirectoryEntity {
  id: string;
  name: string;
  handle: string;
  email: string;
  studentId: string;
  institutionType: 'Institute' | 'Independent';
  institutionName: string;
  cohort: string;
  problemsSolved: number;
  solvedEasy: number;
  solvedMedium: number;
  solvedHard: number;
  hasVerifiedDifficulty?: boolean;
  contestRating: number;
  ratingTier: 'Master' | 'Candidate Master' | 'Expert' | 'Specialist' | 'Pupil' | 'Newbie';
  globalRank: number;
  accuracy: string;
  streakDays: number;
  status: 'Active' | 'Inactive' | 'Flagged';
  avatarUrl?: string;
  avatarColor: string;
}

type SortField = 'globalRank' | 'name' | 'contestRating' | 'problemsSolved' | 'accuracy' | 'streakDays';
type SortDirection = 'asc' | 'desc';

interface StudentsDirectoryClientProps {
  initialStudents: StudentDirectoryEntity[];
}

export default function StudentsDirectoryClient({ initialStudents }: StudentsDirectoryClientProps) {
  const _router = useRouter();
  const toast = useToast();
  const currentUser = useAppSelector((state) => state.auth.user);
  const [students, setStudents] = useState<StudentDirectoryEntity[]>(initialStudents || []);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedTier, setSelectedTier] = useState<string>('ALL');
  const [minSolvedFilter, setMinSolvedFilter] = useState<string>('ALL');
  const [minStreakFilter, setMinStreakFilter] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Client-side live data refresh
  React.useEffect(() => {
    async function loadLiveStudents() {
      try {
        const liveData = await apiService.getUsers({ limit: 100 });
        if (liveData?.items && liveData.items.length > 0) {
          const mapped: StudentDirectoryEntity[] = liveData.items
            .filter((u: any) => u.globalRole === 'STUDENT' || !u.globalRole)
            .map((u: any, idx: number) => {
              const solved = u.problemsSolved ?? (u._count?.submissions || 0);
              const hasVerifiedDifficulty = typeof u.solvedEasy === 'number' && typeof u.solvedMedium === 'number' && typeof u.solvedHard === 'number';
              const solvedEasy = hasVerifiedDifficulty ? u.solvedEasy : Math.floor(solved * 0.5);
              const solvedMedium = hasVerifiedDifficulty ? u.solvedMedium : Math.floor(solved * 0.35);
              const solvedHard = hasVerifiedDifficulty ? u.solvedHard : Math.max(0, solved - solvedEasy - solvedMedium);

              const rating = u.contestRating ?? 1200;
              const tier =
                rating > 2100
                  ? 'Master'
                  : rating > 1900
                  ? 'Candidate Master'
                  : rating > 1600
                  ? 'Expert'
                  : rating > 1400
                  ? 'Specialist'
                  : solved > 0
                  ? 'Pupil'
                  : 'Newbie';

              const primaryMembership = Array.isArray(u.memberships)
                ? u.memberships.find((m: any) => m?.institution?.name || m?.college?.name)
                : null;
              const collegeName = primaryMembership?.institution?.name || primaryMembership?.college?.name;
              const userInstitution = u.institution?.trim();

              const primaryBatch = Array.isArray(u.batchEnrollments)
                ? u.batchEnrollments.find((b: any) => b?.batch?.name)
                : null;
              const batchName = primaryBatch?.batch?.name || u.cohort?.trim();

              const institutionType: 'Institute' | 'Independent' = collegeName || userInstitution
                ? 'Institute'
                : 'Independent';

              const institutionName = collegeName
                ? collegeName
                : userInstitution
                ? userInstitution
                : 'Self-Enrolled';

              const cohort = batchName ? batchName : 'No Batch Assigned';

              return {
                id: u.id,
                name: u.name || 'Student Coder',
                handle: u.email ? u.email.split('@')[0] : `coder_${idx + 1}`,
                email: u.email,
                studentId: u.rollNo || u.studentId || primaryBatch?.rollNo || `STU-2026-${String(idx + 1).padStart(3, '0')}`,
                institutionType,
                institutionName,
                cohort,
                problemsSolved: solved,
                solvedEasy,
                solvedMedium,
                solvedHard,
                hasVerifiedDifficulty,
                contestRating: rating,
                ratingTier: tier as any,
                globalRank: u.globalRank ?? (solved > 0 ? idx + 1 : 0),
                accuracy: u.accuracy ?? (solved > 0 ? '75%' : '0%'),
                streakDays: u.streakDays ?? 0,
                status: u.status === 'ACTIVE' ? ('Active' as const) : ('Inactive' as const),
                avatarColor: ['#2563EB', '#3B82F6', '#10B981', '#7C3AED', '#DC2626'][idx % 5],
              };
            });
          setStudents(mapped);
        }
      } catch (err) {
        console.warn('Live students fetch on client:', err);
      }
    }
    loadLiveStudents();
  }, []);

  // Sorting State
  const [sortField, setSortField] = useState<SortField>('globalRank');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Selection & Modals State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState<boolean>(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState<boolean>(false);
  const [peekStudent, setPeekStudent] = useState<StudentDirectoryEntity | null>(null);
  const [deleteTargetStudents, setDeleteTargetStudents] = useState<StudentDirectoryEntity[] | null>(null);
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);

  // Assign Batch Modal State
  const [isAssignBatchOpen, setIsAssignBatchOpen] = useState<boolean>(false);
  const [assignBatchTargets, setAssignBatchTargets] = useState<AssignBatchStudentTarget[]>([]);

  const handleOpenAssignBatchSingle = (stu: StudentDirectoryEntity) => {
    setAssignBatchTargets([
      {
        id: stu.id,
        name: stu.name,
        email: stu.email,
        handle: stu.handle,
        currentCohort: stu.cohort,
        currentInstitution: stu.institutionName,
      },
    ]);
    setIsAssignBatchOpen(true);
  };

  const handleOpenAssignBatchBulk = () => {
    const targets = students
      .filter((s) => selectedIds.includes(s.id))
      .map((stu) => ({
        id: stu.id,
        name: stu.name,
        email: stu.email,
        handle: stu.handle,
        currentCohort: stu.cohort,
        currentInstitution: stu.institutionName,
      }));
    if (targets.length > 0) {
      setAssignBatchTargets(targets);
      setIsAssignBatchOpen(true);
    }
  };

  const handleAssignedSuccess = (assignedBatchName: string, institutionName: string, updatedStudentIds: string[]) => {
    const idSet = new Set(updatedStudentIds);
    setStudents((prev) =>
      prev.map((s) => {
        if (idSet.has(s.id)) {
          return {
            ...s,
            cohort: assignedBatchName,
            institutionName: assignedBatchName === 'No Batch Assigned' ? s.institutionName : institutionName,
            institutionType: assignedBatchName === 'No Batch Assigned' ? s.institutionType : 'Institute',
          };
        }
        return s;
      })
    );
    setSelectedIds([]);
  };

  // Pagination states
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  // Handle Sort Change
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Delete Handlers
  const _handleRequestDeleteSingle = (stu: StudentDirectoryEntity) => {
    setDeleteTargetStudents([stu]);
  };

  const handleRequestDeleteBulk = () => {
    const targets = students.filter((s) => selectedIds.includes(s.id));
    if (targets.length > 0) {
      setDeleteTargetStudents(targets);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetStudents) return;
    const targetIds = new Set(deleteTargetStudents.map((s) => s.id));
    const count = deleteTargetStudents.length;
    const targetsToDelete = [...deleteTargetStudents];
    setStudents((prev) => prev.filter((s) => !targetIds.has(s.id)));
    setSelectedIds((prev) => prev.filter((id) => !targetIds.has(id)));
    setDeleteTargetStudents(null);

    // Call live API to delete student user records from database
    for (const target of targetsToDelete) {
      try {
        await apiService.deleteUser(target.id);
      } catch (err) {
        console.error(`Failed to delete student ${target.id}:`, err);
      }
    }
    toast.success(`Deleted ${count} student roster record${count > 1 ? 's' : ''}.`, 'Student Directory');
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedType('ALL');
    setSelectedTier('ALL');
    setMinSolvedFilter('ALL');
    setMinStreakFilter('ALL');
    setSelectedStatus('ALL');
    setPage(0);
  };

  const isFilterActive =
    searchQuery ||
    selectedType !== 'ALL' ||
    selectedTier !== 'ALL' ||
    minSolvedFilter !== 'ALL' ||
    minStreakFilter !== 'ALL' ||
    selectedStatus !== 'ALL';

  // Filter & Sort
  const processedStudents = useMemo(() => {
    return students
      .filter((stu) => {
        if (selectedType !== 'ALL' && stu.institutionType !== selectedType) return false;
        if (selectedTier !== 'ALL' && stu.ratingTier !== selectedTier) return false;
        if (selectedStatus !== 'ALL' && stu.status !== selectedStatus) return false;
        if (minSolvedFilter === '500' && stu.problemsSolved < 500) return false;
        if (minSolvedFilter === '300' && stu.problemsSolved < 300) return false;
        if (minSolvedFilter === '100' && stu.problemsSolved < 100) return false;
        if (minStreakFilter === '30' && stu.streakDays < 30) return false;
        if (minStreakFilter === '14' && stu.streakDays < 14) return false;
        if (minStreakFilter === '7' && stu.streakDays < 7) return false;

        if (
          searchQuery &&
          !stu.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !stu.handle.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !stu.email.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !stu.studentId.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !stu.institutionName.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !stu.cohort.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        let valA: any = a[sortField];
        let valB: any = b[sortField];

        if (typeof valA === 'string') {
          valA = valA.toLowerCase();
          valB = valB.toLowerCase();
        }

        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
  }, [students, searchQuery, selectedType, selectedTier, selectedStatus, minSolvedFilter, minStreakFilter, sortField, sortDirection]);

  // Paginated Slices
  const paginatedStudents = useMemo(() => {
    const start = page * rowsPerPage;
    return processedStudents.slice(start, start + rowsPerPage);
  }, [processedStudents, page, rowsPerPage]);

  const totalPages = Math.max(1, Math.ceil(processedStudents.length / rowsPerPage));

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(processedStudents.map((s) => s.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  // Selected entities for compare modal
  const selectedStudentsForCompare = useMemo(() => {
    return students.filter((s) => selectedIds.includes(s.id));
  }, [students, selectedIds]);

  // Stats Counters
  const totalCount = students.length;
  const _activeSolvers = students.filter((s) => s.status === 'Active').length;
  const _masterCoders = students.filter((s) => s.ratingTier === 'Master').length;
  const instituteCount = students.filter((s) => s.institutionType === 'Institute').length;
  const indCount = students.filter((s) => s.institutionType === 'Independent').length;

  // Add new student handler
  const handleAddStudent = async (newData: NewStudentData) => {
    const tempId = `stu-${Date.now()}`;
    const newStudent: StudentDirectoryEntity = {
      id: tempId,
      name: newData.name,
      handle: newData.handle,
      email: newData.email,
      studentId: newData.studentId,
      institutionType: newData.institutionType,
      institutionName: newData.institutionName,
      cohort: newData.cohort,
      problemsSolved: 0,
      solvedEasy: 0,
      solvedMedium: 0,
      solvedHard: 0,
      hasVerifiedDifficulty: true,
      contestRating: 1200,
      ratingTier: 'Newbie',
      globalRank: students.length + 1,
      accuracy: '0%',
      streakDays: 0,
      status: 'Active',
      avatarColor: '#2563EB',
    };
    setStudents((prev) => [newStudent, ...prev]);

    const assignedPassword = newData.password?.trim() || 'TemporaryPass123!';
    try {
      const created = await apiService.createUser({
        name: newData.name,
        email: newData.email,
        password: assignedPassword,
        globalRole: 'STUDENT',
      });
      if (created?.id) {
        setStudents((prev) =>
          prev.map((s) => (s.id === tempId ? { ...s, id: created.id } : s))
        );
      }
      toast.success(
        `Student "${newData.name}" added. Password: "${assignedPassword}"`,
        'Student Enrolled'
      );
    } catch {
      toast.info(`Student "${newData.name}" saved locally.`, 'Student Registered');
    }
  };

  // Export handlers
  const getExportData = () => {
    const listToExport = selectedIds.length > 0 ? students.filter((s) => selectedIds.includes(s.id)) : processedStudents;
    return listToExport.map((s) => ({
      Rank: s.globalRank,
      Name: s.name,
      Handle: s.handle,
      Email: s.email,
      StudentID: s.studentId,
      InstitutionType: s.institutionType,
      Institution: s.institutionName,
      Cohort: s.cohort,
      Rating: s.contestRating,
      Tier: s.ratingTier,
      ProblemsSolved: s.problemsSolved,
      Accuracy: s.accuracy,
      StreakDays: s.streakDays,
      Status: s.status,
    }));
  };

  const handleExportCSV = () => {
    setExportMenuAnchor(null);
    const data = getExportData();
    if (data.length === 0) {
      toast.warning('No student records to export.', 'Export Notice');
      return;
    }
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map((obj) => Object.values(obj).map((v) => `"${v}"`).join(','));
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `students_directory_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${data.length} student records to CSV`, 'Data Export');
  };

  const handleExportExcel = () => {
    setExportMenuAnchor(null);
    const data = getExportData();
    if (data.length === 0) {
      toast.warning('No student records to export.', 'Export Notice');
      return;
    }
    let table = '<table border="1"><tr>' + Object.keys(data[0]).map((k) => `<th>${k}</th>`).join('') + '</tr>';
    data.forEach((row) => {
      table += '<tr>' + Object.values(row).map((val) => `<td>${val}</td>`).join('') + '</tr>';
    });
    table += '</table>';
    const blob = new Blob([table], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `students_directory_${Date.now()}.xls`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Exported ${data.length} student records to Excel`, 'Data Export');
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
        {/* Unified Layout Container: Navbar + Page Content */}
        <Box sx={{ maxWidth: 1400, width: '100%', mx: 'auto', px: { xs: 3, md: 5 }, display: 'flex', flexDirection: 'column', gap: 4, pb: { xs: 4, md: 6 } }}>
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
                  <PersonRoundedIcon sx={{ fontSize: 22 }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 800, fontSize: { xs: '1.3rem', md: '1.6rem' }, color: '#0F172A', letterSpacing: '-0.02em' }}>
                  Students & Competitive Coders
                </Typography>
                <Chip
                  label={`${totalCount} Coders`}
                  size="small"
                  sx={{
                    bgcolor: '#EFF6FF',
                    color: '#2563EB',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    borderRadius: '9999px',
                  }}
                />
              </Box>
              <Typography sx={{ color: '#64748B', fontSize: '0.86rem', mt: 0.5, fontWeight: 500 }}>
                Global developer leaderboard, collegiate cohorts, K-12 STEM coders & performance analytics
              </Typography>
            </Box>

            {/* Actions: Export, Bulk Import & Add Student */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
              <Tooltip title="Export Students Directory">
                <Button
                  onClick={(e) => setExportMenuAnchor(e.currentTarget)}
                  startIcon={<FileDownloadRoundedIcon sx={{ fontSize: 18 }} />}
                  sx={{
                    bgcolor: '#FFFFFF',
                    color: '#475569',
                    border: `1px solid ${borderColor}`,
                    borderRadius: '9999px',
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.84rem',
                    px: 2,
                    py: 0.75,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                    '&:hover': { bgcolor: '#EFF6FF', color: '#2563EB', borderColor: '#BFDBFE' },
                  }}
                >
                  Export {selectedIds.length > 0 ? `(${selectedIds.length})` : 'Data'}
                </Button>
              </Tooltip>

              <Menu
                anchorEl={exportMenuAnchor}
                open={Boolean(exportMenuAnchor)}
                onClose={() => setExportMenuAnchor(null)}
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
                <MenuItem onClick={handleExportExcel} sx={{ borderRadius: '8px', py: 1 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <TableChartRoundedIcon sx={{ fontSize: 18, color: '#16A34A' }} />
                  </ListItemIcon>
                  <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#0F172A' }}>
                    Download Excel (.xls)
                  </Typography>
                </MenuItem>
                <MenuItem onClick={handleExportCSV} sx={{ borderRadius: '8px', py: 1 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <DescriptionRoundedIcon sx={{ fontSize: 18, color: '#2563EB' }} />
                  </ListItemIcon>
                  <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#0F172A' }}>
                    Download CSV (.csv)
                  </Typography>
                </MenuItem>
              </Menu>

              {/* Bulk Import */}
              <Button
                variant="outlined"
                onClick={() => setIsBulkImportOpen(true)}
                startIcon={<CloudUploadRoundedIcon sx={{ fontSize: 18 }} />}
                sx={{
                  bgcolor: '#FFFFFF',
                  color: '#2563EB',
                  border: '1px solid #BFDBFE',
                  borderRadius: '9999px',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.84rem',
                  px: 2,
                  py: 0.75,
                  '&:hover': { bgcolor: '#EFF6FF', borderColor: '#2563EB' },
                }}
              >
                Bulk Import
              </Button>

              {/* Add Student */}
              <Button
                variant="contained"
                onClick={() => setIsCreateModalOpen(true)}
                startIcon={<AddRoundedIcon sx={{ fontSize: 18 }} />}
                sx={{
                  bgcolor: '#2563EB',
                  color: '#FFFFFF',
                  borderRadius: '9999px',
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  px: 2.25,
                  py: 0.75,
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                  '&:hover': { bgcolor: '#1D4ED8' },
                }}
              >
                Add Student
              </Button>
            </Box>
          </Box>

          {/* 4 Summary Metric Cards (Light Royal Blue Standard) */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2.5 }}>
            <StatsCard
              title="Total Enrolled Coders"
              value={students.length.toLocaleString()}
              icon={<SchoolRoundedIcon sx={{ fontSize: 20 }} />}
              variant="blue"
              shape="orbital"
              subtitle={`${instituteCount} Institute • ${indCount} Independent`}
            />

            <StatsCard
              title="Active Solvers"
              value={students.filter((s) => s.status === 'Active' || s.problemsSolved > 0).length.toLocaleString()}
              icon={<WhatshotRoundedIcon sx={{ fontSize: 20 }} />}
              variant="black"
              shape="topography"
              subtitle={`${students.length > 0 ? Math.round((students.filter((s) => s.status === 'Active' || s.problemsSolved > 0).length / students.length) * 100) : 0}% Weekly Participation`}
            />

            <StatsCard
              title="Total Problems Solved"
              value={students.reduce((acc, s) => acc + s.problemsSolved, 0).toLocaleString()}
              icon={<EmojiEventsRoundedIcon sx={{ fontSize: 20 }} />}
              variant="blue"
              shape="hex-grid"
              subtitle={
                <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center', flexWrap: 'wrap' }}>
                  <Typography sx={{ fontSize: '0.72rem', color: '#60A5FA', fontWeight: 700 }}>
                    {students.reduce((acc, s) => acc + (s.solvedEasy || 0), 0)} Easy • {students.reduce((acc, s) => acc + (s.solvedMedium || 0), 0)} Med • {students.reduce((acc, s) => acc + (s.solvedHard || 0), 0)} Hard
                  </Typography>
                </Box>
              }
            />

            <StatsCard
              title="Avg Platform Accuracy"
              value={students.length > 0 ? (students.reduce((acc, s) => acc + (parseFloat(s.accuracy) || 0), 0) / students.length).toFixed(1) + '%' : '0%'}
              icon={<CheckCircleRoundedIcon sx={{ fontSize: 20 }} />}
              variant="black"
              shape="aurora-waves"
              subtitle={`Across ${students.reduce((acc, s) => acc + s.problemsSolved, 0).toLocaleString()} test evaluations`}
            />
          </Box>

          {/* Filter Toolbar Card with MUI Tabs */}
          <Card
            elevation={0}
            sx={{
              borderRadius: '16px',
              bgcolor: '#FFFFFF',
              border: `1px solid ${borderColor}`,
              boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* MUI Tabs for Institution Types */}
            <Box sx={{ borderBottom: `1px solid ${borderColor}`, px: { xs: 2, md: 3 }, pt: 0.5, bgcolor: '#FFFFFF' }}>
              <Tabs
                value={selectedType}
                onChange={(_, newValue) => {
                  setSelectedType(newValue);
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
                  { id: 'ALL', label: 'All Students', count: totalCount },
                  { id: 'Institute', label: 'Institutes', count: instituteCount },
                  { id: 'Independent', label: 'Independent', count: indCount },
                ].map((tab) => (
                  <Tab
                    key={tab.id}
                    value={tab.id}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{ fontWeight: selectedType === tab.id ? 700 : 600, fontSize: '0.84rem' }}>
                          {tab.label}
                        </Typography>
                        <Chip
                          label={tab.count}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            borderRadius: '9999px',
                            bgcolor: selectedType === tab.id ? '#EFF6FF' : '#F1F5F9',
                            color: selectedType === tab.id ? '#2563EB' : '#64748B',
                            border: '1px solid',
                            borderColor: selectedType === tab.id ? '#BFDBFE' : '#E2E8F0',
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
                      color: selectedType === tab.id ? '#2563EB !important' : '#64748B',
                      '&:hover': {
                        color: '#0F172A',
                      },
                    }}
                  />
                ))}
              </Tabs>
            </Box>

            {/* Search Bar & Secondary Dropdowns */}
            <Box
              sx={{
                p: { xs: 2, md: 2.5 },
                display: 'flex',
                flexDirection: { xs: 'column', lg: 'row' },
                gap: 2,
                alignItems: { xs: 'stretch', lg: 'center' },
                justifyContent: 'space-between',
              }}
            >
              {/* Search Input */}
              <TextField
                size="small"
                placeholder="Search by student name, @handle, ID, institution, or cohort..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(0);
                }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: '#94A3B8', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  flex: 1,
                  maxWidth: { xs: '100%', lg: 480 },
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

              {/* Secondary Dropdown Filters & Reset */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, mr: 0.5 }}>
                FILTERS:
              </Typography>

              {/* Min Solved */}
              <Select
                size="small"
                value={minSolvedFilter}
                onChange={(e) => {
                  setMinSolvedFilter(e.target.value);
                  setPage(0);
                }}
                sx={{
                  bgcolor: '#F8FAFC',
                  color: '#0F172A',
                  borderRadius: '9999px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  height: 32,
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' },
                  '& .MuiSvgIcon-root': { color: '#64748B' },
                }}
              >
                <MenuItem value="ALL" sx={{ fontSize: '0.8rem' }}>All Solved Counts</MenuItem>
                <MenuItem value="500" sx={{ fontSize: '0.8rem' }}>500+ Solved</MenuItem>
                <MenuItem value="300" sx={{ fontSize: '0.8rem' }}>300+ Solved</MenuItem>
                <MenuItem value="100" sx={{ fontSize: '0.8rem' }}>100+ Solved</MenuItem>
              </Select>

              {/* Min Streak */}
              <Select
                size="small"
                value={minStreakFilter}
                onChange={(e) => {
                  setMinStreakFilter(e.target.value);
                  setPage(0);
                }}
                sx={{
                  bgcolor: '#F8FAFC',
                  color: '#0F172A',
                  borderRadius: '9999px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  height: 32,
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' },
                  '& .MuiSvgIcon-root': { color: '#64748B' },
                }}
              >
                <MenuItem value="ALL" sx={{ fontSize: '0.8rem' }}>All Streaks</MenuItem>
                <MenuItem value="30" sx={{ fontSize: '0.8rem' }}>30+ Days Active Streak</MenuItem>
                <MenuItem value="14" sx={{ fontSize: '0.8rem' }}>14+ Days Streak</MenuItem>
                <MenuItem value="7" sx={{ fontSize: '0.8rem' }}>7+ Days Streak</MenuItem>
              </Select>

              {/* Status */}
              <Select
                size="small"
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setPage(0);
                }}
                sx={{
                  bgcolor: '#F8FAFC',
                  color: '#0F172A',
                  borderRadius: '9999px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  height: 32,
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' },
                  '& .MuiSvgIcon-root': { color: '#64748B' },
                }}
              >
                <MenuItem value="ALL" sx={{ fontSize: '0.8rem' }}>All Statuses</MenuItem>
                <MenuItem value="Active" sx={{ fontSize: '0.8rem' }}>Active Only</MenuItem>
                <MenuItem value="Inactive" sx={{ fontSize: '0.8rem' }}>Inactive Only</MenuItem>
              </Select>

              {/* Reset Pill */}
              {isFilterActive && (
                <Button
                  size="small"
                  onClick={handleResetFilters}
                  startIcon={<FilterAltOffRoundedIcon sx={{ fontSize: '0.9rem' }} />}
                  sx={{
                    borderRadius: '9999px',
                    color: '#DC2626',
                    bgcolor: '#FEF2F2',
                    border: '1px solid #FECACA',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'none',
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
            onExport={handleExportExcel}
            onDelete={handleRequestDeleteBulk}
          >
            {/* Assign Batch Button */}
            <Tooltip title="Assign selected students to an academic cohort">
              <Button
                size="small"
                variant="contained"
                onClick={handleOpenAssignBatchBulk}
                startIcon={<SchoolRoundedIcon sx={{ fontSize: '1rem' }} />}
                sx={{
                  borderRadius: '9999px',
                  bgcolor: '#2563EB',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  textTransform: 'none',
                  color: '#FFFFFF',
                  height: 30,
                  px: 1.75,
                  '&:hover': { bgcolor: '#1D4ED8' },
                }}
              >
                Assign Batch ({selectedIds.length})
              </Button>
            </Tooltip>

            {/* Compare Button */}
            <Tooltip
              title={
                selectedIds.length < 2 || selectedIds.length > 3
                  ? 'Select 2 or 3 coders to compare head-to-head'
                  : 'Compare selected coders side-by-side'
              }
            >
              <span>
                <Button
                  size="small"
                  disabled={selectedIds.length < 2 || selectedIds.length > 3}
                  variant="contained"
                  onClick={() => setIsCompareModalOpen(true)}
                  startIcon={<CompareArrowsRoundedIcon sx={{ fontSize: '1rem' }} />}
                  sx={{
                    borderRadius: '9999px',
                    bgcolor: '#7C3AED',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    textTransform: 'none',
                    height: 30,
                    px: 1.5,
                    '&:hover': { bgcolor: '#6D28D9' },
                    '&.Mui-disabled': { bgcolor: '#F1F5F9', color: '#94A3B8' },
                  }}
                >
                  Compare ({selectedIds.length})
                </Button>
              </span>
            </Tooltip>
          </BulkActionBar>

          {/* Structured List Table (RULE 10 STANDARD - LIGHT THEME) */}
          <Card
            elevation={0}
            sx={{
              borderRadius: '16px',
              bgcolor: '#FFFFFF',
              border: `1px solid ${borderColor}`,
              boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
              overflow: 'hidden',
            }}
          >
            <TableContainer>
              <Table sx={{ minWidth: 1050 }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                    {/* Checkbox Column */}
                    <TableCell padding="checkbox" sx={{ pl: 2.5, borderColor: '#E2E8F0' }}>
                      <Checkbox
                        indeterminate={selectedIds.length > 0 && selectedIds.length < processedStudents.length}
                        checked={processedStudents.length > 0 && selectedIds.length === processedStudents.length}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        sx={{
                          color: '#CBD5E1',
                          '&.Mui-checked, &.MuiCheckbox-indeterminate': { color: '#2563EB' },
                        }}
                      />
                    </TableCell>

                    {/* Rank Header (Sortable) */}
                    <TableCell
                      onClick={() => handleSort('globalRank')}
                      sx={{
                        color: '#64748B',
                        fontWeight: 700,
                        fontSize: '0.74rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        borderColor: '#E2E8F0',
                        cursor: 'pointer',
                        userSelect: 'none',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        Rank
                        {sortField === 'globalRank' &&
                          (sortDirection === 'asc' ? (
                            <ArrowUpwardRoundedIcon sx={{ fontSize: '0.85rem', color: '#2563EB' }} />
                          ) : (
                            <ArrowDownwardRoundedIcon sx={{ fontSize: '0.85rem', color: '#2563EB' }} />
                          ))}
                      </Box>
                    </TableCell>

                    {/* Student & Handle Header (Sortable) */}
                    <TableCell
                      onClick={() => handleSort('name')}
                      sx={{
                        color: '#64748B',
                        fontWeight: 700,
                        fontSize: '0.74rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        borderColor: '#E2E8F0',
                        cursor: 'pointer',
                        userSelect: 'none',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        Coder & Handle
                        {sortField === 'name' &&
                          (sortDirection === 'asc' ? (
                            <ArrowUpwardRoundedIcon sx={{ fontSize: '0.85rem', color: '#2563EB' }} />
                          ) : (
                            <ArrowDownwardRoundedIcon sx={{ fontSize: '0.85rem', color: '#2563EB' }} />
                          ))}
                      </Box>
                    </TableCell>

                    {/* Institution & Cohort */}
                    <TableCell
                      sx={{
                        color: '#64748B',
                        fontWeight: 700,
                        fontSize: '0.74rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        borderColor: '#E2E8F0',
                      }}
                    >
                      Affiliation & Cohort
                    </TableCell>

                    {/* Problems Solved (Sortable) */}
                    <TableCell
                      onClick={() => handleSort('problemsSolved')}
                      sx={{
                        color: '#64748B',
                        fontWeight: 700,
                        fontSize: '0.74rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        borderColor: '#E2E8F0',
                        cursor: 'pointer',
                        userSelect: 'none',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        Problems Solved
                        {sortField === 'problemsSolved' &&
                          (sortDirection === 'asc' ? (
                            <ArrowUpwardRoundedIcon sx={{ fontSize: '0.85rem', color: '#2563EB' }} />
                          ) : (
                            <ArrowDownwardRoundedIcon sx={{ fontSize: '0.85rem', color: '#2563EB' }} />
                          ))}
                      </Box>
                    </TableCell>



                    {/* Accuracy & Streak (Sortable) */}
                    <TableCell
                      onClick={() => handleSort('streakDays')}
                      sx={{
                        color: '#64748B',
                        fontWeight: 700,
                        fontSize: '0.74rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        borderColor: '#E2E8F0',
                        cursor: 'pointer',
                        userSelect: 'none',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        Accuracy / Streak
                        {sortField === 'streakDays' &&
                          (sortDirection === 'asc' ? (
                            <ArrowUpwardRoundedIcon sx={{ fontSize: '0.85rem', color: '#2563EB' }} />
                          ) : (
                            <ArrowDownwardRoundedIcon sx={{ fontSize: '0.85rem', color: '#2563EB' }} />
                          ))}
                      </Box>
                    </TableCell>

                    {/* Status */}
                    <TableCell
                      sx={{
                        color: '#64748B',
                        fontWeight: 700,
                        fontSize: '0.74rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        borderColor: '#E2E8F0',
                      }}
                    >
                      Status
                    </TableCell>

                    {/* Actions */}
                    <TableCell
                      align="right"
                      sx={{
                        color: '#64748B',
                        fontWeight: 700,
                        fontSize: '0.74rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        borderColor: '#E2E8F0',
                        pr: 3,
                      }}
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {paginatedStudents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} sx={{ textAlign: 'center', py: 8, borderColor: '#E2E8F0' }}>
                        <Typography variant="subtitle1" sx={{ color: '#64748B', fontWeight: 600 }}>
                          No competitive coders found matching your criteria.
                        </Typography>
                        <Button
                          size="small"
                          onClick={handleResetFilters}
                          sx={{ mt: 1.5, color: '#2563EB', borderRadius: '9999px', textTransform: 'none' }}
                        >
                          Reset All Filters
                        </Button>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedStudents.map((stu) => {
                      const isSelected = selectedIds.includes(stu.id);
                      const isCurrentUser = Boolean(
                        currentUser &&
                          (currentUser.id === stu.id ||
                            (currentUser.email && stu.email && currentUser.email.toLowerCase() === stu.email.toLowerCase()) ||
                            ((currentUser as any)?.handle && stu.handle && (currentUser as any).handle.toLowerCase() === stu.handle.toLowerCase()))
                      );
                      return (
                        <TableRow
                          key={stu.id}
                          selected={isSelected}
                          sx={{
                            transition: 'all 0.15s ease',
                            borderColor: '#E2E8F0',
                            bgcolor: isSelected ? '#EFF6FF' : isCurrentUser ? '#F8FAFC' : '#FFFFFF',
                            '&:hover': {
                              bgcolor: isSelected ? '#DBEAFE' : '#F8FAFC',
                            },
                          }}
                        >
                          {/* Row Checkbox */}
                          <TableCell padding="checkbox" sx={{ pl: 2.5, borderColor: '#E2E8F0' }}>
                            <Checkbox
                              checked={isSelected}
                              onChange={() => handleToggleSelectRow(stu.id)}
                              sx={{
                                color: '#CBD5E1',
                                '&.Mui-checked': { color: '#2563EB' },
                              }}
                            />
                          </TableCell>

                          {/* Rank Column */}
                          <TableCell sx={{ borderColor: '#E2E8F0' }}>
                            {stu.globalRank && stu.globalRank > 0 ? (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                {stu.globalRank === 1 ? (
                                  <EmojiEventsRoundedIcon sx={{ color: '#F59E0B', fontSize: '1.2rem' }} />
                                ) : stu.globalRank === 2 ? (
                                  <EmojiEventsRoundedIcon sx={{ color: '#94A3B8', fontSize: '1.2rem' }} />
                                ) : stu.globalRank === 3 ? (
                                  <EmojiEventsRoundedIcon sx={{ color: '#B45309', fontSize: '1.2rem' }} />
                                ) : null}
                                <Typography
                                  sx={{
                                    fontWeight: 800,
                                    color: stu.globalRank <= 3 ? '#D97706' : '#64748B',
                                    fontSize: '0.85rem',
                                    fontFamily: 'monospace',
                                  }}
                                >
                                  #{stu.globalRank}
                                </Typography>
                              </Box>
                            ) : (
                              <Typography sx={{ color: '#94A3B8', fontSize: '0.85rem', fontWeight: 600, pl: 0.5 }}>
                                —
                              </Typography>
                            )}
                          </TableCell>

                          {/* Coder Info Column */}
                          <TableCell sx={{ borderColor: '#E2E8F0' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Avatar
                                src={stu.avatarUrl}
                                sx={{
                                  width: 38,
                                  height: 38,
                                  bgcolor: stu.avatarColor,
                                  fontWeight: 800,
                                  fontSize: '0.85rem',
                                  border: '2px solid #E2E8F0',
                                }}
                              >
                                {stu.name.charAt(0)}
                              </Avatar>
                              <Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap' }}>
                                  <Typography
                                    onClick={() => setPeekStudent(stu)}
                                    sx={{
                                      fontWeight: 700,
                                      color: '#0F172A',
                                      fontSize: '0.88rem',
                                      cursor: 'pointer',
                                      '&:hover': { color: '#2563EB', textDecoration: 'underline' },
                                    }}
                                  >
                                    {stu.name}
                                  </Typography>
                                  {isCurrentUser && <YouBadge />}
                                  <Typography
                                    sx={{
                                      color: '#2563EB',
                                      fontSize: '0.75rem',
                                      fontFamily: 'monospace',
                                      fontWeight: 600,
                                    }}
                                  >
                                    @{stu.handle}
                                  </Typography>
                                </Box>
                                <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
                                  ID: {stu.studentId} • {stu.email}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>

                          {/* Affiliation & Cohort Column */}
                          <TableCell sx={{ borderColor: '#E2E8F0' }}>
                            <Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.3 }}>
                                <Chip
                                  label={stu.institutionType}
                                  size="small"
                                  sx={{
                                    height: 20,
                                    fontSize: '0.65rem',
                                    fontWeight: 800,
                                    borderRadius: '9999px',
                                    bgcolor:
                                      stu.institutionType === 'Institute'
                                        ? '#EFF6FF'
                                        : '#FAF5FF',
                                    color:
                                      stu.institutionType === 'Institute'
                                        ? '#2563EB'
                                        : '#7C3AED',
                                    border: '1px solid',
                                    borderColor:
                                      stu.institutionType === 'Institute'
                                        ? '#BFDBFE'
                                        : '#E9D5FF',
                                  }}
                                />
                                <Typography
                                  sx={{
                                    fontWeight: 600,
                                    color: '#0F172A',
                                    fontSize: '0.8rem',
                                    maxWidth: 220,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                  }}
                                >
                                  {stu.institutionName}
                                </Typography>
                              </Box>
                              <Tooltip title="Click to assign or change academic cohort">
                                <Typography
                                  variant="caption"
                                  onClick={() => handleOpenAssignBatchSingle(stu)}
                                  sx={{
                                    color: stu.cohort === 'No Batch Assigned' ? '#94A3B8' : '#2563EB',
                                    fontStyle: stu.cohort === 'No Batch Assigned' ? 'italic' : 'normal',
                                    fontWeight: stu.cohort === 'No Batch Assigned' ? 500 : 700,
                                    fontSize: '0.72rem',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                    mt: 0.25,
                                    cursor: 'pointer',
                                    borderRadius: '4px',
                                    px: 0.5,
                                    py: 0.1,
                                    bgcolor: stu.cohort === 'No Batch Assigned' ? 'transparent' : 'rgba(37, 99, 235, 0.06)',
                                    '&:hover': { color: '#1D4ED8', textDecoration: 'underline', bgcolor: 'rgba(37, 99, 235, 0.1)' },
                                  }}
                                >
                                  {stu.cohort}
                                </Typography>
                              </Tooltip>
                            </Box>
                          </TableCell>

                          {/* Problems Solved Breakdown */}
                          <TableCell sx={{ borderColor: '#E2E8F0' }}>
                            <Box>
                              <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.88rem' }}>
                                {stu.problemsSolved}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.2 }}>
                                <Typography variant="caption" sx={{ color: '#16A34A', fontWeight: 700, fontSize: '0.68rem' }}>
                                  E: {stu.solvedEasy}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.68rem' }}>•</Typography>
                                <Typography variant="caption" sx={{ color: '#D97706', fontWeight: 700, fontSize: '0.68rem' }}>
                                  M: {stu.solvedMedium}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.68rem' }}>•</Typography>
                                <Typography variant="caption" sx={{ color: '#DC2626', fontWeight: 700, fontSize: '0.68rem' }}>
                                  H: {stu.solvedHard}
                                </Typography>
                                {!stu.hasVerifiedDifficulty && stu.problemsSolved > 0 && (
                                  <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.65rem', fontStyle: 'italic', ml: 0.25 }}>
                                    (est.)
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          </TableCell>



                          {/* Accuracy & Streak */}
                          <TableCell sx={{ borderColor: '#E2E8F0' }}>
                            <Box>
                              <Typography sx={{ fontWeight: 700, color: '#16A34A', fontSize: '0.82rem' }}>
                                {stu.accuracy}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3, color: '#D97706', fontSize: '0.72rem', fontWeight: 700 }}>
                                <WhatshotRoundedIcon sx={{ fontSize: '0.85rem' }} />
                                {stu.streakDays}d Streak
                              </Box>
                            </Box>
                          </TableCell>

                          {/* Status */}
                          <TableCell sx={{ borderColor: '#E2E8F0' }}>
                            <Chip
                              label={stu.status}
                              size="small"
                              sx={{
                                height: 22,
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                borderRadius: '9999px',
                                bgcolor: stu.status === 'Active' ? '#F0FDF4' : '#F1F5F9',
                                color: stu.status === 'Active' ? '#16A34A' : '#64748B',
                                border: '1px solid',
                                borderColor: stu.status === 'Active' ? '#BBF7D0' : '#CBD5E1',
                              }}
                            />
                          </TableCell>

                          {/* Actions */}
                          <TableCell align="right" sx={{ pr: 2.5, borderColor: '#E2E8F0' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                              {/* Assign Batch Action */}
                              <Tooltip title="Assign to Batch / Cohort">
                                <IconButton
                                  size="small"
                                  onClick={() => handleOpenAssignBatchSingle(stu)}
                                  sx={{
                                    color: '#2563EB',
                                    borderRadius: '9999px',
                                    bgcolor: 'rgba(37, 99, 235, 0.06)',
                                    '&:hover': { color: '#1D4ED8', bgcolor: 'rgba(37, 99, 235, 0.14)' },
                                  }}
                                >
                                  <SchoolRoundedIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                              </Tooltip>

                              {/* Peek Quick View */}
                              <Tooltip title="Quick Peek Profile">
                                <IconButton
                                  size="small"
                                  onClick={() => setPeekStudent(stu)}
                                  sx={{
                                    color: '#64748B',
                                    borderRadius: '9999px',
                                    '&:hover': { color: '#2563EB', bgcolor: '#EFF6FF' },
                                  }}
                                >
                                  <VisibilityRoundedIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>

                              {/* Full Profile Link */}
                              <Link href={`/superadmin/students/${stu.id}`} passHref style={{ textDecoration: 'none' }}>
                                <IconButton
                                  size="small"
                                  sx={{
                                    color: '#64748B',
                                    borderRadius: '9999px',
                                    '&:hover': { color: '#0F172A', bgcolor: '#F1F5F9' },
                                  }}
                                >
                                  <FluidArrowRight size={16} />
                                </IconButton>
                              </Link>
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Full-Pill Pagination Bar (Rule 10 & Pill Standards - Light Theme) */}
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
              {/* Left: Total Range & Rows Per Page */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Typography variant="body2" sx={{ color: '#64748B', fontSize: '0.82rem' }}>
                  Showing{' '}
                  <Typography component="span" sx={{ color: '#0F172A', fontWeight: 700 }}>
                    {processedStudents.length === 0 ? 0 : page * rowsPerPage + 1}–
                    {Math.min((page + 1) * rowsPerPage, processedStudents.length)}
                  </Typography>{' '}
                  of{' '}
                  <Typography component="span" sx={{ color: '#0F172A', fontWeight: 700 }}>
                    {processedStudents.length}
                  </Typography>{' '}
                  students
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="caption" sx={{ color: '#64748B' }}>
                    Rows per page:
                  </Typography>
                  <Select
                    size="small"
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(Number(e.target.value));
                      setPage(0);
                    }}
                    sx={{
                      bgcolor: '#FFFFFF',
                      color: '#0F172A',
                      borderRadius: '9999px',
                      fontSize: '0.78rem',
                      height: 28,
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' },
                      '& .MuiSvgIcon-root': { color: '#64748B' },
                    }}
                  >
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={25}>25</MenuItem>
                    <MenuItem value={50}>50</MenuItem>
                    <MenuItem value={100}>100</MenuItem>
                  </Select>
                </Box>
              </Box>

              {/* Right: Full-Pill Navigation Controls */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                <IconButton
                  size="small"
                  disabled={page === 0}
                  onClick={() => setPage(0)}
                  sx={{
                    borderRadius: '9999px',
                    width: 32,
                    height: 32,
                    border: '1px solid #E2E8F0',
                    color: '#64748B',
                    bgcolor: '#FFFFFF',
                    '&:hover': { bgcolor: '#F1F5F9', color: '#0F172A' },
                    '&.Mui-disabled': { color: '#CBD5E1', borderColor: '#F1F5F9' },
                  }}
                >
                  <FirstPageRoundedIcon fontSize="small" />
                </IconButton>

                <IconButton
                  size="small"
                  disabled={page === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  sx={{
                    borderRadius: '9999px',
                    width: 32,
                    height: 32,
                    border: '1px solid #E2E8F0',
                    color: '#64748B',
                    bgcolor: '#FFFFFF',
                    '&:hover': { bgcolor: '#F1F5F9', color: '#0F172A' },
                    '&.Mui-disabled': { color: '#CBD5E1', borderColor: '#F1F5F9' },
                  }}
                >
                  <ChevronLeftRoundedIcon fontSize="small" />
                </IconButton>

                {/* Page Number Pills */}
                {Array.from({ length: totalPages }, (_, i) => i)
                  .filter((p) => p === 0 || p === totalPages - 1 || Math.abs(p - page) <= 1)
                  .map((p, idx, arr) => {
                    const showEllipsis = idx > 0 && p - arr[idx - 1] > 1;
                    return (
                      <React.Fragment key={p}>
                        {showEllipsis && (
                          <Typography variant="caption" sx={{ color: '#94A3B8', px: 0.5 }}>
                            …
                          </Typography>
                        )}
                        <Button
                          size="small"
                          onClick={() => setPage(p)}
                          sx={{
                            minWidth: 32,
                            height: 32,
                            p: 0,
                            borderRadius: '9999px',
                            fontSize: '0.78rem',
                            fontWeight: page === p ? 800 : 500,
                            bgcolor: page === p ? '#2563EB' : '#FFFFFF',
                            color: page === p ? '#FFFFFF' : '#64748B',
                            border: '1px solid',
                            borderColor: page === p ? '#2563EB' : '#E2E8F0',
                            '&:hover': {
                              bgcolor: page === p ? '#1D4ED8' : '#F1F5F9',
                              color: page === p ? '#FFFFFF' : '#0F172A',
                            },
                          }}
                        >
                          {p + 1}
                        </Button>
                      </React.Fragment>
                    );
                  })}

                <IconButton
                  size="small"
                  disabled={page >= totalPages - 1 || totalPages === 0}
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  sx={{
                    borderRadius: '9999px',
                    width: 32,
                    height: 32,
                    border: '1px solid #E2E8F0',
                    color: '#64748B',
                    bgcolor: '#FFFFFF',
                    '&:hover': { bgcolor: '#F1F5F9', color: '#0F172A' },
                    '&.Mui-disabled': { color: '#CBD5E1', borderColor: '#F1F5F9' },
                  }}
                >
                  <ChevronRightRoundedIcon fontSize="small" />
                </IconButton>

                <IconButton
                  size="small"
                  disabled={page >= totalPages - 1 || totalPages === 0}
                  onClick={() => setPage(totalPages - 1)}
                  sx={{
                    borderRadius: '9999px',
                    width: 32,
                    height: 32,
                    border: '1px solid #E2E8F0',
                    color: '#64748B',
                    bgcolor: '#FFFFFF',
                    '&:hover': { bgcolor: '#F1F5F9', color: '#0F172A' },
                    '&.Mui-disabled': { color: '#CBD5E1', borderColor: '#F1F5F9' },
                  }}
                >
                  <LastPageRoundedIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          </Card>
        </Box>
      </Box>

      {/* Modals & Drawers */}
      <CreateStudentModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleAddStudent}
      />

      <BulkImportStudentsModal
        open={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
        onImportSuccess={(count) => {
          toast.success(`Successfully imported ${count} students into database roster.`, 'Roster Imported');
        }}
      />

      <CompareStudentsModal
        open={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        selectedStudents={selectedStudentsForCompare}
      />

      <StudentQuickPeekDrawer
        open={Boolean(peekStudent)}
        onClose={() => setPeekStudent(null)}
        student={peekStudent}
      />

      <AssignBatchModal
        open={isAssignBatchOpen}
        onClose={() => setIsAssignBatchOpen(false)}
        students={assignBatchTargets}
        onAssignedSuccess={handleAssignedSuccess}
      />

      {/* Deletion Confirmation Modal */}
      <DeleteConfirmModal
        open={Boolean(deleteTargetStudents)}
        onClose={() => setDeleteTargetStudents(null)}
        onConfirm={handleConfirmDelete}
        title={
          deleteTargetStudents && deleteTargetStudents.length > 1
            ? `Delete ${deleteTargetStudents.length} Student Records`
            : 'Delete Student Record'
        }
        subtitle={
          deleteTargetStudents && deleteTargetStudents.length > 1
            ? `Are you sure you want to delete ${deleteTargetStudents.length} selected student profiles?`
            : 'Are you sure you want to permanently delete this student record?'
        }
        warningNote={
          deleteTargetStudents && deleteTargetStudents.length > 1
            ? `Deleting ${deleteTargetStudents.length} student records will purge contest participation history, submissions, and ranking data.`
            : 'This will permanently remove the student profile, leaderboard ranking, solved problems history, and contest scores.'
        }
        confirmLabel={
          deleteTargetStudents && deleteTargetStudents.length > 1
            ? `Delete ${deleteTargetStudents.length} Students`
            : 'Delete Student'
        }
        items={
          deleteTargetStudents?.map((s) => ({
            id: s.id,
            title: s.name,
            subtitle: `@${s.handle} • ID: ${s.studentId}`,
            extraInfo: `${s.institutionName} • Rank #${s.globalRank} (${s.ratingTier})`,
            badge: s.ratingTier,
            badgeColor: { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE' },
            avatarUrl: s.avatarUrl,
            avatarColor: s.avatarColor,
          })) || []
        }
      />
    </Box>
  );
}
