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
  Avatar,
  Tooltip,
} from '@mui/material';

// Icons
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import MilitaryTechRoundedIcon from '@mui/icons-material/MilitaryTechRounded';
import WhatshotRoundedIcon from '@mui/icons-material/WhatshotRounded';
import { FluidArrowOutward } from '@/utils/fluid_arrow';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';

import StudentAppLayout from '@/components/students/layout/StudentAppLayout';
import { MOCK_LEADERBOARD, LeaderboardRankEntity } from '@/lib/mock-leaderboard-data';
import { apiService } from '@/lib/api-service';
import StarRatingBadge from '@/components/shared/StarRatingBadge';
import { getDivisionFromRating } from '@/utils/codechefRating';

const TIER_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Grandmaster: { bg: 'rgba(239, 68, 68, 0.1)', text: '#EF4444', border: 'rgba(239, 68, 68, 0.25)' },
  Master: { bg: 'rgba(245, 158, 11, 0.1)', text: '#F59E0B', border: 'rgba(245, 158, 11, 0.25)' },
  'Candidate Master': { bg: 'rgba(139, 92, 246, 0.1)', text: '#8B5CF6', border: 'rgba(139, 92, 246, 0.25)' },
  Expert: { bg: 'rgba(59, 130, 246, 0.1)', text: '#3B82F6', border: 'rgba(59, 130, 246, 0.25)' },
  Specialist: { bg: 'rgba(16, 185, 129, 0.1)', text: '#10B981', border: 'rgba(16, 185, 129, 0.25)' },
};

export default function LeaderboardClient() {
  const router = useRouter();

  const [ranks, setRanks] = useState<LeaderboardRankEntity[]>(MOCK_LEADERBOARD);
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<string>('GLOBAL');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Fetch live ranked users from database with fallback
  useEffect(() => {
    let isMounted = true;
    async function loadLeaderboard() {
      try {
        const res = await apiService.getUsers({ limit: 100, role: 'STUDENT' });
        if (isMounted && res?.items && res.items.length > 0) {
          const sortedUsers = [...res.items].sort(
            (a: any, b: any) => (b.contestRating || 1500) - (a.contestRating || 1500),
          );
          const mapped: LeaderboardRankEntity[] = sortedUsers.map((u: any, idx: number) => {
            const rating = u.contestRating || 1500;
            let tier: 'Grandmaster' | 'Master' | 'Candidate Master' | 'Expert' | 'Specialist' = 'Specialist';
            let tierColor = '#10B981';
            let badge = '⭐ Specialist';
            if (rating >= 2400) {
              tier = 'Grandmaster';
              tierColor = '#EF4444';
              badge = '🏆 Grandmaster';
            } else if (rating >= 2100) {
              tier = 'Master';
              tierColor = '#F59E0B';
              badge = '🥇 Master';
            } else if (rating >= 1900) {
              tier = 'Candidate Master';
              tierColor = '#8B5CF6';
              badge = '🥈 Candidate Master';
            } else if (rating >= 1600) {
              tier = 'Expert';
              tierColor = '#3B82F6';
              badge = '🥉 Expert';
            }
            const inst = u.institution || u.memberships?.[0]?.institution?.name || 'Academic Institute';
            const handle = u.handle || u.username || u.rollNo || `coder_${idx + 1}`;
            return {
              id: u.id || `rank-${idx + 1}`,
              rank: idx + 1,
              handle,
              name: u.name || 'Competitive Programmer',
              avatar: u.avatar || u.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
              rating,
              ratingTier: tier,
              tierColor,
              country: u.country || 'Global',
              countryCode: u.countryCode || 'us',
              institution: inst,
              problemsSolved: u.problemsSolved || Math.round(rating / 10),
              contestsAttended: u.contestsAttended || 12,
              globalPercentile: u.globalPercentile || `Top ${Math.max(1, Math.round(((idx + 1) / sortedUsers.length) * 100))}%`,
              streakDays: u.streakDays || 15,
              badge,
            };
          });
          setRanks(mapped);
        }
      } catch (err) {
        console.warn('Live leaderboard fetch fallback:', err);
      }
    }
    loadLeaderboard();
    return () => {
      isMounted = false;
    };
  }, []);

  // Reset pagination on filter change
  useEffect(() => {
    setPage(0);
  }, [search, tierFilter, activeTab]);

  // Filtered dataset
  const filteredRanks = useMemo(() => {
    return ranks.filter((r) => {
      const matchesSearch =
        r.handle.toLowerCase().includes(search.toLowerCase()) ||
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.institution.toLowerCase().includes(search.toLowerCase()) ||
        r.country.toLowerCase().includes(search.toLowerCase());

      const matchesTier = tierFilter === 'ALL' || r.ratingTier === tierFilter;

      let matchesTab = true;
      if (activeTab === 'COLLEGIATE') {
        matchesTab =
          r.institution.toLowerCase().includes('university') ||
          r.institution.toLowerCase().includes('institute') ||
          r.institution.toLowerCase().includes('college') ||
          r.institution.toLowerCase().includes('mit') ||
          r.institution.toLowerCase().includes('iit') ||
          r.institution.toLowerCase().includes('tsinghua') ||
          r.institution.toLowerCase().includes('eth') ||
          r.institution.toLowerCase().includes('oxford');
      } else if (activeTab === 'DIV1') {
        matchesTab = r.rating >= 2000;
      } else if (activeTab === 'DIV2') {
        matchesTab = r.rating >= 1600 && r.rating < 2000;
      } else if (activeTab === 'DIV3') {
        matchesTab = r.rating >= 1400 && r.rating < 1600;
      } else if (activeTab === 'DIV4') {
        matchesTab = r.rating < 1400;
      } else if (activeTab === 'WEEKLY') {
        matchesTab = r.streakDays >= 30;
      }

      return matchesSearch && matchesTier && matchesTab;
    });
  }, [ranks, search, tierFilter, activeTab]);

  // Export CSV using Blob to prevent truncation on '#' or special chars
  const handleExportCSV = () => {
    const headers = ['Rank', 'Handle', 'Name', 'Rating', 'Tier', 'ProblemsSolved', 'Institution', 'Country', 'Contests'];
    const rows = filteredRanks.map((r) => [
      r.rank,
      `"${r.handle}"`,
      `"${r.name.replace(/"/g, '""')}"`,
      r.rating,
      r.ratingTier,
      r.problemsSolved,
      `"${r.institution.replace(/"/g, '""')}"`,
      r.country,
      r.contestsAttended,
    ]);

    const csvData = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `leaderboard_rankings_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const top3 = ranks.slice(0, 3);

  // Contest Matrix Problem Columns for START256
  const CONTEST_PROBLEMS = [
    { code: 'P1', title: 'CC_PRB_480', pts: 100 },
    { code: 'P2', title: 'CC_PRB_1420', pts: 100 },
    { code: 'P3', title: 'CC_PRB_2240', pts: 100 },
    { code: 'P4', title: 'CC_PRB_2600', pts: 100 },
    { code: 'P5', title: 'CC_PRB_2800', pts: 100 },
    { code: 'P6', title: 'CC_PRB_3100', pts: 100 },
  ];

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
                Global & Division Leaderboard
              </Typography>
              <Chip
                icon={<WorkspacePremiumRoundedIcon sx={{ fontSize: 13, color: '#D97706 !important' }} />}
                label="Rating Season 2026"
                size="small"
                sx={{
                  bgcolor: 'rgba(217, 119, 6, 0.1)',
                  color: '#D97706',
                  fontWeight: 700,
                  fontSize: '0.72rem',
                }}
              />
            </Box>
            <Typography variant="body2" sx={{ color: '#64748B' }}>
              Live ELO rating standings and contest problem scoreboards across CodeChef divisions and college leagues.
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
        {/* TOP 3 PODIUM HIGHLIGHT CARDS */}
        {/* ========================================================================= */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gap: 2.5,
          }}
        >
          {top3.map((coder, idx) => {
            const isFirst = idx === 0;
            const medalColor = idx === 0 ? '#F59E0B' : idx === 1 ? '#94A3B8' : '#D97706';
            const medalEmoji = idx === 0 ? '👑' : idx === 1 ? '🥈' : '🥉';

            return (
              <Card
                key={coder.id}
                sx={{
                  p: 2.5,
                  borderRadius: '16px',
                  bgcolor: '#FFFFFF',
                  border: isFirst ? '2px solid rgba(245, 158, 11, 0.4)' : '1px solid #E2E8F0',
                  boxShadow: isFirst ? '0 10px 30px rgba(245, 158, 11, 0.12)' : '0 4px 20px rgba(0,0,0,0.03)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: 10,
                    right: 12,
                    fontSize: '1.2rem',
                  }}
                >
                  {medalEmoji}
                </Box>

                <Avatar
                  src={coder.avatar}
                  alt={coder.name}
                  sx={{
                    width: 52,
                    height: 52,
                    border: `2px solid ${medalColor}`,
                    boxShadow: `0 4px 12px ${medalColor}33`,
                  }}
                />

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography noWrap sx={{ fontWeight: 800, fontSize: '0.94rem', color: '#0F172A' }}>
                      {coder.name}
                    </Typography>
                    <Chip
                      label={`Rank #${coder.rank}`}
                      size="small"
                      sx={{
                        bgcolor: `${medalColor}15`,
                        color: medalColor,
                        fontWeight: 800,
                        fontSize: '0.68rem',
                        height: 20,
                      }}
                    />
                  </Box>

                  <Typography sx={{ fontSize: '0.78rem', color: '#64748B', fontFamily: 'monospace' }}>
                    @{coder.handle}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.4 }}>
                    <StarRatingBadge rating={coder.rating} size="small" showStars={true} showDivision={true} />
                  </Box>
                </Box>
              </Card>
            );
          })}
        </Box>

        {/* ========================================================================= */}
        {/* LEADERBOARD MAIN LIST TABLE CARD */}
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
          {/* Tabs and Filters Bar */}
          <Box
            sx={{
              p: 2,
              borderBottom: '1px solid #F1F5F9',
              display: 'flex',
              flexDirection: { xs: 'column', lg: 'row' },
              alignItems: { xs: 'stretch', lg: 'center' },
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            {/* Division Tabs */}
            <Tabs
              value={activeTab}
              onChange={(_, val) => setActiveTab(val)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                minHeight: 40,
                '& .MuiTab-root': {
                  minHeight: 40,
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  textTransform: 'none',
                  color: '#64748B',
                  '&.Mui-selected': { color: '#2563EB' },
                },
                '& .MuiTabs-indicator': { bgcolor: '#2563EB', height: 3, borderRadius: '3px 3px 0 0' },
              }}
            >
              <Tab label="All Divisions" value="GLOBAL" />
              <Tab label="Div 1 (2000+)" value="DIV1" />
              <Tab label="Div 2 (1600-1999)" value="DIV2" />
              <Tab label="Div 3 (1400-1599)" value="DIV3" />
              <Tab label="Div 4 (0-1399)" value="DIV4" />
              <Tab label="Institute League" value="COLLEGIATE" />
              <Tab label="⚡ START256 Scoreboard Matrix" value="START256" />
            </Tabs>

            {/* Search & Tier Filters */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
              <TextField
                size="small"
                placeholder="Search coder, handle, institute..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                slotProps={{
                  input: {
                    'aria-label': 'Search coders by handle, name, university, or country',
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchRoundedIcon sx={{ fontSize: 19, color: '#94A3B8' }} />
                      </InputAdornment>
                    ),
                  },
                  htmlInput: {
                    'aria-label': 'Search coders by handle, name, university, or country',
                  },
                }}
                sx={{
                  minWidth: { xs: '100%', sm: 240 },
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    bgcolor: '#F8FAFC',
                    fontSize: '0.84rem',
                  },
                }}
              />
            </Box>
          </Box>

          {/* Table Element */}
          <TableContainer>
            {activeTab === 'START256' ? (
              /* LIVE CONTEST SCOREBOARD MATRIX TABLE */
              <Table sx={{ minWidth: 950 }}>
                <TableHead sx={{ bgcolor: '#0B0F19' }}>
                  <TableRow>
                    <TableCell sx={{ fontSize: '0.74rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', py: 1.5, width: 70 }}>
                      Rank
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.74rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', py: 1.5, minWidth: 200 }}>
                      Contestant
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.74rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', py: 1.5, width: 90 }}>
                      Score
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.74rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', py: 1.5, width: 100 }}>
                      Penalty
                    </TableCell>
                    {CONTEST_PROBLEMS.map((p) => (
                      <TableCell key={p.code} align="center" sx={{ fontSize: '0.72rem', fontWeight: 800, color: '#38BDF8', textTransform: 'uppercase', py: 1.5, width: 100 }}>
                        {p.code}
                        <Typography sx={{ fontSize: '0.62rem', color: '#64748B', fontWeight: 600 }}>
                          {p.title.replace('CC_PRB_', '')}
                        </Typography>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRanks.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((r, itemIndex) => {
                    const idx = page * rowsPerPage + itemIndex;
                    const isCurrentUser = r.handle === 'paulsaha';
                    const score = Math.max(100, 600 - idx * 50);
                    const penaltyMins = 14 + idx * 18;

                    return (
                      <TableRow
                        key={r.id}
                        hover
                        sx={{
                          bgcolor: isCurrentUser ? 'rgba(37, 99, 235, 0.05)' : 'transparent',
                          '&:hover': { bgcolor: isCurrentUser ? 'rgba(37, 99, 235, 0.08)' : 'rgba(248, 250, 252, 0.8)' },
                          transition: 'background-color 0.15s ease',
                        }}
                      >
                        <TableCell sx={{ py: 1.5, fontWeight: 900, color: idx === 0 ? '#F59E0B' : idx === 1 ? '#94A3B8' : idx === 2 ? '#D97706' : '#64748B' }}>
                          #{idx + 1}
                        </TableCell>
                        <TableCell sx={{ py: 1.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                            <Avatar src={r.avatar} alt={r.name} sx={{ width: 32, height: 32 }} />
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                <Typography sx={{ fontWeight: 800, fontSize: '0.86rem', color: '#0F172A' }}>
                                  {r.name}
                                </Typography>
                                {isCurrentUser && (
                                  <Chip label="YOU" size="small" sx={{ bgcolor: '#2563EB', color: '#FFFFFF', fontWeight: 800, fontSize: '0.6rem', height: 16 }} />
                                )}
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                <Typography sx={{ fontSize: '0.72rem', color: '#64748B', fontFamily: 'monospace' }}>
                                  @{r.handle}
                                </Typography>
                                <StarRatingBadge rating={r.rating} size="small" showStars={false} showDivision={true} />
                              </Box>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ py: 1.5 }}>
                          <Chip
                            label={`${score} pts`}
                            size="small"
                            sx={{ fontWeight: 800, fontSize: '0.72rem', bgcolor: 'rgba(22, 163, 74, 0.1)', color: '#16A34A' }}
                          />
                        </TableCell>
                        <TableCell sx={{ py: 1.5, fontSize: '0.8rem', fontFamily: 'monospace', color: '#64748B', fontWeight: 600 }}>
                          {penaltyMins} min
                        </TableCell>
                        {CONTEST_PROBLEMS.map((p, pIdx) => {
                          const solved = pIdx <= Math.floor(score / 100) - 1;
                          const solveTime = `${Math.floor(penaltyMins / (pIdx + 1))}:${String((pIdx * 17) % 60).padStart(2, '0')}`;
                          return (
                            <TableCell key={p.code} align="center" sx={{ py: 1.5 }}>
                              {solved ? (
                                <Box
                                  sx={{
                                    bgcolor: 'rgba(22, 163, 74, 0.12)',
                                    border: '1px solid rgba(22, 163, 74, 0.3)',
                                    borderRadius: '6px',
                                    p: 0.5,
                                    display: 'inline-flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    minWidth: 64,
                                  }}
                                >
                                  <Typography sx={{ fontSize: '0.74rem', fontWeight: 800, color: '#16A34A' }}>
                                    +100
                                  </Typography>
                                  <Typography sx={{ fontSize: '0.62rem', color: '#15803D', fontFamily: 'monospace' }}>
                                    {solveTime}
                                  </Typography>
                                </Box>
                              ) : pIdx === Math.floor(score / 100) ? (
                                <Box
                                  sx={{
                                    bgcolor: 'rgba(220, 38, 38, 0.08)',
                                    border: '1px solid rgba(220, 38, 38, 0.2)',
                                    borderRadius: '6px',
                                    p: 0.5,
                                    display: 'inline-flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    minWidth: 64,
                                  }}
                                >
                                  <Typography sx={{ fontSize: '0.74rem', fontWeight: 800, color: '#DC2626' }}>
                                    -2
                                  </Typography>
                                  <Typography sx={{ fontSize: '0.62rem', color: '#DC2626' }}>
                                    WA
                                  </Typography>
                                </Box>
                              ) : (
                                <Typography sx={{ color: '#CBD5E1', fontSize: '0.8rem' }}>—</Typography>
                              )}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              /* STANDARD DIVISION STANDINGS TABLE */
              <Table sx={{ minWidth: 850 }}>
                <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                  <TableRow>
                    <TableCell sx={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', py: 1.5, width: 80 }}>
                      Rank
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', py: 1.5 }}>
                      Coder & Handle
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', py: 1.5, width: 170 }}>
                      CodeChef Star Rating
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', py: 1.5, width: 110 }}>
                      Rating
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', py: 1.5, width: 120 }}>
                      Percentile
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', py: 1.5, width: 110 }}>
                      Solved
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', py: 1.5 }}>
                      College / Institution
                    </TableCell>
                    <TableCell align="right" sx={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', py: 1.5, width: 100 }}>
                      Action
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRanks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 6, color: '#94A3B8' }}>
                        <Typography sx={{ fontWeight: 600, fontSize: '0.92rem' }}>
                          No coders found matching the criteria.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRanks
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((r) => {
                        const isCurrentUser = r.handle === 'paulsaha';

                        return (
                          <TableRow
                            key={r.id}
                            hover
                            sx={{
                              bgcolor: isCurrentUser ? 'rgba(37, 99, 235, 0.04)' : 'transparent',
                              '&:hover': { bgcolor: isCurrentUser ? 'rgba(37, 99, 235, 0.08)' : 'rgba(248, 250, 252, 0.8)' },
                              transition: 'background-color 0.15s ease',
                            }}
                          >
                            {/* Rank */}
                            <TableCell sx={{ py: 1.8 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                {r.rank === 1 ? (
                                  <Typography sx={{ fontWeight: 900, color: '#F59E0B', fontSize: '1rem' }}>
                                    #1
                                  </Typography>
                                ) : r.rank === 2 ? (
                                  <Typography sx={{ fontWeight: 900, color: '#94A3B8', fontSize: '0.95rem' }}>
                                    #2
                                  </Typography>
                                ) : r.rank === 3 ? (
                                  <Typography sx={{ fontWeight: 900, color: '#D97706', fontSize: '0.95rem' }}>
                                    #3
                                  </Typography>
                                ) : (
                                  <Typography sx={{ fontWeight: 700, color: '#64748B', fontSize: '0.86rem', fontFamily: 'monospace' }}>
                                    #{r.rank}
                                  </Typography>
                                )}
                              </Box>
                            </TableCell>

                            {/* Coder Avatar + Name */}
                            <TableCell sx={{ py: 1.8 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Avatar
                                  src={r.avatar}
                                  alt={r.name}
                                  sx={{
                                    width: 38,
                                    height: 38,
                                    border: isCurrentUser ? '2px solid #2563EB' : '1px solid #E2E8F0',
                                  }}
                                />
                                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                    <Typography sx={{ fontWeight: 800, fontSize: '0.88rem', color: isCurrentUser ? '#2563EB' : '#0F172A' }}>
                                      {r.name}
                                    </Typography>
                                    {isCurrentUser && (
                                      <Chip
                                        label="YOU"
                                        size="small"
                                        sx={{
                                          bgcolor: '#2563EB',
                                          color: '#FFFFFF',
                                          fontWeight: 800,
                                          fontSize: '0.62rem',
                                          height: 16,
                                        }}
                                      />
                                    )}
                                  </Box>
                                  <Typography sx={{ fontSize: '0.74rem', color: '#64748B', fontFamily: 'monospace' }}>
                                    @{r.handle} • {r.country}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>

                            {/* CodeChef Star Rating Badge */}
                            <TableCell sx={{ py: 1.8 }}>
                              <StarRatingBadge rating={r.rating} size="small" showStars={true} showDivision={true} />
                            </TableCell>

                            {/* Rating */}
                            <TableCell sx={{ py: 1.8, fontWeight: 900, fontSize: '0.9rem', color: '#0F172A' }}>
                              {r.rating.toLocaleString()}
                            </TableCell>

                            {/* Percentile */}
                            <TableCell sx={{ py: 1.8, fontSize: '0.82rem', fontWeight: 700, color: '#16A34A' }}>
                              {r.globalPercentile}
                            </TableCell>

                            {/* Problems Solved */}
                            <TableCell sx={{ py: 1.8, fontSize: '0.84rem', fontWeight: 700, color: '#334155' }}>
                              {r.problemsSolved}
                            </TableCell>

                            {/* College */}
                            <TableCell sx={{ py: 1.8, fontSize: '0.82rem', color: '#475569', fontWeight: 600 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <SchoolOutlinedIcon sx={{ fontSize: 15, color: '#94A3B8' }} />
                                <span>{r.institution}</span>
                              </Box>
                            </TableCell>

                            {/* Action */}
                            <TableCell align="right" sx={{ py: 1.8 }}>
                              <Button
                                size="small"
                                variant="outlined"
                                endIcon={<FluidArrowOutward size={14} />}
                                onClick={() => router.push(isCurrentUser ? '/students' : `/students/${r.handle}`)}
                                sx={{
                                  borderRadius: '6px',
                                  textTransform: 'none',
                                  fontWeight: 700,
                                  fontSize: '0.76rem',
                                  borderColor: '#E2E8F0',
                                  color: '#475569',
                                  '&:hover': { bgcolor: '#F8FAFC', borderColor: '#94A3B8', color: '#2563EB' },
                                }}
                              >
                                Profile
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                  )}
                </TableBody>
              </Table>
            )}
          </TableContainer>

          {/* Pagination */}
          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={filteredRanks.length}
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
