'use client';

import React from 'react';
import { Box, Typography, Card, Chip, Button } from '@mui/material';
import Link from 'next/link';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import TimerRoundedIcon from '@mui/icons-material/TimerRounded';
import MemoryRoundedIcon from '@mui/icons-material/MemoryRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import { FluidArrowLeft } from '@/utils/fluid_arrow';
import { ProblemEntity } from '@/types/problem';
import ProblemStatementDisplay from '@/components/problems/ProblemStatementDisplay';

interface ProblemHeaderStatsProps {
  problem: ProblemEntity;
  isHeaderExpanded: boolean;
  onToggleHeaderExpand: () => void;
  onAddTestCase: () => void;
  onEditProblem?: () => void;
  onCopyMarkdown: () => void;
  renderInlineFormatted: (text: string) => React.ReactNode;
}

export default function ProblemHeaderStats({
  problem,
  isHeaderExpanded,
  onToggleHeaderExpand,
  onAddTestCase,
  onEditProblem,
  onCopyMarkdown,
  renderInlineFormatted,
}: ProblemHeaderStatsProps) {
  const difficultyColors = {
    Easy: { bg: '#F0FDF4', color: '#16A34A', border: '#BBF7D0' },
    Medium: { bg: '#FFFBEB', color: '#D97706', border: '#FDE68A' },
    Hard: { bg: '#FEF2F2', color: '#DC2626', border: '#FECACA' },
  }[problem.difficulty] || { bg: '#F1F5F9', color: '#475569', border: '#E2E8F0' };

  const cleanStatementPreview = (md?: string): string => {
    if (!md) return 'Design an optimal algorithm to evaluate the given inputs and return results adhering to the specified time and memory complexity bounds.';
    const cleaned = md
      .replace(/<[^>]*>/g, ' ')
      .replace(/###\s+Problem Statement\s*/gi, '')
      .replace(/^#+\s+/gm, '')
      .replace(/\*\*/g, '')
      .replace(/`+/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    if (cleaned.length > 220) {
      return cleaned.slice(0, 220) + '...';
    }
    return cleaned;
  };

  return (
    <>
      {/* Back Link & Breadcrumb Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Button
          component={Link}
          href="/superadmin/problems"
          variant="outlined"
          size="small"
          startIcon={<FluidArrowLeft size={18} />}
          sx={{
            borderRadius: '9999px',
            textTransform: 'none',
            fontWeight: 700,
            color: '#475569',
            borderColor: '#E2E8F0',
            bgcolor: '#FFFFFF',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
            '&:hover': { bgcolor: '#F1F5F9', borderColor: '#CBD5E1' },
          }}
        >
          Back to Problems Directory
        </Button>
        <Typography sx={{ color: '#94A3B8', fontSize: '0.85rem' }}>/</Typography>
        <Typography sx={{ color: '#64748B', fontWeight: 600, fontSize: '0.85rem' }}>{problem.code}</Typography>
      </Box>

      {/* Hero Card with Key Problem Metrics */}
      <Card
        elevation={0}
        sx={{
          borderRadius: '24px',
          bgcolor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          p: { xs: 2.5, sm: 3.5 },
          mb: 3.5,
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.03)',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, justifyContent: 'space-between', gap: 3 }}>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mb: 1.5 }}>
              <Chip
                label={problem.code}
                size="small"
                className="ide-code-font"
                sx={{
                  bgcolor: '#FAF5FF',
                  color: '#0B1F3A',
                  fontWeight: 800,
                  fontFamily: 'Menlo, Monaco, Consolas, "Liberation Mono", monospace !important',
                  fontSize: '0.82rem',
                  border: '1px solid #FAF5FF',
                  borderRadius: '8px',
                }}
              />
              <Chip
                label={problem.difficulty}
                size="small"
                sx={{
                  bgcolor: difficultyColors.bg,
                  color: difficultyColors.color,
                  border: `1px solid ${difficultyColors.border}`,
                  fontWeight: 800,
                  fontSize: '0.78rem',
                  borderRadius: '8px',
                }}
              />
              <Chip
                label={problem.status}
                size="small"
                sx={{
                  bgcolor: problem.status === 'Published' ? '#F0FDF4' : '#F8FAFC',
                  color: problem.status === 'Published' ? '#16A34A' : '#64748B',
                  border: `1px solid ${problem.status === 'Published' ? '#BBF7D0' : '#E2E8F0'}`,
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  borderRadius: '8px',
                }}
              />
              <Chip
                label={problem.category}
                size="small"
                sx={{
                  bgcolor: '#F8FAFC',
                  color: '#475569',
                  border: '1px solid #E2E8F0',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  borderRadius: '8px',
                }}
              />
            </Box>

            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', fontSize: { xs: '1.4rem', sm: '1.75rem' }, mb: 1.25 }}>
              {problem.title}
            </Typography>

            {/* Clean Problem Description with Markdown/HTML Formatting & View More / View Less */}
            <Box sx={{ mb: 2.5, maxWidth: 880 }}>
              {isHeaderExpanded ? (
                <Box
                  sx={{
                    p: 2.5,
                    bgcolor: '#F8FAFC',
                    borderRadius: '16px',
                    border: '1px solid #E2E8F0',
                  }}
                >
                  <ProblemStatementDisplay content={problem.statementMarkdown} />
                  <Box sx={{ mt: 1.5 }}>
                    <Button
                      size="small"
                      onClick={onToggleHeaderExpand}
                      sx={{
                        textTransform: 'none',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        color: '#0B1F3A',
                        p: 0,
                        minWidth: 'auto',
                        '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
                      }}
                    >
                      Show Less ▲
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1 }}>
                  <Typography sx={{ color: '#475569', fontSize: '0.92rem', lineHeight: 1.6 }}>
                    {cleanStatementPreview(problem.statementMarkdown)}
                  </Typography>
                  <Button
                    size="small"
                    onClick={onToggleHeaderExpand}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      color: '#0B1F3A',
                      p: 0,
                      minWidth: 'auto',
                      alignSelf: 'center',
                      '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
                    }}
                  >
                    View More ▼
                  </Button>
                </Box>
              )}
            </Box>

            {/* Badges bar */}
            <Box sx={{ display: 'flex', gap: 2.5, flexWrap: 'wrap', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TimerRoundedIcon sx={{ fontSize: 18, color: '#64748B' }} />
                <Typography sx={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>
                  {problem.timeLimitMs} ms Time Limit
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MemoryRoundedIcon sx={{ fontSize: 18, color: '#64748B' }} />
                <Typography sx={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>
                  {problem.memoryLimitMb} MB RAM
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CodeRoundedIcon sx={{ fontSize: 18, color: '#0B1F3A' }} />
                <Typography sx={{ fontSize: '0.85rem', color: '#0F172A', fontWeight: 700 }}>
                  {problem.points || (problem.difficulty === 'Easy' ? 100 : problem.difficulty === 'Hard' ? 350 : 200)} Points
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Right Action buttons */}
          <Box sx={{ display: 'flex', flexDirection: { xs: 'row', lg: 'column' }, gap: 1.5, justifyContent: 'center' }}>
            {onEditProblem && (
              <Button
                variant="contained"
                startIcon={<EditRoundedIcon sx={{ fontSize: 18 }} />}
                onClick={onEditProblem}
                sx={{
                  bgcolor: '#0B1F3A',
                  backgroundImage: 'linear-gradient(135deg, #0B1F3A 0%, #5B2D90 100%)',
                  borderRadius: '9999px',
                  px: 2.5,
                  py: 1,
                  fontWeight: 700,
                  textTransform: 'none',
                  fontSize: '0.88rem',
                  boxShadow: '0 4px 14px rgba(91, 45, 144, 0.3)',
                  '&:hover': { bgcolor: '#17366E' },
                }}
              >
                Edit Problem
              </Button>
            )}
            <Button
              variant="outlined"
              startIcon={<AddRoundedIcon sx={{ fontSize: 18 }} />}
              onClick={onAddTestCase}
              sx={{
                borderRadius: '9999px',
                borderColor: '#0B1F3A',
                color: '#0B1F3A',
                bgcolor: '#FAF5FF',
                fontWeight: 700,
                textTransform: 'none',
                fontSize: '0.88rem',
                '&:hover': { bgcolor: '#E9D5FF', borderColor: '#17366E' },
              }}
            >
              Add Test Case
            </Button>
            <Button
              variant="outlined"
              startIcon={<ContentCopyRoundedIcon sx={{ fontSize: 18 }} />}
              onClick={onCopyMarkdown}
              sx={{
                borderRadius: '9999px',
                borderColor: '#CBD5E1',
                color: '#475569',
                fontWeight: 700,
                textTransform: 'none',
                fontSize: '0.88rem',
                '&:hover': { bgcolor: '#F8FAFC', borderColor: '#94A3B8' },
              }}
            >
              Copy Markdown
            </Button>
          </Box>
        </Box>
      </Card>
    </>
  );
}
