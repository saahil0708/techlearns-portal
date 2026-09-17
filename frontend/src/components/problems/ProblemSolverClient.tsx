'use client';

import React, { useState, useEffect } from 'react';
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
  ToggleButtonGroup,
  ToggleButton,
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
import VerticalSplitRoundedIcon from '@mui/icons-material/VerticalSplitRounded';
import ViewSidebarRoundedIcon from '@mui/icons-material/ViewSidebarRounded';
import FullscreenRoundedIcon from '@mui/icons-material/FullscreenRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';

import StudentAppLayout from '@/components/students/layout/StudentAppLayout';
import CodeEditorWorkspace from '@/components/editor/CodeEditorWorkspace';
import { ProblemEntity } from '@/types/problem';
import { useToast } from '@/context/ToastContext';
import { apiService } from '@/lib/api-service';

interface ProblemSolverClientProps {
  problem: ProblemEntity;
}

export type WorkspaceLayoutMode = 'split' | 'wide' | 'focus';

/**
 * Parses inline markdown tokens: `code` and **bold**
 */
function renderInlineMarkdown(text: string) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <Box
          component="span"
          key={idx}
          sx={{
            bgcolor: '#F1F5F9',
            color: '#0F172A',
            fontFamily: 'Menlo, Monaco, "Courier New", monospace',
            fontSize: '0.82em',
            px: 0.7,
            py: 0.15,
            borderRadius: '4px',
            border: '1px solid #E2E8F0',
            fontWeight: 600,
          }}
        >
          {part.slice(1, -1)}
        </Box>
      );
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={idx} style={{ color: '#0F172A', fontWeight: 700 }}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

/**
 * Shared mapping helper for submission verdicts across polling and history
 */
export function mapSubmissionVerdict(rawVerdict: string | undefined | null): string {
  if (!rawVerdict) return 'Evaluating';
  const rawV = String(rawVerdict).toUpperCase();
  if (rawV.includes('ACCEPT') || rawV === 'ACCEPTED' || rawV === 'AC') {
    return 'Accepted';
  } else if (rawV.includes('MEMORY') || rawV === 'MLE') {
    return 'Memory Limit Exceeded';
  } else if (rawV.includes('RUNTIME') || rawV === 'RE') {
    return 'Runtime Error';
  } else if (rawV.includes('COMPIL') || rawV === 'CE') {
    return 'Compilation Error';
  } else if (rawV.includes('SYSTEM') || rawV === 'SE') {
    return 'System Error';
  } else if (rawV.includes('TIME') || rawV.includes('LIMIT') || rawV === 'TLE') {
    return 'Time Limit Exceeded';
  } else if (rawV.includes('PENDING') || rawV.includes('QUEUE') || rawV.includes('PROCESSING')) {
    return 'Evaluating';
  } else {
    return 'Wrong Answer';
  }
}

/**
 * Clean block markdown renderer for problem statements
 */
function RenderMarkdownBlocks({ content }: { content: string }) {
  if (!content) {
    return (
      <Typography sx={{ color: '#64748B', fontSize: '0.9rem' }}>
        No detailed statement authored for this problem. Solve according to algorithmic constraints.
      </Typography>
    );
  }

  const blocks = content.split(/\n\s*\n/);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.8 }}>
      {blocks.map((block, bIdx) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        if (trimmed === '---' || trimmed === '***') {
          return <Divider key={bIdx} sx={{ my: 0.5, borderColor: '#F1F5F9' }} />;
        }

        if (trimmed.startsWith('### ')) {
          return (
            <Typography
              key={bIdx}
              sx={{
                fontWeight: 800,
                color: '#0F172A',
                fontSize: '1rem',
                letterSpacing: '-0.01em',
                mt: bIdx > 0 ? 1 : 0,
                borderLeft: '3px solid #2563EB',
                pl: 1.2,
              }}
            >
              {trimmed.replace(/^###\s+/, '')}
            </Typography>
          );
        }

        if (trimmed.startsWith('## ')) {
          return (
            <Typography
              key={bIdx}
              sx={{
                fontWeight: 800,
                color: '#0F172A',
                fontSize: '1.1rem',
                letterSpacing: '-0.01em',
                mt: bIdx > 0 ? 1.5 : 0,
              }}
            >
              {trimmed.replace(/^##\s+/, '')}
            </Typography>
          );
        }

        if (trimmed.includes('\n- ') || trimmed.startsWith('- ') || trimmed.includes('\n* ') || trimmed.startsWith('* ')) {
          const allLines = trimmed.split('\n');
          const nonBulletLines: string[] = [];
          const bulletLines: string[] = [];

          let hasStartedBullets = false;
          for (const line of allLines) {
            const lineTrim = line.trim();
            if (lineTrim.startsWith('- ') || lineTrim.startsWith('* ')) {
              hasStartedBullets = true;
              bulletLines.push(lineTrim);
            } else if (!hasStartedBullets && lineTrim.length > 0) {
              nonBulletLines.push(lineTrim);
            } else if (hasStartedBullets && lineTrim.length > 0) {
              bulletLines.push(lineTrim);
            }
          }

          return (
            <Box key={bIdx} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {nonBulletLines.length > 0 && (
                <Typography sx={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.7 }}>
                  {renderInlineMarkdown(nonBulletLines.join(' '))}
                </Typography>
              )}
              {bulletLines.length > 0 && (
                <Box
                  component="ul"
                  sx={{
                    pl: 2.5,
                    m: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0.6,
                    color: '#334155',
                    fontSize: '0.88rem',
                  }}
                >
                  {bulletLines.map((line, lIdx) => (
                    <li key={lIdx}>
                      <Typography component="span" sx={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.6 }}>
                        {renderInlineMarkdown(line.replace(/^[-*]\s+/, ''))}
                      </Typography>
                    </li>
                  ))}
                </Box>
              )}
            </Box>
          );
        }

        return (
          <Typography
            key={bIdx}
            sx={{
              fontSize: '0.9rem',
              color: '#334155',
              lineHeight: 1.7,
            }}
          >
            {renderInlineMarkdown(trimmed)}
          </Typography>
        );
      })}
    </Box>
  );
}

export default function ProblemSolverClient({ problem }: ProblemSolverClientProps) {
  const router = useRouter();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<number>(0);
  const [liked, setLiked] = useState<boolean>(false);
  const [likesCount, setLikesCount] = useState<number>(problem.likes);

  // Layout mode: 'split' (50/50), 'wide' (35/65), 'focus' (100% IDE)
  const [layoutMode, setLayoutMode] = useState<WorkspaceLayoutMode>('split');

  // Submission history
  const [submissions, setSubmissions] = useState<Array<{
    id: string;
    verdict: string;
    runtime: string;
    memory: string;
    language: string;
    timestamp: string;
  }>>([]);

  // Load live problem submission history
  useEffect(() => {
    let isMounted = true;
    async function loadSubmissions() {
      try {
        const res = await apiService.getSubmissions({ problemId: problem.id, limit: 10 });
        if (isMounted && Array.isArray(res?.items)) {
          const mapped = res.items.map((sub: any) => ({
            id: sub.id,
            verdict: mapSubmissionVerdict(sub.verdict),
            runtime: sub.runtime ? `${sub.runtime} ms` : '—',
            memory: sub.memory ? `${sub.memory} MB` : '—',
            language: sub.language || 'PYTHON',
            timestamp: new Date(sub.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }));
          setSubmissions(mapped);
        }
      } catch {
        // Retain empty submissions
      }
    }
    if (problem?.id) {
      loadSubmissions();
    }
    return () => {
      isMounted = false;
    };
  }, [problem.id]);

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
    toast.info('Submitting code to judge execution sandbox...', 'Evaluating');

    try {
      const rawLang = lang.toUpperCase();
      const normalizedLang = rawLang.includes('PYTHON')
        ? 'PYTHON'
        : rawLang.includes('CPP') || rawLang.includes('C++')
        ? 'CPP'
        : rawLang.includes('JAVA')
        ? 'JAVA'
        : 'JAVASCRIPT';

      const submissionResult = await apiService.submitCode({
        problemId: problem.id,
        language: normalizedLang,
        sourceCode: code,
      });

      if (submissionResult?.id) {
        // Poll evaluation result from BullMQ worker with increasing delay (~45s budget)
        let pollCount = 0;
        let isEvaluated = false;
        let finalVerdict = 'Evaluating';
        let subDetails: any = null;
        let delayMs = 1000;
        let totalElapsedMs = 0;
        const maxBudgetMs = 45000;

        while (totalElapsedMs < maxBudgetMs) {
          await new Promise((resolve) => setTimeout(resolve, delayMs));
          totalElapsedMs += delayMs;
          pollCount++;
          delayMs = Math.min(delayMs + 300, 3000);

          try {
            subDetails = await apiService.getSubmissionById(submissionResult.id);
            if (
              subDetails &&
              (subDetails.status === 'COMPLETED' ||
                subDetails.status === 'FAILED' ||
                subDetails.status === 'EVALUATED' ||
                (subDetails.verdict && subDetails.verdict !== 'PENDING' && subDetails.verdict !== 'IN_QUEUE'))
            ) {
              isEvaluated = true;
              finalVerdict = mapSubmissionVerdict(subDetails.verdict);
              break;
            }
          } catch {
            // Continue polling
          }
        }

        if (!isEvaluated) {
          toast.warning(
            'Submission is still being processed in sandbox queue. Check submissions tab shortly.',
            'Evaluation Pending',
          );
          return;
        }

        const newSub = {
          id: submissionResult.id,
          verdict: finalVerdict,
          runtime: subDetails?.runtime ? `${subDetails.runtime} ms` : '—',
          memory: subDetails?.memory ? `${subDetails.memory} MB` : '—',
          language: lang.toUpperCase(),
          timestamp: 'Just now',
        };
        setSubmissions((prev) => [newSub, ...prev]);

        if (finalVerdict === 'Accepted') {
          toast.success(`All ${subDetails?.totalTestCases || 5} testcases passed! +${problem.points} Points`, 'Accepted 🎉');
        } else if (finalVerdict === 'Wrong Answer') {
          const detail =
            subDetails?.errorMessage ||
            `Passed ${subDetails?.passedTestCases || 0}/${subDetails?.totalTestCases || 0} testcases`;
          toast.error(detail, 'Wrong Answer ❌');
        } else if (finalVerdict === 'Runtime Error') {
          toast.error(
            subDetails?.errorMessage ? subDetails.errorMessage.slice(0, 120) : 'Runtime Error occurred during execution',
            'Runtime Error ⚠️',
          );
        } else if (finalVerdict === 'Compilation Error') {
          toast.error(
            subDetails?.errorMessage ? subDetails.errorMessage.slice(0, 120) : 'Compilation failed',
            'Compilation Error ⚠️',
          );
        } else if (finalVerdict === 'Time Limit Exceeded') {
          toast.warning(`Execution exceeded time limit (${problem.timeLimitMs || 2000}ms)`, 'Time Limit Exceeded ⏱️');
        } else {
          toast.warning(`Submission verdict: ${finalVerdict}`, 'Evaluation Result');
        }
        return;
      }
    } catch (err: any) {
      console.warn('Judge API submission error:', err);
      toast.error(err?.message || 'Failed to submit code to judge sandbox.', 'Submission Failed');
    }
  };

  return (
    <StudentAppLayout streakDays={48} contestRating={2380} ratingTier="Master">
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* ========================================================================= */}
        {/* TOP BREADCRUMB & WORKSPACE LAYOUT CONTROLS */}
        {/* ========================================================================= */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
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

          {/* Controls: Layout Switcher + Social & Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            {/* Layout Mode Segmented Control */}
            <ToggleButtonGroup
              value={layoutMode}
              exclusive
              onChange={(_, next) => next && setLayoutMode(next)}
              size="small"
              sx={{
                bgcolor: '#FFFFFF',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                height: 32,
                '& .MuiToggleButton-root': {
                  border: 'none',
                  px: 1.2,
                  py: 0.4,
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  textTransform: 'none',
                  color: '#64748B',
                  '&.Mui-selected': {
                    bgcolor: 'rgba(37, 99, 235, 0.12)',
                    color: '#2563EB',
                  },
                },
              }}
            >
              <ToggleButton value="split">
                <Tooltip title="Split View (Balanced)" arrow>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <VerticalSplitRoundedIcon sx={{ fontSize: 15 }} />
                    <span>Split</span>
                  </Box>
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="wide">
                <Tooltip title="Wide IDE (Expanded Code Editor)" arrow>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <ViewSidebarRoundedIcon sx={{ fontSize: 15 }} />
                    <span>Wide IDE</span>
                  </Box>
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="focus">
                <Tooltip title="Focus IDE (Full Width Code Editor)" arrow>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <FullscreenRoundedIcon sx={{ fontSize: 15 }} />
                    <span>Focus</span>
                  </Box>
                </Tooltip>
              </ToggleButton>
            </ToggleButtonGroup>

            {/* Social / Likes */}
            <Button
              variant="outlined"
              size="small"
              startIcon={liked ? <ThumbUpRoundedIcon sx={{ color: '#2563EB' }} /> : <ThumbUpOutlinedIcon />}
              onClick={handleToggleLike}
              sx={{
                borderRadius: '8px',
                borderColor: '#CBD5E1',
                color: liked ? '#2563EB' : '#475569',
                bgcolor: liked ? 'rgba(37, 99, 235, 0.08)' : '#FFFFFF',
                fontWeight: 700,
                fontSize: '0.8rem',
                textTransform: 'none',
                height: 32,
                px: 1.5,
                '&:hover': { bgcolor: liked ? 'rgba(37, 99, 235, 0.15)' : '#F8FAFC' },
              }}
            >
              {likesCount}
            </Button>

            <Tooltip title="Bookmark Problem" arrow>
              <IconButton size="small" sx={{ color: '#64748B' }}>
                <BookmarkBorderRoundedIcon sx={{ fontSize: 18 }} />
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
            gridTemplateColumns:
              layoutMode === 'focus'
                ? '1fr'
                : layoutMode === 'wide'
                ? { xs: '1fr', xl: '0.55fr 1.45fr' }
                : { xs: '1fr', xl: '0.85fr 1.15fr' },
            gap: 2.5,
            alignItems: 'start',
          }}
        >
          {/* ========================================================================= */}
          {/* LEFT PANE: Tabbed Problem Statement, Testcases, Submissions */}
          {/* ========================================================================= */}
          {layoutMode !== 'focus' && (
            <Card
              sx={{
                borderRadius: '16px',
                bgcolor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                minHeight: 680,
                maxHeight: 760,
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

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: '0.78rem', color: '#64748B', flexWrap: 'wrap' }}>
                      <span>Category: <strong style={{ color: '#0F172A' }}>{problem.category}</strong></span>
                      <span>Acceptance: <strong style={{ color: '#0F172A' }}>{problem.acceptanceRate}%</strong></span>
                      <span>Time Limit: <strong style={{ color: '#0F172A' }}>{problem.timeLimitMs}ms</strong></span>
                    </Box>
                  </Box>

                  <Divider sx={{ borderColor: '#F1F5F9' }} />

                  {/* Formatted Markdown Description */}
                  <Box sx={{ color: '#334155' }}>
                    <RenderMarkdownBlocks content={problem.statementMarkdown} />
                  </Box>

                  {/* Example Test Cases */}
                  {problem.sampleTestCases && problem.sampleTestCases.length > 0 && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
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
                                fontFamily: 'Menlo, Monaco, "Courier New", monospace',
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
                                fontFamily: 'Menlo, Monaco, "Courier New", monospace',
                                fontSize: '0.84rem',
                                color: '#0F172A',
                                whiteSpace: 'pre-wrap',
                              }}
                            >
                              {sample.output}
                            </Box>
                          </Box>

                          {/* Explanation */}
                          {sample.explanation && (
                            <Box>
                              <Typography sx={{ fontSize: '0.76rem', fontWeight: 700, color: '#64748B', mb: 0.5 }}>
                                Explanation:
                              </Typography>
                              <Typography sx={{ fontSize: '0.82rem', color: '#475569' }}>
                                {sample.explanation}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      ))}
                    </Box>
                  )}

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
                  {submissions.length === 0 ? (
                    <Box sx={{ py: 6, textAlign: 'center', color: '#94A3B8' }}>
                      <HistoryRoundedIcon sx={{ fontSize: 40, mb: 1, color: '#CBD5E1' }} />
                      <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#475569' }}>
                        No submissions yet
                      </Typography>
                      <Typography sx={{ fontSize: '0.8rem', color: '#94A3B8', mt: 0.5 }}>
                        Write your solution in the code editor and submit to see live judge verdicts here.
                      </Typography>
                    </Box>
                  ) : (
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
                                  ) : sub.verdict === 'Evaluating' ? (
                                    <TimerOutlinedIcon sx={{ fontSize: 16, color: '#2563EB' }} />
                                  ) : (
                                    <ErrorOutlineRoundedIcon sx={{ fontSize: 16, color: '#DC2626' }} />
                                  )}
                                  <Typography
                                    sx={{
                                      fontWeight: 800,
                                      fontSize: '0.84rem',
                                      color:
                                        sub.verdict === 'Accepted'
                                          ? '#16A34A'
                                          : sub.verdict === 'Evaluating'
                                          ? '#2563EB'
                                          : '#DC2626',
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
                  )}
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
                    <Typography sx={{ color: '#64748B', fontSize: '0.88rem' }}>
                      No hints authored for this problem yet. Break down the inputs into edge cases and analyze time/memory constraints.
                    </Typography>
                  )}
                </Box>
              )}
            </Card>
          )}

          {/* ========================================================================= */}
          {/* RIGHT PANE: Full-Width Professional Monaco Code Editor Workspace */}
          {/* ========================================================================= */}
          <Box sx={{ width: '100%', position: 'relative' }}>
            {layoutMode === 'focus' && (
              <Box sx={{ mb: 1, display: 'flex', justifyContent: 'flex-start' }}>
                <Button
                  size="small"
                  startIcon={<VisibilityRoundedIcon sx={{ fontSize: 16 }} />}
                  onClick={() => setLayoutMode('split')}
                  sx={{
                    bgcolor: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    color: '#2563EB',
                    fontWeight: 700,
                    textTransform: 'none',
                    fontSize: '0.78rem',
                    borderRadius: '6px',
                    px: 1.5,
                    '&:hover': { bgcolor: '#F8FAFC' },
                  }}
                >
                  Show Problem Description
                </Button>
              </Box>
            )}

            <CodeEditorWorkspace
              initialLanguage="python"
              problemTitle={problem.title}
              sampleTestCases={problem.sampleTestCases}
              onSubmit={(code, lang) => handleSubmitProblem(code, lang)}
            />
          </Box>
        </Box>
      </Box>
    </StudentAppLayout>
  );
}
