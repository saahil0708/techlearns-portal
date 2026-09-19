'use client';

import React from 'react';
import { Box } from '@mui/material';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import AssignmentTurnedInRoundedIcon from '@mui/icons-material/AssignmentTurnedInRounded';
import StatsCard from '@/components/superadmin/shared/StatsCard';

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
  const displayAvgAccuracy =
    avgAccuracy !== null && avgAccuracy !== undefined && avgAccuracy !== ''
      ? avgAccuracy
      : 'N/A';

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2.5 }}>
      <StatsCard
        title="Assigned Cohorts"
        value={batchesCount.toString()}
        icon={<SchoolRoundedIcon sx={{ fontSize: 20 }} />}
        variant="blue"
        shape="orbital"
        subtitle="Active student batches"
      />

      <StatsCard
        title="Mentored Students"
        value={studentsCount.toLocaleString()}
        icon={<PeopleAltRoundedIcon sx={{ fontSize: 20 }} />}
        variant="black"
        shape="topography"
        subtitle="Under direct supervision"
      />

      <StatsCard
        title="Active Curriculum Courses"
        value={coursesCount.toString()}
        icon={<MenuBookRoundedIcon sx={{ fontSize: 20 }} />}
        variant="blue"
        shape="hex-grid"
        subtitle="Lab tracks & modules"
      />

      <StatsCard
        title="Cohort Average Accuracy"
        value={displayAvgAccuracy}
        icon={<AssignmentTurnedInRoundedIcon sx={{ fontSize: 20 }} />}
        variant="black"
        shape="aurora-waves"
        subtitle="Algorithmic benchmarks"
      />
    </Box>
  );
}
