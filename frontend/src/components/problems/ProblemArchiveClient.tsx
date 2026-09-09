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
  LinearProgress,
  Tooltip,
  IconButton,
} from '@mui/material';

// Icons
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUnchecked';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import WhatshotRoundedIcon from '@mui/icons-material/WhatshotRounded';
import ShuffleRoundedIcon from '@mui/icons-material/ShuffleRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';

import StudentAppLayout from '@/components/students/layout/StudentAppLayout';
import { MOCK_PROBLEMS } from '@/lib/mock-problems-data';
import { ProblemDifficulty, ProblemEntity } from '@/types/problem';

const DIFFICULTY_CONFIG: Record<ProblemDifficulty, { label: string; color: string; bg: string }> = {
  Easy: { label: 'Easy', color: '#16A34A', bg: 'rgba(22, 163, 74, 0.1)' },
  Medium: { label: 'Medium', color: '#D97706', bg: 'rgba(217, 119, 6, 0.1)' },
  Hard: { label: 'Hard', color: '#DC2626', bg: 'rgba(220, 38, 38, 0.1)' },
};

export default function ProblemArchiveClient() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusTab, setStatusTab] = useState<string>('ALL');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Solved problem tracker (mock student state)
  const [solvedIds] = useState<Set<string>>(new Set(['prob-1', 'prob-8']));
  const [attemptedIds] = useState<Set<string>>(new Set(['prob-2', 'prob-5']));

  // Reset pagination on filter change
  useEffect(() => {
    setPage(0);
  }, [search, difficultyFilter, categoryFilter, statusTab]);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    MOCK_PROBLEMS.forEach((p) => set.add(p.category));
    return Array.from(set);
  }, []);

  // Filtered dataset
  const filteredProblems = useMemo(() => {
    return MOCK_PROBLEMS.filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.code.toLowerCase().includes(search.toLowerCase()) ||
        p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));

      const matchesDifficulty = difficultyFilter === 'ALL' || p.difficulty === difficultyFilter;
      const matchesCategory = categoryFilter === 'ALL' || p.category === categoryFilter;

      let matchesStatus = true;
      if (statusTab === 'SOLVED') matchesStatus = solvedIds.has(p.id);
      if (statusTab === 'ATTEMPTED') matchesStatus = attemptedIds.has(p.id);
      if (statusTab === 'TODO') matchesStatus = !solvedIds.has(p.id) && !attemptedIds.has(p.id);

      return matchesSearch && matchesDifficulty && matchesCategory && matchesStatus;
    });
  }, [search, difficultyFilter, categoryFilter, statusTab, solvedIds, attemptedIds]);

  // Export CSV using Blob to prevent truncation on '#' or special chars
  const handleExportCSV = () => {
    const headers = ['Code', 'Title', 'Category', 'Difficulty', 'AcceptanceRate', 'Submissions', 'Points'];
    const rows = filteredProblems.map((p) => [
      p.code,
      `"${p.title.replace(/"/g, '""')}"`,
      `"${p.category}"`,
      p.difficulty,
      `${p.acceptanceRate}%`,
      p.totalSubmissions,
      p.points,
    ]);

    const csvData = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `problems_archive_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Pick Random Problem
  const handlePickRandom = () => {
    if (filteredProblems.length > 0) {
      const randomProb = filteredProblems[Math.floor(Math.random() * filteredProblems.length)];
      router.push(`/problems/${randomProb.slug}`);
    }
  };

  const totalEasy = MOCK_PROBLEMS.filter((p) => p.difficulty === 'Easy').length;
  const totalMed = MOCK_PROBLEMS.filter((p) => p.difficulty === 'Medium').length;
  const totalHard = MOCK_PROBLEMS.filter((p) => p.difficulty === 'Hard').length;
  const solvedCount = solvedIds.size;

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
                Problem Archive & Solves
              </Typography>
              <Chip
                icon={<AutoAwesomeRoundedIcon sx={{ fontSize: 13, color: '#2563EB !important' }} />}
                label="Standard Judge Sandbox"
                size="small"
                sx={{
                  bgcolor: 'rgba(37, 99, 235, 0.08)',
                  color: '#2563EB',
                  fontWeight: 700,
                  fontSize: '0.72rem',
                }}
              />
            </Box>
            <Typography variant="body2" sx={{ color: '#64748B' }}>
              Solve curated algorithmic problems across Data Structures, Algorithms, and System Design.
            </Typography>
          </Box>

          {/* Quick Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<ShuffleRoundedIcon sx={{ fontSize: 17 }} />}
              onClick={handlePickRandom}
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
              Pick Random
            </Button>

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
        {/* SOLVE PROGRESS STATS BAR */}
        {/* ========================================================================= */}
        <Card
          sx={{
            p: 2.5,
            borderRadius: '16px',
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1.2fr 1fr 1fr 1fr' },
            gap: 3,
            alignItems: 'center',
          }}
        >
          {/* Overall Solves */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
              <Typography sx={{ fontSize: '1.5rem', fontWeight: 900, color: '#0F172A' }}>
                {solvedCount}
              </Typography>
              <Typography sx={{ fontSize: '0.84rem', color: '#64748B', fontWeight: 600 }}>
                / {MOCK_PROBLEMS.length} Solved ({Math.round((solvedCount / MOCK_PROBLEMS.length) * 100)}%)
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={(solvedCount / MOCK_PROBLEMS.length) * 100}
              sx={{
                mt: 1,
                height: 8,
                borderRadius: 4,
                bgcolor: '#F1F5F9',
                '& .MuiLinearProgress-bar': {
                  background: 'linear-gradient(90deg, #3B82F6 0%, #10B981 100%)',
                  borderRadius: 4,
                },
              }}
            />
          </Box>

          {/* Easy Metric */}
          <Box sx={{ borderLeft: { sm: '1px solid #F1F5F9' }, pl: { sm: 2 } }}>
            <Typography sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#16A34A', textTransform: 'uppercase' }}>
              Easy Solves
            </Typography>
            <Typography sx={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A' }}>
              {Array.from(solvedIds).filter((id) => MOCK_PROBLEMS.find((p) => p.id === id)?.difficulty === 'Easy').length}
              <span style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 600 }}> / {totalEasy}</span>
            </Typography>
          </Box>

          {/* Medium Metric */}
          <Box sx={{ borderLeft: { sm: '1px solid #F1F5F9' }, pl: { sm: 2 } }}>
            <Typography sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#D97706', textTransform: 'uppercase' }}>
              Medium Solves
            </Typography>
            <Typography sx={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A' }}>
              {Array.from(solvedIds).filter((id) => MOCK_PROBLEMS.find((p) => p.id === id)?.difficulty === 'Medium').length}
              <span style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 600 }}> / {totalMed}</span>
            </Typography>
          </Box>

          {/* Hard Metric */}
          <Box sx={{ borderLeft: { sm: '1px solid #F1F5F9' }, pl: { sm: 2 } }}>
            <Typography sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#DC2626', textTransform: 'uppercase' }}>
              Hard Solves
            </Typography>
            <Typography sx={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A' }}>
              {Array.from(solvedIds).filter((id) => MOCK_PROBLEMS.find((p) => p.id === id)?.difficulty === 'Hard').length}
              <span style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 600 }}> / {totalHard}</span>
            </Typography>
          </Box>
        </Card>

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
          {/* Controls Bar: Status Tabs + Search + Dropdown Filters */}
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
              <Tab label="All Problems" value="ALL" />
              <Tab label={`Solved (${solvedIds.size})`} value="SOLVED" />
              <Tab label={`Attempted (${attemptedIds.size})`} value="ATTEMPTED" />
              <Tab label="Todo" value="TODO" />
            </Tabs>

            {/* Filter Bar */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
              {/* Search Field */}
              <TextField
                size="small"
                placeholder="Search problem title, code, tag..."
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

              {/* Difficulty Dropdown */}
              <FormControl size="small" sx={{ minWidth: 130 }}>
                <Select
                  value={difficultyFilter}
                  onChange={(e) => setDifficultyFilter(e.target.value)}
                  sx={{
                    borderRadius: '8px',
                    bgcolor: '#F8FAFC',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    color: '#334155',
                  }}
                >
                  <MenuItem value="ALL" sx={{ fontSize: '0.84rem', fontWeight: 600 }}>All Difficulties</MenuItem>
                  <MenuItem value="Easy" sx={{ fontSize: '0.84rem', color: '#16A34A', fontWeight: 700 }}>Easy</MenuItem>
                  <MenuItem value="Medium" sx={{ fontSize: '0.84rem', color: '#D97706', fontWeight: 700 }}>Medium</MenuItem>
                  <MenuItem value="Hard" sx={{ fontSize: '0.84rem', color: '#DC2626', fontWeight: 700 }}>Hard</MenuItem>
                </Select>
              </FormControl>

              {/* Category Dropdown */}
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <Select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  sx={{
                    borderRadius: '8px',
                    bgcolor: '#F8FAFC',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    color: '#334155',
                  }}
                >
                  <MenuItem value="ALL" sx={{ fontSize: '0.84rem', fontWeight: 600 }}>All Categories</MenuItem>
                  {categories.map((c) => (
                    <MenuItem key={c} value={c} sx={{ fontSize: '0.84rem' }}>{c}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>

          {/* Table Element */}
          <TableContainer>
            <Table sx={{ minWidth: 800 }}>
              <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                <TableRow>
                  <TableCell sx={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', py: 1.5, width: 60 }}>
                    Status
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', py: 1.5, width: 100 }}>
                    Code
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', py: 1.5 }}>
                    Problem Title
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', py: 1.5 }}>
                    Category
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', py: 1.5, width: 120 }}>
                    Difficulty
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', py: 1.5, width: 130 }}>
                    Acceptance
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', py: 1.5, width: 100 }}>
                    Points
                  </TableCell>
                  <TableCell align="right" sx={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', py: 1.5, width: 120 }}>
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredProblems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 6, color: '#94A3B8' }}>
                      <Typography sx={{ fontWeight: 600, fontSize: '0.92rem' }}>
                        No problems match the selected filters.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProblems
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((problem) => {
                      const isSolved = solvedIds.has(problem.id);
                      const isAttempted = attemptedIds.has(problem.id);
                      const diffStyle = DIFFICULTY_CONFIG[problem.difficulty];

                      return (
                        <TableRow
                          key={problem.id}
                          hover
                          sx={{
                            cursor: 'pointer',
                            '&:hover': { bgcolor: 'rgba(248, 250, 252, 0.8)' },
                            transition: 'background-color 0.15s ease',
                          }}
                          onClick={() => router.push(`/problems/${problem.slug}`)}
                        >
                          {/* Status Icon */}
                          <TableCell sx={{ py: 1.6 }}>
                            {isSolved ? (
                              <Tooltip title="Solved" arrow>
                                <CheckCircleRoundedIcon sx={{ fontSize: 19, color: '#16A34A' }} />
                              </Tooltip>
                            ) : isAttempted ? (
                              <Tooltip title="Attempted" arrow>
                                <RadioButtonUncheckedRoundedIcon sx={{ fontSize: 19, color: '#D97706' }} />
                              </Tooltip>
                            ) : (
                              <RadioButtonUncheckedRoundedIcon sx={{ fontSize: 19, color: '#CBD5E1' }} />
                            )}
                          </TableCell>

                          {/* Code */}
                          <TableCell sx={{ py: 1.6, fontFamily: 'monospace', fontWeight: 700, color: '#64748B', fontSize: '0.82rem' }}>
                            {problem.code}
                          </TableCell>

                          {/* Title & Tags */}
                          <TableCell sx={{ py: 1.6 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                              <Typography
                                sx={{
                                  fontWeight: 700,
                                  fontSize: '0.9rem',
                                  color: '#0F172A',
                                  '&:hover': { color: '#2563EB' },
                                }}
                              >
                                {problem.title}
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                {problem.tags.slice(0, 3).map((tag) => (
                                  <Chip
                                    key={tag}
                                    label={tag}
                                    size="small"
                                    sx={{
                                      fontSize: '0.66rem',
                                      fontWeight: 600,
                                      height: 18,
                                      bgcolor: '#F1F5F9',
                                      color: '#475569',
                                    }}
                                  />
                                ))}
                              </Box>
                            </Box>
                          </TableCell>

                          {/* Category */}
                          <TableCell sx={{ py: 1.6, fontSize: '0.82rem', color: '#475569', fontWeight: 600 }}>
                            {problem.category}
                          </TableCell>

                          {/* Difficulty */}
                          <TableCell sx={{ py: 1.6 }}>
                            <Chip
                              label={diffStyle.label}
                              size="small"
                              sx={{
                                bgcolor: diffStyle.bg,
                                color: diffStyle.color,
                                fontWeight: 800,
                                fontSize: '0.72rem',
                                height: 22,
                              }}
                            />
                          </TableCell>

                          {/* Acceptance Rate */}
                          <TableCell sx={{ py: 1.6 }}>
                            <Typography sx={{ fontSize: '0.84rem', fontWeight: 700, color: '#334155' }}>
                              {problem.acceptanceRate}%
                            </Typography>
                            <Typography sx={{ fontSize: '0.7rem', color: '#94A3B8' }}>
                              {(problem.totalSubmissions / 1000).toFixed(0)}k subs
                            </Typography>
                          </TableCell>

                          {/* Points */}
                          <TableCell sx={{ py: 1.6, fontWeight: 700, color: '#2563EB', fontSize: '0.84rem' }}>
                            {problem.points} pts
                          </TableCell>

                          {/* Action Button */}
                          <TableCell align="right" sx={{ py: 1.6 }} onClick={(e) => e.stopPropagation()}>
                            <Link href={`/problems/${problem.slug}`} style={{ textDecoration: 'none' }}>
                              <Button
                                size="small"
                                variant="contained"
                                startIcon={<PlayArrowRoundedIcon sx={{ fontSize: 16 }} />}
                                sx={{
                                  borderRadius: '6px',
                                  textTransform: 'none',
                                  fontWeight: 700,
                                  fontSize: '0.78rem',
                                  px: 1.8,
                                  py: 0.5,
                                  bgcolor: isSolved ? '#0F172A' : '#2563EB',
                                  '&:hover': { bgcolor: isSolved ? '#1E293B' : '#1D4ED8' },
                                }}
                              >
                                {isSolved ? 'Review' : 'Solve'}
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

          {/* Pagination */}
          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={filteredProblems.length}
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
