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
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';

import StudentAppLayout from '@/components/students/layout/StudentAppLayout';
import { ProblemDifficulty, ProblemEntity } from '@/types/problem';
import { apiService } from '@/lib/api-service';
import { getRatingTier, getProblemRating } from '@/utils/codechefRating';

const DIFFICULTY_CONFIG: Record<ProblemDifficulty, { label: string; color: string; bg: string }> = {
  Easy: { label: 'Easy', color: '#16A34A', bg: 'rgba(22, 163, 74, 0.1)' },
  Medium: { label: 'Medium', color: '#D97706', bg: 'rgba(217, 119, 6, 0.1)' },
  Hard: { label: 'Hard', color: '#DC2626', bg: 'rgba(220, 38, 38, 0.1)' },
};

function sanitizeCsvField(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '""';
  if (typeof value === 'number') return String(value);

  let str = String(value);
  if (/^[=+\-@]/.test(str)) {
    str = `'${str}`;
  }
  return `"${str.replace(/"/g, '""')}"`;
}

export default function ProblemArchiveClient() {
  const router = useRouter();
  const [problems, setProblems] = useState<ProblemEntity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusTab, setStatusTab] = useState<string>('ALL');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Solved and Attempted problem trackers from live submissions API
  const [solvedIds, setSolvedIds] = useState<Set<string>>(new Set());
  const [attemptedIds, setAttemptedIds] = useState<Set<string>>(new Set());
  const [potdData, setPotdData] = useState<any>(null);
  const [timeParts, setTimeParts] = useState({ hours: '08', minutes: '45', seconds: '20' });

  // Live midnight reset countdown timer
  useEffect(() => {
    function updateCountdown() {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();
      if (diff <= 0) {
        setTimeParts({ hours: '00', minutes: '00', seconds: '00' });
        return;
      }
      const hours = String(Math.floor(diff / (1000 * 60 * 60))).padStart(2, '0');
      const mins = String(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
      const secs = String(Math.floor((diff % (1000 * 60)) / 1000)).padStart(2, '0');
      setTimeParts({ hours, minutes: mins, seconds: secs });
    }
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch live problems, POTD and user submissions from backend API
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setIsLoading(true);
      try {
        const [res, subsRes, potd] = await Promise.all([
          apiService.getProblems({ limit: 100 }),
          apiService.getSubmissions({ limit: 100 }).catch(() => null),
          apiService.getTodayPotd().catch(() => null),
        ]);

        if (potd && isMounted) {
          setPotdData(potd);
        }

        if (subsRes?.items && isMounted) {
          const solved = new Set<string>();
          const attempted = new Set<string>();
          subsRes.items.forEach((sub: any) => {
            const pId = sub.problemId || sub.problem?.id;
            if (pId) {
              const v = String(sub.verdict || '').toUpperCase();
              if (v === 'ACCEPTED' || v === 'AC') {
                solved.add(pId);
              } else {
                attempted.add(pId);
              }
            }
          });
          // Unsolved attempted problems only
          solved.forEach((id) => attempted.delete(id));
          setSolvedIds(solved);
          setAttemptedIds(attempted);
        }

        if (isMounted) {
          if (res?.items && res.items.length > 0) {
            const mapped: ProblemEntity[] = res.items.map((item: any, idx: number) => {
              const rawDiff = String(item.difficulty || '').toUpperCase();
              const diff: ProblemDifficulty = rawDiff === 'EASY' ? 'Easy' : rawDiff === 'HARD' ? 'Hard' : 'Medium';
              const subCount = item._count?.submissions || item.submissionsCount || 0;
              const accepted = item.acceptedCount || 0;
              const accRate = subCount > 0 ? Math.round((accepted / subCount) * 100) : 54;
              const titleLower = String(item.title || '').toLowerCase();
              let category = item.category;
              let tags = Array.isArray(item.tags) && item.tags.length > 0 ? [...item.tags] : [];
              let inferredTags: string[] = [];

              if (!category) {
                if (titleLower.includes('tree') || titleLower.includes('bst')) {
                  category = 'Trees & Binary Search Trees';
                  inferredTags = ['Trees', 'Binary Tree'];
                } else if (titleLower.includes('median') || titleLower.includes('divide')) {
                  category = 'Binary Search & Divide and Conquer';
                  inferredTags = ['Binary Search', 'Divide & Conquer'];
                } else if (titleLower.includes('cache') || titleLower.includes('lru') || titleLower.includes('design')) {
                  category = 'System Design & Data Structures';
                  inferredTags = ['Hash Map', 'Doubly Linked List', 'Design'];
                } else if (titleLower.includes('substring') || titleLower.includes('parentheses') || titleLower.includes('string') || titleLower.includes('trie')) {
                  category = 'Strings & Tries';
                  inferredTags = ['Strings', 'Stack', 'Parsing'];
                } else if (titleLower.includes('coin') || titleLower.includes('knapsack') || titleLower.includes('subsequence') || titleLower.includes('dynamic programming')) {
                  category = 'Dynamic Programming';
                  inferredTags = ['Dynamic Programming', 'Optimization'];
                } else if (titleLower.includes('graph') || titleLower.includes('bfs') || titleLower.includes('dfs')) {
                  category = 'Graph Theory & BFS/DFS';
                  inferredTags = ['Graph Theory', 'BFS/DFS'];
                } else if (titleLower.includes('even') || titleLower.includes('odd') || titleLower.includes('math') || titleLower.includes('prime')) {
                  category = 'Math & Number Theory';
                  inferredTags = ['Math', 'Number Theory'];
                } else if (titleLower.includes('binary search')) {
                  category = 'Binary Search & Divide and Conquer';
                  inferredTags = ['Binary Search', 'Divide & Conquer'];
                } else if (titleLower.includes('two sum') || titleLower.includes('pointer') || titleLower.includes('water') || titleLower.includes('array') || titleLower.includes('sort')) {
                  category = 'Arrays & Two Pointers';
                  inferredTags = ['Arrays', 'Two Pointers', 'Prefix Sum'];
                } else if (tags.length > 0) {
                  const tagsLower = tags.map((t: string) => String(t).toLowerCase());
                  if (tagsLower.some((t: string) => t.includes('tree') || t.includes('bst'))) {
                    category = 'Trees & Binary Search Trees';
                  } else if (tagsLower.some((t: string) => t.includes('graph') || t.includes('bfs') || t.includes('dfs'))) {
                    category = 'Graph Theory & BFS/DFS';
                  } else if (tagsLower.some((t: string) => t.includes('dynamic') || t.includes('dp'))) {
                    category = 'Dynamic Programming';
                  } else if (tagsLower.some((t: string) => t.includes('median') || t.includes('divide') || t.includes('binary search'))) {
                    category = 'Binary Search & Divide and Conquer';
                  } else if (tagsLower.some((t: string) => t.includes('string') || t.includes('trie') || t.includes('stack') || t.includes('parsing'))) {
                    category = 'Strings & Tries';
                  } else if (tagsLower.some((t: string) => t.includes('math') || t.includes('number') || t.includes('prime'))) {
                    category = 'Math & Number Theory';
                  } else if (tagsLower.some((t: string) => t.includes('design') || t.includes('cache') || t.includes('hash map') || t.includes('linked list'))) {
                    category = 'System Design & Data Structures';
                  } else if (tagsLower.some((t: string) => t.includes('array') || t.includes('two pointer') || t.includes('prefix sum'))) {
                    category = 'Arrays & Two Pointers';
                  } else {
                    category = 'Uncategorized';
                  }
                } else {
                  category = 'Uncategorized';
                }
              }

              if (tags.length === 0) {
                tags = inferredTags.length > 0 ? inferredTags : ['Algorithms', 'Data Structures'];
              }

              return {
                id: item.id,
                code: item.code || `PROB-${String(idx + 1).padStart(3, '0')}`,
                slug: item.slug || item.id,
                title: item.title,
                category,
                difficulty: diff,
                acceptanceRate: accRate,
                totalSubmissions: subCount,
                acceptedSubmissions: accepted,
                testCasesCount: item._count?.testCases || 10,
                authorName: item.authorName || 'Platform Team',
                tags,
                status: item.status === 'PUBLISHED' ? 'Published' : 'Draft',
                points: item.points || (diff === 'Easy' ? 100 : diff === 'Medium' ? 200 : 350),
                timeLimitMs: item.timeLimit || 2000,
                memoryLimitMb: item.memoryLimit || 256,
                likes: 120 + idx * 7,
                dislikes: 4 + (idx % 3),
                premium: false,
                companies: ['Google', 'Meta', 'Amazon'],
                statementMarkdown: item.statement || '',
                sampleTestCases: [],
              };
            });
            setProblems(mapped);
          } else {
            setProblems([]);
          }
        }
      } catch (err) {
        console.warn('Live problems query failed:', err);
        if (isMounted) setProblems([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Reset pagination on filter change
  useEffect(() => {
    setPage(0);
  }, [search, difficultyFilter, categoryFilter, statusTab]);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    problems.forEach((p) => set.add(p.category));
    return Array.from(set);
  }, [problems]);

  // Filtered dataset
  const filteredProblems = useMemo(() => {
    return problems.filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.code.toLowerCase().includes(search.toLowerCase()) ||
        p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));

      const matchesDifficulty = difficultyFilter === 'ALL' || p.difficulty === difficultyFilter;
      const matchesCategory = categoryFilter === 'ALL' || p.category === categoryFilter;

      let matchesStatus = true;
      if (statusTab === 'SOLVED') matchesStatus = solvedIds.has(p.id);
      if (statusTab === 'ATTEMPTED') matchesStatus = attemptedIds.has(p.id) && !solvedIds.has(p.id);
      if (statusTab === 'TODO') matchesStatus = !solvedIds.has(p.id) && !attemptedIds.has(p.id);

      return matchesSearch && matchesDifficulty && matchesCategory && matchesStatus;
    });
  }, [problems, search, difficultyFilter, categoryFilter, statusTab, solvedIds, attemptedIds]);

  // Export CSV using Blob to prevent truncation on '#' or special chars
  const handleExportCSV = () => {
    const headers = ['Code', 'Title', 'Category', 'Difficulty', 'AcceptanceRate', 'Submissions', 'Points'];
    const rows = filteredProblems.map((p) => [
      sanitizeCsvField(p.code),
      sanitizeCsvField(p.title),
      sanitizeCsvField(p.category),
      sanitizeCsvField(p.difficulty),
      sanitizeCsvField(`${p.acceptanceRate}%`),
      sanitizeCsvField(p.totalSubmissions),
      sanitizeCsvField(p.points),
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

  const solvedInProblems = useMemo(() => {
    return problems.filter((p) => solvedIds.has(p.id));
  }, [problems, solvedIds]);

  const attemptedInProblems = useMemo(() => {
    return problems.filter((p) => attemptedIds.has(p.id) && !solvedIds.has(p.id));
  }, [problems, attemptedIds, solvedIds]);

  const solvedCount = solvedInProblems.length;
  const attemptedCount = attemptedInProblems.length;

  const totalEasy = useMemo(() => problems.filter((p) => p.difficulty === 'Easy').length, [problems]);
  const totalMed = useMemo(() => problems.filter((p) => p.difficulty === 'Medium').length, [problems]);
  const totalHard = useMemo(() => problems.filter((p) => p.difficulty === 'Hard').length, [problems]);

  const solvedEasy = useMemo(() => solvedInProblems.filter((p) => p.difficulty === 'Easy').length, [solvedInProblems]);
  const solvedMed = useMemo(() => solvedInProblems.filter((p) => p.difficulty === 'Medium').length, [solvedInProblems]);
  const solvedHard = useMemo(() => solvedInProblems.filter((p) => p.difficulty === 'Hard').length, [solvedInProblems]);

  const progressPercent = problems.length > 0 ? Math.min(100, Math.max(0, Math.round((solvedCount / problems.length) * 100))) : 0;

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
        {/* PREMIUM PROBLEM OF THE DAY (POTD) HERO BANNER WITH DIGITAL HUD TIMER */}
        {/* ========================================================================= */}
        <Card
          elevation={0}
          sx={{
            borderRadius: '24px',
            background: 'linear-gradient(135deg, #070B14 0%, #0D1527 50%, #0F1E3D 100%)',
            border: '1px solid rgba(56, 189, 248, 0.22)',
            boxShadow: '0 24px 60px -15px rgba(15, 23, 42, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
            position: 'relative',
            overflow: 'hidden',
            minHeight: { xs: 230, md: 240 },
            py: { xs: 4, sm: 4.5, md: 5 },
            px: { xs: 3, sm: 4, md: 4.5 },
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {/* 1. Visible Developer Tech Grid Background */}
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `
                linear-gradient(to right, rgba(56, 189, 248, 0.08) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(56, 189, 248, 0.08) 1px, transparent 1px)
              `,
              backgroundSize: '28px 28px',
              maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 30%, rgba(0,0,0,0.3) 85%)',
              WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 30%, rgba(0,0,0,0.3) 85%)',
              pointerEvents: 'none',
            }}
          />

          {/* 2. Genuine Geometric SVG Shapes in Background (Isometric Hexagons, Circuit Lines, Angled Brackets) */}
          <svg
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              zIndex: 1,
            }}
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Hexagon & Concentric Polygonal Shapes (Left side behind flame) */}
            <polygon
              points="140,20 185,45 185,95 140,120 95,95 95,45"
              fill="none"
              stroke="rgba(245, 158, 11, 0.15)"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
            <polygon
              points="140,5 200,38 200,102 140,135 80,102 80,38"
              fill="none"
              stroke="rgba(245, 158, 11, 0.08)"
              strokeWidth="1"
            />

            {/* Geometric Circuit Traces (Clean angular lines without dots) */}
            <path
              d="M 220,70 L 320,70 L 360,110 L 520,110"
              fill="none"
              stroke="rgba(56, 189, 248, 0.16)"
              strokeWidth="1.5"
              strokeDasharray="6 6"
            />
            <path
              d="M 600,30 L 680,30 L 720,70 L 850,70"
              fill="none"
              stroke="rgba(56, 189, 248, 0.12)"
              strokeWidth="1.5"
            />

            {/* Geometric Octagonal Tech Wireframes on Right side */}
            <polygon
              points="820,120 860,80 910,80 950,120 950,170 910,210 860,210 820,170"
              fill="none"
              stroke="rgba(56, 189, 248, 0.12)"
              strokeWidth="1.5"
              strokeDasharray="8 6"
            />
            <polygon
              points="790,120 840,70 930,70 980,120 980,170 930,220 840,220 790,170"
              fill="none"
              stroke="rgba(56, 189, 248, 0.06)"
              strokeWidth="1"
            />

            {/* Tech Crosshair Markers */}
            <path d="M 40,30 L 50,30 M 45,25 L 45,35" stroke="rgba(56, 189, 248, 0.25)" strokeWidth="1.5" />
            <path d="M 580,180 L 590,180 M 585,175 L 585,185" stroke="rgba(245, 158, 11, 0.3)" strokeWidth="1.5" />
          </svg>

          {/* 3. Multi-layer Ambient Glows */}
          <Box
            sx={{
              position: 'absolute',
              top: '-25%',
              left: '-8%',
              width: '450px',
              height: '450px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(245, 158, 11, 0.2) 0%, rgba(239, 68, 68, 0.08) 50%, transparent 70%)',
              filter: 'blur(55px)',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: '-30%',
              right: '-5%',
              width: '500px',
              height: '500px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(56, 189, 248, 0.22) 0%, rgba(37, 99, 235, 0.14) 50%, transparent 70%)',
              filter: 'blur(60px)',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />

          {/* 4. Top-Right Slanted Geometric Tag */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: 160,
              height: 36,
              background: 'linear-gradient(90deg, transparent, rgba(56, 189, 248, 0.18))',
              clipPath: 'polygon(18% 0, 100% 0, 100% 100%, 0% 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              pr: 2.5,
              borderBottom: '1px solid rgba(56, 189, 248, 0.35)',
              zIndex: 3,
              pointerEvents: 'none',
            }}
          >
            <Typography sx={{ color: '#38BDF8', fontSize: '0.68rem', fontWeight: 900, letterSpacing: '0.12em' }}>
              POTD // SPRINT
            </Typography>
          </Box>

          {/* 5. Main Content Layout */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', lg: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', lg: 'center' },
              gap: 4,
              position: 'relative',
              zIndex: 2,
              width: '100%',
            }}
          >
            {/* Left Section: 3D Flame Shield + Problem Details */}
            <Box sx={{ display: 'flex', gap: { xs: 2.5, sm: 3 }, alignItems: 'center', maxWidth: { xs: '100%', lg: '62%' } }}>
              {/* Geometric Flame Shield Icon Box */}
              <Box
                sx={{
                  width: { xs: 60, sm: 72 },
                  height: { xs: 60, sm: 72 },
                  flexShrink: 0,
                  borderRadius: '18px',
                  background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.3) 0%, rgba(239, 68, 68, 0.22) 100%)',
                  border: '1px solid rgba(245, 158, 11, 0.45)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 10px 28px rgba(245, 158, 11, 0.3)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    background: 'radial-gradient(circle, rgba(254, 240, 138, 0.35) 0%, transparent 70%)',
                  }}
                />
                <WhatshotRoundedIcon
                  sx={{
                    fontSize: { xs: 32, sm: 38 },
                    color: '#F59E0B',
                    filter: 'drop-shadow(0 0 12px rgba(245, 158, 11, 0.9))',
                  }}
                />
              </Box>

              {/* Title, Badges & Problem Summary */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                {/* Top Badges Row */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 1.2, flexWrap: 'wrap' }}>
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.6,
                      bgcolor: 'rgba(245, 158, 11, 0.16)',
                      border: '1px solid rgba(245, 158, 11, 0.4)',
                      px: 1.3,
                      py: 0.4,
                      borderRadius: '8px',
                    }}
                  >
                    <Typography sx={{ color: '#FBBF24', fontWeight: 900, fontSize: '0.74rem', letterSpacing: '0.04em' }}>
                      DAILY ARENA
                    </Typography>
                  </Box>

                  {potdData?.problem && (
                    potdData?.userStreak?.currentStreak ? (
                      <Box
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 0.5,
                          bgcolor: 'rgba(239, 68, 68, 0.15)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          px: 1.3,
                          py: 0.4,
                          borderRadius: '8px',
                        }}
                      >
                        <Typography sx={{ color: '#FCA5A5', fontWeight: 800, fontSize: '0.74rem' }}>
                          🔥 {potdData.userStreak.currentStreak}-Day Streak ({potdData.userStreak.streakMultiplier}x XP)
                        </Typography>
                      </Box>
                    ) : (
                      <Box
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 0.5,
                          bgcolor: 'rgba(37, 99, 235, 0.15)',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          px: 1.3,
                          py: 0.4,
                          borderRadius: '8px',
                        }}
                      >
                        <Typography sx={{ color: '#93C5FD', fontWeight: 800, fontSize: '0.74rem' }}>
                          ⚡ 1.5x Multiplier Active
                        </Typography>
                      </Box>
                    )
                  )}

                  {potdData?.problem && potdData?.isSolved && (
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.5,
                        bgcolor: 'rgba(16, 185, 129, 0.15)',
                        border: '1px solid rgba(16, 185, 129, 0.35)',
                        px: 1.3,
                        py: 0.4,
                        borderRadius: '8px',
                      }}
                    >
                      <CheckCircleRoundedIcon sx={{ fontSize: 14, color: '#34D399' }} />
                      <Typography sx={{ color: '#34D399', fontWeight: 800, fontSize: '0.74rem' }}>
                        Solved Today
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Problem Title */}
                <Typography
                  variant="h4"
                  sx={{
                    color: '#FFFFFF',
                    fontWeight: 900,
                    fontSize: { xs: '1.35rem', sm: '1.65rem' },
                    letterSpacing: '-0.025em',
                    lineHeight: 1.25,
                    mb: 0.8,
                  }}
                >
                  {potdData?.problem?.title || 'No challenge scheduled today'}
                </Typography>

                {/* Problem Statement Snippet */}
                {potdData?.problem && (
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#94A3B8',
                      fontSize: '0.88rem',
                      lineHeight: 1.55,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {(potdData.problem.statement || potdData.problem.statementMarkdown)?.slice(0, 150)}
                    ...
                  </Typography>
                )}
              </Box>
            </Box>

            {/* Right Section: Digital Segmented Countdown HUD & Rewards CTA */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row', lg: 'row' },
                alignItems: { xs: 'stretch', sm: 'center' },
                gap: 3,
                bgcolor: 'rgba(15, 23, 42, 0.75)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(16px)',
                py: { xs: 2.5, sm: 2.8 },
                px: { xs: 2.5, sm: 3 },
                borderRadius: '20px',
                boxShadow: '0 10px 35px rgba(0, 0, 0, 0.3)',
                width: { xs: '100%', lg: 'auto' },
                justifyContent: 'space-between',
              }}
            >
              {/* Digital HUD Countdown Clock */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <AccessTimeRoundedIcon sx={{ fontSize: 14, color: '#38BDF8' }} />
                  <Typography sx={{ color: '#94A3B8', fontSize: '0.74rem', fontWeight: 800, letterSpacing: '0.06em' }}>
                    ENDS IN
                  </Typography>
                </Box>

                {/* Digital Segmented Timer Digits */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7 }}>
                  {/* Hours Box */}
                  <Box
                    sx={{
                      bgcolor: '#0B1120',
                      border: '1px solid rgba(56, 189, 248, 0.3)',
                      borderRadius: '10px',
                      px: 1.2,
                      py: 0.6,
                      textAlign: 'center',
                      minWidth: 42,
                    }}
                  >
                    <Typography sx={{ color: '#38BDF8', fontWeight: 900, fontSize: '1.12rem', fontFamily: 'monospace' }}>
                      {timeParts.hours}
                    </Typography>
                    <Typography sx={{ color: '#64748B', fontSize: '0.6rem', fontWeight: 800, mt: -0.3 }}>
                      HRS
                    </Typography>
                  </Box>

                  <Typography sx={{ color: '#38BDF8', fontWeight: 900, fontSize: '1.2rem' }}>
                    :
                  </Typography>

                  {/* Minutes Box */}
                  <Box
                    sx={{
                      bgcolor: '#0B1120',
                      border: '1px solid rgba(56, 189, 248, 0.3)',
                      borderRadius: '10px',
                      px: 1.2,
                      py: 0.6,
                      textAlign: 'center',
                      minWidth: 42,
                    }}
                  >
                    <Typography sx={{ color: '#38BDF8', fontWeight: 900, fontSize: '1.12rem', fontFamily: 'monospace' }}>
                      {timeParts.minutes}
                    </Typography>
                    <Typography sx={{ color: '#64748B', fontSize: '0.6rem', fontWeight: 800, mt: -0.3 }}>
                      MIN
                    </Typography>
                  </Box>

                  <Typography sx={{ color: '#38BDF8', fontWeight: 900, fontSize: '1.2rem' }}>
                    :
                  </Typography>

                  {/* Seconds Box */}
                  <Box
                    sx={{
                      bgcolor: '#0B1120',
                      border: '1px solid rgba(56, 189, 248, 0.3)',
                      borderRadius: '10px',
                      px: 1.2,
                      py: 0.6,
                      textAlign: 'center',
                      minWidth: 42,
                    }}
                  >
                    <Typography sx={{ color: '#38BDF8', fontWeight: 900, fontSize: '1.12rem', fontFamily: 'monospace' }}>
                      {timeParts.seconds}
                    </Typography>
                    <Typography sx={{ color: '#64748B', fontSize: '0.6rem', fontWeight: 800, mt: -0.3 }}>
                      SEC
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Vertical Divider */}
              <Box sx={{ width: 1, height: 56, bgcolor: 'rgba(255, 255, 255, 0.12)', display: { xs: 'none', sm: 'block' } }} />

              {/* Reward Points & CTA */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.4 }}>
                {potdData?.problem && (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <BoltRoundedIcon sx={{ fontSize: 20, color: '#FBBF24' }} />
                      <Typography sx={{ color: '#FBBF24', fontWeight: 900, fontSize: '0.98rem' }}>
                        +{potdData?.bonusPoints || 50} Pts
                      </Typography>
                    </Box>
                    <Typography sx={{ color: '#94A3B8', fontSize: '0.76rem', fontWeight: 700 }}>
                      {getRatingTier(getProblemRating(potdData.problem)).division}
                    </Typography>
                  </Box>
                )}

                <Button
                  variant="contained"
                  disabled={!potdData?.problem}
                  startIcon={<PlayArrowRoundedIcon sx={{ fontSize: 18 }} />}
                  onClick={() => {
                    const targetSlug = potdData?.problem?.slug;
                    if (targetSlug) {
                      router.push(`/problems/${targetSlug}`);
                    }
                  }}
                  sx={{
                    background: !potdData?.problem
                      ? '#334155'
                      : potdData?.isSolved
                      ? 'linear-gradient(135deg, #059669 0%, #10B981 100%)'
                      : 'linear-gradient(135deg, #0284C7 0%, #2563EB 100%)',
                    color: '#FFFFFF',
                    fontWeight: 800,
                    fontSize: '0.88rem',
                    textTransform: 'none',
                    borderRadius: '12px',
                    px: 3,
                    py: 1.15,
                    boxShadow: !potdData?.problem
                      ? 'none'
                      : potdData?.isSolved
                      ? '0 4px 18px rgba(16, 185, 129, 0.4)'
                      : '0 4px 20px rgba(37, 99, 235, 0.45)',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.22s ease',
                    '&:hover': {
                      transform: !potdData?.problem ? 'none' : 'translateY(-2px)',
                      boxShadow: !potdData?.problem
                        ? 'none'
                        : potdData?.isSolved
                        ? '0 8px 26px rgba(16, 185, 129, 0.55)'
                        : '0 8px 28px rgba(37, 99, 235, 0.65)',
                    },
                    '&.Mui-disabled': {
                      color: '#94A3B8',
                      bgcolor: '#1E293B',
                    },
                  }}
                >
                  {!potdData?.problem
                    ? 'No Challenge Active'
                    : potdData?.isSolved
                    ? 'Review Solution'
                    : 'Solve Challenge ⚡'}
                </Button>
              </Box>
            </Box>
          </Box>
        </Card>

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
                / {problems.length} Solved ({progressPercent}%)
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progressPercent}
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
              {solvedEasy}
              <span style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 600 }}> / {totalEasy}</span>
            </Typography>
          </Box>

          {/* Medium Metric */}
          <Box sx={{ borderLeft: { sm: '1px solid #F1F5F9' }, pl: { sm: 2 } }}>
            <Typography sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#D97706', textTransform: 'uppercase' }}>
              Medium Solves
            </Typography>
            <Typography sx={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A' }}>
              {solvedMed}
              <span style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 600 }}> / {totalMed}</span>
            </Typography>
          </Box>

          {/* Hard Metric */}
          <Box sx={{ borderLeft: { sm: '1px solid #F1F5F9' }, pl: { sm: 2 } }}>
            <Typography sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#DC2626', textTransform: 'uppercase' }}>
              Hard Solves
            </Typography>
            <Typography sx={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A' }}>
              {solvedHard}
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
              <Tab label={`Solved (${solvedCount})`} value="SOLVED" />
              <Tab label={`Attempted (${attemptedCount})`} value="ATTEMPTED" />
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
                    'aria-label': 'Search problem title, code, or tag',
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchRoundedIcon sx={{ fontSize: 19, color: '#94A3B8' }} />
                      </InputAdornment>
                    ),
                  },
                  htmlInput: {
                    'aria-label': 'Search problem title, code, or tag',
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
                  aria-label="Filter by difficulty"
                  value={difficultyFilter}
                  onChange={(e) => setDifficultyFilter(e.target.value)}
                  inputProps={{ 'aria-label': 'Filter by difficulty' }}
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
                  aria-label="Filter by category"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  inputProps={{ 'aria-label': 'Filter by category' }}
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

          {/* Loading Indicator */}
          {isLoading && (
            <LinearProgress
              aria-label="Loading..."
              sx={{
                height: 3,
                bgcolor: 'rgba(37, 99, 235, 0.08)',
                '& .MuiLinearProgress-bar': {
                  bgcolor: '#2563EB',
                },
              }}
            />
          )}

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

                          {/* Code & Contest Tag */}
                          <TableCell sx={{ py: 1.6 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                              <Typography sx={{ fontFamily: 'monospace', fontWeight: 800, color: '#0F172A', fontSize: '0.82rem' }}>
                                {problem.code}
                              </Typography>
                              {problem.contestCode && (
                                <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#2563EB', fontFamily: 'monospace' }}>
                                  {problem.contestCode}
                                </Typography>
                              )}
                            </Box>
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

                          {/* Difficulty & CodeChef Rating */}
                          <TableCell sx={{ py: 1.6 }}>
                            {(() => {
                              const ratingVal = getProblemRating(problem);
                              const tier = getRatingTier(ratingVal);
                              return (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                  <Chip
                                    label={diffStyle.label}
                                    size="small"
                                    sx={{
                                      bgcolor: diffStyle.bg,
                                      color: diffStyle.color,
                                      fontWeight: 800,
                                      fontSize: '0.7rem',
                                      height: 22,
                                    }}
                                  />
                                  <Tooltip title={`${tier.tierName} (${ratingVal} Difficulty Rating)`} arrow>
                                    <Box
                                      sx={{
                                        px: 0.75,
                                        py: '2px',
                                        borderRadius: '6px',
                                        bgcolor: tier.bgColor,
                                        border: `1px solid ${tier.borderColor}`,
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '3px',
                                      }}
                                    >
                                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 900, color: tier.color, lineHeight: 1 }}>
                                        ★
                                      </Typography>
                                      <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: tier.textColor }}>
                                        {ratingVal}
                                      </Typography>
                                    </Box>
                                  </Tooltip>
                                </Box>
                              );
                            })()}
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
