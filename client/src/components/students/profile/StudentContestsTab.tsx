'use client';

import React, { useState, useMemo } from 'react';
import { FluidArrowForward } from '@/utils/fluid_arrow';
import Link from 'next/link';
import {
  Box,
  Typography,
  Card,
  Chip,
  Button,
  TextField,
  InputAdornment,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import TrendingDownRoundedIcon from '@mui/icons-material/TrendingDownRounded';
import MilitaryTechRoundedIcon from '@mui/icons-material/MilitaryTechRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';

import { StudentContestHistory } from '@/types/student-profile';
import { useToast } from '@/context/ToastContext';

interface StudentContestsTabProps {
  contests: StudentContestHistory[];
}

function sanitizeCsvField(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '""';
  if (typeof value === 'number') return String(value);

  let str = String(value);
  if (/^[=+\-@]/.test(str)) {
    str = `'${str}`;
  }
  return `"${str.replace(/"/g, '""')}"`;
}

export default function StudentContestsTab({ contests }: StudentContestsTabProps) {
  const toast = useToast();
  const [contestSearch, setContestSearch] = useState('');

  const filteredContests = useMemo(() => {
    return contests.filter((c) =>
      c.contestName.toLowerCase().includes(contestSearch.toLowerCase()) ||
      c.id.toLowerCase().includes(contestSearch.toLowerCase())
    );
  }, [contests, contestSearch]);

  const rankedContests = useMemo(() => contests.filter((c) => typeof c.rank === 'number' && c.rank > 0), [contests]);
  const bestRank = rankedContests.length > 0 ? Math.min(...rankedContests.map((c) => c.rank)) : 0;
  const latestRating = contests.length > 0 ? contests[0].newRating : 1500;
  const totalContests = contests.length;
  const netDelta = contests.reduce((acc, c) => acc + (c.ratingDelta || 0), 0);

  const getRatingTier = (rating: number) => {
    if (rating >= 2100) return 'Grandmaster';
    if (rating >= 1900) return 'Master';
    if (rating >= 1600) return 'Expert';
    if (rating >= 1400) return 'Specialist';
    if (rating >= 1200) return 'Pupil';
    return 'Newbie';
  };

  const bestContest = rankedContests.find((c) => c.rank === bestRank);
  const bestPercentile = bestContest && bestContest.totalParticipants > 0
    ? Math.max(1, Math.round((bestContest.rank / bestContest.totalParticipants) * 100))
    : null;

  const handleExportCSV = () => {
    const headers = ['Contest Name', 'Date', 'Rank', 'Total Participants', 'Score', 'Penalty Time', 'Rating Delta', 'New Rating'];
    const rows = filteredContests.map((c) => [
      sanitizeCsvField(c.contestName),
      sanitizeCsvField(c.contestDate),
      sanitizeCsvField(c.rank),
      sanitizeCsvField(c.totalParticipants),
      sanitizeCsvField(c.score),
      sanitizeCsvField(c.penaltyTime),
      sanitizeCsvField(c.ratingDelta),
      sanitizeCsvField(c.newRating),
    ]);

    const csvData = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `contest_history_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.showToast(`Exported ${filteredContests.length} contest entries to CSV.`, 'success');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* Top 4 Contest Performance Stat Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2 }}>
        {/* Card 1: Active Contest Rating */}
        <Card
          elevation={0}
          sx={{
            p: 2.2,
            borderRadius: '16px',
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box>
            <Typography sx={{ color: '#64748B', fontSize: '0.74rem', fontWeight: 700 }}>Contest Rating</Typography>
            <Typography sx={{ color: '#0F172A', fontSize: '1.45rem', fontWeight: 900, mt: 0.3 }}>
              {totalContests > 0 ? latestRating : '-'} <span style={{ fontSize: '0.76rem', color: '#64748B', fontWeight: 600 }}>pts</span>
            </Typography>
            <Typography sx={{ color: '#0B1F3A', fontSize: '0.7rem', fontWeight: 700 }}>
              {totalContests > 0 ? `Tier: ${getRatingTier(latestRating)}` : 'Unrated'}
            </Typography>
          </Box>
          <Box sx={{ width: 44, height: 44, borderRadius: '12px', bgcolor: '#FAF5FF', color: '#0B1F3A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <EmojiEventsRoundedIcon sx={{ fontSize: 24 }} />
          </Box>
        </Card>

        {/* Card 2: Best Global Rank */}
        <Card
          elevation={0}
          sx={{
            p: 2.2,
            borderRadius: '16px',
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box>
            <Typography sx={{ color: '#64748B', fontSize: '0.74rem', fontWeight: 700 }}>Best Global Rank</Typography>
            <Typography sx={{ color: '#0F172A', fontSize: '1.45rem', fontWeight: 900, mt: 0.3 }}>
              {bestRank ? `#${bestRank}` : '-'}
            </Typography>
            <Typography sx={{ color: '#059669', fontSize: '0.7rem', fontWeight: 700 }}>
              {bestPercentile !== null ? `Top ${bestPercentile}% Standing` : totalContests > 0 ? 'Rank recorded' : 'No ranks recorded'}
            </Typography>
          </Box>
          <Box sx={{ width: 44, height: 44, borderRadius: '12px', bgcolor: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MilitaryTechRoundedIcon sx={{ fontSize: 24 }} />
          </Box>
        </Card>

        {/* Card 3: Contests Attended */}
        <Card
          elevation={0}
          sx={{
            p: 2.2,
            borderRadius: '16px',
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box>
            <Typography sx={{ color: '#64748B', fontSize: '0.74rem', fontWeight: 700 }}>Contests Attended</Typography>
            <Typography sx={{ color: '#0F172A', fontSize: '1.45rem', fontWeight: 900, mt: 0.3 }}>
              {totalContests}
            </Typography>
            <Typography sx={{ color: '#5B2D90', fontSize: '0.7rem', fontWeight: 700 }}>
              {totalContests > 0 ? `${totalContests} recorded rounds` : 'No rounds attended'}
            </Typography>
          </Box>
          <Box sx={{ width: 44, height: 44, borderRadius: '12px', bgcolor: '#FAF5FF', color: '#5B2D90', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <WorkspacePremiumRoundedIcon sx={{ fontSize: 24 }} />
          </Box>
        </Card>

        {/* Card 4: Net Rating Delta */}
        <Card
          elevation={0}
          sx={{
            p: 2.2,
            borderRadius: '16px',
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box>
            <Typography sx={{ color: '#64748B', fontSize: '0.74rem', fontWeight: 700 }}>Total Rating Gain</Typography>
            <Typography sx={{ color: netDelta >= 0 ? '#059669' : '#DC2626', fontSize: '1.45rem', fontWeight: 900, mt: 0.3 }}>
              {netDelta >= 0 ? `+${netDelta}` : netDelta} <span style={{ fontSize: '0.76rem', fontWeight: 600 }}>pts</span>
            </Typography>
            <Typography sx={{ color: '#64748B', fontSize: '0.7rem', fontWeight: 700 }}>
              Across all contest rounds
            </Typography>
          </Box>
          <Box sx={{ width: 44, height: 44, borderRadius: '12px', bgcolor: netDelta >= 0 ? '#ECFDF5' : '#FEF2F2', color: netDelta >= 0 ? '#059669' : '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {netDelta >= 0 ? <TrendingUpRoundedIcon sx={{ fontSize: 24 }} /> : <TrendingDownRoundedIcon sx={{ fontSize: 24 }} />}
          </Box>
        </Card>
      </Box>

      {/* Main Contests Table Card */}
      <Card
        elevation={0}
        sx={{
          borderRadius: '16px',
          bgcolor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
          overflow: 'hidden',
        }}
      >
        {/* Header & Controls */}
        <Box sx={{ p: 2.5, borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.05rem' }}>
              Competitive Contest Performance Log
            </Typography>
            <Typography sx={{ color: '#64748B', fontSize: '0.76rem' }}>
              Structured contest standing history, percentile rank, and rating rating adjustments.
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1.2, alignItems: 'center' }}>
            <TextField
              placeholder="Search contest..."
              size="small"
              value={contestSearch}
              onChange={(e) => setContestSearch(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon sx={{ fontSize: 17, color: '#94A3B8' }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                width: { xs: '100%', sm: 220 },
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  bgcolor: '#F8FAFC',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                },
              }}
            />

            <Button
              variant="outlined"
              size="small"
              startIcon={<FileDownloadRoundedIcon sx={{ fontSize: 16 }} />}
              onClick={handleExportCSV}
              sx={{
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 800,
                color: '#0B1F3A',
                borderColor: '#D8B4FE',
                bgcolor: '#FAF5FF',
                fontSize: '0.78rem',
                px: 1.5,
                py: 0.6,
                '&:hover': { bgcolor: '#E9D5FF', borderColor: '#0B1F3A' },
              }}
            >
              Export CSV
            </Button>
          </Box>
        </Box>

        {/* Structured List Table */}
        <TableContainer>
          <Table sx={{ minWidth: 700 }}>
            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, color: '#64748B', fontSize: '0.72rem', py: 1.2, borderColor: '#E2E8F0' }}>CONTEST NAME</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#64748B', fontSize: '0.72rem', borderColor: '#E2E8F0' }}>DATE</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#64748B', fontSize: '0.72rem', borderColor: '#E2E8F0' }}>RANK / TOTAL</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#64748B', fontSize: '0.72rem', borderColor: '#E2E8F0' }}>SCORE & PENALTY</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#64748B', fontSize: '0.72rem', borderColor: '#E2E8F0' }}>RATING DELTA</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#64748B', fontSize: '0.72rem', borderColor: '#E2E8F0' }}>NEW RATING</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#64748B', fontSize: '0.72rem', textAlign: 'right', borderColor: '#E2E8F0' }}>ACTION</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredContests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} sx={{ py: 6, textAlign: 'center', borderColor: '#F1F5F9' }}>
                    <Typography sx={{ fontWeight: 800, fontSize: '0.92rem', color: '#0F172A' }}>
                      No contest history found
                    </Typography>
                    <Typography sx={{ fontSize: '0.78rem', color: '#64748B', mt: 0.5 }}>
                      Participate in scheduled weekly or campus contests to record competitive rankings.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredContests.map((c) => {
                  const ratingDelta = c.ratingDelta ?? 0;
                  const isPositive = ratingDelta >= 0;

                  return (
                    <TableRow
                      key={c.id}
                      hover
                      sx={{
                        '&:hover': { bgcolor: '#F8FAFC !important' },
                        '&:last-child td': { borderBottom: 0 },
                      }}
                    >
                      <TableCell sx={{ borderColor: '#F1F5F9', py: 1.4 }}>
                        <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.86rem' }}>
                          {c.contestName}
                        </Typography>
                        <Typography sx={{ fontSize: '0.72rem', color: '#64748B' }}>
                          ID: #{c.id.slice(0, 8)}
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ color: '#64748B', fontSize: '0.82rem', borderColor: '#F1F5F9' }}>
                        {c.contestDate}
                      </TableCell>

                      <TableCell sx={{ borderColor: '#F1F5F9' }}>
                        <Typography sx={{ fontWeight: 800, color: '#0B1F3A', fontSize: '0.86rem' }}>
                          #{c.rank}{' '}
                          <span style={{ color: '#64748B', fontSize: '0.74rem', fontWeight: 500 }}>
                            / {c.totalParticipants?.toLocaleString()}
                          </span>
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ fontSize: '0.82rem', color: '#64748B', borderColor: '#F1F5F9' }}>
                        <strong style={{ color: '#0F172A' }}>{c.score} pts</strong> • {c.penaltyTime}
                      </TableCell>

                      <TableCell sx={{ borderColor: '#F1F5F9' }}>
                        <Chip
                          label={isPositive ? `+${ratingDelta}` : `${ratingDelta}`}
                          size="small"
                          sx={{
                            bgcolor: isPositive ? '#ECFDF5' : '#FEF2F2',
                            color: isPositive ? '#059669' : '#DC2626',
                            border: `1px solid ${isPositive ? '#A7F3D0' : '#FECACA'}`,
                            fontWeight: 800,
                            fontSize: '0.72rem',
                            height: 22,
                          }}
                        />
                      </TableCell>

                      <TableCell sx={{ borderColor: '#F1F5F9' }}>
                        <Typography sx={{ fontWeight: 900, color: '#0F172A', fontSize: '0.88rem' }}>
                          {c.newRating}
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ textAlign: 'right', borderColor: '#F1F5F9' }}>
                        <Link href="/contests" style={{ textDecoration: 'none' }}>
                          <Button
                            variant="text"
                            size="small"
                            endIcon={<FluidArrowForward sx={{ fontSize: 13 }} />}
                            sx={{
                              textTransform: 'none',
                              fontWeight: 800,
                              color: '#0B1F3A',
                              fontSize: '0.74rem',
                              '&:hover': { bgcolor: '#FAF5FF' },
                            }}
                          >
                            Standings
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
}
