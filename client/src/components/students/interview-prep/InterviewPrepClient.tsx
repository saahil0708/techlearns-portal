'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Box,
  Typography,
  Card,
  Chip,
  Button,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Tabs,
  Tab,
  Drawer,
  Rating,
  Divider,
} from '@mui/material';

// Icons
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import LaunchRoundedIcon from '@mui/icons-material/LaunchRounded';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import HubRoundedIcon from '@mui/icons-material/HubRounded';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';

import { apiService } from '@/lib/api-service';
import { useToast } from '@/context/ToastContext';
import { MuiCenterLoader } from '@/components/shared/MuiLoadingFallback';

interface CompanyQuestion {
  id: string;
  slug: string;
  title: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  topic: string;
  frequency: number;
  interviewStage: string;
  expectedMinutes: number;
  hints: string[];
}

interface CompanyTrack {
  id: string;
  name: string;
  slug: string;
  tier: string;
  logo: string;
  overview: string;
  difficulty: string;
  acceptanceRate: number;
  rounds: { stage: string; name: string; description: string; duration: string }[];
  focusTopics: string[];
  totalQuestions: number;
  questions: CompanyQuestion[];
}

interface MockAssessment {
  id: string;
  title: string;
  companySlug: string;
  companyName: string;
  tier: string;
  durationMinutes: number;
  passingScore: number;
  description: string;
  problems: {
    id: string;
    slug: string;
    title: string;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    topic: string;
    points: number;
  }[];
}

interface InterviewGuide {
  id: string;
  title: string;
  category: string;
  readingTimeMinutes: number;
  summary: string;
  content: string;
  tags: string[];
}

function sanitizeCsv(val: any): string {
  if (val === null || val === undefined) return '""';
  let str = String(val);
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }
  return `"${str.replace(/"/g, '""')}"`;
}

export default function InterviewPrepClient() {
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'questions' | 'assessments' | 'guides'>('questions');
  const [selectedTier, setSelectedTier] = useState<string>('ALL');
  const [selectedCompanySlug, setSelectedCompanySlug] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL');

  // Server Data
  const [companies, setCompanies] = useState<CompanyTrack[]>([]);
  const [assessments, setAssessments] = useState<MockAssessment[]>([]);
  const [guides, setGuides] = useState<InterviewGuide[]>([]);
  const [readiness, setReadiness] = useState<{
    overallReadinessPct: number;
    totalSolvedProblems: number;
    targetCompany: string;
    strengths: string[];
    weaknesses: string[];
  } | null>(null);

  // Modals & Drawers
  const [activeCompanyDrawer, setActiveCompanyDrawer] = useState<CompanyTrack | null>(null);
  const [hintsModalQuestion, setHintsModalQuestion] = useState<CompanyQuestion | null>(null);
  const [activeAssessmentModal, setActiveAssessmentModal] = useState<MockAssessment | null>(null);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [assessmentResult, setAssessmentResult] = useState<any | null>(null);
  const [assessmentSubmitting, setAssessmentSubmitting] = useState(false);

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const loadData = async () => {
    setLoading(true);
    try {
      const [compsRes, assessRes, guidesRes, readinessRes] = await Promise.all([
        apiService.getInterviewCompanies().catch(() => []),
        apiService.getMockAssessments().catch(() => []),
        apiService.getInterviewGuides().catch(() => []),
        apiService.getUserInterviewReadiness().catch(() => null),
      ]);

      setCompanies(Array.isArray(compsRes) ? compsRes : []);
      setAssessments(Array.isArray(assessRes) ? assessRes : []);
      setGuides(Array.isArray(guidesRes) ? guidesRes : []);
      setReadiness(readinessRes);
    } catch {
      toast.error('Failed to load interview preparation data.', 'Connection Error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Aggregate questions across companies with company metadata
  const allQuestions = useMemo(() => {
    const list: (CompanyQuestion & { companyName: string; companySlug: string; companyTier: string })[] = [];
    companies.forEach((comp) => {
      comp.questions.forEach((q) => {
        list.push({
          ...q,
          companyName: comp.name,
          companySlug: comp.slug,
          companyTier: comp.tier,
        });
      });
    });
    return list;
  }, [companies]);

  // Filter questions
  const filteredQuestions = useMemo(() => {
    return allQuestions.filter((q) => {
      const matchTier = selectedTier === 'ALL' || q.companyTier === selectedTier;
      const matchCompany = selectedCompanySlug === 'ALL' || q.companySlug === selectedCompanySlug;
      const matchDifficulty = selectedDifficulty === 'ALL' || q.difficulty === selectedDifficulty;
      const matchSearch =
        searchQuery === '' ||
        q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.companyName.toLowerCase().includes(searchQuery.toLowerCase());

      return matchTier && matchCompany && matchDifficulty && matchSearch;
    });
  }, [allQuestions, selectedTier, selectedCompanySlug, selectedDifficulty, searchQuery]);

  // Filter assessments
  const filteredAssessments = useMemo(() => {
    return assessments.filter((a) => {
      const matchTier = selectedTier === 'ALL' || a.tier === selectedTier;
      const matchCompany = selectedCompanySlug === 'ALL' || a.companySlug === selectedCompanySlug;
      const matchSearch =
        searchQuery === '' ||
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.companyName.toLowerCase().includes(searchQuery.toLowerCase());

      return matchTier && matchCompany && matchSearch;
    });
  }, [assessments, selectedTier, selectedCompanySlug, searchQuery]);

  // CSV Export
  const handleExportCsv = () => {
    if (filteredQuestions.length === 0) {
      toast.info('No questions available to export.', 'Export Empty');
      return;
    }

    const headers = ['Company', 'Problem Title', 'Difficulty', 'Topic', 'Frequency %', 'Interview Stage', 'Est. Time (Mins)', 'Problem URL'];
    const rows = filteredQuestions.map((q) => [
      sanitizeCsv(q.companyName),
      sanitizeCsv(q.title),
      sanitizeCsv(q.difficulty),
      sanitizeCsv(q.topic),
      sanitizeCsv(`${q.frequency}%`),
      sanitizeCsv(q.interviewStage),
      sanitizeCsv(q.expectedMinutes),
      sanitizeCsv(`/problems/${q.slug}`),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `interview_prep_questions_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${filteredQuestions.length} interview questions to CSV!`, 'Export Complete');
  };

  // Start Assessment Handler
  const handleStartAssessment = async (assess: MockAssessment) => {
    setActiveAssessmentModal(assess);
    setAssessmentResult(null);
    setActiveSessionId(null);
    try {
      const session = await apiService.startMockAssessment(assess.id);
      setActiveSessionId(session.sessionId);
      toast.info(`Assessment started! You have ${assess.durationMinutes} minutes.`, assess.title);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to start assessment session.', 'Start Failed');
      setActiveAssessmentModal(null);
    }
  };

  // Submit Assessment Handler
  const handleSubmitAssessment = async () => {
    if (!activeAssessmentModal || !activeSessionId) return;
    setAssessmentSubmitting(true);
    try {
      const res = await apiService.submitMockAssessment(activeSessionId, {
        answers: activeAssessmentModal.problems.map((p) => ({
          problemId: p.id,
        })),
      });
      setAssessmentResult(res);
      toast.success(`Assessment submitted! Score: ${res.score}% (${res.verdict})`, 'Evaluation Complete');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to submit assessment for evaluation.', 'Evaluation Failed');
    } finally {
      setAssessmentSubmitting(false);
    }
  };

  if (loading) {
    return <MuiCenterLoader minHeight="60vh" />;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
      {/* ========================================================================= */}
      {/* 1. HERO BANNER & KPI METRICS */}
      {/* ========================================================================= */}
      <Card
        elevation={0}
        sx={{
          borderRadius: '24px',
          background: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 60%, #2563EB 100%)',
          color: '#FFFFFF',
          p: { xs: 3, md: 4.5 },
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 12px 36px rgba(37, 99, 235, 0.16)',
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 4, alignItems: { lg: 'center' }, justifyContent: 'space-between' }}>
          <Box sx={{ maxWidth: 700 }}>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.5, borderRadius: '9999px', bgcolor: 'rgba(255, 255, 255, 0.12)', backdropFilter: 'blur(8px)', mb: 2 }}>
              <AutoAwesomeRoundedIcon sx={{ fontSize: 15, color: '#60A5FA' }} />
              <Typography sx={{ fontSize: '0.78rem', fontWeight: 800, color: '#E0E7FF', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                FAANG & Tier-1 Company Tracks
              </Typography>
            </Box>

            <Typography variant="h3" sx={{ fontWeight: 900, fontSize: { xs: '1.8rem', md: '2.4rem' }, letterSpacing: '-0.03em', lineHeight: 1.2, mb: 1.5 }}>
              Interview Preparation Hub
            </Typography>

            <Typography sx={{ color: '#CBD5E1', fontSize: '0.98rem', lineHeight: 1.6, maxWidth: 620 }}>
              Master curated algorithmic questions asked by top tech giants in the last 6 months. Simulate real-time timed technical screens and practice system design playbooks.
            </Typography>
          </Box>

          {/* KPI Stat Cards Grid */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' }, gap: 2, minWidth: { lg: 480 } }}>
            <Box sx={{ bgcolor: 'rgba(255, 255, 255, 0.08)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '16px', p: 2, textAlign: 'center' }}>
              <Typography sx={{ color: '#93C5FD', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Target Company</Typography>
              <Typography sx={{ color: '#FFFFFF', fontSize: '1.4rem', fontWeight: 900, mt: 0.5 }}>
                {readiness ? (readiness.targetCompany ?? '—') : '—'}
              </Typography>
            </Box>

            <Box sx={{ bgcolor: 'rgba(255, 255, 255, 0.08)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '16px', p: 2, textAlign: 'center' }}>
              <Typography sx={{ color: '#86EFAC', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Readiness Score</Typography>
              <Typography sx={{ color: '#4ADE80', fontSize: '1.4rem', fontWeight: 900, mt: 0.5 }}>
                {readiness && readiness.overallReadinessPct !== undefined && readiness.overallReadinessPct !== null
                  ? `${readiness.overallReadinessPct}%`
                  : '—'}
              </Typography>
            </Box>

            <Box sx={{ bgcolor: 'rgba(255, 255, 255, 0.08)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '16px', p: 2, textAlign: 'center' }}>
              <Typography sx={{ color: '#FDE047', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Curated Questions</Typography>
              <Typography sx={{ color: '#FFFFFF', fontSize: '1.4rem', fontWeight: 900, mt: 0.5 }}>{allQuestions.length}</Typography>
            </Box>

            <Box sx={{ bgcolor: 'rgba(255, 255, 255, 0.08)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '16px', p: 2, textAlign: 'center' }}>
              <Typography sx={{ color: '#E9D5FF', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Active Companies</Typography>
              <Typography sx={{ color: '#FFFFFF', fontSize: '1.4rem', fontWeight: 900, mt: 0.5 }}>{companies.length}</Typography>
            </Box>
          </Box>
        </Box>
      </Card>

      {/* ========================================================================= */}
      {/* 2. NAVIGATION TABS (QUESTIONS / ASSESSMENTS / GUIDES) */}
      {/* ========================================================================= */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { sm: 'center' }, gap: 2, borderBottom: '1px solid #E2E8F0', pb: 1 }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          sx={{
            '& .MuiTabs-indicator': { bgcolor: '#2563EB', height: 3, borderRadius: '3px' },
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 800,
              fontSize: '0.95rem',
              color: '#64748B',
              minHeight: 44,
              px: 2,
              '&.Mui-selected': { color: '#2563EB' },
            },
          }}
        >
          <Tab value="questions" label={`Company Questions (${filteredQuestions.length})`} />
          <Tab value="assessments" label={`Mock Assessments (${assessments.length})`} />
          <Tab value="guides" label={`Strategy & System Design Playbooks (${guides.length})`} />
        </Tabs>

        {activeTab === 'questions' && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<DownloadRoundedIcon />}
            onClick={handleExportCsv}
            sx={{
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 700,
              borderColor: '#CBD5E1',
              color: '#334155',
              bgcolor: '#FFFFFF',
              '&:hover': { bgcolor: '#F8FAFC', borderColor: '#94A3B8' },
            }}
          >
            Export to CSV
          </Button>
        )}
      </Box>

      {/* ========================================================================= */}
      {/* 3. COMPANY & TIER FILTERS */}
      {/* ========================================================================= */}
      <Card
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: '20px',
          bgcolor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.03)',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {/* Tier Selector Pills */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: '#64748B', mr: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <FilterListRoundedIcon sx={{ fontSize: 16 }} /> TIER:
          </Typography>
          {['ALL', 'FAANG', 'BIG_TECH', 'FINTECH', 'UNICORN'].map((tier) => (
            <Chip
              key={tier}
              label={tier === 'ALL' ? 'All Companies' : tier.replace('_', ' ')}
              onClick={() => {
                setSelectedTier(tier);
                setSelectedCompanySlug('ALL');
                setPage(0);
              }}
              sx={{
                fontWeight: 800,
                fontSize: '0.78rem',
                cursor: 'pointer',
                borderRadius: '8px',
                bgcolor: selectedTier === tier ? '#2563EB' : '#F1F5F9',
                color: selectedTier === tier ? '#FFFFFF' : '#475569',
                '&:hover': { bgcolor: selectedTier === tier ? '#1D4ED8' : '#E2E8F0' },
              }}
            />
          ))}
        </Box>

        {/* Company Quick Select Horizontal Pills */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', pt: 1, borderTop: '1px solid #F1F5F9' }}>
          <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: '#64748B', mr: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <BusinessRoundedIcon sx={{ fontSize: 16 }} /> COMPANY:
          </Typography>
          <Chip
            label="All Companies"
            onClick={() => {
              setSelectedCompanySlug('ALL');
              setPage(0);
            }}
            sx={{
              fontWeight: 800,
              fontSize: '0.78rem',
              cursor: 'pointer',
              borderRadius: '8px',
              bgcolor: selectedCompanySlug === 'ALL' ? '#0F172A' : '#F8FAFC',
              color: selectedCompanySlug === 'ALL' ? '#FFFFFF' : '#475569',
              border: '1px solid #E2E8F0',
            }}
          />
          {companies
            .filter((c) => selectedTier === 'ALL' || c.tier === selectedTier)
            .map((c) => (
              <Chip
                key={c.slug}
                label={`${c.name} (${c.questions.length})`}
                onClick={() => {
                  setSelectedCompanySlug(c.slug);
                  setPage(0);
                }}
                onDelete={() => setActiveCompanyDrawer(c)}
                deleteIcon={
                  <Tooltip title="View Company Hiring Pipeline" arrow>
                    <LaunchRoundedIcon sx={{ fontSize: '13px !important' }} />
                  </Tooltip>
                }
                sx={{
                  fontWeight: 800,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  borderRadius: '8px',
                  bgcolor: selectedCompanySlug === c.slug ? '#0F172A' : '#FFFFFF',
                  color: selectedCompanySlug === c.slug ? '#FFFFFF' : '#334155',
                  border: selectedCompanySlug === c.slug ? '1px solid #0F172A' : '1px solid #E2E8F0',
                  '&:hover': { bgcolor: selectedCompanySlug === c.slug ? '#1E293B' : '#F1F5F9' },
                }}
              />
            ))}
        </Box>

        {/* Search & Difficulty Filter Bar */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, alignItems: { md: 'center' }, pt: 1, borderTop: '1px solid #F1F5F9' }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search problems by name, topic (e.g., Sliding Window, Graph BFS, Tree DP)..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(0);
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon sx={{ color: '#94A3B8', fontSize: 18 }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                bgcolor: '#F8FAFC',
                fontSize: '0.86rem',
                '&:hover': { borderColor: '#CBD5E1' },
                '&.Mui-focused': { borderColor: '#2563EB', bgcolor: '#FFFFFF' },
              },
            }}
          />

          <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
            {['ALL', 'EASY', 'MEDIUM', 'HARD'].map((diff) => (
              <Button
                key={diff}
                size="small"
                variant={selectedDifficulty === diff ? 'contained' : 'outlined'}
                onClick={() => {
                  setSelectedDifficulty(diff);
                  setPage(0);
                }}
                sx={{
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontWeight: 800,
                  fontSize: '0.78rem',
                  px: 1.75,
                  bgcolor:
                    selectedDifficulty === diff
                      ? diff === 'EASY'
                        ? '#16A34A'
                        : diff === 'MEDIUM'
                        ? '#D97706'
                        : diff === 'HARD'
                        ? '#DC2626'
                        : '#2563EB'
                      : 'transparent',
                  color: selectedDifficulty === diff ? '#FFFFFF' : '#64748B',
                  borderColor: '#E2E8F0',
                  '&:hover': {
                    bgcolor:
                      selectedDifficulty === diff
                        ? undefined
                        : '#F1F5F9',
                  },
                }}
              >
                {diff}
              </Button>
            ))}
          </Box>
        </Box>
      </Card>

      {/* ========================================================================= */}
      {/* 4. TAB 1: STRUCTURED LIST TABLE OF QUESTIONS (RULE 10 STANDARD) */}
      {/* ========================================================================= */}
      {activeTab === 'questions' && (
        <Card
          elevation={0}
          sx={{
            borderRadius: '20px',
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
            overflow: 'hidden',
          }}
        >
          <TableContainer>
            <Table sx={{ minWidth: 800 }}>
              <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.78rem', py: 1.75 }}>COMPANY</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.78rem', py: 1.75 }}>PROBLEM TITLE</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.78rem', py: 1.75 }}>DIFFICULTY</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.78rem', py: 1.75 }}>TOPIC / PATTERN</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.78rem', py: 1.75 }}>FREQUENCY</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.78rem', py: 1.75 }}>STAGE</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800, color: '#475569', fontSize: '0.78rem', py: 1.75 }}>ACTIONS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredQuestions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} sx={{ textAlign: 'center', py: 8 }}>
                      <Typography sx={{ color: '#64748B', fontWeight: 700 }}>
                        No questions match the selected filters.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredQuestions
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((q) => (
                      <TableRow
                        key={`${q.companySlug}-${q.id}`}
                        hover
                        sx={{
                          '&:last-child td, &:last-child th': { border: 0 },
                          transition: 'background-color 0.15s ease',
                        }}
                      >
                        {/* Company */}
                        <TableCell sx={{ py: 2 }}>
                          <Chip
                            label={q.companyName}
                            size="small"
                            onClick={() => {
                              const found = companies.find((c) => c.slug === q.companySlug);
                              if (found) setActiveCompanyDrawer(found);
                            }}
                            sx={{
                              fontWeight: 800,
                              fontSize: '0.74rem',
                              bgcolor: '#EFF6FF',
                              color: '#2563EB',
                              cursor: 'pointer',
                              borderRadius: '6px',
                              '&:hover': { bgcolor: '#DBEAFE' },
                            }}
                          />
                        </TableCell>

                        {/* Title */}
                        <TableCell sx={{ py: 2 }}>
                          <Link
                            href={`/problems/${q.slug}`}
                            style={{ textDecoration: 'none' }}
                          >
                            <Typography
                              sx={{
                                fontWeight: 700,
                                fontSize: '0.9rem',
                                color: '#0F172A',
                                '&:hover': { color: '#2563EB', textDecoration: 'underline' },
                              }}
                            >
                              {q.title}
                            </Typography>
                          </Link>
                          <Typography sx={{ fontSize: '0.75rem', color: '#94A3B8', mt: 0.25 }}>
                            Est. {q.expectedMinutes} mins
                          </Typography>
                        </TableCell>

                        {/* Difficulty */}
                        <TableCell sx={{ py: 2 }}>
                          <Chip
                            label={q.difficulty}
                            size="small"
                            sx={{
                              fontWeight: 800,
                              fontSize: '0.72rem',
                              height: 24,
                              borderRadius: '6px',
                              bgcolor:
                                q.difficulty === 'EASY'
                                  ? '#F0FDF4'
                                  : q.difficulty === 'MEDIUM'
                                  ? '#FFFBEB'
                                  : '#FEF2F2',
                              color:
                                q.difficulty === 'EASY'
                                  ? '#16A34A'
                                  : q.difficulty === 'MEDIUM'
                                  ? '#D97706'
                                  : '#DC2626',
                              border:
                                q.difficulty === 'EASY'
                                  ? '1px solid #BBF7D0'
                                  : q.difficulty === 'MEDIUM'
                                  ? '1px solid #FDE68A'
                                  : '1px solid #FECACA',
                            }}
                          />
                        </TableCell>

                        {/* Topic */}
                        <TableCell sx={{ py: 2 }}>
                          <Chip
                            label={q.topic}
                            size="small"
                            sx={{
                              bgcolor: '#F8FAFC',
                              color: '#334155',
                              border: '1px solid #E2E8F0',
                              fontWeight: 600,
                              fontSize: '0.75rem',
                            }}
                          />
                        </TableCell>

                        {/* Frequency */}
                        <TableCell sx={{ py: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: 44, bgcolor: '#E2E8F0', borderRadius: '4px', height: 6, overflow: 'hidden' }}>
                              <Box sx={{ width: `${q.frequency}%`, bgcolor: q.frequency > 90 ? '#2563EB' : '#059669', height: '100%' }} />
                            </Box>
                            <Typography sx={{ fontSize: '0.78rem', fontWeight: 800, color: '#334155' }}>
                              {q.frequency}%
                            </Typography>
                          </Box>
                        </TableCell>

                        {/* Stage */}
                        <TableCell sx={{ py: 2 }}>
                          <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748B' }}>
                            {q.interviewStage.replace('_', ' ')}
                          </Typography>
                        </TableCell>

                        {/* Actions */}
                        <TableCell align="right" sx={{ py: 2 }}>
                          <Box sx={{ display: 'inline-flex', gap: 1 }}>
                            {q.hints && q.hints.length > 0 && (
                              <Tooltip title="View Interview Hints" arrow>
                                <IconButton
                                  size="small"
                                  onClick={() => setHintsModalQuestion(q)}
                                  sx={{
                                    border: '1px solid #E2E8F0',
                                    borderRadius: '8px',
                                    color: '#D97706',
                                    bgcolor: '#FFFBEB',
                                    '&:hover': { bgcolor: '#FEF3C7' },
                                  }}
                                >
                                  <LightbulbOutlinedIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                              </Tooltip>
                            )}

                            <Link href={`/problems/${q.slug}`} style={{ textDecoration: 'none' }}>
                              <Button
                                size="small"
                                variant="contained"
                                endIcon={<PlayArrowRoundedIcon sx={{ fontSize: 16 }} />}
                                sx={{
                                  borderRadius: '8px',
                                  textTransform: 'none',
                                  fontWeight: 800,
                                  fontSize: '0.76rem',
                                  px: 1.5,
                                  py: 0.5,
                                  bgcolor: '#2563EB',
                                  boxShadow: 'none',
                                  '&:hover': { bgcolor: '#1D4ED8', boxShadow: 'none' },
                                }}
                              >
                                Solve
                              </Button>
                            </Link>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={filteredQuestions.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            sx={{ borderTop: '1px solid #E2E8F0' }}
          />
        </Card>
      )}

      {/* ========================================================================= */}
      {/* 5. TAB 2: MOCK ASSESSMENTS (RULE 10 LIST TABLE) */}
      {/* ========================================================================= */}
      {activeTab === 'assessments' && (
        <Card
          elevation={0}
          sx={{
            borderRadius: '20px',
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
            overflow: 'hidden',
          }}
        >
          <TableContainer>
            <Table sx={{ minWidth: 800 }}>
              <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.78rem', py: 1.75 }}>ASSESSMENT</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.78rem', py: 1.75 }}>COMPANY</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.78rem', py: 1.75 }}>DURATION</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.78rem', py: 1.75 }}>PASSING BAR</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.78rem', py: 1.75 }}>PROBLEMS INCLUDED</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800, color: '#475569', fontSize: '0.78rem', py: 1.75 }}>SIMULATE</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAssessments.map((assess) => (
                  <TableRow key={assess.id} hover>
                    <TableCell sx={{ py: 2.5 }}>
                      <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.94rem' }}>
                        {assess.title}
                      </Typography>
                      <Typography sx={{ color: '#64748B', fontSize: '0.78rem', mt: 0.25 }}>
                        {assess.description}
                      </Typography>
                    </TableCell>

                    <TableCell sx={{ py: 2.5 }}>
                      <Chip
                        label={assess.companyName}
                        size="small"
                        sx={{ fontWeight: 800, fontSize: '0.75rem', bgcolor: '#EFF6FF', color: '#2563EB' }}
                      />
                    </TableCell>

                    <TableCell sx={{ py: 2.5 }}>
                      <Chip
                        icon={<TimerOutlinedIcon sx={{ fontSize: '14px !important', color: '#0284C7 !important' }} />}
                        label={`${assess.durationMinutes} Mins`}
                        size="small"
                        sx={{ bgcolor: '#F0F9FF', color: '#0284C7', fontWeight: 700, fontSize: '0.75rem' }}
                      />
                    </TableCell>

                    <TableCell sx={{ py: 2.5 }}>
                      <Chip
                        label={`≥ ${assess.passingScore}%`}
                        size="small"
                        sx={{ bgcolor: '#F0FDF4', color: '#16A34A', fontWeight: 800, fontSize: '0.75rem', border: '1px solid #BBF7D0' }}
                      />
                    </TableCell>

                    <TableCell sx={{ py: 2.5 }}>
                      <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                        {assess.problems.map((p) => (
                          <Chip
                            key={p.id}
                            label={`${p.title} (${p.difficulty})`}
                            size="small"
                            sx={{
                              bgcolor: '#F8FAFC',
                              color: '#334155',
                              border: '1px solid #E2E8F0',
                              fontSize: '0.72rem',
                            }}
                          />
                        ))}
                      </Box>
                    </TableCell>

                    <TableCell align="right" sx={{ py: 2.5 }}>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<PlayArrowRoundedIcon />}
                        onClick={() => handleStartAssessment(assess)}
                        sx={{
                          borderRadius: '10px',
                          textTransform: 'none',
                          fontWeight: 800,
                          fontSize: '0.82rem',
                          px: 2,
                          py: 0.75,
                          bgcolor: '#2563EB',
                          boxShadow: 'none',
                          '&:hover': { bgcolor: '#1D4ED8' },
                        }}
                      >
                        Start OA
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* 6. TAB 3: STRATEGY & SYSTEM DESIGN PLAYBOOKS */}
      {/* ========================================================================= */}
      {activeTab === 'guides' && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
          {guides.map((g) => (
            <Card
              key={g.id}
              elevation={0}
              sx={{
                p: 3,
                borderRadius: '20px',
                bgcolor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease',
                '&:hover': {
                  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
                  borderColor: '#CBD5E1',
                },
              }}
            >
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Chip
                    label={g.category.replace('_', ' ')}
                    size="small"
                    sx={{ bgcolor: '#EFF6FF', color: '#2563EB', fontWeight: 800, fontSize: '0.72rem' }}
                  />
                  <Typography sx={{ color: '#94A3B8', fontSize: '0.76rem', fontWeight: 700 }}>
                    {g.readingTimeMinutes} min read
                  </Typography>
                </Box>

                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.05rem', lineHeight: 1.35, mb: 1 }}>
                  {g.title}
                </Typography>

                <Typography sx={{ color: '#64748B', fontSize: '0.84rem', lineHeight: 1.5, mb: 2.5 }}>
                  {g.summary}
                </Typography>
              </Box>

              <Box sx={{ pt: 2, borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  {g.tags.slice(0, 2).map((t) => (
                    <Chip key={t} label={t} size="small" sx={{ fontSize: '0.7rem', height: 22, bgcolor: '#F8FAFC' }} />
                  ))}
                </Box>
                <Button
                  size="small"
                  onClick={() => {
                    toast.info(`Opened "${g.title}" strategy playbook.`, 'Playbook');
                  }}
                  sx={{ textTransform: 'none', fontWeight: 800, color: '#2563EB' }}
                >
                  Read Playbook →
                </Button>
              </Box>
            </Card>
          ))}
        </Box>
      )}

      {/* ========================================================================= */}
      {/* 7. HINTS MODAL */}
      {/* ========================================================================= */}
      <Dialog
        open={Boolean(hintsModalQuestion)}
        onClose={() => setHintsModalQuestion(null)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: '20px', p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: '1.1rem', color: '#0F172A', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>💡 Solution Hints & Strategy</span>
          <IconButton size="small" onClick={() => setHintsModalQuestion(null)}>
            <CloseRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {hintsModalQuestion && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography sx={{ fontWeight: 800, color: '#2563EB', fontSize: '0.95rem' }}>
                {hintsModalQuestion.title}
              </Typography>
              <Typography sx={{ color: '#64748B', fontSize: '0.84rem' }}>
                Topic: <strong>{hintsModalQuestion.topic}</strong> • Stage: <strong>{hintsModalQuestion.interviewStage}</strong>
              </Typography>

              <Divider />

              {hintsModalQuestion.hints?.map((hint, idx) => (
                <Box key={idx} sx={{ p: 2, bgcolor: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '12px' }}>
                  <Typography sx={{ color: '#92400E', fontSize: '0.88rem', fontWeight: 600, lineHeight: 1.5 }}>
                    <strong>Hint #{idx + 1}:</strong> {hint}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          {hintsModalQuestion && (
            <Link href={`/problems/${hintsModalQuestion.slug}`} style={{ textDecoration: 'none' }}>
              <Button variant="contained" sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 800, bgcolor: '#2563EB' }}>
                Open Coding Workspace
              </Button>
            </Link>
          )}
        </DialogActions>
      </Dialog>

      {/* ========================================================================= */}
      {/* 8. COMPANY HIRING PIPELINE DRAWER */}
      {/* ========================================================================= */}
      <Drawer
        anchor="right"
        open={Boolean(activeCompanyDrawer)}
        onClose={() => setActiveCompanyDrawer(null)}
        slotProps={{ paper: { sx: { width: { xs: '100%', sm: 460 }, p: 3.5, bgcolor: '#FFFFFF' } } }}
      >
        {activeCompanyDrawer && (
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Chip
                  label={activeCompanyDrawer.tier}
                  size="small"
                  sx={{ bgcolor: '#EFF6FF', color: '#2563EB', fontWeight: 800 }}
                />
                <IconButton size="small" onClick={() => setActiveCompanyDrawer(null)}>
                  <CloseRoundedIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </Box>

              <Typography variant="h5" sx={{ fontWeight: 900, color: '#0F172A', mb: 1 }}>
                {activeCompanyDrawer.name}
              </Typography>
              <Typography sx={{ color: '#64748B', fontSize: '0.88rem', lineHeight: 1.5, mb: 3 }}>
                {activeCompanyDrawer.overview}
              </Typography>

              <Typography sx={{ fontWeight: 800, fontSize: '0.92rem', color: '#0F172A', mb: 1.5 }}>
                🎯 Top Focus Topics
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
                {activeCompanyDrawer.focusTopics.map((t) => (
                  <Chip key={t} label={t} size="small" sx={{ bgcolor: '#F1F5F9', color: '#334155', fontWeight: 700 }} />
                ))}
              </Box>

              <Typography sx={{ fontWeight: 800, fontSize: '0.92rem', color: '#0F172A', mb: 2 }}>
                🏢 5-Stage Hiring Pipeline
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {activeCompanyDrawer.rounds.map((r, idx) => (
                  <Box key={idx} sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.88rem' }}>
                        Round {idx + 1}: {r.name}
                      </Typography>
                      <Chip label={r.duration} size="small" sx={{ fontSize: '0.7rem', height: 20, bgcolor: '#E2E8F0' }} />
                    </Box>
                    <Typography sx={{ color: '#64748B', fontSize: '0.8rem', lineHeight: 1.4 }}>
                      {r.description}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>

            <Button
              variant="contained"
              fullWidth
              onClick={() => {
                setSelectedCompanySlug(activeCompanyDrawer.slug);
                setPage(0);
                setActiveCompanyDrawer(null);
                setActiveTab('questions');
              }}
              sx={{ borderRadius: '12px', py: 1.25, mt: 3, bgcolor: '#2563EB', fontWeight: 800, textTransform: 'none' }}
            >
              Filter {activeCompanyDrawer.name} Questions
            </Button>
          </Box>
        )}
      </Drawer>

      {/* ========================================================================= */}
      {/* 9. MOCK ASSESSMENT SIMULATOR MODAL */}
      {/* ========================================================================= */}
      <Dialog
        open={Boolean(activeAssessmentModal)}
        onClose={() => {
          if (!assessmentSubmitting) {
            setActiveAssessmentModal(null);
            setAssessmentResult(null);
          }
        }}
        maxWidth="md"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: '24px', p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 900, fontSize: '1.25rem', color: '#0F172A', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>⏱️ {activeAssessmentModal?.title}</span>
          <IconButton size="small" onClick={() => setActiveAssessmentModal(null)}>
            <CloseRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {activeAssessmentModal && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box sx={{ p: 2, bgcolor: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography sx={{ fontWeight: 800, color: '#1E3A8A', fontSize: '0.94rem' }}>
                    Simulating {activeAssessmentModal.companyName} OA
                  </Typography>
                  <Typography sx={{ color: '#3B82F6', fontSize: '0.82rem' }}>
                    Passing Bar: {activeAssessmentModal.passingScore}% • Duration: {activeAssessmentModal.durationMinutes} Minutes
                  </Typography>
                </Box>
                <Chip
                  icon={<TimerOutlinedIcon sx={{ fontSize: '15px !important' }} />}
                  label="Countdown Active"
                  color="primary"
                  sx={{ fontWeight: 800 }}
                />
              </Box>

              {assessmentResult ? (
                <Box sx={{ textAlign: 'center', py: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: '50%',
                      bgcolor: assessmentResult.verdict === 'PASSED' ? '#DCFCE7' : '#FEE2E2',
                      color: assessmentResult.verdict === 'PASSED' ? '#16A34A' : '#DC2626',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <CheckCircleRoundedIcon sx={{ fontSize: 36 }} />
                  </Box>

                  <Typography variant="h4" sx={{ fontWeight: 900, color: assessmentResult.verdict === 'PASSED' ? '#16A34A' : '#DC2626' }}>
                    {assessmentResult.verdict}: {assessmentResult.score}%
                  </Typography>
                  <Typography sx={{ color: '#475569', fontSize: '0.92rem', maxWidth: 500 }}>
                    {assessmentResult.feedback}
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.94rem' }}>
                    Problems in this Assessment:
                  </Typography>
                  {activeAssessmentModal.problems.map((prob, idx) => (
                    <Box key={prob.id} sx={{ p: 2.5, bgcolor: '#F8FAFC', borderRadius: '14px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.94rem' }}>
                          Question #{idx + 1}: {prob.title}
                        </Typography>
                        <Typography sx={{ color: '#64748B', fontSize: '0.8rem', mt: 0.25 }}>
                          Topic: {prob.topic} • Points: {prob.points}
                        </Typography>
                      </Box>
                      <Link href={`/problems/${prob.slug}`} target="_blank" style={{ textDecoration: 'none' }}>
                        <Button size="small" variant="outlined" endIcon={<LaunchRoundedIcon sx={{ fontSize: 14 }} />} sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 800 }}>
                          Solve in Editor
                        </Button>
                      </Link>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2.5 }}>
          {assessmentResult ? (
            <Button
              variant="contained"
              onClick={() => {
                setActiveAssessmentModal(null);
                setAssessmentResult(null);
              }}
              sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 800, bgcolor: '#2563EB' }}
            >
              Close Results
            </Button>
          ) : (
            <Button
              variant="contained"
              disabled={!activeSessionId || assessmentSubmitting}
              onClick={handleSubmitAssessment}
              sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 800, bgcolor: '#16A34A', '&:hover': { bgcolor: '#15803D' } }}
            >
              {assessmentSubmitting ? 'Evaluating Solutions...' : 'Submit Assessment for Evaluation'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
