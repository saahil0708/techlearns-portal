'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  Chip,
  TextField,
  InputAdornment,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  LinearProgress,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import { StudentCourseItem } from './types';
import PaginationToolbar from './PaginationToolbar';

interface StudentCoursesTabProps {
  courses: StudentCourseItem[];
}

export default function StudentCoursesTab({ courses }: StudentCoursesTabProps) {
  const [courseSearch, setCourseSearch] = useState('');
  const [coursePage, setCoursePage] = useState<number>(0);
  const [courseRowsPerPage, setCourseRowsPerPage] = useState<number>(10);
  const borderColor = '#E2E8F0';

  const filteredCourses = courses.filter((c) => {
    if (
      courseSearch &&
      !c.title.toLowerCase().includes(courseSearch.toLowerCase()) &&
      !c.code.toLowerCase().includes(courseSearch.toLowerCase()) &&
      !c.instructor.toLowerCase().includes(courseSearch.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const paginatedCourses = filteredCourses.slice(
    coursePage * courseRowsPerPage,
    coursePage * courseRowsPerPage + courseRowsPerPage
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Courses Filter bar */}
      <Card
        elevation={0}
        sx={{
          p: 2,
          px: 2.5,
          borderRadius: '14px',
          bgcolor: '#FFFFFF',
          border: `1px solid ${borderColor}`,
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <TextField
          size="small"
          placeholder="Search course title, code, instructor..."
          value={courseSearch}
          onChange={(e) => {
            setCourseSearch(e.target.value);
            setCoursePage(0);
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#64748B', fontSize: 18 }} />
                </InputAdornment>
              ),
            },
          }}
          sx={{
            minWidth: { xs: '100%', sm: 300 },
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
              bgcolor: '#F8FAFC',
              fontSize: '0.84rem',
              height: 36,
              '& fieldset': { borderColor: '#E2E8F0' },
            },
          }}
        />

        <Typography sx={{ fontSize: '0.82rem', color: '#64748B' }}>
          Showing <strong style={{ color: '#0F172A' }}>{filteredCourses.length}</strong> enrolled tracks
        </Typography>
      </Card>

      {/* Courses Table */}
      <Card
        elevation={0}
        sx={{
          borderRadius: '16px',
          bgcolor: '#FFFFFF',
          border: `1px solid ${borderColor}`,
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
        }}
      >
        <TableContainer>
          <Table size="small">
            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', pl: 3, py: 1.5 }}>TRACK TITLE & CODE</TableCell>
                <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5 }}>LEVEL</TableCell>
                <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5 }}>MODULES COMPLETED</TableCell>
                <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5, minWidth: 200 }}>CURRICULUM PROGRESS</TableCell>
                <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5 }}>INSTRUCTOR</TableCell>
                <TableCell align="right" sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', pr: 3, py: 1.5 }}>STATUS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedCourses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: 'center', py: 6, color: '#64748B' }}>
                    No enrolled courses found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedCourses.map((c) => (
                  <TableRow key={c.id} hover sx={{ '& td': { borderBottom: '1px solid #F1F5F9' } }}>
                    <TableCell sx={{ pl: 3, py: 1.75 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                        <Box sx={{ width: 34, height: 34, borderRadius: '8px', bgcolor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <MenuBookRoundedIcon sx={{ fontSize: 18 }} />
                        </Box>
                        <Box>
                          <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A' }}>{c.title}</Typography>
                          <Typography sx={{ fontSize: '0.72rem', color: '#64748B', fontFamily: 'monospace' }}>{c.code}</Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    <TableCell sx={{ py: 1.75 }}>
                      <Chip label={c.level} size="small" sx={{ height: 22, fontSize: '0.7rem', fontWeight: 700, bgcolor: '#EFF6FF', color: '#2563EB', borderRadius: '5px' }} />
                    </TableCell>

                    <TableCell sx={{ py: 1.75 }}>
                      <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>
                        {c.modulesCompleted} / {c.totalModules} Modules
                      </Typography>
                    </TableCell>

                    <TableCell sx={{ py: 1.75 }}>
                      <Box sx={{ minWidth: 160 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                          <Typography sx={{ fontSize: '0.76rem', fontWeight: 700, color: '#0F172A' }}>
                            {c.progressPct}% Complete
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={c.progressPct}
                          sx={{ height: 5, borderRadius: 3, bgcolor: '#E2E8F0', '& .MuiLinearProgress-bar': { bgcolor: c.progressPct === 100 ? '#10B981' : '#2563EB', borderRadius: 3 } }}
                        />
                      </Box>
                    </TableCell>

                    <TableCell sx={{ py: 1.75 }}>
                      <Typography sx={{ fontSize: '0.84rem', fontWeight: 600, color: '#334155' }}>
                        {c.instructor}
                      </Typography>
                    </TableCell>

                    <TableCell align="right" sx={{ pr: 3, py: 1.75 }}>
                      <Chip
                        label={c.status}
                        size="small"
                        sx={{
                          height: 22,
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          bgcolor: c.status === 'Completed' ? '#ECFDF5' : '#EFF6FF',
                          color: c.status === 'Completed' ? '#059669' : '#2563EB',
                          border: c.status === 'Completed' ? '1px solid #A7F3D0' : '1px solid #DBEAFE',
                          borderRadius: '5px',
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

      {/* Courses Pagination */}
      <PaginationToolbar
        totalEntries={filteredCourses.length}
        currentPage={coursePage}
        rowsPerPage={courseRowsPerPage}
        onPageChange={setCoursePage}
        onRowsPerPageChange={setCourseRowsPerPage}
        itemLabel="courses"
        rowsOptions={[5, 10, 20]}
      />
    </Box>
  );
}
