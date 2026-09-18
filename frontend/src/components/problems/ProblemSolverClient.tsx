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

import { FluidArrowLeft } from '@/utils/fluid_arrow';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ThumbUpRoundedIcon from '@mui/icons-material/ThumbUpRounded';
import ThumbDownOutlinedIcon from '@mui/icons-material/ThumbDownOutlined';
import BookmarkBorderRoundedIcon from '@mui/icons-material/BookmarkBorderRounded';
import BookmarkRoundedIcon from '@mui/icons-material/BookmarkRounded';
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
import LoadingScreen from '@/components/ui/LoadingScreen';

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
  const [bookmarked, setBookmarked] = useState<boolean>(false);

  // Layout mode: 'split' (50/50), 'wide' (35/65), 'focus' (100% IDE)
  const [layoutMode, setLayoutMode] = useState<WorkspaceLayoutMode>('split');

  // Submission history & loading states
  const [submissions, setSubmissions] = useState<Array<{
    id: string;
    verdict: string;
    runtime: string;
    memory: string;
    language: string;
    timestamp: string;
  }>>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState<boolean>(true);
  const [submissionsError, setSubmissionsError] = useState<string | null>(null);

  // Restore bookmarked state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`bookmark_prob_${problem.id}`);
      if (saved === 'true') setBookmarked(true);
    } catch {}
  }, [problem.id]);

  const handleToggleBookmark = () => {
    setBookmarked((prev) => {
      const next = !prev;
      try {
        if (next) {
          localStorage.setItem(`bookmark_prob_${problem.id}`, 'true');
          toast.success('Problem bookmarked successfully!', 'Bookmarked');
        } else {
          localStorage.removeItem(`bookmark_prob_${problem.id}`);
          toast.info('Bookmark removed.', 'Unbookmarked');
        }
      } catch {}
      return next;
    });
  };

  // Load live problem submission history
  const loadSubmissions = async () => {
    setSubmissionsLoading(true);
    setSubmissionsError(null);
    try {
      const res = await apiService.getSubmissions({ problemId: problem.id, limit: 10 });
      if (Array.isArray(res?.items)) {
        const mapped = res.items.map((sub: any) => ({
          id: sub.id,
          verdict: mapSubmissionVerdict(sub.verdict),
          runtime: sub.runtime ? `${sub.runtime} ms` : '—',
          memory: sub.memory ? `${sub.memory} MB` : '—',
          language: sub.language || 'PYTHON',
          timestamp: new Date(sub.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }));
        setSubmissions(mapped);
      } else {
        setSubmissions([]);
      }
    } catch (err: any) {
      setSubmissionsError(err?.message || 'Failed to load submissions history.');
    } finally {
      setSubmissionsLoading(false);
    }
  };

  useEffect(() => {
    if (problem?.id) {
      loadSubmissions();
    }
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
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#F8FAFC',
        backgroundImage: `
          radial-gradient(ellipse at 15% 10%, rgba(37, 99, 235, 0.04) 0%, transparent 45%),
          radial-gradient(ellipse at 85% 20%, rgba(37, 99, 235, 0.03) 0%, transparent 45%)
        `,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ========================================================================= */}
      {/* 1. TOP DEDICATED HEADER: Back Arrow, Breadcrumb, Layout & Actions */}
      {/* ========================================================================= */}
      <Box
        component="header"
        sx={{
          height: 56,
          bgcolor: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          px: { xs: 1.5, sm: 2.5 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          gap: 1.5,
          zIndex: 10,
        }}
      >
        {/* Left: Prominent Back Arrow Button & Problem Identity */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.8, sm: 1.2 }, minWidth: 0, flexShrink: 1, overflow: 'hidden' }}>
          <Tooltip title="Back to Problem Archive" arrow>
            <IconButton
              size="small"
              onClick={() => router.push('/problems')}
              sx={{
                color: '#475569',
                bgcolor: '#F1F5F9',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                p: { xs: 0.6, sm: 0.8 },
                flexShrink: 0,
                '&:hover': {
                  bgcolor: '#E2E8F0',
                  color: '#0F172A',
                  borderColor: '#CBD5E1',
                },
              }}
            >
              <FluidArrowLeft size={18} />
            </IconButton>
          </Tooltip>

          <Button
            size="small"
            onClick={() => router.push('/problems')}
            sx={{
              color: '#64748B',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.84rem',
              display: { xs: 'none', md: 'inline-flex' },
              flexShrink: 0,
              '&:hover': { color: '#0F172A', bgcolor: 'transparent' },
            }}
          >
            Problems
          </Button>

          <Typography sx={{ color: '#CBD5E1', fontSize: '0.84rem', display: { xs: 'none', md: 'inline' } }}>/</Typography>

          <Chip
            label={problem.code}
            size="small"
            sx={{
              fontFamily: 'monospace',
              fontWeight: 800,
              fontSize: '0.72rem',
              bgcolor: 'rgba(37, 99, 235, 0.08)',
              color: '#2563EB',
              border: '1px solid rgba(37, 99, 235, 0.2)',
              borderRadius: '6px',
              flexShrink: 0,
            }}
          />

          <Typography
            noWrap
            sx={{
              fontWeight: 800,
              fontSize: { xs: '0.82rem', sm: '0.94rem' },
              color: '#0F172A',
              letterSpacing: '-0.01em',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: { xs: 120, sm: 220, md: 400 },
            }}
          >
            {problem.title}
          </Typography>

          <Chip
            label={problem.difficulty}
            size="small"
            sx={{
              fontWeight: 800,
              fontSize: '0.72rem',
              height: 22,
              borderRadius: '5px',
              flexShrink: 0,
              display: { xs: 'none', sm: 'inline-flex' },
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
              border: `1px solid ${
                problem.difficulty === 'Easy'
                  ? 'rgba(22, 163, 74, 0.25)'
                  : problem.difficulty === 'Medium'
                  ? 'rgba(217, 119, 6, 0.25)'
                  : 'rgba(220, 38, 38, 0.25)'
              }`,
            }}
          />
        </Box>

        {/* Right: Layout Switcher + Social & Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.6, sm: 1.2 }, flexShrink: 0 }}>
          {/* Layout Mode Segmented Control */}
          <ToggleButtonGroup
            value={layoutMode}
            exclusive
            onChange={(_, next) => next && setLayoutMode(next)}
            size="small"
            sx={{
              bgcolor: '#F8FAFC',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              height: 32,
              '& .MuiToggleButton-root': {
                border: 'none',
                px: { xs: 0.8, sm: 1.2 },
                py: 0.4,
                fontSize: '0.74rem',
                fontWeight: 700,
                textTransform: 'none',
                color: '#64748B',
                '&.Mui-selected': {
                  bgcolor: 'rgba(37, 99, 235, 0.12)',
                  color: '#2563EB',
                },
                '&:hover': {
                  bgcolor: '#F1F5F9',
                  color: '#0F172A',
                },
              },
            }}
          >
            <ToggleButton value="split">
              <Tooltip title="Split View (Balanced)" arrow>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <VerticalSplitRoundedIcon sx={{ fontSize: 15 }} />
                  <span style={{ display: 'none' }} className="sm-inline">Split</span>
                </Box>
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="wide">
              <Tooltip title="Wide IDE (Expanded Code Editor)" arrow>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <ViewSidebarRoundedIcon sx={{ fontSize: 15 }} />
                  <span style={{ display: 'none' }} className="sm-inline">Wide IDE</span>
                </Box>
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="focus">
              <Tooltip title="Focus IDE (Full Width Code Editor)" arrow>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <FullscreenRoundedIcon sx={{ fontSize: 15 }} />
                  <span style={{ display: 'none' }} className="sm-inline">Focus</span>
                </Box>
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>

          {/* Social / Likes */}
          <Button
            variant="outlined"
            size="small"
            startIcon={liked ? <ThumbUpRoundedIcon sx={{ color: '#2563EB', fontSize: 16 }} /> : <ThumbUpOutlinedIcon sx={{ fontSize: 16 }} />}
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
              px: { xs: 0.8, sm: 1.2 },
              minWidth: 0,
              '&:hover': { bgcolor: liked ? 'rgba(37, 99, 235, 0.15)' : '#F8FAFC' },
            }}
          >
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>{likesCount}</Box>
          </Button>

          {/* Bookmark Button (Connected to state & persistence) */}
          <Tooltip title={bookmarked ? 'Remove Bookmark' : 'Bookmark Problem'} arrow>
            <IconButton
              size="small"
              onClick={handleToggleBookmark}
              sx={{
                color: bookmarked ? '#2563EB' : '#64748B',
                bgcolor: bookmarked ? 'rgba(37, 99, 235, 0.08)' : '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                height: 32,
                width: 32,
                display: { xs: 'none', sm: 'inline-flex' },
                '&:hover': { bgcolor: bookmarked ? 'rgba(37, 99, 235, 0.15)' : '#F8FAFC', color: bookmarked ? '#1D4ED8' : '#0F172A' },
              }}
            >
              {bookmarked ? (
                <BookmarkRoundedIcon sx={{ fontSize: 17, color: '#2563EB' }} />
              ) : (
                <BookmarkBorderRoundedIcon sx={{ fontSize: 17 }} />
              )}
            </IconButton>
          </Tooltip>

          {/* Share Button */}
          <Tooltip title="Share Problem URL" arrow>
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
              sx={{
                color: '#64748B',
                bgcolor: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                height: 32,
                width: 32,
                display: { xs: 'none', sm: 'inline-flex' },
                '&:hover': { bgcolor: '#F8FAFC', color: '#0F172A' },
              }}
            >
              <ShareRoundedIcon sx={{ fontSize: 17 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* ========================================================================= */}
      {/* 2. FULL-SCREEN SPLIT WORKSPACE */}
      {/* ========================================================================= */}
      <Box
        sx={{
          flex: 1,
          p: { xs: 1, sm: 1.5 },
          display: 'grid',
          gridTemplateColumns:
            layoutMode === 'focus'
              ? '1fr'
              : layoutMode === 'wide'
              ? { xs: '1fr', lg: '0.6fr 1.4fr' }
              : { xs: '1fr', lg: '0.9fr 1.1fr' },
          gap: 1.5,
          alignItems: 'start',
        }}
      >
        {/* ========================================================================= */}
        {/* LEFT PANE: Tabbed Problem Statement, Testcases, Submissions */}
        {/* ========================================================================= */}
        {layoutMode !== 'focus' && (
          <Card
            sx={{
              borderRadius: '14px',
              bgcolor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              minHeight: { xs: 500, lg: 'calc(100vh - 84px)' },
              maxHeight: { xs: 'none', lg: 'calc(100vh - 84px)' },
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
              <Box sx={{ p: { xs: 2, sm: 3 }, display: 'flex', flexDirection: 'column', gap: 2.5, overflowY: 'auto' }}>
                {/* Title & Metadata Pills */}
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
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
                      variant="outlined"
                      sx={{ fontWeight: 700, fontSize: '0.72rem', color: '#64748B', borderColor: '#E2E8F0' }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <Typography sx={{ fontSize: '0.8rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      Category: <strong>{problem.category}</strong>
                    </Typography>
                    <Typography sx={{ fontSize: '0.8rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      Acceptance: <strong>{problem.acceptanceRate}%</strong>
                    </Typography>
                    <Typography sx={{ fontSize: '0.8rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      Time Limit: <strong>{problem.timeLimitMs || 2000}ms</strong>
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ borderColor: '#F1F5F9' }} />

                {/* Markdown Content */}
                <RenderMarkdownBlocks content={problem.statementMarkdown} />

                {/* Interactive Sample Testcase Preview Cards */}
                {problem.sampleTestCases && problem.sampleTestCases.length > 0 && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 1 }}>
                    <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.95rem' }}>
                      Sample Examples
                    </Typography>
                    {problem.sampleTestCases.map((tc, idx) => (
                      <Card
                        key={idx}
                        variant="outlined"
                        sx={{
                          p: 2,
                          bgcolor: '#F8FAFC',
                          borderColor: '#E2E8F0',
                          borderRadius: '10px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 1.2,
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: '#334155' }}>
                            Example {idx + 1}
                          </Typography>
                          <Button
                            size="small"
                            startIcon={<ContentCopyRoundedIcon sx={{ fontSize: 13 }} />}
                            onClick={() => handleCopyInput(tc.input)}
                            sx={{
                              fontSize: '0.72rem',
                              color: '#64748B',
                              textTransform: 'none',
                              py: 0.2,
                              px: 0.8,
                              '&:hover': { color: '#0F172A', bgcolor: '#E2E8F0' },
                            }}
                          >
                            Copy Input
                          </Button>
                        </Box>
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
                          <Box>
                            <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748B', mb: 0.3 }}>
                              INPUT
                            </Typography>
                            <Box
                              component="pre"
                              sx={{
                                m: 0,
                                p: 1,
                                bgcolor: '#0B0F19',
                                color: '#38BDF8',
                                borderRadius: '6px',
                                fontSize: '0.8rem',
                                fontFamily: 'Menlo, monospace',
                                overflowX: 'auto',
                              }}
                            >
                              {tc.input || '(empty)'}
                            </Box>
                          </Box>
                          <Box>
                            <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748B', mb: 0.3 }}>
                              EXPECTED OUTPUT
                            </Typography>
                            <Box
                              component="pre"
                              sx={{
                                m: 0,
                                p: 1,
                                bgcolor: '#0B0F19',
                                color: '#4ADE80',
                                borderRadius: '6px',
                                fontSize: '0.8rem',
                                fontFamily: 'Menlo, monospace',
                                overflowX: 'auto',
                              }}
                            >
                              {tc.output || '(empty)'}
                            </Box>
                          </Box>
                        </Box>
                        {tc.explanation && (
                          <Typography sx={{ fontSize: '0.8rem', color: '#64748B', fontStyle: 'italic', mt: 0.5 }}>
                            <strong>Explanation:</strong> {tc.explanation}
                          </Typography>
                        )}
                      </Card>
                    ))}
                  </Box>
                )}

                {/* Topics / Tags */}
                {problem.tags && problem.tags.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    <Typography sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#94A3B8', mb: 0.8, textTransform: 'uppercase' }}>
                      Related Topics
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap' }}>
                      {problem.tags.map((tag) => (
                        <Chip
                          key={tag}
                          label={tag}
                          size="small"
                          sx={{
                            fontSize: '0.74rem',
                            bgcolor: '#F1F5F9',
                            color: '#475569',
                            fontWeight: 600,
                            borderRadius: '6px',
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            )}

            {/* TAB 1: Submissions History */}
            {activeTab === 1 && (
              <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
                <Typography sx={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>
                  Your Submission History ({submissions.length})
                </Typography>

                {submissionsLoading ? (
                  <LoadingScreen mode="inline" minHeight={180} message="Loading submissions history..." />
                ) : submissionsError ? (
                  <Box sx={{ textAlign: 'center', py: 5, color: '#DC2626', bgcolor: 'rgba(220, 38, 38, 0.04)', borderRadius: '8px', p: 3, border: '1px solid rgba(220, 38, 38, 0.15)' }}>
                    <ErrorOutlineRoundedIcon sx={{ fontSize: 36, color: '#DC2626', mb: 1 }} />
                    <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#DC2626' }}>
                      Failed to load submissions
                    </Typography>
                    <Typography sx={{ fontSize: '0.8rem', color: '#64748B', mt: 0.5, mb: 1.5 }}>
                      {submissionsError}
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={loadSubmissions}
                      sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.78rem' }}
                    >
                      Retry
                    </Button>
                  </Box>
                ) : submissions.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 6, color: '#64748B' }}>
                    <HistoryRoundedIcon sx={{ fontSize: 40, color: '#CBD5E1', mb: 1 }} />
                    <Typography sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
                      No submissions recorded yet for this problem.
                    </Typography>
                    <Typography sx={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                      Write your solution in the editor and click Submit to record your first verdict.
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
              <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
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
                      <AccordionSummary expandIcon={<ExpandMoreRoundedIcon sx={{ fontSize: 18 }} />}>
                        <Typography sx={{ fontSize: '0.86rem', fontWeight: 700, color: '#2563EB' }}>
                          💡 Hint {idx + 1}
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails sx={{ pt: 0, bgcolor: '#F8FAFC' }}>
                        <Typography sx={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.6 }}>
                          {hintText}
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                  ))
                ) : (
                  <Box sx={{ p: 2.5, bgcolor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', textAlign: 'center', py: 4 }}>
                    <Typography sx={{ fontSize: '0.86rem', color: '#64748B' }}>
                      No hints available
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
          </Card>
        )}

        {/* ========================================================================= */}
        {/* RIGHT PANE: Monaco Code Editor Workspace */}
        {/* ========================================================================= */}
        <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0, height: '100%' }}>
          {layoutMode === 'focus' && (
            <Box sx={{ mb: 1, display: 'flex', justifyContent: 'flex-start' }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<VerticalSplitRoundedIcon sx={{ fontSize: 16 }} />}
                onClick={() => setLayoutMode('split')}
                sx={{
                  bgcolor: '#FFFFFF',
                  borderColor: '#CBD5E1',
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
  );
}
