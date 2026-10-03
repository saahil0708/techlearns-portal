'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  TablePagination,
  TextField,
  InputAdornment,
  Chip,
  Button,
  Select,
  MenuItem,
  FormControl,
  Tabs,
  Tab,
  LinearProgress,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
} from '@mui/material';

// Icons
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import ViewListRoundedIcon from '@mui/icons-material/ViewListRounded';

import StudentAppLayout from '@/components/students/layout/StudentAppLayout';
import CourseGridCard from './CourseGridCard';
import { CourseDirectoryEntity, CourseLevel, CourseCategory } from '@/types/course';
import { useToast } from '@/context/ToastContext';
import { apiService } from '@/lib/api-service';

const LEVEL_COLORS: Record<CourseLevel, { bg: string; text: string }> = {
  Beginner: { bg: 'rgba(22, 163, 74, 0.1)', text: '#16A34A' },
  Intermediate: { bg: 'rgba(37, 99, 235, 0.1)', text: '#2563EB' },
  Advanced: { bg: 'rgba(124, 58, 237, 0.1)', text: '#7C3AED' },
};

export default function CourseCatalogClient() {
  const router = useRouter();
  const toast = useToast();

  const [courses, setCourses] = useState<CourseDirectoryEntity[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [reloadCounter, setReloadCounter] = useState<number>(0);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [levelFilter, setLevelFilter] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<string>('AVAILABLE');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Student progress state
  const [enrolledMap, setEnrolledMap] = useState<Record<string, number>>({});

  const handleNavigateToCourse = (course: CourseDirectoryEntity) => {
    const targetSlug = course.slug || course.id;
    router.push(`/courses/${targetSlug}`);
  };

  // Fetch live courses from API
  useEffect(() => {
    let isMounted = true;
    async function loadCourses() {
      setIsLoading(true);
      setFetchError(null);
      try {
        const [res, meRes, enrolledRes] = await Promise.all([
          apiService.getCourses({ limit: 50 }),
          apiService.getMe().catch(() => null),
          apiService.getEnrolledCourses().catch(() => null),
        ]);
        if (isMounted) {
          if (Array.isArray(res?.items)) {
            const mapped: CourseDirectoryEntity[] = res.items.map((c: any, idx: number) => {
              const totalLessons =
                c.modules?.reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0) ||
                (c._count?.lessons ?? 0);
              return {
                id: c.id,
                code: c.code || `CS-${String(100 + (idx + 1) * 100)}`,
                slug: c.slug || c.id,
                title: c.title,
                description:
                  c.description ||
                  'Comprehensive interactive curriculum covering core fundamentals and hands-on projects.',
                category: (c.category || 'Computer Science & DSA') as CourseCategory,
                level: (c.level?.toUpperCase() === 'BEGINNER'
                  ? 'Beginner'
                  : c.level?.toUpperCase() === 'ADVANCED'
                  ? 'Advanced'
                  : 'Intermediate') as CourseLevel,
                instructorName:
                  c.instructorName || c.instructor?.name || c.createdBy?.name || 'Academic Faculty',
                instructorTitle: c.instructorTitle || 'Senior Faculty Instructor',
                institutionName:
                  c.institutionName ||
                  c.institution?.name ||
                  c.college?.name ||
                  'Global Open Academy',
                durationHours: c.durationHours || (c.durationWeeks ? c.durationWeeks * 4 : 40),
                modulesCount: c.modules?.length || c._count?.modules || 0,
                lessonsCount: totalLessons,
                enrolledStudents: c.enrolledStudents || c._count?.enrollments || 0,
                completionRate: c.completionRate || 0,
                status: (c.status === 'Draft' || c.status === 'Archived'
                  ? c.status
                  : 'Published') as 'Published' | 'Draft' | 'Archived',
                tags: Array.isArray(c.tags) && c.tags.length > 0 ? c.tags : ['Core', 'Curriculum'],
                accentColor:
                  c.accentColor ||
                  (idx % 3 === 0 ? '#2563EB' : idx % 3 === 1 ? '#10B981' : '#8B5CF6'),
                thumbnailUrl: c.thumbnailUrl || undefined,
                moduleHighlights:
                  Array.isArray(c.moduleHighlights) && c.moduleHighlights.length > 0
                    ? c.moduleHighlights
                    : Array.isArray(c.modules) && c.modules.length > 0
                    ? c.modules.map((m: any) => ({
                        title: m.title || 'Course Module',
                        lessons: m.lessons?.length || 0,
                      }))
                    : [],
              };
            });
            setCourses(mapped);
          } else {
            setCourses([]);
          }

          const eMap: Record<string, number> = {};
          if (Array.isArray(enrolledRes)) {
            enrolledRes.forEach((enr: any) => {
              if (enr.courseId) {
                eMap[enr.courseId] = enr.status === 'COMPLETED' ? 100 : 25;
              }
            });
          }
          if (meRes?.enrollments && Array.isArray(meRes.enrollments)) {
            meRes.enrollments.forEach((enr: any) => {
              if (enr.courseId) {
                eMap[enr.courseId] = enr.progressPct ?? (enr.status === 'COMPLETED' ? 100 : 50);
              }
            });
          }
          if (Object.keys(eMap).length > 0) {
            setEnrolledMap((prev) => ({ ...prev, ...eMap }));
          }
        }
      } catch (err: any) {
        console.warn('Live courses fetch failed:', err);
        if (isMounted) {
          setFetchError(err?.message || 'Failed to load courses from the server. Please try again.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    loadCourses();
    return () => {
      isMounted = false;
    };
  }, [reloadCounter]);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    courses.forEach((c) => {
      if (c.category) set.add(c.category);
    });
    return Array.from(set);
  }, [courses]);

  // Filtered dataset
  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const matchesSearch =
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.code.toLowerCase().includes(search.toLowerCase()) ||
        c.instructorName.toLowerCase().includes(search.toLowerCase()) ||
        c.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));

      const matchesCategory =
        categoryFilter === 'ALL' ||
        c.category === categoryFilter ||
        c.category.toLowerCase() === categoryFilter.toLowerCase();
      const matchesLevel =
        levelFilter === 'ALL' ||
        c.level === levelFilter ||
        c.level.toLowerCase() === levelFilter.toLowerCase();

      let matchesTab = true;
      const progress = enrolledMap[c.id];
      if (activeTab === 'ENROLLED') matchesTab = progress !== undefined && progress < 100;
      if (activeTab === 'COMPLETED') matchesTab = progress === 100;
      if (activeTab === 'AVAILABLE') matchesTab = progress === undefined;

      return matchesSearch && matchesCategory && matchesLevel && matchesTab;
    });
  }, [courses, search, categoryFilter, levelFilter, activeTab, enrolledMap]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Code', 'Title', 'Category', 'Level', 'Instructor', 'Hours', 'Modules', 'Lessons', 'Progress'];
    const rows = filteredCourses.map((c) => [
      c.code,
      `"${c.title.replace(/"/g, '""')}"`,
      `"${c.category}"`,
      c.level,
      `"${c.instructorName}"`,
      c.durationHours,
      c.modulesCount,
      c.lessonsCount,
      `${enrolledMap[c.id] ?? 0}%`,
    ]);

    const csvData = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `courses_catalog_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleEnrollCourse = async (courseId: string, title: string) => {
    setEnrolledMap((prev) => ({ ...prev, [courseId]: 0 }));
    try {
      await apiService.enrollInCourse(courseId);
      toast.success(`Enrolled in ${title}!`, 'Enrolled');
    } catch (err: any) {
      setEnrolledMap((prev) => {
        const next = { ...prev };
        delete next[courseId];
        return next;
      });
      toast.error(err?.message || `Failed to enroll in ${title}.`, 'Enrollment Failed');
    }
  };

  return (
    <StudentAppLayout streakDays={48} contestRating={2380} ratingTier="Master">
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* ========================================================================= */}
        {/* TOP HERO HEADER & METRICS */}
        {/* ========================================================================= */}
        <Box
          sx={{
            display: 'flex',
            alignItems: { xs: 'flex-start', md: 'center' },
            justifyContent: 'space-between',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 2,
          }}
        >
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
                Enrolled Courses & Curriculum
              </Typography>
              <Chip
                icon={<AutoAwesomeRoundedIcon sx={{ fontSize: 13, color: '#2563EB !important' }} />}
                label="Self-Paced Tracks"
                size="small"
                sx={{
                  bgcolor: 'rgba(37, 99, 235, 0.08)',
                  color: '#2563EB',
                  fontWeight: 700,
                  fontSize: '0.72rem',
                }}
              />
            </Box>
            <Typography variant="body2" sx={{ color: '#64748B' }}>
              Structured curriculum and university tracks across Data Structures, System Design, AI, and Full-Stack development.
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<DownloadRoundedIcon sx={{ fontSize: 17 }} />}
              onClick={handleExportCSV}
              sx={{
                bgcolor: '#FFFFFF',
                borderColor: '#CBD5E1',
                color: '#334155',
                fontWeight: 700,
                textTransform: 'none',
                borderRadius: '8px',
                px: 2,
                py: 0.8,
                '&:hover': { bgcolor: '#F8FAFC', borderColor: '#94A3B8' },
              }}
            >
              Export CSV
            </Button>
          </Box>
        </Box>

        {/* ========================================================================= */}
        {/* LIST TABLE CONTAINER (Core Rule #10: Strict List Table Format) */}
        {/* ========================================================================= */}
        <Card
          sx={{
            borderRadius: '16px',
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            overflow: 'hidden',
          }}
        >
          {/* Controls Bar */}
          <Box
            sx={{
              p: 2,
              borderBottom: '1px solid #F1F5F9',
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: { xs: 'stretch', md: 'center' },
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            {/* Status Tabs */}
            <Tabs
              value={activeTab}
              onChange={(_, val) => setActiveTab(val)}
              sx={{
                minHeight: 40,
                '& .MuiTab-root': {
                  minHeight: 40,
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  textTransform: 'none',
                  color: '#64748B',
                  '&.Mui-selected': { color: '#2563EB' },
                },
                '& .MuiTabs-indicator': { bgcolor: '#2563EB', height: 3, borderRadius: '3px 3px 0 0' },
              }}
            >
              <Tab label="Enrolled & Active" value="ENROLLED" />
              <Tab label="Completed" value="COMPLETED" />
              <Tab label="Available Catalog" value="AVAILABLE" />
              <Tab label="All Tracks" value="ALL" />
            </Tabs>

            {/* Search & Filter Options */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
              <TextField
                size="small"
                placeholder="Search course title, code, instructor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
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
                  minWidth: { xs: '100%', sm: 260 },
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    bgcolor: '#F8FAFC',
                    fontSize: '0.84rem',
                  },
                }}
              />

              <FormControl size="small" sx={{ minWidth: 150 }}>
                <Select
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                  sx={{
                    borderRadius: '8px',
                    bgcolor: '#F8FAFC',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    color: '#334155',
                  }}
                >
                  <MenuItem value="ALL" sx={{ fontSize: '0.84rem', fontWeight: 600 }}>All Levels</MenuItem>
                  <MenuItem value="Beginner" sx={{ fontSize: '0.84rem', color: '#16A34A', fontWeight: 700 }}>Beginner</MenuItem>
                  <MenuItem value="Intermediate" sx={{ fontSize: '0.84rem', color: '#2563EB', fontWeight: 700 }}>Intermediate</MenuItem>
                  <MenuItem value="Advanced" sx={{ fontSize: '0.84rem', color: '#7C3AED', fontWeight: 700 }}>Advanced</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 170 }}>
                <Select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  sx={{
                    borderRadius: '8px',
                    bgcolor: '#F8FAFC',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    color: '#334155',
                  }}
                >
                  <MenuItem value="ALL" sx={{ fontSize: '0.84rem', fontWeight: 600 }}>All Categories</MenuItem>
                  {categories.map((c) => (
                    <MenuItem key={c} value={c} sx={{ fontSize: '0.84rem' }}>{c}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* View Mode Toggle: Grid & List */}
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(_, val) => {
                  if (val) setViewMode(val);
                }}
                size="small"
                aria-label="view mode toggle"
                sx={{
                  bgcolor: '#F1F5F9',
                  borderRadius: '10px',
                  p: '3px',
                  border: '1px solid #E2E8F0',
                  '& .MuiToggleButton-root': {
                    border: 'none',
                    borderRadius: '8px !important',
                    px: 1.5,
                    py: 0.6,
                    color: '#64748B',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    textTransform: 'none',
                    gap: 0.6,
                    transition: 'all 0.18s ease',
                    '&.Mui-selected': {
                      bgcolor: '#FFFFFF',
                      color: '#2563EB',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      fontWeight: 800,
                    },
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.8)',
                    },
                  },
                }}
              >
                <ToggleButton value="grid" aria-label="grid view">
                  <GridViewRoundedIcon sx={{ fontSize: 17 }} />
                  <span>Grid</span>
                </ToggleButton>
                <ToggleButton value="list" aria-label="list view">
                  <ViewListRoundedIcon sx={{ fontSize: 17 }} />
                  <span>List</span>
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </Box>

          {/* ========================================================================= */}
          {/* GRID VIEW RENDERING (Matches 2nd Image Aesthetics) */}
          {/* ========================================================================= */}
          {viewMode === 'grid' ? (
            <Box sx={{ p: { xs: 2, sm: 2.5, md: 3 }, bgcolor: '#F8FAFC' }}>
              {isLoading ? (
                <Box sx={{ py: 10, textAlign: 'center', color: '#64748B' }}>
                  <Typography sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
                    Loading course catalog...
                  </Typography>
                </Box>
              ) : fetchError ? (
                <Box sx={{ py: 8, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '1.05rem', color: '#DC2626' }}>
                    Failed to load courses
                  </Typography>
                  <Typography sx={{ fontSize: '0.85rem', color: '#64748B', maxWidth: 460 }}>
                    {fetchError}
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setReloadCounter((c) => c + 1)}
                    sx={{
                      borderRadius: '8px',
                      textTransform: 'none',
                      fontWeight: 700,
                      borderColor: '#DC2626',
                      color: '#DC2626',
                      '&:hover': { bgcolor: '#FEF2F2', borderColor: '#B91C1C' },
                    }}
                  >
                    Retry Loading
                  </Button>
                </Box>
              ) : filteredCourses.length === 0 ? (
                <Box sx={{ py: 10, textAlign: 'center', color: '#94A3B8' }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '1.05rem', color: '#64748B', mb: 0.5 }}>
                    No courses found
                  </Typography>
                  <Typography sx={{ fontSize: '0.85rem', color: '#94A3B8' }}>
                    Try changing your search query or adjusting the filters.
                  </Typography>
                </Box>
              ) : (
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: '1fr',
                      sm: 'repeat(2, 1fr)',
                      md: 'repeat(3, 1fr)',
                      lg: 'repeat(4, 1fr)',
                      xl: 'repeat(4, 1fr)',
                    },
                    gap: 2.5,
                  }}
                >
                  {filteredCourses
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((course) => (
                      <CourseGridCard
                        key={course.id}
                        course={course}
                        progress={enrolledMap[course.id]}
                        onInspect={(c) => handleNavigateToCourse(c)}
                        onEnroll={(id, title) => handleEnrollCourse(id, title)}
                      />
                    ))}
                </Box>
              )}
            </Box>
          ) : (
            /* ========================================================================= */
            /* LIST TABLE RENDERING */
            /* ========================================================================= */
            <TableContainer>
              <Table sx={{ minWidth: 850 }}>
                <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                  <TableRow>
                    <TableCell sx={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', py: 1.5, width: 100 }}>
                      Code
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', py: 1.5 }}>
                      Course Title & Category
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', py: 1.5 }}>
                      Instructor & Institution
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', py: 1.5, width: 110 }}>
                      Level
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', py: 1.5, width: 120 }}>
                      Syllabus
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', py: 1.5, width: 150 }}>
                      Your Progress
                    </TableCell>
                    <TableCell align="right" sx={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', py: 1.5, width: 140 }}>
                      Action
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 6, color: '#64748B' }}>
                        <Typography sx={{ fontWeight: 600, fontSize: '0.92rem' }}>
                          Loading course catalog...
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : fetchError ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                          <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#DC2626' }}>
                            Failed to load courses
                          </Typography>
                          <Typography sx={{ fontSize: '0.82rem', color: '#64748B' }}>
                            {fetchError}
                          </Typography>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => setReloadCounter((c) => c + 1)}
                            sx={{
                              borderRadius: '8px',
                              textTransform: 'none',
                              fontWeight: 700,
                              fontSize: '0.78rem',
                              borderColor: '#DC2626',
                              color: '#DC2626',
                              '&:hover': { bgcolor: '#FEF2F2' },
                            }}
                          >
                            Retry Loading
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : filteredCourses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 6, color: '#94A3B8' }}>
                        <Typography sx={{ fontWeight: 600, fontSize: '0.92rem' }}>
                          No courses found matching the criteria.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCourses
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((course) => {
                        const progress = enrolledMap[course.id];
                        const isEnrolled = progress !== undefined;
                        const levelStyle = LEVEL_COLORS[course.level] || LEVEL_COLORS.Intermediate;

                        return (
                          <TableRow
                            key={course.id}
                            hover
                            onClick={() => handleNavigateToCourse(course)}
                            sx={{
                              cursor: 'pointer',
                              '&:hover': { bgcolor: 'rgba(248, 250, 252, 0.8)' },
                              transition: 'background-color 0.15s ease',
                            }}
                          >
                            {/* Code */}
                            <TableCell sx={{ py: 1.8, fontFamily: 'monospace', fontWeight: 700, color: '#64748B', fontSize: '0.82rem' }}>
                              {course.code}
                            </TableCell>

                            {/* Title & Category */}
                            <TableCell sx={{ py: 1.8 }}>
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: '#0F172A', '&:hover': { color: '#2563EB' } }}>
                                  {course.title}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                  <Typography sx={{ fontSize: '0.76rem', color: '#2563EB', fontWeight: 600 }}>
                                    {course.category}
                                  </Typography>
                                  <Typography sx={{ fontSize: '0.72rem', color: '#94A3B8' }}>•</Typography>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                                    <AccessTimeRoundedIcon sx={{ fontSize: 13, color: '#94A3B8' }} />
                                    <Typography sx={{ fontSize: '0.72rem', color: '#64748B' }}>
                                      {course.durationHours} hrs
                                    </Typography>
                                  </Box>
                                </Box>
                              </Box>
                            </TableCell>

                            {/* Instructor */}
                            <TableCell sx={{ py: 1.8 }}>
                              <Typography sx={{ fontWeight: 700, fontSize: '0.84rem', color: '#334155' }}>
                                {course.instructorName}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <SchoolOutlinedIcon sx={{ fontSize: 14, color: '#94A3B8' }} />
                                <Typography sx={{ fontSize: '0.72rem', color: '#64748B' }}>
                                  {course.institutionName}
                                </Typography>
                              </Box>
                            </TableCell>

                            {/* Level */}
                            <TableCell sx={{ py: 1.8 }}>
                              <Chip
                                label={course.level}
                                size="small"
                                sx={{
                                  bgcolor: levelStyle.bg,
                                  color: levelStyle.text,
                                  fontWeight: 800,
                                  fontSize: '0.72rem',
                                  height: 22,
                                }}
                              />
                            </TableCell>

                            {/* Syllabus Count */}
                            <TableCell sx={{ py: 1.8 }}>
                              <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>
                                {course.modulesCount} Modules
                              </Typography>
                              <Typography sx={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                                {course.lessonsCount} lessons
                              </Typography>
                            </TableCell>

                            {/* Progress */}
                            <TableCell sx={{ py: 1.8 }}>
                              {isEnrolled ? (
                                <Box sx={{ minWidth: 120 }}>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                    <Typography sx={{ fontSize: '0.74rem', fontWeight: 800, color: progress === 100 ? '#16A34A' : '#2563EB' }}>
                                      {progress}%
                                    </Typography>
                                    <Typography sx={{ fontSize: '0.7rem', color: '#94A3B8' }}>
                                      {Math.round((progress / 100) * course.lessonsCount)}/{course.lessonsCount}
                                    </Typography>
                                  </Box>
                                  <LinearProgress
                                    variant="determinate"
                                    value={progress}
                                    sx={{
                                      height: 6,
                                      borderRadius: 3,
                                      bgcolor: '#F1F5F9',
                                      '& .MuiLinearProgress-bar': {
                                        background: progress === 100 ? '#16A34A' : 'linear-gradient(90deg, #3B82F6 0%, #1D4ED8 100%)',
                                        borderRadius: 3,
                                      },
                                    }}
                                  />
                                </Box>
                              ) : (
                                <Typography sx={{ fontSize: '0.78rem', color: '#94A3B8', fontStyle: 'italic' }}>
                                  Not Enrolled
                                </Typography>
                              )}
                            </TableCell>

                            {/* Action Button */}
                            <TableCell align="right" sx={{ py: 1.8 }}>
                              {isEnrolled ? (
                                <Button
                                  size="small"
                                  variant="contained"
                                  startIcon={<PlayArrowRoundedIcon sx={{ fontSize: 16 }} />}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleNavigateToCourse(course);
                                  }}
                                  sx={{
                                    borderRadius: '6px',
                                    textTransform: 'none',
                                    fontWeight: 700,
                                    fontSize: '0.78rem',
                                    px: 1.8,
                                    py: 0.5,
                                    bgcolor: progress === 100 ? '#0F172A' : '#2563EB',
                                    '&:hover': { bgcolor: progress === 100 ? '#1E293B' : '#1D4ED8' },
                                  }}
                                >
                                  {progress === 100 ? 'Review' : 'Resume'}
                                </Button>
                              ) : (
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEnrollCourse(course.id, course.title);
                                  }}
                                  sx={{
                                    borderRadius: '6px',
                                    textTransform: 'none',
                                    fontWeight: 700,
                                    fontSize: '0.78rem',
                                    borderColor: '#2563EB',
                                    color: '#2563EB',
                                    '&:hover': { bgcolor: 'rgba(37, 99, 235, 0.08)' },
                                  }}
                                >
                                  Enroll Free
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Pagination */}
          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={filteredCourses.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            sx={{ borderTop: '1px solid #F1F5F9' }}
          />
        </Card>
      </Box>
    </StudentAppLayout>
  );
}
