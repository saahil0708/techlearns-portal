'use client';

import React from 'react';
import { Box, Typography, Card } from '@mui/material';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';

interface KpiItem {
  id: string;
  title: string;
  value: string | number;
  unit?: string;
  trendText: string;
  trendType: 'positive' | 'neutral' | 'speed';
  sparkHeights: number[]; // 0-100 percentage
  barColor: string;
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
      barColor: '#10B981',
      icon: <TrendingUpRoundedIcon sx={{ fontSize: 18, color: '#10B981' }} />,
    },
    {
      id: 'kpi-2',
      title: 'Compiler Pass Rate',
      value: formattedPassRate,
      unit: 'avg pass',
      trendText: '↗ 3.1% velocity',
      trendType: 'positive',
      sparkHeights: [60, 70, 65, 80, 75, 85, 92],
      barColor: '#2563EB',
      icon: <CheckCircleRoundedIcon sx={{ fontSize: 18, color: '#2563EB' }} />,
    },
    {
      id: 'kpi-3',
      title: 'Active Campus Coders',
      value: formattedStudents,
      unit: 'students',
      trendText: '↗ 18.9% active growth',
      trendType: 'positive',
      sparkHeights: [40, 50, 70, 60, 85, 95, 100],
      barColor: '#8B5CF6',
      icon: <PeopleAltRoundedIcon sx={{ fontSize: 18, color: '#8B5CF6' }} />,
    },
    {
      id: 'kpi-4',
      title: 'Sandbox Engine Latency',
      value: formattedRuntime,
      unit: 'avg exec',
      trendText: '⚡ -12ms fast cluster',
      trendType: 'speed',
      sparkHeights: [80, 65, 70, 50, 45, 38, 30],
      barColor: '#F59E0B',
      icon: <BoltRoundedIcon sx={{ fontSize: 18, color: '#F59E0B' }} />,
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
      {kpis.map((kpi) => (
        <Card
          key={kpi.id}
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: '20px',
            bgcolor: '#FFFFFF',
            border: '1px solid rgba(226, 232, 240, 0.9)',
            boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.03), 0 2px 6px -1px rgba(0, 0, 0, 0.02)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 12px 28px -4px rgba(0, 0, 0, 0.07)',
              borderColor: '#CBD5E1',
            },
          }}
        >
          {/* Left Info: Title, Big Value, Trend Pill */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.85, zIndex: 1 }}>
            <Typography
              sx={{
                fontSize: '0.78rem',
                fontWeight: 600,
                color: '#64748B',
                letterSpacing: '-0.01em',
              }}
            >
              {kpi.title}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.75 }}>
              <Typography
                sx={{
                  fontSize: '1.65rem',
                  fontWeight: 800,
                  color: '#0F172A',
                  letterSpacing: '-0.03em',
                  lineHeight: 1.1,
                }}
              >
                {kpi.value}
              </Typography>
              {kpi.unit && (
                <Typography sx={{ fontSize: '0.74rem', color: '#94A3B8', fontWeight: 500 }}>
                  {kpi.unit}
                </Typography>
              )}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.25 }}>
              <Box
                sx={{
                  px: 1,
                  py: 0.25,
                  borderRadius: '6px',
                  bgcolor: kpi.barColor === '#10B981'
                    ? '#ECFDF5'
                    : kpi.barColor === '#2563EB'
                    ? '#EFF6FF'
                    : kpi.barColor === '#8B5CF6'
                    ? '#F5F3FF'
                    : '#FFFBEB',
                  color: kpi.barColor,
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.35,
                }}
              >
                {kpi.trendText}
              </Box>
            </Box>
          </Box>

          {/* Right Info: Mini Sparkline Bar Columns */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: '4px',
              height: 48,
              pl: 1,
              opacity: 0.9,
            }}
          >
            {kpi.sparkHeights.map((h, i) => (
              <Box
                key={i}
                sx={{
                  width: 5,
                  height: `${Math.max(15, h)}%`,
                  borderRadius: '3px',
                  bgcolor: kpi.barColor,
                  opacity: i === kpi.sparkHeights.length - 1 ? 1 : 0.25 + (i * 0.1),
                  transition: 'height 0.3s ease',
                }}
              />
            ))}
          </Box>
        </Card>
      ))}
    </Box>
  );
}
