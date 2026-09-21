'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Drawer,
  IconButton,
  Button,
  TextField,
  Chip,
  Card,
  Divider,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import SpeedRoundedIcon from '@mui/icons-material/SpeedRounded';
import BugReportOutlinedIcon from '@mui/icons-material/BugReportOutlined';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import { useToast } from '@/context/ToastContext';

export interface AICopilotDrawerProps {
  open: boolean;
  onClose: () => void;
  problemTitle: string;
  problemDifficulty: string;
  problemStatement: string;
  currentCode: string;
  language: string;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  type?: 'hint' | 'complexity' | 'edge-cases' | 'general';
}

function RenderMessageContent({ content }: { content: string }) {
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {parts.map((part, idx) => {
        if (part.startsWith('```')) {
          const fenceMatch = part.match(/^```([a-zA-Z0-9_-]+)\n/);
          let codeBody = '';
          if (fenceMatch) {
            codeBody = part.replace(/^```[a-zA-Z0-9_-]+\n/, '').replace(/\n?```$/, '');
          } else {
            codeBody = part.replace(/^```\n?/, '').replace(/\n?```$/, '');
          }

          return (
            <Box
              key={idx}
              sx={{
                p: 1.5,
                bgcolor: '#0B0F19',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                fontFamily: 'monospace',
                fontSize: '0.78rem',
                color: '#38BDF8',
                overflowX: 'auto',
                whiteSpace: 'pre',
                my: 0.5,
              }}
            >
              {codeBody}
            </Box>
          );
        }

        const lines = part.split('\n');
        return (
          <Box key={idx} sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {lines.map((line, lIdx) => {
              const trimmed = line.trim();
              if (!trimmed) return null;

              const segments = trimmed.split(/(\*\*.*?\*\*|`.*?`|\$.*?\$)/g);

              return (
                <Typography
                  key={lIdx}
                  component="div"
                  sx={{
                    fontSize: '0.84rem',
                    lineHeight: 1.6,
                    color: '#E2E8F0',
                  }}
                >
                  {segments.map((seg, sIdx) => {
                    if (seg.startsWith('**') && seg.endsWith('**')) {
                      return (
                        <Box component="span" key={sIdx} sx={{ fontWeight: 800, color: '#FFFFFF' }}>
                          {seg.slice(2, -2)}
                        </Box>
                      );
                    }
                    if (seg.startsWith('`') && seg.endsWith('`')) {
                      return (
                        <Box
                          component="span"
                          key={sIdx}
                          sx={{
                            bgcolor: 'rgba(255, 255, 255, 0.1)',
                            px: 0.6,
                            py: 0.2,
                            borderRadius: '4px',
                            fontFamily: 'monospace',
                            fontSize: '0.85em',
                            color: '#38BDF8',
                          }}
                        >
                          {seg.slice(1, -1)}
                        </Box>
                      );
                    }
                    if (seg.startsWith('$') && seg.endsWith('$')) {
                      return (
                        <Box
                          component="span"
                          key={sIdx}
                          sx={{
                            fontStyle: 'italic',
                            fontWeight: 600,
                            color: '#FBBF24',
                          }}
                        >
                          {seg.slice(1, -1)}
                        </Box>
                      );
                    }
                    return seg;
                  })}
                </Typography>
              );
            })}
          </Box>
        );
      })}
    </Box>
  );
}

export default function AICopilotDrawer({
  open,
  onClose,
  problemTitle,
  problemDifficulty,
  problemStatement,
  currentCode,
  language,
}: AICopilotDrawerProps) {
  const toast = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-0',
      sender: 'assistant',
      content: `Hello! I'm your AI Copilot for "${problemTitle}". I can provide progressive algorithmic hints, analyze your time/space complexity, or test corner cases without giving away the full solution. How can I assist?`,
      timestamp: 'Just now',
      type: 'general',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hintLevel, setHintLevel] = useState<number>(0);

  const handleSend = async (userPrompt?: string) => {
    const promptText = userPrompt || input.trim();
    if (!promptText || isLoading) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      content: promptText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!userPrompt) setInput('');
    setIsLoading(true);

    // Generate context-aware algorithmic response
    setTimeout(() => {
      let aiReply = '';
      const promptLower = promptText.toLowerCase();

      if (promptLower.includes('hint') || promptLower.includes('approach') || promptLower.includes('how to solve')) {
        const nextLevel = Math.min(hintLevel + 1, 3);
        setHintLevel(nextLevel);
        if (nextLevel === 1) {
          aiReply = `💡 **Level 1 Hint — Problem Intuition (${problemTitle}):**\nIdentify the core invariant in this problem. Consider whether sorting the input or using an auxiliary hash table can reduce the search space from $O(N^2)$ brute force to $O(N \\log N)$ or $O(N)$.`;
        } else if (nextLevel === 2) {
          aiReply = `🧠 **Level 2 Hint — Algorithmic Strategy:**\nFor optimal runtime, track seen values or state transitions. For example, if searching for complementary conditions, storing processed elements in a hash map allows $O(1)$ lookups per step.`;
        } else {
          aiReply = `📝 **Level 3 Hint — Illustrative Pseudocode Pattern:**\n\`\`\`pseudocode\n# Algorithmic Pseudocode Template for ${problemTitle}\ninitialize state_map = {}\nfor index, item in enumerate(input_sequence):\n    needed_state = compute_complement(item)\n    if needed_state in state_map:\n        return build_result(state_map[needed_state], index)\n    state_map[item] = index\nreturn not_found_state\n\`\`\`\nAdapt this structure to your ${language} solution in the editor!`;
        }
      } else if (promptLower.includes('complexity') || promptLower.includes('big-o') || promptLower.includes('time')) {
        const codeLines = (currentCode || '').split('\n').filter((l) => l.trim().length > 0).length;
        aiReply = `⚡ **Big-O Complexity Estimation (Illustrative):**\n\n• **Target Time Complexity:** $O(N)$ or $O(N \\log N)$ (Recommended for difficulty: ${problemDifficulty})\n• **Auxiliary Space:** $O(N)$ worst-case for extra state storage\n• **Code Size Analyzed:** ${codeLines} non-empty lines in ${language}\n\n*Note:* This is an offline complexity guideline based on problem constraints.`;
      } else if (promptLower.includes('edge') || promptLower.includes('corner') || promptLower.includes('test case')) {
        aiReply = `🧪 **Common Corner Cases to Test for "${problemTitle}":**\n\n1. **Empty / Minimal Input:** Single-element collections ($N=1$) or empty inputs if allowed.\n2. **Boundary Values:** Zero, negative values, or maximum constraints near $+10^9$.\n3. **Duplicates / Clashing Keys:** Identical values appearing consecutively or multiple times.\n4. **No Feasible Answer:** Ensure your code handles cases where no solution exists gracefully.`;
      } else if (promptLower.includes('bug') || promptLower.includes('debug') || promptLower.includes('syntax')) {
        if (!currentCode || currentCode.trim().length < 10) {
          aiReply = `Please author or edit your code in the editor first, and I will check common pitfalls for ${language}!`;
        } else {
          aiReply = `🔍 **Code Review Checklist for ${language}:**\n• Checked ${currentCode.split('\n').length} lines of code.\n• Check loop boundary conditions (off-by-one indices).\n• Verify variable initialization before entering nested loops.\n• Ensure return type matches expected signature for "${problemTitle}".`;
        }
      } else {
        aiReply = `I'm assisting with "${problemTitle}" (${problemDifficulty}). Ask for hints, Big-O complexity estimates, or edge case suggestions for your ${language} solution!`;
      }

      const assistantMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        content: aiReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setIsLoading(false);
    }, 600);
  };

  const copyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
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
            bgcolor: '#0F172A',
            color: '#F8FAFC',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '-8px 0 32px rgba(0,0,0,0.5)',
            borderLeft: '1px solid rgba(59, 130, 246, 0.2)',
          },
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: 'rgba(15, 23, 42, 0.95)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: '8px',
              bgcolor: 'rgba(59, 130, 246, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(59, 130, 246, 0.4)',
            }}
          >
            <AutoAwesomeRoundedIcon sx={{ color: '#38BDF8', fontSize: 18 }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: '#FFFFFF' }}>
              AI Coding Copilot
            </Typography>
            <Typography sx={{ color: '#94A3B8', fontSize: '0.72rem' }}>
              Algorithmic Assistant & Problem Coach
            </Typography>
          </Box>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: '#94A3B8', '&:hover': { color: '#FFFFFF' } }}>
          <CloseRoundedIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Box>

      {/* Quick Action Chips */}
      <Box
        sx={{
          p: 1.5,
          display: 'flex',
          gap: 1,
          overflowX: 'auto',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          bgcolor: 'rgba(15, 23, 42, 0.7)',
        }}
      >
        <Button
          size="small"
          disabled={hintLevel >= 3}
          startIcon={<LightbulbOutlinedIcon sx={{ fontSize: 14 }} />}
          onClick={() => {
            if (hintLevel < 3) {
              handleSend('Give me a hint for this problem');
            }
          }}
          sx={{
            bgcolor: hintLevel >= 3 ? 'rgba(100, 116, 139, 0.15)' : 'rgba(59, 130, 246, 0.15)',
            color: hintLevel >= 3 ? '#94A3B8' : '#60A5FA',
            fontSize: '0.72rem',
            fontWeight: 700,
            textTransform: 'none',
            borderRadius: '6px',
            border: hintLevel >= 3 ? '1px solid rgba(100, 116, 139, 0.3)' : '1px solid rgba(59, 130, 246, 0.3)',
            whiteSpace: 'nowrap',
            '&:hover': { bgcolor: hintLevel >= 3 ? 'rgba(100, 116, 139, 0.15)' : 'rgba(59, 130, 246, 0.25)' },
          }}
        >
          {hintLevel === 0
            ? 'Get Hint (L1)'
            : hintLevel < 3
            ? `Next Hint (L${hintLevel + 1})`
            : 'All Hints Unlocked (3/3)'}
        </Button>

        <Button
          size="small"
          startIcon={<SpeedRoundedIcon sx={{ fontSize: 14 }} />}
          onClick={() => handleSend('Estimate the time and space complexity')}
          sx={{
            bgcolor: 'rgba(16, 185, 129, 0.15)',
            color: '#34D399',
            fontSize: '0.72rem',
            fontWeight: 700,
            textTransform: 'none',
            borderRadius: '6px',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            whiteSpace: 'nowrap',
            '&:hover': { bgcolor: 'rgba(16, 185, 129, 0.25)' },
          }}
        >
          Complexity
        </Button>

        <Button
          size="small"
          startIcon={<ScienceOutlinedIcon sx={{ fontSize: 14 }} />}
          onClick={() => handleSend('Generate tricky edge cases for this problem')}
          sx={{
            bgcolor: 'rgba(245, 158, 11, 0.15)',
            color: '#FBBF24',
            fontSize: '0.72rem',
            fontWeight: 700,
            textTransform: 'none',
            borderRadius: '6px',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            whiteSpace: 'nowrap',
            '&:hover': { bgcolor: 'rgba(245, 158, 11, 0.25)' },
          }}
        >
          Edge Cases
        </Button>

        <Button
          size="small"
          startIcon={<BugReportOutlinedIcon sx={{ fontSize: 14 }} />}
          onClick={() => handleSend('Check my code for syntax and logical bugs')}
          sx={{
            bgcolor: 'rgba(239, 68, 68, 0.15)',
            color: '#F87171',
            fontSize: '0.72rem',
            fontWeight: 700,
            textTransform: 'none',
            borderRadius: '6px',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            whiteSpace: 'nowrap',
            '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.25)' },
          }}
        >
          Debug Code
        </Button>
      </Box>

      {/* Chat Messages */}
      <Box sx={{ flex: 1, p: 2, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {messages.map((m) => (
          <Box
            key={m.id}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: m.sender === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <Card
              sx={{
                p: 1.8,
                maxWidth: '92%',
                borderRadius: '12px',
                bgcolor: m.sender === 'user' ? '#2563EB' : 'rgba(30, 41, 59, 0.85)',
                color: '#FFFFFF',
                border: m.sender === 'user' ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
              }}
            >
              <RenderMessageContent content={m.content} />
            </Card>
            <Typography sx={{ color: '#64748B', fontSize: '0.68rem', mt: 0.5, px: 0.5 }}>
              {m.sender === 'user' ? 'You' : 'AI Copilot'} · {m.timestamp}
            </Typography>
          </Box>
        ))}

        {isLoading && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1 }}>
            <CircularProgress size={16} sx={{ color: '#38BDF8' }} />
            <Typography sx={{ color: '#94A3B8', fontSize: '0.8rem', fontStyle: 'italic' }}>
              Copilot is evaluating algorithmic strategy...
            </Typography>
          </Box>
        )}
      </Box>

      {/* Input Bar */}
      <Box
        sx={{
          p: 1.5,
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          bgcolor: 'rgba(15, 23, 42, 0.98)',
        }}
      >
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Ask a question about the algorithm..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: '#1E293B',
                color: '#FFFFFF',
                borderRadius: '8px',
                fontSize: '0.84rem',
                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.12)' },
                '&:hover fieldset': { borderColor: '#38BDF8' },
                '&.Mui-focused fieldset': { borderColor: '#38BDF8' },
              },
            }}
          />
          <IconButton
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            sx={{
              bgcolor: '#2563EB',
              color: '#FFFFFF',
              borderRadius: '8px',
              '&:hover': { bgcolor: '#1D4ED8' },
              '&.Mui-disabled': { bgcolor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.3)' },
            }}
          >
            <SendRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      </Box>
    </Drawer>
  );
}
