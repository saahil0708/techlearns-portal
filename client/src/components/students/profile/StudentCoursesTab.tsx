'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Box,
  Typography,
  Card,
  Chip,
  Button,
  TextField,
  InputAdornment,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import PlayCircleOutlineRoundedIcon from '@mui/icons-material/PlayCircleOutlineRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';

import { StudentCourseProgress } from '@/types/student-profile';
import { useToast } from '@/context/ToastContext';

interface StudentCoursesTabProps {
  courses: StudentCourseProgress[];
  onViewCert?: (courseTitle: string) => void;
}

// Compact Circular Gauge for Course Progress
function CircularProgressGauge({
  percentage,
  size = 42,
  strokeWidth = 4,
  color = '#2563EB',
}: {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, percentage)) / 100) * circumference;

  return (
    <Box
      sx={{
        position: 'relative',
        width: size,
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#EEF2F6" strokeWidth={strokeWidth} fill="transparent" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <Box sx={{ position: 'absolute', textAlign: 'center' }}>
        <Typography sx={{ fontWeight: 800, fontSize: '0.7rem', color: '#0F172A', lineHeight: 1 }}>
          {Math.round(percentage)}%
        </Typography>
      </Box>
    </Box>
  );
}

export default function StudentCoursesTab({ courses }: StudentCoursesTabProps) {
  const [courseSearch, setCourseSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const totalCourses = courses.length;
  const completedCount = courses.filter((c) => c.status === 'Completed' || c.progressPct >= 100).length;
  const inProgressCount = totalCourses - completedCount;
  const totalModulesCompleted = courses.reduce((acc, c) => acc + (c.modulesCompleted || 0), 0);

  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const matchSearch =
        c.title.toLowerCase().includes(courseSearch.toLowerCase()) ||
        c.instructor.toLowerCase().includes(courseSearch.toLowerCase());
      const isCompleted = c.status === 'Completed' || c.progressPct >= 100;
      const matchStatus =
        selectedStatus === 'ALL' ||
        (selectedStatus === 'Completed' && isCompleted) ||
        (selectedStatus === 'In Progress' && !isCompleted);
      return matchSearch && matchStatus;
    });
  }, [courses, courseSearch, selectedStatus]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* Top 4 Curriculum Metric Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2 }}>
        {/* Card 1: Enrolled Courses */}
        <Card
          elevation={0}
          sx={{
            p: 2.2,
            borderRadius: '16px',
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box>
            <Typography sx={{ color: '#64748B', fontSize: '0.74rem', fontWeight: 700 }}>Enrolled Courses</Typography>
            <Typography sx={{ color: '#0F172A', fontSize: '1.45rem', fontWeight: 900, mt: 0.3 }}>
              {totalCourses}
            </Typography>
            <Typography sx={{ color: '#2563EB', fontSize: '0.7rem', fontWeight: 700 }}>
              Curriculum catalog
            </Typography>
          </Box>
          <Box sx={{ width: 44, height: 44, borderRadius: '12px', bgcolor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <SchoolRoundedIcon sx={{ fontSize: 24 }} />
          </Box>
        </Card>

        {/* Card 2: Completed Courses */}
        <Card
          elevation={0}
          sx={{
            p: 2.2,
            borderRadius: '16px',
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box>
            <Typography sx={{ color: '#64748B', fontSize: '0.74rem', fontWeight: 700 }}>Completed</Typography>
            <Typography sx={{ color: '#0F172A', fontSize: '1.45rem', fontWeight: 900, mt: 0.3 }}>
              {completedCount}
            </Typography>
            <Typography sx={{ color: '#059669', fontSize: '0.7rem', fontWeight: 700 }}>
              Graduated tracks
            </Typography>
          </Box>
          <Box sx={{ width: 44, height: 44, borderRadius: '12px', bgcolor: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircleRoundedIcon sx={{ fontSize: 24 }} />
          </Box>
        </Card>

        {/* Card 3: In Progress Sprints */}
        <Card
          elevation={0}
          sx={{
            p: 2.2,
            borderRadius: '16px',
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box>
            <Typography sx={{ color: '#64748B', fontSize: '0.74rem', fontWeight: 700 }}>Active Sprints</Typography>
            <Typography sx={{ color: '#0F172A', fontSize: '1.45rem', fontWeight: 900, mt: 0.3 }}>
              {inProgressCount}
            </Typography>
            <Typography sx={{ color: '#D97706', fontSize: '0.7rem', fontWeight: 700 }}>
              In active learning
            </Typography>
          </Box>
          <Box sx={{ width: 44, height: 44, borderRadius: '12px', bgcolor: '#FFFBEB', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <PlayCircleOutlineRoundedIcon sx={{ fontSize: 24 }} />
          </Box>
        </Card>

        {/* Card 4: Total Modules Completed */}
        <Card
          elevation={0}
          sx={{
            p: 2.2,
            borderRadius: '16px',
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box>
            <Typography sx={{ color: '#64748B', fontSize: '0.74rem', fontWeight: 700 }}>Modules Completed</Typography>
            <Typography sx={{ color: '#0F172A', fontSize: '1.45rem', fontWeight: 900, mt: 0.3 }}>
              {totalModulesCompleted}
            </Typography>
            <Typography sx={{ color: '#0284C7', fontSize: '0.7rem', fontWeight: 700 }}>
              Hands-on lessons finished
            </Typography>
          </Box>
          <Box sx={{ width: 44, height: 44, borderRadius: '12px', bgcolor: '#F0F9FF', color: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MenuBookRoundedIcon sx={{ fontSize: 24 }} />
          </Box>
        </Card>
      </Box>

      {/* Main Courses Table Card */}
      <Card
        elevation={0}
        sx={{
          borderRadius: '16px',
          bgcolor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
          overflow: 'hidden',
        }}
      >
        {/* Header & Controls */}
        <Box sx={{ p: 2.5, borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.05rem' }}>
              Curriculum & Enrolled Courses
            </Typography>
            <Typography sx={{ color: '#64748B', fontSize: '0.76rem' }}>
              Track course module progression, interactive lab exercises, and certification status.
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1.2, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              placeholder="Search course or instructor..."
              size="small"
              value={courseSearch}
              onChange={(e) => setCourseSearch(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon sx={{ fontSize: 17, color: '#94A3B8' }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                width: { xs: '100%', sm: 240 },
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  bgcolor: '#F8FAFC',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                },
              }}
            />

            {/* Status Filter Chips */}
            <Box sx={{ display: 'flex', gap: 0.8 }}>
              {['ALL', 'In Progress', 'Completed'].map((st) => (
                <Chip
                  key={st}
                  label={st}
                  size="small"
                  onClick={() => setSelectedStatus(st)}
                  sx={{
                    cursor: 'pointer',
                    fontWeight: selectedStatus === st ? 800 : 600,
                    fontSize: '0.72rem',
                    bgcolor: selectedStatus === st ? '#2563EB' : '#F1F5F9',
                    color: selectedStatus === st ? '#FFFFFF' : '#475569',
                    border: '1px solid',
                    borderColor: selectedStatus === st ? '#2563EB' : '#E2E8F0',
                  }}
                />
              ))}
            </Box>
          </Box>
        </Box>

        {/* Structured List Table */}
        <TableContainer>
          <Table sx={{ minWidth: 700 }}>
            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, color: '#64748B', fontSize: '0.72rem', py: 1.2, borderColor: '#E2E8F0' }}>COURSE TITLE</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#64748B', fontSize: '0.72rem', borderColor: '#E2E8F0' }}>INSTRUCTOR</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#64748B', fontSize: '0.72rem', borderColor: '#E2E8F0' }}>MODULES</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#64748B', fontSize: '0.72rem', borderColor: '#E2E8F0' }}>COMPLETION</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#64748B', fontSize: '0.72rem', borderColor: '#E2E8F0' }}>STATUS</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#64748B', fontSize: '0.72rem', textAlign: 'right', borderColor: '#E2E8F0' }}>ACTION</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCourses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ py: 6, textAlign: 'center', borderColor: '#F1F5F9' }}>
                    <Typography sx={{ fontWeight: 800, fontSize: '0.92rem', color: '#0F172A' }}>
                      No enrolled courses found
                    </Typography>
                    <Typography sx={{ fontSize: '0.78rem', color: '#64748B', mt: 0.5 }}>
                      Explore the course catalog to enroll in guided software engineering curricula.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCourses.map((crs) => {
                  const clampedProgress = Math.min(100, Math.max(0, crs.progressPct ?? 0));
                  const isDone = crs.status === 'Completed' || clampedProgress >= 100;

                  return (
                    <TableRow
                      key={crs.id}
                      hover
                      sx={{
                        '&:hover': { bgcolor: '#F8FAFC !important' },
                        '&:last-child td': { borderBottom: 0 },
                      }}
                    >
                      <TableCell sx={{ borderColor: '#F1F5F9', py: 1.5 }}>
                        <Link href={`/courses/${crs.slug || crs.id}`} style={{ textDecoration: 'none' }}>
                          <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.88rem', '&:hover': { color: '#2563EB' }, transition: 'color 0.15s ease' }}>
                            {crs.title}
                          </Typography>
                        </Link>
                        <Typography sx={{ fontSize: '0.72rem', color: '#64748B' }}>
                          ID: #{crs.id.slice(0, 8)}
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ color: '#475569', fontSize: '0.82rem', fontWeight: 600, borderColor: '#F1F5F9' }}>
                        {crs.instructor}
                      </TableCell>

                      <TableCell sx={{ borderColor: '#F1F5F9' }}>
                        <Typography sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.82rem' }}>
                          {crs.modulesCompleted} / {crs.totalModules}{' '}
                          <span style={{ color: '#64748B', fontSize: '0.72rem', fontWeight: 500 }}>Modules</span>
                        </Typography>
                      </TableCell>

                      {/* Completion Progress with Circular Gauge */}
                      <TableCell sx={{ borderColor: '#F1F5F9' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <CircularProgressGauge
                            percentage={clampedProgress}
                            size={38}
                            strokeWidth={4}
                            color={isDone ? '#10B981' : '#2563EB'}
                          />
                          <Box sx={{ flex: 1, minWidth: 80 }}>
                            <Box sx={{ height: 6, width: '100%', bgcolor: '#E2E8F0', borderRadius: 99, overflow: 'hidden' }}>
                              <Box
                                sx={{
                                  width: `${clampedProgress}%`,
                                  height: '100%',
                                  bgcolor: isDone ? '#10B981' : '#2563EB',
                                  borderRadius: 99,
                                  transition: 'width 0.4s ease',
                                }}
                              />
                            </Box>
                          </Box>
                        </Box>
                      </TableCell>

                      <TableCell sx={{ borderColor: '#F1F5F9' }}>
                        <Chip
                          label={isDone ? 'Completed' : 'In Progress'}
                          size="small"
                          sx={{
                            bgcolor: isDone ? '#ECFDF5' : '#EFF6FF',
                            color: isDone ? '#059669' : '#1D4ED8',
                            border: `1px solid ${isDone ? '#A7F3D0' : '#BFDBFE'}`,
                            fontWeight: 800,
                            fontSize: '0.72rem',
                            height: 22,
                          }}
                        />
                      </TableCell>

                      <TableCell sx={{ textAlign: 'right', borderColor: '#F1F5F9' }}>
                        <Link href={`/courses/${crs.slug || crs.id}`} style={{ textDecoration: 'none' }}>
                          <Button
                            variant={isDone ? 'outlined' : 'contained'}
                            size="small"
                            endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: 13 }} />}
                            sx={{
                              textTransform: 'none',
                              fontWeight: 800,
                              borderRadius: '6px',
                              fontSize: '0.74rem',
                              px: 1.5,
                              py: 0.4,
                              bgcolor: isDone ? '#FFFFFF' : '#2563EB',
                              color: isDone ? '#2563EB' : '#FFFFFF',
                              borderColor: '#BFDBFE',
                              '&:hover': {
                                bgcolor: isDone ? '#EFF6FF' : '#1D4ED8',
                              },
                            }}
                          >
                            {isDone ? 'Review' : 'Resume'}
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
}
