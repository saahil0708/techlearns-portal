'use client';

import React, { useState, useMemo } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Divider,
} from '@mui/material';

// Icons
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';

import StudentAppLayout from '@/components/students/layout/StudentAppLayout';
import { MOCK_COURSES } from '@/lib/mock-courses-data';
import { CourseDirectoryEntity, CourseLevel, CourseCategory } from '@/types/course';
import { useToast } from '@/context/ToastContext';

const LEVEL_COLORS: Record<CourseLevel, { bg: string; text: string }> = {
  Beginner: { bg: 'rgba(22, 163, 74, 0.1)', text: '#16A34A' },
  Intermediate: { bg: 'rgba(37, 99, 235, 0.1)', text: '#2563EB' },
  Advanced: { bg: 'rgba(124, 58, 237, 0.1)', text: '#7C3AED' },
};

export default function CourseCatalogClient() {
  const router = useRouter();
  const toast = useToast();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [levelFilter, setLevelFilter] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<string>('ENROLLED');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Student progress state
  const [enrolledMap, setEnrolledMap] = useState<Record<string, number>>({
    'course-1': 75, // 75% completed
    'course-2': 30, // 30% completed
    'course-3': 100, // 100% completed
  });

  // Selected course for syllabus inspection dialog
  const [selectedCourse, setSelectedCourse] = useState<CourseDirectoryEntity | null>(null);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    MOCK_COURSES.forEach((c) => set.add(c.category));
    return Array.from(set);
  }, []);

  // Filtered dataset
  const filteredCourses = useMemo(() => {
    return MOCK_COURSES.filter((c) => {
      const matchesSearch =
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.code.toLowerCase().includes(search.toLowerCase()) ||
        c.instructorName.toLowerCase().includes(search.toLowerCase()) ||
        c.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));

      const matchesCategory = categoryFilter === 'ALL' || c.category === categoryFilter;
      const matchesLevel = levelFilter === 'ALL' || c.level === levelFilter;

      let matchesTab = true;
      const progress = enrolledMap[c.id];
      if (activeTab === 'ENROLLED') matchesTab = progress !== undefined && progress < 100;
      if (activeTab === 'COMPLETED') matchesTab = progress === 100;
      if (activeTab === 'AVAILABLE') matchesTab = progress === undefined;

      return matchesSearch && matchesCategory && matchesLevel && matchesTab;
    });
  }, [search, categoryFilter, levelFilter, activeTab, enrolledMap]);

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

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `course_curriculum_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEnrollCourse = (courseId: string, title: string) => {
    setEnrolledMap((prev) => ({ ...prev, [courseId]: 0 }));
    toast.success(`Enrolled in ${title}!`, 'Enrolled');
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
            </Box>
          </Box>

          {/* Table Element */}
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
                {filteredCourses.length === 0 ? (
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
                          sx={{
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
                              <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: '#0F172A' }}>
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
                                onClick={() => setSelectedCourse(course)}
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
                                onClick={() => handleEnrollCourse(course.id, course.title)}
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

        {/* ========================================================================= */}
        {/* COURSE SYLLABUS INSPECTION MODAL */}
        {/* ========================================================================= */}
        {selectedCourse && (
          <Dialog
            open={Boolean(selectedCourse)}
            onClose={() => setSelectedCourse(null)}
            maxWidth="md"
            fullWidth
            slotProps={{
              paper: {
                sx: { borderRadius: '16px', p: 1 },
              },
            }}
          >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: '#0F172A' }}>
                  {selectedCourse.title}
                </Typography>
                <Typography sx={{ fontSize: '0.78rem', color: '#64748B' }}>
                  {selectedCourse.code} • {selectedCourse.category} • {selectedCourse.durationHours} Hours Total
                </Typography>
              </Box>
              <IconButton size="small" onClick={() => setSelectedCourse(null)}>
                <CloseRoundedIcon />
              </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Typography sx={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.6 }}>
                {selectedCourse.description}
              </Typography>

              <Typography sx={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>
                Module Curriculum & Chapter Breakdown
              </Typography>

              {selectedCourse.moduleHighlights.map((m, idx) => (
                <Box
                  key={idx}
                  sx={{
                    p: 2,
                    borderRadius: '10px',
                    bgcolor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        bgcolor: '#2563EB',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                      }}
                    >
                      {idx + 1}
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#0F172A' }}>
                        {m.title}
                      </Typography>
                      <Typography sx={{ fontSize: '0.74rem', color: '#64748B' }}>
                        {m.lessons} Lessons • Interactive code challenges
                      </Typography>
                    </Box>
                  </Box>

                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      setSelectedCourse(null);
                      router.push('/practice');
                    }}
                    sx={{
                      borderRadius: '6px',
                      textTransform: 'none',
                      fontWeight: 700,
                      fontSize: '0.76rem',
                    }}
                  >
                    Open Lesson
                  </Button>
                </Box>
              ))}
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setSelectedCourse(null)} sx={{ textTransform: 'none', fontWeight: 700, color: '#64748B' }}>
                Close
              </Button>
              <Button
                variant="contained"
                onClick={() => {
                  setSelectedCourse(null);
                  router.push('/problems');
                }}
                sx={{
                  borderRadius: '6px',
                  textTransform: 'none',
                  fontWeight: 700,
                  bgcolor: '#2563EB',
                }}
              >
                Go to Practice Arena
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </Box>
    </StudentAppLayout>
  );
}
