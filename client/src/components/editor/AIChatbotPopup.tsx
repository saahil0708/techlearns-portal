'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Button,
  TextField,
  Chip,
  Paper,
  CircularProgress,
  Tooltip,
  Fade,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';
import OpenInFullRoundedIcon from '@mui/icons-material/OpenInFullRounded';
import CloseFullscreenRoundedIcon from '@mui/icons-material/CloseFullscreenRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import TerminalRoundedIcon from '@mui/icons-material/TerminalRounded';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ThumbUpRoundedIcon from '@mui/icons-material/ThumbUpRounded';
import ThumbDownOutlinedIcon from '@mui/icons-material/ThumbDownOutlined';
import ViewInArRoundedIcon from '@mui/icons-material/ViewInArRounded';
import SparklesIcon from '@mui/icons-material/AutoAwesome';

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

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  liked?: boolean;
}

interface RenderBlock {
  type: 'code' | 'text';
  lang?: string;
  code?: string;
  text?: string;
}

function parseAssistantMessage(content: string): RenderBlock[] {
  if (!content) return [];

  // 1. Normalize carriage returns and spaced backticks (` ` ` -> ```)
  let normalized = content
    .replace(/\r\n/g, '\n')
    .replace(/`\s+`\s+`(?:\s*([a-zA-Z0-9_-]+))?/g, (_m, lang) => (lang ? `\`\`\`${lang}\n` : '```\n'))
    .replace(/`\s*`\s*`(?:\s*([a-zA-Z0-9_-]+))?/g, (_m, lang) => (lang ? `\`\`\`${lang}\n` : '```\n'));

  // 2. Fix unclosed backtick fences if any (e.g. truncated AI generation)
  const fenceMatches = normalized.match(/```/g);
  if (fenceMatches && fenceMatches.length % 2 !== 0) {
    normalized += '\n```';
  }

  // 3. Match fenced code blocks: ```lang \n code ```
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\s*\n?([\s\S]*?)```/g;
  const blocks: RenderBlock[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(normalized)) !== null) {
    const textBefore = normalized.slice(lastIndex, match.index);
    if (textBefore.trim()) {
      blocks.push({ type: 'text', text: textBefore });
    }

    const lang = match[1]?.trim() || 'python';
    const code = match[2]?.trimEnd() || '';
    if (code) {
      blocks.push({ type: 'code', lang, code });
    }

    lastIndex = match.index + match[0].length;
  }

  const remaining = normalized.slice(lastIndex);
  if (remaining.trim()) {
    // If the remaining text is pure unfenced code (e.g. starts with class Solution:, def solve, import, #include)
    const isPureCode =
      blocks.length === 0 &&
      /^\s*(class\s+[A-Za-z0-9_]+|def\s+[a-zA-Z0-9_]+\s*\(|#include|public\s+class|import\s+[a-zA-Z0-9_]+)/m.test(
        remaining
      );

    if (isPureCode) {
      blocks.push({ type: 'code', lang: 'python', code: remaining.trimEnd() });
    } else {
      blocks.push({ type: 'text', text: remaining });
    }
  }

  return blocks;
}

/**
 * Rich message content renderer with clean dark syntax blocks and formatted markdown
 */
function LightMessageRenderer({ content }: { content: string }) {
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
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {blocks.map((block, bIdx) => {
        if (block.type === 'code' && block.code) {
          const lang = block.lang || 'python';
          return (
            <Box
              key={bIdx}
              sx={{
                my: 1,
                borderRadius: '12px',
                overflow: 'hidden',
                bgcolor: '#0F172A',
                border: '1px solid #1E293B',
                boxShadow: '0 4px 16px rgba(15, 23, 42, 0.15)',
              }}
            >
              {/* Code Header */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  px: 1.5,
                  py: 0.6,
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <CodeRoundedIcon sx={{ fontSize: 14, color: '#38BDF8' }} />
                  <Typography
                    sx={{
                      fontSize: '0.7rem',
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
                    '&:hover': { color: '#F8FAFC', bgcolor: 'rgba(255,255,255,0.1)' },
                  }}
                >
                  {copiedIndex === bIdx ? 'Copied' : 'Copy Code'}
                </Button>
              </Box>

              {/* Code Content */}
              <Box
                component="pre"
                sx={{
                  m: 0,
                  p: 1.5,
                  fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                  fontSize: '0.80rem',
                  lineHeight: 1.6,
                  color: '#E2E8F0',
                  overflowX: 'auto',
                  whiteSpace: 'pre',
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
          <Box key={bIdx} sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {lines.map((line, lIdx) => {
              if (!line.trim()) return <Box key={lIdx} sx={{ height: 4 }} />;

              // Check for Headings
              if (line.startsWith('### ')) {
                return (
                  <Typography
                    key={lIdx}
                    sx={{
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      color: '#0F172A',
                      mt: 0.5,
                      mb: 0.2,
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
                      fontSize: '0.94rem',
                      fontWeight: 800,
                      color: '#0F172A',
                      mt: 0.8,
                      mb: 0.3,
                    }}
                  >
                    {line.replace(/^#+\s*/, '')}
                  </Typography>
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
                        bgcolor: '#6366F1',
                        mt: '8px',
                        flexShrink: 0,
                      }}
                    />
                  )}
                  {isNumbered && (
                    <Typography
                      sx={{
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        color: '#6366F1',
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
                      fontSize: '0.84rem',
                      lineHeight: 1.6,
                      color: '#1E293B',
                      flex: 1,
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
                              bgcolor: '#F1F5F9',
                              color: '#0F172A',
                              border: '1px solid #E2E8F0',
                              px: 0.6,
                              py: 0.1,
                              borderRadius: '4px',
                              fontSize: '0.84em',
                              fontWeight: 600,
                            }}
                          >
                            {seg.slice(1, -1)}
                          </Box>
                        );
                      }
                      if (seg.startsWith('**') && seg.endsWith('**') && seg.length > 3) {
                        return (
                          <strong key={sIdx} style={{ color: '#0F172A', fontWeight: 700 }}>
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
}: AIChatbotPopupProps) {
  const toast = useToast();
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState<string>('');
  const [isSendingChat, setIsSendingChat] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll chat
  useEffect(() => {
    if (!isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isMinimized]);

  if (!open) return null;

  const handleSendQuery = async (queryText?: string) => {
    const textToSend = (queryText || chatInput).trim();
    if (!textToSend || isSendingChat) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    if (!queryText) setChatInput('');
    setIsSendingChat(true);

    try {
      const res = await apiService.chatWithAssistantAI({
        message: textToSend,
        title: problem.title,
        statement: problem.statement,
        difficulty: problem.difficulty,
        tags: problem.tags,
        currentCode,
        language,
      });

      const replyText =
        res?.data?.reply ||
        res?.reply ||
        res?.data?.explanation ||
        res?.explanation ||
        'Consider breaking the problem down into smaller sub-problems. Verify if a linear single-pass approach or dynamic programming state satisfies the recurrence.';

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setChatMessages((prev) => [...prev, aiMsg]);
    } catch {
      const fallbackMsg: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        sender: 'ai',
        text: 'The AI model is currently busy. Please ensure the backend server and Azure AI keys are configured properly.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsSendingChat(false);
    }
  };

  const toggleLikeMessage = (msgId: string) => {
    setChatMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, liked: !m.liked } : m))
    );
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
          bgcolor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '30px',
          px: 2,
          py: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1.2,
          cursor: 'pointer',
          boxShadow: '0 10px 30px rgba(99, 102, 241, 0.25)',
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 12px 35px rgba(99, 102, 241, 0.35)',
          },
        }}
      >
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
          }}
        >
          <ViewInArRoundedIcon sx={{ fontSize: 16 }} />
        </Box>
        <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F172A' }}>
          AI Assistant
        </Typography>
        <Chip
          label="Open"
          size="small"
          sx={{
            height: 20,
            fontSize: '0.68rem',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
            color: '#FFFFFF',
            borderRadius: '10px',
          }}
        />
      </Paper>
    );
  }

  return (
    <Fade in={open}>
      <Paper
        elevation={16}
        sx={{
          position: 'fixed',
          bottom: isExpanded ? 16 : 24,
          right: isExpanded ? 16 : 24,
          width: isExpanded ? 'calc(100vw - 32px)' : { xs: 'calc(100vw - 32px)', sm: 430 },
          maxWidth: isExpanded ? 1040 : 440,
          height: isExpanded ? 'calc(100vh - 32px)' : 560,
          maxHeight: '90vh',
          zIndex: 1400,
          bgcolor: '#FFFFFF',
          borderRadius: '22px',
          border: '1px solid rgba(226, 232, 240, 0.9)',
          boxShadow: '0 20px 50px rgba(15, 23, 42, 0.14), 0 0 25px rgba(99, 102, 241, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1), height 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* ========================================================================= */}
        {/* 1. TOP HERO AURORA GRADIENT HEADER */}
        {/* ========================================================================= */}
        <Box
          sx={{
            pt: 2,
            pb: 1.6,
            px: 2.2,
            background: `
              radial-gradient(ellipse at 15% 30%, rgba(147, 51, 234, 0.16) 0%, transparent 60%),
              radial-gradient(ellipse at 85% 20%, rgba(59, 130, 246, 0.2) 0%, transparent 60%),
              radial-gradient(ellipse at 50% 90%, rgba(99, 102, 241, 0.1) 0%, transparent 70%),
              linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 100%)
            `,
            borderBottom: '1px solid #F1F5F9',
            flexShrink: 0,
            position: 'relative',
          }}
        >
          {/* Top Control Bar */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '9px',
                  background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  boxShadow: '0 3px 10px rgba(99, 102, 241, 0.3)',
                }}
              >
                <ViewInArRoundedIcon sx={{ fontSize: 16 }} />
              </Box>
              <Typography sx={{ fontWeight: 800, fontSize: '0.86rem', color: '#0F172A', letterSpacing: '-0.02em' }}>
                Phi-4 Assistant
              </Typography>
              <Chip
                label="Online"
                size="small"
                sx={{
                  height: 18,
                  fontSize: '0.64rem',
                  fontWeight: 800,
                  bgcolor: 'rgba(16, 185, 129, 0.1)',
                  color: '#059669',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
              {/* Clear History */}
              {chatMessages.length > 0 && (
                <Tooltip title="Clear Chat" arrow>
                  <IconButton
                    size="small"
                    onClick={() => {
                      setChatMessages([]);
                      toast.info('Chat history cleared.');
                    }}
                    sx={{ color: '#64748B', p: 0.5, '&:hover': { color: '#0F172A', bgcolor: 'rgba(0,0,0,0.04)' } }}
                  >
                    <DeleteOutlineRoundedIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
              )}

              {/* Minimize */}
              <Tooltip title="Minimize" arrow>
                <IconButton
                  size="small"
                  onClick={() => setIsMinimized(true)}
                  sx={{ color: '#64748B', p: 0.5, '&:hover': { color: '#0F172A', bgcolor: 'rgba(0,0,0,0.04)' } }}
                >
                  <RemoveRoundedIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>

              {/* Expand / Restore */}
              <Tooltip title={isExpanded ? 'Restore' : 'Expand'} arrow>
                <IconButton
                  size="small"
                  onClick={() => setIsExpanded(!isExpanded)}
                  sx={{ color: '#64748B', p: 0.5, '&:hover': { color: '#0F172A', bgcolor: 'rgba(0,0,0,0.04)' } }}
                >
                  {isExpanded ? (
                    <CloseFullscreenRoundedIcon sx={{ fontSize: 15 }} />
                  ) : (
                    <OpenInFullRoundedIcon sx={{ fontSize: 15 }} />
                  )}
                </IconButton>
              </Tooltip>

              {/* Close */}
              <Tooltip title="Close" arrow>
                <IconButton
                  size="small"
                  onClick={onClose}
                  sx={{ color: '#64748B', p: 0.5, '&:hover': { color: '#EF4444', bgcolor: '#FEE2E2' } }}
                >
                  <CloseRoundedIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Hero Greeting (When no messages) */}
          {chatMessages.length === 0 && (
            <Box sx={{ mt: 1.5, mb: 0.2 }}>
              <Typography
                sx={{
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: '#0F172A',
                  letterSpacing: '-0.025em',
                  lineHeight: 1.25,
                }}
              >
                Hello Coder,
                <br />
                <Box
                  component="span"
                  sx={{
                    background: 'linear-gradient(135deg, #6366F1 0%, #9333EA 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  May I help you?
                </Box>
              </Typography>
            </Box>
          )}
        </Box>

        {/* ========================================================================= */}
        {/* 2. CHAT MESSAGES SCROLL AREA */}
        {/* ========================================================================= */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, bgcolor: '#FFFFFF' }}>
          <Box
            sx={{
              flex: 1,
              p: 2,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 1.8,
            }}
          >
            {/* Minimalist Starter State */}
            {chatMessages.length === 0 ? (
              <Box
                sx={{
                  my: 'auto',
                  py: 2,
                  px: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                }}
              >
                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: '14px',
                    bgcolor: 'rgba(99, 102, 241, 0.08)',
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#6366F1',
                    mb: 1.2,
                  }}
                >
                  <SparklesIcon sx={{ fontSize: 20 }} />
                </Box>

                <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#0F172A', mb: 0.5 }}>
                  Ask about &quot;{problem.title}&quot;
                </Typography>

                <Typography sx={{ fontSize: '0.78rem', color: '#64748B', maxWidth: 300, lineHeight: 1.45 }}>
                  Ask for hints, complexity analysis, test case debugging, or step-by-step logic.
                </Typography>
              </Box>
            ) : (
              chatMessages.map((msg) => {
                const isUser = msg.sender === 'user';

                return (
                  <Box
                    key={msg.id}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isUser ? 'flex-end' : 'flex-start',
                    }}
                  >
                    {/* Name Label & Avatar */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mb: 0.3, px: 0.4 }}>
                      {isUser ? (
                        <>
                          <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B' }}>
                            You
                          </Typography>
                          <Box
                            sx={{
                              width: 16,
                              height: 16,
                              borderRadius: '50%',
                              bgcolor: '#0F172A',
                              color: '#FFFFFF',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.55rem',
                              fontWeight: 800,
                            }}
                          >
                            U
                          </Box>
                        </>
                      ) : (
                        <>
                          <Box
                            sx={{
                              width: 16,
                              height: 16,
                              borderRadius: '4px',
                              background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
                              color: '#FFFFFF',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <ViewInArRoundedIcon sx={{ fontSize: 10 }} />
                          </Box>
                          <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#4F46E5' }}>
                            Phi-4 Assistant
                          </Typography>
                        </>
                      )}
                    </Box>

                    {/* Bubble Content */}
                    <Box
                      sx={{
                        maxWidth: '92%',
                        p: 1.5,
                        borderRadius: isUser ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                        bgcolor: isUser ? '#0F172A' : '#F8FAFC',
                        color: isUser ? '#FFFFFF' : '#1E293B',
                        border: isUser ? 'none' : '1px solid #E2E8F0',
                        boxShadow: isUser
                          ? '0 3px 10px rgba(15, 23, 42, 0.15)'
                          : '0 2px 6px rgba(0, 0, 0, 0.03)',
                      }}
                    >
                      {isUser ? (
                        <Typography sx={{ fontSize: '0.84rem', lineHeight: 1.5, color: '#FFFFFF', whiteSpace: 'pre-wrap' }}>
                          {msg.text}
                        </Typography>
                      ) : (
                        <LightMessageRenderer content={msg.text} />
                      )}
                    </Box>

                    {/* AI Message Action Bar */}
                    {!isUser && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.4, px: 0.5 }}>
                        <Tooltip title="Helpful" arrow>
                          <IconButton
                            size="small"
                            onClick={() => toggleLikeMessage(msg.id)}
                            sx={{
                              color: msg.liked ? '#6366F1' : '#94A3B8',
                              p: 0.3,
                              '&:hover': { color: '#6366F1' },
                            }}
                          >
                            {msg.liked ? (
                              <ThumbUpRoundedIcon sx={{ fontSize: 13 }} />
                            ) : (
                              <ThumbUpOutlinedIcon sx={{ fontSize: 13 }} />
                            )}
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Not helpful" arrow>
                          <IconButton
                            size="small"
                            sx={{
                              color: '#94A3B8',
                              p: 0.3,
                              '&:hover': { color: '#EF4444' },
                            }}
                          >
                            <ThumbDownOutlinedIcon sx={{ fontSize: 13 }} />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Copy Answer" arrow>
                          <IconButton
                            size="small"
                            onClick={() => {
                              navigator.clipboard.writeText(msg.text);
                              toast.info('Copied response to clipboard.', 'Copied');
                            }}
                            sx={{
                              color: '#94A3B8',
                              p: 0.3,
                              '&:hover': { color: '#0F172A' },
                            }}
                          >
                            <ContentCopyRoundedIcon sx={{ fontSize: 13 }} />
                          </IconButton>
                        </Tooltip>

                        <Typography sx={{ fontSize: '0.65rem', color: '#94A3B8', ml: 0.8 }}>
                          {msg.timestamp}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                );
              })
            )}

            {/* Thinking Loader */}
            {isSendingChat && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pl: 0.5, py: 0.8 }}>
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: '6px',
                    background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CircularProgress size={11} sx={{ color: '#FFFFFF' }} />
                </Box>
                <Typography sx={{ fontSize: '0.78rem', color: '#64748B', fontStyle: 'italic' }}>
                  Phi-4 is thinking...
                </Typography>
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Box>

          {/* ========================================================================= */}
          {/* 3. FLOATING BOTTOM PROMPT INPUT DOCK */}
          {/* ========================================================================= */}
          <Box
            sx={{
              p: 1.5,
              pt: 0.8,
              bgcolor: '#FFFFFF',
              borderTop: '1px solid #F1F5F9',
              display: 'flex',
              flexDirection: 'column',
              gap: 0.8,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                bgcolor: '#F8FAFC',
                borderRadius: '24px',
                border: '1px solid #E2E8F0',
                px: 1.5,
                py: 0.4,
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)',
                transition: 'all 0.15s ease',
                '&:focus-within': {
                  bgcolor: '#FFFFFF',
                  borderColor: '#6366F1',
                  boxShadow: '0 3px 12px rgba(99, 102, 241, 0.15)',
                },
              }}
            >
              <TextField
                variant="standard"
                fullWidth
                placeholder="Enter a prompt here..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendQuery();
                  }
                }}
                slotProps={{
                  input: {
                    disableUnderline: true,
                    sx: {
                      fontSize: '0.82rem',
                      color: '#0F172A',
                      '&::placeholder': { color: '#94A3B8', opacity: 1 },
                    },
                  },
                }}
              />

              <Tooltip title="Active editor buffer context" arrow>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.4,
                    color: '#64748B',
                    fontSize: '0.66rem',
                    fontFamily: 'monospace',
                    bgcolor: '#FFFFFF',
                    px: 0.7,
                    py: 0.2,
                    borderRadius: '10px',
                    border: '1px solid #E2E8F0',
                    mr: 0.6,
                    flexShrink: 0,
                  }}
                >
                  <TerminalRoundedIcon sx={{ fontSize: 11, color: '#6366F1' }} />
                  <span>{language.toUpperCase()}</span>
                </Box>
              </Tooltip>

              <IconButton
                disabled={!chatInput.trim() || isSendingChat}
                onClick={() => handleSendQuery()}
                sx={{
                  bgcolor: '#6366F1',
                  color: '#FFFFFF',
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  flexShrink: 0,
                  boxShadow: '0 2px 6px rgba(99, 102, 241, 0.35)',
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    bgcolor: '#4F46E5',
                    transform: 'scale(1.05)',
                  },
                  '&.Mui-disabled': {
                    bgcolor: '#E2E8F0',
                    color: '#94A3B8',
                  },
                }}
              >
                <SendRoundedIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Fade>
  );
}
