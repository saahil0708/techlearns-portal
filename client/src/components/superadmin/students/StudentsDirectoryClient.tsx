'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Button,
  Tooltip,
} from '@mui/material';
import { useRouter } from 'next/navigation';

// Icons
import CompareArrowsRoundedIcon from '@mui/icons-material/CompareArrowsRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';

import dynamic from 'next/dynamic';

// Layout & Modals
import FloatingSidebar from '@/components/superadmin/layout/CurvedSidebar';
import Navbar from '@/components/superadmin/layout/Navbar';
import type { NewStudentData } from '@/components/superadmin/students/CreateStudentModal';
import { apiService } from '@/lib/api-service';
import { useToast } from '@/context/ToastContext';
import { useAppSelector } from '@/store/hooks';

// Modular Directory Subcomponents
import { StudentDirectoryEntity, SortField, SortDirection } from './directory/types';
import StudentsStatsBanner from './directory/StudentsStatsBanner';
import StudentsFilterToolbar from './directory/StudentsFilterToolbar';
import StudentsDataTable from './directory/StudentsDataTable';

const CreateStudentModal = dynamic(() => import('@/components/superadmin/students/CreateStudentModal'), { loading: () => null });
const CompareStudentsModal = dynamic(() => import('@/components/superadmin/students/CompareStudentsModal'), { loading: () => null });
const StudentQuickPeekDrawer = dynamic(() => import('@/components/superadmin/students/StudentQuickPeekDrawer'), { loading: () => null });
const BulkImportStudentsModal = dynamic(() => import('@/components/superadmin/students/BulkImportStudentsModal'), { loading: () => null });
const DeleteConfirmModal = dynamic(() => import('@/components/superadmin/shared/DeleteConfirmModal'), { loading: () => null });
const BulkActionBar = dynamic(() => import('@/components/superadmin/shared/BulkActionBar'), { loading: () => null });
const AssignBatchModal = dynamic(() => import('@/components/superadmin/students/AssignBatchModal'), { loading: () => null });
import type { AssignBatchStudentTarget } from '@/components/superadmin/students/AssignBatchModal';

export type { StudentDirectoryEntity };

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
  const [selectedTier] = useState<string>('ALL');
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
                lastActive: 'Recently',
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
    setMinSolvedFilter('ALL');
    setMinStreakFilter('ALL');
    setSelectedStatus('ALL');
    setPage(0);
  };

  const isFilterActive =
    Boolean(searchQuery) ||
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

        if (sortField === 'accuracy') {
          const numA = parseFloat(String(valA).replace('%', '')) || 0;
          const numB = parseFloat(String(valB).replace('%', '')) || 0;
          return sortDirection === 'asc' ? numA - numB : numB - numA;
        }

        if (typeof valA === 'string') {
          valA = valA.toLowerCase();
          valB = valB.toLowerCase();
        }

        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
  }, [students, searchQuery, selectedType, selectedTier, selectedStatus, minSolvedFilter, minStreakFilter, sortField, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(processedStudents.length / rowsPerPage));
  const safePage = Math.min(Math.max(0, page), totalPages - 1);

  useEffect(() => {
    if (page !== safePage) {
      setPage(safePage);
    }
  }, [page, safePage]);

  // Paginated Slices
  const paginatedStudents = useMemo(() => {
    const start = safePage * rowsPerPage;
    return processedStudents.slice(start, start + rowsPerPage);
  }, [processedStudents, safePage, rowsPerPage]);

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => {
        const set = new Set(prev);
        processedStudents.forEach((s) => set.add(s.id));
        return Array.from(set);
      });
    } else {
      const visibleIds = new Set(processedStudents.map((s) => s.id));
      setSelectedIds((prev) => prev.filter((id) => !visibleIds.has(id)));
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
  const instituteCount = students.filter((s) => s.institutionType === 'Institute').length;
  const indCount = students.filter((s) => s.institutionType === 'Independent').length;
  const activeSolversCount = students.filter((s) => s.problemsSolved > 0).length;
  const activeParticipationRate = students.length > 0 ? Math.round((activeSolversCount / students.length) * 100) : 0;
  const totalProblemsSolved = students.reduce((acc, s) => acc + s.problemsSolved, 0);
  const solvedEasyCount = students.reduce((acc, s) => acc + (s.solvedEasy || 0), 0);
  const solvedMedCount = students.reduce((acc, s) => acc + (s.solvedMedium || 0), 0);
  const solvedHardCount = students.reduce((acc, s) => acc + (s.solvedHard || 0), 0);
  const avgAccuracy = students.length > 0 ? (students.reduce((acc, s) => acc + (parseFloat(s.accuracy) || 0), 0) / students.length).toFixed(1) + '%' : '0%';

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
      lastActive: 'Just now',
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
          <Navbar
            searchQuery={searchQuery}
            onSearchChange={(q) => {
              setSearchQuery(q);
              setPage(0);
            }}
          />

          {/* 4 Summary Metric Cards */}
          <StudentsStatsBanner
            totalCount={totalCount}
            instituteCount={instituteCount}
            indCount={indCount}
            activeSolversCount={activeSolversCount}
            activeParticipationRate={activeParticipationRate}
            totalProblemsSolved={totalProblemsSolved}
            solvedEasyCount={solvedEasyCount}
            solvedMedCount={solvedMedCount}
            solvedHardCount={solvedHardCount}
            avgAccuracy={avgAccuracy}
            selectedCount={selectedIds.length}
            onExportExcel={handleExportExcel}
            onExportCSV={handleExportCSV}
            onOpenBulkImport={() => setIsBulkImportOpen(true)}
            onOpenCreateStudent={() => setIsCreateModalOpen(true)}
          />

          {/* Filter Toolbar Card with MUI Tabs */}
          <StudentsFilterToolbar
            totalCount={totalCount}
            instituteCount={instituteCount}
            indCount={indCount}
            selectedType={selectedType}
            onTypeChange={(newType: string) => {
              setSelectedType(newType);
              setPage(0);
            }}
            searchQuery={searchQuery}
            onSearchChange={(q: string) => {
              setSearchQuery(q);
              setPage(0);
            }}
            minSolvedFilter={minSolvedFilter}
            onMinSolvedFilterChange={(val: string) => {
              setMinSolvedFilter(val);
              setPage(0);
            }}
            minStreakFilter={minStreakFilter}
            onMinStreakFilterChange={(val: string) => {
              setMinStreakFilter(val);
              setPage(0);
            }}
            selectedStatus={selectedStatus}
            onStatusChange={(val: string) => {
              setSelectedStatus(val);
              setPage(0);
            }}
            isFilterActive={Boolean(isFilterActive)}
            onResetFilters={handleResetFilters}
          />

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

          {/* Structured List Table (RULE 10 STANDARD) */}
          <StudentsDataTable
            paginatedStudents={paginatedStudents}
            processedStudents={processedStudents}
            selectedIds={selectedIds}
            onSelectAll={handleSelectAll}
            onToggleSelectRow={handleToggleSelectRow}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
            page={safePage}
            rowsPerPage={rowsPerPage}
            totalPages={totalPages}
            onPageChange={setPage}
            onRowsPerPageChange={(newRows) => {
              setRowsPerPage(newRows);
              setPage(0);
            }}
            onResetFilters={handleResetFilters}
            onPeekStudent={setPeekStudent}
            onOpenAssignBatchSingle={handleOpenAssignBatchSingle}
            currentUserId={currentUser?.id}
            currentUserEmail={currentUser?.email}
            currentUserHandle={(currentUser as any)?.handle}
          />
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
