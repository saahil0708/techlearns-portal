'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  Chip,
  Button,
  TextField,
  IconButton,
  Avatar,
  Divider,
} from '@mui/material';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import LightbulbRoundedIcon from '@mui/icons-material/LightbulbRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import BugReportRoundedIcon from '@mui/icons-material/BugReportRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import { useToast } from '@/context/ToastContext';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  codeSnippet?: string;
  timestamp: string;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'm-1',
    sender: 'ai',
    text: "Hello! I am your AI Learning Coach. I analyzed your recent 24 problem submissions and noticed you have strong mastery in Two Pointers and Graphs (91%), but struggled on DP state-space reduction for 2 problems. What would you like to drill today?",
    timestamp: 'Just now',
  },
];

const SUGGESTED_PROMPTS = [
  'Diagnose my recent TLE on Longest Common Subsequence',
  'Explain time & space complexity of Dijkstra vs A* Search',
  'Generate a 3-day revision plan for Google SDE assessment',
  'Explain Raft Consensus Leader Election with an analogy',
];

export default function AICoachClient() {
  const toast = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // AI Response simulation
    setTimeout(() => {
      setIsTyping(false);
      let replyText = "Here is the key breakdown:";
      let snippet: string | undefined = undefined;

      if (text.toLowerCase().includes('dijkstra') || text.toLowerCase().includes('a*')) {
        replyText = "Dijkstra explores all uniform-cost paths (O((V + E) log V) with a Min-Heap), whereas A* guides the search using a heuristic function h(n) <= true_cost to prune subtrees, achieving significantly faster convergence on spatial search trees.";
        snippet = `// Dijkstra Priority Queue Extraction\npriority_queue<pair<int, int>, vector<pair<int,int>>, greater<>> pq;\npq.push({0, startNode});`;
      } else if (text.toLowerCase().includes('plan') || text.toLowerCase().includes('google')) {
        replyText = "Here is your 3-Day Tailored High-Yield Practice Plan based on your historical error patterns:\n\nDay 1: Monotonic Deque & Interval Scheduling (4 Problems)\nDay 2: Tree DP & Bitmask State Compression (3 Problems)\nDay 3: Low-Level Rate Limiter & Concurrency Primitives";
      } else {
        replyText = `Great question regarding ${text}. When designing such systems, remember to decouple the write path using an asynchronous buffer (e.g. BullMQ / Redis) and apply idempotency tokens on incoming RPC payloads.`;
      }

      const aiReply: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: replyText,
        codeSnippet: snippet,
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, aiReply]);
    }, 1200);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
      {/* 1. Top Header */}
      <Card
        elevation={0}
        sx={{
          borderRadius: '24px',
          bgcolor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          p: { xs: 2.5, sm: 3.5 },
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '14px',
              bgcolor: '#EFF6FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#2563EB',
              border: '1px solid #DBEAFE',
            }}
          >
            <AutoAwesomeOutlinedIcon sx={{ fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.35rem', lineHeight: 1.2 }}>
              24/7 AI Learning Coach & Tutor
            </Typography>
            <Typography sx={{ fontSize: '0.84rem', color: '#64748B', mt: 0.3 }}>
              Real-time submission diagnosis, customized algorithmic drills, and concept breakdown assistance
            </Typography>
          </Box>
        </Box>
      </Card>

      {/* 2. Chat Workspace & Weakness Diagnosis */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 340px' }, gap: 3, alignItems: 'start' }}>
        {/* Main Chat Stream Card */}
        <Card
          elevation={0}
          sx={{
            borderRadius: '24px',
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            height: '600px',
            overflow: 'hidden',
          }}
        >
          {/* Chat Messages */}
          <Box sx={{ flex: 1, p: 3, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {messages.map((m) => (
              <Box
                key={m.id}
                sx={{
                  display: 'flex',
                  gap: 1.5,
                  alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: { xs: '90%', sm: '80%' },
                }}
              >
                {m.sender === 'ai' && (
                  <Avatar sx={{ bgcolor: '#2563EB', width: 32, height: 32 }}>
                    <AutoAwesomeOutlinedIcon sx={{ fontSize: 16 }} />
                  </Avatar>
                )}
                <Box
                  sx={{
                    p: 2,
                    borderRadius: '18px',
                    bgcolor: m.sender === 'user' ? '#2563EB' : '#F8FAFC',
                    color: m.sender === 'user' ? '#FFFFFF' : '#0F172A',
                    border: m.sender === 'user' ? 'none' : '1px solid #E2E8F0',
                    boxShadow: m.sender === 'user' ? '0 4px 14px rgba(37, 99, 235, 0.25)' : 'none',
                  }}
                >
                  <Typography sx={{ fontSize: '0.86rem', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                    {m.text}
                  </Typography>
                  {m.codeSnippet && (
                    <Box sx={{ mt: 1.5, p: 1.5, bgcolor: '#0F172A', color: '#38BDF8', borderRadius: '10px', fontFamily: 'monospace', fontSize: '0.78rem' }}>
                      <pre style={{ margin: 0, overflowX: 'auto' }}>{m.codeSnippet}</pre>
                    </Box>
                  )}
                </Box>
              </Box>
            ))}
            {isTyping && (
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: '#2563EB', width: 28, height: 28 }}>
                  <AutoAwesomeOutlinedIcon sx={{ fontSize: 14 }} />
                </Avatar>
                <Typography sx={{ fontSize: '0.78rem', color: '#64748B', fontStyle: 'italic' }}>
                  AI Coach is analyzing algorithm models...
                </Typography>
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Box>

          {/* Quick Prompts Bar */}
          <Box sx={{ px: 2, py: 1.25, bgcolor: '#F8FAFC', borderTop: '1px solid #E2E8F0', display: 'flex', gap: 1, overflowX: 'auto' }}>
            {SUGGESTED_PROMPTS.map((p) => (
              <Chip
                key={p}
                label={p}
                size="small"
                onClick={() => handleSendMessage(p)}
                sx={{ bgcolor: '#FFFFFF', border: '1px solid #CBD5E1', fontSize: '0.72rem', cursor: 'pointer', whiteSpace: 'nowrap', '&:hover': { bgcolor: '#EFF6FF', borderColor: '#93C5FD' } }}
              />
            ))}
          </Box>

          {/* Input field */}
          <Box
            component="form"
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            sx={{ p: 2, bgcolor: '#FFFFFF', borderTop: '1px solid #E2E8F0', display: 'flex', gap: 1.5 }}
          >
            <TextField
              fullWidth
              size="small"
              placeholder="Ask your coach anything (e.g. explain Time Limit Exceeded on Problem #204)..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: '#F8FAFC', fontSize: '0.84rem' } }}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={!inputText.trim()}
              sx={{ bgcolor: '#2563EB', borderRadius: '12px', px: 2.5, minWidth: 'auto', fontWeight: 700 }}
            >
              <SendRoundedIcon sx={{ fontSize: 18 }} />
            </Button>
          </Box>
        </Card>

        {/* Right Diagnosis Side Panel */}
        <Card
          elevation={0}
          sx={{
            borderRadius: '24px',
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            p: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            gap: 2.5,
          }}
        >
          <Typography sx={{ fontWeight: 800, fontSize: '0.98rem', color: '#0F172A' }}>
            Weakness Diagnosis
          </Typography>

          <Box sx={{ p: 2, borderRadius: '14px', bgcolor: '#FEF2F2', border: '1px solid #FECACA' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#DC2626', mb: 0.5 }}>
              <BugReportRoundedIcon sx={{ fontSize: 18 }} />
              <Typography sx={{ fontSize: '0.82rem', fontWeight: 800 }}>
                High Priority: DP State Space
              </Typography>
            </Box>
            <Typography sx={{ fontSize: '0.76rem', color: '#991B1B', lineHeight: 1.5 }}>
              Missed memoization base cases in 3 recent submissions. Practice 1D/2D table allocation drills.
            </Typography>
          </Box>

          <Box sx={{ p: 2, borderRadius: '14px', bgcolor: '#F0FDF4', border: '1px solid #BBF7D0' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#16A34A', mb: 0.5 }}>
              <TrendingUpRoundedIcon sx={{ fontSize: 18 }} />
              <Typography sx={{ fontSize: '0.82rem', fontWeight: 800 }}>
                Strong Mastery: Graph Trees
              </Typography>
            </Box>
            <Typography sx={{ fontSize: '0.76rem', color: '#166534', lineHeight: 1.5 }}>
              94% accuracy on BFS, DFS, Dijkstra, and Topological sorting algorithms.
            </Typography>
          </Box>
        </Card>
      </Box>
    </Box>
  );
}
