'use client';

import React, { useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Chip,
  Button,
  Divider,
  Tooltip,
  Snackbar,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import AutoStoriesRoundedIcon from '@mui/icons-material/AutoStoriesRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import WhatshotRoundedIcon from '@mui/icons-material/WhatshotRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import Link from 'next/link';
import { FluidArrowRight } from '@/utils/fluid_arrow';
import type { AnyAnalyticsRow } from '@/types/analytics';

interface AnalyticsDrilldownDrawerProps {
  open: boolean;
  onClose: () => void;
  row: AnyAnalyticsRow | null;
}

export default function AnalyticsDrilldownDrawer({
  open,
  onClose,
  row,
}: AnalyticsDrilldownDrawerProps) {
  const [copied, setCopied] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  if (!row) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(row, null, 2));
    setCopied(true);
    setSnackbarOpen(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        slotProps={{
          paper: {
            sx: {
              width: { xs: '100%', sm: 540, md: 580 },
              p: 0,
              bgcolor: '#FFFFFF',
              boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.08)',
            },
          },
        }}
      >
        {/* Top Header */}
        <Box
          sx={{
            p: 2.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #E2E8F0',
            bgcolor: '#F8FAFC',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: '10px',
                bgcolor: '#EFF6FF',
                border: '1px solid #DBEAFE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563EB',
              }}
            >
              {row.rowType === 'college' && <SchoolRoundedIcon sx={{ fontSize: 20 }} />}
              {row.rowType === 'topic' && <AutoStoriesRoundedIcon sx={{ fontSize: 20 }} />}
              {row.rowType === 'contest' && <EmojiEventsRoundedIcon sx={{ fontSize: 20 }} />}
              {row.rowType === 'submission' && <CodeRoundedIcon sx={{ fontSize: 20 }} />}
            </Box>
            <Box>
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Academic Diagnostic Drilldown
              </Typography>
              <Typography sx={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>
                {row.rowType === 'college' && row.name}
                {row.rowType === 'topic' && row.name}
                {row.rowType === 'contest' && row.title}
                {row.rowType === 'submission' && `${row.language} Engine`}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Copy Diagnostic JSON">
              <IconButton
                size="small"
                onClick={handleCopy}
                sx={{
                  color: copied ? '#16A34A' : '#64748B',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  '&:hover': { bgcolor: '#EFF6FF', color: '#2563EB' },
                }}
              >
                {copied ? <CheckRoundedIcon fontSize="small" /> : <ContentCopyRoundedIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
            <IconButton
              size="small"
              onClick={onClose}
              sx={{
                color: '#64748B',
                borderRadius: '8px',
                '&:hover': { bgcolor: '#F1F5F9', color: '#0F172A' },
              }}
            >
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {/* Body Content */}
        <Box sx={{ p: 3, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 3, flex: 1 }}>
          {/* 1. College Details */}
          {row.rowType === 'college' && (
            <>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Chip label={row.tier} size="small" sx={{ bgcolor: '#EFF6FF', color: '#2563EB', fontWeight: 700, fontSize: '0.74rem' }} />
                  <Chip label={`Status: ${row.healthStatus}`} size="small" sx={{ bgcolor: '#ECFDF5', color: '#059669', fontWeight: 700, fontSize: '0.74rem' }} />
                  <Chip label={`+${row.weeklyGrowth}% this week`} size="small" sx={{ bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', fontWeight: 600, fontSize: '0.72rem' }} />
                </Box>
                <Typography sx={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>
                  {row.name} ({row.code})
                </Typography>
                <Typography sx={{ fontSize: '0.84rem', color: '#64748B', mt: 0.5 }}>
                  Institutional student coding benchmarks and placement readiness tracker
                </Typography>
              </Box>

              <Divider sx={{ borderColor: '#F1F5F9' }} />

              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5 }}>
                <Box sx={{ p: 1.75, borderRadius: '12px', bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                  <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748B' }}>Placement Ready</Typography>
                  <Typography sx={{ fontSize: '1.25rem', fontWeight: 800, color: '#059669' }}>{row.placementReadyPercent}%</Typography>
                </Box>
                <Box sx={{ p: 1.75, borderRadius: '12px', bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                  <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748B' }}>Problems Solved</Typography>
                  <Typography sx={{ fontSize: '1.25rem', fontWeight: 800, color: '#2563EB' }}>{row.problemsSolved.toLocaleString()}</Typography>
                </Box>
                <Box sx={{ p: 1.75, borderRadius: '12px', bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                  <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748B' }}>Avg Solves/Student</Typography>
                  <Typography sx={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>{row.avgSolvesPerStudent}</Typography>
                </Box>
              </Box>

              <Box sx={{ p: 2, borderRadius: '12px', bgcolor: '#EFF6FF', border: '1px solid #DBEAFE', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography sx={{ fontSize: '0.76rem', fontWeight: 700, color: '#1E40AF', textTransform: 'uppercase' }}>Campus Top Performer</Typography>
                  <Typography sx={{ fontSize: '0.94rem', fontWeight: 800, color: '#1E3A8A' }}>{row.topCoderName}</Typography>
                </Box>
                <Chip label={`Rating: ${row.avgContestRating}`} size="small" sx={{ bgcolor: '#FFFFFF', color: '#2563EB', fontWeight: 700 }} />
              </Box>
            </>
          )}

          {/* 2. Topic Details */}
          {row.rowType === 'topic' && (
            <>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Chip label={row.category} size="small" sx={{ bgcolor: '#EFF6FF', color: '#2563EB', fontWeight: 700, fontSize: '0.74rem' }} />
                  <Chip
                    label={row.frictionLevel}
                    size="small"
                    sx={{
                      bgcolor: row.frictionLevel === 'High Friction' ? '#FEF2F2' : row.frictionLevel === 'Moderate' ? '#FFFBEB' : '#ECFDF5',
                      color: row.frictionLevel === 'High Friction' ? '#DC2626' : row.frictionLevel === 'Moderate' ? '#D97706' : '#059669',
                      border: `1px solid ${row.frictionLevel === 'High Friction' ? '#FECACA' : row.frictionLevel === 'Moderate' ? '#FDE68A' : '#A7F3D0'}`,
                      fontWeight: 700,
                    }}
                  />
                </Box>
                <Typography sx={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>
                  {row.name} ({row.topicCode})
                </Typography>
                <Typography sx={{ fontSize: '0.84rem', color: '#64748B', mt: 0.5 }}>
                  Curriculum topic mastery and student struggle point diagnostic
                </Typography>
              </Box>

              <Divider sx={{ borderColor: '#F1F5F9' }} />

              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5 }}>
                <Box sx={{ p: 1.75, borderRadius: '12px', bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                  <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748B' }}>Solve Pass Rate</Typography>
                  <Typography sx={{ fontSize: '1.25rem', fontWeight: 800, color: row.passRate < 60 ? '#DC2626' : '#059669' }}>{row.passRate}%</Typography>
                </Box>
                <Box sx={{ p: 1.75, borderRadius: '12px', bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                  <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748B' }}>Total Attempts</Typography>
                  <Typography sx={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>{row.studentAttempts.toLocaleString()}</Typography>
                </Box>
                <Box sx={{ p: 1.75, borderRadius: '12px', bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                  <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748B' }}>Avg Attempts/Solve</Typography>
                  <Typography sx={{ fontSize: '1.25rem', fontWeight: 800, color: row.avgAttemptsToSolve > 3 ? '#DC2626' : '#2563EB' }}>{row.avgAttemptsToSolve}</Typography>
                </Box>
              </Box>

              <Box sx={{ p: 2, borderRadius: '12px', bgcolor: '#FEF2F2', border: '1px solid #FECACA' }}>
                <Typography sx={{ fontSize: '0.76rem', fontWeight: 700, color: '#DC2626', textTransform: 'uppercase', mb: 0.5 }}>
                  Identified Stumbling Block
                </Typography>
                <Typography sx={{ fontSize: '0.86rem', fontWeight: 600, color: '#991B1B', lineHeight: 1.5 }}>
                  {row.primaryStumblingBlock}
                </Typography>
              </Box>

              <Box sx={{ p: 2, borderRadius: '12px', bgcolor: '#ECFDF5', border: '1px solid #A7F3D0' }}>
                <Typography sx={{ fontSize: '0.76rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase', mb: 0.5 }}>
                  Recommended Faculty Action
                </Typography>
                <Typography sx={{ fontSize: '0.86rem', fontWeight: 600, color: '#065F46', lineHeight: 1.5 }}>
                  {row.facultyActionNeeded}
                </Typography>
              </Box>
            </>
          )}

          {/* 3. Contest Details */}
          {row.rowType === 'contest' && (
            <>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Chip label={row.format} size="small" sx={{ bgcolor: '#EFF6FF', color: '#2563EB', fontWeight: 700, fontSize: '0.74rem' }} />
                  <Chip label={row.status} size="small" sx={{ bgcolor: row.status === 'Live Arena' ? '#FEF2F2' : '#ECFDF5', color: row.status === 'Live Arena' ? '#DC2626' : '#059669', fontWeight: 700 }} />
                </Box>
                <Typography sx={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>
                  {row.title} ({row.contestCode})
                </Typography>
                <Typography sx={{ fontSize: '0.84rem', color: '#64748B', mt: 0.5 }}>
                  Held on {row.dateFormatted} • Tournament participation and scoring analytics
                </Typography>
              </Box>

              <Divider sx={{ borderColor: '#F1F5F9' }} />

              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5 }}>
                <Box sx={{ p: 1.75, borderRadius: '12px', bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                  <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748B' }}>Turnout Rate</Typography>
                  <Typography sx={{ fontSize: '1.25rem', fontWeight: 800, color: '#2563EB' }}>{row.turnoutPercent}%</Typography>
                </Box>
                <Box sx={{ p: 1.75, borderRadius: '12px', bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                  <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748B' }}>Avg Score</Typography>
                  <Typography sx={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>{row.avgScore} pts</Typography>
                </Box>
                <Box sx={{ p: 1.75, borderRadius: '12px', bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                  <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748B' }}>First Solve Time</Typography>
                  <Typography sx={{ fontSize: '1.25rem', fontWeight: 800, color: '#059669' }}>{row.timeToFirstSolve}</Typography>
                </Box>
              </Box>

              <Box sx={{ p: 2, borderRadius: '12px', bgcolor: '#FFFBEB', border: '1px solid #FDE68A', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography sx={{ fontSize: '0.76rem', fontWeight: 700, color: '#D97706', textTransform: 'uppercase' }}>Plagiarism Flagged</Typography>
                  <Typography sx={{ fontSize: '0.94rem', fontWeight: 800, color: '#92400E' }}>{row.plagiarismSuspectCount} flagged coders</Typography>
                </Box>
                <Typography sx={{ fontSize: '0.78rem', color: '#D97706', fontWeight: 600 }}>MOSS AST Verification</Typography>
              </Box>
            </>
          )}

          {/* 4. Submission Details */}
          {row.rowType === 'submission' && (
            <>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Chip label={row.version} size="small" sx={{ bgcolor: '#EFF6FF', color: '#2563EB', fontWeight: 700, fontSize: '0.74rem' }} />
                  <Chip label={`${row.sharePercent}% of All Submissions`} size="small" sx={{ bgcolor: '#FAF5FF', color: '#9333EA', fontWeight: 700 }} />
                </Box>
                <Typography sx={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>
                  {row.language} Execution Metrics
                </Typography>
                <Typography sx={{ fontSize: '0.84rem', color: '#64748B', mt: 0.5 }}>
                  Compiler speed and common student syntax & logic bug trends
                </Typography>
              </Box>

              <Divider sx={{ borderColor: '#F1F5F9' }} />

              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5 }}>
                <Box sx={{ p: 1.75, borderRadius: '12px', bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                  <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748B' }}>Pass Rate</Typography>
                  <Typography sx={{ fontSize: '1.25rem', fontWeight: 800, color: '#059669' }}>{row.passRate}%</Typography>
                </Box>
                <Box sx={{ p: 1.75, borderRadius: '12px', bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                  <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748B' }}>Total Submissions</Typography>
                  <Typography sx={{ fontSize: '1.25rem', fontWeight: 800, color: '#2563EB' }}>{row.submissionsCount.toLocaleString()}</Typography>
                </Box>
                <Box sx={{ p: 1.75, borderRadius: '12px', bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                  <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748B' }}>Avg Exec Time</Typography>
                  <Typography sx={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>{row.avgExecutionTimeMs} ms</Typography>
                </Box>
              </Box>

              <Box sx={{ p: 2, borderRadius: '12px', bgcolor: '#FEF2F2', border: '1px solid #FECACA' }}>
                <Typography sx={{ fontSize: '0.76rem', fontWeight: 700, color: '#DC2626', textTransform: 'uppercase', mb: 0.5 }}>
                  Primary Error Code: {row.primaryErrorCode}
                </Typography>
                <Typography sx={{ fontSize: '0.86rem', fontWeight: 600, color: '#991B1B', lineHeight: 1.5 }}>
                  {row.primaryErrorDescription}
                </Typography>
              </Box>
            </>
          )}
        </Box>

        {/* Footer Actions */}
        <Box
          sx={{
            p: 2.5,
            borderTop: '1px solid #E2E8F0',
            bgcolor: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 1.5,
          }}
        >
          <Button
            variant="outlined"
            onClick={onClose}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.86rem',
              color: '#475569',
              borderColor: '#CBD5E1',
              px: 2.5,
              py: 0.8,
              '&:hover': { bgcolor: '#F8FAFC' },
            }}
          >
            Close
          </Button>

          {row.rowType === 'college' && (
            <Button
              component={Link}
              href={`/superadmin/colleges/${row.id}`}
              variant="contained"
              endIcon={<FluidArrowRight size={16} />}
              sx={{
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.86rem',
                bgcolor: '#2563EB',
                px: 2.5,
                py: 0.8,
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
                '&:hover': { bgcolor: '#1D4ED8' },
              }}
            >
              Open Campus Portal
            </Button>
          )}

          {row.rowType === 'contest' && (
            <Button
              component={Link}
              href={`/superadmin/contests/${row.id}`}
              variant="contained"
              endIcon={<FluidArrowRight size={16} />}
              sx={{
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.86rem',
                bgcolor: '#2563EB',
                px: 2.5,
                py: 0.8,
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
                '&:hover': { bgcolor: '#1D4ED8' },
              }}
            >
              View Contest Arena
            </Button>
          )}

          {(row.rowType === 'topic' || row.rowType === 'submission') && (
            <Button
              component={Link}
              href="/superadmin/problems"
              variant="contained"
              endIcon={<FluidArrowRight size={16} />}
              sx={{
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.86rem',
                bgcolor: '#2563EB',
                px: 2.5,
                py: 0.8,
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
                '&:hover': { bgcolor: '#1D4ED8' },
              }}
            >
              Open Problem Bank
            </Button>
          )}
        </Box>
      </Drawer>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={() => setSnackbarOpen(false)}
        message="Diagnostic report copied to clipboard"
      />
    </>
  );
}
