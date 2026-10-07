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
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import { ProblemCohortItem } from './types';

interface ProblemCohortsTabProps {
  cohorts: ProblemCohortItem[];
  onOpenAssignModal: () => void;
}

export default function ProblemCohortsTab({
  cohorts,
  onOpenAssignModal,
}: ProblemCohortsTabProps) {
  return (
    <Card elevation={0} sx={{ borderRadius: '20px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.05rem' }}>
            Assigned Academic Cohorts & Roster Progress
          </Typography>
          <Typography sx={{ color: '#64748B', fontSize: '0.82rem' }}>
            Academic batches and student cohorts assigned to complete this problem as coursework or contest practice.
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="small"
          startIcon={<AddRoundedIcon />}
          onClick={onOpenAssignModal}
          sx={{
            bgcolor: '#2563EB',
            backgroundImage: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
            borderRadius: '9999px',
            px: 2.5,
            py: 0.75,
            fontWeight: 700,
            textTransform: 'none',
            fontSize: '0.85rem',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
            '&:hover': { bgcolor: '#1D4ED8' },
          }}
        >
          Assign to Cohort
        </Button>
      </Box>

      {cohorts.length === 0 ? (
        <Box
          sx={{
            py: 8,
            px: 3,
            textAlign: 'center',
            borderRadius: '16px',
            border: '1px dashed #CBD5E1',
            bgcolor: '#F8FAFC',
          }}
        >
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              bgcolor: '#EFF6FF',
              border: '1px solid #DBEAFE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
            }}
          >
            <SchoolRoundedIcon sx={{ fontSize: 28, color: '#2563EB' }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', mb: 0.75, fontSize: '1.05rem' }}>
            No Cohorts Assigned Yet
          </Typography>
          <Typography sx={{ color: '#64748B', fontSize: '0.88rem', maxWidth: 480, mx: 'auto', mb: 3, lineHeight: 1.6 }}>
            This challenge has not yet been assigned to any student cohorts or academic batches. Click below to assign it to an institution batch.
          </Typography>
          <Button
            variant="contained"
            size="small"
            startIcon={<AddRoundedIcon />}
            onClick={onOpenAssignModal}
            sx={{
              bgcolor: '#2563EB',
              borderRadius: '9999px',
              textTransform: 'none',
              fontWeight: 700,
              px: 3,
              py: 0.75,
              '&:hover': { bgcolor: '#1D4ED8' },
            }}
          >
            Assign to Cohort
          </Button>
        </Box>
      ) : (
        <TableContainer sx={{ borderRadius: '14px', border: '1px solid #F1F5F9' }}>
          <Table>
            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem', py: 1.5 }}>COHORT NAME</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>COLLEGE / SCHOOL</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>ASSIGNED DATE</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>ATTEMPTED / TOTAL</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>AVG ACCURACY</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>STATUS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cohorts.map((coh) => (
                <TableRow key={coh.id} hover>
                  <TableCell sx={{ fontWeight: 700, color: '#0F172A' }}>{coh.cohortName}</TableCell>
                  <TableCell sx={{ color: '#475569', fontSize: '0.86rem' }}>{coh.collegeName}</TableCell>
                  <TableCell sx={{ color: '#64748B', fontSize: '0.84rem' }}>{coh.assignedDate}</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#0F172A', fontSize: '0.86rem' }}>
                    {coh.studentsAttempted} / {coh.totalStudents} ({coh.totalStudents > 0 ? Math.round((coh.studentsAttempted / coh.totalStudents) * 100) : 0}%)
                  </TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#16A34A', fontSize: '0.86rem' }}>
                    {coh.avgAccuracy}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={coh.status}
                      size="small"
                      sx={{
                        bgcolor: coh.status === 'Mandatory' ? '#EFF6FF' : '#F8FAFC',
                        color: coh.status === 'Mandatory' ? '#2563EB' : '#64748B',
                        border: `1px solid ${coh.status === 'Mandatory' ? '#DBEAFE' : '#E2E8F0'}`,
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
      )}
    </Card>
  );
}
