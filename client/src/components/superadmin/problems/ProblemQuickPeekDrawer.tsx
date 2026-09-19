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
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { FluidArrowRight } from '@/utils/fluid_arrow';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import TimerRoundedIcon from '@mui/icons-material/TimerRounded';
import MemoryRoundedIcon from '@mui/icons-material/MemoryRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import ThumbUpRoundedIcon from '@mui/icons-material/ThumbUpRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded';
import Link from 'next/link';

import { ProblemEntity } from '@/types/problem';
import { useToast } from '@/context/ToastContext';

interface ProblemQuickPeekDrawerProps {
  problem: ProblemEntity | null;
  open: boolean;
  onClose: () => void;
}

export default function ProblemQuickPeekDrawer({
  problem,
  open,
  onClose,
}: ProblemQuickPeekDrawerProps) {
  const toast = useToast();
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!problem) return null;

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.info('Test case sample copied to clipboard', 'Copied');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const difficultyColors = {
    Easy: { bg: '#F0FDF4', color: '#16A34A', border: '#BBF7D0' },
    Medium: { bg: '#FFFBEB', color: '#D97706', border: '#FDE68A' },
    Hard: { bg: '#FEF2F2', color: '#DC2626', border: '#FECACA' },
  }[problem.difficulty];

  return (
    <>
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
                label={problem.code}
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
                label={problem.difficulty}
                size="small"
                sx={{
                  height: 22,
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  bgcolor: difficultyColors.bg,
                  color: difficultyColors.color,
                  border: `1px solid ${difficultyColors.border}`,
                  borderRadius: '9999px',
                }}
              />
              <Chip
                label={problem.status}
                size="small"
                sx={{
                  height: 22,
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  bgcolor:
                    problem.status === 'Published'
                      ? '#F0FDF4'
                      : problem.status === 'Under Review'
                      ? '#FFFBEB'
                      : '#F1F5F9',
                  color:
                    problem.status === 'Published'
                      ? '#16A34A'
                      : problem.status === 'Under Review'
                      ? '#D97706'
                      : '#64748B',
                  border: '1px solid',
                  borderColor:
                    problem.status === 'Published'
                      ? '#BBF7D0'
                      : problem.status === 'Under Review'
                      ? '#FDE68A'
                      : '#CBD5E1',
                  borderRadius: '9999px',
                }}
              />
            </Box>

            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.2rem', lineHeight: 1.3 }}>
              {problem.title}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
              {problem.category} • Author: {problem.authorName || 'Curriculum Board'}
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
                Acceptance
              </Typography>
              <Typography sx={{ fontSize: '1.15rem', fontWeight: 900, color: '#2563EB', mt: 0.25 }}>
                {problem.acceptanceRate}%
              </Typography>
              <Typography sx={{ fontSize: '0.68rem', color: '#94A3B8', fontWeight: 600 }}>
                {problem.totalSubmissions.toLocaleString()} total
              </Typography>
            </Box>

            <Box sx={{ p: 1.5, bgcolor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
              <Typography sx={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                Limits
              </Typography>
              <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', mt: 0.25 }}>
                {problem.timeLimitMs}ms
              </Typography>
              <Typography sx={{ fontSize: '0.68rem', color: '#94A3B8', fontWeight: 600 }}>
                {problem.memoryLimitMb} MB RAM
              </Typography>
            </Box>

            <Box sx={{ p: 1.5, bgcolor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
              <Typography sx={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                Score Value
              </Typography>
              <Typography sx={{ fontSize: '1.15rem', fontWeight: 900, color: '#D97706', mt: 0.25 }}>
                {problem.points} pts
              </Typography>
              <Typography sx={{ fontSize: '0.68rem', color: '#16A34A', fontWeight: 600 }}>
                +{problem.likes} likes
              </Typography>
            </Box>
          </Box>

          {/* Companies Tagged */}
          {problem.companies && problem.companies.length > 0 && (
            <Box>
              <Typography sx={{ fontSize: '0.76rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', mb: 1, letterSpacing: '0.04em' }}>
                Frequently Asked By
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                {problem.companies.map((comp) => (
                  <Chip
                    key={comp}
                    label={comp}
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
          )}

          {/* Algorithmic Tags */}
          <Box>
            <Typography sx={{ fontSize: '0.76rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', mb: 1, letterSpacing: '0.04em' }}>
              Topics & Algorithmic Patterns
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
              {problem.tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  sx={{
                    bgcolor: '#EFF6FF',
                    color: '#2563EB',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #BFDBFE',
                  }}
                />
              ))}
            </Box>
          </Box>

          <Divider sx={{ borderColor: '#E2E8F0' }} />

          {/* Problem Statement Preview */}
          <Box>
            <Typography sx={{ fontSize: '0.76rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', mb: 1, letterSpacing: '0.04em' }}>
              Problem Statement
            </Typography>
            <Box
              sx={{
                p: 2,
                borderRadius: '12px',
                bgcolor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                color: '#334155',
                fontSize: '0.88rem',
                lineHeight: 1.6,
                whiteSpace: 'pre-line',
              }}
            >
              {problem.statementMarkdown}
            </Box>
          </Box>

          {/* Sample Test Cases */}
          <Box>
            <Typography sx={{ fontSize: '0.76rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', mb: 1, letterSpacing: '0.04em' }}>
              Sample Test Cases
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {problem.sampleTestCases.map((tc, idx) => (
                <Box
                  key={idx}
                  sx={{
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    sx={{
                      px: 1.75,
                      py: 0.75,
                      bgcolor: '#F1F5F9',
                      borderBottom: '1px solid #E2E8F0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>
                      Example {idx + 1}
                    </Typography>
                    <Tooltip title="Copy Input">
                      <IconButton
                        size="small"
                        onClick={() => handleCopy(tc.input, idx)}
                        sx={{ color: '#64748B', p: 0.25 }}
                      >
                        {copiedIndex === idx ? (
                          <CheckRoundedIcon sx={{ fontSize: 16, color: '#16A34A' }} />
                        ) : (
                          <ContentCopyRoundedIcon sx={{ fontSize: 16 }} />
                        )}
                      </IconButton>
                    </Tooltip>
                  </Box>

                  <Box sx={{ p: 1.5, bgcolor: '#FFFFFF' }}>
                    <Box sx={{ mb: 1 }}>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                        Input:
                      </Typography>
                      <Typography
                        component="pre"
                        sx={{
                          p: 1,
                          bgcolor: '#F8FAFC',
                          borderRadius: '6px',
                          border: '1px solid #E2E8F0',
                          fontSize: '0.8rem',
                          fontFamily: 'monospace',
                          overflowX: 'auto',
                          m: 0,
                          mt: 0.25,
                        }}
                      >
                        {tc.input}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                        Output:
                      </Typography>
                      <Typography
                        component="pre"
                        sx={{
                          p: 1,
                          bgcolor: '#F8FAFC',
                          borderRadius: '6px',
                          border: '1px solid #E2E8F0',
                          fontSize: '0.8rem',
                          fontFamily: 'monospace',
                          overflowX: 'auto',
                          m: 0,
                          mt: 0.25,
                        }}
                      >
                        {tc.output}
                      </Typography>
                    </Box>

                    {tc.explanation && (
                      <Typography sx={{ fontSize: '0.75rem', color: '#64748B', mt: 1, fontStyle: 'italic' }}>
                        <strong>Explanation:</strong> {tc.explanation}
                      </Typography>
                    )}
                  </Box>
                </Box>
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
            href={`/superadmin/problems/${problem.slug}`}
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
            Open in Code Workspace
          </Button>
        </Box>
      </Drawer>
    </>
  );
}
