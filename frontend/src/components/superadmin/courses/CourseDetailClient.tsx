'use client';

import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  Chip,
  Button,
  Avatar,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  LinearProgress,
  TextField,
  InputAdornment,
  Divider,
} from '@mui/material';
import Link from 'next/link';

// Icons
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import LayersRoundedIcon from '@mui/icons-material/LayersRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import PlayCircleOutlineRoundedIcon from '@mui/icons-material/PlayCircleOutlineRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import QuizRoundedIcon from '@mui/icons-material/QuizRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import SearchIcon from '@mui/icons-material/Search';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';

import FloatingSidebar from '@/components/superadmin/layout/CurvedSidebar';
import Navbar from '@/components/superadmin/layout/Navbar';
import type { CourseDirectoryEntity } from '@/types/course';

interface EnrolledStudent {
  id: string;
  name: string;
  handle: string;
  institution: string;
  enrolledDate: string;
  progressPct: number;
  completedLessons: number;
  quizScorePct: number;
  lastActive: string;
  status: 'In Progress' | 'Completed' | 'Inactive';
}

interface CourseAssignment {
  id: string;
  title: string;
  module: string;
  type: 'Coding Lab' | 'Quiz' | 'Project Evaluation';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  submissionsCount: number;
  avgScore: number;
  dueDate: string;
  status: 'Open' | 'Graded';
}

interface CourseDetailClientProps {
  course: CourseDirectoryEntity;
}

export default function CourseDetailClient({ course }: CourseDetailClientProps) {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [studentSearch, setStudentSearch] = useState<string>('');
  const [labSearch, setLabSearch] = useState<string>('');

  const borderColor = '#E2E8F0';

  // Seeded Enrolled Students Dataset
  const enrolledStudents: EnrolledStudent[] = useMemo(
    () => [
      {
        id: 'stu-101',
        name: 'Alex Vance',
        handle: 'alex_v',
        institution: 'Stanford University',
        enrolledDate: 'Jan 15, 2025',
        progressPct: 94,
        completedLessons: Math.round(course.lessonsCount * 0.94),
        quizScorePct: 96,
        lastActive: '10 mins ago',
        status: 'In Progress',
      },
      {
        id: 'stu-102',
        name: 'Elena Rostova',
        handle: 'elena_code',
        institution: 'MIT EECS',
        enrolledDate: 'Jan 18, 2025',
        progressPct: 100,
        completedLessons: course.lessonsCount,
        quizScorePct: 98,
        lastActive: 'Yesterday',
        status: 'Completed',
      },
      {
        id: 'stu-103',
        name: 'Devon Miles',
        handle: 'devon_m',
        institution: 'IIT Delhi',
        enrolledDate: 'Jan 22, 2025',
        progressPct: 82,
        completedLessons: Math.round(course.lessonsCount * 0.82),
        quizScorePct: 88,
        lastActive: '2 hours ago',
        status: 'In Progress',
      },
      {
        id: 'stu-104',
        name: 'Marcus Brody',
        handle: 'marcus_b',
        institution: 'Oxford Computing',
        enrolledDate: 'Feb 02, 2025',
        progressPct: 65,
        completedLessons: Math.round(course.lessonsCount * 0.65),
        quizScorePct: 84,
        lastActive: '3 days ago',
        status: 'In Progress',
      },
      {
        id: 'stu-105',
        name: 'Sarah Chen',
        handle: 'schen_ai',
        institution: 'UC Berkeley',
        enrolledDate: 'Feb 10, 2025',
        progressPct: 45,
        completedLessons: Math.round(course.lessonsCount * 0.45),
        quizScorePct: 90,
        lastActive: '5 hours ago',
        status: 'In Progress',
      },
      {
        id: 'stu-106',
        name: 'Kenji Takahashi',
        handle: 'kenji_t',
        institution: 'Tokyo Tech',
        enrolledDate: 'Feb 14, 2025',
        progressPct: 20,
        completedLessons: Math.round(course.lessonsCount * 0.2),
        quizScorePct: 75,
        lastActive: '1 week ago',
        status: 'Inactive',
      },
    ],
    [course]
  );

  // Seeded Assignments Dataset
  const courseAssignments: CourseAssignment[] = useMemo(
    () => [
      {
        id: 'lab-01',
        title: 'Lab 1: Asymptotic Complexity & Benchmarking Harness',
        module: 'Module 1: Foundations & Architecture',
        type: 'Coding Lab',
        difficulty: 'Easy',
        submissionsCount: 1420,
        avgScore: 92,
        dueDate: 'Feb 15, 2025',
        status: 'Open',
      },
      {
        id: 'lab-02',
        title: 'Lab 2: Lock-Free Concurrent Queue Implementation',
        module: 'Module 2: Core Data Structures',
        type: 'Coding Lab',
        difficulty: 'Medium',
        submissionsCount: 1180,
        avgScore: 84,
        dueDate: 'Feb 28, 2025',
        status: 'Open',
      },
      {
        id: 'lab-03',
        title: 'Midterm Quiz: Protocol Proofs & State Machine Invariants',
        module: 'Module 3: Consensus & Protocols',
        type: 'Quiz',
        difficulty: 'Medium',
        submissionsCount: 1250,
        avgScore: 88,
        dueDate: 'Mar 10, 2025',
        status: 'Open',
      },
      {
        id: 'lab-04',
        title: 'Capstone Evaluation: High-Throughput Sharded Cluster Runner',
        module: 'Module 4: Capstone Architecture',
        type: 'Project Evaluation',
        difficulty: 'Hard',
        submissionsCount: 890,
        avgScore: 79,
        dueDate: 'Apr 01, 2025',
        status: 'Open',
      },
    ],
    []
  );

  const filteredStudents = enrolledStudents.filter(
    (s) =>
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.handle.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.institution.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const filteredLabs = courseAssignments.filter(
    (l) =>
      l.title.toLowerCase().includes(labSearch.toLowerCase()) ||
      l.module.toLowerCase().includes(labSearch.toLowerCase())
  );

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
      {/* 1. Sidebar Navigation */}
      <FloatingSidebar />

      {/* Main Content Area */}
      <Box component="main" sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Box sx={{ maxWidth: 1400, width: '100%', mx: 'auto', px: { xs: 3, md: 5 }, display: 'flex', flexDirection: 'column', gap: 4, pb: { xs: 4, md: 6 } }}>
          {/* 2. Top Header Navbar */}
          <Navbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

          {/* Breadcrumb & Top Bar */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Button
                component={Link}
                href="/superadmin/courses"
                startIcon={<ArrowBackRoundedIcon sx={{ fontSize: 18 }} />}
                sx={{
                  color: '#64748B',
                  borderRadius: '9999px',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.84rem',
                  '&:hover': { color: '#0F172A', bgcolor: '#FFFFFF' },
                }}
              >
                Back to Courses Directory
              </Button>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Button
                variant="outlined"
                startIcon={<FileDownloadRoundedIcon sx={{ fontSize: 18 }} />}
                sx={{
                  bgcolor: '#FFFFFF',
                  color: '#475569',
                  borderColor: borderColor,
                  borderRadius: '9999px',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.84rem',
                  '&:hover': { bgcolor: '#F8FAFC' },
                }}
              >
                Export Syllabus (.pdf)
              </Button>
              <Button
                variant="contained"
                startIcon={<PlayCircleOutlineRoundedIcon sx={{ fontSize: 20 }} />}
                sx={{
                  bgcolor: '#2563EB',
                  color: '#FFFFFF',
                  borderRadius: '9999px',
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  boxShadow: '0 4px 14px rgba(37,99,235,0.25)',
                  '&:hover': { bgcolor: '#1D4ED8' },
                }}
              >
                Continue Lesson 1
              </Button>
            </Box>
          </Box>

          {/* Hero Course Overview Card */}
          <Card
            elevation={0}
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: '24px',
              bgcolor: '#FFFFFF',
              border: `1px solid ${borderColor}`,
              boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', gap: 3, alignItems: { xs: 'flex-start', md: 'center' } }}>
              <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'flex-start' }}>
                <Avatar
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: '18px',
                    bgcolor: course.accentColor || '#2563EB',
                    color: '#FFFFFF',
                    fontWeight: 900,
                    fontSize: '1.4rem',
                    boxShadow: '0 8px 24px rgba(37,99,235,0.2)',
                  }}
                >
                  <MenuBookRoundedIcon sx={{ fontSize: 32 }} />
                </Avatar>

                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.75 }}>
                    <Typography sx={{ color: '#2563EB', fontWeight: 800, fontFamily: 'monospace', fontSize: '0.85rem' }}>
                      {course.code}
                    </Typography>
                    <Chip
                      label={course.category}
                      size="small"
                      sx={{
                        bgcolor: '#EFF6FF',
                        color: '#2563EB',
                        fontWeight: 700,
                        fontSize: '0.72rem',
                        borderRadius: '9999px',
                        border: '1px solid #BFDBFE',
                      }}
                    />
                    <Chip
                      label={course.level}
                      size="small"
                      sx={{
                        bgcolor: course.level === 'Beginner' ? '#F0FDF4' : course.level === 'Intermediate' ? '#EFF6FF' : '#FEF2F2',
                        color: course.level === 'Beginner' ? '#16A34A' : course.level === 'Intermediate' ? '#2563EB' : '#DC2626',
                        fontWeight: 700,
                        fontSize: '0.72rem',
                        borderRadius: '9999px',
                      }}
                    />
                    <Chip
                      icon={<VerifiedRoundedIcon sx={{ fontSize: '0.85rem !important', color: '#16A34A !important' }} />}
                      label="Accredited Syllabus"
                      size="small"
                      sx={{
                        bgcolor: '#F0FDF4',
                        color: '#16A34A',
                        fontWeight: 700,
                        fontSize: '0.72rem',
                        borderRadius: '9999px',
                      }}
                    />
                  </Box>

                  <Typography variant="h4" sx={{ fontWeight: 900, color: '#0F172A', fontSize: { xs: '1.4rem', md: '1.8rem' }, letterSpacing: '-0.02em' }}>
                    {course.title}
                  </Typography>

                  <Typography variant="body1" sx={{ color: '#64748B', mt: 1, maxWidth: 800, fontSize: '0.92rem', lineHeight: 1.6 }}>
                    {course.description}
                  </Typography>
                </Box>
              </Box>

              {/* Lead Instructor Mini-Card */}
              <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: '16px', border: `1px solid ${borderColor}`, minWidth: { xs: '100%', md: 260 } }}>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', mb: 1 }}>
                  Faculty Instructor
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar sx={{ width: 40, height: 40, bgcolor: '#2563EB', fontWeight: 700, fontSize: '0.85rem' }}>
                    {course.instructorName.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.88rem' }}>
                      {course.instructorName}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748B', display: 'block', fontSize: '0.74rem' }}>
                      {course.institutionName}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Quick Metrics Bar */}
            <Box
              sx={{
                p: 2,
                borderRadius: '16px',
                bgcolor: '#F8FAFC',
                border: `1px solid ${borderColor}`,
                display: 'grid',
                gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
                gap: 2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <LayersRoundedIcon sx={{ color: '#2563EB', fontSize: 24 }} />
                <Box>
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>
                    STRUCTURE
                  </Typography>
                  <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.95rem' }}>
                    {course.modulesCount} Modules • {course.lessonsCount} Lessons
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <AccessTimeRoundedIcon sx={{ color: '#7C3AED', fontSize: 24 }} />
                <Box>
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>
                    ESTIMATED TIME
                  </Typography>
                  <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.95rem' }}>
                    {course.durationHours} Hours Self-Paced
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <PeopleAltRoundedIcon sx={{ color: '#059669', fontSize: 24 }} />
                <Box>
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>
                    ENROLLED CODERS
                  </Typography>
                  <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.95rem' }}>
                    {course.enrolledStudents.toLocaleString()} Active
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <EmojiEventsRoundedIcon sx={{ color: '#D97706', fontSize: 24 }} />
                <Box>
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>
                    COMPLETION RATE
                  </Typography>
                  <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.95rem' }}>
                    {course.completionRate}% Certified
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Card>

          {/* 4 Workspace Navigation Tabs */}
          <Card
            elevation={0}
            sx={{
              borderRadius: '20px',
              bgcolor: '#FFFFFF',
              border: `1px solid ${borderColor}`,
              boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
              overflow: 'hidden',
            }}
          >
            <Box sx={{ borderBottom: `1px solid ${borderColor}`, px: 3, pt: 1, bgcolor: '#FFFFFF' }}>
              <Tabs
                value={activeTab}
                onChange={(_, val) => setActiveTab(val)}
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
                    gap: 3,
                  },
                }}
              >
                <Tab
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LayersRoundedIcon sx={{ fontSize: 18 }} />
                      <span>Syllabus & Modules Tracker</span>
                      <Chip label={course.modulesCount} size="small" sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700, bgcolor: activeTab === 0 ? '#EFF6FF' : '#F1F5F9', color: activeTab === 0 ? '#2563EB' : '#64748B' }} />
                    </Box>
                  }
                  sx={{ textTransform: 'none', fontWeight: activeTab === 0 ? 700 : 600, fontSize: '0.88rem', color: activeTab === 0 ? '#2563EB !important' : '#64748B' }}
                />

                <Tab
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PeopleAltRoundedIcon sx={{ fontSize: 18 }} />
                      <span>Enrolled Students Roster</span>
                      <Chip label={enrolledStudents.length} size="small" sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700, bgcolor: activeTab === 1 ? '#EFF6FF' : '#F1F5F9', color: activeTab === 1 ? '#2563EB' : '#64748B' }} />
                    </Box>
                  }
                  sx={{ textTransform: 'none', fontWeight: activeTab === 1 ? 700 : 600, fontSize: '0.88rem', color: activeTab === 1 ? '#2563EB !important' : '#64748B' }}
                />

                <Tab
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CodeRoundedIcon sx={{ fontSize: 18 }} />
                      <span>Coding Labs & Quizzes</span>
                      <Chip label={courseAssignments.length} size="small" sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700, bgcolor: activeTab === 2 ? '#EFF6FF' : '#F1F5F9', color: activeTab === 2 ? '#2563EB' : '#64748B' }} />
                    </Box>
                  }
                  sx={{ textTransform: 'none', fontWeight: activeTab === 2 ? 700 : 600, fontSize: '0.88rem', color: activeTab === 2 ? '#2563EB !important' : '#64748B' }}
                />
              </Tabs>
            </Box>

            {/* TAB 0: Syllabus & Modules Tracker */}
            {activeTab === 0 && (
              <Box sx={{ p: { xs: 2.5, md: 3.5 }, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.05rem' }}>
                      Curriculum Units Breakdown
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748B' }}>
                      Step-by-step modular lessons with theory, video masterclasses, and code evaluations
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<PlayCircleOutlineRoundedIcon />}
                    sx={{
                      borderRadius: '9999px',
                      bgcolor: '#2563EB',
                      textTransform: 'none',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      '&:hover': { bgcolor: '#1D4ED8' },
                    }}
                  >
                    Start Module 1
                  </Button>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {course.moduleHighlights.map((mod, idx) => (
                    <Card
                      key={idx}
                      elevation={0}
                      sx={{
                        p: 2.5,
                        borderRadius: '16px',
                        border: `1px solid ${borderColor}`,
                        bgcolor: '#FFFFFF',
                        transition: 'all 0.15s ease',
                        '&:hover': { borderColor: '#CBD5E1', boxShadow: '0 4px 14px rgba(0,0,0,0.04)' },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box
                            sx={{
                              width: 36,
                              height: 36,
                              borderRadius: '10px',
                              bgcolor: '#EFF6FF',
                              color: '#2563EB',
                              fontWeight: 900,
                              fontFamily: 'monospace',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.9rem',
                            }}
                          >
                            0{idx + 1}
                          </Box>
                          <Box>
                            <Typography sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.95rem' }}>
                              {mod.title}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: 1, mt: 0.25 }}>
                              <span>{mod.lessons} Lessons</span> • <span>Interactive Code Sandboxes</span> • <span>Pass Rate: {Math.max(60, 95 - idx * 5)}%</span>
                            </Typography>
                          </Box>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Chip
                            label={idx === 0 ? 'Unlocked & Active' : 'Sequential Unit'}
                            size="small"
                            sx={{
                              borderRadius: '9999px',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              bgcolor: idx === 0 ? '#F0FDF4' : '#F8FAFC',
                              color: idx === 0 ? '#16A34A' : '#64748B',
                              border: '1px solid',
                              borderColor: idx === 0 ? '#BBF7D0' : '#E2E8F0',
                            }}
                          />
                          <Button
                            size="small"
                            variant="outlined"
                            sx={{
                              borderRadius: '9999px',
                              textTransform: 'none',
                              fontWeight: 600,
                              fontSize: '0.78rem',
                              borderColor: '#CBD5E1',
                              color: '#0F172A',
                            }}
                          >
                            Inspect Lessons
                          </Button>
                        </Box>
                      </Box>
                    </Card>
                  ))}
                </Box>
              </Box>
            )}

            {/* TAB 1: Enrolled Students Roster (Strict Rule 10 Table) */}
            {activeTab === 1 && (
              <Box sx={{ p: { xs: 2.5, md: 3.5 }, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {/* Search Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                  <TextField
                    size="small"
                    placeholder="Search enrolled students by name, handle, or college..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
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
                      minWidth: { xs: '100%', md: 380 },
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '9999px',
                        bgcolor: '#F8FAFC',
                        fontSize: '0.85rem',
                      },
                    }}
                  />
                  <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 600 }}>
                    {filteredStudents.length} Students Enrolled
                  </Typography>
                </Box>

                {/* Structured Student Roster Table */}
                <TableContainer sx={{ border: `1px solid ${borderColor}`, borderRadius: '16px', overflow: 'hidden' }}>
                  <Table sx={{ minWidth: 800 }}>
                    <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                      <TableRow>
                        <TableCell sx={{ color: '#64748B', fontWeight: 700, fontSize: '0.74rem', textTransform: 'uppercase' }}>
                          Student
                        </TableCell>
                        <TableCell sx={{ color: '#64748B', fontWeight: 700, fontSize: '0.74rem', textTransform: 'uppercase' }}>
                          Institution
                        </TableCell>
                        <TableCell sx={{ color: '#64748B', fontWeight: 700, fontSize: '0.74rem', textTransform: 'uppercase' }}>
                          Course Progress
                        </TableCell>
                        <TableCell sx={{ color: '#64748B', fontWeight: 700, fontSize: '0.74rem', textTransform: 'uppercase' }}>
                          Quiz Accuracy
                        </TableCell>
                        <TableCell sx={{ color: '#64748B', fontWeight: 700, fontSize: '0.74rem', textTransform: 'uppercase' }}>
                          Last Active
                        </TableCell>
                        <TableCell sx={{ color: '#64748B', fontWeight: 700, fontSize: '0.74rem', textTransform: 'uppercase' }}>
                          Status
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredStudents.map((stu) => (
                        <TableRow key={stu.id} sx={{ '&:hover': { bgcolor: '#F8FAFC' } }}>
                          <TableCell sx={{ borderColor: '#E2E8F0' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Avatar sx={{ width: 34, height: 34, bgcolor: '#2563EB', fontWeight: 700, fontSize: '0.8rem' }}>
                                {stu.name.charAt(0)}
                              </Avatar>
                              <Box>
                                <Typography sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.85rem' }}>
                                  {stu.name}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#2563EB', fontFamily: 'monospace' }}>
                                  @{stu.handle}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>

                          <TableCell sx={{ borderColor: '#E2E8F0' }}>
                            <Typography sx={{ fontWeight: 600, color: '#0F172A', fontSize: '0.82rem' }}>
                              {stu.institution}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748B' }}>
                              Enrolled {stu.enrolledDate}
                            </Typography>
                          </TableCell>

                          <TableCell sx={{ borderColor: '#E2E8F0', minWidth: 160 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LinearProgress
                                variant="determinate"
                                value={stu.progressPct}
                                sx={{
                                  flex: 1,
                                  height: 6,
                                  borderRadius: '9999px',
                                  bgcolor: '#F1F5F9',
                                  '& .MuiLinearProgress-bar': {
                                    bgcolor: stu.progressPct === 100 ? '#16A34A' : '#2563EB',
                                    borderRadius: '9999px',
                                  },
                                }}
                              />
                              <Typography sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.76rem', width: 36 }}>
                                {stu.progressPct}%
                              </Typography>
                            </Box>
                            <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.7rem' }}>
                              {stu.completedLessons} of {course.lessonsCount} lessons complete
                            </Typography>
                          </TableCell>

                          <TableCell sx={{ borderColor: '#E2E8F0' }}>
                            <Chip
                              label={`${stu.quizScorePct}%`}
                              size="small"
                              sx={{
                                fontWeight: 700,
                                fontSize: '0.72rem',
                                borderRadius: '9999px',
                                bgcolor: stu.quizScorePct >= 90 ? '#F0FDF4' : '#EFF6FF',
                                color: stu.quizScorePct >= 90 ? '#16A34A' : '#2563EB',
                                border: '1px solid',
                                borderColor: stu.quizScorePct >= 90 ? '#BBF7D0' : '#BFDBFE',
                              }}
                            />
                          </TableCell>

                          <TableCell sx={{ borderColor: '#E2E8F0' }}>
                            <Typography sx={{ color: '#64748B', fontSize: '0.8rem', fontWeight: 500 }}>
                              {stu.lastActive}
                            </Typography>
                          </TableCell>

                          <TableCell sx={{ borderColor: '#E2E8F0' }}>
                            <Chip
                              label={stu.status}
                              size="small"
                              sx={{
                                height: 22,
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                borderRadius: '9999px',
                                bgcolor: stu.status === 'Completed' ? '#F0FDF4' : stu.status === 'In Progress' ? '#EFF6FF' : '#F1F5F9',
                                color: stu.status === 'Completed' ? '#16A34A' : stu.status === 'In Progress' ? '#2563EB' : '#64748B',
                                border: '1px solid',
                                borderColor: stu.status === 'Completed' ? '#BBF7D0' : stu.status === 'In Progress' ? '#BFDBFE' : '#E2E8F0',
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {/* TAB 2: Coding Labs & Quizzes (Strict Rule 10 Table) */}
            {activeTab === 2 && (
              <Box sx={{ p: { xs: 2.5, md: 3.5 }, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                  <TextField
                    size="small"
                    placeholder="Search labs, quizzes, and capstone evaluations..."
                    value={labSearch}
                    onChange={(e) => setLabSearch(e.target.value)}
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
                      minWidth: { xs: '100%', md: 380 },
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '9999px',
                        bgcolor: '#F8FAFC',
                        fontSize: '0.85rem',
                      },
                    }}
                  />
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<AssignmentRoundedIcon />}
                    sx={{
                      borderRadius: '9999px',
                      bgcolor: '#2563EB',
                      textTransform: 'none',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      '&:hover': { bgcolor: '#1D4ED8' },
                    }}
                  >
                    Author New Lab
                  </Button>
                </Box>

                {/* Structured Labs Table */}
                <TableContainer sx={{ border: `1px solid ${borderColor}`, borderRadius: '16px', overflow: 'hidden' }}>
                  <Table sx={{ minWidth: 800 }}>
                    <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                      <TableRow>
                        <TableCell sx={{ color: '#64748B', fontWeight: 700, fontSize: '0.74rem', textTransform: 'uppercase' }}>
                          Lab / Assignment Title
                        </TableCell>
                        <TableCell sx={{ color: '#64748B', fontWeight: 700, fontSize: '0.74rem', textTransform: 'uppercase' }}>
                          Evaluation Type
                        </TableCell>
                        <TableCell sx={{ color: '#64748B', fontWeight: 700, fontSize: '0.74rem', textTransform: 'uppercase' }}>
                          Difficulty
                        </TableCell>
                        <TableCell sx={{ color: '#64748B', fontWeight: 700, fontSize: '0.74rem', textTransform: 'uppercase' }}>
                          Submissions
                        </TableCell>
                        <TableCell sx={{ color: '#64748B', fontWeight: 700, fontSize: '0.74rem', textTransform: 'uppercase' }}>
                          Avg Score
                        </TableCell>
                        <TableCell sx={{ color: '#64748B', fontWeight: 700, fontSize: '0.74rem', textTransform: 'uppercase' }}>
                          Due Date
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredLabs.map((lab) => (
                        <TableRow key={lab.id} sx={{ '&:hover': { bgcolor: '#F8FAFC' } }}>
                          <TableCell sx={{ borderColor: '#E2E8F0' }}>
                            <Typography sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.86rem' }}>
                              {lab.title}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748B' }}>
                              {lab.module}
                            </Typography>
                          </TableCell>

                          <TableCell sx={{ borderColor: '#E2E8F0' }}>
                            <Chip
                              label={lab.type}
                              size="small"
                              sx={{
                                height: 22,
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                borderRadius: '9999px',
                                bgcolor: '#EFF6FF',
                                color: '#2563EB',
                                border: '1px solid #BFDBFE',
                              }}
                            />
                          </TableCell>

                          <TableCell sx={{ borderColor: '#E2E8F0' }}>
                            <Chip
                              label={lab.difficulty}
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                borderRadius: '9999px',
                                bgcolor: lab.difficulty === 'Easy' ? '#F0FDF4' : lab.difficulty === 'Medium' ? '#EFF6FF' : '#FEF2F2',
                                color: lab.difficulty === 'Easy' ? '#16A34A' : lab.difficulty === 'Medium' ? '#2563EB' : '#DC2626',
                                border: '1px solid',
                                borderColor: lab.difficulty === 'Easy' ? '#BBF7D0' : lab.difficulty === 'Medium' ? '#BFDBFE' : '#FECACA',
                              }}
                            />
                          </TableCell>

                          <TableCell sx={{ borderColor: '#E2E8F0' }}>
                            <Typography sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.84rem' }}>
                              {lab.submissionsCount.toLocaleString()}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.7rem' }}>
                              Sandbox Executions
                            </Typography>
                          </TableCell>

                          <TableCell sx={{ borderColor: '#E2E8F0' }}>
                            <Chip
                              label={`${lab.avgScore}%`}
                              size="small"
                              sx={{
                                fontWeight: 700,
                                fontSize: '0.72rem',
                                borderRadius: '9999px',
                                bgcolor: '#F0FDF4',
                                color: '#16A34A',
                                border: '1px solid #BBF7D0',
                              }}
                            />
                          </TableCell>

                          <TableCell sx={{ borderColor: '#E2E8F0' }}>
                            <Typography sx={{ color: '#64748B', fontSize: '0.8rem', fontWeight: 600 }}>
                              {lab.dueDate}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </Card>
        </Box>
      </Box>
    </Box>
  );
}
