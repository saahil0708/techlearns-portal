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
import Link from 'next/link';
import type { FacultyCourseItem } from '@/data';

export type { FacultyCourseItem };

interface FacultyCoursesTabProps {
  courses: FacultyCourseItem[];
  collegeName: string;
}

export default function FacultyCoursesTab({ courses, collegeName }: FacultyCoursesTabProps) {
  const [search, setSearch] = useState('');
  const borderColor = '#E2E8F0';

  const filteredCourses = courses.filter((c) => {
    if (!search) return true;
    return (
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* Search Bar */}
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

        <Typography sx={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 600 }}>
          Showing <strong>{filteredCourses.length}</strong> of {courses.length} Assigned Courses in {collegeName}
        </Typography>
      </Card>

      {/* Structured List Table */}
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
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCourses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6, color: '#94A3B8' }}>
                    <MenuBookRoundedIcon sx={{ fontSize: 36, color: '#CBD5E1', mb: 1 }} />
                    <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: '#64748B' }}>
                      No assigned curriculum tracks found.
                    </Typography>
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
                          <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A' }}>
                            {course.title}
                          </Typography>
                          <Typography sx={{ fontSize: '0.74rem', color: '#64748B', fontFamily: 'monospace' }}>
                            {course.code}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    <TableCell sx={{ py: 2 }}>
                      <Chip
                        label={course.level}
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
                        {course.modulesCount} Interactive Modules
                      </Typography>
                    </TableCell>

                    <TableCell sx={{ py: 2 }}>
                      <Typography sx={{ fontSize: '0.86rem', fontWeight: 800, color: '#0F172A' }}>
                        {course.enrolledStudents.toLocaleString()}{' '}
                        <span style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 500 }}>coders</span>
                      </Typography>
                    </TableCell>

                    <TableCell sx={{ py: 2 }}>
                      <Chip
                        label={course.status}
                        size="small"
                        sx={{
                          height: 22,
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          bgcolor: '#ECFDF5',
                          border: '1px solid #A7F3D0',
                          color: '#059669',
                          borderRadius: '6px',
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
}
