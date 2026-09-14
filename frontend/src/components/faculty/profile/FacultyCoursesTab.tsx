'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Chip,
  TextField,
  InputAdornment,
  Button,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import Link from 'next/link';

import FacultyCreateCourseModal from './FacultyCreateCourseModal';
import { useToast } from '@/context/ToastContext';
import { generateSafeCsv, downloadCsvBlob } from '@/utils/csv';
import type { FacultyCourseItem } from '@/data';

export type { FacultyCourseItem };

interface FacultyCoursesTabProps {
  courses: FacultyCourseItem[];
  collegeName: string;
  collegeId?: string;
  onCourseCreated?: (course: any) => void;
}

export default function FacultyCoursesTab({
  courses,
  collegeName,
  collegeId,
  onCourseCreated,
}: FacultyCoursesTabProps) {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [isCreateCourseModalOpen, setIsCreateCourseModalOpen] = useState(false);
  const borderColor = '#E2E8F0';

  const filteredCourses = courses.filter((c) => {
    if (!search) return true;
    return (
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.level?.toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleExportCSV = () => {
    if (courses.length === 0) {
      toast.info('No courses available to export.', 'Empty List');
      return;
    }

    const headers = ['Course Title', 'Code', 'Difficulty Level', 'Modules Count', 'Enrolled Students', 'Status'];
    const rows = courses.map((c) => [
      c.title || '',
      c.code || '',
      c.level || 'Intermediate',
      c.modulesCount || 0,
      c.enrolledStudents || 0,
      c.status || 'Published',
    ]);

    const csvContent = generateSafeCsv(headers, rows);
    downloadCsvBlob(`${collegeName.replace(/\s+/g, '_')}_curriculum_courses.csv`, csvContent);
    toast.success(`Exported ${courses.length} courses to CSV!`, 'Courses Exported');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* Search & Action Bar */}
      <Card
        elevation={0}
        sx={{
          p: 2,
          px: 2.5,
          borderRadius: '16px',
          bgcolor: '#FFFFFF',
          border: `1px solid ${borderColor}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: 260 }}>
          <TextField
            size="small"
            placeholder="Search courses, curriculum tracks, code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#94A3B8', fontSize: 20 }} />
                  </InputAdornment>
                ),
                sx: { borderRadius: '10px', fontSize: '0.85rem' },
              },
            }}
            sx={{ maxWidth: 360, width: '100%' }}
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<FileDownloadRoundedIcon sx={{ fontSize: 16 }} />}
            onClick={handleExportCSV}
            sx={{
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.82rem',
              borderColor: '#CBD5E1',
              color: '#334155',
              bgcolor: '#FFFFFF',
              px: 1.75,
              py: 0.75,
              '&:hover': { bgcolor: '#F8FAFC' },
            }}
          >
            Export CSV
          </Button>

          <Button
            variant="contained"
            size="small"
            startIcon={<AddCircleRoundedIcon sx={{ fontSize: 17 }} />}
            onClick={() => setIsCreateCourseModalOpen(true)}
            sx={{
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.82rem',
              bgcolor: '#7C3AED',
              color: '#FFFFFF',
              px: 2,
              py: 0.75,
              boxShadow: 'none',
              '&:hover': {
                bgcolor: '#6D28D9',
                boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)',
              },
            }}
          >
            Create Course Track
          </Button>
        </Box>
      </Card>

      {/* Structured List Table (Rule 10) */}
      <Card
        elevation={0}
        sx={{
          borderRadius: '18px',
          bgcolor: '#FFFFFF',
          border: `1px solid ${borderColor}`,
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)',
        }}
      >
        <TableContainer>
          <Table size="small">
            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', pl: 3, py: 1.5 }}>
                  COURSE CODE & TITLE
                </TableCell>
                <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5 }}>
                  DIFFICULTY LEVEL
                </TableCell>
                <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5 }}>
                  SYLLABUS MODULES
                </TableCell>
                <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5 }}>
                  ENROLLED STUDENTS
                </TableCell>
                <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5 }}>
                  STATUS
                </TableCell>
                <TableCell align="right" sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', pr: 3, py: 1.5 }}>
                  ACTIONS
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCourses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6, color: '#94A3B8' }}>
                    <MenuBookRoundedIcon sx={{ fontSize: 36, color: '#CBD5E1', mb: 1 }} />
                    <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: '#64748B' }}>
                      No curriculum courses found matching your criteria.
                    </Typography>
                    <Button
                      size="small"
                      startIcon={<AddCircleRoundedIcon sx={{ fontSize: 16 }} />}
                      onClick={() => setIsCreateCourseModalOpen(true)}
                      sx={{ mt: 1.5, textTransform: 'none', fontWeight: 700 }}
                    >
                      Create First Course Track
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCourses.map((course) => (
                  <TableRow key={course.id} hover sx={{ '& td': { borderBottom: '1px solid #F1F5F9' } }}>
                    <TableCell sx={{ pl: 3, py: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: '10px',
                            bgcolor: '#F5F3FF',
                            color: '#7C3AED',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '0.8rem',
                          }}
                        >
                          {course.code.slice(0, 3).toUpperCase()}
                        </Box>
                        <Box>
                          <Link href={`/courses`} style={{ textDecoration: 'none' }}>
                            <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A', '&:hover': { color: '#7C3AED' } }}>
                              {course.title}
                            </Typography>
                          </Link>
                          <Typography sx={{ fontSize: '0.74rem', color: '#64748B', fontFamily: 'monospace' }}>
                            {course.code}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    <TableCell sx={{ py: 2 }}>
                      <Chip
                        label={course.level || 'Intermediate'}
                        size="small"
                        sx={{
                          height: 22,
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          bgcolor: course.level === 'Advanced' ? '#FEF2F2' : course.level === 'Intermediate' ? '#FFFBEB' : '#EFF6FF',
                          color: course.level === 'Advanced' ? '#DC2626' : course.level === 'Intermediate' ? '#D97706' : '#2563EB',
                          borderRadius: '6px',
                        }}
                      />
                    </TableCell>

                    <TableCell sx={{ py: 2 }}>
                      <Typography sx={{ fontSize: '0.84rem', fontWeight: 600, color: '#334155' }}>
                        {course.modulesCount || 0} Interactive Modules
                      </Typography>
                    </TableCell>

                    <TableCell sx={{ py: 2 }}>
                      <Typography sx={{ fontSize: '0.86rem', fontWeight: 800, color: '#0F172A' }}>
                        {(course.enrolledStudents || 0).toLocaleString()}{' '}
                        <span style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 500 }}>coders</span>
                      </Typography>
                    </TableCell>

                    <TableCell sx={{ py: 2 }}>
                      <Chip
                        label={course.status || 'Published'}
                        size="small"
                        sx={{
                          height: 22,
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          bgcolor: course.status === 'Draft' ? '#F1F5F9' : '#ECFDF5',
                          border: `1px solid ${course.status === 'Draft' ? '#E2E8F0' : '#A7F3D0'}`,
                          color: course.status === 'Draft' ? '#64748B' : '#059669',
                          borderRadius: '6px',
                        }}
                      />
                    </TableCell>

                    <TableCell align="right" sx={{ pr: 3, py: 2 }}>
                      <Button
                        component={Link}
                        href="/courses"
                        size="small"
                        variant="outlined"
                        startIcon={<VisibilityRoundedIcon sx={{ fontSize: 14 }} />}
                        sx={{
                          textTransform: 'none',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          color: '#7C3AED',
                          borderColor: '#DDD6FE',
                          bgcolor: '#F5F3FF',
                          borderRadius: '8px',
                          py: 0.35,
                          px: 1.25,
                          '&:hover': { bgcolor: '#EDE9FE', borderColor: '#C4B5FD' },
                        }}
                      >
                        Syllabus
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Create Course Modal */}
      <FacultyCreateCourseModal
        open={isCreateCourseModalOpen}
        onClose={() => setIsCreateCourseModalOpen(false)}
        collegeId={collegeId}
        collegeName={collegeName}
        onCourseCreated={(c) => {
          onCourseCreated?.(c);
        }}
      />
    </Box>
  );
}
