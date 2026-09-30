'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Box,
  Typography,
  Card,
  Chip,
  Button,
  Dialog,
  DialogContent,
  Slider,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Divider,
  IconButton,
  Tabs,
  Tab,
} from '@mui/material';
import TrackChangesRoundedIcon from '@mui/icons-material/TrackChangesRounded';
import PsychologyRoundedIcon from '@mui/icons-material/PsychologyRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import RocketLaunchRoundedIcon from '@mui/icons-material/RocketLaunchRounded';
import TerminalRoundedIcon from '@mui/icons-material/TerminalRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import LaptopMacRoundedIcon from '@mui/icons-material/LaptopMacRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import StorageRoundedIcon from '@mui/icons-material/StorageRounded';
import CloudQueueRoundedIcon from '@mui/icons-material/CloudQueueRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import HubRoundedIcon from '@mui/icons-material/HubRounded';
import SpeedRoundedIcon from '@mui/icons-material/SpeedRounded';
import TimerRoundedIcon from '@mui/icons-material/TimerRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import FlagRoundedIcon from '@mui/icons-material/FlagRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';

import dynamic from 'next/dynamic';
import { StudentProfileData } from '@/types/student-profile';
import { useToast } from '@/context/ToastContext';

const IdentityDiagnosticWizard = dynamic(
  () => import('@/components/students/diagnostic/IdentityDiagnosticWizard'),
  { ssr: false }
);

interface StudentGoalsTabProps {
  profile: StudentProfileData;
  isOwner?: boolean;
}

interface UserGoalData {
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

const DEFAULT_GOAL: UserGoalData = {
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

const DOMAIN_ICONS: Record<string, React.ReactNode> = {
  prog: <TerminalRoundedIcon sx={{ fontSize: 18 }} />,
  dsa: <PsychologyRoundedIcon sx={{ fontSize: 18 }} />,
  web: <CodeRoundedIcon sx={{ fontSize: 18 }} />,
  backend: <StorageRoundedIcon sx={{ fontSize: 18 }} />,
  db: <StorageRoundedIcon sx={{ fontSize: 18 }} />,
  cloud: <CloudQueueRoundedIcon sx={{ fontSize: 18 }} />,
};

const getDomainColor = (level: number) => {
  if (level >= 80) return { stroke: '#10B981', bg: '#ECFDF5', text: '#059669', border: '#A7F3D0' };
  if (level >= 65) return { stroke: '#2563EB', bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE' };
  if (level >= 50) return { stroke: '#0284C7', bg: '#F0F9FF', text: '#0369A1', border: '#BAE6FD' };
  return { stroke: '#F59E0B', bg: '#FFFBEB', text: '#D97706', border: '#FDE68A' };
};

// Compact SVG Circular Filling Progress Gauge
function CircularSkillGauge({
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

// Hero Score Gauge
function HeroScoreGauge({ percentage }: { percentage: number }) {
  const size = 76;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

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
          {percentage}%
        </Typography>
      </Box>
    </Box>
  );
}

function normalizeTimeline(timeline?: string): string {
  if (!timeline) return '6 months (Standard)';
  if (timeline.includes('3 months')) return '3 months (Intensive)';
  if (timeline.includes('6 months')) return '6 months (Standard)';
  if (timeline.includes('9 months')) return '9 months (Extended)';
  if (timeline.includes('12 months')) return '12 months (Comprehensive)';
  return timeline;
}

export default function StudentGoalsTab({ profile, isOwner = true }: StudentGoalsTabProps) {
  const toast = useToast();
  const [goalData, setGoalData] = useState<UserGoalData>(DEFAULT_GOAL);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [customizerOpen, setCustomizerOpen] = useState(false);
  const [formTab, setFormTab] = useState(0);
  const [formData, setFormData] = useState<UserGoalData>(DEFAULT_GOAL);
  const [expandedMilestone, setExpandedMilestone] = useState<number | null>(1);

  const toggleMilestone = (num: number) => {
    setExpandedMilestone((prev) => (prev === num ? null : num));
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storageKey = profile?.id ? `codeplatform_diagnostic_goal_${profile.id}` : 'codeplatform_diagnostic_goal';
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed.targetTrack === 'string' && Array.isArray(parsed.skills)) {
            setGoalData((prev) => ({ ...prev, ...parsed }));
            setFormData((prev) => ({ ...prev, ...parsed }));
          }
        }
      } catch {}
    }
  }, [profile?.id]);

  const handleOpenCustomizer = (initialTab: number = 0) => {
    setFormData({ ...goalData });
    setFormTab(initialTab);
    setCustomizerOpen(true);
  };

  const handleSaveCustomForm = () => {
    // Recalculate roleFitScore dynamically based on current skill average
    const avgSkill = Math.round(
      formData.skills.reduce((acc, curr) => acc + curr.level, 0) / (formData.skills.length || 1)
    );
    const updated: UserGoalData = {
      ...formData,
      roleFitScore: avgSkill,
      timestamp: new Date().toISOString(),
    };
    setGoalData(updated);
    if (typeof window !== 'undefined') {
      try {
        const storageKey = profile?.id ? `codeplatform_diagnostic_goal_${profile.id}` : 'codeplatform_diagnostic_goal';
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch {}
    }
    toast.showToast('Target goals, speed limits & baseline skills calibrated successfully!', 'success');
    setCustomizerOpen(false);
  };

  const handleSaveUpdatedGoal = (newReport: any) => {
    const cleanSkills = Array.isArray(newReport?.skills)
      ? newReport.skills.map((s: any) => ({
          id: s.id,
          name: s.name,
          level: typeof s.level === 'number' ? s.level : 50,
          label: s.label || 'Intermediate',
        }))
      : undefined;

    const normalizedTimeline = newReport?.timeline ? normalizeTimeline(newReport.timeline) : undefined;

    const updated = {
      ...newReport,
      ...(cleanSkills ? { skills: cleanSkills } : {}),
      ...(normalizedTimeline ? { timeline: normalizedTimeline } : {}),
    };

    setGoalData((prev) => ({ ...prev, ...updated }));
    setFormData((prev) => ({ ...prev, ...updated }));
    if (typeof window !== 'undefined') {
      try {
        const storageKey = profile?.id ? `codeplatform_diagnostic_goal_${profile.id}` : 'codeplatform_diagnostic_goal';
        localStorage.setItem(storageKey, JSON.stringify({ ...goalData, ...updated }));
      } catch {}
    }
    setWizardOpen(false);
  };

  const currentStreak = goalData.streakDays ?? profile?.currentStreakDays ?? 0;
  const currentAccRate = profile?.accuracyRate ? parseFloat(profile.accuracyRate.replace('%', '')) : (goalData.currentFirstAttemptRate ?? 75);
  const currentRating = profile?.contestRating ?? goalData.currentContestRating ?? 1500;
  const currentSolveTime = goalData.currentAvgSolveTimeMins ?? 20;

  const targetSolveTime = goalData.targetSolveTimeMins ?? 18;
  const solveDelta = currentSolveTime - targetSolveTime;
  const solveDeltaText = solveDelta > 0 ? `+${solveDelta.toFixed(1)}m gap` : solveDelta < 0 ? `${solveDelta.toFixed(1)}m faster` : 'On target';

  const dailyPercentage = Math.min(100, Math.round(((goalData.dailyLoggedMins ?? 0) / (goalData.dailyGoalMins || 60)) * 100));
  const weeklyPercentage = Math.min(100, Math.round(((goalData.weeklyProblemsSolved ?? 0) / (goalData.weeklyProblemQuota || 20)) * 100));

  const targetAcc = goalData.firstAttemptTargetRate ?? 85;
  const accGap = targetAcc - currentAccRate;
  const accGapText = accGap > 0 ? `Gap: ${accGap.toFixed(1)}%` : 'Target met';

  const targetRating = goalData.targetContestRating ?? 1850;
  const ratingGap = targetRating - currentRating;
  const ratingGapText = ratingGap > 0 ? `+${ratingGap} gap` : 'Target met';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* ========================================================================= */}
      {/* 1. TOP EXECUTIVE GRID: CAREER TARGET + TODAY'S CADENCE & FOCUS */}
      {/* ========================================================================= */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1.65fr 1fr' },
          gap: 2.5,
        }}
      >
        {/* Left: Main Career Target Card */}
        <Card
          elevation={0}
          sx={{
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #1E3A8A 0%, #1D4ED8 50%, #0284C7 100%)',
            border: '1px solid rgba(147, 197, 253, 0.35)',
            p: { xs: 2.5, sm: 3 },
            boxShadow: '0 8px 30px rgba(37, 99, 235, 0.16)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  icon={<RocketLaunchRoundedIcon sx={{ fontSize: 14, color: '#38BDF8 !important' }} />}
                  label="Target Track"
                  size="small"
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.16)',
                    color: '#FFFFFF',
                    fontWeight: 800,
                    fontSize: '0.72rem',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                  }}
                />
                <Chip
                  label={`${goalData.weeklyHours} hrs/wk`}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.12)',
                    color: '#E0E7FF',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                  }}
                />
              </Box>

              {isOwner && (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleOpenCustomizer(0)}
                    startIcon={<TuneRoundedIcon sx={{ fontSize: 14 }} />}
                    sx={{
                      bgcolor: '#FFFFFF',
                      color: '#1E3A8A',
                      fontWeight: 800,
                      textTransform: 'none',
                      borderRadius: '8px',
                      fontSize: '0.76rem',
                      px: 1.8,
                      py: 0.5,
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
                      '&:hover': {
                        bgcolor: '#F0F9FF',
                        color: '#1D4ED8',
                      },
                    }}
                  >
                    Customize Goals
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setWizardOpen(true)}
                    startIcon={<AutoAwesomeRoundedIcon sx={{ fontSize: 13 }} />}
                    sx={{
                      color: '#FFFFFF',
                      borderColor: 'rgba(255, 255, 255, 0.4)',
                      fontWeight: 800,
                      textTransform: 'none',
                      borderRadius: '8px',
                      fontSize: '0.74rem',
                      px: 1.4,
                      py: 0.5,
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.15)',
                        borderColor: '#FFFFFF',
                      },
                    }}
                  >
                    Quiz
                  </Button>
                </Box>
              )}
            </Box>

            <Typography variant="h5" sx={{ fontWeight: 900, color: '#FFFFFF', mb: 0.6, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
              Target: {goalData.targetTrack}
            </Typography>
            <Typography sx={{ color: '#E0E7FF', fontSize: '0.82rem', lineHeight: 1.45, mb: 2 }}>
              Target Horizon: <strong style={{ color: '#FFFFFF' }}>{goalData.timeline}</strong>. All recommended drills, solve times, and projects are tuned to reach this milestone.
            </Typography>
          </Box>

          {/* Bottom Metagauge inside Hero */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              pt: 2,
              borderTop: '1px solid rgba(255, 255, 255, 0.15)',
              flexWrap: 'wrap',
              gap: 1.5,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <HeroScoreGauge percentage={goalData.roleFitScore} />
              <Box>
                <Typography sx={{ color: '#BFDBFE', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase' }}>
                  Role-Fit Readiness Index
                </Typography>
                <Typography sx={{ color: '#FFFFFF', fontSize: '0.9rem', fontWeight: 800 }}>
                  Ready for Advanced Sprints
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box>
                <Typography sx={{ color: '#BFDBFE', fontSize: '0.68rem', fontWeight: 700 }}>SPRINT PACE</Typography>
                <Typography sx={{ color: '#FFFFFF', fontSize: '0.85rem', fontWeight: 800 }}>On Track</Typography>
              </Box>
              <Box>
                <Typography sx={{ color: '#BFDBFE', fontSize: '0.68rem', fontWeight: 700 }}>CURRICULUM</Typography>
                <Typography sx={{ color: '#FFFFFF', fontSize: '0.85rem', fontWeight: 800 }}>12 Modules</Typography>
              </Box>
            </Box>
          </Box>
        </Card>

        {/* Right: Today's Active Focus & Speed Target Widget */}
        <Card
          elevation={0}
          sx={{
            borderRadius: '16px',
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            p: { xs: 2.5, sm: 3 },
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: '6px',
                    bgcolor: '#EFF6FF',
                    color: '#2563EB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <TimerRoundedIcon sx={{ fontSize: 16 }} />
                </Box>
                <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.92rem' }}>
                  Today's Coding Cadence
                </Typography>
              </Box>
              <Chip
                icon={<LocalFireDepartmentRoundedIcon sx={{ fontSize: 13, color: '#EA580C !important' }} />}
                label={`${currentStreak}d Streak`}
                size="small"
                sx={{ bgcolor: '#FFF7ED', color: '#C2410C', fontWeight: 800, fontSize: '0.68rem', height: 22, border: '1px solid #FFEDD5' }}
              />
            </Box>

            {/* Daily Focus Goal Bar / Circular Display */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.8, bgcolor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', mb: 1.8 }}>
              <CircularSkillGauge percentage={dailyPercentage} size={54} strokeWidth={5} color="#2563EB" />
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.4 }}>
                  <Typography sx={{ color: '#64748B', fontSize: '0.72rem', fontWeight: 700 }}>
                    Daily Active Minutes Goal
                  </Typography>
                  <Typography sx={{ color: '#0F172A', fontSize: '0.78rem', fontWeight: 800 }}>
                    {goalData.dailyLoggedMins ?? 0} / {goalData.dailyGoalMins ?? 60} mins
                  </Typography>
                </Box>
                <Box sx={{ height: 6, width: '100%', bgcolor: '#E2E8F0', borderRadius: 99, overflow: 'hidden' }}>
                  <Box sx={{ width: `${dailyPercentage}%`, height: '100%', bgcolor: '#2563EB', borderRadius: 99, transition: 'width 0.4s ease' }} />
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Quick Metrics at bottom */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, pt: 1.5, borderTop: '1px solid #F1F5F9' }}>
            <Box>
              <Typography sx={{ color: '#64748B', fontSize: '0.7rem', fontWeight: 600 }}>Solve Speed Target</Typography>
              <Typography sx={{ color: '#0F172A', fontSize: '0.9rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <SpeedRoundedIcon sx={{ fontSize: 16, color: '#10B981' }} />
                {targetSolveTime} min <span style={{ color: '#64748B', fontSize: '0.72rem', fontWeight: 500 }}>/ problem</span>
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ color: '#64748B', fontSize: '0.7rem', fontWeight: 600 }}>Weekly Quota</Typography>
              <Typography sx={{ color: '#0F172A', fontSize: '0.9rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <FlagRoundedIcon sx={{ fontSize: 16, color: '#2563EB' }} />
                {goalData.weeklyProblemsSolved ?? 0} / {goalData.weeklyProblemQuota ?? 20} <span style={{ color: '#64748B', fontSize: '0.72rem', fontWeight: 500 }}>done</span>
              </Typography>
            </Box>
          </Box>
        </Card>
      </Box>

      {/* ========================================================================= */}
      {/* 2. VELOCITY & CADENCE TARGETS (6-CARD DENSE PERFORMANCE GRID) */}
      {/* ========================================================================= */}
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
          onClick={() => handleOpenCustomizer(1)}
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
            '&:hover': { borderColor: '#2563EB', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.08)', transform: 'translateY(-1px)' },
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Box sx={{ width: 28, height: 28, borderRadius: '6px', bgcolor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <SpeedRoundedIcon sx={{ fontSize: 16 }} />
            </Box>
            <Chip label="Target" size="small" sx={{ bgcolor: '#EFF6FF', color: '#1D4ED8', fontSize: '0.62rem', fontWeight: 800, height: 18 }} />
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
          onClick={() => handleOpenCustomizer(1)}
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
          <Typography sx={{ color: '#2563EB', fontSize: '0.68rem', fontWeight: 700 }}>
            Today: {goalData.dailyLoggedMins ?? 0}m ({dailyPercentage}%)
          </Typography>
        </Card>

        {/* Card 3: Weekly Problems Quota */}
        <Card
          elevation={0}
          onClick={() => handleOpenCustomizer(1)}
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
            '&:hover': { borderColor: '#0284C7', boxShadow: '0 4px 12px rgba(2, 132, 199, 0.08)', transform: 'translateY(-1px)' },
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Box sx={{ width: 28, height: 28, borderRadius: '6px', bgcolor: '#F0F9FF', color: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FlagRoundedIcon sx={{ fontSize: 16 }} />
            </Box>
            <Chip label="Weekly" size="small" sx={{ bgcolor: '#F0F9FF', color: '#0369A1', fontSize: '0.62rem', fontWeight: 800, height: 18 }} />
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
          onClick={() => handleOpenCustomizer(0)}
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
            '&:hover': { borderColor: '#6366F1', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.08)', transform: 'translateY(-1px)' },
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
          onClick={() => handleOpenCustomizer(1)}
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
          onClick={() => handleOpenCustomizer(1)}
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

      {/* ========================================================================= */}
      {/* 3. SIDE-BY-SIDE GRID: PRESENT SKILL SETS & SUGGESTED ACTION ROADMAP */}
      {/* ========================================================================= */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1fr 1.08fr' },
          gap: 2.5,
          alignItems: 'start',
        }}
      >
        {/* ========================================================================= */}
        {/* LEFT: PRESENT SKILL SETS (2-COLUMN COMPACT GRID) */}
        {/* ========================================================================= */}
        <Card
          elevation={0}
          sx={{
            borderRadius: '16px',
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            p: { xs: 2.5, sm: 3 },
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
            height: 'fit-content',
          }}
        >
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 30,
                    height: 30,
                    borderRadius: '8px',
                    bgcolor: '#EFF6FF',
                    color: '#2563EB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <PsychologyRoundedIcon sx={{ fontSize: 17 }} />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.98rem' }}>
                    Present Skill Sets & Baseline
                  </Typography>
                  <Typography sx={{ color: '#64748B', fontSize: '0.74rem' }}>
                    Calibrated capability baseline across engineering domains.
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Button
                  size="small"
                  onClick={() => handleOpenCustomizer(2)}
                  startIcon={<TuneRoundedIcon sx={{ fontSize: 13 }} />}
                  sx={{
                    color: '#2563EB',
                    bgcolor: '#EFF6FF',
                    fontWeight: 800,
                    fontSize: '0.72rem',
                    borderRadius: '8px',
                    textTransform: 'none',
                    px: 1.2,
                    py: 0.3,
                    '&:hover': { bgcolor: '#DBEAFE' },
                  }}
                >
                  Calibrate
                </Button>
                <Chip
                  label={`${goalData.skills?.length || 6} Domains`}
                  size="small"
                  sx={{ bgcolor: '#F8FAFC', color: '#475569', fontWeight: 700, fontSize: '0.68rem', height: 22, border: '1px solid #E2E8F0' }}
                />
              </Box>
            </Box>

            {/* 2-Column Skill Grid */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 1.5,
              }}
            >
              {goalData.skills.map((skill) => {
                const domainStyle = getDomainColor(skill.level);
                const icon = DOMAIN_ICONS[skill.id] || <CodeRoundedIcon sx={{ fontSize: 15 }} />;

                return (
                  <Box
                    key={skill.id}
                    sx={{
                      p: 1.5,
                      borderRadius: '12px',
                      bgcolor: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 1.5,
                      transition: 'all 0.18s ease',
                      '&:hover': {
                        bgcolor: '#FFFFFF',
                        borderColor: '#CBD5E1',
                        boxShadow: '0 3px 12px rgba(0, 0, 0, 0.04)',
                      },
                    }}
                  >
                    {/* Left Info */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mb: 0.4 }}>
                        <Box sx={{ color: domainStyle.stroke, display: 'flex', alignItems: 'center' }}>
                          {icon}
                        </Box>
                        <Chip
                          label={skill.label}
                          size="small"
                          sx={{
                            bgcolor: domainStyle.bg,
                            color: domainStyle.text,
                            fontWeight: 800,
                            fontSize: '0.64rem',
                            height: 18,
                            border: `1px solid ${domainStyle.border}`,
                          }}
                        />
                      </Box>

                      <Typography
                        sx={{
                          color: '#0F172A',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          lineHeight: 1.3,
                        }}
                      >
                        {skill.name}
                      </Typography>
                    </Box>

                    {/* Right Circular Gauge */}
                    <CircularSkillGauge percentage={skill.level} color={domainStyle.stroke} size={48} strokeWidth={4.5} />
                  </Box>
                );
              })}
            </Box>
          </Box>

          <Box sx={{ pt: 2, mt: 2, borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ color: '#64748B', fontSize: '0.72rem' }}>
              Calibrated via self-rating & diagnostic quiz
            </Typography>
            <Chip
              label="Calibration Ready"
              size="small"
              sx={{ bgcolor: '#ECFDF5', color: '#059669', fontWeight: 800, fontSize: '0.66rem', height: 20 }}
            />
          </Box>
        </Card>

        {/* ========================================================================= */}
        {/* RIGHT: SUGGESTED ACTION PLAN & ROADMAP (GENUINE VISUAL ROADMAP PATHWAY) */}
        {/* ========================================================================= */}
        <Card
          elevation={0}
          sx={{
            borderRadius: '16px',
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            p: { xs: 2.5, sm: 3 },
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
            height: 'fit-content',
          }}
        >
          <Box>
            {/* Roadmap Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '8px',
                    bgcolor: '#EFF6FF',
                    color: '#2563EB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <TrackChangesRoundedIcon sx={{ fontSize: 18 }} />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1rem' }}>
                    Career Milestone Roadmap
                  </Typography>
                  <Typography sx={{ color: '#64748B', fontSize: '0.74rem' }}>
                    Target pathway: {goalData.targetTrack}
                  </Typography>
                </Box>
              </Box>

              <Chip
                icon={<HubRoundedIcon sx={{ fontSize: 13, color: '#2563EB !important' }} />}
                label="3 Step Path"
                size="small"
                sx={{ bgcolor: '#EFF6FF', color: '#2563EB', fontWeight: 800, fontSize: '0.68rem', height: 22, border: '1px solid #BFDBFE' }}
              />
            </Box>

            {/* ========================================================================= */}
            {/* VISUAL ROADMAP TIMELINE SPINE & NODES */}
            {/* ========================================================================= */}
            <Box sx={{ display: 'flex', flexDirection: 'column', position: 'relative', mt: 1 }}>
              
              {/* STEP 1: FOUNDATION TRACK */}
              <Box sx={{ display: 'flex', gap: 2, position: 'relative' }}>
                {/* Node & Connecting Line */}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      bgcolor: '#2563EB',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                      fontSize: '0.82rem',
                      boxShadow: '0 0 0 4px #DBEAFE',
                      flexShrink: 0,
                      zIndex: 2,
                    }}
                  >
                    1
                  </Box>
                  {/* Vertical Road Trail */}
                  <Box
                    sx={{
                      width: 2,
                      flex: 1,
                      minHeight: 28,
                      bgcolor: '#2563EB',
                      my: 0.5,
                    }}
                  />
                </Box>

                {/* Step Card Content */}
                <Box
                  sx={{
                    flex: 1,
                    mb: 2,
                    p: 1.8,
                    borderRadius: '12px',
                    bgcolor: '#EFF6FF',
                    border: '1.5px solid #BFDBFE',
                    boxShadow: '0 2px 8px rgba(37, 99, 235, 0.06)',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1.5, mb: 1.2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.5 }}>
                        <Chip
                          label="Current Phase ⚡"
                          size="small"
                          sx={{ bgcolor: '#2563EB', color: '#FFFFFF', fontWeight: 800, fontSize: '0.64rem', height: 20 }}
                        />
                        <Typography sx={{ color: '#1D4ED8', fontSize: '0.7rem', fontWeight: 700 }}>
                          12 Modules
                        </Typography>
                      </Box>
                      <Typography sx={{ color: '#0F172A', fontWeight: 800, fontSize: '0.86rem', mb: 0.3 }}>
                        Mastery Curriculum: {goalData.targetTrack}
                      </Typography>
                      <Typography sx={{ color: '#475569', fontSize: '0.74rem', lineHeight: 1.35 }}>
                        SSR architectures, NestJS APIs, Postgres indexing & security.
                      </Typography>
                    </Box>

                    {/* Circular Progress Meter */}
                    <CircularSkillGauge percentage={35} color="#2563EB" size={50} strokeWidth={4.5} />
                  </Box>

                  <Link href="/courses" style={{ textDecoration: 'none' }}>
                    <Button
                      fullWidth
                      variant="contained"
                      size="small"
                      startIcon={<MenuBookRoundedIcon sx={{ fontSize: 15 }} />}
                      endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: 13 }} />}
                      sx={{
                        bgcolor: '#2563EB',
                        color: '#FFFFFF',
                        fontWeight: 700,
                        fontSize: '0.76rem',
                        textTransform: 'none',
                        borderRadius: '6px',
                        py: 0.6,
                        boxShadow: 'none',
                        '&:hover': { bgcolor: '#1D4ED8' },
                      }}
                    >
                      Continue Curriculum
                    </Button>
                  </Link>
                </Box>
              </Box>

              {/* STEP 2: SKILL DRILLS */}
              <Box sx={{ display: 'flex', gap: 2, position: 'relative' }}>
                {/* Node & Connecting Line */}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      bgcolor: '#059669',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                      fontSize: '0.82rem',
                      boxShadow: '0 0 0 4px #D1FAE5',
                      flexShrink: 0,
                      zIndex: 2,
                    }}
                  >
                    2
                  </Box>
                  {/* Vertical Road Trail */}
                  <Box
                    sx={{
                      width: 2,
                      flex: 1,
                      minHeight: 28,
                      bgcolor: '#CBD5E1',
                      borderStyle: 'dashed',
                      my: 0.5,
                    }}
                  />
                </Box>

                {/* Step Card Content */}
                <Box
                  sx={{
                    flex: 1,
                    mb: 2,
                    p: 1.8,
                    borderRadius: '12px',
                    bgcolor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    transition: 'all 0.18s ease',
                    '&:hover': { borderColor: '#059669', bgcolor: '#FFFFFF' },
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1.5, mb: 1.2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.5 }}>
                        <Chip
                          label="Up Next"
                          size="small"
                          sx={{ bgcolor: '#ECFDF5', color: '#047857', fontWeight: 700, fontSize: '0.64rem', height: 20, border: '1px solid #A7F3D0' }}
                        />
                        <Typography sx={{ color: '#64748B', fontSize: '0.7rem', fontWeight: 700 }}>
                          4 Drills / wk
                        </Typography>
                      </Box>
                      <Typography sx={{ color: '#0F172A', fontWeight: 800, fontSize: '0.86rem', mb: 0.3 }}>
                        Targeted Problem Solving Drills
                      </Typography>
                      <Typography sx={{ color: '#64748B', fontSize: '0.74rem', lineHeight: 1.35 }}>
                        Concurrency, distributed cache invalidation, and tree algorithms.
                      </Typography>
                    </Box>

                    {/* Circular Progress Meter */}
                    <CircularSkillGauge percentage={60} color="#059669" size={50} strokeWidth={4.5} />
                  </Box>

                  <Link href="/practice" style={{ textDecoration: 'none' }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      size="small"
                      startIcon={<TerminalRoundedIcon sx={{ fontSize: 15 }} />}
                      endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: 13 }} />}
                      sx={{
                        color: '#059669',
                        borderColor: '#059669',
                        fontWeight: 700,
                        fontSize: '0.76rem',
                        textTransform: 'none',
                        borderRadius: '6px',
                        py: 0.6,
                        '&:hover': { bgcolor: '#ECFDF5', borderColor: '#047857' },
                      }}
                    >
                      Launch Practice Engine
                    </Button>
                  </Link>
                </Box>
              </Box>

              {/* STEP 3: CAPSTONE ARTIFACT */}
              <Box sx={{ display: 'flex', gap: 2, position: 'relative' }}>
                {/* Node */}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      bgcolor: '#D97706',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                      fontSize: '0.82rem',
                      boxShadow: '0 0 0 4px #FEF3C7',
                      flexShrink: 0,
                      zIndex: 2,
                    }}
                  >
                    3
                  </Box>
                </Box>

                {/* Step Card Content */}
                <Box
                  sx={{
                    flex: 1,
                    p: 1.8,
                    borderRadius: '12px',
                    bgcolor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    transition: 'all 0.18s ease',
                    '&:hover': { borderColor: '#D97706', bgcolor: '#FFFFFF' },
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1.5, mb: 1.2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.5 }}>
                        <Chip
                          label="Career Milestone 🏆"
                          size="small"
                          sx={{ bgcolor: '#FFFBEB', color: '#B45309', fontWeight: 700, fontSize: '0.64rem', height: 20, border: '1px solid #FDE68A' }}
                        />
                        <Typography sx={{ color: '#64748B', fontSize: '0.7rem', fontWeight: 700 }}>
                          Recruiter Ready
                        </Typography>
                      </Box>
                      <Typography sx={{ color: '#0F172A', fontWeight: 800, fontSize: '0.86rem', mb: 0.3 }}>
                        Portfolio Project Milestone
                      </Typography>
                      <Typography sx={{ color: '#64748B', fontSize: '0.74rem', lineHeight: 1.35 }}>
                        Build industry briefs with rubric peer reviews to certify your Skill Passport.
                      </Typography>
                    </Box>

                    {/* Circular Progress Meter */}
                    <CircularSkillGauge percentage={20} color="#D97706" size={50} strokeWidth={4.5} />
                  </Box>

                  <Link href="/students/projects" style={{ textDecoration: 'none' }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      size="small"
                      startIcon={<LaptopMacRoundedIcon sx={{ fontSize: 15 }} />}
                      endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: 13 }} />}
                      sx={{
                        color: '#D97706',
                        borderColor: '#D97706',
                        fontWeight: 700,
                        fontSize: '0.76rem',
                        textTransform: 'none',
                        borderRadius: '6px',
                        py: 0.6,
                        '&:hover': { bgcolor: '#FFFBEB', borderColor: '#B45309' },
                      }}
                    >
                      Project Workspace
                    </Button>
                  </Link>
                </Box>
              </Box>

            </Box>
          </Box>

          {/* Footer Status */}
          <Box sx={{ pt: 2, mt: 2, borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ color: '#64748B', fontSize: '0.72rem' }}>
              Linear milestone completion track
            </Typography>
            <Chip
              label="Track Active"
              size="small"
              sx={{ bgcolor: '#EFF6FF', color: '#2563EB', fontWeight: 800, fontSize: '0.66rem', height: 20 }}
            />
          </Box>
        </Card>
      </Box>

      {/* ========================================================================= */}
      {/* 4. GOAL CUSTOMIZATION FORM MODAL */}
      {/* ========================================================================= */}
      <Dialog
        open={customizerOpen}
        onClose={() => setCustomizerOpen(false)}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: '20px',
              bgcolor: '#FFFFFF',
              boxShadow: '0 20px 60px rgba(15, 23, 42, 0.18)',
              p: 0,
              overflow: 'hidden',
            },
          },
        }}
      >
        {/* Modal Header */}
        <Box
          sx={{
            p: 3,
            bgcolor: '#F8FAFC',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '10px',
                bgcolor: '#EFF6FF',
                color: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <TuneRoundedIcon sx={{ fontSize: 22 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 900, color: '#0F172A', fontSize: '1.15rem' }}>
                Customize Target & Learning Goals
              </Typography>
              <Typography sx={{ color: '#64748B', fontSize: '0.8rem' }}>
                Fine-tune your career target, speed targets, and skill capability baseline.
              </Typography>
            </Box>
          </Box>

          <IconButton onClick={() => setCustomizerOpen(false)} sx={{ color: '#94A3B8' }}>
            <CloseRoundedIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>

        {/* Modal Tabs */}
        <Box sx={{ borderBottom: '1px solid #E2E8F0', px: 3, bgcolor: '#FFFFFF' }}>
          <Tabs
            value={formTab}
            onChange={(_, val) => setFormTab(val)}
            sx={{
              minHeight: 44,
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.86rem',
                minHeight: 44,
                py: 1,
                color: '#64748B',
                '&.Mui-selected': { color: '#2563EB' },
              },
              '& .MuiTabs-indicator': { bgcolor: '#2563EB', height: 3 },
            }}
          >
            <Tab label="1. Career Track & Horizon" />
            <Tab label="2. Speed & Daily Cadence" />
            <Tab label="3. Skill Sets Baseline" />
          </Tabs>
        </Box>

        {/* Modal Content */}
        <DialogContent sx={{ p: 3, maxHeight: '65vh', overflowY: 'auto' }}>
          {/* TAB 1: CAREER TRACK */}
          {formTab === 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box>
                <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.88rem', mb: 1.2 }}>
                  Target Engineering Role / Track
                </Typography>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                    gap: 1.5,
                  }}
                >
                  {[
                    { id: 'fullstack', label: 'Full-Stack Web Architect', desc: 'SSR, Next.js, NestJS, Postgres, Docker' },
                    { id: 'backend', label: 'Backend & Distributed Systems', desc: 'Microservices, gRPC, Redis, Kafka, DB optimization' },
                    { id: 'frontend', label: 'Frontend & UI/UX Specialist', desc: 'React 19, TypeScript, Performance, Design Systems' },
                    { id: 'devops', label: 'DevOps & Cloud Architect', desc: 'Kubernetes, CI/CD, AWS/Azure, Terraform, Security' },
                    { id: 'ai', label: 'AI & Machine Learning Engineer', desc: 'PyTorch, LLM agents, Vector DBs, Model Serving' },
                    { id: 'dsa', label: 'Algorithms & Competitive Coder', desc: 'Advanced DSA, Codeforces 1900+, ICPC problem solving' },
                  ].map((track) => (
                    <Box
                      key={track.id}
                      onClick={() => setFormData((prev: UserGoalData) => ({ ...prev, targetTrack: track.label, targetTrackId: track.id }))}
                      sx={{
                        p: 1.8,
                        borderRadius: '12px',
                        border: '2px solid',
                        borderColor: formData.targetTrack === track.label ? '#2563EB' : '#E2E8F0',
                        bgcolor: formData.targetTrack === track.label ? '#EFF6FF' : '#FFFFFF',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        '&:hover': { borderColor: '#93C5FD' },
                      }}
                    >
                      <Typography sx={{ fontWeight: 800, fontSize: '0.86rem', color: formData.targetTrack === track.label ? '#1D4ED8' : '#0F172A', mb: 0.3 }}>
                        {track.label}
                      </Typography>
                      <Typography sx={{ color: '#64748B', fontSize: '0.74rem' }}>
                        {track.desc}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>
                {/* Timeline */}
                <Box>
                  <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.88rem', mb: 1 }}>
                    Target Completion Horizon
                  </Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      value={formData.timeline}
                      onChange={(e) => setFormData((prev: UserGoalData) => ({ ...prev, timeline: e.target.value }))}
                      sx={{ borderRadius: '8px', fontSize: '0.86rem', fontWeight: 700 }}
                    >
                      <MenuItem value="3 months (Intensive)">3 months (Intensive Sprint)</MenuItem>
                      <MenuItem value="6 months (Standard)">6 months (Standard Pace)</MenuItem>
                      <MenuItem value="9 months (Extended)">9 months (Extended Prep)</MenuItem>
                      <MenuItem value="12 months (Comprehensive)">12 months (Comprehensive Degree Pace)</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                {/* Weekly Hours */}
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
                    <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.88rem' }}>
                      Weekly Commitment
                    </Typography>
                    <Typography sx={{ fontWeight: 800, color: '#2563EB', fontSize: '0.88rem' }}>
                      {formData.weeklyHours} hrs/week
                    </Typography>
                  </Box>
                  <Slider
                    value={formData.weeklyHours}
                    onChange={(_, val) => setFormData((prev: UserGoalData) => ({ ...prev, weeklyHours: val as number }))}
                    min={4}
                    max={35}
                    step={1}
                    valueLabelDisplay="auto"
                    sx={{ color: '#2563EB' }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ color: '#94A3B8', fontSize: '0.7rem' }}>4 hrs (Part-time)</Typography>
                    <Typography sx={{ color: '#94A3B8', fontSize: '0.7rem' }}>35 hrs (Bootcamp)</Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          )}

          {/* TAB 2: SPEED & CADENCE QUOTA */}
          {formTab === 1 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Solve Time Per Problem */}
              <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
                  <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.86rem' }}>
                    Target Solve Time / Problem
                  </Typography>
                  <Typography sx={{ fontWeight: 800, color: '#2563EB', fontSize: '0.86rem' }}>
                    {formData.targetSolveTimeMins} minutes / problem
                  </Typography>
                </Box>
                <Slider
                  value={formData.targetSolveTimeMins || 18}
                  onChange={(_, val) => setFormData((prev: UserGoalData) => ({ ...prev, targetSolveTimeMins: val as number }))}
                  min={8}
                  max={45}
                  step={1}
                  valueLabelDisplay="auto"
                  sx={{ color: '#2563EB' }}
                />
                <Typography sx={{ color: '#64748B', fontSize: '0.74rem' }}>
                  Industry Benchmark for Medium problems is ~20 mins. Competitive benchmark is ~15 mins.
                </Typography>
              </Box>

              {/* Daily Active Minutes Goal */}
              <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
                  <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.86rem' }}>
                    Daily Coding Focus Goal
                  </Typography>
                  <Typography sx={{ fontWeight: 800, color: '#059669', fontSize: '0.86rem' }}>
                    {formData.dailyGoalMins} minutes / day
                  </Typography>
                </Box>
                <Slider
                  value={formData.dailyGoalMins || 60}
                  onChange={(_, val) => setFormData((prev: UserGoalData) => ({ ...prev, dailyGoalMins: val as number }))}
                  min={15}
                  max={180}
                  step={15}
                  valueLabelDisplay="auto"
                  sx={{ color: '#059669' }}
                />
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
                  {[30, 45, 60, 90, 120].map((mins) => (
                    <Chip
                      key={mins}
                      label={`${mins}m`}
                      size="small"
                      onClick={() => setFormData((prev: UserGoalData) => ({ ...prev, dailyGoalMins: mins }))}
                      sx={{
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '0.7rem',
                        bgcolor: formData.dailyGoalMins === mins ? '#059669' : '#FFFFFF',
                        color: formData.dailyGoalMins === mins ? '#FFFFFF' : '#475569',
                        border: '1px solid #CBD5E1',
                      }}
                    />
                  ))}
                </Box>
              </Box>

              {/* 3-Column Velocity Settings */}
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2 }}>
                <Box>
                  <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.82rem', mb: 0.8 }}>
                    Weekly Problem Quota
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    value={formData.weeklyProblemQuota}
                    onChange={(e) => setFormData((prev: UserGoalData) => ({ ...prev, weeklyProblemQuota: Number(e.target.value) }))}
                    slotProps={{ htmlInput: { min: 5, max: 60 } }}
                    sx={{ '& input': { fontWeight: 800 } }}
                  />
                </Box>

                <Box>
                  <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.82rem', mb: 0.8 }}>
                    Target Contest Rating
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    value={formData.targetContestRating}
                    onChange={(e) => setFormData((prev: UserGoalData) => ({ ...prev, targetContestRating: Number(e.target.value) }))}
                    slotProps={{ htmlInput: { min: 1000, max: 2800 } }}
                    sx={{ '& input': { fontWeight: 800 } }}
                  />
                </Box>

                <Box>
                  <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.82rem', mb: 0.8 }}>
                    First-Try Pass Target (%)
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    value={formData.firstAttemptTargetRate}
                    onChange={(e) => setFormData((prev: UserGoalData) => ({ ...prev, firstAttemptTargetRate: Number(e.target.value) }))}
                    slotProps={{ htmlInput: { min: 50, max: 99 } }}
                    sx={{ '& input': { fontWeight: 800 } }}
                  />
                </Box>
              </Box>
            </Box>
          )}

          {/* TAB 3: SKILL SETS CALIBRATION */}
          {formTab === 2 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Typography sx={{ color: '#64748B', fontSize: '0.8rem' }}>
                Adjust your present baseline competence across domains. Labels update automatically.
              </Typography>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                {formData.skills.map((skill: { id: string; name: string; level: number; label: string }, index: number) => {
                  const getBadge = (lvl: number) => {
                    if (lvl >= 80) return 'Advanced';
                    if (lvl >= 65) return 'Intermediate';
                    if (lvl >= 50) return 'Foundational';
                    return 'Elementary';
                  };

                  return (
                    <Box
                      key={skill.id}
                      sx={{
                        p: 1.8,
                        borderRadius: '12px',
                        bgcolor: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.6 }}>
                        <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.82rem' }}>
                          {skill.name}
                        </Typography>
                        <Chip
                          label={`${skill.level}% • ${skill.label}`}
                          size="small"
                          sx={{
                            fontWeight: 800,
                            fontSize: '0.66rem',
                            bgcolor: skill.level >= 80 ? '#ECFDF5' : skill.level >= 65 ? '#EFF6FF' : '#FFFBEB',
                            color: skill.level >= 80 ? '#059669' : skill.level >= 65 ? '#1D4ED8' : '#D97706',
                          }}
                        />
                      </Box>
                      <Slider
                        value={skill.level}
                        onChange={(_, val) => {
                          const updated = [...formData.skills];
                          const lvl = val as number;
                          updated[index] = {
                            ...updated[index],
                            level: lvl,
                            label: getBadge(lvl),
                          };
                          setFormData((prev: UserGoalData) => ({ ...prev, skills: updated }));
                        }}
                        min={10}
                        max={100}
                        step={1}
                        sx={{
                          color: skill.level >= 80 ? '#10B981' : skill.level >= 65 ? '#2563EB' : '#F59E0B',
                        }}
                      />
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )}
        </DialogContent>

        {/* Modal Footer */}
        <Box
          sx={{
            p: 2.5,
            px: 3,
            bgcolor: '#F8FAFC',
            borderTop: '1px solid #E2E8F0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 1.5,
          }}
        >
          <Button
            variant="text"
            size="small"
            startIcon={<RestartAltRoundedIcon sx={{ fontSize: 16 }} />}
            onClick={() => setFormData(DEFAULT_GOAL)}
            sx={{ color: '#64748B', fontWeight: 700, textTransform: 'none', fontSize: '0.78rem' }}
          >
            Reset Defaults
          </Button>

          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                setCustomizerOpen(false);
                setWizardOpen(true);
              }}
              startIcon={<AutoAwesomeRoundedIcon sx={{ fontSize: 15 }} />}
              sx={{
                color: '#2563EB',
                borderColor: '#BFDBFE',
                fontWeight: 800,
                textTransform: 'none',
                fontSize: '0.78rem',
                borderRadius: '8px',
                '&:hover': { bgcolor: '#EFF6FF', borderColor: '#2563EB' },
              }}
            >
              Diagnostic Quiz
            </Button>

            <Button
              variant="contained"
              size="small"
              onClick={handleSaveCustomForm}
              startIcon={<SaveRoundedIcon sx={{ fontSize: 16 }} />}
              sx={{
                bgcolor: '#2563EB',
                color: '#FFFFFF',
                fontWeight: 800,
                textTransform: 'none',
                fontSize: '0.8rem',
                borderRadius: '8px',
                px: 2.2,
                py: 0.8,
                boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
                '&:hover': { bgcolor: '#1D4ED8' },
              }}
            >
              Save & Apply Goals
            </Button>
          </Box>
        </Box>
      </Dialog>

      {/* Recalibrate Wizard Dialog */}
      <Dialog
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        maxWidth="lg"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              bgcolor: 'transparent',
              boxShadow: 'none',
              backgroundImage: 'none',
            },
          },
        }}
      >
        <DialogContent sx={{ p: 0 }}>
          <IdentityDiagnosticWizard
            isModal={true}
            userId={profile?.id}
            onClose={() => setWizardOpen(false)}
            onComplete={handleSaveUpdatedGoal}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
}
