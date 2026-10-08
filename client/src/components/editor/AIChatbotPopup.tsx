'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Button,
  Chip,
  Paper,
  CircularProgress,
  Tooltip,
  Fade,
  Avatar,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';
import OpenInFullRoundedIcon from '@mui/icons-material/OpenInFullRounded';
import CloseFullscreenRoundedIcon from '@mui/icons-material/CloseFullscreenRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import LightbulbRoundedIcon from '@mui/icons-material/LightbulbRounded';
import PsychologyRoundedIcon from '@mui/icons-material/PsychologyRounded';
import SpeedRoundedIcon from '@mui/icons-material/SpeedRounded';
import BugReportRoundedIcon from '@mui/icons-material/BugReportRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import ViewInArRoundedIcon from '@mui/icons-material/ViewInArRounded';
import TerminalRoundedIcon from '@mui/icons-material/TerminalRounded';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ThumbUpRoundedIcon from '@mui/icons-material/ThumbUpRounded';
import ThumbDownOutlinedIcon from '@mui/icons-material/ThumbDownOutlined';
import ThumbDownRoundedIcon from '@mui/icons-material/ThumbDownRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';

import { useToast } from '@/context/ToastContext';
import { apiService } from '@/lib/api-service';

export interface AIChatbotPopupProps {
  open: boolean;
  onClose: () => void;
  problem: {
    title: string;
    statement: string;
    difficulty?: string;
    tags?: string[];
  };
  currentCode?: string;
  language?: string;
  lastExecutionVerdict?: string;
  lastFailedTestCase?: {
    input: string;
    expectedOutput: string;
    actualOutput?: string;
  };
}

export type AssistantToolMode = 'explain' | 'hints' | 'complexity' | 'diagnose';

interface RenderBlock {
  type: 'code' | 'text';
  lang?: string;
  code?: string;
  text?: string;
}

function parseAssistantMessage(content: string): RenderBlock[] {
  if (!content) return [];

  // Normalize carriage returns and spaced backticks (` ` ` -> ```)
  let normalized = content
    .replace(/\r\n/g, '\n')
    .replace(/`\s+`\s+`(?:\s*([a-zA-Z0-9_-]+))?/g, (_m, lang) => (lang ? `\`\`\`${lang}\n` : '```\n'))
    .replace(/`\s*`\s*`(?:\s*([a-zA-Z0-9_-]+))?/g, (_m, lang) => (lang ? `\`\`\`${lang}\n` : '```\n'))
    .trim();

  // If the model wrapped the entire response in ```markdown or ```md, unwrap it
  if (/^```(?:markdown|md)?\s*\n([\s\S]*?)\n```$/i.test(normalized)) {
    normalized = normalized.replace(/^```(?:markdown|md)?\s*\n/i, '').replace(/\n```$/i, '').trim();
  }

  // Fix unclosed backtick fences if any
  const fenceMatches = normalized.match(/```/g);
  if (fenceMatches && fenceMatches.length % 2 !== 0) {
    normalized += '\n```';
  }

  // Match fenced code blocks
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\s*\n?([\s\S]*?)```/g;
  const blocks: RenderBlock[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(normalized)) !== null) {
    const textBefore = normalized.slice(lastIndex, match.index);
    if (textBefore.trim()) {
      blocks.push({ type: 'text', text: textBefore });
    }

    const lang = match[1]?.trim().toLowerCase() || 'python';
    const code = match[2]?.trimEnd() || '';
    if (code) {
      if (lang === 'markdown' || lang === 'md' || lang === 'text') {
        blocks.push({ type: 'text', text: code });
      } else {
        blocks.push({ type: 'code', lang, code });
      }
    }

    lastIndex = match.index + match[0].length;
  }

  const remaining = normalized.slice(lastIndex);
  if (remaining.trim()) {
    blocks.push({ type: 'text', text: remaining });
  }

  return blocks;
}

/**
 * Rich dark mode message content renderer with syntax highlighting, tables, equations, and badges
 */
function DarkMessageRenderer({ content }: { content: string }) {
  const toast = useToast();
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = async (code: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedIndex(idx);
      setTimeout(() => setCopiedIndex(null), 2000);
      toast.info('Code snippet copied.', 'Copied');
    } catch {
      toast.error('Failed to copy code.', 'Copy Failed');
    }
  };

  const blocks = useMemo(() => parseAssistantMessage(content), [content]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2, wordBreak: 'break-word', overflowWrap: 'break-word' }}>
      {blocks.map((block, bIdx) => {
        if (block.type === 'code' && block.code) {
          const lang = block.lang || 'python';
          return (
            <Box
              key={bIdx}
              sx={{
                my: 1,
                borderRadius: '14px',
                overflow: 'hidden',
                bgcolor: '#0E1017',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
              }}
            >
              {/* Code Header */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  px: 1.6,
                  py: 0.8,
                  bgcolor: 'rgba(255, 255, 255, 0.03)',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <CodeRoundedIcon sx={{ fontSize: 15, color: '#38BDF8' }} />
                  <Typography
                    sx={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: '#94A3B8',
                      fontFamily: 'monospace',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {lang}
                  </Typography>
                </Box>
                <Button
                  size="small"
                  onClick={() => handleCopy(block.code!, bIdx)}
                  startIcon={
                    copiedIndex === bIdx ? (
                      <CheckRoundedIcon sx={{ fontSize: 13, color: '#4ADE80' }} />
                    ) : (
                      <ContentCopyRoundedIcon sx={{ fontSize: 13 }} />
                    )
                  }
                  sx={{
                    fontSize: '0.68rem',
                    fontWeight: 600,
                    color: copiedIndex === bIdx ? '#4ADE80' : '#94A3B8',
                    textTransform: 'none',
                    py: 0.2,
                    px: 0.8,
                    minWidth: 0,
                    borderRadius: '6px',
                    '&:hover': { color: '#F8FAFC', bgcolor: 'rgba(255,255,255,0.08)' },
                  }}
                >
                  {copiedIndex === bIdx ? 'Copied' : 'Copy'}
                </Button>
              </Box>

              {/* Code Content */}
              <Box
                component="pre"
                sx={{
                  m: 0,
                  p: 1.6,
                  fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                  fontSize: '0.82rem',
                  lineHeight: 1.65,
                  color: '#F1F5F9',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  overflowWrap: 'anywhere',
                }}
              >
                {block.code}
              </Box>
            </Box>
          );
        }

        // Standard Text Block with formatting
        const textContent = block.text || '';
        const lines = textContent.split('\n');

        return (
          <Box key={bIdx} sx={{ display: 'flex', flexDirection: 'column', gap: 0.6, wordBreak: 'break-word', overflowWrap: 'break-word' }}>
            {lines.map((line, lIdx) => {
              if (!line.trim()) return <Box key={lIdx} sx={{ height: 4 }} />;

              // Headings
              if (line.startsWith('### ')) {
                return (
                  <Typography
                    key={lIdx}
                    sx={{
                      fontSize: '0.92rem',
                      fontWeight: 700,
                      color: '#F8FAFC',
                      mt: 1,
                      mb: 0.2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.6,
                    }}
                  >
                    {line.replace(/^###\s*/, '')}
                  </Typography>
                );
              }

              if (line.startsWith('## ') || line.startsWith('# ')) {
                return (
                  <Typography
                    key={lIdx}
                    sx={{
                      fontSize: '1rem',
                      fontWeight: 800,
                      color: '#FFFFFF',
                      mt: 1.2,
                      mb: 0.3,
                    }}
                  >
                    {line.replace(/^#+\s*/, '')}
                  </Typography>
                );
              }

              // Alert / Blockquote callout
              if (line.startsWith('> ')) {
                return (
                  <Box
                    key={lIdx}
                    sx={{
                      my: 0.6,
                      p: 1.2,
                      borderRadius: '10px',
                      bgcolor: 'rgba(139, 92, 246, 0.08)',
                      borderLeft: '3px solid #8B5CF6',
                    }}
                  >
                    <Typography sx={{ fontSize: '0.82rem', color: '#E2E8F0', fontStyle: 'italic', lineHeight: 1.5 }}>
                      {line.replace(/^>\s*/, '')}
                    </Typography>
                  </Box>
                );
              }

              // Table Rows
              if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
                const cells = line.split('|').slice(1, -1).map((c) => c.trim());
                const isHeaderSeparator = cells.every((c) => /^:?-+:?$/.test(c));
                if (isHeaderSeparator) return null;

                return (
                  <Box
                    key={lIdx}
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: `repeat(${cells.length}, 1fr)`,
                      gap: 1,
                      p: 0.8,
                      bgcolor: 'rgba(255, 255, 255, 0.02)',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                      fontSize: '0.78rem',
                      color: '#E2E8F0',
                    }}
                  >
                    {cells.map((cell, cIdx) => (
                      <Typography key={cIdx} sx={{ fontSize: '0.78rem', color: '#E2E8F0', fontWeight: 500 }}>
                        {cell}
                      </Typography>
                    ))}
                  </Box>
                );
              }

              // Check for Bullet points
              const isBullet = /^\s*[-*]\s+/.test(line);
              const isNumbered = /^\s*\d+\.\s+/.test(line);
              const displayLine = isBullet
                ? line.replace(/^\s*[-*]\s+/, '')
                : isNumbered
                  ? line.replace(/^\s*\d+\.\s+/, '')
                  : line;

              // Parse inline `code` and **bold**
              const segments = displayLine.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);

              return (
                <Box
                  key={lIdx}
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: isBullet || isNumbered ? 0.8 : 0,
                    pl: isBullet || isNumbered ? 0.5 : 0,
                  }}
                >
                  {isBullet && (
                    <Box
                      sx={{
                        width: 5,
                        height: 5,
                        borderRadius: '50%',
                        bgcolor: '#A855F7',
                        mt: '8px',
                        flexShrink: 0,
                      }}
                    />
                  )}
                  {isNumbered && (
                    <Typography
                      sx={{
                        fontSize: '0.84rem',
                        fontWeight: 700,
                        color: '#A855F7',
                        flexShrink: 0,
                        mt: '1px',
                      }}
                    >
                      {line.match(/^\s*(\d+)\./)?.[1]}.
                    </Typography>
                  )}

                  <Typography
                    component="div"
                    sx={{
                      fontSize: '0.86rem',
                      lineHeight: 1.65,
                      color: '#E2E8F0',
                      flex: 1,
                      wordBreak: 'break-word',
                      overflowWrap: 'break-word',
                    }}
                  >
                    {segments.map((seg, sIdx) => {
                      if (seg.startsWith('`') && seg.endsWith('`') && seg.length > 1) {
                        return (
                          <Box
                            component="span"
                            key={sIdx}
                            sx={{
                              fontFamily: 'Consolas, Monaco, monospace',
                              bgcolor: 'rgba(255, 255, 255, 0.08)',
                              color: '#F8FAFC',
                              border: '1px solid rgba(255, 255, 255, 0.12)',
                              px: 0.6,
                              py: 0.1,
                              borderRadius: '5px',
                              fontSize: '0.85em',
                              fontWeight: 600,
                            }}
                          >
                            {seg.slice(1, -1)}
                          </Box>
                        );
                      }
                      if (seg.startsWith('**') && seg.endsWith('**') && seg.length > 3) {
                        return (
                          <strong key={sIdx} style={{ color: '#FFFFFF', fontWeight: 700 }}>
                            {seg.slice(2, -2)}
                          </strong>
                        );
                      }
                      return seg;
                    })}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        );
      })}
    </Box>
  );
}

export default function AIChatbotPopup({
  open,
  onClose,
  problem,
  currentCode = '',
  language = 'python',
  lastExecutionVerdict,
  lastFailedTestCase,
}: AIChatbotPopupProps) {
  const toast = useToast();
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>('Developer');

  // Active Socratic Tool Mode
  const [activeTool, setActiveTool] = useState<AssistantToolMode | null>(null);
  const [hintLevel, setHintLevel] = useState<1 | 2 | 3>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<'liked' | 'disliked' | null>(null);

  // In-Memory Results for Tool Modes (Zero Redundant Calls)
  const [toolResults, setToolResults] = useState<{
    explain?: string;
    hints: { [key in 1 | 2 | 3]?: string };
    complexity?: string;
    diagnose?: string;
  }>({
    hints: {},
  });

  // Fetch current user profile name on mount
  useEffect(() => {
    apiService
      .getProfile()
      .then((res: any) => {
        const user = res?.data || res;
        const name = user?.name || user?.username || user?.fullName;
        if (name) {
          setUserName(name.split(' ')[0]);
        }
      })
      .catch(() => {
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('user');
          if (stored) {
            try {
              const u = JSON.parse(stored);
              if (u.name) setUserName(u.name.split(' ')[0]);
            } catch {}
          }
        }
      });
  }, []);

  if (!open) return null;

  // Execute Predefined Socratic Tool (No open-ended chat, prevents full code leak)
  const executeTool = async (tool: AssistantToolMode, selectedHintLevel?: 1 | 2 | 3, force?: boolean) => {
    setActiveTool(tool);
    setFeedback(null);

    if (tool === 'hints') {
      const level = selectedHintLevel || hintLevel;
      setHintLevel(level);

      if (!force && toolResults.hints[level]) {
        return; // Cache hit in memory
      }

      setIsLoading(true);
      try {
        const res = await apiService.getProgressiveHintAI({
          title: problem.title,
          statement: problem.statement,
          level,
          currentCode,
          language,
        });

        const text =
          res?.data?.hint ||
          res?.hint ||
          'Consider what invariant or data structure enables fast $O(1)$ or $O(\\log N)$ lookup.';

        setToolResults((prev) => ({
          ...prev,
          hints: { ...prev.hints, [level]: text },
        }));
      } catch {
        toast.error('Failed to retrieve progressive hint. Using local guidance.');
        setToolResults((prev) => ({
          ...prev,
          hints: {
            ...prev.hints,
            [level]: 'Consider what invariant or data structure enables fast $O(1)$ or $O(\\log N)$ lookup.',
          },
        }));
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (tool === 'explain') {
      if (!force && toolResults.explain) return;

      setIsLoading(true);
      try {
        const res = await apiService.explainProblemAI({
          title: problem.title,
          statement: problem.statement,
          difficulty: problem.difficulty,
          tags: problem.tags,
        });

        const text =
          res?.data?.explanation ||
          res?.explanation ||
          '### Problem Objective\nBreak down input structure and identify optimal traversal patterns.';

        setToolResults((prev) => ({ ...prev, explain: text }));
      } catch {
        toast.error('Failed to retrieve explanation.');
        setToolResults((prev) => ({
          ...prev,
          explain: '### Problem Objective\nBreak down input structure and identify optimal traversal patterns.',
        }));
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (tool === 'complexity') {
      if (!force && toolResults.complexity) return;

      setIsLoading(true);
      try {
        const res = await apiService.analyzeComplexityAI({
          title: problem.title,
          statement: problem.statement,
          difficulty: problem.difficulty,
          tags: problem.tags,
          currentCode,
          language,
        });

        const text =
          res?.data?.analysis ||
          res?.analysis ||
          '### Optimal Complexity\n- **Time**: **$O(N)$**\n- **Space**: **$O(1)$**\n\nAvoid nested $O(N^2)$ loops.';

        setToolResults((prev) => ({ ...prev, complexity: text }));
      } catch {
        toast.error('Failed to analyze complexity.');
        setToolResults((prev) => ({
          ...prev,
          complexity: '### Optimal Complexity\n- **Time**: **$O(N)$**\n- **Space**: **$O(1)$**\n\nAvoid nested $O(N^2)$ loops.',
        }));
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (tool === 'diagnose') {
      setIsLoading(true);
      try {
        const res = await apiService.diagnoseFailureAI({
          title: problem.title,
          currentCode,
          language,
          verdict: lastExecutionVerdict || 'Test Case Check',
          failedInput: lastFailedTestCase?.input,
          expectedOutput: lastFailedTestCase?.expectedOutput,
          actualOutput: lastFailedTestCase?.actualOutput,
        });

        const text =
          res?.data?.diagnosis ||
          res?.diagnosis ||
          'Inspect boundary limits: single element inputs ($N=1$), all-negative arrays, and index off-by-one errors.';

        setToolResults((prev) => ({ ...prev, diagnose: text }));
      } catch {
        toast.error('Failed to diagnose code.');
        setToolResults((prev) => ({
          ...prev,
          diagnose: 'Inspect boundary limits: single element inputs ($N=1$), all-negative arrays, and index off-by-one errors.',
        }));
      } finally {
        setIsLoading(false);
      }
      return;
    }
  };

  const getActiveContent = (): string => {
    if (!activeTool) return '';
    if (activeTool === 'explain') return toolResults.explain || '';
    if (activeTool === 'hints') return toolResults.hints[hintLevel] || '';
    if (activeTool === 'complexity') return toolResults.complexity || '';
    if (activeTool === 'diagnose') return toolResults.diagnose || '';
    return '';
  };

  // Minimized Floating Pill
  if (isMinimized) {
    return (
      <Paper
        elevation={8}
        onClick={() => setIsMinimized(false)}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1400,
          bgcolor: '#0E1017',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '30px',
          px: 2,
          py: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1.2,
          cursor: 'pointer',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6), 0 0 20px rgba(168, 85, 247, 0.3)',
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 14px 35px rgba(0, 0, 0, 0.7), 0 0 25px rgba(168, 85, 247, 0.45)',
          },
        }}
      >
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
          }}
        >
          <ViewInArRoundedIcon sx={{ fontSize: 16 }} />
        </Box>
        <Typography sx={{ fontSize: '0.84rem', fontWeight: 700, color: '#FFFFFF' }}>
          TechLearns AI
        </Typography>
        <Chip
          label="Coach"
          size="small"
          sx={{
            height: 20,
            fontSize: '0.68rem',
            fontWeight: 800,
            bgcolor: 'rgba(168, 85, 247, 0.2)',
            color: '#D8B4FE',
            border: '1px solid rgba(168, 85, 247, 0.4)',
            borderRadius: '10px',
          }}
        />
      </Paper>
    );
  }

  return (
    <Fade in={open}>
      <Paper
        elevation={24}
        sx={{
          position: 'fixed',
          bottom: isExpanded ? 16 : 24,
          right: isExpanded ? 16 : 24,
          width: isExpanded ? 'calc(100vw - 32px)' : { xs: 'calc(100vw - 32px)', sm: 390, md: 410 },
          maxWidth: isExpanded ? 1040 : 420,
          height: isExpanded ? 'calc(100vh - 32px)' : 530,
          maxHeight: '92vh',
          zIndex: 1400,
          bgcolor: '#121422',
          color: '#FFFFFF',
          borderRadius: '24px',
          border: '1.5px solid rgba(168, 85, 247, 0.55)',
          boxShadow: '0 24px 80px rgba(0, 0, 0, 0.95), 0 0 45px rgba(168, 85, 247, 0.28), 0 0 0 1px rgba(168, 85, 247, 0.35)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1), height 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* ========================================================================= */}
        {/* 1. TOP AURORA GRADIENT HEADER                                             */}
        {/* ========================================================================= */}
        <Box
          sx={{
            pt: 2.2,
            pb: !activeTool ? 2.2 : 1.6,
            px: 2.4,
            background: !activeTool
              ? `
                radial-gradient(circle at 50% -10%, rgba(147, 51, 234, 0.55) 0%, rgba(79, 70, 229, 0.35) 45%, transparent 75%),
                linear-gradient(180deg, #1D1A34 0%, #121422 100%)
              `
              : `
                radial-gradient(circle at 50% -20%, rgba(59, 130, 246, 0.4) 0%, rgba(99, 102, 241, 0.25) 45%, transparent 75%),
                linear-gradient(180deg, #151A2E 0%, #121422 100%)
              `,
            borderBottom: '1px solid rgba(168, 85, 247, 0.2)',
            flexShrink: 0,
            transition: 'background 0.3s ease',
          }}
        >
          {/* Top Bar Navigation */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {activeTool ? (
                <Button
                  size="small"
                  onClick={() => setActiveTool(null)}
                  startIcon={<ArrowBackRoundedIcon sx={{ fontSize: 16 }} />}
                  sx={{
                    color: '#D8B4FE',
                    bgcolor: 'rgba(255, 255, 255, 0.08)',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    borderRadius: '10px',
                    textTransform: 'none',
                    px: 1.4,
                    py: 0.4,
                    border: '1px solid rgba(168, 85, 247, 0.3)',
                    '&:hover': { bgcolor: 'rgba(168, 85, 247, 0.2)', color: '#FFFFFF' },
                  }}
                >
                  4 Socratic Tools
                </Button>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF',
                      boxShadow: '0 0 10px rgba(139, 92, 246, 0.5)',
                    }}
                  >
                    <ViewInArRoundedIcon sx={{ fontSize: 16 }} />
                  </Box>
                  <Typography sx={{ fontWeight: 800, fontSize: '0.90rem', color: '#FFFFFF' }}>
                    TechLearns Cortex
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Right Window Controls & User Avatar */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
              {/* Language Indicator */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  color: '#CBD5E1',
                  fontSize: '0.68rem',
                  fontFamily: 'monospace',
                  bgcolor: 'rgba(255, 255, 255, 0.08)',
                  px: 0.9,
                  py: 0.3,
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  mr: 0.5,
                }}
              >
                <TerminalRoundedIcon sx={{ fontSize: 12, color: '#C084FC' }} />
                <span>{language.toUpperCase()}</span>
              </Box>

              {/* Minimize */}
              <Tooltip title="Minimize" arrow>
                <IconButton
                  size="small"
                  onClick={() => setIsMinimized(true)}
                  sx={{ color: '#94A3B8', '&:hover': { color: '#FFFFFF', bgcolor: 'rgba(255, 255, 255, 0.08)' } }}
                >
                  <RemoveRoundedIcon sx={{ fontSize: 17 }} />
                </IconButton>
              </Tooltip>

              {/* Expand / Shrink */}
              <Tooltip title={isExpanded ? 'Restore Size' : 'Expand'} arrow>
                <IconButton
                  size="small"
                  onClick={() => setIsExpanded(!isExpanded)}
                  sx={{ color: '#94A3B8', '&:hover': { color: '#FFFFFF', bgcolor: 'rgba(255, 255, 255, 0.08)' } }}
                >
                  {isExpanded ? (
                    <CloseFullscreenRoundedIcon sx={{ fontSize: 16 }} />
                  ) : (
                    <OpenInFullRoundedIcon sx={{ fontSize: 16 }} />
                  )}
                </IconButton>
              </Tooltip>

              {/* Close */}
              <Tooltip title="Close" arrow>
                <IconButton
                  size="small"
                  onClick={onClose}
                  sx={{ color: '#94A3B8', '&:hover': { color: '#FFFFFF', bgcolor: 'rgba(255, 255, 255, 0.08)' } }}
                >
                  <CloseRoundedIcon sx={{ fontSize: 17 }} />
                </IconButton>
              </Tooltip>

              {/* Profile Avatar */}
              <Avatar
                sx={{
                  width: 30,
                  height: 30,
                  bgcolor: '#9333EA',
                  fontSize: '0.76rem',
                  fontWeight: 800,
                  border: '2px solid rgba(216, 180, 254, 0.6)',
                  boxShadow: '0 0 12px rgba(147, 51, 234, 0.4)',
                  ml: 0.4,
                }}
              >
                {userName.charAt(0).toUpperCase()}
              </Avatar>
            </Box>
          </Box>

          {/* Large Hero Title (When on 4-Boxes Home Screen) */}
          {!activeTool && (
            <Box sx={{ mt: 2.2, mb: 0.2, textAlign: 'left' }}>
              <Typography
                sx={{
                  fontSize: { xs: '1.45rem', sm: '1.65rem' },
                  fontWeight: 800,
                  color: '#FFFFFF',
                  letterSpacing: '-0.025em',
                  lineHeight: 1.18,
                }}
              >
                Hello{' '}
                <Box
                  component="span"
                  sx={{
                    background: 'linear-gradient(135deg, #E9D5FF 0%, #C084FC 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {userName}
                </Box>
                <br />
                May I help you?
              </Typography>

              {/* Model Identity Subtitle */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 1, mt: 1.2 }}>
                <ViewInArRoundedIcon sx={{ fontSize: 16, color: '#C084FC' }} />
                <Typography sx={{ fontWeight: 700, fontSize: '0.84rem', color: '#E2E8F0' }}>
                  TechLearns Cortex AI
                </Typography>
                <Chip
                  label="Strictly Socratic"
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: '0.60rem',
                    fontWeight: 800,
                    bgcolor: 'rgba(168, 85, 247, 0.2)',
                    color: '#E9D5FF',
                    border: '1px solid rgba(168, 85, 247, 0.4)',
                    borderRadius: '6px',
                  }}
                />
              </Box>
            </Box>
          )}

          {/* Active Tool Header Badge (When viewing a tool's output) */}
          {activeTool && (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: '7px',
                    bgcolor:
                      activeTool === 'explain'
                        ? 'rgba(168, 85, 247, 0.2)'
                        : activeTool === 'hints'
                          ? 'rgba(245, 158, 11, 0.2)'
                          : activeTool === 'complexity'
                            ? 'rgba(56, 189, 248, 0.2)'
                            : 'rgba(244, 63, 94, 0.2)',
                    color:
                      activeTool === 'explain'
                        ? '#C084FC'
                        : activeTool === 'hints'
                          ? '#F59E0B'
                          : activeTool === 'complexity'
                            ? '#38BDF8'
                            : '#F43F5E',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {activeTool === 'explain' && <DescriptionOutlinedIcon sx={{ fontSize: 15 }} />}
                  {activeTool === 'hints' && <LightbulbRoundedIcon sx={{ fontSize: 15 }} />}
                  {activeTool === 'complexity' && <SpeedRoundedIcon sx={{ fontSize: 15 }} />}
                  {activeTool === 'diagnose' && <BugReportRoundedIcon sx={{ fontSize: 15 }} />}
                </Box>
                <Typography sx={{ fontSize: '0.88rem', fontWeight: 800, color: '#FFFFFF' }}>
                  {activeTool === 'explain' && '1. Problem Intuition & Trace'}
                  {activeTool === 'hints' && `2. Progressive Socratic Hints (Level ${hintLevel})`}
                  {activeTool === 'complexity' && '3. Time & Space Complexity Bounds'}
                  {activeTool === 'diagnose' && '4. Test Case Failure Diagnosis'}
                </Typography>
              </Box>

              <Chip
                label={problem.difficulty || 'Medium'}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.64rem',
                  fontWeight: 800,
                  bgcolor: 'rgba(255, 255, 255, 0.08)',
                  color: '#CBD5E1',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              />
            </Box>
          )}
        </Box>

        {/* ========================================================================= */}
        {/* 2. BODY CONTENT: 4 SIMPLE BOXES OR ACTIVE SOCRATIC VIEWER                 */}
        {/* ========================================================================= */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, bgcolor: '#0E0F1A' }}>
          {!activeTool ? (
            /* ------------------------------------------------------------- */
            /* 4 SIMPLE SMALL BOXES IN THE CENTER (WITHOUT ICONS)            */
            /* ------------------------------------------------------------- */
            <Box
              sx={{
                flex: 1,
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {/* Problem Context Bar */}
              <Box
                sx={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  px: 0.5,
                  mb: 1.2,
                }}
              >
                <Typography sx={{ fontSize: '0.74rem', color: '#94A3B8', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '65%' }}>
                  Challenge: <Box component="span" sx={{ color: '#F1F5F9', fontWeight: 700 }}>{problem.title}</Box>
                </Typography>
                <Typography sx={{ fontSize: '0.68rem', color: '#C084FC', fontWeight: 700, flexShrink: 0 }}>
                  Select guidance
                </Typography>
              </Box>

              {/* 2 x 2 SMALL CENTER BOXES GRID (NO ICONS) */}
              <Box
                sx={{
                  width: '100%',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 1.1,
                }}
              >
                {/* BOX 1: Explain Logic */}
                <Box
                  onClick={() => executeTool('explain')}
                  sx={{
                    bgcolor: '#161828',
                    borderRadius: '12px',
                    p: 1.3,
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center',
                    minHeight: 68,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                    '&:hover': {
                      bgcolor: '#212338',
                      borderColor: 'rgba(168, 85, 247, 0.65)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(168, 85, 247, 0.22)',
                    },
                  }}
                >
                  <Typography sx={{ fontSize: '0.80rem', fontWeight: 700, color: '#FFFFFF', mb: 0.2 }}>
                    Explain Logic
                  </Typography>
                  <Typography sx={{ fontSize: '0.66rem', color: '#94A3B8', lineHeight: 1.3 }}>
                    Step-by-step trace & breakdown
                  </Typography>
                </Box>

                {/* BOX 2: Socratic Hints */}
                <Box
                  onClick={() => executeTool('hints', 1)}
                  sx={{
                    bgcolor: '#161828',
                    borderRadius: '12px',
                    p: 1.3,
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center',
                    minHeight: 68,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                    '&:hover': {
                      bgcolor: '#212338',
                      borderColor: 'rgba(245, 158, 11, 0.65)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(245, 158, 11, 0.22)',
                    },
                  }}
                >
                  <Typography sx={{ fontSize: '0.80rem', fontWeight: 700, color: '#FFFFFF', mb: 0.2 }}>
                    Socratic Hints
                  </Typography>
                  <Typography sx={{ fontSize: '0.66rem', color: '#94A3B8', lineHeight: 1.3 }}>
                    Progressive clues & direction
                  </Typography>
                </Box>

                {/* BOX 3: Complexity Limits */}
                <Box
                  onClick={() => executeTool('complexity')}
                  sx={{
                    bgcolor: '#161828',
                    borderRadius: '12px',
                    p: 1.3,
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center',
                    minHeight: 68,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                    '&:hover': {
                      bgcolor: '#212338',
                      borderColor: 'rgba(56, 189, 248, 0.65)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(56, 189, 248, 0.22)',
                    },
                  }}
                >
                  <Typography sx={{ fontSize: '0.80rem', fontWeight: 700, color: '#FFFFFF', mb: 0.2 }}>
                    Complexity Limits
                  </Typography>
                  <Typography sx={{ fontSize: '0.66rem', color: '#94A3B8', lineHeight: 1.3 }}>
                    Big-O Time & Space targets
                  </Typography>
                </Box>

                {/* BOX 4: Diagnose Bug */}
                <Box
                  onClick={() => executeTool('diagnose')}
                  sx={{
                    bgcolor: '#161828',
                    borderRadius: '12px',
                    p: 1.3,
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center',
                    minHeight: 68,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                    '&:hover': {
                      bgcolor: '#212338',
                      borderColor: 'rgba(244, 63, 94, 0.65)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(244, 63, 94, 0.22)',
                    },
                  }}
                >
                  <Typography sx={{ fontSize: '0.80rem', fontWeight: 700, color: '#FFFFFF', mb: 0.2 }}>
                    Diagnose Bug
                  </Typography>
                  <Typography sx={{ fontSize: '0.66rem', color: '#94A3B8', lineHeight: 1.3 }}>
                    Edge cases & failed tests
                  </Typography>
                </Box>
              </Box>
            </Box>
          ) : (
            /* ------------------------------------------------------------- */
            /* STRUCTURED SOCRATIC RESPONSE VIEWER                           */
            /* ------------------------------------------------------------- */
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, bgcolor: '#0E0F1A' }}>
              {/* Socratic Hint Level Selector (If inside Hints Mode) */}
              {activeTool === 'hints' && (
                <Box
                  sx={{
                    px: 2.2,
                    py: 1.2,
                    bgcolor: '#161828',
                    borderBottom: '1px solid rgba(168, 85, 247, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <Typography sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#94A3B8', mr: 0.5 }}>
                    Progressive Level:
                  </Typography>
                  {([1, 2, 3] as const).map((lvl) => (
                    <Button
                      key={lvl}
                      size="small"
                      variant={hintLevel === lvl ? 'contained' : 'outlined'}
                      onClick={() => executeTool('hints', lvl)}
                      sx={{
                        py: 0.35,
                        px: 1.2,
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        borderRadius: '8px',
                        textTransform: 'none',
                        minWidth: 0,
                        ...(hintLevel === lvl
                          ? {
                            bgcolor: '#8B5CF6',
                            color: '#FFFFFF',
                            boxShadow: '0 2px 10px rgba(139, 92, 246, 0.4)',
                            '&:hover': { bgcolor: '#7C3AED' },
                          }
                          : {
                            borderColor: 'rgba(255, 255, 255, 0.12)',
                            color: '#94A3B8',
                            '&:hover': { borderColor: '#8B5CF6', color: '#FFFFFF' },
                          }),
                      }}
                    >
                      {lvl === 1 ? 'Level 1: Nudge' : lvl === 2 ? 'Level 2: Pattern' : 'Level 3: Algorithm'}
                    </Button>
                  ))}
                </Box>
              )}

              {/* Scrollable Markdown Content */}
              <Box
                sx={{
                  flex: 1,
                  p: 2.5,
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {isLoading ? (
                  <Box
                    sx={{
                      my: 'auto',
                      py: 8,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 1.8,
                      color: '#94A3B8',
                    }}
                  >
                    <CircularProgress size={32} sx={{ color: '#A855F7' }} />
                    <Typography sx={{ fontSize: '0.86rem', fontWeight: 600, color: '#E2E8F0', fontStyle: 'italic' }}>
                      TechLearns Cortex is analyzing algorithmic patterns...
                    </Typography>
                  </Box>
                ) : (
                  <Box>
                    <DarkMessageRenderer content={getActiveContent()} />
                  </Box>
                )}
              </Box>

              {/* Bottom Action Dock (No text chat field, only structured tools & feedback) */}
              <Box
                sx={{
                  p: 1.6,
                  px: 2.2,
                  bgcolor: '#141624',
                  borderTop: '1px solid rgba(168, 85, 247, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <Tooltip title="Helpful" arrow>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setFeedback('liked');
                        toast.info('Thank you for your feedback!');
                      }}
                      sx={{
                        color: feedback === 'liked' ? '#C084FC' : '#64748B',
                        bgcolor: 'rgba(255, 255, 255, 0.04)',
                        p: 0.6,
                        '&:hover': { color: '#C084FC', bgcolor: 'rgba(255, 255, 255, 0.08)' },
                      }}
                    >
                      {feedback === 'liked' ? <ThumbUpRoundedIcon sx={{ fontSize: 15 }} /> : <ThumbUpOutlinedIcon sx={{ fontSize: 15 }} />}
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Not helpful" arrow>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setFeedback('disliked');
                        toast.info('We will refine our Socratic hints.');
                      }}
                      sx={{
                        color: feedback === 'disliked' ? '#F43F5E' : '#64748B',
                        bgcolor: 'rgba(255, 255, 255, 0.04)',
                        p: 0.6,
                        '&:hover': { color: '#F43F5E', bgcolor: 'rgba(255, 255, 255, 0.08)' },
                      }}
                    >
                      {feedback === 'disliked' ? <ThumbDownRoundedIcon sx={{ fontSize: 15 }} /> : <ThumbDownOutlinedIcon sx={{ fontSize: 15 }} />}
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Copy Insight" arrow>
                    <IconButton
                      size="small"
                      onClick={() => {
                        navigator.clipboard.writeText(getActiveContent());
                        toast.info('Explanation copied to clipboard.', 'Copied');
                      }}
                      sx={{
                        color: '#64748B',
                        bgcolor: 'rgba(255, 255, 255, 0.04)',
                        p: 0.6,
                        '&:hover': { color: '#FFFFFF', bgcolor: 'rgba(255, 255, 255, 0.08)' },
                      }}
                    >
                      <ContentCopyRoundedIcon sx={{ fontSize: 15 }} />
                    </IconButton>
                  </Tooltip>

                  <Button
                    size="small"
                    startIcon={<RefreshRoundedIcon sx={{ fontSize: 14 }} />}
                    onClick={() => {
                      if (activeTool === 'explain') setToolResults((p) => ({ ...p, explain: undefined }));
                      if (activeTool === 'hints')
                        setToolResults((p) => ({ ...p, hints: { ...p.hints, [hintLevel]: undefined } }));
                      if (activeTool === 'complexity') setToolResults((p) => ({ ...p, complexity: undefined }));
                      if (activeTool === 'diagnose') setToolResults((p) => ({ ...p, diagnose: undefined }));
                      executeTool(activeTool, undefined, true);
                    }}
                    sx={{
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      color: '#94A3B8',
                      textTransform: 'none',
                      ml: 0.5,
                      '&:hover': { color: '#FFFFFF' },
                    }}
                  >
                    Re-analyze
                  </Button>
                </Box>

                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setActiveTool(null)}
                  startIcon={<ArrowBackRoundedIcon sx={{ fontSize: 14 }} />}
                  sx={{
                    borderColor: 'rgba(255, 255, 255, 0.15)',
                    color: '#D8B4FE',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    textTransform: 'none',
                    borderRadius: '8px',
                    px: 1.4,
                    '&:hover': { borderColor: '#8B5CF6', color: '#FFFFFF', bgcolor: 'rgba(139, 92, 246, 0.1)' },
                  }}
                >
                  All 4 Options
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Paper>
    </Fade>
  );
}
