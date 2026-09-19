'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  Chip,
  Button,
  Select,
  MenuItem,
  FormControl,
  Tabs,
  Tab,
  Tooltip,
} from '@mui/material';

// Icons
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import HowToRegRoundedIcon from '@mui/icons-material/HowToRegRounded';
import LeaderboardRoundedIcon from '@mui/icons-material/LeaderboardRounded';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';

import StudentAppLayout from '@/components/students/layout/StudentAppLayout';
import { MOCK_CONTESTS } from '@/lib/mock-contests-data';
import { ContestEntity, ContestScope, ContestStatus, ScoringFormat } from '@/types/contest';
import { useToast } from '@/context/ToastContext';
import { apiService } from '@/lib/api-service';

export default function ContestsArenaClient() {
  const router = useRouter();
  const toast = useToast();

  const [contests, setContests] = useState<ContestEntity[]>(MOCK_CONTESTS);
  const [search, setSearch] = useState('');
  const [statusTab, setStatusTab] = useState<string>('ALL');
  const [scopeFilter, setScopeFilter] = useState<string>('ALL');
  const [divisionFilter, setDivisionFilter] = useState<string>('ALL');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [registeredIds, setRegisteredIds] = useState<Set<string>>(new Set(['contest-1', 'contest-2']));

  // Format countdown ticker (lazy mount to avoid SSR hydration mismatch)
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch live contests from backend GraphQL API with fallback
  useEffect(() => {
    let isMounted = true;
    async function loadContests() {
      try {
        const res = await apiService.getContests({ limit: 50 });
        if (isMounted && res?.items && res.items.length > 0) {
          const mapped: ContestEntity[] = res.items.map((c: any, idx: number) => {
            const rawStatus = String(c.status || '').toUpperCase();
            const status: ContestStatus = rawStatus === 'RUNNING' ? 'LIVE' : rawStatus === 'ENDED' ? 'PAST' : 'UPCOMING';
            const durationMins = c.startTime && c.endTime
              ? Math.round((new Date(c.endTime).getTime() - new Date(c.startTime).getTime()) / 60000)
              : 120;
            return {
              id: c.id,
              code: c.code || `CONTEST-${String(101 + idx)}`,
              slug: c.slug || c.id,
              title: c.title,
              description: c.description || 'Weekly competitive programming round featuring standard ICPC and ACM scoring formats.',
              status,
              scope: (c.scope || 'Global') as ContestScope,
              scoringFormat: (c.scoringFormat || 'ICPC (Penalty Time)') as ScoringFormat,
              startTime: c.startTime || new Date(Date.now() + 86400000).toISOString(),
              endTime: c.endTime || new Date(Date.now() + 86400000 + 7200000).toISOString(),
              durationMinutes: durationMins,
              problemsCount: c._count?.problems || 4,
              registeredParticipants: c._count?.registrations || 240,
              submissionsCount: c._count?.submissions || 0,
              organizer: c.organizer || 'Competitive Programming Council',
              bannerColor: '#2563EB',
              tags: Array.isArray(c.tags) ? c.tags : ['Rated', 'Standard'],
              rated: c.rated !== undefined ? Boolean(c.rated) : true,
            };
          });
          setContests(mapped);
        }
      } catch (err) {
        console.warn('Live contests fetch fallback:', err);
      }
    }
    loadContests();
    return () => {
      isMounted = false;
    };
  }, [registeredIds]);

  const formatCountdown = (targetIso: string, isLive: boolean) => {
    if (now === null) return '--:--:--';
    const diff = new Date(targetIso).getTime() - now;
    if (diff <= 0) return isLive ? 'Ending soon' : 'Started';

    const totalHours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    if (totalHours >= 24) {
      const days = Math.floor(totalHours / 24);
      const remHours = totalHours % 24;
      return `${isLive ? 'Ends in' : 'Starts in'} ${days}d ${remHours}h`;
    }
    const prefix = isLive ? 'Ends in ' : 'Starts in ';
    return `${prefix}${totalHours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRegister = async (contestId: string, title: string) => {
    setRegisteredIds((prev) => new Set(prev).add(contestId));
    try {
      await apiService.registerForContest(contestId);
      toast.success(`Successfully registered for ${title}!`, 'Registration Confirmed');
    } catch (err: any) {
      setRegisteredIds((prev) => {
        const next = new Set(prev);
        next.delete(contestId);
        return next;
      });
      toast.error(err?.message || `Failed to register for ${title}.`, 'Registration Failed');
    }
  };

  // Reset pagination on filter change
  useEffect(() => {
    setPage(0);
  }, [search, scopeFilter, statusTab, divisionFilter]);

  // Filtered dataset
  const filteredContests = useMemo(() => {
    return contests.filter((c) => {
      const matchesSearch =
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.code.toLowerCase().includes(search.toLowerCase()) ||
        c.organizer.toLowerCase().includes(search.toLowerCase()) ||
        c.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));

      const matchesScope = scopeFilter === 'ALL' || c.scope === scopeFilter;
      const matchesStatus = statusTab === 'ALL' || c.status === statusTab;
      const matchesDivision = divisionFilter === 'ALL' || c.division === divisionFilter;

      return matchesSearch && matchesScope && matchesStatus && matchesDivision;
    });
  }, [contests, search, scopeFilter, statusTab, divisionFilter]);

  // Export CSV using Blob to prevent truncation on '#' or special chars
  const handleExportCSV = () => {
    const headers = ['Code', 'Title', 'Status', 'Scope', 'DurationMinutes', 'Problems', 'Registered', 'Scoring'];
    const rows = filteredContests.map((c) => [
      c.code,
      `"${c.title.replace(/"/g, '""')}"`,
      c.status,
      `"${c.scope}"`,
      c.durationMinutes,
      c.problemsCount,
      c.registeredParticipants,
      `"${c.scoringFormat}"`,
    ]);

    const csvData = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `contests_archive_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const liveCount = MOCK_CONTESTS.filter((c) => c.status === 'LIVE').length;
  const upcomingCount = MOCK_CONTESTS.filter((c) => c.status === 'UPCOMING').length;

  return (
    <StudentAppLayout streakDays={48} contestRating={2380} ratingTier="Master">
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* ========================================================================= */}
        {/* TOP HERO HEADER & METRICS */}
        {/* ========================================================================= */}
        <Box
          sx={{
            display: 'flex',
            alignItems: { xs: 'flex-start', md: 'center' },
            justifyContent: 'space-between',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 2,
          }}
        >
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
                Competitive Contests Arena
              </Typography>
              {liveCount > 0 && (
                <Chip
                  icon={<FiberManualRecordIcon sx={{ fontSize: 10, color: '#16A34A !important', animation: 'pulse 1.5s infinite' }} />}
                  label={`${liveCount} LIVE NOW`}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(22, 163, 74, 0.1)',
                    color: '#16A34A',
                    fontWeight: 800,
                    fontSize: '0.72rem',
                  }}
                />
              )}
            </Box>
            <Typography variant="body2" sx={{ color: '#64748B' }}>
              Participate in rated weekly contests, collegiate ICPC simulations, and institutional hackathons.
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<DownloadRoundedIcon sx={{ fontSize: 17 }} />}
              onClick={handleExportCSV}
              sx={{
                bgcolor: '#FFFFFF',
                borderColor: '#CBD5E1',
                color: '#334155',
                fontWeight: 700,
                textTransform: 'none',
                borderRadius: '8px',
                px: 2,
                py: 0.8,
                '&:hover': { bgcolor: '#F8FAFC', borderColor: '#94A3B8' },
              }}
            >
              Export CSV
            </Button>
          </Box>
        </Box>

        {/* ========================================================================= */}
        {/* LIST TABLE CONTAINER (Core Rule #10: Strict List Table Format) */}
        {/* ========================================================================= */}
        <Card
          sx={{
            borderRadius: '16px',
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            overflow: 'hidden',
          }}
        >
          {/* Controls Bar */}
          <Box
            sx={{
              p: 2,
              borderBottom: '1px solid #F1F5F9',
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: { xs: 'stretch', md: 'center' },
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            {/* Status Tabs */}
            <Tabs
              value={statusTab}
              onChange={(_, val) => setStatusTab(val)}
              sx={{
                minHeight: 40,
                '& .MuiTab-root': {
                  minHeight: 40,
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  textTransform: 'none',
                  color: '#64748B',
                  '&.Mui-selected': { color: '#2563EB' },
                },
                '& .MuiTabs-indicator': { bgcolor: '#2563EB', height: 3, borderRadius: '3px 3px 0 0' },
              }}
            >
              <Tab label="All Contests" value="ALL" />
              <Tab label={`Live (${liveCount})`} value="LIVE" />
              <Tab label={`Upcoming (${upcomingCount})`} value="UPCOMING" />
              <Tab label="Past Archive" value="PAST" />
            </Tabs>

            {/* Search & Scope Filters */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
              <TextField
                size="small"
                placeholder="Search contest title, code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchRoundedIcon sx={{ fontSize: 19, color: '#94A3B8' }} />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  minWidth: { xs: '100%', sm: 260 },
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    bgcolor: '#F8FAFC',
                    fontSize: '0.84rem',
                  },
                }}
              />

              <FormControl size="small" sx={{ minWidth: 150 }}>
                <Select
                  value={divisionFilter}
                  onChange={(e) => setDivisionFilter(e.target.value)}
                  sx={{
                    borderRadius: '8px',
                    bgcolor: '#F8FAFC',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    color: '#334155',
                  }}
                >
                  <MenuItem value="ALL" sx={{ fontSize: '0.84rem', fontWeight: 600 }}>All Divisions</MenuItem>
                  <MenuItem value="Div 1" sx={{ fontSize: '0.84rem', color: '#DC2626', fontWeight: 700 }}>Div 1 (2000+)</MenuItem>
                  <MenuItem value="Div 2" sx={{ fontSize: '0.84rem', color: '#2563EB', fontWeight: 700 }}>Div 2 (1600-1999)</MenuItem>
                  <MenuItem value="Div 3" sx={{ fontSize: '0.84rem', color: '#16A34A', fontWeight: 700 }}>Div 3 (1400-1599)</MenuItem>
                  <MenuItem value="Div 4" sx={{ fontSize: '0.84rem', color: '#64748B', fontWeight: 700 }}>Div 4 (0-1399)</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 150 }}>
                <Select
                  value={scopeFilter}
                  onChange={(e) => setScopeFilter(e.target.value)}
                  sx={{
                    borderRadius: '8px',
                    bgcolor: '#F8FAFC',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    color: '#334155',
                  }}
                >
                  <MenuItem value="ALL" sx={{ fontSize: '0.84rem', fontWeight: 600 }}>All Scopes</MenuItem>
                  <MenuItem value="Global" sx={{ fontSize: '0.84rem' }}>Global</MenuItem>
                  <MenuItem value="Institute League" sx={{ fontSize: '0.84rem' }}>Institute League</MenuItem>
                  <MenuItem value="Institutional Invitational" sx={{ fontSize: '0.84rem' }}>Institutional Invitational</MenuItem>
                  <MenuItem value="Internal Faculty Assessment" sx={{ fontSize: '0.84rem' }}>Faculty Internal</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          {/* Table Element */}
          <TableContainer>
            <Table sx={{ minWidth: 850 }}>
              <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                <TableRow>
                  <TableCell sx={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', py: 1.5, width: 100 }}>
                    Status
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', py: 1.5, width: 120 }}>
                    Code
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', py: 1.5 }}>
                    Contest Title & Scope
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', py: 1.5, width: 150 }}>
                    Duration & Time
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', py: 1.5, width: 90 }}>
                    Problems
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', py: 1.5, width: 110 }}>
                    Participants
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', py: 1.5, width: 140 }}>
                    Scoring System
                  </TableCell>
                  <TableCell align="right" sx={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', py: 1.5, width: 140 }}>
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredContests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 6, color: '#94A3B8' }}>
                      <Typography sx={{ fontWeight: 600, fontSize: '0.92rem' }}>
                        No contests found matching the criteria.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredContests
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((contest) => {
                      const isRegistered = registeredIds.has(contest.id);
                      const isLive = contest.status === 'LIVE';
                      const isUpcoming = contest.status === 'UPCOMING';
                      const isPast = contest.status === 'PAST';

                      return (
                        <TableRow
                          key={contest.id}
                          hover
                          sx={{
                            '&:hover': { bgcolor: 'rgba(248, 250, 252, 0.8)' },
                            transition: 'background-color 0.15s ease',
                          }}
                        >
                          {/* Status Badge */}
                          <TableCell sx={{ py: 1.8 }}>
                            {isLive && (
                              <Chip
                                icon={<FiberManualRecordIcon sx={{ fontSize: 9, color: '#16A34A !important' }} />}
                                label="LIVE"
                                size="small"
                                sx={{
                                  bgcolor: 'rgba(22, 163, 74, 0.12)',
                                  color: '#16A34A',
                                  fontWeight: 800,
                                  fontSize: '0.72rem',
                                  height: 24,
                                }}
                              />
                            )}
                            {isUpcoming && (
                              <Chip
                                label="UPCOMING"
                                size="small"
                                sx={{
                                  bgcolor: 'rgba(37, 99, 235, 0.1)',
                                  color: '#2563EB',
                                  fontWeight: 700,
                                  fontSize: '0.72rem',
                                  height: 24,
                                }}
                              />
                            )}
                            {isPast && (
                              <Chip
                                label="PAST"
                                size="small"
                                sx={{
                                  bgcolor: '#F1F5F9',
                                  color: '#64748B',
                                  fontWeight: 700,
                                  fontSize: '0.72rem',
                                  height: 24,
                                }}
                              />
                            )}
                          </TableCell>

                          {/* Code */}
                          <TableCell sx={{ py: 1.8, fontFamily: 'monospace', fontWeight: 700, color: '#64748B', fontSize: '0.82rem' }}>
                            {contest.code}
                          </TableCell>

                          {/* Title & Scope */}
                          <TableCell sx={{ py: 1.8 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                              <Typography sx={{ fontWeight: 800, fontSize: '0.92rem', color: '#0F172A' }}>
                                {contest.title}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap' }}>
                                {contest.division && (
                                  <Chip
                                    label={contest.division}
                                    size="small"
                                    sx={{
                                      fontSize: '0.68rem',
                                      fontWeight: 800,
                                      height: 18,
                                      bgcolor:
                                        contest.division === 'Div 1'
                                          ? 'rgba(220, 38, 38, 0.1)'
                                          : contest.division === 'Div 2'
                                          ? 'rgba(37, 99, 235, 0.1)'
                                          : contest.division === 'Div 3'
                                          ? 'rgba(22, 163, 74, 0.1)'
                                          : 'rgba(100, 116, 139, 0.1)',
                                      color:
                                        contest.division === 'Div 1'
                                          ? '#DC2626'
                                          : contest.division === 'Div 2'
                                          ? '#2563EB'
                                          : contest.division === 'Div 3'
                                          ? '#16A34A'
                                          : '#64748B',
                                    }}
                                  />
                                )}
                                <Chip
                                  label={contest.scope}
                                  size="small"
                                  sx={{
                                    fontSize: '0.68rem',
                                    fontWeight: 700,
                                    height: 18,
                                    bgcolor: '#F8FAFC',
                                    border: '1px solid #E2E8F0',
                                    color: '#475569',
                                  }}
                                />
                                {contest.rated && (
                                  <Chip
                                    label="★ Rated"
                                    size="small"
                                    sx={{
                                      fontSize: '0.68rem',
                                      fontWeight: 800,
                                      height: 18,
                                      bgcolor: 'rgba(217, 119, 6, 0.1)',
                                      color: '#D97706',
                                    }}
                                  />
                                )}
                                {contest.ratingRange && (
                                  <Typography sx={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>
                                    ({contest.ratingRange})
                                  </Typography>
                                )}
                                <Typography sx={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                                  By {contest.organizer}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>

                          {/* Duration & Live Countdown */}
                          <TableCell sx={{ py: 1.8 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <TimerOutlinedIcon sx={{ fontSize: 14, color: isLive ? '#16A34A' : '#64748B' }} />
                                <Typography
                                  sx={{
                                    fontSize: '0.82rem',
                                    fontWeight: 700,
                                    color: isLive ? '#16A34A' : '#0F172A',
                                    fontFamily: isLive || isUpcoming ? 'monospace' : 'inherit',
                                  }}
                                >
                                  {isLive
                                    ? formatCountdown(contest.endTime, true)
                                    : isUpcoming
                                    ? formatCountdown(contest.startTime, false)
                                    : `${contest.durationMinutes} mins`}
                                </Typography>
                              </Box>
                              <Typography sx={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                                Length: {contest.durationMinutes} min
                              </Typography>
                            </Box>
                          </TableCell>

                          {/* Problems Count */}
                          <TableCell sx={{ py: 1.8, fontSize: '0.84rem', fontWeight: 700, color: '#334155' }}>
                            {contest.problemsCount} Qs
                          </TableCell>

                          {/* Registered Participants */}
                          <TableCell sx={{ py: 1.8 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <PeopleAltOutlinedIcon sx={{ fontSize: 15, color: '#94A3B8' }} />
                              <Typography sx={{ fontSize: '0.84rem', fontWeight: 700, color: '#334155' }}>
                                {contest.registeredParticipants.toLocaleString()}
                              </Typography>
                            </Box>
                          </TableCell>

                          {/* Scoring System */}
                          <TableCell sx={{ py: 1.8, fontSize: '0.8rem', color: '#475569', fontWeight: 600 }}>
                            {contest.scoringFormat}
                          </TableCell>

                          {/* Action Button */}
                          <TableCell align="right" sx={{ py: 1.8 }}>
                            {isLive ? (
                              <Button
                                size="small"
                                variant="contained"
                                startIcon={<PlayArrowRoundedIcon sx={{ fontSize: 16 }} />}
                                onClick={() => router.push('/problems')}
                                sx={{
                                  borderRadius: '6px',
                                  textTransform: 'none',
                                  fontWeight: 800,
                                  fontSize: '0.8rem',
                                  px: 2,
                                  py: 0.6,
                                  bgcolor: '#16A34A',
                                  '&:hover': { bgcolor: '#15803D' },
                                }}
                              >
                                Enter Arena
                              </Button>
                            ) : isUpcoming ? (
                              isRegistered ? (
                                <Chip
                                  label="✓ Registered"
                                  size="small"
                                  sx={{
                                    bgcolor: 'rgba(34, 197, 94, 0.15)',
                                    color: '#16A34A',
                                    fontWeight: 800,
                                    fontSize: '0.75rem',
                                    height: 28,
                                    px: 1,
                                  }}
                                />
                              ) : (
                                <Button
                                  size="small"
                                  variant="outlined"
                                  startIcon={<HowToRegRoundedIcon sx={{ fontSize: 15 }} />}
                                  onClick={() => handleRegister(contest.id, contest.title)}
                                  sx={{
                                    borderRadius: '6px',
                                    textTransform: 'none',
                                    fontWeight: 700,
                                    fontSize: '0.78rem',
                                    borderColor: '#2563EB',
                                    color: '#2563EB',
                                    '&:hover': { bgcolor: 'rgba(37, 99, 235, 0.08)' },
                                  }}
                                >
                                  Register
                                </Button>
                              )
                            ) : (
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<LeaderboardRoundedIcon sx={{ fontSize: 15 }} />}
                                onClick={() => router.push('/leaderboard')}
                                sx={{
                                  borderRadius: '6px',
                                  textTransform: 'none',
                                  fontWeight: 700,
                                  fontSize: '0.78rem',
                                  borderColor: '#CBD5E1',
                                  color: '#475569',
                                  '&:hover': { bgcolor: '#F8FAFC', borderColor: '#94A3B8' },
                                }}
                              >
                                Standings
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={filteredContests.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            sx={{ borderTop: '1px solid #F1F5F9' }}
          />
        </Card>
      </Box>
    </StudentAppLayout>
  );
}
