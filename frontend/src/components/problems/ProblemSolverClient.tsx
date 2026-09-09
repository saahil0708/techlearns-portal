'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Card,
  Chip,
  Button,
  Tabs,
  Tab,
  Divider,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

// Icons
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ThumbUpRoundedIcon from '@mui/icons-material/ThumbUpRounded';
import ThumbDownOutlinedIcon from '@mui/icons-material/ThumbDownOutlined';
import BookmarkBorderRoundedIcon from '@mui/icons-material/BookmarkBorderRounded';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';

import StudentAppLayout from '@/components/students/layout/StudentAppLayout';
import CodeEditorWorkspace from '@/components/editor/CodeEditorWorkspace';
import { ProblemEntity } from '@/types/problem';
import { useToast } from '@/context/ToastContext';

interface ProblemSolverClientProps {
  problem: ProblemEntity;
}

export default function ProblemSolverClient({ problem }: ProblemSolverClientProps) {
  const router = useRouter();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<number>(0);
  const [liked, setLiked] = useState<boolean>(false);
  const [likesCount, setLikesCount] = useState<number>(problem.likes);

  // Mock submission history
  const [submissions, setSubmissions] = useState<Array<{
    id: string;
    verdict: 'Accepted' | 'Wrong Answer' | 'Time Limit Exceeded';
    runtime: string;
    memory: string;
    language: string;
    timestamp: string;
  }>>([
    {
      id: 'sub-101',
      verdict: 'Accepted',
      runtime: '38 ms',
      memory: '17.4 MB',
      language: 'Python 3.12',
      timestamp: '2 hours ago',
    },
    {
      id: 'sub-100',
      verdict: 'Wrong Answer',
      runtime: '42 ms',
      memory: '17.2 MB',
      language: 'Python 3.12',
      timestamp: 'Yesterday',
    },
  ]);

  const handleToggleLike = () => {
    if (liked) {
      setLiked(false);
      setLikesCount((prev) => prev - 1);
    } else {
      setLiked(true);
      setLikesCount((prev) => prev + 1);
      toast.success('Added to your liked problems!', 'Liked');
    }
  };

  const handleCopyInput = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Sample testcase copied to clipboard.', 'Copied');
    } catch {
      toast.error('Failed to copy sample testcase to clipboard.', 'Copy Failed');
    }
  };

  const handleSubmitProblem = async (code: string, lang: string) => {
    toast.info('Evaluating against hidden testcase suite...', 'Evaluating');
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const newSub = {
      id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      verdict: 'Accepted' as const,
      runtime: '32 ms',
      memory: '16.8 MB',
      language: lang.toUpperCase(),
      timestamp: 'Just now',
    };
    setSubmissions((prev) => [newSub, ...prev]);
    toast.success('All hidden testcases passed! +100 Points', 'Accepted 🎉');
  };

  return (
    <StudentAppLayout streakDays={48} contestRating={2380} ratingTier="Master">
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* ========================================================================= */}
        {/* TOP BREADCRUMB & QUICK NAV */}
        {/* ========================================================================= */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              size="small"
              startIcon={<ArrowBackRoundedIcon />}
              onClick={() => router.push('/problems')}
              sx={{
                color: '#64748B',
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.84rem',
                '&:hover': { color: '#0F172A', bgcolor: '#E2E8F0' },
              }}
            >
              Problem Archive
            </Button>
            <Typography sx={{ color: '#94A3B8', fontSize: '0.84rem' }}>/</Typography>
            <Typography sx={{ color: '#2563EB', fontWeight: 700, fontSize: '0.84rem', fontFamily: 'monospace' }}>
              {problem.code}
            </Typography>
            <Typography sx={{ color: '#0F172A', fontWeight: 800, fontSize: '0.88rem' }}>
              {problem.title}
            </Typography>
          </Box>

          {/* Social & Bookmarks */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Tooltip title="Like this problem" arrow>
              <IconButton size="small" onClick={handleToggleLike} sx={{ color: liked ? '#2563EB' : '#64748B' }}>
                {liked ? <ThumbUpRoundedIcon sx={{ fontSize: 18 }} /> : <ThumbUpOutlinedIcon sx={{ fontSize: 18 }} />}
              </IconButton>
            </Tooltip>
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748B', mr: 1 }}>
              {likesCount}
            </Typography>

            <Tooltip title="Bookmark Problem" arrow>
              <IconButton size="small" sx={{ color: '#64748B' }}>
                <BookmarkBorderRoundedIcon sx={{ fontSize: 19 }} />
              </IconButton>
            </Tooltip>

            <Tooltip title="Share Problem" arrow>
              <IconButton
                size="small"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(window.location.href);
                    toast.info('Problem URL copied to clipboard.', 'Link Copied');
                  } catch {
                    toast.error('Failed to copy problem URL to clipboard.', 'Copy Failed');
                  }
                }}
                sx={{ color: '#64748B' }}
              >
                <ShareRoundedIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* ========================================================================= */}
        {/* MAIN SPLIT WORKSPACE: Left (Statement & Tabs) | Right (Monaco Editor) */}
        {/* ========================================================================= */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', xl: '0.9fr 1.1fr' },
            gap: 2.5,
            alignItems: 'start',
          }}
        >
          {/* ========================================================================= */}
          {/* LEFT PANE: Tabbed Problem Statement, Testcases, Submissions */}
          {/* ========================================================================= */}
          <Card
            sx={{
              borderRadius: '16px',
              bgcolor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              minHeight: 680,
              overflow: 'hidden',
            }}
          >
            {/* Tabs Header */}
            <Box sx={{ borderBottom: '1px solid #F1F5F9', bgcolor: '#F8FAFC', px: 2 }}>
              <Tabs
                value={activeTab}
                onChange={(_, val) => setActiveTab(val)}
                sx={{
                  minHeight: 46,
                  '& .MuiTab-root': {
                    minHeight: 46,
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    textTransform: 'none',
                    color: '#64748B',
                    '&.Mui-selected': { color: '#2563EB' },
                  },
                  '& .MuiTabs-indicator': { bgcolor: '#2563EB', height: 3, borderRadius: '3px 3px 0 0' },
                }}
              >
                <Tab icon={<DescriptionOutlinedIcon sx={{ fontSize: 17 }} />} iconPosition="start" label="Description" />
                <Tab icon={<HistoryRoundedIcon sx={{ fontSize: 17 }} />} iconPosition="start" label={`Submissions (${submissions.length})`} />
                <Tab icon={<LightbulbOutlinedIcon sx={{ fontSize: 17 }} />} iconPosition="start" label="Hints & Approach" />
              </Tabs>
            </Box>

            {/* TAB 0: Problem Statement */}
            {activeTab === 0 && (
              <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5, overflowY: 'auto' }}>
                {/* Title & Metadata Pills */}
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
                      {problem.title}
                    </Typography>
                    <Chip
                      label={problem.difficulty}
                      size="small"
                      sx={{
                        fontWeight: 800,
                        fontSize: '0.72rem',
                        bgcolor:
                          problem.difficulty === 'Easy'
                            ? 'rgba(22, 163, 74, 0.1)'
                            : problem.difficulty === 'Medium'
                            ? 'rgba(217, 119, 6, 0.1)'
                            : 'rgba(220, 38, 38, 0.1)',
                        color:
                          problem.difficulty === 'Easy'
                            ? '#16A34A'
                            : problem.difficulty === 'Medium'
                            ? '#D97706'
                            : '#DC2626',
                      }}
                    />
                    <Chip
                      label={`${problem.points} Points`}
                      size="small"
                      sx={{ bgcolor: '#F1F5F9', color: '#475569', fontWeight: 700, fontSize: '0.72rem' }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: '0.78rem', color: '#64748B' }}>
                    <span>Category: <strong style={{ color: '#0F172A' }}>{problem.category}</strong></span>
                    <span>Acceptance: <strong style={{ color: '#0F172A' }}>{problem.acceptanceRate}%</strong></span>
                    <span>Time Limit: <strong style={{ color: '#0F172A' }}>{problem.timeLimitMs}ms</strong></span>
                  </Box>
                </Box>

                <Divider sx={{ borderColor: '#F1F5F9' }} />

                {/* Markdown Description */}
                <Box
                  sx={{
                    color: '#334155',
                    fontSize: '0.92rem',
                    lineHeight: 1.7,
                    '& h3': { fontSize: '1rem', fontWeight: 800, color: '#0F172A', mt: 2, mb: 1 },
                    '& code': { bgcolor: '#F1F5F9', px: 0.8, py: 0.2, borderRadius: '4px', fontFamily: 'monospace', color: '#0F172A' },
                  }}
                >
                  <Typography sx={{ whiteSpace: 'pre-line', fontSize: '0.92rem', lineHeight: 1.7 }}>
                    {problem.statementMarkdown}
                  </Typography>
                </Box>

                {/* Example Test Cases */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Typography sx={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>
                    Example Test Cases
                  </Typography>

                  {problem.sampleTestCases.map((sample, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        p: 2,
                        borderRadius: '12px',
                        bgcolor: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1.5,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: '#2563EB' }}>
                          Example {idx + 1}
                        </Typography>
                        <Tooltip title="Copy Input" arrow>
                          <IconButton size="small" onClick={() => handleCopyInput(sample.input)}>
                            <ContentCopyRoundedIcon sx={{ fontSize: 15, color: '#64748B' }} />
                          </IconButton>
                        </Tooltip>
                      </Box>

                      {/* Input Box */}
                      <Box>
                        <Typography sx={{ fontSize: '0.76rem', fontWeight: 700, color: '#64748B', mb: 0.5 }}>
                          Input:
                        </Typography>
                        <Box
                          sx={{
                            p: 1,
                            borderRadius: '6px',
                            bgcolor: '#FFFFFF',
                            border: '1px solid #CBD5E1',
                            fontFamily: 'monospace',
                            fontSize: '0.84rem',
                            color: '#0F172A',
                            whiteSpace: 'pre-wrap',
                          }}
                        >
                          {sample.input}
                        </Box>
                      </Box>

                      {/* Output Box */}
                      <Box>
                        <Typography sx={{ fontSize: '0.76rem', fontWeight: 700, color: '#64748B', mb: 0.5 }}>
                          Output:
                        </Typography>
                        <Box
                          sx={{
                            p: 1,
                            borderRadius: '6px',
                            bgcolor: '#FFFFFF',
                            border: '1px solid #CBD5E1',
                            fontFamily: 'monospace',
                            fontSize: '0.84rem',
                            color: '#16A34A',
                            fontWeight: 700,
                            whiteSpace: 'pre-wrap',
                          }}
                        >
                          {sample.output}
                        </Box>
                      </Box>

                      {/* Explanation */}
                      {sample.explanation && (
                        <Typography sx={{ fontSize: '0.8rem', color: '#64748B', fontStyle: 'italic' }}>
                          <strong>Explanation:</strong> {sample.explanation}
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Box>

                {/* Company Tags */}
                {problem.companies && problem.companies.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748B', mb: 1 }}>
                      COMPANIES THAT ASKED THIS
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap' }}>
                      {problem.companies.map((c) => (
                        <Chip
                          key={c}
                          label={c}
                          size="small"
                          sx={{ bgcolor: '#F1F5F9', color: '#334155', fontWeight: 600, fontSize: '0.74rem' }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            )}

            {/* TAB 1: Submissions History */}
            {activeTab === 1 && (
              <Box sx={{ p: 2 }}>
                <TableContainer>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 800, fontSize: '0.74rem', color: '#64748B' }}>VERDICT</TableCell>
                        <TableCell sx={{ fontWeight: 800, fontSize: '0.74rem', color: '#64748B' }}>LANGUAGE</TableCell>
                        <TableCell sx={{ fontWeight: 800, fontSize: '0.74rem', color: '#64748B' }}>RUNTIME</TableCell>
                        <TableCell sx={{ fontWeight: 800, fontSize: '0.74rem', color: '#64748B' }}>MEMORY</TableCell>
                        <TableCell sx={{ fontWeight: 800, fontSize: '0.74rem', color: '#64748B' }}>TIME</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {submissions.map((sub) => (
                        <TableRow key={sub.id} hover>
                          <TableCell sx={{ py: 1.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {sub.verdict === 'Accepted' ? (
                                <CheckCircleRoundedIcon sx={{ fontSize: 16, color: '#16A34A' }} />
                              ) : (
                                <ErrorOutlineRoundedIcon sx={{ fontSize: 16, color: '#DC2626' }} />
                              )}
                              <Typography
                                sx={{
                                  fontWeight: 800,
                                  fontSize: '0.84rem',
                                  color: sub.verdict === 'Accepted' ? '#16A34A' : '#DC2626',
                                }}
                              >
                                {sub.verdict}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>
                            {sub.language}
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.82rem', color: '#64748B', fontFamily: 'monospace' }}>
                            {sub.runtime}
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.82rem', color: '#64748B', fontFamily: 'monospace' }}>
                            {sub.memory}
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                            {sub.timestamp}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {/* TAB 2: Hints & Editorial */}
            {activeTab === 2 && (
              <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography sx={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>
                  Problem Hints & Editorial Guide
                </Typography>

                {problem.hints && problem.hints.length > 0 ? (
                  problem.hints.map((hintText, idx) => (
                    <Accordion
                      key={idx}
                      sx={{
                        borderRadius: '8px !important',
                        border: '1px solid #E2E8F0',
                        boxShadow: 'none',
                        '&:before': { display: 'none' },
                      }}
                    >
                      <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
                        <Typography sx={{ fontSize: '0.86rem', fontWeight: 700, color: '#2563EB' }}>
                          💡 Hint {idx + 1}: {idx === 0 ? 'Initial Approach & Complexity' : idx === 1 ? 'Optimal Data Structures' : 'Edge Cases & Optimization'}
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography sx={{ fontSize: '0.84rem', color: '#475569' }}>
                          {hintText}
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                  ))
                ) : (
                  <>
                    <Accordion sx={{ borderRadius: '8px !important', border: '1px solid #E2E8F0', boxShadow: 'none', '&:before': { display: 'none' } }}>
                      <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
                        <Typography sx={{ fontSize: '0.86rem', fontWeight: 700, color: '#2563EB' }}>
                          💡 Hint 1: {problem.category} Strategy
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography sx={{ fontSize: '0.84rem', color: '#475569' }}>
                          Consider standard algorithmic paradigms for {problem.category}. Pay attention to constraints (Time Limit: {problem.timeLimitMs}ms, Memory Limit: {problem.memoryLimitMb}MB).
                        </Typography>
                      </AccordionDetails>
                    </Accordion>

                    <Accordion sx={{ borderRadius: '8px !important', border: '1px solid #E2E8F0', boxShadow: 'none', '&:before': { display: 'none' } }}>
                      <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
                        <Typography sx={{ fontSize: '0.86rem', fontWeight: 700, color: '#2563EB' }}>
                          💡 Hint 2: Key Tags & Data Structures
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography sx={{ fontSize: '0.84rem', color: '#475569' }}>
                          Relevant topic techniques for <strong>{problem.title}</strong>: {problem.tags.join(', ')}. Can you optimize brute force complexity using these data structures?
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                  </>
                )}
              </Box>
            )}
          </Card>

          {/* ========================================================================= */}
          {/* RIGHT PANE: Monaco Code Editor Workspace & Live Sandboxed Runner */}
          {/* ========================================================================= */}
          <Box sx={{ width: '100%' }}>
            <CodeEditorWorkspace
              initialLanguage="python"
              problemTitle={`${problem.code}: ${problem.title}`}
              onSubmit={handleSubmitProblem}
            />
          </Box>
        </Box>
      </Box>
    </StudentAppLayout>
  );
}
