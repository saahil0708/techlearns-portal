'use client';

import React from 'react';
import {
  Box,
  Typography,
  Card,
  Chip,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
} from '@mui/material';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { CourseAssignment } from './types';

interface CourseAssignmentsTabProps {
  assignments: CourseAssignment[];
  isStudent?: boolean;
}

export default function CourseAssignmentsTab({
  assignments,
  isStudent = false,
}: CourseAssignmentsTabProps) {
  const difficultyColors = {
    Easy: { bg: '#F0FDF4', color: '#16A34A', border: '#BBF7D0' },
    Medium: { bg: '#FFFBEB', color: '#D97706', border: '#FDE68A' },
    Hard: { bg: '#FEF2F2', color: '#DC2626', border: '#FECACA' },
  };

  return (
    <Card elevation={0} sx={{ borderRadius: '20px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.05rem' }}>
            Course Assignments & Milestone Assessments
          </Typography>
          <Typography sx={{ color: '#64748B', fontSize: '0.82rem' }}>
            Graded coding laboratories, milestone checkpoints, and project evaluations.
          </Typography>
        </Box>

        {!isStudent && (
          <Button
            variant="contained"
            size="small"
            startIcon={<AddRoundedIcon />}
            sx={{
              bgcolor: '#2563EB',
              borderRadius: '9999px',
              textTransform: 'none',
              fontWeight: 700,
              '&:hover': { bgcolor: '#1D4ED8' },
            }}
          >
            Create Assignment
          </Button>
        )}
      </Box>

      {assignments.length === 0 ? (
        <Box sx={{ py: 6, textAlign: 'center', color: '#94A3B8' }}>
          <AssignmentRoundedIcon sx={{ fontSize: 40, color: '#CBD5E1', mb: 1 }} />
          <Typography sx={{ fontWeight: 700, color: '#475569' }}>
            No assignments created for this course yet.
          </Typography>
        </Box>
      ) : (
        <TableContainer sx={{ borderRadius: '14px', border: '1px solid #F1F5F9' }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem', py: 1.5 }}>TITLE</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>MODULE</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>TYPE</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>DIFFICULTY</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>SUBMISSIONS</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>AVG SCORE</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>DUE DATE</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>STATUS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {assignments.map((asg) => {
                const diff = difficultyColors[asg.difficulty] || difficultyColors.Medium;
                return (
                  <TableRow key={asg.id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                    <TableCell sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.88rem' }}>
                      {asg.title}
                    </TableCell>
                    <TableCell sx={{ color: '#475569', fontSize: '0.84rem' }}>
                      {asg.module}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={asg.type}
                        size="small"
                        sx={{
                          bgcolor: '#EFF6FF',
                          color: '#2563EB',
                          fontWeight: 700,
                          fontSize: '0.72rem',
                          borderRadius: '6px',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={asg.difficulty}
                        size="small"
                        sx={{
                          bgcolor: diff.bg,
                          color: diff.color,
                          border: `1px solid ${diff.border}`,
                          fontWeight: 700,
                          fontSize: '0.72rem',
                          borderRadius: '6px',
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#0F172A', fontSize: '0.84rem' }}>
                      {asg.submissionsCount}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#16A34A', fontSize: '0.85rem' }}>
                      {asg.avgScore}%
                    </TableCell>
                    <TableCell sx={{ color: '#64748B', fontSize: '0.82rem' }}>
                      {asg.dueDate}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={asg.status}
                        size="small"
                        sx={{
                          bgcolor: asg.status === 'Open' ? '#ECFDF5' : '#F1F5F9',
                          color: asg.status === 'Open' ? '#059669' : '#64748B',
                          fontWeight: 700,
                          fontSize: '0.72rem',
                          borderRadius: '6px',
                        }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Card>
  );
}
