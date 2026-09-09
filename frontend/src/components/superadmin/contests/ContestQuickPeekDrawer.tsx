'use client';

import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Chip,
  Button,
  Divider,
  Tooltip,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import { FluidArrowRight } from '@/utils/fluid_arrow';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import WhatshotRoundedIcon from '@mui/icons-material/WhatshotRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import RadioButtonCheckedRoundedIcon from '@mui/icons-material/RadioButtonCheckedRounded';
import Link from 'next/link';

import { ContestEntity } from '@/types/contest';

interface ContestQuickPeekDrawerProps {
  contest: ContestEntity | null;
  open: boolean;
  onClose: () => void;
}

export default function ContestQuickPeekDrawer({
  contest,
  open,
  onClose,
}: ContestQuickPeekDrawerProps) {
  if (!contest) return null;

  const statusColors = {
    LIVE: { bg: '#FEF2F2', color: '#DC2626', border: '#FECACA' },
    UPCOMING: { bg: '#EFF6FF', color: '#2563EB', border: '#BFDBFE' },
    PAST: { bg: '#F1F5F9', color: '#64748B', border: '#CBD5E1' },
    DRAFT: { bg: '#FFFBEB', color: '#D97706', border: '#FDE68A' },
  }[contest.status];

  const formatHours = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: { xs: '100%', sm: 480, md: 540 },
            bgcolor: '#FFFFFF',
            boxShadow: '-10px 0 35px rgba(15, 23, 42, 0.1)',
            display: 'flex',
            flexDirection: 'column',
          },
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2.5,
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 2,
          bgcolor: '#F8FAFC',
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
            <Chip
              label={contest.code}
              size="small"
              sx={{
                height: 22,
                fontSize: '0.72rem',
                fontWeight: 800,
                bgcolor: '#EFF6FF',
                color: '#2563EB',
                border: '1px solid #BFDBFE',
                borderRadius: '9999px',
              }}
            />
            <Chip
              icon={
                contest.status === 'LIVE' ? (
                  <RadioButtonCheckedRoundedIcon sx={{ fontSize: '14px !important', color: '#DC2626 !important' }} />
                ) : undefined
              }
              label={contest.status}
              size="small"
              sx={{
                height: 22,
                fontSize: '0.72rem',
                fontWeight: 800,
                bgcolor: statusColors.bg,
                color: statusColors.color,
                border: `1px solid ${statusColors.border}`,
                borderRadius: '9999px',
              }}
            />
            {contest.rated && (
              <Chip
                icon={<StarRoundedIcon sx={{ fontSize: '14px !important', color: '#D97706 !important' }} />}
                label="Rated"
                size="small"
                sx={{
                  height: 22,
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  bgcolor: '#FFFBEB',
                  color: '#D97706',
                  border: '1px solid #FDE68A',
                  borderRadius: '9999px',
                }}
              />
            )}
          </Box>

          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.2rem', lineHeight: 1.3 }}>
            {contest.title}
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
            {contest.scope} • Organized by {contest.organizer}
          </Typography>
        </Box>

        <IconButton
          size="small"
          onClick={onClose}
          sx={{
            color: '#64748B',
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            '&:hover': { color: '#0F172A', bgcolor: '#F1F5F9' },
          }}
        >
          <CloseRoundedIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      {/* Content Body */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Key Metrics Grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5 }}>
          <Box sx={{ p: 1.5, bgcolor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
            <Typography sx={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
              Duration
            </Typography>
            <Typography sx={{ fontSize: '1.15rem', fontWeight: 900, color: '#2563EB', mt: 0.25 }}>
              {formatHours(contest.durationMinutes)}
            </Typography>
            <Typography sx={{ fontSize: '0.68rem', color: '#94A3B8', fontWeight: 600 }}>
              {contest.problemsCount} Challenges
            </Typography>
          </Box>

          <Box sx={{ p: 1.5, bgcolor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
            <Typography sx={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
              Participants
            </Typography>
            <Typography sx={{ fontSize: '1.15rem', fontWeight: 900, color: '#0F172A', mt: 0.25 }}>
              {contest.registeredParticipants.toLocaleString()}
            </Typography>
            <Typography sx={{ fontSize: '0.68rem', color: '#94A3B8', fontWeight: 600 }}>
              Registered Coders
            </Typography>
          </Box>

          <Box sx={{ p: 1.5, bgcolor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
            <Typography sx={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
              Evaluations
            </Typography>
            <Typography sx={{ fontSize: '1.15rem', fontWeight: 900, color: '#16A34A', mt: 0.25 }}>
              {contest.submissionsCount.toLocaleString()}
            </Typography>
            <Typography sx={{ fontSize: '0.68rem', color: '#94A3B8', fontWeight: 600 }}>
              Submissions Run
            </Typography>
          </Box>
        </Box>

        {/* Schedule Timing Box */}
        <Box sx={{ p: 2, borderRadius: '12px', bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
          <Typography sx={{ fontSize: '0.76rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', mb: 1, letterSpacing: '0.04em' }}>
            Contest Schedule & Timing Window
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography sx={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 600 }}>
                Start Time:
              </Typography>
              <Typography sx={{ fontSize: '0.82rem', color: '#0F172A', fontWeight: 700, fontFamily: 'monospace' }}>
                {formatDate(contest.startTime)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography sx={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 600 }}>
                End Time:
              </Typography>
              <Typography sx={{ fontSize: '0.82rem', color: '#0F172A', fontWeight: 700, fontFamily: 'monospace' }}>
                {formatDate(contest.endTime)}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Scoring Rules & Format */}
        <Box>
          <Typography sx={{ fontSize: '0.76rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', mb: 1, letterSpacing: '0.04em' }}>
            Scoring Engine & Penalty System
          </Typography>
          <Box sx={{ p: 2, borderRadius: '12px', bgcolor: '#EFF6FF', border: '1px solid #BFDBFE' }}>
            <Typography sx={{ fontWeight: 800, color: '#1D4ED8', fontSize: '0.88rem' }}>
              {contest.scoringFormat}
            </Typography>
            <Typography sx={{ fontSize: '0.8rem', color: '#334155', mt: 0.5, lineHeight: 1.5 }}>
              {contest.scoringFormat.includes('ICPC')
                ? 'Score is based on total solved problems. Ties broken by cumulative penalty time (time of solve + 20 minutes penalty per incorrect submission prior to accepted verdict).'
                : contest.scoringFormat.includes('LeetCode')
                ? 'Each problem awards fixed points (e.g. 3, 4, 5, 6). Ties broken by total submission time plus 5 minutes penalty per wrong attempt.'
                : 'Scored per subtask test case group (0–100 partial points). Total score is the sum across all test groupings.'}
            </Typography>
          </Box>
        </Box>

        {/* Description */}
        <Box>
          <Typography sx={{ fontSize: '0.76rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', mb: 1, letterSpacing: '0.04em' }}>
            Tournament Description
          </Typography>
          <Typography sx={{ fontSize: '0.86rem', color: '#334155', lineHeight: 1.6 }}>
            {contest.description}
          </Typography>
        </Box>

        {/* Prize Pool if any */}
        {contest.prizePool && (
          <Box sx={{ p: 2, borderRadius: '12px', bgcolor: '#FEF3C7', border: '1px solid #FDE68A' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EmojiEventsRoundedIcon sx={{ color: '#D97706', fontSize: 20 }} />
              <Typography sx={{ fontWeight: 800, color: '#92400E', fontSize: '0.88rem' }}>
                Prize Pool & Honors
              </Typography>
            </Box>
            <Typography sx={{ fontSize: '0.82rem', color: '#78350F', mt: 0.5 }}>
              {contest.prizePool}
            </Typography>
          </Box>
        )}

        {/* Tags */}
        <Box>
          <Typography sx={{ fontSize: '0.76rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', mb: 1, letterSpacing: '0.04em' }}>
            Categories & Tags
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            {contest.tags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                size="small"
                sx={{
                  bgcolor: '#F1F5F9',
                  color: '#334155',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                }}
              />
            ))}
          </Box>
        </Box>
      </Box>

      {/* Footer Actions */}
      <Box
        sx={{
          p: 2.5,
          borderTop: '1px solid #E2E8F0',
          bgcolor: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 600,
            color: '#64748B',
            borderColor: '#CBD5E1',
            px: 2,
            '&:hover': { bgcolor: '#F8FAFC', borderColor: '#94A3B8' },
          }}
        >
          Close
        </Button>

        <Button
          component={Link}
          href={`/superadmin/contests/${contest.id}`}
          variant="contained"
          endIcon={<FluidArrowRight size={18} />}
          sx={{
            bgcolor: '#2563EB',
            color: '#FFFFFF',
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '0.88rem',
            px: 2.5,
            py: 0.9,
            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
            '&:hover': { bgcolor: '#1D4ED8' },
          }}
        >
          {contest.status === 'LIVE' ? 'Enter Live Arena' : 'View Arena & Standings'}
        </Button>
      </Box>
    </Drawer>
  );
}
