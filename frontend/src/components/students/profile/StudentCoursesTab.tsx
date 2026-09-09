'use client';

import React from 'react';
import {
  Box,
  Typography,
  Card,
  Chip,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  LinearProgress,
} from '@mui/material';
import { StudentCourseProgress } from '@/types/student-profile';

interface StudentCoursesTabProps {
  courses: StudentCourseProgress[];
}

export default function StudentCoursesTab({ courses }: StudentCoursesTabProps) {
  return (
    <Card elevation={0} sx={{ borderRadius: '20px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', p: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', mb: 2.5 }}>
        Curriculum & Enrolled Courses
      </Typography>

      <TableContainer sx={{ borderRadius: '14px', border: '1px solid #F1F5F9' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#F8FAFC' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem', py: 1.5 }}>COURSE TITLE</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>INSTRUCTOR</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>MODULES</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>COMPLETION</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>STATUS</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {courses.map((crs) => (
              <TableRow key={crs.id} hover>
                <TableCell sx={{ fontWeight: 700, color: '#0F172A' }}>{crs.title}</TableCell>
                <TableCell sx={{ color: '#475569', fontSize: '0.86rem' }}>{crs.instructor}</TableCell>
                <TableCell sx={{ color: '#64748B', fontSize: '0.84rem' }}>
                  {crs.modulesCompleted} / {crs.totalModules} Modules
                </TableCell>
                <TableCell sx={{ width: 180 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <LinearProgress
                      variant="determinate"
                      value={crs.progressPct}
                      sx={{ flex: 1, height: 6, borderRadius: '9999px', bgcolor: '#F1F5F9', '& .MuiLinearProgress-bar': { bgcolor: '#2563EB' } }}
                    />
                    <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#0F172A' }}>
                      {crs.progressPct}%
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={crs.status}
                    size="small"
                    sx={{
                      bgcolor: crs.status === 'Completed' ? '#F0FDF4' : '#EFF6FF',
                      color: crs.status === 'Completed' ? '#16A34A' : '#2563EB',
                      border: `1px solid ${crs.status === 'Completed' ? '#BBF7D0' : '#DBEAFE'}`,
                      fontWeight: 700,
                      fontSize: '0.74rem',
                      borderRadius: '6px',
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
}
