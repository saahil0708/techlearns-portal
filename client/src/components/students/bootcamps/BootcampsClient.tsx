'use client';

import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  Chip,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  TablePagination,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  Tabs,
  Tab,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';

// Icons
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import VideoCameraFrontRoundedIcon from '@mui/icons-material/VideoCameraFrontRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import ViewListRoundedIcon from '@mui/icons-material/ViewListRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';

import BootcampGridCard, { StudentBootcamp } from './BootcampGridCard';
import { useToast } from '@/context/ToastContext';

const INITIAL_BOOTCAMPS: StudentBootcamp[] = [
  {
    id: 'bc-1',
    title: 'Advanced Distributed Systems & High-Frequency Ingestion',
    track: 'Systems & Backend',
    instructor: 'Alex Xu & Martin Kleppmann (Guest)',
    duration: '8 Weeks',
    enrolledStudents: 340,
    status: 'Enrolled',
    progressPct: 62,
    sessionsCompleted: 10,
    totalSessions: 16,
    nextSessionDate: 'Tomorrow at 6:30 PM IST',
    nextSessionTopic: 'LSM-Trees vs B-Trees in RocksDB & Cassandra Storage Engine',
    syllabus: [
      { week: 'Week 1-2', topic: 'Raft & Paxos Consensus Protocol Implementation', deliverables: 'Leader Election Engine' },
      { week: 'Week 3-4', topic: 'Storage Engines: LSM-Trees & Write-Ahead Logs', deliverables: 'Mini-RocksDB in Go' },
      { week: 'Week 5-6', topic: 'Distributed Lock, Consensus & Cache Coherence', deliverables: 'Redis Redlock Cluster' },
      { week: 'Week 7-8', topic: 'Capstone: 1M Events/Sec Ingestion Pipeline', deliverables: 'Production Benchmarks' },
    ],
  },
  {
    id: 'bc-2',
    title: 'FAANG DSA Mastery & Problem Pattern Synthesis',
    track: 'Competitive Programming',
    instructor: 'Errichto & NeetCode',
    duration: '6 Weeks',
    enrolledStudents: 820,
    status: 'Enrolled',
    progressPct: 80,
    sessionsCompleted: 16,
    totalSessions: 20,
    nextSessionDate: 'Saturday at 4:00 PM IST',
    nextSessionTopic: 'Segment Trees with Lazy Propagation & Range Queries',
    syllabus: [
      { week: 'Week 1', topic: 'Monotonic Queues & Sliding Window Deque Patterns', deliverables: '25 Hard Problems' },
      { week: 'Week 2-3', topic: 'Dynamic Programming on Trees & Bitmasks', deliverables: 'Contest Mock #1' },
      { week: 'Week 4-5', topic: 'Advanced Graph Theory: Max Flow, Min Cut & SCC', deliverables: 'Contest Mock #2' },
      { week: 'Week 6', topic: 'System Design Interview & Algorithm Synthesis', deliverables: 'Final Evaluation' },
    ],
  },
  {
    id: 'bc-3',
    title: 'Modern Generative AI & LLM Systems Engineering',
    track: 'AI / Deep Learning',
    instructor: 'Dr. Andrew Ng & Karpathy Fellow',
    duration: '10 Weeks',
    enrolledStudents: 560,
    status: 'Available',
    progressPct: 0,
    sessionsCompleted: 0,
    totalSessions: 24,
    nextSessionDate: 'Starts Next Monday',
    nextSessionTopic: 'Attention Mechanisms & Transformer Architecture from Scratch',
    syllabus: [
      { week: 'Week 1-3', topic: 'Building NanoGPT & Attention PyTorch from Scratch', deliverables: 'Trained Character LLM' },
      { week: 'Week 4-6', topic: 'Enterprise RAG Architectures, Vector DBs & Milvus', deliverables: 'Enterprise Doc Assistant' },
      { week: 'Week 7-8', topic: 'Fine-Tuning LoRA / QLoRA with Unsloth & vLLM', deliverables: 'Domain Tuned Model' },
      { week: 'Week 9-10', topic: 'vLLM & TensorRT Inference Optimization & Serving', deliverables: 'High-Throughput API' },
    ],
  },
  {
    id: 'bc-4',
    title: 'Full-Stack Next.js 15 & High-Scale Cloud Architecture',
    track: 'Web & Full-Stack',
    instructor: 'Dan Abramov & Guillermo Rauch',
    duration: '8 Weeks',
    enrolledStudents: 690,
    status: 'Available',
    progressPct: 0,
    sessionsCompleted: 0,
    totalSessions: 18,
    nextSessionDate: 'Next Tuesday at 7:00 PM IST',
    nextSessionTopic: 'React Server Components, Partial Prerendering & Edge Caching',
    syllabus: [
      { week: 'Week 1-2', topic: 'RSC Architecture, Actions & Turbopack Deep-Dive', deliverables: 'Edge Data Layer' },
      { week: 'Week 3-4', topic: 'Multi-Tenant Auth, Sessions & RBAC Security', deliverables: 'Identity Microservice' },
      { week: 'Week 5-6', topic: 'Realtime WebSockets, CRDTs & Collaborative Canvas', deliverables: 'Live Collab App' },
      { week: 'Week 7-8', topic: 'Distributed Deployment, Edge Functions & Observability', deliverables: 'Production SaaS' },
    ],
  },
  {
    id: 'bc-5',
    title: 'Production Kubernetes, eBPF & Cloud Native DevOps',
    track: 'DevOps & SRE',
    instructor: 'Kelsey Hightower & Brendan Burns',
    duration: '7 Weeks',
    enrolledStudents: 410,
    status: 'Available',
    progressPct: 0,
    sessionsCompleted: 0,
    totalSessions: 14,
    nextSessionDate: 'Starts in 2 Weeks',
    nextSessionTopic: 'Kubernetes Internal Controllers, Custom CRDs & Operator SDK',
    syllabus: [
      { week: 'Week 1-2', topic: 'Container Runtimes, cgroups & Linux Namespaces', deliverables: 'Custom Container Engine' },
      { week: 'Week 3-4', topic: 'Kubernetes Operators, CRDs & Controller Logic', deliverables: 'Database Operator' },
      { week: 'Week 5-6', topic: 'eBPF Kernel Tracing & Cilium Service Mesh', deliverables: 'Observability Daemon' },
      { week: 'Week 7', topic: 'Zero-Downtime GitOps & Chaos Engineering Drill', deliverables: 'ArgoCD Pipeline' },
    ],
  },
  {
    id: 'bc-6',
    title: 'High-Frequency Trading & Low Latency C++ Systems',
    track: 'Quant & Low Latency',
    instructor: 'Carl Cook & Bjarne Stroustrup (Visiting)',
    duration: '9 Weeks',
    enrolledStudents: 290,
    status: 'Available',
    progressPct: 0,
    sessionsCompleted: 0,
    totalSessions: 18,
    nextSessionDate: 'Starts Next Thursday',
    nextSessionTopic: 'Cache Locality, Branch Prediction & CPU Architecture in C++23',
    syllabus: [
      { week: 'Week 1-2', topic: 'Modern C++23, Cache Alignment & SIMD Vectorization', deliverables: 'Ring Buffer Benchmark' },
      { week: 'Week 3-4', topic: 'Lock-Free Data Structures & Memory Ordering Models', deliverables: 'Lock-Free Queue' },
      { week: 'Week 5-7', topic: 'Order Book Matching Engine Architecture', deliverables: 'Sub-Microsecond Engine' },
      { week: 'Week 8-9', topic: 'Kernel Bypass (DPDK/Solarflare) & Network Packets', deliverables: 'ITCH/OUCH Feed Handler' },
    ],
  },
];

export default function BootcampsClient() {
  const toast = useToast();
  const [bootcamps, setBootcamps] = useState<StudentBootcamp[]>(INITIAL_BOOTCAMPS);
  const [selectedBootcamp, setSelectedBootcamp] = useState<StudentBootcamp | null>(null);

  // Filters & State
  const [search, setSearch] = useState('');
  const [trackFilter, setTrackFilter] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(12);

  // Tracks list
  const tracks = useMemo(() => {
    const set = new Set<string>();
    bootcamps.forEach((b) => set.add(b.track));
    return Array.from(set);
  }, [bootcamps]);

  // Filtered dataset
  const filteredBootcamps = useMemo(() => {
    return bootcamps.filter((bc) => {
      const matchesSearch =
        bc.title.toLowerCase().includes(search.toLowerCase()) ||
        bc.instructor.toLowerCase().includes(search.toLowerCase()) ||
        bc.track.toLowerCase().includes(search.toLowerCase()) ||
        bc.nextSessionTopic.toLowerCase().includes(search.toLowerCase());

      const matchesTrack = trackFilter === 'ALL' || bc.track === trackFilter;

      let matchesTab = true;
      if (activeTab === 'ENROLLED') matchesTab = bc.status === 'Enrolled';
      if (activeTab === 'AVAILABLE') matchesTab = bc.status === 'Available';
      if (activeTab === 'COMPLETED') matchesTab = bc.status === 'Completed';

      return matchesSearch && matchesTrack && matchesTab;
    });
  }, [bootcamps, search, trackFilter, activeTab]);

  const handleEnroll = (bc: StudentBootcamp) => {
    setBootcamps((prev) =>
      prev.map((b) => (b.id === bc.id ? { ...b, status: 'Enrolled', progressPct: 0, sessionsCompleted: 0 } : b))
    );
    toast.success(`You have successfully enrolled in "${bc.title}"!`, 'Enrollment Confirmed');
    setSelectedBootcamp(null);
  };

  const handleJoinClass = (bc: StudentBootcamp) => {
    toast.info(`Connecting to live masterclass for "${bc.title}"...`, 'Live Classroom');
  };

  const handleExportCSV = () => {
    const headers = ['Title', 'Track', 'Instructor', 'Duration', 'Enrolled', 'Status', 'Progress', 'Next Session'];
    const rows = filteredBootcamps.map((b) => [
      `"${b.title.replace(/"/g, '""')}"`,
      `"${b.track}"`,
      `"${b.instructor}"`,
      b.duration,
      b.enrolledStudents,
      b.status,
      `${b.progressPct}%`,
      `"${b.nextSessionDate} - ${b.nextSessionTopic.replace(/"/g, '""')}"`,
    ]);

    const csvData = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `industry_bootcamps_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* ========================================================================= */}
      {/* 1. CLEAN & PREMIUM HERO HEADER (Matching Course Catalog Aesthetic) */}
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5, flexWrap: 'wrap' }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
              Intensive Industry Bootcamps & Cohorts
            </Typography>

            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.8,
                bgcolor: 'rgba(37, 99, 235, 0.08)',
                border: '1px solid rgba(37, 99, 235, 0.18)',
                px: 1.2,
                py: 0.35,
                borderRadius: '9999px',
              }}
            >
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  bgcolor: '#10B981',
                  boxShadow: '0 0 6px #10B981',
                  animation: 'pulse 1.8s infinite',
                  '@keyframes pulse': {
                    '0%': { opacity: 1 },
                    '50%': { opacity: 0.3 },
                    '100%': { opacity: 1 },
                  },
                }}
              />
              <Typography sx={{ color: '#2563EB', fontWeight: 800, fontSize: '0.72rem', letterSpacing: '0.02em' }}>
                LIVE SPRINTS
              </Typography>
            </Box>

            <Chip
              icon={<AutoAwesomeRoundedIcon sx={{ fontSize: 13, color: '#D97706 !important' }} />}
              label="Peer Cohorts & Mentorship"
              size="small"
              sx={{
                bgcolor: 'rgba(245, 158, 11, 0.08)',
                color: '#D97706',
                fontWeight: 700,
                fontSize: '0.72rem',
                border: '1px solid rgba(245, 158, 11, 0.2)',
              }}
            />
          </Box>
          <Typography variant="body2" sx={{ color: '#64748B' }}>
            Live sprint training, elite peer cohorts, masterclasses by industry leaders, and hands-on capstone reviews.
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
              boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
              '&:hover': { bgcolor: '#F8FAFC', borderColor: '#94A3B8' },
            }}
          >
            Export CSV
          </Button>
        </Box>
      </Box>

      {/* ========================================================================= */}
      {/* 2. CARD CONTAINER WITH CONTROLS AND CONTENT */}
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
            value={activeTab}
            onChange={(_, val) => setActiveTab(val)}
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
            <Tab label="All Cohorts" value="ALL" />
            <Tab label="My Enrolled" value="ENROLLED" />
            <Tab label="Available Sprints" value="AVAILABLE" />
          </Tabs>

          {/* Search & Filter Options */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <TextField
              size="small"
              placeholder="Search bootcamp, mentor, topic..."
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

            <FormControl size="small" sx={{ minWidth: 170 }}>
              <Select
                value={trackFilter}
                onChange={(e) => setTrackFilter(e.target.value)}
                sx={{
                  borderRadius: '8px',
                  bgcolor: '#F8FAFC',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  color: '#334155',
                }}
              >
                <MenuItem value="ALL" sx={{ fontSize: '0.84rem', fontWeight: 600 }}>
                  All Tracks
                </MenuItem>
                {tracks.map((t) => (
                  <MenuItem key={t} value={t} sx={{ fontSize: '0.84rem' }}>
                    {t}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* View Mode Toggle: Grid & List */}
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(_, val) => {
                if (val) setViewMode(val);
              }}
              size="small"
              aria-label="view mode toggle"
              sx={{
                bgcolor: '#F1F5F9',
                borderRadius: '10px',
                p: '3px',
                border: '1px solid #E2E8F0',
                '& .MuiToggleButton-root': {
                  border: 'none',
                  borderRadius: '8px !important',
                  px: 1.5,
                  py: 0.6,
                  color: '#64748B',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  textTransform: 'none',
                  gap: 0.6,
                  transition: 'all 0.18s ease',
                  '&.Mui-selected': {
                    bgcolor: '#FFFFFF',
                    color: '#2563EB',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    fontWeight: 800,
                  },
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.8)',
                  },
                },
              }}
            >
              <ToggleButton value="grid" aria-label="grid view">
                <GridViewRoundedIcon sx={{ fontSize: 17 }} />
                <span>Grid</span>
              </ToggleButton>
              <ToggleButton value="list" aria-label="list view">
                <ViewListRoundedIcon sx={{ fontSize: 17 }} />
                <span>List</span>
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Box>

        {/* ========================================================================= */}
        {/* 3. GRID VIEW RENDERING (Matches Courses Section Layout & Styling) */}
        {/* ========================================================================= */}
        {viewMode === 'grid' ? (
          <Box sx={{ p: { xs: 2, sm: 2.5, md: 3 }, bgcolor: '#F8FAFC' }}>
            {filteredBootcamps.length === 0 ? (
              <Box sx={{ py: 10, textAlign: 'center', color: '#94A3B8' }}>
                <Typography sx={{ fontWeight: 700, fontSize: '1.05rem', color: '#64748B', mb: 0.5 }}>
                  No bootcamps found
                </Typography>
                <Typography sx={{ fontSize: '0.85rem', color: '#94A3B8' }}>
                  Try changing your search query or adjusting the track filters.
                </Typography>
              </Box>
            ) : (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(auto-fill, minmax(260px, 1fr))',
                    md: 'repeat(auto-fill, minmax(280px, 1fr))',
                    lg: 'repeat(auto-fill, minmax(285px, 1fr))',
                  },
                  columnGap: { xs: 1.5, sm: 2, md: 2 },
                  rowGap: { xs: 4, sm: 5, md: 5 },
                }}
              >
                {filteredBootcamps
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((bootcamp) => (
                    <BootcampGridCard
                      key={bootcamp.id}
                      bootcamp={bootcamp}
                      onInspect={(b) => setSelectedBootcamp(b)}
                      onEnroll={(b) => handleEnroll(b)}
                      onJoin={(b) => handleJoinClass(b)}
                    />
                  ))}
              </Box>
            )}
          </Box>
        ) : (
          /* ========================================================================= */
          /* 4. LIST TABLE RENDERING */
          /* ========================================================================= */
          <TableContainer>
            <Table sx={{ minWidth: 850 }}>
              <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                <TableRow>
                  <TableCell sx={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', py: 1.5 }}>
                    Bootcamp & Track
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', py: 1.5 }}>
                    Instructor & Cohort
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', py: 1.5 }}>
                    Next Live Session
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', py: 1.5, width: 160 }}>
                    Progress
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', py: 1.5, width: 120 }}>
                    Enrollment
                  </TableCell>
                  <TableCell align="right" sx={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', py: 1.5, width: 140 }}>
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredBootcamps.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6, color: '#94A3B8' }}>
                      <Typography sx={{ fontWeight: 600, fontSize: '0.92rem' }}>
                        No bootcamps match your criteria.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBootcamps
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((bc) => (
                      <TableRow
                        key={bc.id}
                        hover
                        sx={{
                          cursor: 'pointer',
                          '&:hover': { bgcolor: 'rgba(248, 250, 252, 0.8)' },
                          transition: 'background-color 0.15s ease',
                        }}
                        onClick={() => setSelectedBootcamp(bc)}
                      >
                        {/* Title & Track */}
                        <TableCell sx={{ py: 1.8 }}>
                          <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                              <Chip
                                label={bc.track}
                                size="small"
                                sx={{
                                  bgcolor: 'rgba(37, 99, 235, 0.08)',
                                  color: '#2563EB',
                                  fontWeight: 800,
                                  fontSize: '0.7rem',
                                  height: 20,
                                }}
                              />
                              <Typography sx={{ fontSize: '0.72rem', color: '#64748B' }}>
                                {bc.duration} • {bc.enrolledStudents} enrolled
                              </Typography>
                            </Box>
                            <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.9rem', lineHeight: 1.3 }}>
                              {bc.title}
                            </Typography>
                          </Box>
                        </TableCell>

                        {/* Instructor */}
                        <TableCell sx={{ fontWeight: 700, color: '#334155', fontSize: '0.84rem', py: 1.8 }}>
                          {bc.instructor}
                        </TableCell>

                        {/* Next Live Session */}
                        <TableCell sx={{ py: 1.8 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                            <VideoCameraFrontRoundedIcon sx={{ fontSize: 16, color: '#EA580C' }} />
                            <Box>
                              <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#0F172A' }}>
                                {bc.nextSessionDate}
                              </Typography>
                              <Typography
                                sx={{
                                  fontSize: '0.72rem',
                                  color: '#64748B',
                                  maxWidth: 200,
                                  display: '-webkit-box',
                                  WebkitLineClamp: 1,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                }}
                              >
                                {bc.nextSessionTopic}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>

                        {/* Progress */}
                        <TableCell sx={{ py: 1.8 }}>
                          {bc.status === 'Enrolled' ? (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography sx={{ fontSize: '0.72rem', color: '#64748B' }}>
                                  {bc.sessionsCompleted}/{bc.totalSessions} Sessions
                                </Typography>
                                <Typography sx={{ fontSize: '0.74rem', fontWeight: 800, color: '#2563EB' }}>
                                  {bc.progressPct}%
                                </Typography>
                              </Box>
                              <LinearProgress
                                variant="determinate"
                                value={bc.progressPct}
                                sx={{
                                  height: 6,
                                  borderRadius: 3,
                                  bgcolor: '#F1F5F9',
                                  '& .MuiLinearProgress-bar': {
                                    background: 'linear-gradient(90deg, #3B82F6 0%, #1D4ED8 100%)',
                                    borderRadius: 3,
                                  },
                                }}
                              />
                            </Box>
                          ) : (
                            <Typography sx={{ fontSize: '0.78rem', color: '#94A3B8', fontStyle: 'italic' }}>
                              Not Enrolled
                            </Typography>
                          )}
                        </TableCell>

                        {/* Enrollment Chip */}
                        <TableCell sx={{ py: 1.8 }}>
                          <Chip
                            label={bc.status}
                            size="small"
                            sx={{
                              fontWeight: 800,
                              fontSize: '0.72rem',
                              bgcolor: bc.status === 'Enrolled' ? 'rgba(22, 163, 74, 0.1)' : '#F1F5F9',
                              color: bc.status === 'Enrolled' ? '#16A34A' : '#475569',
                            }}
                          />
                        </TableCell>

                        {/* Action */}
                        <TableCell align="right" sx={{ py: 1.8 }}>
                          <Button
                            size="small"
                            variant={bc.status === 'Enrolled' ? 'contained' : 'outlined'}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (bc.status === 'Available') {
                                handleEnroll(bc);
                              } else {
                                handleJoinClass(bc);
                              }
                            }}
                            sx={{
                              borderRadius: '6px',
                              textTransform: 'none',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              px: 1.8,
                              py: 0.5,
                              bgcolor: bc.status === 'Enrolled' ? '#0F172A' : 'transparent',
                              borderColor: '#2563EB',
                              color: bc.status === 'Enrolled' ? '#FFFFFF' : '#2563EB',
                              '&:hover': {
                                bgcolor: bc.status === 'Enrolled' ? '#1E293B' : 'rgba(37, 99, 235, 0.08)',
                              },
                            }}
                          >
                            {bc.status === 'Available' ? 'Enroll Now' : 'Join Class'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Pagination */}
        <TablePagination
          rowsPerPageOptions={[6, 12, 24]}
          component="div"
          count={filteredBootcamps.length}
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

      {/* ========================================================================= */}
      {/* 5. SYLLABUS DETAIL MODAL */}
      {/* ========================================================================= */}
      {selectedBootcamp && (
        <Dialog
          open={Boolean(selectedBootcamp)}
          onClose={() => setSelectedBootcamp(null)}
          maxWidth="md"
          fullWidth
          slotProps={{
            paper: {
              sx: {
                borderRadius: '16px',
                p: 1,
              },
            },
          }}
        >
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', pb: 1 }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Chip
                  label={selectedBootcamp.track}
                  size="small"
                  sx={{ bgcolor: 'rgba(37, 99, 235, 0.08)', color: '#2563EB', fontWeight: 800, fontSize: '0.72rem' }}
                />
                <Typography sx={{ fontSize: '0.76rem', color: '#64748B', fontWeight: 600 }}>
                  {selectedBootcamp.duration} • {selectedBootcamp.enrolledStudents} Enrolled
                </Typography>
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', lineHeight: 1.25 }}>
                {selectedBootcamp.title}
              </Typography>
              <Typography sx={{ fontSize: '0.8rem', color: '#64748B', mt: 0.3 }}>
                Lead Mentors: <strong>{selectedBootcamp.instructor}</strong>
              </Typography>
            </Box>
            <IconButton onClick={() => setSelectedBootcamp(null)} size="small">
              <CloseRoundedIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </DialogTitle>

          <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Spotlight Banner for next live session */}
            <Box
              sx={{
                p: 2,
                borderRadius: '10px',
                bgcolor: '#FFF7ED',
                border: '1px solid #FFEDD5',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              <VideoCameraFrontRoundedIcon sx={{ fontSize: 22, color: '#EA580C' }} />
              <Box>
                <Typography sx={{ fontSize: '0.76rem', fontWeight: 800, color: '#9A3412', textTransform: 'uppercase' }}>
                  Next Live Masterclass ({selectedBootcamp.nextSessionDate})
                </Typography>
                <Typography sx={{ fontSize: '0.86rem', fontWeight: 700, color: '#7C2D12' }}>
                  {selectedBootcamp.nextSessionTopic}
                </Typography>
              </Box>
            </Box>

            <Typography sx={{ fontSize: '0.92rem', fontWeight: 800, color: '#0F172A' }}>
              Curriculum & Weekly Milestones Breakdown
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {selectedBootcamp.syllabus.map((s, idx) => (
                <Box
                  key={idx}
                  sx={{
                    p: 2,
                    borderRadius: '10px',
                    border: '1px solid #E2E8F0',
                    bgcolor: '#F8FAFC',
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    justifyContent: 'space-between',
                    gap: 1.5,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        bgcolor: '#2563EB',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        flexShrink: 0,
                      }}
                    >
                      {idx + 1}
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 800, fontSize: '0.88rem', color: '#0F172A' }}>
                        {s.topic}
                      </Typography>
                      <Typography sx={{ fontSize: '0.74rem', color: '#64748B' }}>
                        {s.week} • Interactive masterclass & Q&A
                      </Typography>
                    </Box>
                  </Box>

                  <Chip
                    icon={<BoltRoundedIcon sx={{ fontSize: 13, color: '#D97706 !important' }} />}
                    label={s.deliverables}
                    size="small"
                    sx={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      bgcolor: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      color: '#0F172A',
                    }}
                  />
                </Box>
              ))}
            </Box>
          </DialogContent>

          <DialogActions sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between' }}>
            <Button
              onClick={() => setSelectedBootcamp(null)}
              sx={{ textTransform: 'none', borderRadius: '8px', color: '#64748B', fontWeight: 700 }}
            >
              Close
            </Button>
            {selectedBootcamp.status === 'Available' ? (
              <Button
                variant="contained"
                onClick={() => handleEnroll(selectedBootcamp)}
                sx={{
                  bgcolor: '#2563EB',
                  textTransform: 'none',
                  borderRadius: '8px',
                  fontWeight: 700,
                  px: 2.5,
                  py: 0.8,
                  '&:hover': { bgcolor: '#1D4ED8' },
                }}
              >
                Enroll in Cohort
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={() => {
                  handleJoinClass(selectedBootcamp);
                  setSelectedBootcamp(null);
                }}
                startIcon={<PlayArrowRoundedIcon />}
                sx={{
                  bgcolor: '#0F172A',
                  textTransform: 'none',
                  borderRadius: '8px',
                  fontWeight: 700,
                  px: 2.5,
                  py: 0.8,
                  '&:hover': { bgcolor: '#1E293B' },
                }}
              >
                Enter Live Classroom
              </Button>
            )}
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
}
