import React from 'react';
import { Box, Typography } from '@mui/material';
import TerminalRoundedIcon from '@mui/icons-material/TerminalRounded';
import PsychologyRoundedIcon from '@mui/icons-material/PsychologyRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import StorageRoundedIcon from '@mui/icons-material/StorageRounded';
import CloudQueueRoundedIcon from '@mui/icons-material/CloudQueueRounded';

export interface UserGoalData {
  targetTrack: string;
  targetTrackId: string;
  timeline: string;
  weeklyHours: number;
  roleFitScore: number;
  skills: Array<{
    id: string;
    name: string;
    level: number;
    label: string;
  }>;
  // Velocity & Cadence Targets
  targetSolveTimeMins?: number;
  currentAvgSolveTimeMins?: number;
  dailyGoalMins?: number;
  dailyLoggedMins?: number;
  weeklyProblemQuota?: number;
  weeklyProblemsSolved?: number;
  targetContestRating?: number;
  currentContestRating?: number;
  firstAttemptTargetRate?: number;
  currentFirstAttemptRate?: number;
  streakDays?: number;
  quizScore?: string;
  timestamp?: string;
}

export const DEFAULT_GOAL: UserGoalData = {
  targetTrack: 'Full-Stack Web Architect',
  targetTrackId: 'fullstack',
  timeline: '6 months (Standard)',
  weeklyHours: 14,
  roleFitScore: 82,
  targetSolveTimeMins: 18,
  currentAvgSolveTimeMins: 20,
  dailyGoalMins: 60,
  dailyLoggedMins: 0,
  weeklyProblemQuota: 20,
  weeklyProblemsSolved: 0,
  targetContestRating: 1850,
  currentContestRating: 1500,
  firstAttemptTargetRate: 85,
  currentFirstAttemptRate: 75,
  streakDays: 0,
  skills: [
    { id: 'prog', name: 'Programming Languages', level: 85, label: 'Advanced' },
    { id: 'dsa', name: 'Data Structures & Algorithms', level: 80, label: 'Advanced' },
    { id: 'web', name: 'Web & Frontend Architecture', level: 88, label: 'Advanced' },
    { id: 'backend', name: 'Server & API Design', level: 75, label: 'Intermediate' },
    { id: 'db', name: 'Databases & SQL Optimization', level: 70, label: 'Intermediate' },
    { id: 'cloud', name: 'Cloud, Docker & DevOps', level: 45, label: 'Elementary' },
  ],
};

export const DOMAIN_ICONS: Record<string, React.ReactNode> = {
  prog: <TerminalRoundedIcon sx={{ fontSize: 18 }} />,
  dsa: <PsychologyRoundedIcon sx={{ fontSize: 18 }} />,
  web: <CodeRoundedIcon sx={{ fontSize: 18 }} />,
  backend: <StorageRoundedIcon sx={{ fontSize: 18 }} />,
  db: <StorageRoundedIcon sx={{ fontSize: 18 }} />,
  cloud: <CloudQueueRoundedIcon sx={{ fontSize: 18 }} />,
};

export const getDomainColor = (level: number) => {
  if (level >= 80) return { stroke: '#10B981', bg: '#ECFDF5', text: '#059669', border: '#A7F3D0' };
  if (level >= 65) return { stroke: '#2563EB', bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE' };
  if (level >= 50) return { stroke: '#0284C7', bg: '#F0F9FF', text: '#0369A1', border: '#BAE6FD' };
  return { stroke: '#F59E0B', bg: '#FFFBEB', text: '#D97706', border: '#FDE68A' };
};

export function CircularSkillGauge({
  percentage,
  size = 56,
  strokeWidth = 5,
  color = '#2563EB',
  label,
}: {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, percentage)) / 100) * circumference;

  return (
    <Box
      sx={{
        position: 'relative',
        width: size,
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#EEF2F6"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }}
        />
      </svg>
      <Box sx={{ position: 'absolute', textAlign: 'center' }}>
        <Typography sx={{ fontWeight: 800, fontSize: size < 60 ? '0.78rem' : '0.86rem', color: '#0F172A', lineHeight: 1 }}>
          {label ?? `${Math.round(percentage)}%`}
        </Typography>
      </Box>
    </Box>
  );
}

export function HeroScoreGauge({ percentage }: { percentage: number }) {
  const safePercentage = Number.isFinite(percentage) ? Math.min(100, Math.max(0, Math.round(percentage))) : 0;
  const size = 76;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (safePercentage / 100) * circumference;

  return (
    <Box
      sx={{
        position: 'relative',
        width: size,
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#38BDF8"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <Box sx={{ position: 'absolute', textAlign: 'center' }}>
        <Typography sx={{ fontWeight: 900, fontSize: '1.15rem', color: '#FFFFFF', lineHeight: 1 }}>
          {safePercentage}%
        </Typography>
      </Box>
    </Box>
  );
}

export function normalizeTimeline(timeline?: string): string {
  if (!timeline) return '6 months (Standard)';
  if (timeline.includes('3 months')) return '3 months (Intensive)';
  if (timeline.includes('6 months')) return '6 months (Standard)';
  if (timeline.includes('9 months')) return '9 months (Extended)';
  if (timeline.includes('12 months')) return '12 months (Comprehensive)';
  return timeline;
}
