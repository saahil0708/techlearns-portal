'use client';

import React from 'react';
import { Box } from '@mui/material';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import StatsCard, { StatsCardShape, StatsCardVariant } from '@/components/superadmin/shared/StatsCard';

interface KpiItem {
  id: string;
  title: string;
  value: string | number;
  unit?: string;
  trendText: string;
  trendType: 'positive' | 'neutral' | 'speed';
  sparkHeights: number[];
  variant: StatsCardVariant;
  shape: StatsCardShape;
  icon: React.ReactNode;
}

interface DashboardKpiRowProps {
  totalSubmissions?: number;
  passRate?: string;
  activeStudents?: number;
  avgRuntime?: string;
}

export default function DashboardKpiRow({
  totalSubmissions,
  passRate,
  activeStudents,
  avgRuntime,
}: DashboardKpiRowProps) {
  const formattedSubmissions =
    typeof totalSubmissions === 'number'
      ? totalSubmissions.toLocaleString()
      : totalSubmissions !== undefined
      ? String(totalSubmissions)
      : '1,420';

  const formattedPassRate =
    passRate !== undefined ? passRate : '78.5%';

  const formattedStudents =
    typeof activeStudents === 'number'
      ? activeStudents.toLocaleString()
      : activeStudents !== undefined
      ? String(activeStudents)
      : '2,840';

  const formattedRuntime =
    avgRuntime !== undefined ? avgRuntime : '38ms';

  const kpis: KpiItem[] = [
    {
      id: 'kpi-1',
      title: 'Platform Submissions',
      value: formattedSubmissions,
      unit: 'runs',
      trendText: '↗ 14.2% than last week',
      trendType: 'positive',
      sparkHeights: [35, 55, 45, 75, 60, 90, 80],
      variant: 'blue',
      shape: 'mountains',
      icon: <TrendingUpRoundedIcon sx={{ fontSize: 20 }} />,
    },
    {
      id: 'kpi-2',
      title: 'Compiler Pass Rate',
      value: formattedPassRate,
      unit: 'avg pass',
      trendText: '↗ 3.1% velocity',
      trendType: 'positive',
      sparkHeights: [60, 70, 65, 80, 75, 85, 92],
      variant: 'black',
      shape: 'curves',
      icon: <CheckCircleRoundedIcon sx={{ fontSize: 20 }} />,
    },
    {
      id: 'kpi-3',
      title: 'Active Campus Coders',
      value: formattedStudents,
      unit: 'students',
      trendText: '↗ 18.9% growth',
      trendType: 'positive',
      sparkHeights: [40, 50, 70, 60, 85, 95, 100],
      variant: 'blue',
      shape: 'peaks',
      icon: <PeopleAltRoundedIcon sx={{ fontSize: 20 }} />,
    },
    {
      id: 'kpi-4',
      title: 'Sandbox Engine Latency',
      value: formattedRuntime,
      unit: 'avg exec',
      trendText: '⚡ -12ms fast cluster',
      trendType: 'speed',
      sparkHeights: [80, 65, 70, 50, 45, 38, 30],
      variant: 'black',
      shape: 'waves',
      icon: <BoltRoundedIcon sx={{ fontSize: 20 }} />,
    },
  ];

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          lg: 'repeat(4, 1fr)',
        },
        gap: 2.5,
        width: '100%',
      }}
    >
      {kpis.map((kpi, idx) => (
        <StatsCard
          key={kpi.id}
          index={idx}
          title={kpi.title}
          variant={kpi.variant}
          shape={kpi.shape}
          icon={kpi.icon}
          value={
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.75 }}>
              <span>{kpi.value}</span>
              {kpi.unit && (
                <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'rgba(255,255,255,0.6)' }}>
                  {kpi.unit}
                </span>
              )}
            </Box>
          }
          trendBadge={{
            text: kpi.trendText,
            type: kpi.trendType,
          }}
          rightSlot={
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-end',
                gap: '3px',
                height: 38,
                opacity: 0.9,
              }}
            >
              {kpi.sparkHeights.map((h, i) => (
                <Box
                  key={i}
                  sx={{
                    width: 4,
                    height: `${Math.max(20, h)}%`,
                    borderRadius: '2px',
                    bgcolor: kpi.variant === 'blue' ? '#93C5FD' : '#A1A1AA',
                    opacity: i === kpi.sparkHeights.length - 1 ? 1 : 0.35 + i * 0.08,
                    transition: 'height 0.3s ease',
                  }}
                />
              ))}
            </Box>
          }
        />
      ))}
    </Box>
  );
}
