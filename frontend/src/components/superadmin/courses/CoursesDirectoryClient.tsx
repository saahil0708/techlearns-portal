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
  LinearProgress,
  Divider,
} from '@mui/material';
import Link from 'next/link';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import LayersRoundedIcon from '@mui/icons-material/LayersRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import FirstPageRoundedIcon from '@mui/icons-material/FirstPageRounded';
import LastPageRoundedIcon from '@mui/icons-material/LastPageRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import TableChartRoundedIcon from '@mui/icons-material/TableChartRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import { FluidArrowRight } from '@/utils/fluid_arrow';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import FilterAltOffRoundedIcon from '@mui/icons-material/FilterAltOffRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import StarsRoundedIcon from '@mui/icons-material/StarsRounded';

import dynamic from 'next/dynamic';

// Layout & Modals
import FloatingSidebar from '@/components/superadmin/layout/CurvedSidebar';
import Navbar from '@/components/superadmin/layout/Navbar';
import { apiService } from '@/lib/api-service';
import { useToast } from '@/context/ToastContext';
import StatsCard from '@/components/superadmin/shared/StatsCard';
import type { CourseDirectoryEntity, CourseCategory, CourseLevel, ModuleHighlight, NewCourseData } from '@/types/course';
export type { CourseDirectoryEntity, CourseCategory, CourseLevel, ModuleHighlight, NewCourseData };

const CreateCourseModal = dynamic(() => import('@/components/superadmin/courses/CreateCourseModal'), { loading: () => null });
const CourseQuickPeekDrawer = dynamic(() => import('@/components/superadmin/courses/CourseQuickPeekDrawer'), { loading: () => null });
const DeleteConfirmModal = dynamic(() => import('@/components/superadmin/shared/DeleteConfirmModal'), { loading: () => null });
const BulkActionBar = dynamic(() => import('@/components/superadmin/shared/BulkActionBar'), { loading: () => null });

type SortField = 'title' | 'code' | 'level' | 'durationHours' | 'enrolledStudents' | 'completionRate';
type SortDirection = 'asc' | 'desc';

interface CoursesDirectoryClientProps {
  initialCourses: CourseDirectoryEntity[];
}

export default function CoursesDirectoryClient({ initialCourses }: CoursesDirectoryClientProps) {
  const toast = useToast();
  const [courses, setCourses] = useState<CourseDirectoryEntity[]>(initialCourses);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>('ALL');
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');

  // Client-side live data refresh
  React.useEffect(() => {
    async function loadLiveCourses() {
      try {
        const liveData = await apiService.getCourses({ limit: 50 });
        if (liveData?.items && liveData.items.length > 0) {
          const mapped: CourseDirectoryEntity[] = liveData.items.map((c: any, idx: number) => ({
            id: c.id,
            code: `CRS-${String(idx + 1).padStart(3, '0')}`,
            slug: c.title ? c.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') : `course-${idx + 1}`,
            title: c.title,
            category: 'Computer Science & DSA' as const,
            level: 'Intermediate' as const,
            instructorName: 'Faculty Lead',
            instructorTitle: 'Course Instructor',
            institutionName: c.college?.name || 'Academic Campus',
            durationHours: 40,
            modulesCount: c._count?.modules || 8,
            lessonsCount: 32,
            enrolledStudents: c._count?.enrollments || 120,
            completionRate: 75,
            status: 'Published' as const,
            tags: ['Computer Science', 'Programming'],
            description: c.description || 'Comprehensive programming curriculum with hands-on coding challenges.',
            accentColor: ['#2563EB', '#7C3AED', '#DC2626', '#059669', '#D97706'][idx % 5],
            moduleHighlights: [
              { title: 'Foundations & Core Principles', lessons: 8 },
              { title: 'Intermediate Data Structures', lessons: 12 },
              { title: 'Advanced Algorithms & Problem Solving', lessons: 12 },
            ],
          }));
          setCourses(mapped);
        }
      } catch (err) {
        console.warn('Live courses fetch on client:', err);
      }
    }
    loadLiveCourses();
  }, []);

  // Sorting State
  const [sortField, setSortField] = useState<SortField>('enrolledStudents');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Selection & Modals State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [peekCourse, setPeekCourse] = useState<CourseDirectoryEntity | null>(null);
  const [deleteTargetCourses, setDeleteTargetCourses] = useState<CourseDirectoryEntity[] | null>(null);
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);

  // Pagination states
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  const borderColor = '#E2E8F0';

  // Handle Sort Change
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Delete Handlers
  const _handleRequestDeleteSingle = (course: CourseDirectoryEntity) => {
    setDeleteTargetCourses([course]);
  };

  const handleRequestDeleteBulk = () => {
    const targets = courses.filter((c) => selectedIds.includes(c.id));
    if (targets.length > 0) {
      setDeleteTargetCourses(targets);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetCourses) return;
    const targetIds = new Set(deleteTargetCourses.map((c) => c.id));
    const count = deleteTargetCourses.length;
    const targetsToDelete = [...deleteTargetCourses];
    setCourses((prev) => prev.filter((c) => !targetIds.has(c.id)));
    setSelectedIds((prev) => prev.filter((id) => !targetIds.has(id)));
    setDeleteTargetCourses(null);

    // Call live API to delete course records from database
    for (const target of targetsToDelete) {
      try {
        await apiService.deleteCourse(target.id);
      } catch (err) {
        console.error(`Failed to delete course ${target.id}:`, err);
      }
    }
    toast.success(`Deleted ${count} curriculum course${count > 1 ? 's' : ''}.`, 'Course Management');
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategoryTab('ALL');
    setSelectedLevelFilter('ALL');
    setSelectedStatusFilter('ALL');
    setPage(0);
  };

  const isFilterActive =
    searchQuery ||
    selectedCategoryTab !== 'ALL' ||
    selectedLevelFilter !== 'ALL' ||
    selectedStatusFilter !== 'ALL';

  // Filter & Sort
  const processedCourses = useMemo(() => {
    return courses
      .filter((course) => {
        if (selectedCategoryTab !== 'ALL' && course.category !== selectedCategoryTab) return false;
        if (selectedLevelFilter !== 'ALL' && course.level !== selectedLevelFilter) return false;
        if (selectedStatusFilter !== 'ALL' && course.status !== selectedStatusFilter) return false;

        if (
          searchQuery &&
          !course.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !course.code.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !course.instructorName.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !course.institutionName.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !course.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
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
  }, [courses, searchQuery, selectedCategoryTab, selectedLevelFilter, selectedStatusFilter, sortField, sortDirection]);

  // Paginated Slices
  const paginatedCourses = useMemo(() => {
    const start = page * rowsPerPage;
    return processedCourses.slice(start, start + rowsPerPage);
  }, [processedCourses, page, rowsPerPage]);

  const totalPages = Math.max(1, Math.ceil(processedCourses.length / rowsPerPage));

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(processedCourses.map((c) => c.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  // Stats Counters
  const totalCount = courses.length;
  const dsaCount = courses.filter((c) => c.category === 'Computer Science & DSA').length;
  const sysDesignCount = courses.filter((c) => c.category === 'System Design & Architecture').length;
  const fullstackCount = courses.filter((c) => c.category === 'Web & Full-Stack Development').length;
  const cpCount = courses.filter((c) => c.category === 'Competitive Programming').length;
  const aiCount = courses.filter((c) => c.category === 'AI, ML & Data Science').length;

  const totalEnrollments = courses.reduce((acc, c) => acc + c.enrolledStudents, 0);
  const totalLessons = courses.reduce((acc, c) => acc + c.lessonsCount, 0);
  const avgCompletion = Math.round(courses.reduce((acc, c) => acc + c.completionRate, 0) / (courses.length || 1));

  // Add new course handler
  const handleAddCourse = async (newData: NewCourseData) => {
    try {
      const created = await apiService.createCourse({
        title: newData.title,
        description: newData.description,
        status: newData.status.toUpperCase(),
      });

      const newCourse: CourseDirectoryEntity = {
        id: created?.id || `crs-${Date.now()}`,
        code: newData.code,
        slug: newData.slug,
        title: newData.title,
        category: newData.category,
        level: newData.level,
        instructorName: newData.instructorName,
        instructorTitle: newData.instructorTitle,
        institutionName: newData.institutionName,
        durationHours: newData.durationHours,
        modulesCount: newData.modulesCount,
        lessonsCount: newData.lessonsCount,
        enrolledStudents: 0,
        completionRate: 0,
        status: newData.status,
        tags: newData.tags,
        description: newData.description,
        accentColor: '#2563EB',
        moduleHighlights: [
          { title: 'Foundations & Architecture', lessons: Math.ceil(newData.lessonsCount / 3) },
          { title: 'Core Implementation & Labs', lessons: Math.ceil(newData.lessonsCount / 3) },
          { title: 'Capstone & Evaluation', lessons: Math.floor(newData.lessonsCount / 3) },
        ],
      };
      setCourses((prev) => [newCourse, ...prev]);
      toast.success(`Course "${newData.title}" created successfully.`, 'Course Published');
    } catch {
      const fallbackCourse: CourseDirectoryEntity = {
        id: `crs-${Date.now()}`,
        code: newData.code,
        slug: newData.slug,
        title: newData.title,
        category: newData.category,
        level: newData.level,
        instructorName: newData.instructorName,
        instructorTitle: newData.instructorTitle,
        institutionName: newData.institutionName,
        durationHours: newData.durationHours,
        modulesCount: newData.modulesCount,
        lessonsCount: newData.lessonsCount,
        enrolledStudents: 0,
        completionRate: 0,
        status: newData.status,
        tags: newData.tags,
        description: newData.description,
        accentColor: '#2563EB',
        moduleHighlights: [],
      };
      setCourses((prev) => [fallbackCourse, ...prev]);
      toast.info(`Course "${newData.title}" saved locally.`, 'Course Registered');
    }
  };

  // Export handlers
  const getExportData = () => {
    const listToExport = selectedIds.length > 0 ? courses.filter((c) => selectedIds.includes(c.id)) : processedCourses;
    return listToExport.map((c) => ({
      CourseCode: c.code,
      Title: c.title,
      Category: c.category,
      Level: c.level,
      Instructor: c.instructorName,
      Institution: c.institutionName,
      DurationHours: c.durationHours,
      Modules: c.modulesCount,
      Lessons: c.lessonsCount,
      EnrolledStudents: c.enrolledStudents,
      CompletionRate: `${c.completionRate}%`,
      Status: c.status,
    }));
  };

  const handleExportCSV = () => {
    const data = getExportData();
    if (data.length === 0) return;
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map((row) =>
      Object.values(row)
        .map((val) => `"${val}"`)
        .join(',')
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Courses_Curriculum_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setExportMenuAnchor(null);
  };

  const handleExportExcel = () => {
    const data = getExportData();
    if (data.length === 0) return;
    const headers = Object.keys(data[0]);
    let tableHtml = '<table border="1"><thead><tr>';
    headers.forEach((h) => (tableHtml += `<th>${h}</th>`));
    tableHtml += '</tr></thead><tbody>';
    data.forEach((row) => {
      tableHtml += '<tr>';
      Object.values(row).forEach((v) => (tableHtml += `<td>${v}</td>`));
      tableHtml += '</tr>';
    });
    tableHtml += '</tbody></table>';

    const blob = new Blob([tableHtml], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Courses_Directory_${new Date().toISOString().slice(0, 10)}.xls`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setExportMenuAnchor(null);
  };

  const getLevelStyle = (lvl: CourseLevel) => {
    switch (lvl) {
      case 'Beginner':
        return { bg: '#F0FDF4', text: '#16A34A', border: '#BBF7D0' };
      case 'Intermediate':
        return { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE' };
      case 'Advanced':
        return { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' };
      default:
        return { bg: '#F8FAFC', text: '#64748B', border: '#E2E8F0' };
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        bgcolor: '#F8FAFC',
        backgroundImage: `
          radial-gradient(ellipse at 15% 10%, rgba(99, 102, 241, 0.05) 0%, transparent 40%),
          radial-gradient(ellipse at 85% 20%, rgba(37, 99, 235, 0.04) 0%, transparent 45%),
          radial-gradient(ellipse at 50% 90%, rgba(14, 165, 233, 0.04) 0%, transparent 50%)
        `,
        color: '#0F172A',
        p: { xs: 1.5, sm: 2, md: 2.5 },
        pl: { xs: '82px', sm: '90px', md: '102px' },
        gap: { xs: 2, md: 3 },
      }}
    >
      {/* 1. Left Floating Sidebar Navigation */}
      <FloatingSidebar />

      {/* Main Content Area */}
      <Box component="main" sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Unified Layout Container: Navbar + Page Content */}
        <Box sx={{ maxWidth: 1400, width: '100%', mx: 'auto', px: { xs: 3, md: 5 }, display: 'flex', flexDirection: 'column', gap: 4, pb: { xs: 4, md: 6 } }}>
          {/* 2. Top Header Navbar */}
          <Navbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

          {/* Breadcrumb & Top Action Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="caption" sx={{ color: '#2563EB', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  CURRICULUM & LEARNING LABS
                </Typography>
                <Chip
                  label="Interactive Syllabus"
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    bgcolor: '#EFF6FF',
                    color: '#2563EB',
                    borderRadius: '9999px',
                    border: '1px solid #DBEAFE',
                  }}
                />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', mt: 0.5, letterSpacing: '-0.02em' }}>
                Courses & Interactive Modules
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>
                Manage college-accredited syllabi, module tracks, lesson sandboxes, and student progress tracking.
              </Typography>
            </Box>

            {/* Top Bar Quick Action Buttons */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
              {/* Export Button with Menu */}
              <Button
                variant="outlined"
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
                  '&:hover': { bgcolor: '#F8FAFC', color: '#0F172A' },
                }}
              >
                Export
              </Button>
              <Menu
                anchorEl={exportMenuAnchor}
                open={Boolean(exportMenuAnchor)}
                onClose={() => setExportMenuAnchor(null)}
                slotProps={{
                  paper: {
                    sx: {
                      borderRadius: '14px',
                      mt: 1,
                      border: `1px solid ${borderColor}`,
                      boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                      minWidth: 180,
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

              {/* Create Course Button */}
              <Button
                variant="contained"
                onClick={() => setIsCreateModalOpen(true)}
                startIcon={<AddCircleRoundedIcon sx={{ fontSize: 18 }} />}
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
                Create New Course
              </Button>
            </Box>
          </Box>

          {/* 4 Summary Metric Cards (Light Royal Blue Standard) */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2.5 }}>
            <StatsCard
              title="Total Published Courses"
              value={totalCount}
              icon={<MenuBookRoundedIcon sx={{ fontSize: 20 }} />}
              variant="blue"
              shape="mountains"
              subtitle={`${dsaCount} DSA • ${sysDesignCount} System Design`}
            />

            <StatsCard
              title="Active Student Enrollments"
              value={totalEnrollments.toLocaleString()}
              icon={<PeopleAltRoundedIcon sx={{ fontSize: 20 }} />}
              variant="black"
              shape="curves"
              subtitle="Across college cohorts"
            />

            <StatsCard
              title="Curriculum Lessons"
              value={totalLessons}
              icon={<LayersRoundedIcon sx={{ fontSize: 20 }} />}
              variant="blue"
              shape="peaks"
              subtitle="Interactive Code Labs"
            />

            <StatsCard
              title="Avg. Completion Rate"
              value={`${avgCompletion}%`}
              icon={<StarsRoundedIcon sx={{ fontSize: 20 }} />}
              variant="black"
              shape="waves"
              subtitle="Passed evaluations"
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
            {/* MUI Tabs for Categories */}
            <Box sx={{ borderBottom: `1px solid ${borderColor}`, px: { xs: 2, md: 3 }, pt: 0.5, bgcolor: '#FFFFFF' }}>
              <Tabs
                value={selectedCategoryTab}
                onChange={(_, newValue) => {
                  setSelectedCategoryTab(newValue);
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
                  { id: 'ALL', label: 'All Courses', count: totalCount },
                  { id: 'Computer Science & DSA', label: 'CS & DSA', count: dsaCount },
                  { id: 'System Design & Architecture', label: 'System Design', count: sysDesignCount },
                  { id: 'Web & Full-Stack Development', label: 'Full-Stack Web', count: fullstackCount },
                  { id: 'Competitive Programming', label: 'Competitive Coding', count: cpCount },
                  { id: 'AI, ML & Data Science', label: 'AI & Data Science', count: aiCount },
                ].map((tab) => (
                  <Tab
                    key={tab.id}
                    value={tab.id}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{ fontWeight: selectedCategoryTab === tab.id ? 700 : 600, fontSize: '0.84rem' }}>
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
                            bgcolor: selectedCategoryTab === tab.id ? '#EFF6FF' : '#F1F5F9',
                            color: selectedCategoryTab === tab.id ? '#2563EB' : '#64748B',
                            border: '1px solid',
                            borderColor: selectedCategoryTab === tab.id ? '#BFDBFE' : '#E2E8F0',
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
                      color: selectedCategoryTab === tab.id ? '#2563EB !important' : '#64748B',
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
                placeholder="Search by course title, code (e.g. CS-301), instructor, institution, or tag..."
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

                {/* Level Filter */}
                <Select
                  size="small"
                  value={selectedLevelFilter}
                  onChange={(e) => {
                    setSelectedLevelFilter(e.target.value);
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
                  <MenuItem value="ALL" sx={{ fontSize: '0.8rem' }}>All Levels</MenuItem>
                  <MenuItem value="Beginner" sx={{ fontSize: '0.8rem' }}>🟢 Beginner</MenuItem>
                  <MenuItem value="Intermediate" sx={{ fontSize: '0.8rem' }}>🟡 Intermediate</MenuItem>
                  <MenuItem value="Advanced" sx={{ fontSize: '0.8rem' }}>🔴 Advanced</MenuItem>
                </Select>

                {/* Status Filter */}
                <Select
                  size="small"
                  value={selectedStatusFilter}
                  onChange={(e) => {
                    setSelectedStatusFilter(e.target.value);
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
                  <MenuItem value="Published" sx={{ fontSize: '0.8rem' }}>Published Only</MenuItem>
                  <MenuItem value="Draft" sx={{ fontSize: '0.8rem' }}>Draft Only</MenuItem>
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
          />

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
                        indeterminate={selectedIds.length > 0 && selectedIds.length < processedCourses.length}
                        checked={processedCourses.length > 0 && selectedIds.length === processedCourses.length}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        sx={{
                          color: '#CBD5E1',
                          '&.Mui-checked, &.MuiCheckbox-indeterminate': { color: '#2563EB' },
                        }}
                      />
                    </TableCell>

                    {/* Course Title & Code Header (Sortable) */}
                    <TableCell
                      onClick={() => handleSort('title')}
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
                        Course & Code
                        {sortField === 'title' &&
                          (sortDirection === 'asc' ? (
                            <ArrowUpwardRoundedIcon sx={{ fontSize: '0.85rem', color: '#2563EB' }} />
                          ) : (
                            <ArrowDownwardRoundedIcon sx={{ fontSize: '0.85rem', color: '#2563EB' }} />
                          ))}
                      </Box>
                    </TableCell>

                    {/* Category & Level */}
                    <TableCell
                      onClick={() => handleSort('level')}
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
                        Level & Domain
                        {sortField === 'level' &&
                          (sortDirection === 'asc' ? (
                            <ArrowUpwardRoundedIcon sx={{ fontSize: '0.85rem', color: '#2563EB' }} />
                          ) : (
                            <ArrowDownwardRoundedIcon sx={{ fontSize: '0.85rem', color: '#2563EB' }} />
                          ))}
                      </Box>
                    </TableCell>

                    {/* Instructor / Faculty */}
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
                      Lead Faculty
                    </TableCell>

                    {/* Syllabus Structure */}
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
                      Curriculum Units
                    </TableCell>

                    {/* Enrolled Students (Sortable) */}
                    <TableCell
                      onClick={() => handleSort('enrolledStudents')}
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
                        Enrollments
                        {sortField === 'enrolledStudents' &&
                          (sortDirection === 'asc' ? (
                            <ArrowUpwardRoundedIcon sx={{ fontSize: '0.85rem', color: '#2563EB' }} />
                          ) : (
                            <ArrowDownwardRoundedIcon sx={{ fontSize: '0.85rem', color: '#2563EB' }} />
                          ))}
                      </Box>
                    </TableCell>

                    {/* Completion Rate (Sortable) */}
                    <TableCell
                      onClick={() => handleSort('completionRate')}
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
                        Completion %
                        {sortField === 'completionRate' &&
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
                  {paginatedCourses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} sx={{ textAlign: 'center', py: 8, borderColor: '#E2E8F0' }}>
                        <Typography variant="subtitle1" sx={{ color: '#64748B', fontWeight: 600 }}>
                          No courses found matching your criteria.
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
                    paginatedCourses.map((course) => {
                      const isSelected = selectedIds.includes(course.id);
                      const levelStyle = getLevelStyle(course.level);

                      return (
                        <TableRow
                          key={course.id}
                          selected={isSelected}
                          sx={{
                            transition: 'all 0.15s ease',
                            borderColor: '#E2E8F0',
                            bgcolor: isSelected ? '#EFF6FF' : '#FFFFFF',
                            '&:hover': {
                              bgcolor: isSelected ? '#DBEAFE' : '#F8FAFC',
                            },
                          }}
                        >
                          {/* Row Checkbox */}
                          <TableCell padding="checkbox" sx={{ pl: 2.5, borderColor: '#E2E8F0' }}>
                            <Checkbox
                              checked={isSelected}
                              onChange={() => handleToggleSelectRow(course.id)}
                              sx={{
                                color: '#CBD5E1',
                                '&.Mui-checked': { color: '#2563EB' },
                              }}
                            />
                          </TableCell>

                          {/* Course Title & Code Column */}
                          <TableCell sx={{ borderColor: '#E2E8F0' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Avatar
                                sx={{
                                  width: 38,
                                  height: 38,
                                  bgcolor: course.accentColor,
                                  fontWeight: 800,
                                  fontSize: '0.85rem',
                                  border: '2px solid #E2E8F0',
                                }}
                              >
                                {course.code.slice(0, 2)}
                              </Avatar>
                              <Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                  <Typography
                                    onClick={() => setPeekCourse(course)}
                                    sx={{
                                      fontWeight: 700,
                                      color: '#0F172A',
                                      fontSize: '0.88rem',
                                      cursor: 'pointer',
                                      '&:hover': { color: '#2563EB', textDecoration: 'underline' },
                                    }}
                                  >
                                    {course.title}
                                  </Typography>
                                  <Typography
                                    sx={{
                                      color: '#2563EB',
                                      fontSize: '0.74rem',
                                      fontFamily: 'monospace',
                                      fontWeight: 700,
                                      whiteSpace: 'nowrap',
                                      flexShrink: 0,
                                    }}
                                  >
                                    [{course.code}]
                                  </Typography>
                                </Box>
                                <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
                                  {course.tags.slice(0, 3).join(' • ')}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>

                          {/* Level & Category */}
                          <TableCell sx={{ borderColor: '#E2E8F0' }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'flex-start' }}>
                              <Chip
                                label={course.level}
                                size="small"
                                sx={{
                                  height: 20,
                                  fontSize: '0.68rem',
                                  fontWeight: 700,
                                  borderRadius: '9999px',
                                  bgcolor: levelStyle.bg,
                                  color: levelStyle.text,
                                  border: `1px solid ${levelStyle.border}`,
                                }}
                              />
                              <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.72rem' }}>
                                {course.category}
                              </Typography>
                            </Box>
                          </TableCell>

                          {/* Instructor */}
                          <TableCell sx={{ borderColor: '#E2E8F0' }}>
                            <Box>
                              <Typography sx={{ fontWeight: 600, color: '#0F172A', fontSize: '0.82rem' }}>
                                {course.instructorName}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.72rem' }}>
                                {course.institutionName}
                              </Typography>
                            </Box>
                          </TableCell>

                          {/* Syllabus Units */}
                          <TableCell sx={{ borderColor: '#E2E8F0' }}>
                            <Box>
                              <Typography sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.82rem' }}>
                                {course.modulesCount} Modules
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.72rem' }}>
                                {course.lessonsCount} Lessons • {course.durationHours}h
                              </Typography>
                            </Box>
                          </TableCell>

                          {/* Enrollments */}
                          <TableCell sx={{ borderColor: '#E2E8F0' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                              <PeopleAltRoundedIcon sx={{ fontSize: 16, color: '#2563EB' }} />
                              <Typography sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.84rem' }}>
                                {course.enrolledStudents.toLocaleString()}
                              </Typography>
                            </Box>
                          </TableCell>

                          {/* Completion Rate Progress */}
                          <TableCell sx={{ borderColor: '#E2E8F0', minWidth: 120 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LinearProgress
                                variant="determinate"
                                value={course.completionRate}
                                sx={{
                                  flex: 1,
                                  height: 6,
                                  borderRadius: '9999px',
                                  bgcolor: '#F1F5F9',
                                  '& .MuiLinearProgress-bar': {
                                    bgcolor: course.completionRate > 75 ? '#16A34A' : course.completionRate > 50 ? '#2563EB' : '#D97706',
                                    borderRadius: '9999px',
                                  },
                                }}
                              />
                              <Typography sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.75rem', width: 32 }}>
                                {course.completionRate}%
                              </Typography>
                            </Box>
                          </TableCell>

                          {/* Status */}
                          <TableCell sx={{ borderColor: '#E2E8F0' }}>
                            <Chip
                              label={course.status}
                              size="small"
                              sx={{
                                height: 22,
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                borderRadius: '9999px',
                                bgcolor: course.status === 'Published' ? '#F0FDF4' : '#FFFBEB',
                                color: course.status === 'Published' ? '#16A34A' : '#D97706',
                                border: '1px solid',
                                borderColor: course.status === 'Published' ? '#BBF7D0' : '#FDE68A',
                              }}
                            />
                          </TableCell>

                          {/* Actions */}
                          <TableCell align="right" sx={{ pr: 2.5, borderColor: '#E2E8F0' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                              {/* Peek Quick View */}
                              <Tooltip title="Quick Peek Syllabus">
                                <IconButton
                                  size="small"
                                  onClick={() => setPeekCourse(course)}
                                  sx={{
                                    color: '#64748B',
                                    borderRadius: '9999px',
                                    '&:hover': { color: '#2563EB', bgcolor: '#EFF6FF' },
                                  }}
                                >
                                  <VisibilityRoundedIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>

                              {/* Full Course Link */}
                              <Link href={`/superadmin/courses/${course.slug}`} passHref style={{ textDecoration: 'none' }}>
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
                  <strong style={{ color: '#0F172A' }}>
                    {processedCourses.length === 0 ? 0 : page * rowsPerPage + 1}
                  </strong>{' '}
                  to{' '}
                  <strong style={{ color: '#0F172A' }}>
                    {Math.min((page + 1) * rowsPerPage, processedCourses.length)}
                  </strong>{' '}
                  of <strong style={{ color: '#0F172A' }}>{processedCourses.length}</strong> courses
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600 }}>
                    Per Page:
                  </Typography>
                  <Select
                    size="small"
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(Number(e.target.value));
                      setPage(0);
                    }}
                    sx={{
                      height: 28,
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      borderRadius: '9999px',
                      bgcolor: '#F8FAFC',
                      color: '#0F172A',
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' },
                    }}
                  >
                    <MenuItem value={10} sx={{ fontSize: '0.8rem' }}>10</MenuItem>
                    <MenuItem value={25} sx={{ fontSize: '0.8rem' }}>25</MenuItem>
                    <MenuItem value={50} sx={{ fontSize: '0.8rem' }}>50</MenuItem>
                  </Select>
                </Box>
              </Box>

              {/* Right: Full Pill Page Navigation */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
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
                  onClick={() => setPage((prev) => Math.max(0, prev - 1))}
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

                {/* Page Indicator Badge */}
                <Box
                  sx={{
                    px: 2,
                    py: 0.5,
                    bgcolor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '9999px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: '#0F172A',
                  }}
                >
                  Page {page + 1} of {totalPages}
                </Box>

                <IconButton
                  size="small"
                  disabled={page >= totalPages - 1 || totalPages === 0}
                  onClick={() => setPage((prev) => Math.min(totalPages - 1, prev + 1))}
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
      <CreateCourseModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleAddCourse}
      />

      <CourseQuickPeekDrawer
        open={Boolean(peekCourse)}
        onClose={() => setPeekCourse(null)}
        course={peekCourse}
      />

      {/* Deletion Confirmation Modal */}
      <DeleteConfirmModal
        open={Boolean(deleteTargetCourses)}
        onClose={() => setDeleteTargetCourses(null)}
        onConfirm={handleConfirmDelete}
        title={
          deleteTargetCourses && deleteTargetCourses.length > 1
            ? `Delete ${deleteTargetCourses.length} Courses`
            : 'Delete Course'
        }
        subtitle={
          deleteTargetCourses && deleteTargetCourses.length > 1
            ? `Are you sure you want to delete ${deleteTargetCourses.length} selected courses?`
            : 'Are you sure you want to permanently delete this course syllabus?'
        }
        warningNote={
          deleteTargetCourses && deleteTargetCourses.length > 1
            ? `Permanently deleting ${deleteTargetCourses.length} courses will remove syllabus modules, lesson content, and student completion records.`
            : 'This action is irreversible. All module lessons, coding sandbox test cases, and student progress will be permanently removed.'
        }
        confirmLabel={
          deleteTargetCourses && deleteTargetCourses.length > 1
            ? `Delete ${deleteTargetCourses.length} Courses`
            : 'Delete Course'
        }
        items={
          deleteTargetCourses?.map((c) => ({
            id: c.id,
            title: c.title,
            subtitle: `CODE: ${c.code} • ${c.instructorName}`,
            extraInfo: `${c.modulesCount} Modules • ${c.enrolledStudents.toLocaleString()} Students`,
            badge: c.level,
            badgeColor: getLevelStyle(c.level),
            avatarColor: c.accentColor,
          })) || []
        }
      />
    </Box>
  );
}
