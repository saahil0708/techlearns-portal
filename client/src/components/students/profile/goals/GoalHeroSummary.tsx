'use client';

import React from 'react';
import {
  Box,
  Typography,
  Card,
  Chip,
  Button,
} from '@mui/material';
import RocketLaunchRoundedIcon from '@mui/icons-material/RocketLaunchRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import TimerRoundedIcon from '@mui/icons-material/TimerRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import SpeedRoundedIcon from '@mui/icons-material/SpeedRounded';
import FlagRoundedIcon from '@mui/icons-material/FlagRounded';
import { UserGoalData, HeroScoreGauge, CircularSkillGauge } from './types';

interface GoalHeroSummaryProps {
  goalData: UserGoalData;
  isOwner: boolean;
  currentStreak: number;
  targetSolveTime: number;
  dailyPercentage: number;
  onOpenCustomizer: (initialTab?: number) => void;
  onOpenWizard: () => void;
}

export default function GoalHeroSummary({
  goalData,
  isOwner,
  currentStreak,
  targetSolveTime,
  dailyPercentage,
  onOpenCustomizer,
  onOpenWizard,
}: GoalHeroSummaryProps) {
  return (
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
                  onClick={() => onOpenCustomizer(0)}
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
                  onClick={onOpenWizard}
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

          {/* Daily Focus Goal Bar */}
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
  );
}
