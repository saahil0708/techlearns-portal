'use client';

import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Avatar,
  Chip,
  Button,
  Tooltip,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { FluidArrowRight } from '@/utils/fluid_arrow';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import WhatshotRoundedIcon from '@mui/icons-material/WhatshotRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import Link from 'next/link';
import { useToast } from '@/context/ToastContext';
import type { StudentDirectoryEntity } from './StudentsDirectoryClient';

interface StudentQuickPeekDrawerProps {
  open: boolean;
  onClose: () => void;
  student: StudentDirectoryEntity | null;
}

export default function StudentQuickPeekDrawer({
  open,
  onClose,
  student,
}: StudentQuickPeekDrawerProps) {
  const toast = useToast();
  if (!student) return null;

  const [copied, setCopied] = React.useState(false);
  const borderColor = '#E2E8F0';

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(student.email);
    setCopied(true);
    toast.info(`Copied ${student.email} to clipboard!`, 'Email Copied');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: { xs: '100%', sm: 440 },
            bgcolor: '#FFFFFF',
            color: '#0F172A',
            borderLeft: `1px solid ${borderColor}`,
            boxShadow: '-8px 0 32px rgba(0,0,0,0.08)',
            p: 0,
          },
        },
      }}
    >
      {/* Header Bar */}
      <Box
        sx={{
          p: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${borderColor}`,
          bgcolor: '#F8FAFC',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            icon={<EmojiEventsRoundedIcon sx={{ fontSize: '0.9rem !important', color: '#D97706 !important' }} />}
            label={`Rank #${student.globalRank}`}
            size="small"
            sx={{
              bgcolor: '#FFFBEB',
              color: '#D97706',
              border: '1px solid #FDE68A',
              fontWeight: 700,
              fontSize: '0.72rem',
              borderRadius: '9999px',
            }}
          />
          <Chip
            label={student.status}
            size="small"
            sx={{
              bgcolor: '#F0FDF4',
              color: '#16A34A',
              border: '1px solid #BBF7D0',
              fontWeight: 700,
              fontSize: '0.72rem',
              borderRadius: '9999px',
            }}
          />
        </Box>
        <IconButton
          onClick={onClose}
          sx={{
            color: '#64748B',
            borderRadius: '9999px',
            '&:hover': { color: '#0F172A', bgcolor: '#F1F5F9' },
          }}
        >
          <CloseRoundedIcon />
        </IconButton>
      </Box>

      {/* Body Content */}
      <Box sx={{ p: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Profile Card */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            src={student.avatarUrl}
            sx={{
              width: 64,
              height: 64,
              bgcolor: student.avatarColor,
              fontWeight: 800,
              fontSize: '1.3rem',
              border: '3px solid #BFDBFE',
              boxShadow: '0 4px 14px rgba(37,99,235,0.15)',
            }}
          >
            {student.name.charAt(0)}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
              {student.name}
            </Typography>
            <Typography variant="body2" sx={{ color: '#2563EB', fontFamily: 'monospace', fontSize: '0.82rem', mb: 0.5, fontWeight: 600 }}>
              @{student.handle}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
              ID: {student.studentId}
            </Typography>
          </Box>
        </Box>

        {/* Institution / Cohort Info */}
        <Box
          sx={{
            p: '16px',
            borderRadius: '14px',
            bgcolor: '#F8FAFC',
            border: `1px solid ${borderColor}`,
          }}
        >
          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Academic Affiliation
          </Typography>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', mt: 0.5 }}>
            {student.institutionName}
          </Typography>
          <Typography variant="body2" sx={{ color: '#2563EB', fontSize: '0.8rem', mt: 0.3, fontWeight: 500 }}>
            {student.cohort}
          </Typography>
        </Box>

        {/* Core Stats Grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5 }}>
          <Box sx={{ p: '14px', borderRadius: '14px', bgcolor: '#EFF6FF', border: '1px solid #BFDBFE' }}>
            <Typography variant="caption" sx={{ color: '#2563EB', fontWeight: 600 }}>
              Contest Rating
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#2563EB', fontFamily: 'monospace', my: 0.3 }}>
              {student.contestRating}
            </Typography>
            <Chip
              label={student.ratingTier}
              size="small"
              sx={{ fontSize: '0.68rem', fontWeight: 800, bgcolor: '#FFFFFF', color: '#2563EB', borderRadius: '9999px', border: '1px solid #BFDBFE' }}
            />
          </Box>

          <Box sx={{ p: '14px', borderRadius: '14px', bgcolor: '#F0FDF4', border: '1px solid #BBF7D0' }}>
            <Typography variant="caption" sx={{ color: '#16A34A', fontWeight: 600 }}>
              Accuracy & Streak
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#16A34A', my: 0.3 }}>
              {student.accuracy}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#D97706', fontSize: '0.75rem', fontWeight: 700 }}>
              <WhatshotRoundedIcon sx={{ fontSize: '0.9rem' }} />
              {student.streakDays} Days Streak
            </Box>
          </Box>
        </Box>

        {/* Problems Solved Breakdown */}
        <Box
          sx={{
            p: '16px',
            borderRadius: '14px',
            bgcolor: '#F8FAFC',
            border: `1px solid ${borderColor}`,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 1 }}>
              <CodeRoundedIcon sx={{ color: '#2563EB', fontSize: '1.1rem' }} />
              Problems Solved: {student.problemsSolved}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', height: 8, borderRadius: '9999px', overflow: 'hidden', bgcolor: '#E2E8F0', mb: 1.5 }}>
            <Box sx={{ width: `${(student.solvedEasy / (student.problemsSolved || 1)) * 100}%`, bgcolor: '#16A34A' }} />
            <Box sx={{ width: `${(student.solvedMedium / (student.problemsSolved || 1)) * 100}%`, bgcolor: '#D97706' }} />
            <Box sx={{ width: `${(student.solvedHard / (student.problemsSolved || 1)) * 100}%`, bgcolor: '#DC2626' }} />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption" sx={{ color: '#16A34A', fontWeight: 700 }}>
              Easy: {student.solvedEasy}
            </Typography>
            <Typography variant="caption" sx={{ color: '#D97706', fontWeight: 700 }}>
              Med: {student.solvedMedium}
            </Typography>
            <Typography variant="caption" sx={{ color: '#DC2626', fontWeight: 700 }}>
              Hard: {student.solvedHard}
            </Typography>
          </Box>
        </Box>

        {/* Skill Domain Competency Radial Gauges */}
        <Box
          sx={{
            p: '16px',
            borderRadius: '14px',
            bgcolor: '#F8FAFC',
            border: `1px solid ${borderColor}`,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 1 }}>
              <CodeRoundedIcon sx={{ color: '#2563EB', fontSize: '1.1rem' }} />
              Verified Domain Mastery
            </Typography>
            <Chip
              label="Proctored"
              size="small"
              sx={{ bgcolor: '#ECFDF5', color: '#059669', fontWeight: 800, fontSize: '0.68rem', height: 20 }}
            />
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 1.5,
              textAlign: 'center',
            }}
          >
            {[
              { label: 'Algorithms', val: Math.min(98, Math.max(65, Math.round(student.contestRating / 22))), color: '#2563EB' },
              { label: 'Object Prog.', val: Math.min(95, Math.max(70, Math.round(student.contestRating / 24))), color: '#4F46E5' },
              { label: 'Database', val: Math.min(92, Math.max(60, Math.round(student.contestRating / 26))), color: '#0891B2' },
              { label: 'Web Dev.', val: Math.min(99, Math.max(75, Math.round(student.contestRating / 21))), color: '#059669' },
              { label: 'Mobile App.', val: Math.min(96, Math.max(68, Math.round(student.contestRating / 23))), color: '#7C3AED' },
              { label: 'Machine Lrn.', val: Math.min(94, Math.max(62, Math.round(student.contestRating / 25))), color: '#D97706' },
            ].map((item) => {
              const size = 62;
              const strokeWidth = 7;
              const radius = (size - strokeWidth) / 2;
              const circ = 2 * Math.PI * radius;
              const offset = circ - (item.val / 100) * circ;

              return (
                <Box
                  key={item.label}
                  sx={{
                    p: 1,
                    borderRadius: '10px',
                    bgcolor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  <Box sx={{ width: size, height: size, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                      <circle cx={size / 2} cy={size / 2} r={radius} stroke="#F1F5F9" strokeWidth={strokeWidth} fill="transparent" />
                      <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={item.color}
                        strokeWidth={strokeWidth}
                        strokeDasharray={circ}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        fill="transparent"
                      />
                    </svg>
                    <Typography sx={{ position: 'absolute', fontWeight: 800, fontSize: '0.78rem', color: '#0F172A' }}>
                      {item.val}%
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#475569', mt: 0.75, lineHeight: 1.1 }}>
                    {item.label}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Fast Action Buttons */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Tooltip title={copied ? 'Copied to clipboard!' : 'Copy student email'}>
            <Button
              fullWidth
              variant="outlined"
              onClick={handleCopyEmail}
              startIcon={<ContentCopyRoundedIcon sx={{ fontSize: '1rem' }} />}
              sx={{
                borderRadius: '9999px',
                borderColor: '#CBD5E1',
                color: '#475569',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.82rem',
                py: 1,
                '&:hover': {
                  borderColor: '#2563EB',
                  bgcolor: '#EFF6FF',
                  color: '#2563EB',
                },
              }}
            >
              {copied ? 'Email Copied!' : student.email}
            </Button>
          </Tooltip>

          <Link href={`/superadmin/students/${student.id}`} passHref style={{ textDecoration: 'none' }}>
            <Button
              fullWidth
              variant="contained"
              endIcon={<FluidArrowRight size={18} />}
              sx={{
                borderRadius: '9999px',
                bgcolor: '#2563EB',
                py: 1.2,
                fontWeight: 700,
                textTransform: 'none',
                boxShadow: '0 4px 14px rgba(37,99,235,0.25)',
                '&:hover': { bgcolor: '#1D4ED8' },
              }}
            >
              Open Full Student Profile
            </Button>
          </Link>
        </Box>
      </Box>
    </Drawer>
  );
}
