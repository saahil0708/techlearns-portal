'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Drawer,
  Tabs,
  Tab,
  CircularProgress,
  Divider,
  Paper,
  TextField,
} from '@mui/material';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import LightbulbRoundedIcon from '@mui/icons-material/LightbulbRounded';
import BugReportRoundedIcon from '@mui/icons-material/BugReportRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import PsychologyRoundedIcon from '@mui/icons-material/PsychologyRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import { apiService } from '@/lib/api-service';

interface AIIDEAssistantDrawerProps {
  open: boolean;
  onClose: () => void;
  problem: {
    title: string;
    statement: string;
    difficulty?: string;
    tags?: string[];
  };
  currentCode: string;
  language: string;
  lastExecutionVerdict?: string;
  lastFailedTestCase?: {
    input: string;
    expectedOutput: string;
    actualOutput?: string;
  };
}

export function AIIDEAssistantDrawer({
  open,
  onClose,
  problem,
  currentCode,
  language,
  lastExecutionVerdict,
  lastFailedTestCase,
}: AIIDEAssistantDrawerProps) {
  const [activeTab, setActiveTab] = useState<number>(0);

  // Explanation state
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isExplaining, setIsExplaining] = useState<boolean>(false);

  // Hints state (Levels 1, 2, 3)
  const [hints, setHints] = useState<{ [key: number]: string }>({});
  const [loadingHintLevel, setLoadingHintLevel] = useState<number | null>(null);

  // Diagnosis state
  const [diagnosis, setDiagnosis] = useState<string | null>(null);
  const [isDiagnosing, setIsDiagnosing] = useState<boolean>(false);

  // Chat Coach state
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string }>>([
    {
      sender: 'ai',
      text: `Hello! I'm your AI Coding Mentor powered by Microsoft Phi. I'm ready to guide your algorithm strategy for "${problem.title}". Ask me any conceptual question or ask for a hint!`,
    },
  ]);
  const [chatInput, setChatInput] = useState<string>('');
  const [isSendingChat, setIsSendingChat] = useState<boolean>(false);

  // Fetch Problem Explanation
  const handleExplainProblem = async () => {
    setIsExplaining(true);
    try {
      const res = await apiService.explainProblemAI({
        title: problem.title,
        statement: problem.statement,
        difficulty: problem.difficulty,
        tags: problem.tags,
      });
      setExplanation(res?.data?.explanation || res?.explanation || 'No explanation generated.');
    } catch {
      setExplanation('Could not load AI explanation. Please verify your connection.');
    } finally {
      setIsExplaining(false);
    }
  };

  // Fetch Progressive Hint
  const handleFetchHint = async (level: 1 | 2 | 3) => {
    setLoadingHintLevel(level);
    try {
      const res = await apiService.getProgressiveHintAI({
        title: problem.title,
        statement: problem.statement,
        level,
        currentCode,
        language,
      });
      const hintText = res?.data?.hint || res?.hint || 'Hint unavailable.';
      setHints((prev) => ({ ...prev, [level]: hintText }));
    } catch {
      setHints((prev) => ({ ...prev, [level]: 'Unable to fetch hint right now.' }));
    } finally {
      setLoadingHintLevel(null);
    }
  };

  // Diagnose Error
  const handleDiagnose = async () => {
    setIsDiagnosing(true);
    try {
      const res = await apiService.diagnoseFailureAI({
        title: problem.title,
        currentCode,
        language,
        verdict: lastExecutionVerdict || 'Error',
        failedInput: lastFailedTestCase?.input,
        expectedOutput: lastFailedTestCase?.expectedOutput,
        actualOutput: lastFailedTestCase?.actualOutput,
      });
      setDiagnosis(res?.data?.diagnosis || res?.diagnosis || 'No diagnosis available.');
    } catch {
      setDiagnosis('Diagnosis could not be completed.');
    } finally {
      setIsDiagnosing(false);
    }
  };

  // Send Chat Message
  const handleSendMessage = async () => {
    if (!chatInput.trim() || isSendingChat) return;
    const userMsg = chatInput.trim();
    setChatInput('');
    setChatMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setIsSendingChat(true);

    try {
      const res = await apiService.sendAICoachMessage(userMsg, currentCode);
      const aiResponse = res?.aiMessage?.text || 'I analyzed your query. Consider reviewing your base constraints.';
      setChatMessages((prev) => [...prev, { sender: 'ai', text: aiResponse }]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        { sender: 'ai', text: 'I am currently processing your request. Please try again in a moment.' },
      ]);
    } finally {
      setIsSendingChat(false);
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        backdrop: { sx: { bgcolor: 'rgba(15, 23, 42, 0.35)', backdropFilter: 'blur(2px)' } },
        paper: {
          sx: {
            width: { xs: '100%', sm: 480 },
            maxWidth: '100vw',
            bgcolor: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.12)',
          },
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #E2E8F0',
          bgcolor: '#0F172A',
          color: '#FFFFFF',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '8px',
              bgcolor: 'rgba(59, 130, 246, 0.2)',
              color: '#60A5FA',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AutoAwesomeRoundedIcon sx={{ fontSize: 18 }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', letterSpacing: '-0.01em' }}>
              AI IDE Assistant
            </Typography>
            <Typography sx={{ fontSize: '0.7rem', color: '#94A3B8' }}>
              Powered by Microsoft Phi-4
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Chip
            size="small"
            label="Token-Budgeted"
            sx={{
              bgcolor: 'rgba(34, 197, 94, 0.15)',
              color: '#4ADE80',
              fontWeight: 700,
              fontSize: '0.68rem',
              height: 22,
            }}
          />
          <IconButton size="small" onClick={onClose} sx={{ color: '#94A3B8', '&:hover': { color: '#FFFFFF' } }}>
            <CloseRoundedIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>
      </Box>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={(_, val) => setActiveTab(val)}
        variant="fullWidth"
        sx={{
          minHeight: 44,
          borderBottom: '1px solid #E2E8F0',
          bgcolor: '#F8FAFC',
          '& .MuiTab-root': {
            minHeight: 44,
            fontSize: '0.78rem',
            fontWeight: 700,
            textTransform: 'none',
          },
        }}
      >
        <Tab icon={<LightbulbRoundedIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="Hints & Concepts" />
        <Tab icon={<BugReportRoundedIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="Debug & Trace" />
        <Tab icon={<PsychologyRoundedIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="Coach Chat" />
      </Tabs>

      {/* Tab 1: Progressive Hints & Problem Explanation */}
      {activeTab === 0 && (
        <Box sx={{ flex: 1, overflowY: 'auto', p: 2.5, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* Explanation Section */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              bgcolor: '#F8FAFC',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography sx={{ fontWeight: 800, fontSize: '0.86rem', color: '#0F172A' }}>
                Problem Breakdown & Example
              </Typography>
              <Button
                size="small"
                variant="contained"
                onClick={handleExplainProblem}
                disabled={isExplaining}
                startIcon={isExplaining ? <CircularProgress size={14} color="inherit" /> : <AutoAwesomeRoundedIcon sx={{ fontSize: 15 }} />}
                sx={{
                  textTransform: 'none',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  bgcolor: '#2563EB',
                  borderRadius: '8px',
                }}
              >
                {explanation ? 'Regenerate' : 'Explain Problem'}
              </Button>
            </Box>

            {explanation ? (
              <Typography sx={{ fontSize: '0.82rem', color: '#334155', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                {explanation}
              </Typography>
            ) : (
              <Typography sx={{ fontSize: '0.78rem', color: '#64748B' }}>
                Get an intuitive breakdown with an ASCII trace walkthrough and boundary conditions in &lt; 200 tokens.
              </Typography>
            )}
          </Paper>

          {/* Progressive Socratic Hints Section */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography sx={{ fontWeight: 800, fontSize: '0.88rem', color: '#0F172A' }}>
                Socratic Progressive Hints
              </Typography>
              <Typography sx={{ fontSize: '0.72rem', color: '#64748B' }}>
                Level 1 $\rightarrow$ 2 $\rightarrow$ 3
              </Typography>
            </Box>

            {/* Hint Tier 1 */}
            <Paper
              elevation={0}
              sx={{
                p: 1.75,
                borderRadius: '10px',
                border: hints[1] ? '1.5px solid #BBF7D0' : '1px solid #E2E8F0',
                bgcolor: hints[1] ? '#F0FDF4' : '#FFFFFF',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: hints[1] ? 1 : 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LightbulbRoundedIcon sx={{ fontSize: 18, color: '#16A34A' }} />
                  <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: '#0F172A' }}>
                    Hint 1: Conceptual Direction
                  </Typography>
                </Box>
                {!hints[1] && (
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleFetchHint(1)}
                    disabled={loadingHintLevel === 1}
                    sx={{ textTransform: 'none', fontSize: '0.72rem', fontWeight: 700, borderRadius: '6px' }}
                  >
                    {loadingHintLevel === 1 ? <CircularProgress size={12} /> : 'Reveal Hint 1'}
                  </Button>
                )}
              </Box>
              {hints[1] && (
                <Typography sx={{ fontSize: '0.8rem', color: '#166534', lineHeight: 1.55 }}>
                  {hints[1]}
                </Typography>
              )}
            </Paper>

            {/* Hint Tier 2 */}
            <Paper
              elevation={0}
              sx={{
                p: 1.75,
                borderRadius: '10px',
                border: hints[2] ? '1.5px solid #BFDBFE' : '1px solid #E2E8F0',
                bgcolor: hints[2] ? '#EFF6FF' : '#FFFFFF',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: hints[2] ? 1 : 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CodeRoundedIcon sx={{ fontSize: 18, color: '#2563EB' }} />
                  <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: '#0F172A' }}>
                    Hint 2: Invariant & Space-Time Target
                  </Typography>
                </Box>
                {!hints[2] && (
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleFetchHint(2)}
                    disabled={loadingHintLevel === 2}
                    sx={{ textTransform: 'none', fontSize: '0.72rem', fontWeight: 700, borderRadius: '6px' }}
                  >
                    {loadingHintLevel === 2 ? <CircularProgress size={12} /> : 'Reveal Hint 2'}
                  </Button>
                )}
              </Box>
              {hints[2] && (
                <Typography sx={{ fontSize: '0.8rem', color: '#1E40AF', lineHeight: 1.55 }}>
                  {hints[2]}
                </Typography>
              )}
            </Paper>

            {/* Hint Tier 3 */}
            <Paper
              elevation={0}
              sx={{
                p: 1.75,
                borderRadius: '10px',
                border: hints[3] ? '1.5px solid #FDE68A' : '1px solid #E2E8F0',
                bgcolor: hints[3] ? '#FFFBEB' : '#FFFFFF',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: hints[3] ? 1 : 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleRoundedIcon sx={{ fontSize: 18, color: '#D97706' }} />
                  <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: '#0F172A' }}>
                    Hint 3: Pseudocode & Edge Cases
                  </Typography>
                </Box>
                {!hints[3] && (
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleFetchHint(3)}
                    disabled={loadingHintLevel === 3}
                    sx={{ textTransform: 'none', fontSize: '0.72rem', fontWeight: 700, borderRadius: '6px' }}
                  >
                    {loadingHintLevel === 3 ? <CircularProgress size={12} /> : 'Reveal Hint 3'}
                  </Button>
                )}
              </Box>
              {hints[3] && (
                <Typography sx={{ fontSize: '0.8rem', color: '#92400E', lineHeight: 1.55, whiteSpace: 'pre-line' }}>
                  {hints[3]}
                </Typography>
              )}
            </Paper>
          </Box>
        </Box>
      )}

      {/* Tab 2: Debug & Test Case Diagnosis */}
      {activeTab === 1 && (
        <Box sx={{ flex: 1, overflowY: 'auto', p: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ p: 2, bgcolor: '#FEF2F2', borderRadius: '12px', border: '1px solid #FECACA' }}>
            <Typography sx={{ fontWeight: 800, fontSize: '0.86rem', color: '#991B1B', mb: 0.5 }}>
              Sandbox Execution Diagnosis
            </Typography>
            <Typography sx={{ fontSize: '0.78rem', color: '#7F1D1D', mb: 1.5 }}>
              Status: <strong>{lastExecutionVerdict || 'Ready for Diagnosis'}</strong>
            </Typography>

            <Button
              variant="contained"
              size="small"
              onClick={handleDiagnose}
              disabled={isDiagnosing}
              startIcon={isDiagnosing ? <CircularProgress size={14} color="inherit" /> : <BugReportRoundedIcon sx={{ fontSize: 16 }} />}
              sx={{ bgcolor: '#DC2626', textTransform: 'none', fontWeight: 700, fontSize: '0.78rem', borderRadius: '8px' }}
            >
              {isDiagnosing ? 'Analyzing Logic...' : 'Diagnose Why It Failed'}
            </Button>
          </Box>

          {diagnosis && (
            <Paper elevation={0} sx={{ p: 2, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px' }}>
              <Typography sx={{ fontWeight: 800, fontSize: '0.82rem', color: '#0F172A', mb: 1 }}>
                Phi-4 Diagnostic Analysis:
              </Typography>
              <Typography sx={{ fontSize: '0.82rem', color: '#334155', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                {diagnosis}
              </Typography>
            </Paper>
          )}
        </Box>
      )}

      {/* Tab 3: Interactive Socratic Chat */}
      {activeTab === 2 && (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Box sx={{ flex: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {chatMessages.map((msg, idx) => (
              <Box
                key={idx}
                sx={{
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  p: 1.5,
                  borderRadius: msg.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                  bgcolor: msg.sender === 'user' ? '#2563EB' : '#F1F5F9',
                  color: msg.sender === 'user' ? '#FFFFFF' : '#0F172A',
                }}
              >
                <Typography sx={{ fontSize: '0.82rem', lineHeight: 1.55, whiteSpace: 'pre-line' }}>
                  {msg.text}
                </Typography>
              </Box>
            ))}
            {isSendingChat && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1 }}>
                <CircularProgress size={16} />
                <Typography sx={{ fontSize: '0.75rem', color: '#64748B' }}>Phi-4 is thinking...</Typography>
              </Box>
            )}
          </Box>

          <Divider />

          <Box sx={{ p: 1.5, bgcolor: '#FFFFFF', display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Ask a question about this problem..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              sx={{ '& input': { fontSize: '0.82rem' } }}
            />
            <Button
              variant="contained"
              disabled={!chatInput.trim() || isSendingChat}
              onClick={handleSendMessage}
              sx={{ minWidth: 44, px: 1.5, bgcolor: '#2563EB', borderRadius: '8px' }}
            >
              <SendRoundedIcon sx={{ fontSize: 18 }} />
            </Button>
          </Box>
        </Box>
      )}
    </Drawer>
  );
}
