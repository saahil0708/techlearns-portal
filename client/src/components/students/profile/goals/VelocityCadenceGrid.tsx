'use client';

import React from 'react';
import {
  Box,
  Typography,
  Card,
  Chip,
} from '@mui/material';
import SpeedRoundedIcon from '@mui/icons-material/SpeedRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import FlagRoundedIcon from '@mui/icons-material/FlagRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import { UserGoalData } from './types';

interface VelocityCadenceGridProps {
  goalData: UserGoalData;
  targetSolveTime: number;
  currentSolveTime: number;
  solveDeltaText: string;
  dailyPercentage: number;
  weeklyPercentage: number;
  targetAcc: number;
  currentAccRate: number;
  accGapText: string;
  targetRating: number;
  currentRating: number;
  ratingGapText: string;
  onOpenCustomizer: (initialTab?: number) => void;
}

export default function VelocityCadenceGrid({
  goalData,
  targetSolveTime,
  currentSolveTime,
  solveDeltaText,
  dailyPercentage,
  weeklyPercentage,
  targetAcc,
  currentAccRate,
  accGapText,
  targetRating,
  currentRating,
  ratingGapText,
  onOpenCustomizer,
}: VelocityCadenceGridProps) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(6, 1fr)' },
        gap: 1.5,
      }}
    >
      {/* Card 1: Solve Time Per Problem */}
      <Card
        elevation={0}
        onClick={() => onOpenCustomizer(1)}
        sx={{
          p: 2,
          borderRadius: '14px',
          bgcolor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          '&:hover': { borderColor: '#0B1F3A', boxShadow: '0 4px 12px rgba(91, 45, 144, 0.08)', transform: 'translateY(-1px)' },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Box sx={{ width: 28, height: 28, borderRadius: '6px', bgcolor: '#FAF5FF', color: '#0B1F3A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <SpeedRoundedIcon sx={{ fontSize: 16 }} />
          </Box>
          <Chip label="Target" size="small" sx={{ bgcolor: '#FAF5FF', color: '#17366E', fontSize: '0.62rem', fontWeight: 800, height: 18 }} />
        </Box>
        <Typography sx={{ color: '#64748B', fontSize: '0.72rem', fontWeight: 700 }}>Solve Time / Min</Typography>
        <Typography sx={{ color: '#0F172A', fontSize: '1.15rem', fontWeight: 900, lineHeight: 1.2, my: 0.3 }}>
          {targetSolveTime}m <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>/prob</span>
        </Typography>
        <Typography sx={{ color: '#059669', fontSize: '0.68rem', fontWeight: 700 }}>
          Current: {currentSolveTime}m ({solveDeltaText})
        </Typography>
      </Card>

      {/* Card 2: Daily Focus Minutes */}
      <Card
        elevation={0}
        onClick={() => onOpenCustomizer(1)}
        sx={{
          p: 2,
          borderRadius: '14px',
          bgcolor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          '&:hover': { borderColor: '#10B981', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.08)', transform: 'translateY(-1px)' },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Box sx={{ width: 28, height: 28, borderRadius: '6px', bgcolor: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AccessTimeRoundedIcon sx={{ fontSize: 16 }} />
          </Box>
          <Chip label="Daily" size="small" sx={{ bgcolor: '#ECFDF5', color: '#047857', fontSize: '0.62rem', fontWeight: 800, height: 18 }} />
        </Box>
        <Typography sx={{ color: '#64748B', fontSize: '0.72rem', fontWeight: 700 }}>Daily Coding Goal</Typography>
        <Typography sx={{ color: '#0F172A', fontSize: '1.15rem', fontWeight: 900, lineHeight: 1.2, my: 0.3 }}>
          {goalData.dailyGoalMins ?? 60}m <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>/day</span>
        </Typography>
        <Typography sx={{ color: '#0B1F3A', fontSize: '0.68rem', fontWeight: 700 }}>
          Today: {goalData.dailyLoggedMins ?? 0}m ({dailyPercentage}%)
        </Typography>
      </Card>

      {/* Card 3: Weekly Problems Quota */}
      <Card
        elevation={0}
        onClick={() => onOpenCustomizer(1)}
        sx={{
          p: 2,
          borderRadius: '14px',
          bgcolor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          '&:hover': { borderColor: '#5B2D90', boxShadow: '0 4px 12px rgba(91, 45, 144, 0.08)', transform: 'translateY(-1px)' },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Box sx={{ width: 28, height: 28, borderRadius: '6px', bgcolor: '#FAF5FF', color: '#5B2D90', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FlagRoundedIcon sx={{ fontSize: 16 }} />
          </Box>
          <Chip label="Weekly" size="small" sx={{ bgcolor: '#FAF5FF', color: '#0B1F3A', fontSize: '0.62rem', fontWeight: 800, height: 18 }} />
        </Box>
        <Typography sx={{ color: '#64748B', fontSize: '0.72rem', fontWeight: 700 }}>Weekly Problems</Typography>
        <Typography sx={{ color: '#0F172A', fontSize: '1.15rem', fontWeight: 900, lineHeight: 1.2, my: 0.3 }}>
          {goalData.weeklyProblemQuota ?? 20} <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>solved/wk</span>
        </Typography>
        <Typography sx={{ color: '#059669', fontSize: '0.68rem', fontWeight: 700 }}>
          {goalData.weeklyProblemsSolved ?? 0} done ({weeklyPercentage}%)
        </Typography>
      </Card>

      {/* Card 4: Weekly Commitment Hours */}
      <Card
        elevation={0}
        onClick={() => onOpenCustomizer(0)}
        sx={{
          p: 2,
          borderRadius: '14px',
          bgcolor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          '&:hover': { borderColor: '#5B2D90', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.08)', transform: 'translateY(-1px)' },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Box sx={{ width: 28, height: 28, borderRadius: '6px', bgcolor: '#FAF5FF', color: '#9333EA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BoltRoundedIcon sx={{ fontSize: 16 }} />
          </Box>
          <Chip label="Target" size="small" sx={{ bgcolor: '#FAF5FF', color: '#7E22CE', fontSize: '0.62rem', fontWeight: 800, height: 18 }} />
        </Box>
        <Typography sx={{ color: '#64748B', fontSize: '0.72rem', fontWeight: 700 }}>Weekly Hours Goal</Typography>
        <Typography sx={{ color: '#0F172A', fontSize: '1.15rem', fontWeight: 900, lineHeight: 1.2, my: 0.3 }}>
          {goalData.weeklyHours ?? 14}h <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>/week</span>
        </Typography>
        <Typography sx={{ color: '#7E22CE', fontSize: '0.68rem', fontWeight: 700 }}>
          Paced at ~{Math.round(((goalData.weeklyHours ?? 14) / 7) * 10) / 10}h / day
        </Typography>
      </Card>

      {/* Card 5: First-Attempt Pass Rate Target */}
      <Card
        elevation={0}
        onClick={() => onOpenCustomizer(1)}
        sx={{
          p: 2,
          borderRadius: '14px',
          bgcolor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          '&:hover': { borderColor: '#D97706', boxShadow: '0 4px 12px rgba(217, 119, 6, 0.08)', transform: 'translateY(-1px)' },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Box sx={{ width: 28, height: 28, borderRadius: '6px', bgcolor: '#FFFBEB', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircleRoundedIcon sx={{ fontSize: 16 }} />
          </Box>
          <Chip label="Accuracy" size="small" sx={{ bgcolor: '#FFFBEB', color: '#B45309', fontSize: '0.62rem', fontWeight: 800, height: 18 }} />
        </Box>
        <Typography sx={{ color: '#64748B', fontSize: '0.72rem', fontWeight: 700 }}>First-Try Pass Rate</Typography>
        <Typography sx={{ color: '#0F172A', fontSize: '1.15rem', fontWeight: 900, lineHeight: 1.2, my: 0.3 }}>
          {targetAcc}% <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>target</span>
        </Typography>
        <Typography sx={{ color: '#D97706', fontSize: '0.68rem', fontWeight: 700 }}>
          Current: {currentAccRate}% ({accGapText})
        </Typography>
      </Card>

      {/* Card 6: Contest Rating Target */}
      <Card
        elevation={0}
        onClick={() => onOpenCustomizer(1)}
        sx={{
          p: 2,
          borderRadius: '14px',
          bgcolor: '#FEF2F2',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          '&:hover': { borderColor: '#DC2626', boxShadow: '0 4px 12px rgba(220, 38, 38, 0.08)', transform: 'translateY(-1px)' },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Box sx={{ width: 28, height: 28, borderRadius: '6px', bgcolor: '#FEF2F2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <EmojiEventsRoundedIcon sx={{ fontSize: 16 }} />
          </Box>
          <Chip label="Tier" size="small" sx={{ bgcolor: '#FEF2F2', color: '#B91C1C', fontSize: '0.62rem', fontWeight: 800, height: 18 }} />
        </Box>
        <Typography sx={{ color: '#64748B', fontSize: '0.72rem', fontWeight: 700 }}>Contest Rating Goal</Typography>
        <Typography sx={{ color: '#0F172A', fontSize: '1.15rem', fontWeight: 900, lineHeight: 1.2, my: 0.3 }}>
          {targetRating} <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>pts</span>
        </Typography>
        <Typography sx={{ color: '#DC2626', fontSize: '0.68rem', fontWeight: 700 }}>
          Current: {currentRating} ({ratingGapText})
        </Typography>
      </Card>
    </Box>
  );
}
