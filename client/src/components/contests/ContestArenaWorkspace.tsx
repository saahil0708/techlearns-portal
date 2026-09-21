'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Card,
  Button,
  Chip,
  Tabs,
  Tab,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  IconButton,
  Tooltip,
  CircularProgress,
} from '@mui/material';

// Icons
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import TimerRoundedIcon from '@mui/icons-material/TimerRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import HourglassEmptyRoundedIcon from '@mui/icons-material/HourglassEmptyRounded';
import LeaderboardRoundedIcon from '@mui/icons-material/LeaderboardRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

import StudentAppLayout from '@/components/students/layout/StudentAppLayout';
import CodeEditorWorkspace from '@/components/editor/CodeEditorWorkspace';
import { ContestEntity } from '@/types/contest';
import { useToast } from '@/context/ToastContext';
import { apiService } from '@/lib/api-service';

interface ContestArenaWorkspaceProps {
  contest: ContestEntity & {
    problems?: any[];
  };
}

interface ContestProblemItem {
  id: string;
  code: string;
  title: string;
  points: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  solvedCount: number;
  totalSubmissions: number;
  userSolved?: boolean;
}

const DEFAULT_CONTEST_PROBLEMS: ContestProblemItem[] = [
  { id: 'p1', code: 'P1', title: 'Two Sum & Segment Partitions', points: 100, difficulty: 'Easy', solvedCount: 142, totalSubmissions: 180, userSolved: true },
  { id: 'p2', code: 'P2', title: 'Dynamic Shortest Paths with Fuel Constraints', points: 200, difficulty: 'Medium', solvedCount: 89, totalSubmissions: 140, userSolved: false },
  { id: 'p3', code: 'P3', title: 'Maximum Flow in Multi-Source DAGs', points: 300, difficulty: 'Hard', solvedCount: 34, totalSubmissions: 92, userSolved: false },
  { id: 'p4', code: 'P4', title: 'Range XOR Queries with Bitwise Lazy Tags', points: 350, difficulty: 'Hard', solvedCount: 18, totalSubmissions: 65, userSolved: false },
];

interface ScoreboardRow {
  rank: number;
  handle: string;
  name: string;
  score: number;
  penalty: number;
  problems: Record<string, { solved: boolean; attempts: number; timeMinutes?: number }>;
}

const MOCK_SCOREBOARD: ScoreboardRow[] = [
  { rank: 1, handle: 'turing_master', name: 'Alan Turing', score: 650, penalty: 84, problems: { p1: { solved: true, attempts: 1, timeMinutes: 12 }, p2: { solved: true, attempts: 2, timeMinutes: 34 }, p3: { solved: true, attempts: 1, timeMinutes: 72 } } },
  { rank: 2, handle: 'ada_lovelace', name: 'Ada Lovelace', score: 600, penalty: 92, problems: { p1: { solved: true, attempts: 1, timeMinutes: 15 }, p2: { solved: true, attempts: 1, timeMinutes: 42 }, p3: { solved: false, attempts: 3 } } },
  { rank: 3, handle: 'coder_pro_99', name: 'Liam Vance', score: 300, penalty: 46, problems: { p1: { solved: true, attempts: 1, timeMinutes: 18 }, p2: { solved: true, attempts: 3, timeMinutes: 58 } } },
  { rank: 4, handle: 'algo_queen', name: 'Maya Lin', score: 100, penalty: 22, problems: { p1: { solved: true, attempts: 1, timeMinutes: 22 }, p2: { solved: false, attempts: 2 } } },
];

function isExplicitMockContest(contest: ContestEntity): boolean {
  if (!contest?.id) return true;
  return (
    contest.id.startsWith('contest-') ||
    contest.id.startsWith('cnt-live-') ||
    contest.id.startsWith('cnt-upcoming-') ||
    contest.id.startsWith('cnt-past-') ||
    contest.id === 'START256D' ||
    contest.id === 'START256C' ||
    contest.id === 'START256B' ||
    contest.id === 'START256A' ||
    contest.id === 'starters-256-division-4' ||
    contest.id === 'starters-256-division-3' ||
    contest.id === 'starters-256-division-2' ||
    contest.id === 'starters-256-division-1'
  );
}

function mapContestProblem(cp: any, idx: number): ContestProblemItem {
  const nested = cp.problem || {};
  const problemId = cp.problemId || nested.id || cp.id || `p${idx + 1}`;

  const rawCode = cp.code || nested.code || nested.slug;
  const code = rawCode ? String(rawCode).toUpperCase() : `P${idx + 1}`;

  const title = cp.title || nested.title || `Problem ${idx + 1}`;
  const points = typeof cp.points === 'number' ? cp.points : typeof nested.points === 'number' ? nested.points : 100;

  const rawDifficulty = cp.difficulty || nested.difficulty || 'Medium';
  const difficulty = (
    rawDifficulty === 'Easy' || rawDifficulty === 'Hard' ? rawDifficulty : 'Medium'
  ) as 'Easy' | 'Medium' | 'Hard';

  const solvedCount = cp.solvedCount ?? nested.solvedCount ?? 0;
  const totalSubmissions = cp.totalSubmissions ?? nested.totalSubmissions ?? 0;
  const userSolved = Boolean(cp.userSolved ?? nested.userSolved ?? false);

  return {
    id: problemId,
    code,
    title,
    points,
    difficulty,
    solvedCount,
    totalSubmissions,
    userSolved,
  };
}

function resolveInitialProblems(contest: ContestEntity & { problems?: any[] }): ContestProblemItem[] {
  if (Array.isArray(contest.problems) && contest.problems.length > 0) {
    return contest.problems.map(mapContestProblem);
  }
  if (isExplicitMockContest(contest)) {
    return DEFAULT_CONTEST_PROBLEMS;
  }
  return [];
}

export default function ContestArenaWorkspace({ contest }: ContestArenaWorkspaceProps) {
  const router = useRouter();
  const toast = useToast();
  const isMock = isExplicitMockContest(contest);

  const [activeTab, setActiveTab] = useState<'problems' | 'scoreboard' | 'submissions'>('problems');
  const [selectedProblemIdx, setSelectedProblemIdx] = useState<number | null>(null);
  const [problems, setProblems] = useState<ContestProblemItem[]>(() => resolveInitialProblems(contest));
  const [problemsLoading, setProblemsLoading] = useState<boolean>(
    !isMock && (!Array.isArray(contest.problems) || contest.problems.length === 0)
  );
  const [problemsError, setProblemsError] = useState<string | null>(null);
  const [problemsRefreshTrigger, setProblemsRefreshTrigger] = useState(0);

  const [scoreboard, setScoreboard] = useState<ScoreboardRow[]>(() => (isMock ? MOCK_SCOREBOARD : []));
  const [scoreboardLoading, setScoreboardLoading] = useState<boolean>(!isMock);
  const [scoreboardError, setScoreboardError] = useState<string | null>(null);
  const [scoreboardRefreshTrigger, setScoreboardRefreshTrigger] = useState(0);

  // Live countdown ticker
  const [timeLeft, setTimeLeft] = useState<string>('01:45:20');
  useEffect(() => {
    const timer = setInterval(() => {
      const diffMs = Math.max(0, new Date(contest.endTime).getTime() - Date.now());
      const hours = Math.floor(diffMs / 3600000);
      const minutes = Math.floor((diffMs % 3600000) / 60000);
      const seconds = Math.floor((diffMs % 60000) / 1000);
      setTimeLeft(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      );
    }, 1000);
    return () => clearInterval(timer);
  }, [contest.endTime]);

  // Fetch contest problems if not passed and not mock
  useEffect(() => {
    let isMounted = true;
    async function loadProblems() {
      if (isMock || (Array.isArray(contest.problems) && contest.problems.length > 0)) {
        setProblemsLoading(false);
        setProblemsError(null);
        return;
      }
      setProblemsLoading(true);
      setProblemsError(null);
      try {
        const liveContest = await apiService.getContestById(contest.id);
        if (isMounted) {
          if (liveContest?.problems && Array.isArray(liveContest.problems)) {
            const mapped: ContestProblemItem[] = liveContest.problems.map(mapContestProblem);
            setProblems(mapped);
          } else {
            setProblems([]);
          }
          setProblemsLoading(false);
        }
      } catch (err: any) {
        if (isMounted) {
          setProblems([]);
          setProblemsError(err?.message || 'Failed to load contest problems');
          setProblemsLoading(false);
        }
      }
    }
    loadProblems();
    return () => {
      isMounted = false;
    };
  }, [contest.id, contest.problems, isMock, problemsRefreshTrigger]);

  // Scoreboard fetch & polling effect with tab visibility & live refresh
  useEffect(() => {
    let isMounted = true;
    let refreshTimer: NodeJS.Timeout | null = null;

    async function loadMatrixLeaderboard(showLoading = false) {
      if (isMock) {
        setScoreboard(MOCK_SCOREBOARD);
        setScoreboardLoading(false);
        setScoreboardError(null);
        return;
      }

      if (showLoading) {
        setScoreboardLoading(true);
      }
      setScoreboardError(null);

      try {
        const res = await apiService.getContestMatrixLeaderboard(contest.id);
        if (isMounted) {
          if (Array.isArray(res)) {
            const mapped: ScoreboardRow[] = res.map((r: any, idx: number) => ({
              rank: r.rank || idx + 1,
              handle: r.handle || r.name || `coder_${idx + 1}`,
              name: r.name || 'Contestant',
              score: r.totalScore || 0,
              penalty: r.totalPenalty || 0,
              problems: r.problemScores || {},
            }));
            setScoreboard(mapped);
          } else {
            setScoreboard([]);
          }
          setScoreboardLoading(false);
        }
      } catch (err: any) {
        if (isMounted) {
          setScoreboard([]);
          setScoreboardError(err?.message || 'Failed to load live scoreboard data');
          setScoreboardLoading(false);
        }
      }
    }

    loadMatrixLeaderboard(scoreboard.length === 0);

    const isLive = contest.status === 'LIVE' || String(contest.status).toUpperCase() === 'RUNNING';
    if (!isMock && isLive && activeTab === 'scoreboard') {
      refreshTimer = setInterval(() => {
        loadMatrixLeaderboard(false);
      }, 15000);
    }

    return () => {
      isMounted = false;
      if (refreshTimer) {
        clearInterval(refreshTimer);
      }
    };
  }, [contest.id, contest.status, isMock, activeTab, scoreboardRefreshTrigger]);

  const activeProblem = selectedProblemIdx !== null ? problems[selectedProblemIdx] : null;

  return (
    <StudentAppLayout streakDays={48} contestRating={2380} ratingTier="Master">
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* ========================================================================= */}
        {/* CONTEST ARENA TOP BANNER WITH LIVE TIMER */}
        {/* ========================================================================= */}
        <Card
          sx={{
            p: 3,
            borderRadius: '16px',
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'flex-start', md: 'center' },
            justifyContent: 'space-between',
            gap: 2.5,
          }}
        >
          <Box>
            <Button
              startIcon={<ArrowBackRoundedIcon />}
              onClick={() => router.push('/contests')}
              sx={{ color: '#64748B', fontWeight: 700, fontSize: '0.8rem', textTransform: 'none', px: 0, mb: 1, '&:hover': { bgcolor: 'transparent', color: '#0F172A' } }}
            >
              Back to Contests Arena
            </Button>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-0.01em' }}>
                {contest.title}
              </Typography>
              <Chip
                icon={<FiberManualRecordIcon sx={{ fontSize: 10, color: '#16A34A !important', animation: 'pulse 1.5s infinite' }} />}
                label={contest.status}
                size="small"
                sx={{ bgcolor: 'rgba(22, 163, 74, 0.1)', color: '#16A34A', fontWeight: 800, fontSize: '0.74rem' }}
              />
            </Box>
            <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>
              Scoring Format: <strong>{contest.scoringFormat}</strong> • Organizer: <strong>{contest.organizer}</strong>
            </Typography>
          </Box>

          {/* Countdown Clock */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, bgcolor: '#0F172A', color: '#FFFFFF', px: 3, py: 1.5, borderRadius: '12px' }}>
            <TimerRoundedIcon sx={{ fontSize: 24, color: '#38BDF8' }} />
            <Box>
              <Typography sx={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>
                Time Remaining
              </Typography>
              <Typography sx={{ fontSize: '1.25rem', fontFamily: 'monospace', fontWeight: 800, color: '#F8FAFC' }}>
                {timeLeft}
              </Typography>
            </Box>
          </Box>
        </Card>

        {/* ========================================================================= */}
        {/* ARENA WORKSPACE TABS */}
        {/* ========================================================================= */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(_, val) => setActiveTab(val)}>
            <Tab
              value="problems"
              label="Problems"
              icon={<CodeRoundedIcon sx={{ fontSize: 18 }} />}
              iconPosition="start"
              sx={{ fontWeight: 700, textTransform: 'none', fontSize: '0.88rem' }}
            />
            <Tab
              value="scoreboard"
              label="Live Scoreboard"
              icon={<LeaderboardRoundedIcon sx={{ fontSize: 18 }} />}
              iconPosition="start"
              sx={{ fontWeight: 700, textTransform: 'none', fontSize: '0.88rem' }}
            />
          </Tabs>
        </Box>

        {/* ========================================================================= */}
        {/* TAB 1: PROBLEMS & INTEGRATED CODE SOLVER */}
        {/* ========================================================================= */}
        {activeTab === 'problems' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {problemsLoading ? (
              <Card sx={{ p: 6, textAlign: 'center', borderRadius: '16px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
                <CircularProgress size={36} sx={{ color: '#2563EB', mb: 2 }} />
                <Typography sx={{ color: '#64748B', fontWeight: 600 }}>
                  Loading contest problems...
                </Typography>
              </Card>
            ) : problemsError ? (
              <Card sx={{ p: 4, textAlign: 'center', borderRadius: '16px', border: '1px solid #FEE2E2', bgcolor: '#FEF2F2' }}>
                <Typography sx={{ color: '#DC2626', fontWeight: 700, mb: 1 }}>
                  Unable to load contest problems
                </Typography>
                <Typography sx={{ color: '#7F1D1D', fontSize: '0.88rem', mb: 2 }}>
                  {problemsError}
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => setProblemsRefreshTrigger((prev) => prev + 1)}
                  sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700, fontSize: '0.82rem', bgcolor: '#DC2626', '&:hover': { bgcolor: '#B91C1C' } }}
                >
                  Retry Loading Problems
                </Button>
              </Card>
            ) : problems.length === 0 ? (
              <Card sx={{ p: 6, textAlign: 'center', borderRadius: '16px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
                <CodeRoundedIcon sx={{ fontSize: 44, color: '#94A3B8', mb: 1.5 }} />
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', mb: 0.5 }}>
                  No Problems Configured
                </Typography>
                <Typography sx={{ color: '#64748B', fontSize: '0.88rem', maxWidth: 460, mx: 'auto' }}>
                  Problems for this contest have not been published yet. Check back closer to the contest start time.
                </Typography>
              </Card>
            ) : selectedProblemIdx === null ? (
              /* Problems List Table */
              <TableContainer component={Paper} sx={{ borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: 'none' }}>
                <Table>
                  <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 800, fontSize: '0.76rem', color: '#64748B', textTransform: 'uppercase' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 800, fontSize: '0.76rem', color: '#64748B', textTransform: 'uppercase' }}>Code</TableCell>
                      <TableCell sx={{ fontWeight: 800, fontSize: '0.76rem', color: '#64748B', textTransform: 'uppercase' }}>Problem Title</TableCell>
                      <TableCell sx={{ fontWeight: 800, fontSize: '0.76rem', color: '#64748B', textTransform: 'uppercase' }}>Difficulty</TableCell>
                      <TableCell sx={{ fontWeight: 800, fontSize: '0.76rem', color: '#64748B', textTransform: 'uppercase' }}>Points</TableCell>
                      <TableCell sx={{ fontWeight: 800, fontSize: '0.76rem', color: '#64748B', textTransform: 'uppercase' }}>Solves</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800, fontSize: '0.76rem', color: '#64748B', textTransform: 'uppercase' }}>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {problems.map((p, idx) => (
                      <TableRow key={p.id} hover sx={{ cursor: 'pointer' }} onClick={() => setSelectedProblemIdx(idx)}>
                        <TableCell>
                          {p.userSolved ? (
                            <CheckCircleRoundedIcon sx={{ color: '#16A34A', fontSize: 20 }} />
                          ) : (
                            <HourglassEmptyRoundedIcon sx={{ color: '#94A3B8', fontSize: 18 }} />
                          )}
                        </TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', fontWeight: 800, color: '#2563EB' }}>
                          {p.code}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#0F172A' }}>
                          {p.title}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={p.difficulty}
                            size="small"
                            sx={{
                              fontWeight: 700,
                              fontSize: '0.7rem',
                              bgcolor: p.difficulty === 'Easy' ? 'rgba(22,163,74,0.1)' : p.difficulty === 'Hard' ? 'rgba(220,38,38,0.1)' : 'rgba(234,88,12,0.1)',
                              color: p.difficulty === 'Easy' ? '#16A34A' : p.difficulty === 'Hard' ? '#DC2626' : '#EA580C',
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>
                          {p.points} pts
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.84rem', color: '#64748B', fontWeight: 600 }}>
                          {p.solvedCount} / {p.totalSubmissions}
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            variant="contained"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedProblemIdx(idx);
                            }}
                            sx={{ borderRadius: '6px', textTransform: 'none', fontWeight: 700, fontSize: '0.78rem', bgcolor: '#2563EB' }}
                          >
                            Solve Problem
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              /* Split Problem View & Monaco Runner */
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Button
                    startIcon={<ArrowBackRoundedIcon />}
                    onClick={() => setSelectedProblemIdx(null)}
                    sx={{ color: '#64748B', fontWeight: 700, textTransform: 'none', px: 0 }}
                  >
                    Back to Problem List
                  </Button>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A' }}>
                    {activeProblem?.code}: {activeProblem?.title} ({activeProblem?.points} pts)
                  </Typography>
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1.2fr' }, gap: 3 }}>
                  {/* Problem Statement Card */}
                  <Card sx={{ p: 3, borderRadius: '16px', bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', height: 'fit-content' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A', mb: 1 }}>
                      Problem Statement
                    </Typography>
                    <Typography sx={{ color: '#334155', lineHeight: 1.7, fontSize: '0.9rem', mb: 2 }}>
                      You are given constraints corresponding to problem <strong>{activeProblem?.title}</strong>. Write an optimal algorithm adhering to the time and memory limits.
                    </Typography>
                    <Box sx={{ bgcolor: '#F8FAFC', p: 2, borderRadius: '8px', borderLeft: '4px solid #2563EB', mb: 2 }}>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: '#0F172A', mb: 0.5 }}>
                        Input & Constraints
                      </Typography>
                      <Typography sx={{ fontSize: '0.8rem', color: '#64748B', fontFamily: 'monospace' }}>
                        1 &lt;= N &lt;= 10^5, -10^9 &lt;= A[i] &lt;= 10^9
                      </Typography>
                    </Box>
                  </Card>

                  {/* Monaco Code Editor Sandbox */}
                  <Box>
                    <CodeEditorWorkspace initialLanguage="cpp" />
                  </Box>
                </Box>
              </Box>
            )}
          </Box>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: LIVE ICPC MATRIX SCOREBOARD */}
        {/* ========================================================================= */}
        {activeTab === 'scoreboard' && (
          <Box>
            {scoreboardLoading ? (
              <Card sx={{ p: 6, textAlign: 'center', borderRadius: '16px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
                <CircularProgress size={36} sx={{ color: '#2563EB', mb: 2 }} />
                <Typography sx={{ color: '#64748B', fontWeight: 600 }}>
                  Loading live contest scoreboard...
                </Typography>
              </Card>
            ) : scoreboardError ? (
              <Card sx={{ p: 4, textAlign: 'center', borderRadius: '16px', border: '1px solid #FEE2E2', bgcolor: '#FEF2F2' }}>
                <Typography sx={{ color: '#DC2626', fontWeight: 700, mb: 1 }}>
                  Unable to load live scoreboard
                </Typography>
                <Typography sx={{ color: '#7F1D1D', fontSize: '0.88rem', mb: 2 }}>
                  {scoreboardError}
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => setScoreboardRefreshTrigger((prev) => prev + 1)}
                  sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700, fontSize: '0.82rem', bgcolor: '#DC2626', '&:hover': { bgcolor: '#B91C1C' } }}
                >
                  Retry Loading Scoreboard
                </Button>
              </Card>
            ) : scoreboard.length === 0 ? (
              <Card sx={{ p: 6, textAlign: 'center', borderRadius: '16px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
                <LeaderboardRoundedIcon sx={{ fontSize: 44, color: '#94A3B8', mb: 1.5 }} />
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', mb: 0.5 }}>
                  No Scoreboard Entries Yet
                </Typography>
                <Typography sx={{ color: '#64748B', fontSize: '0.88rem', maxWidth: 460, mx: 'auto' }}>
                  Submissions and rankings will appear here in real time as participants solve problems.
                </Typography>
              </Card>
            ) : (
              <TableContainer component={Paper} sx={{ borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: 'none' }}>
                <Table>
                  <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 800, fontSize: '0.76rem', color: '#64748B', textTransform: 'uppercase', width: 60 }}>Rank</TableCell>
                      <TableCell sx={{ fontWeight: 800, fontSize: '0.76rem', color: '#64748B', textTransform: 'uppercase' }}>Contestant</TableCell>
                      <TableCell sx={{ fontWeight: 800, fontSize: '0.76rem', color: '#64748B', textTransform: 'uppercase' }}>Score</TableCell>
                      <TableCell sx={{ fontWeight: 800, fontSize: '0.76rem', color: '#64748B', textTransform: 'uppercase' }}>Penalty</TableCell>
                      {problems.map((p) => (
                        <TableCell key={p.id} align="center" sx={{ fontWeight: 800, fontSize: '0.76rem', color: '#64748B' }}>
                          {p.code} ({p.points})
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {scoreboard.map((row) => (
                      <TableRow key={row.rank} hover>
                        <TableCell sx={{ fontWeight: 800, color: row.rank === 1 ? '#D97706' : row.rank === 2 ? '#64748B' : row.rank === 3 ? '#B45309' : '#0F172A' }}>
                          #{row.rank}
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography sx={{ fontWeight: 800, fontSize: '0.88rem', color: '#0F172A' }}>
                              {row.name}
                            </Typography>
                            <Typography sx={{ fontSize: '0.74rem', color: '#64748B', fontFamily: 'monospace' }}>
                              @{row.handle}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 800, color: '#2563EB', fontSize: '0.94rem' }}>
                          {row.score}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.84rem', color: '#64748B', fontFamily: 'monospace' }}>
                          {row.penalty}m
                        </TableCell>
                        {problems.map((p) => {
                          const pStat = row.problems[p.id] || (row.problems as any)[(p as any).problemId];
                          return (
                            <TableCell key={p.id} align="center">
                              {pStat?.solved ? (
                                <Box sx={{ bgcolor: 'rgba(22,163,74,0.12)', color: '#16A34A', p: 0.6, borderRadius: '6px' }}>
                                  <Typography sx={{ fontSize: '0.78rem', fontWeight: 800 }}>
                                    +{pStat.attempts}
                                  </Typography>
                                  {pStat.timeMinutes !== undefined && (
                                    <Typography sx={{ fontSize: '0.68rem', color: '#15803D' }}>
                                      {pStat.timeMinutes}m
                                    </Typography>
                                  )}
                                </Box>
                              ) : pStat && pStat.attempts > 0 ? (
                                <Box sx={{ bgcolor: 'rgba(220,38,38,0.1)', color: '#DC2626', p: 0.6, borderRadius: '6px' }}>
                                  <Typography sx={{ fontSize: '0.78rem', fontWeight: 800 }}>
                                    -{pStat.attempts}
                                  </Typography>
                                </Box>
                              ) : (
                                <Typography sx={{ color: '#CBD5E1', fontSize: '0.85rem' }}>—</Typography>
                              )}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}
      </Box>
    </StudentAppLayout>
  );
}
