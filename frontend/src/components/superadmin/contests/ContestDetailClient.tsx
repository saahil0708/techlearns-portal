'use client';

import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  Chip,
  Button,
  TextField,
  InputAdornment,
  Avatar,
  IconButton,
  Tooltip,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Icons
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import { FluidArrowRight } from '@/utils/fluid_arrow';

// Layout & Helpers
import CurvedSidebar from '@/components/superadmin/layout/CurvedSidebar';
import Navbar from '@/components/superadmin/layout/Navbar';
import { ContestEntity } from '@/types/contest';
import { useToast } from '@/context/ToastContext';
import { useAppSelector } from '@/store/hooks';
import YouBadge from '@/components/common/YouBadge';
import { MuiCenterLoader } from '@/components/shared/MuiLoadingFallback';
import { apiService } from '@/lib/api-service';

export interface LeaderboardEntry {
  rank: number;
  studentId: string;
  name: string;
  email: string;
  institution: string;
  score: number;
  penaltyTime: string;
  problemsSolved: number;
  problemStatus: Record<string, { solved: boolean; attempts: number; time?: string }>;
}

export interface ContestProblemItem {
  id: string;
  code: string;
  title: string;
  slug: string;
  points: number;
  order: string; // 'A', 'B', 'C', 'D'
  totalSubmissions: number;
  acceptedSubmissions: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface ContestParticipantItem {
  id: string;
  name: string;
  email: string;
  institution: string;
  registeredAt: string;
  status: 'Checked In' | 'Registered' | 'Disqualified';
}

interface ContestDetailClientProps {
  contest: ContestEntity;
  initialLeaderboard?: LeaderboardEntry[];
  initialProblems?: ContestProblemItem[];
  initialParticipants?: ContestParticipantItem[];
}

export default function ContestDetailClient({
  contest,
  initialLeaderboard = [],
  initialProblems = [],
  initialParticipants = [],
}: ContestDetailClientProps) {
  const router = useRouter();
  const toast = useToast();
  const currentUser = useAppSelector((state) => state.auth.user);

  const [currentTab, setCurrentTab] = useState<'leaderboard' | 'problems' | 'participants' | 'settings'>('leaderboard');
  const [isTabLoading, setIsTabLoading] = useState(false);

  // Leaderboard data
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(
    initialLeaderboard.length > 0
      ? initialLeaderboard
      : [
          {
            rank: 1,
            studentId: 'st-1',
            name: 'Maya Lin',
            email: 'm.lin@stuy.edu',
            institution: 'Stuyvesant High School',
            score: 750,
            penaltyTime: '01:14:22',
            problemsSolved: 4,
            problemStatus: {
              A: { solved: true, attempts: 1, time: '00:12:10' },
              B: { solved: true, attempts: 1, time: '00:24:45' },
              C: { solved: true, attempts: 2, time: '00:48:30' },
              D: { solved: true, attempts: 1, time: '01:14:22' },
            },
          },
          {
            rank: 2,
            studentId: 'st-2',
            name: 'Liam Vance',
            email: 'l.vance@stanford.edu',
            institution: 'Stanford University',
            score: 750,
            penaltyTime: '01:28:10',
            problemsSolved: 4,
            problemStatus: {
              A: { solved: true, attempts: 1, time: '00:09:40' },
              B: { solved: true, attempts: 1, time: '00:22:15' },
              C: { solved: true, attempts: 1, time: '00:42:00' },
              D: { solved: true, attempts: 3, time: '01:28:10' },
            },
          },
          {
            rank: 3,
            studentId: 'st-3',
            name: 'Alex Mercer',
            email: 'alex.m@mit.edu',
            institution: 'MIT',
            score: 550,
            penaltyTime: '01:05:40',
            problemsSolved: 3,
            problemStatus: {
              A: { solved: true, attempts: 1, time: '00:14:10' },
              B: { solved: true, attempts: 2, time: '00:35:20' },
              C: { solved: true, attempts: 1, time: '01:05:40' },
              D: { solved: false, attempts: 4 },
            },
          },
          {
            rank: 4,
            studentId: 'st-4',
            name: 'Devin Sharma',
            email: 'devin.s@iitd.ac.in',
            institution: 'IIT Delhi',
            score: 550,
            penaltyTime: '01:18:20',
            problemsSolved: 3,
            problemStatus: {
              A: { solved: true, attempts: 1, time: '00:15:30' },
              B: { solved: true, attempts: 1, time: '00:30:10' },
              C: { solved: true, attempts: 3, time: '01:18:20' },
              D: { solved: false, attempts: 2 },
            },
          },
          {
            rank: 5,
            studentId: 'st-5',
            name: 'Elena Rostova',
            email: 'elena.r@dev.community',
            institution: 'Independent',
            score: 300,
            penaltyTime: '00:42:15',
            problemsSolved: 2,
            problemStatus: {
              A: { solved: true, attempts: 1, time: '00:18:05' },
              B: { solved: true, attempts: 1, time: '00:42:15' },
              C: { solved: false, attempts: 2 },
              D: { solved: false, attempts: 0 },
            },
          },
        ]
  );

  // Contest problems data
  const [problems, setProblems] = useState<ContestProblemItem[]>(
    initialProblems.length > 0
      ? initialProblems
      : [
          {
            id: 'cp-1',
            code: 'PROB-A',
            title: 'Sum of Consecutive Multiples',
            slug: 'sum-consecutive-multiples',
            points: 100,
            order: 'A',
            totalSubmissions: 3420,
            acceptedSubmissions: 3120,
            difficulty: 'Easy',
          },
          {
            id: 'cp-2',
            code: 'PROB-B',
            title: 'Optimal Subarray Frequency XOR',
            slug: 'optimal-subarray-frequency-xor',
            points: 200,
            order: 'B',
            totalSubmissions: 2840,
            acceptedSubmissions: 2150,
            difficulty: 'Medium',
          },
          {
            id: 'cp-3',
            code: 'PROB-C',
            title: 'Dynamic Tree Path Query Optimization',
            slug: 'dynamic-tree-path-query-optimization',
            points: 250,
            order: 'C',
            totalSubmissions: 1920,
            acceptedSubmissions: 980,
            difficulty: 'Medium',
          },
          {
            id: 'cp-4',
            code: 'PROB-D',
            title: 'Segment Tree Over 3D Lattice Graph',
            slug: 'segment-tree-3d-lattice-graph',
            points: 350,
            order: 'D',
            totalSubmissions: 940,
            acceptedSubmissions: 195,
            difficulty: 'Hard',
          },
        ]
  );

  // Participants data
  const [participants, setParticipants] = useState<ContestParticipantItem[]>(
    initialParticipants.length > 0
      ? initialParticipants
      : [
          { id: 'p-1', name: 'Maya Lin', email: 'm.lin@stuy.edu', institution: 'Stuyvesant High School', registeredAt: 'Feb 20, 2026', status: 'Checked In' },
          { id: 'p-2', name: 'Liam Vance', email: 'l.vance@stanford.edu', institution: 'Stanford University', registeredAt: 'Feb 21, 2026', status: 'Checked In' },
          { id: 'p-3', name: 'Alex Mercer', email: 'alex.m@mit.edu', institution: 'MIT', registeredAt: 'Feb 22, 2026', status: 'Checked In' },
          { id: 'p-4', name: 'Devin Sharma', email: 'devin.s@iitd.ac.in', institution: 'IIT Delhi', registeredAt: 'Feb 22, 2026', status: 'Checked In' },
          { id: 'p-5', name: 'Elena Rostova', email: 'elena.r@dev.community', institution: 'Independent', registeredAt: 'Feb 23, 2026', status: 'Registered' },
        ]
  );

  const [leaderboardSearch, setLeaderboardSearch] = useState('');
  const [participantSearch, setParticipantSearch] = useState('');

  // Modals
  const [addProblemOpen, setAddProblemOpen] = useState(false);
  const [newProblemTitle, setNewProblemTitle] = useState('');
  const [newProblemPoints, setNewProblemPoints] = useState('100');

  const handleTabChange = (_: React.SyntheticEvent, newTab: 'leaderboard' | 'problems' | 'participants' | 'settings') => {
    if (newTab !== currentTab) {
      setIsTabLoading(true);
      setCurrentTab(newTab);
      setTimeout(() => setIsTabLoading(false), 160);
    }
  };

  const csvEscape = (val: string | number) => `"${String(val).replace(/"/g, '""')}"`;

  const handleExportLeaderboardCSV = () => {
    const headers = ['Rank', 'Student Name', 'Email', 'Institution', 'Total Score', 'Penalty Time', 'Solved Count'];
    const rows = leaderboard.map((e) => [
      e.rank,
      csvEscape(e.name),
      csvEscape(e.email),
      csvEscape(e.institution),
      e.score,
      csvEscape(e.penaltyTime),
      e.problemsSolved,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${contest.code}_leaderboard_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Exported top ${leaderboard.length} leaderboard standings to CSV.`, 'CSV Export Ready');
  };

  const handleAddProblemToContest = async () => {
    if (!newProblemTitle.trim()) {
      toast.error('Problem title is required', 'Validation Error');
      return;
    }

    if (problems.length >= 26) {
      toast.error('Maximum 26 problems (A-Z) per contest.', 'Limit Reached');
      return;
    }

    const orderChar = String.fromCharCode(65 + problems.length);
    const created: ContestProblemItem = {
      id: `cp-${Date.now()}`,
      code: `PROB-${orderChar}`,
      title: newProblemTitle,
      slug: newProblemTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      points: parseInt(newProblemPoints, 10) || 100,
      order: orderChar,
      totalSubmissions: 0,
      acceptedSubmissions: 0,
      difficulty: 'Medium',
    };

    setProblems((prev) => [...prev, created]);
    setAddProblemOpen(false);
    setNewProblemTitle('');
    setNewProblemPoints('100');
    toast.success(`Problem ${orderChar} (${created.title}) mapped to contest.`, 'Problem Added');
  };

  const statusColors = {
    UPCOMING: { bg: '#EFF6FF', color: '#2563EB', border: '#DBEAFE', label: 'Upcoming' },
    LIVE: { bg: '#FEF2F2', color: '#DC2626', border: '#FECACA', label: '● LIVE NOW' },
    PAST: { bg: '#F8FAFC', color: '#64748B', border: '#E2E8F0', label: 'Completed' },
    DRAFT: { bg: '#F8FAFC', color: '#64748B', border: '#E2E8F0', label: 'Draft' },
  }[contest.status] || { bg: '#F1F5F9', color: '#475569', border: '#E2E8F0', label: contest.status };

  const filteredLeaderboard = useMemo(() => {
    return leaderboard.filter((entry) => {
      return (
        entry.name.toLowerCase().includes(leaderboardSearch.toLowerCase()) ||
        entry.email.toLowerCase().includes(leaderboardSearch.toLowerCase()) ||
        entry.institution.toLowerCase().includes(leaderboardSearch.toLowerCase())
      );
    });
  }, [leaderboard, leaderboardSearch]);

  const filteredParticipants = useMemo(() => {
    return participants.filter((p) => {
      return (
        p.name.toLowerCase().includes(participantSearch.toLowerCase()) ||
        p.email.toLowerCase().includes(participantSearch.toLowerCase()) ||
        p.institution.toLowerCase().includes(participantSearch.toLowerCase())
      );
    });
  }, [participants, participantSearch]);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F8FAFC' }}>
      <CurvedSidebar />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: { xs: '72px', sm: '84px', md: '96px' },
          p: { xs: 2, sm: 3, md: 4 },
          minHeight: '100vh',
          bgcolor: '#F8FAFC',
          maxWidth: '100vw',
        }}
      >
        <Navbar />

        {/* Breadcrumb Header */}
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Button
            component={Link}
            href="/superadmin/contests"
            variant="outlined"
            size="small"
            startIcon={<ArrowBackRoundedIcon />}
            sx={{
              borderRadius: '9999px',
              textTransform: 'none',
              fontWeight: 700,
              color: '#475569',
              borderColor: '#E2E8F0',
              bgcolor: '#FFFFFF',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
              '&:hover': { bgcolor: '#F1F5F9', borderColor: '#CBD5E1' },
            }}
          >
            Back to Contests Directory
          </Button>
          <Typography sx={{ color: '#94A3B8', fontSize: '0.85rem' }}>/</Typography>
          <Typography sx={{ color: '#64748B', fontWeight: 600, fontSize: '0.85rem' }}>{contest.code}</Typography>
        </Box>

        {/* Hero Card */}
        <Card
          elevation={0}
          sx={{
            borderRadius: '24px',
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            p: { xs: 2.5, sm: 3.5 },
            mb: 3.5,
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.03)',
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, justifyContent: 'space-between', gap: 3 }}>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mb: 1.5 }}>
                <Chip
                  label={contest.code}
                  size="small"
                  sx={{
                    bgcolor: '#EFF6FF',
                    color: '#2563EB',
                    fontWeight: 800,
                    fontFamily: 'monospace',
                    fontSize: '0.82rem',
                    border: '1px solid #DBEAFE',
                    borderRadius: '8px',
                  }}
                />
                <Chip
                  label={statusColors.label}
                  size="small"
                  sx={{
                    bgcolor: statusColors.bg,
                    color: statusColors.color,
                    border: `1px solid ${statusColors.border}`,
                    fontWeight: 800,
                    fontSize: '0.78rem',
                    borderRadius: '8px',
                  }}
                />
                <Chip
                  label={`${contest.scoringFormat} Format`}
                  size="small"
                  sx={{
                    bgcolor: '#F8FAFC',
                    color: '#475569',
                    border: '1px solid #E2E8F0',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    borderRadius: '8px',
                  }}
                />
                <Chip
                  label={contest.scope}
                  size="small"
                  sx={{
                    bgcolor: '#F8FAFC',
                    color: '#64748B',
                    border: '1px solid #E2E8F0',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    borderRadius: '8px',
                  }}
                />
              </Box>

              <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', fontSize: { xs: '1.4rem', sm: '1.75rem' }, mb: 1 }}>
                {contest.title}
              </Typography>

              <Typography sx={{ color: '#64748B', fontSize: '0.92rem', lineHeight: 1.6, maxWidth: 840, mb: 2.5 }}>
                {contest.description || 'Competitive tournament ranking platform coders with live penalty timers and automated test runner evaluation.'}
              </Typography>

              {/* Contest Metrics */}
              <Box sx={{ display: 'flex', gap: 2.5, flexWrap: 'wrap', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccessTimeRoundedIcon sx={{ fontSize: 18, color: '#64748B' }} />
                  <Typography sx={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>
                    {contest.durationMinutes} Minutes Duration
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PeopleAltRoundedIcon sx={{ fontSize: 18, color: '#64748B' }} />
                  <Typography sx={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>
                    <strong>{contest.registeredParticipants.toLocaleString()}</strong> Registered
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CodeRoundedIcon sx={{ fontSize: 18, color: '#2563EB' }} />
                  <Typography sx={{ fontSize: '0.85rem', color: '#0F172A', fontWeight: 700 }}>
                    {problems.length} Problem Challenges
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Right Action buttons */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'row', lg: 'column' }, gap: 1.5, justifyContent: 'center' }}>
              <Button
                variant="contained"
                startIcon={<AddRoundedIcon />}
                onClick={() => setAddProblemOpen(true)}
                sx={{
                  bgcolor: '#2563EB',
                  backgroundImage: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                  borderRadius: '9999px',
                  px: 2.5,
                  py: 1,
                  fontWeight: 700,
                  textTransform: 'none',
                  fontSize: '0.88rem',
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
                  '&:hover': { bgcolor: '#1D4ED8' },
                }}
              >
                Map Problem
              </Button>
              <Button
                variant="outlined"
                startIcon={<FileDownloadRoundedIcon />}
                onClick={handleExportLeaderboardCSV}
                sx={{
                  borderRadius: '9999px',
                  borderColor: '#CBD5E1',
                  color: '#475569',
                  fontWeight: 700,
                  textTransform: 'none',
                  fontSize: '0.88rem',
                  '&:hover': { bgcolor: '#F8FAFC', borderColor: '#94A3B8' },
                }}
              >
                Export Standings
              </Button>
            </Box>
          </Box>
        </Card>

        {/* Tab Navigation */}
        <Box sx={{ borderBottom: '1px solid #E2E8F0', mb: 3 }}>
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            sx={{
              '& .MuiTabs-indicator': { bgcolor: '#2563EB', height: 3, borderRadius: '3px 3px 0 0' },
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.92rem',
                color: '#64748B',
                minWidth: 120,
                '&.Mui-selected': { color: '#2563EB' },
              },
            }}
          >
            <Tab value="leaderboard" label="Live Standings & Leaderboard" />
            <Tab value="problems" label={`Problem Set (${problems.length})`} />
            <Tab value="participants" label={`Participants (${participants.length})`} />
            <Tab value="settings" label="Tournament Rules" />
          </Tabs>
        </Box>

        {/* Tab Content Areas */}
        {isTabLoading ? (
          <MuiCenterLoader minHeight="380px" />
        ) : (
          <>
            {/* TAB 1: LIVE LEADERBOARD */}
            {currentTab === 'leaderboard' && (
              <Card elevation={0} sx={{ borderRadius: '20px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 2 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.05rem' }}>
                      Real-Time Contest Leaderboard & Penalty Breakdown
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748B' }}>
                      Rank calculated by points solved descending, broken by penalty time ascending.
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                    <TextField
                      placeholder="Search coders..."
                      size="small"
                      value={leaderboardSearch}
                      onChange={(e) => setLeaderboardSearch(e.target.value)}
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchRoundedIcon sx={{ fontSize: 18, color: '#94A3B8' }} />
                            </InputAdornment>
                          ),
                        },
                      }}
                      sx={{ width: 220, '& .MuiOutlinedInput-root': { borderRadius: '9999px', bgcolor: '#F8FAFC' } }}
                    />
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<FileDownloadRoundedIcon />}
                      onClick={handleExportLeaderboardCSV}
                      sx={{
                        borderRadius: '9999px',
                        textTransform: 'none',
                        fontWeight: 700,
                        color: '#475569',
                        borderColor: '#CBD5E1',
                        '&:hover': { bgcolor: '#F8FAFC' },
                      }}
                    >
                      Export CSV
                    </Button>
                  </Box>
                </Box>

                <TableContainer sx={{ borderRadius: '14px', border: '1px solid #F1F5F9' }}>
                  <Table>
                    <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem', py: 1.5 }}>RANK</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>CODER & INSTITUTION</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>SCORE</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>PENALTY</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem', textAlign: 'center' }}>PROB A</TableCell>
                        {problems.length > 1 && <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem', textAlign: 'center' }}>PROB B</TableCell>}
                        {problems.length > 2 && <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem', textAlign: 'center' }}>PROB C</TableCell>}
                        {problems.length > 3 && <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem', textAlign: 'center' }}>PROB D</TableCell>}
                        {problems.length > 4 && problems.slice(4).map((p) => (
                          <TableCell key={p.order} sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem', textAlign: 'center' }}>PROB {p.order}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredLeaderboard.map((entry) => {
                        const isTop3 = entry.rank <= 3;
                        const isCurrentUser = Boolean(
                          currentUser &&
                            (currentUser.id === entry.studentId ||
                              (currentUser.email && entry.email && currentUser.email.toLowerCase() === entry.email.toLowerCase()))
                        );
                        return (
                          <TableRow key={entry.studentId} hover sx={{ '&:last-child td': { borderBottom: 0 }, bgcolor: isCurrentUser ? '#F8FAFC' : 'inherit' }}>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {entry.rank === 1 ? (
                                  <Chip
                                    icon={<EmojiEventsRoundedIcon sx={{ fontSize: '15px !important', color: '#D97706 !important' }} />}
                                    label="#1"
                                    size="small"
                                    sx={{ bgcolor: '#FEF3C7', color: '#D97706', fontWeight: 800, border: '1px solid #FDE68A' }}
                                  />
                                ) : entry.rank === 2 ? (
                                  <Chip
                                    icon={<EmojiEventsRoundedIcon sx={{ fontSize: '15px !important', color: '#475569 !important' }} />}
                                    label="#2"
                                    size="small"
                                    sx={{ bgcolor: '#F1F5F9', color: '#475569', fontWeight: 800, border: '1px solid #CBD5E1' }}
                                  />
                                ) : entry.rank === 3 ? (
                                  <Chip
                                    icon={<EmojiEventsRoundedIcon sx={{ fontSize: '15px !important', color: '#C2410C !important' }} />}
                                    label="#3"
                                    size="small"
                                    sx={{ bgcolor: '#FFEDD5', color: '#C2410C', fontWeight: 800, border: '1px solid #FED7AA' }}
                                  />
                                ) : (
                                  <Typography sx={{ fontWeight: 700, color: '#64748B', pl: 1 }}>#{entry.rank}</Typography>
                                )}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap' }}>
                                <Typography sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.88rem' }}>
                                  {entry.name}
                                </Typography>
                                {isCurrentUser && <YouBadge />}
                              </Box>
                              <Typography sx={{ fontSize: '0.76rem', color: '#64748B' }}>
                                {entry.institution} • {entry.email}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ fontWeight: 800, color: '#2563EB', fontSize: '0.95rem' }}>
                              {entry.score} pts
                            </TableCell>
                            <TableCell sx={{ fontFamily: 'monospace', color: '#64748B', fontSize: '0.84rem' }}>
                              {entry.penaltyTime}
                            </TableCell>

                            {/* Problems matrix */}
                            {problems.map((prob) => {
                              const probCode = prob.order;
                              const st = entry.problemStatus[probCode];
                              return (
                                <TableCell key={probCode} sx={{ textAlign: 'center' }}>
                                  {st?.solved ? (
                                    <Box sx={{ bgcolor: '#F0FDF4', color: '#16A34A', p: 0.6, borderRadius: '6px', border: '1px solid #BBF7D0', display: 'inline-block' }}>
                                      <Typography sx={{ fontWeight: 800, fontSize: '0.74rem' }}>+{st.attempts}</Typography>
                                      <Typography sx={{ fontSize: '0.66rem', color: '#15803D' }}>{st.time?.slice(3)}</Typography>
                                    </Box>
                                  ) : st?.attempts ? (
                                    <Box sx={{ bgcolor: '#FEF2F2', color: '#DC2626', p: 0.6, borderRadius: '6px', border: '1px solid #FECACA', display: 'inline-block' }}>
                                      <Typography sx={{ fontWeight: 800, fontSize: '0.74rem' }}>-{st.attempts}</Typography>
                                    </Box>
                                  ) : (
                                    <Typography sx={{ color: '#CBD5E1' }}>-</Typography>
                                  )}
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>
            )}

            {/* TAB 2: PROBLEM SET */}
            {currentTab === 'problems' && (
              <Card elevation={0} sx={{ borderRadius: '20px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.05rem' }}>
                    Contest Problem Challenges & Score Allocation
                  </Typography>

                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<AddRoundedIcon />}
                    onClick={() => setAddProblemOpen(true)}
                    sx={{
                      borderRadius: '9999px',
                      textTransform: 'none',
                      fontWeight: 700,
                      bgcolor: '#2563EB',
                      '&:hover': { bgcolor: '#1D4ED8' },
                    }}
                  >
                    Add Problem
                  </Button>
                </Box>

                <TableContainer sx={{ borderRadius: '14px', border: '1px solid #F1F5F9' }}>
                  <Table>
                    <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem', py: 1.5 }}>ORDER</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>TITLE & CHALLENGE</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>DIFFICULTY</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>SCORE WEIGHT</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>SUBMISSIONS / SOLVED</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem', textAlign: 'right' }}>ACTIONS</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {problems.map((prob) => (
                        <TableRow key={prob.id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                          <TableCell sx={{ fontWeight: 800, color: '#2563EB', fontSize: '1rem' }}>
                            {prob.order}
                          </TableCell>
                          <TableCell>
                            <Typography sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.9rem' }}>
                              {prob.title}
                            </Typography>
                            <Typography sx={{ fontSize: '0.76rem', color: '#64748B', fontFamily: 'monospace' }}>
                              {prob.slug}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={prob.difficulty}
                              size="small"
                              sx={{
                                bgcolor: prob.difficulty === 'Easy' ? '#F0FDF4' : prob.difficulty === 'Medium' ? '#FFFBEB' : '#FEF2F2',
                                color: prob.difficulty === 'Easy' ? '#16A34A' : prob.difficulty === 'Medium' ? '#D97706' : '#DC2626',
                                border: `1px solid ${prob.difficulty === 'Easy' ? '#BBF7D0' : prob.difficulty === 'Medium' ? '#FDE68A' : '#FECACA'}`,
                                fontWeight: 800,
                                fontSize: '0.74rem',
                                borderRadius: '6px',
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>
                            {prob.points} pts
                          </TableCell>
                          <TableCell sx={{ color: '#475569', fontSize: '0.86rem' }}>
                            <strong>{prob.acceptedSubmissions}</strong> / {prob.totalSubmissions} ({Math.round((prob.acceptedSubmissions / (prob.totalSubmissions || 1)) * 100)}%)
                          </TableCell>
                          <TableCell sx={{ textAlign: 'right' }}>
                            <Button
                              component={Link}
                              href={`/superadmin/problems/${prob.slug}`}
                              variant="text"
                              size="small"
                              sx={{ textTransform: 'none', fontWeight: 700, color: '#2563EB' }}
                            >
                              Inspect Problem
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>
            )}

            {/* TAB 3: REGISTERED PARTICIPANTS */}
            {currentTab === 'participants' && (
              <Card elevation={0} sx={{ borderRadius: '20px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.05rem' }}>
                    Registered Coders & Candidate Roster
                  </Typography>

                  <TextField
                    placeholder="Search participants..."
                    size="small"
                    value={participantSearch}
                    onChange={(e) => setParticipantSearch(e.target.value)}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchRoundedIcon sx={{ fontSize: 18, color: '#94A3B8' }} />
                          </InputAdornment>
                        ),
                      },
                    }}
                    sx={{ width: 240, '& .MuiOutlinedInput-root': { borderRadius: '9999px', bgcolor: '#F8FAFC' } }}
                  />
                </Box>

                <TableContainer sx={{ borderRadius: '14px', border: '1px solid #F1F5F9' }}>
                  <Table>
                    <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem', py: 1.5 }}>STUDENT NAME</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>EMAIL ADDRESS</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>INSTITUTION</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>REGISTRATION DATE</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>STATUS</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredParticipants.map((p) => {
                        const isCurrentUser = Boolean(
                          currentUser &&
                            (currentUser.id === p.id ||
                              (currentUser.email && p.email && currentUser.email.toLowerCase() === p.email.toLowerCase()))
                        );
                        return (
                          <TableRow key={p.id} hover sx={{ '&:last-child td': { borderBottom: 0 }, bgcolor: isCurrentUser ? '#F8FAFC' : 'inherit' }}>
                            <TableCell sx={{ fontWeight: 700, color: '#0F172A' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap' }}>
                                {p.name}
                                {isCurrentUser && <YouBadge />}
                              </Box>
                            </TableCell>
                            <TableCell sx={{ color: '#475569', fontSize: '0.86rem' }}>{p.email}</TableCell>
                            <TableCell sx={{ color: '#475569', fontSize: '0.86rem' }}>{p.institution}</TableCell>
                            <TableCell sx={{ color: '#64748B', fontSize: '0.84rem' }}>{p.registeredAt}</TableCell>
                            <TableCell>
                              <Chip
                                label={p.status}
                                size="small"
                                sx={{
                                  bgcolor: p.status === 'Checked In' ? '#F0FDF4' : '#EFF6FF',
                                  color: p.status === 'Checked In' ? '#16A34A' : '#2563EB',
                                  border: `1px solid ${p.status === 'Checked In' ? '#BBF7D0' : '#DBEAFE'}`,
                                  fontWeight: 700,
                                  fontSize: '0.74rem',
                                  borderRadius: '6px',
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>
            )}

            {/* TAB 4: SETTINGS & RULES */}
            {currentTab === 'settings' && (
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 3 }}>
                <Card elevation={0} sx={{ borderRadius: '20px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', p: 3.5 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', mb: 2 }}>
                    Tournament Specifications
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid #F1F5F9' }}>
                      <Typography sx={{ color: '#64748B', fontSize: '0.88rem' }}>Scoring Format</Typography>
                      <Typography sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.88rem' }}>{contest.scoringFormat} Standard</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid #F1F5F9' }}>
                      <Typography sx={{ color: '#64748B', fontSize: '0.88rem' }}>Incorrect Penalty Time</Typography>
                      <Typography sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.88rem' }}>+10 Minutes per WA</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid #F1F5F9' }}>
                      <Typography sx={{ color: '#64748B', fontSize: '0.88rem' }}>Plagiarism Sandbox Check</Typography>
                      <Typography sx={{ fontWeight: 700, color: '#16A34A', fontSize: '0.88rem' }}>Enabled (MOSS AST Analyzer)</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                      <Typography sx={{ color: '#64748B', fontSize: '0.88rem' }}>Automated Rating Recalculation</Typography>
                      <Typography sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.88rem' }}>Post-Contest Queue</Typography>
                    </Box>
                  </Box>
                </Card>

                <Card elevation={0} sx={{ borderRadius: '20px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', p: 3.5 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', mb: 2 }}>
                    Access & Scope Settings
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid #F1F5F9' }}>
                      <Typography sx={{ color: '#64748B', fontSize: '0.88rem' }}>Audience Scope</Typography>
                      <Typography sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.88rem' }}>{contest.scope}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid #F1F5F9' }}>
                      <Typography sx={{ color: '#64748B', fontSize: '0.88rem' }}>Duration</Typography>
                      <Typography sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.88rem' }}>{contest.durationMinutes} Minutes</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid #F1F5F9' }}>
                      <Typography sx={{ color: '#64748B', fontSize: '0.88rem' }}>Status</Typography>
                      <Typography sx={{ fontWeight: 700, color: statusColors.color, fontSize: '0.88rem' }}>{statusColors.label}</Typography>
                    </Box>
                  </Box>
                </Card>
              </Box>
            )}
          </>
        )}

        {/* Modal: Map Problem to Contest */}
        <Dialog open={addProblemOpen} onClose={() => setAddProblemOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.2rem', pb: 1 }}>
            Map Problem Challenge to Contest
          </DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: '16px !important' }}>
            <TextField
              label="Problem Title"
              fullWidth
              value={newProblemTitle}
              onChange={(e) => setNewProblemTitle(e.target.value)}
              placeholder="e.g. Graph Tree Flow Optimization"
            />
            <TextField
              label="Score Allocation (Points)"
              type="number"
              fullWidth
              value={newProblemPoints}
              onChange={(e) => setNewProblemPoints(e.target.value)}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2.5, gap: 1 }}>
            <Button onClick={() => setAddProblemOpen(false)} sx={{ color: '#64748B', fontWeight: 700 }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleAddProblemToContest}
              sx={{ bgcolor: '#2563EB', fontWeight: 800, textTransform: 'none', px: 3, borderRadius: '8px' }}
            >
              Add Problem
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}
