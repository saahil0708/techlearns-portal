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
    <Card elevation={0} sx={{ borderRadius: '20px', border: '1px solid rgba(59, 130, 246, 0.25)', bgcolor: '#0F172A', p: 3, boxShadow: '0 8px 30px rgba(0,0,0,0.4)' }}>
      <Typography variant="h6" sx={{ fontWeight: 800, color: '#FFFFFF', mb: 2.5 }}>
        Curriculum & Enrolled Courses
      </Typography>

      <TableContainer sx={{ borderRadius: '14px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
        <Table>
          <TableHead sx={{ bgcolor: 'rgba(30, 41, 59, 0.8)' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 800, color: '#94A3B8', fontSize: '0.8rem', py: 1.5, borderColor: 'rgba(255, 255, 255, 0.08)' }}>COURSE TITLE</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#94A3B8', fontSize: '0.8rem', borderColor: 'rgba(255, 255, 255, 0.08)' }}>INSTRUCTOR</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#94A3B8', fontSize: '0.8rem', borderColor: 'rgba(255, 255, 255, 0.08)' }}>MODULES</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#94A3B8', fontSize: '0.8rem', borderColor: 'rgba(255, 255, 255, 0.08)' }}>COMPLETION</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#94A3B8', fontSize: '0.8rem', borderColor: 'rgba(255, 255, 255, 0.08)' }}>STATUS</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {courses.map((crs) => (
              <TableRow key={crs.id} hover sx={{ '&:hover': { bgcolor: 'rgba(30, 41, 59, 0.5) !important' } }}>
                <TableCell sx={{ fontWeight: 700, color: '#F8FAFC', borderColor: 'rgba(255, 255, 255, 0.06)' }}>{crs.title}</TableCell>
                <TableCell sx={{ color: '#CBD5E1', fontSize: '0.86rem', borderColor: 'rgba(255, 255, 255, 0.06)' }}>{crs.instructor}</TableCell>
                <TableCell sx={{ color: '#94A3B8', fontSize: '0.84rem', borderColor: 'rgba(255, 255, 255, 0.06)' }}>
                  {crs.modulesCompleted} / {crs.totalModules} Modules
                </TableCell>
                <TableCell sx={{ width: 180, borderColor: 'rgba(255, 255, 255, 0.06)' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <LinearProgress
                      variant="determinate"
                      value={crs.progressPct}
                      sx={{ flex: 1, height: 6, borderRadius: '9999px', bgcolor: 'rgba(255, 255, 255, 0.08)', '& .MuiLinearProgress-bar': { bgcolor: '#38BDF8', boxShadow: '0 0 8px #38BDF8' } }}
                    />
                    <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#FFFFFF' }}>
                      {crs.progressPct}%
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell sx={{ borderColor: 'rgba(255, 255, 255, 0.06)' }}>
                  <Chip
                    label={crs.status}
                    size="small"
                    sx={{
                      bgcolor: crs.status === 'Completed' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(37, 99, 235, 0.2)',
                      color: crs.status === 'Completed' ? '#34D399' : '#60A5FA',
                      border: `1px solid ${crs.status === 'Completed' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(59, 130, 246, 0.4)'}`,
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
