'use client';

import React from 'react';
import { Box, Card, Typography } from '@mui/material';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import AssignmentTurnedInRoundedIcon from '@mui/icons-material/AssignmentTurnedInRounded';

interface FacultyMetricsRowProps {
  batchesCount: number;
  studentsCount: number;
  coursesCount: number;
  avgAccuracy: string;
}

export default function FacultyMetricsRow({
  batchesCount,
  studentsCount,
  coursesCount,
  avgAccuracy,
}: FacultyMetricsRowProps) {
  const borderColor = '#E2E8F0';

  const metrics = [
    {
      title: 'Assigned Cohorts',
      value: batchesCount.toString(),
      subtitle: 'Active student batches',
      color: '#2563EB',
      bgColor: '#EFF6FF',
      icon: <SchoolRoundedIcon sx={{ fontSize: 24, color: '#2563EB' }} />,
    },
    {
      title: 'Mentored Students',
      value: studentsCount.toLocaleString(),
      subtitle: 'Under direct supervision',
      color: '#059669',
      bgColor: '#ECFDF5',
      icon: <PeopleAltRoundedIcon sx={{ fontSize: 24, color: '#059669' }} />,
    },
    {
      title: 'Active Curriculum Courses',
      value: coursesCount.toString(),
      subtitle: 'Lab tracks & modules',
      color: '#7C3AED',
      bgColor: '#F5F3FF',
      icon: <MenuBookRoundedIcon sx={{ fontSize: 24, color: '#7C3AED' }} />,
    },
    {
      title: 'Cohort Average Accuracy',
      value: (avgAccuracy !== null && avgAccuracy !== undefined && avgAccuracy !== '') ? avgAccuracy : 'N/A',
      subtitle: 'Algorithmic benchmarks',
      color: '#D97706',
      bgColor: '#FFFBEB',
      icon: <AssignmentTurnedInRoundedIcon sx={{ fontSize: 24, color: '#D97706' }} />,
    },
  ];

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2.5 }}>
      {metrics.map((m) => (
        <Card
          key={m.title}
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: '18px',
            bgcolor: '#FFFFFF',
            border: `1px solid ${borderColor}`,
            boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Typography sx={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {m.title}
            </Typography>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '12px',
                bgcolor: m.bgColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {m.icon}
            </Box>
          </Box>

          <Box>
            <Typography sx={{ fontSize: '1.75rem', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              {m.value}
            </Typography>
            <Typography sx={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 500, mt: 0.5 }}>
              {m.subtitle}
            </Typography>
          </Box>
        </Card>
      ))}
    </Box>
  );
}
