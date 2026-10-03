'use client';

import React, { useState, useEffect, useMemo } from 'react';
import QRCode from 'qrcode';
import {
  Box,
  Typography,
  Card,
  Chip,
  Button,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  TextField,
  InputAdornment,
  LinearProgress,
  Divider,
} from '@mui/material';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';
import FingerprintRoundedIcon from '@mui/icons-material/FingerprintRounded';
import AccountTreeRoundedIcon from '@mui/icons-material/AccountTreeRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import LaunchRoundedIcon from '@mui/icons-material/LaunchRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import MemoryRoundedIcon from '@mui/icons-material/MemoryRounded';
import HubRoundedIcon from '@mui/icons-material/HubRounded';
import StorageRoundedIcon from '@mui/icons-material/StorageRounded';
import AutoGraphRoundedIcon from '@mui/icons-material/AutoGraphRounded';
import DnsRoundedIcon from '@mui/icons-material/DnsRounded';
import { FaLinkedin, FaGithub } from 'react-icons/fa';
import { useToast } from '@/context/ToastContext';
import { useAppSelector } from '@/store/hooks';

// ----------------------------------------------------
// Data Structures
// ----------------------------------------------------
export interface SolvedProblemRecord {
  id: string;
  code: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  language: string;
  runtimeMs: number;
  percentile: number;
  solvedAt: string;
  testsPassed: string;
}

export interface AccreditedCourseRecord {
  id: string;
  code: string;
  title: string;
  category: string;
  hours: number;
  grade: string;
  completedDate: string;
  certificateId: string;
  instructor: string;
}

export interface ContestRecord {
  id: string;
  title: string;
  division: string;
  rank: number;
  totalParticipants: number;
  score: number;
  ratingDelta: number;
  date: string;
  percentile: number;
}

export interface CapstoneProjectRecord {
  id: string;
  title: string;
  domain: string;
  summary: string;
  stack: string[];
  metrics: string;
  evaluationScore: number;
  completionDate: string;
  verifiedBy: string;
  repositoryUrl?: string;
  liveDemoUrl?: string;
}

export interface SkillDomain {
  name: string;
  domain: string;
  level: 'Master' | 'Expert' | 'Advanced';
  score: number; // 0 - 100
  testCount: number;
  solvedCount: number;
  easy: number;
  medium: number;
  hard: number;
}

// ----------------------------------------------------
// QR Code Generator Component
// ----------------------------------------------------
function QRCodeCanvas({ url, size = 120 }: { url: string; size?: number }) {
  const [dataUrl, setDataUrl] = useState<string>('');

  useEffect(() => {
    let isCancelled = false;
    setDataUrl('');
    if (url) {
      QRCode.toDataURL(url, {
        width: size,
        margin: 1,
        color: { dark: '#0A0F1D', light: '#FFFFFF' },
      })
        .then((res) => {
          if (!isCancelled) setDataUrl(res);
        })
        .catch(() => {
          if (!isCancelled) setDataUrl('');
        });
    }
    return () => {
      isCancelled = true;
    };
  }, [url, size]);

  if (!dataUrl) {
    return <Box sx={{ width: size, height: size, bgcolor: '#F1F5F9', borderRadius: '12px' }} />;
  }

  return (
    <img
      src={dataUrl}
      alt="Skill Passport QR Verification"
      width={size}
      height={size}
      style={{ borderRadius: '10px', display: 'block' }}
    />
  );
}

// ----------------------------------------------------
// Main SkillPassportClient Component
// ----------------------------------------------------
export default function SkillPassportClient() {
  const toast = useToast();
  const currentUser = useAppSelector((state) => state.auth.user);

  // Active Ledger Tab: 'projects' | 'problems' | 'courses' | 'contests'
  const [activeLedgerTab, setActiveLedgerTab] = useState<'projects' | 'problems' | 'courses' | 'contests'>('projects');

  // Active Project Showcase Index for the Slider
  const [activeProjectIdx, setActiveProjectIdx] = useState(0);

  // Search & Filter state
  const [problemSearch, setProblemSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'Easy' | 'Medium' | 'Hard'>('all');
  const [competencyFilter, setCompetencyFilter] = useState<string>('all');

  // Modals
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedCert, setSelectedCert] = useState<AccreditedCourseRecord | null>(null);

  // User Identity & Document Metadata
  const studentName = currentUser?.name || '—';
  const studentHandle = currentUser?.handle || (currentUser as any)?.username || '—';
  const studentRollNo = (currentUser as any)?.rollNumber || (currentUser as any)?.rollNo || '—';
  const studentDegree = (currentUser as any)?.degree || '—';
  const studentGradYear = (currentUser as any)?.batch || '—';
  const institutionName =
    (currentUser as any)?.institution ||
    (currentUser as any)?.institutionName ||
    '—';

  const passportId = currentUser?.id ? "SP-" + new Date().getFullYear() + "-" + currentUser.id.toString().slice(0, 6).toUpperCase() : "SP-PREVIEW-" + new Date().getFullYear();
  const verificationHash = 'SHA256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069';
  const verificationUrl = "https://techlearns.in/verify/passport/" + encodeURIComponent(passportId);

  // Capstone Projects Dataset (Major Important Projects First)
  const capstoneProjects: CapstoneProjectRecord[] = useMemo(
    () => [
      {
        id: '1',
        title: 'High-Throughput Distributed Rate Limiter & Token Bucket Cluster',
        domain: 'Distributed Systems & Microservices',
        summary: 'Production-grade sliding-window rate limiter cluster with distributed Redis atomic Lua synchronization, gRPC streaming interceptors, and Prometheus telemetry.',
        stack: ['Go', 'Redis Cluster', 'gRPC', 'Docker', 'Prometheus'],
        metrics: '120,000 req/sec benchmark · <0.4ms latency · Zero-loss failover',
        evaluationScore: 98,
        completionDate: 'Sep 24, 2026',
        verifiedBy: 'EECS Faculty Assessment Panel',
        repositoryUrl: 'https://github.com/alexvance/distributed-limiter',
        liveDemoUrl: 'https://limiter.techlearns.in',
      },
      {
        id: '2',
        title: 'Real-Time Collaborative Code Execution Engine & Sandbox Worker',
        domain: 'Cloud Infrastructure & Sandboxing',
        summary: 'High-security multi-tenant remote code judge executing untrusted user submissions in isolated Linux cgroups and seccomp sandboxes with real-time WebSocket feedback.',
        stack: ['TypeScript', 'Next.js 15', 'BullMQ', 'Linux cgroups', 'PostgreSQL'],
        metrics: '45ms median cold-start · Complete memory & syscall isolation',
        evaluationScore: 96,
        completionDate: 'Aug 28, 2026',
        verifiedBy: 'CodePlatform Academic Council',
        repositoryUrl: 'https://github.com/alexvance/code-sandbox-runner',
        liveDemoUrl: 'https://sandbox.techlearns.in',
      },
      {
        id: '3',
        title: 'Automated AST Semantic Anti-Plagiarism & Syntax Graph Classifier',
        domain: 'Compilers & Code Intelligence',
        summary: 'Abstract Syntax Tree parser converting multi-language source code into normalized token graphs to detect deep code obfuscation, variable renaming, and struct restructuring.',
        stack: ['Python 3.12', 'Tree-sitter', 'Vector DB', 'FastAPI', 'PyTorch'],
        metrics: '99.4% detection accuracy across 50,000+ AST syntax graphs',
        evaluationScore: 99,
        completionDate: 'Jul 15, 2026',
        verifiedBy: 'Stanford EECS AI Lab',
        repositoryUrl: 'https://github.com/alexvance/ast-plagiarism-classifier',
        liveDemoUrl: 'https://ast-audit.techlearns.in',
      },
    ],
    []
  );

  // Solved Problems Dataset (A-to-Z Record)
  const solvedProblems: SolvedProblemRecord[] = useMemo(
    () => [
      { id: '1', code: 'PROB-001', title: 'Two Sum & Hash Index Mapping', difficulty: 'Easy', category: 'Array & Hash Table', language: 'C++20', runtimeMs: 4, percentile: 98.4, solvedAt: 'Oct 01, 2026', testsPassed: '58/58' },
      { id: '2', code: 'PROB-146', title: 'LRU Cache with Doubly Linked Hash Ring', difficulty: 'Medium', category: 'System Design', language: 'C++20', runtimeMs: 32, percentile: 96.2, solvedAt: 'Sep 29, 2026', testsPassed: '42/42' },
      { id: '3', code: 'PROB-004', title: 'Median of Two Sorted Arrays (Log-N Partition)', difficulty: 'Hard', category: 'Binary Search', language: 'Python 3.12', runtimeMs: 68, percentile: 94.8, solvedAt: 'Sep 26, 2026', testsPassed: '64/64' },
      { id: '4', code: 'PROB-042', title: 'Trapping Rain Water (Two-Pointer Barrier)', difficulty: 'Hard', category: 'Two Pointers', language: 'C++20', runtimeMs: 8, percentile: 99.1, solvedAt: 'Sep 22, 2026', testsPassed: '50/50' },
      { id: '5', code: 'PROB-210', title: 'Course Schedule II (Topological Kahn DAG)', difficulty: 'Medium', category: 'Graph Algorithms', language: 'TypeScript', runtimeMs: 44, percentile: 95.3, solvedAt: 'Sep 18, 2026', testsPassed: '36/36' },
      { id: '6', code: 'PROB-242', title: 'Valid Anagram Frequency Vectorization', difficulty: 'Easy', category: 'Hash Table', language: 'Python 3.12', runtimeMs: 28, percentile: 97.6, solvedAt: 'Sep 14, 2026', testsPassed: '34/34' },
      { id: '7', code: 'PROB-212', title: 'Word Search II (Trie & Matrix DFS Backtracking)', difficulty: 'Hard', category: 'Trie / DFS', language: 'C++20', runtimeMs: 112, percentile: 92.4, solvedAt: 'Sep 10, 2026', testsPassed: '72/72' },
      { id: '8', code: 'PROB-072', title: 'Edit Distance (Levenshtein Matrix DP)', difficulty: 'Medium', category: 'Dynamic Programming', language: 'C++20', runtimeMs: 16, percentile: 96.8, solvedAt: 'Sep 05, 2026', testsPassed: '48/48' },
    ],
    []
  );

  // Accredited Courses Dataset
  const accreditedCourses: AccreditedCourseRecord[] = useMemo(
    () => [
      { id: '1', code: 'CS-PYB-101', title: 'Python for Beginners & Core Algorithmic Foundations', category: 'Programming Languages', hours: 45, grade: '98% (Grade A+)', completedDate: 'Sep 28, 2026', certificateId: 'CERT-PYB-2026-0x8F92D', instructor: 'Prof. David Malan' },
      { id: '2', code: 'CS-DSA-301', title: 'Advanced Data Structures & Graph Optimization', category: 'Computer Science', hours: 60, grade: '96% (Grade A+)', completedDate: 'Sep 15, 2026', certificateId: 'CERT-DSA-2026-0x41E9B', instructor: 'Dr. Robert Tarjan' },
      { id: '3', code: 'CS-SYS-401', title: 'Distributed Systems & Sharded Database Architecture', category: 'System Architecture', hours: 50, grade: '92% (Grade A)', completedDate: 'Aug 20, 2026', certificateId: 'CERT-SYS-2026-0x77A12', instructor: 'Dr. Martin Kleppmann' },
    ],
    []
  );

  // Contest Results Dataset
  const contestHistory: ContestRecord[] = useMemo(
    () => [
      { id: '1', title: 'Division 1 Global Star-League 42', division: 'Division 1', rank: 18, totalParticipants: 1840, score: 400, ratingDelta: +64, date: 'Sep 27, 2026', percentile: 99.0 },
      { id: '2', title: 'Collegiate ACM-ICPC Campus Qualifier', division: 'Open Division', rank: 6, totalParticipants: 420, score: 600, ratingDelta: +48, date: 'Sep 12, 2026', percentile: 98.6 },
      { id: '3', title: 'Weekly Speed Code Sprint #118', division: 'Division 2', rank: 4, totalParticipants: 2450, score: 400, ratingDelta: +82, date: 'Aug 30, 2026', percentile: 99.8 },
      { id: '4', title: 'National Algorithmic Hack-Sprint 2026', division: 'Division 1', rank: 24, totalParticipants: 3100, score: 550, ratingDelta: +36, date: 'Aug 14, 2026', percentile: 99.2 },
    ],
    []
  );


  // Skill Competencies Matrix with Sub-skill Metrics
  const skillDomains: SkillDomain[] = useMemo(
    () => [
      { name: 'Dynamic Programming & Recursion', domain: 'Algorithms', level: 'Master', score: 96, testCount: 68, solvedCount: 34, easy: 8, medium: 18, hard: 8 },
      { name: 'Graph Theory & Network Flow', domain: 'Algorithms', level: 'Master', score: 94, testCount: 54, solvedCount: 28, easy: 6, medium: 14, hard: 8 },
      { name: 'Backend Services & API Architecture', domain: 'System Engineering', level: 'Expert', score: 91, testCount: 42, solvedCount: 22, easy: 4, medium: 12, hard: 6 },
      { name: 'Relational & Key-Value DB Systems', domain: 'Databases', level: 'Expert', score: 89, testCount: 38, solvedCount: 20, easy: 6, medium: 10, hard: 4 },
      { name: 'React 19 & Next.js App Architecture', domain: 'Frontend', level: 'Master', score: 95, testCount: 46, solvedCount: 24, easy: 8, medium: 12, hard: 4 },
      { name: 'Docker Sandbox & Linux Namespaces', domain: 'Cloud & DevOps', level: 'Advanced', score: 86, testCount: 26, solvedCount: 14, easy: 4, medium: 8, hard: 2 },
    ],
    []
  );

  const filteredCompetencies = useMemo(() => {
    if (competencyFilter === 'all') return skillDomains;
    return skillDomains.filter((sk) => sk.domain.toLowerCase() === competencyFilter.toLowerCase());
  }, [skillDomains, competencyFilter]);

  // Actions
  const handleCopyLink = async () => {
    if (typeof window !== 'undefined') {
      try {
        if (!navigator.clipboard?.writeText) {
          toast.error('Clipboard API is not supported in this browser.', 'Copy Failed');
          return;
        }
        await navigator.clipboard.writeText(verificationUrl);
        toast.success('Official verification link copied to clipboard!', 'Link Copied');
      } catch (err) {
        toast.error('Failed to copy verification link to clipboard.', 'Copy Error');
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Filtered problems
  const filteredProblems = useMemo(() => {
    return solvedProblems.filter((p) => {
      const matchSearch =
        p.title.toLowerCase().includes(problemSearch.toLowerCase()) ||
        p.code.toLowerCase().includes(problemSearch.toLowerCase()) ||
        p.category.toLowerCase().includes(problemSearch.toLowerCase());
      const matchDiff = difficultyFilter === 'all' || p.difficulty === difficultyFilter;
      return matchSearch && matchDiff;
    });
  }, [solvedProblems, problemSearch, difficultyFilter]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5, pb: 10, maxWidth: 1440, mx: 'auto', width: '100%' }}>
      {/* 1. TOP OFFICIAL SECURITY RIBBON & PASSPORT IDENTIFICATION HEADER */}
      <Card
        elevation={0}
        sx={{
          borderRadius: '24px',
          bgcolor: '#070D1E',
          backgroundImage:
            'radial-gradient(circle at 100% 0%, rgba(37, 99, 235, 0.28) 0%, transparent 50%), radial-gradient(circle at 0% 100%, rgba(217, 119, 6, 0.18) 0%, transparent 45%), linear-gradient(135deg, #070D1E 0%, #0F172A 65%, #131F37 100%)',
          color: '#FFFFFF',
          p: { xs: 3, sm: 3.5, md: 4 },
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 16px 40px rgba(7, 13, 30, 0.35)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle Watermark Branding in Background */}
        <Box
          sx={{
            position: 'absolute',
            right: -20,
            bottom: -30,
            opacity: 0.04,
            userSelect: 'none',
            pointerEvents: 'none',
          }}
        >
          <FingerprintRoundedIcon sx={{ fontSize: 320, color: '#FFFFFF' }} />
        </Box>

        {/* Top Issuing Authority Strip */}
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
            pb: 2.5,
            mb: 3,
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: '8px',
                bgcolor: 'rgba(59, 130, 246, 0.2)',
                border: '1px solid rgba(59, 130, 246, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#60A5FA',
              }}
            >
              <SecurityRoundedIcon sx={{ fontSize: 16 }} />
            </Box>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.08em', color: '#94A3B8', textTransform: 'uppercase' }}>
              DIGITAL SKILL PASSPORT · MERIT & TRANSCRIPT PREVIEW
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip
              icon={<VerifiedRoundedIcon sx={{ fontSize: '13px !important', color: '#10B981 !important' }} />}
              label="PREVIEW LEDGER · DEMO CONTENT"
              size="small"
              sx={{
                bgcolor: 'rgba(16, 185, 129, 0.12)',
                color: '#6EE7B7',
                fontWeight: 800,
                fontSize: '0.68rem',
                letterSpacing: '0.04em',
                border: '1px solid rgba(16, 185, 129, 0.28)',
                height: 22,
              }}
            />
            <Typography sx={{ fontFamily: 'monospace', fontSize: '0.72rem', color: '#64748B' }}>
              ISSUED: OCT 2026 · NO EXPIRY
            </Typography>
          </Box>
        </Box>

        {/* Candidate Identity Dossier Section */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
            gap: 3.5,
          }}
        >
          {/* Identity & Badges */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
            {/* Holographic Avatar Box */}
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '22px',
                p: '2px',
                background: 'linear-gradient(135deg, #FBBF24 0%, #3B82F6 50%, #10B981 100%)',
                boxShadow: '0 8px 28px rgba(0, 0, 0, 0.45)',
                flexShrink: 0,
              }}
            >
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '20px',
                  bgcolor: '#0F172A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '2rem',
                  color: '#FFFFFF',
                }}
              >
                {studentName && studentName !== '—' ? studentName.charAt(0).toUpperCase() : 'U'}
              </Box>
            </Box>

            {/* Candidate Metadata */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                <Typography variant="h4" sx={{ fontWeight: 900, color: '#FFFFFF', fontSize: { xs: '1.4rem', sm: '1.75rem' }, letterSpacing: '-0.02em' }}>
                  {studentName}
                </Typography>
                <Chip
                  label="TIER 1 MERIT"
                  size="small"
                  sx={{
                    bgcolor: 'rgba(245, 158, 11, 0.18)',
                    color: '#FCD34D',
                    fontWeight: 800,
                    fontSize: '0.7rem',
                    border: '1px solid rgba(245, 158, 11, 0.35)',
                    height: 22,
                  }}
                />
              </Box>

              <Typography sx={{ color: '#93C5FD', fontSize: '0.9rem', fontWeight: 600, mt: 0.4 }}>
                @{studentHandle} · Roll: <span style={{ color: '#FFFFFF', fontFamily: 'monospace' }}>{studentRollNo}</span> · {studentDegree} ({studentGradYear})
              </Typography>

              <Typography sx={{ color: '#94A3B8', fontSize: '0.82rem', mt: 0.2 }}>
                {institutionName}
              </Typography>

              {/* Passport Serial & Rating Tier Badges */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1.5, flexWrap: 'wrap' }}>
                <Typography
                  sx={{
                    fontFamily: 'monospace',
                    fontSize: '0.78rem',
                    color: '#FDE68A',
                    fontWeight: 700,
                    bgcolor: 'rgba(255, 255, 255, 0.08)',
                    px: 1.2,
                    py: 0.4,
                    borderRadius: '6px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  PASSPORT ID: {passportId}
                </Typography>

                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.6,
                    px: 1.4,
                    py: 0.4,
                    borderRadius: '6px',
                    bgcolor: '#F59E0B',
                    color: '#0F172A',
                    fontWeight: 900,
                    fontSize: '0.76rem',
                    letterSpacing: '0.02em',
                  }}
                >
                  <StarRoundedIcon sx={{ fontSize: 16 }} />
                  4-Star Coder · 1,842 Rating (Division 1)
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Action Toolbar */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              size="medium"
              startIcon={<ShareRoundedIcon sx={{ fontSize: 16 }} />}
              onClick={() => setShareModalOpen(true)}
              sx={{
                color: '#FFFFFF',
                borderColor: 'rgba(255, 255, 255, 0.25)',
                fontWeight: 700,
                fontSize: '0.84rem',
                textTransform: 'none',
                borderRadius: '10px',
                px: 2.2,
                py: 0.9,
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)', borderColor: '#FFFFFF' },
              }}
            >
              Share Portfolio
            </Button>

            <Button
              variant="contained"
              size="medium"
              startIcon={<DownloadRoundedIcon sx={{ fontSize: 18 }} />}
              onClick={handlePrint}
              sx={{
                bgcolor: '#2563EB',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '0.84rem',
                textTransform: 'none',
                borderRadius: '10px',
                px: 2.5,
                py: 0.9,
                boxShadow: '0 6px 20px rgba(37, 99, 235, 0.4)',
                '&:hover': { bgcolor: '#1D4ED8' },
              }}
            >
              Export Official PDF
            </Button>
          </Box>
        </Box>
      </Card>

      {/* 2. EXECUTIVE METRIC SCORECARD (THE 4 PILLARS OF ENGINEERING MERIT) */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
          gap: 2.5,
        }}
      >
        {/* Metric 1: Algorithmic Mastery - Multi-Tone Segmented Ratio Bar */}
        <Card
          elevation={0}
          sx={{
            borderRadius: '20px',
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            p: 2.8,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: 2,
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' },
          }}
        >
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography sx={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Algorithmic Problems
              </Typography>
              <Box sx={{ width: 34, height: 34, borderRadius: '10px', bgcolor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CodeRoundedIcon sx={{ fontSize: 20 }} />
              </Box>
            </Box>

            <Typography sx={{ fontSize: '1.65rem', fontWeight: 900, color: '#0F172A', lineHeight: 1.1 }}>
              142 Solved
            </Typography>
            <Typography sx={{ fontSize: '0.76rem', color: '#16A34A', fontWeight: 700, mt: 0.4 }}>
              94.2% First Attempt Accuracy
            </Typography>
          </Box>

          {/* Custom Visual: Segmented Difficulty Ratio Meter */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {/* Segmented Distribution Bar */}
            <Box sx={{ display: 'flex', width: '100%', height: 8, borderRadius: '9999px', overflow: 'hidden', bgcolor: '#F1F5F9', gap: '2px' }}>
              <Box sx={{ width: '33.8%', bgcolor: '#10B981', borderRadius: '4px 0 0 4px' }} title="Easy: 48 (33.8%)" />
              <Box sx={{ width: '52.1%', bgcolor: '#2563EB' }} title="Medium: 74 (52.1%)" />
              <Box sx={{ width: '14.1%', bgcolor: '#EF4444', borderRadius: '0 4px 4px 0' }} title="Hard: 20 (14.1%)" />
            </Box>

            {/* Difficulty Breakdown Badges */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 0.2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: '#10B981' }} />
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 750, color: '#166534' }}>48 Easy</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: '#2563EB' }} />
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 750, color: '#1E40AF' }}>74 Med</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: '#EF4444' }} />
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 750, color: '#991B1B' }}>20 Hard</Typography>
              </Box>
            </Box>
          </Box>
        </Card>

        {/* Metric 2: Contest Standing - SVG Rating Sparkline Graph */}
        <Card
          elevation={0}
          sx={{
            borderRadius: '20px',
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            p: 2.8,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: 2,
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' },
          }}
        >
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography sx={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Contest Standing
              </Typography>
              <Box sx={{ width: 34, height: 34, borderRadius: '10px', bgcolor: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <EmojiEventsRoundedIcon sx={{ fontSize: 20 }} />
              </Box>
            </Box>

            <Typography sx={{ fontSize: '1.65rem', fontWeight: 900, color: '#0F172A', lineHeight: 1.1 }}>
              1,842 Rating
            </Typography>
            <Typography sx={{ fontSize: '0.76rem', color: '#D97706', fontWeight: 700, mt: 0.4 }}>
              Division 1 · Top 2.4% Global
            </Typography>
          </Box>

          {/* Custom Visual: High-Fidelity SVG Sparkline Chart */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.6 }}>
            <Box sx={{ width: '100%', height: 38, position: 'relative' }}>
              <svg width="100%" height="100%" viewBox="0 0 200 40" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                <defs>
                  <linearGradient id="contestSparklineGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Area fill under curve */}
                <path
                  d="M 0 35 Q 40 28, 70 24 T 140 16 T 200 4 L 200 40 L 0 40 Z"
                  fill="url(#contestSparklineGrad)"
                />
                {/* Smooth Curve */}
                <path
                  d="M 0 35 Q 40 28, 70 24 T 140 16 T 200 4"
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                {/* Peak Marker Dot */}
                <circle cx="200" cy="4" r="4.5" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="2" />
              </svg>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 0.2 }}>
              <Typography sx={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 700 }}>
                4 Tournaments
              </Typography>
              <Typography sx={{ fontSize: '0.68rem', color: '#B45309', fontWeight: 800 }}>
                Peak: 1,842 (+188 Δ)
              </Typography>
            </Box>
          </Box>
        </Card>

        {/* Metric 3: Academic Accreditations - Modular Milestone Blocks */}
        <Card
          elevation={0}
          sx={{
            borderRadius: '20px',
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            p: 2.8,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: 2,
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' },
          }}
        >
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography sx={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Accredited Curriculum
              </Typography>
              <Box sx={{ width: 34, height: 34, borderRadius: '10px', bgcolor: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <WorkspacePremiumRoundedIcon sx={{ fontSize: 20 }} />
              </Box>
            </Box>

            <Typography sx={{ fontSize: '1.65rem', fontWeight: 900, color: '#0F172A', lineHeight: 1.1 }}>
              3 Certifications
            </Typography>
            <Typography sx={{ fontSize: '0.76rem', color: '#059669', fontWeight: 700, mt: 0.4 }}>
              155 Verified Lab Hours · 96.4% GPA
            </Typography>
          </Box>

          {/* Custom Visual: 3-Track Completion Milestone Strip */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
              <Box sx={{ height: 6, borderRadius: '9999px', bgcolor: '#10B981' }} title="Track 1: Algorithms (100%)" />
              <Box sx={{ height: 6, borderRadius: '9999px', bgcolor: '#10B981' }} title="Track 2: Data Structures (100%)" />
              <Box sx={{ height: 6, borderRadius: '9999px', bgcolor: '#10B981' }} title="Track 3: Distributed Systems (100%)" />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 0.2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <VerifiedRoundedIcon sx={{ fontSize: 13, color: '#10B981' }} />
                <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: '#059669' }}>
                  3/3 Completed
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: '#047857' }}>
                96.4% Distinction
              </Typography>
            </Box>
          </Box>
        </Card>

        {/* Metric 4: Code Authenticity & Integrity - Multi-Pillar Security Audit Badge */}
        <Card
          elevation={0}
          sx={{
            borderRadius: '20px',
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            p: 2.8,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: 2,
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' },
          }}
        >
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography sx={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Integrity & Originality
              </Typography>
              <Box sx={{ width: 34, height: 34, borderRadius: '10px', bgcolor: '#FAF5FF', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldRoundedIcon sx={{ fontSize: 20 }} />
              </Box>
            </Box>

            <Typography sx={{ fontSize: '1.65rem', fontWeight: 900, color: '#0F172A', lineHeight: 1.1 }}>
              100% Original
            </Typography>
            <Typography sx={{ fontSize: '0.76rem', color: '#7C3AED', fontWeight: 700, mt: 0.4 }}>
              AST Static Analysis Verified (0 Strikes)
            </Typography>
          </Box>

          {/* Custom Visual: Security Status Pulse Indicator */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: '6px 10px',
                borderRadius: '8px',
                bgcolor: '#FAF5FF',
                border: '1px solid #F3E8FF',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#7C3AED' }} />
                <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: '#6B21A8' }}>
                  AST Parser: 0 Flags
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '0.66rem', fontWeight: 800, color: '#16A34A', bgcolor: '#ECFDF5', px: 0.8, py: 0.2, borderRadius: '4px' }}>
                SECURE
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 0.2 }}>
              <Typography sx={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 700 }}>
                Proctored Labs
              </Typography>
              <Typography sx={{ fontSize: '0.68rem', color: '#7C3AED', fontWeight: 800 }}>
                Clean Sandbox
              </Typography>
            </Box>
          </Box>
        </Card>
      </Box>

      {/* 3. CORE ARCHITECTURAL LAYOUT: VERIFIED DOMAINS & COMPREHENSIVE LEDGER */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1fr 340px' },
          gap: 3.5,
          alignItems: 'flex-start',
        }}
      >
        {/* LEFT COLUMN: Major Projects, Skill Domain Matrix & Performance Ledger */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5, minWidth: 0 }}>
          {/* ========================================================================= */}
          {/* SECTION 1: MAJOR VERIFIED ENGINEERING PROJECTS (INTERACTIVE SLIDER SHOWCASE) */}
          {/* ========================================================================= */}
          <Card
            elevation={0}
            sx={{
              borderRadius: '22px',
              bgcolor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              p: { xs: 2.5, sm: 3 },
              display: 'flex',
              flexDirection: 'column',
              gap: 2.5,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Header & Interactive Slider Controls */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                  <Typography sx={{ fontWeight: 900, fontSize: '1.15rem', color: '#0F172A', letterSpacing: '-0.01em' }}>
                    Major Engineering Capstones
                  </Typography>
                  <Chip
                    label="INTERACTIVE SHOWCASE"
                    size="small"
                    sx={{ height: 20, fontSize: '0.64rem', fontWeight: 800, bgcolor: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE' }}
                  />
                </Box>
                <Typography sx={{ fontSize: '0.8rem', color: '#64748B', mt: 0.3 }}>
                  Peer-reviewed production architectures with live telemetry, benchmark verification, and code integrity audits
                </Typography>
              </Box>

              {/* Slider Navigation Controls */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ display: 'flex', gap: 0.5, bgcolor: '#F1F5F9', p: 0.5, borderRadius: '10px' }}>
                  {capstoneProjects.map((p, idx) => (
                    <Box
                      key={p.id}
                      onClick={() => setActiveProjectIdx(idx)}
                      sx={{
                        px: 1.2,
                        py: 0.4,
                        borderRadius: '7px',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        bgcolor: activeProjectIdx === idx ? '#FFFFFF' : 'transparent',
                        color: activeProjectIdx === idx ? '#2563EB' : '#64748B',
                        boxShadow: activeProjectIdx === idx ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                        transition: 'all 0.2s ease',
                        '&:hover': { color: '#0F172A' },
                      }}
                    >
                      0{idx + 1}
                    </Box>
                  ))}
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                  <IconButton
                    size="small"
                    onClick={() => setActiveProjectIdx((prev) => (prev > 0 ? prev - 1 : capstoneProjects.length - 1))}
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      color: '#334155',
                      '&:hover': { bgcolor: '#EFF6FF', borderColor: '#BFDBFE', color: '#2563EB' },
                    }}
                  >
                    <ChevronLeftRoundedIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => setActiveProjectIdx((prev) => (prev < capstoneProjects.length - 1 ? prev + 1 : 0))}
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      color: '#334155',
                      '&:hover': { bgcolor: '#EFF6FF', borderColor: '#BFDBFE', color: '#2563EB' },
                    }}
                  >
                    <ChevronRightRoundedIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Box>
              </Box>
            </Box>

            {/* Active Project Slide Content */}
            {(() => {
              const proj = capstoneProjects[activeProjectIdx] || capstoneProjects[0];
              return (
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', lg: '1.2fr 1fr' },
                    gap: 3,
                    p: { xs: 2, sm: 2.8 },
                    borderRadius: '18px',
                    bgcolor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {/* Left Column: Project Overview & Actions */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 2 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
                      {/* Domain Pill & Defense Score */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            Project 0{activeProjectIdx + 1} of 0{capstoneProjects.length}
                          </Typography>
                          <Typography sx={{ color: '#CBD5E1' }}>•</Typography>
                          <Typography sx={{ fontSize: '0.75rem', fontWeight: 750, color: '#2563EB', bgcolor: '#EFF6FF', px: 1, py: 0.2, borderRadius: '6px' }}>
                            {proj.domain}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: '#ECFDF5', px: 1.2, py: 0.3, borderRadius: '9999px', border: '1px solid #A7F3D0' }}>
                          <VerifiedRoundedIcon sx={{ fontSize: 14, color: '#059669' }} />
                          <Typography sx={{ fontSize: '0.74rem', fontWeight: 800, color: '#047857' }}>
                            {proj.evaluationScore}% Defense Score
                          </Typography>
                        </Box>
                      </Box>

                      {/* Project Title */}
                      <Typography sx={{ fontWeight: 850, fontSize: '1.15rem', color: '#0F172A', lineHeight: 1.3 }}>
                        {proj.title}
                      </Typography>

                      {/* Summary */}
                      <Typography sx={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.6 }}>
                        {proj.summary}
                      </Typography>

                      {/* Key Benchmark Metric Box */}
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          p: '8px 12px',
                          borderRadius: '10px',
                          bgcolor: '#FFFFFF',
                          border: '1px solid #E2E8F0',
                        }}
                      >
                        <BoltRoundedIcon sx={{ fontSize: 18, color: '#2563EB' }} />
                        <Typography sx={{ fontSize: '0.76rem', color: '#334155', fontWeight: 650 }}>
                          <span style={{ color: '#64748B', fontWeight: 700 }}>Benchmark:</span> {proj.metrics}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Bottom Row: Tech Stack & Actions */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pt: 1, borderTop: '1px solid #E2E8F0' }}>
                      <Box sx={{ display: 'flex', gap: 0.6, flexWrap: 'wrap', alignItems: 'center' }}>
                        {proj.stack.map((stk) => (
                          <Typography
                            key={stk}
                            sx={{
                              fontSize: '0.72rem',
                              color: '#334155',
                              bgcolor: '#FFFFFF',
                              border: '1px solid #E2E8F0',
                              px: 1,
                              py: 0.3,
                              borderRadius: '6px',
                              fontWeight: 650,
                            }}
                          >
                            {stk}
                          </Typography>
                        ))}
                      </Box>

                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                        {proj.repositoryUrl && (
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => window.open(proj.repositoryUrl, '_blank', 'noopener,noreferrer')}
                            startIcon={<FaGithub size={13} />}
                            sx={{
                              textTransform: 'none',
                              fontWeight: 750,
                              fontSize: '0.76rem',
                              borderRadius: '9px',
                              color: '#1E293B',
                              borderColor: '#CBD5E1',
                              bgcolor: '#FFFFFF',
                              py: 0.5,
                              px: 1.4,
                              '&:hover': { bgcolor: '#F1F5F9', borderColor: '#94A3B8' },
                            }}
                          >
                            Code Repository
                          </Button>
                        )}
                        {proj.liveDemoUrl && (
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => window.open(proj.liveDemoUrl, '_blank', 'noopener,noreferrer')}
                            startIcon={<LaunchRoundedIcon sx={{ fontSize: 14 }} />}
                            sx={{
                              textTransform: 'none',
                              fontWeight: 750,
                              fontSize: '0.76rem',
                              borderRadius: '9px',
                              bgcolor: '#2563EB',
                              py: 0.5,
                              px: 1.5,
                              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
                              '&:hover': { bgcolor: '#1D4ED8' },
                            }}
                          >
                            Live System
                          </Button>
                        )}
                      </Box>
                    </Box>
                  </Box>

                  {/* Right Column: Dynamic Architectural Graphic & Telemetry HUD */}
                  <Box
                    sx={{
                      bgcolor: '#0B1120',
                      borderRadius: '16px',
                      border: '1px solid #1E293B',
                      p: 2.2,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.08)',
                      minHeight: 280,
                    }}
                  >
                    {/* Visual Case 1: Rate Limiter Cluster */}
                    {activeProjectIdx === 0 && (
                      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', gap: 1.5 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10B981', boxShadow: '0 0 8px #10B981' }} />
                            <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: '#A7F3D0', letterSpacing: '0.06em' }}>
                              LIVE TOPOLOGY & TELEMETRY
                            </Typography>
                          </Box>
                          <Typography sx={{ fontSize: '0.66rem', fontWeight: 800, color: '#38BDF8', bgcolor: 'rgba(56, 189, 248, 0.12)', px: 0.9, py: 0.2, borderRadius: '4px', border: '1px solid rgba(56, 189, 248, 0.25)' }}>
                            120,000 req/s Peak
                          </Typography>
                        </Box>

                        {/* Interactive SVG Architecture Map */}
                        <Box sx={{ width: '100%', height: 140, position: 'relative', bgcolor: 'rgba(15, 23, 42, 0.7)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)', p: 0.8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="100%" height="100%" viewBox="0 0 320 110" preserveAspectRatio="xMidYMid meet">
                            <defs>
                              <linearGradient id="streamGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.9" />
                                <stop offset="100%" stopColor="#818CF8" stopOpacity="0.9" />
                              </linearGradient>
                            </defs>

                            {/* Ingress Client */}
                            <rect x="8" y="38" width="56" height="34" rx="6" fill="#1E293B" stroke="#475569" strokeWidth="1.2" />
                            <text x="36" y="52" fill="#94A3B8" fontSize="8" fontWeight="bold" textAnchor="middle">Ingress</text>
                            <text x="36" y="64" fill="#38BDF8" fontSize="7" fontWeight="bold" textAnchor="middle">gRPC</text>

                            {/* Stream Line 1 */}
                            <line x1="64" y1="55" x2="112" y2="55" stroke="url(#streamGrad1)" strokeWidth="2" strokeDasharray="4 2" />

                            {/* Central Redis Atomic Lua Hub */}
                            <circle cx="145" cy="55" r="28" fill="#0F172A" stroke="#38BDF8" strokeWidth="2" />
                            <circle cx="145" cy="55" r="22" fill="#1E293B" />
                            <text x="145" y="52" fill="#FFFFFF" fontSize="8.5" fontWeight="900" textAnchor="middle">Redis Lua</text>
                            <text x="145" y="63" fill="#4ADE80" fontSize="7" fontWeight="bold" textAnchor="middle">Cluster Sync</text>

                            {/* Branch Lines */}
                            <path d="M 173 55 L 208 25" stroke="#64748B" strokeWidth="1.5" strokeDasharray="3 2" />
                            <path d="M 173 55 L 208 55" stroke="#38BDF8" strokeWidth="1.5" />
                            <path d="M 173 55 L 208 85" stroke="#64748B" strokeWidth="1.5" strokeDasharray="3 2" />

                            {/* Worker Nodes */}
                            <rect x="208" y="10" width="102" height="26" rx="5" fill="#1E293B" stroke="#475569" strokeWidth="1" />
                            <text x="259" y="24" fill="#E2E8F0" fontSize="7.5" fontWeight="bold" textAnchor="middle">Go Node 01 · 0.38ms</text>

                            <rect x="208" y="42" width="102" height="26" rx="5" fill="#1E293B" stroke="#38BDF8" strokeWidth="1.5" />
                            <text x="259" y="56" fill="#38BDF8" fontSize="7.5" fontWeight="900" textAnchor="middle">Go Node 02 · Active</text>

                            <rect x="208" y="74" width="102" height="26" rx="5" fill="#1E293B" stroke="#475569" strokeWidth="1" />
                            <text x="259" y="88" fill="#E2E8F0" fontSize="7.5" fontWeight="bold" textAnchor="middle">Go Node 03 · Standby</text>
                          </svg>
                        </Box>

                        {/* Telemetry Micro Grid */}
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
                          <Box sx={{ p: 0.9, borderRadius: '8px', bgcolor: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.06)', textAlign: 'center' }}>
                            <Typography sx={{ fontSize: '0.6rem', color: '#94A3B8', fontWeight: 700 }}>P99 LATENCY</Typography>
                            <Typography sx={{ fontSize: '0.8rem', color: '#38BDF8', fontWeight: 900 }}>&lt;0.38ms</Typography>
                          </Box>
                          <Box sx={{ p: 0.9, borderRadius: '8px', bgcolor: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.06)', textAlign: 'center' }}>
                            <Typography sx={{ fontSize: '0.6rem', color: '#94A3B8', fontWeight: 700 }}>FAILOVER</Typography>
                            <Typography sx={{ fontSize: '0.8rem', color: '#4ADE80', fontWeight: 900 }}>0 Packet Loss</Typography>
                          </Box>
                          <Box sx={{ p: 0.9, borderRadius: '8px', bgcolor: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.06)', textAlign: 'center' }}>
                            <Typography sx={{ fontSize: '0.6rem', color: '#94A3B8', fontWeight: 700 }}>ALGORITHM</Typography>
                            <Typography sx={{ fontSize: '0.8rem', color: '#FCD34D', fontWeight: 900 }}>Token Bucket</Typography>
                          </Box>
                        </Box>
                      </Box>
                    )}

                    {/* Visual Case 2: Sandbox Worker Engine */}
                    {activeProjectIdx === 1 && (
                      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', gap: 1.5 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10B981', boxShadow: '0 0 8px #10B981' }} />
                            <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: '#A7F3D0', letterSpacing: '0.06em' }}>
                              ISOLATED KERNEL RUNTIME
                            </Typography>
                          </Box>
                          <Typography sx={{ fontSize: '0.66rem', fontWeight: 800, color: '#4ADE80', bgcolor: 'rgba(74, 222, 128, 0.12)', px: 0.9, py: 0.2, borderRadius: '4px', border: '1px solid rgba(74, 222, 128, 0.25)' }}>
                            cgroups v2 + Seccomp
                          </Typography>
                        </Box>

                        {/* Interactive SVG Sandbox Map */}
                        <Box sx={{ width: '100%', height: 140, position: 'relative', bgcolor: 'rgba(15, 23, 42, 0.7)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)', p: 0.8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="100%" height="100%" viewBox="0 0 320 110" preserveAspectRatio="xMidYMid meet">
                            {/* BullMQ Ingest */}
                            <rect x="8" y="38" width="62" height="34" rx="6" fill="#1E293B" stroke="#475569" strokeWidth="1.2" />
                            <text x="39" y="52" fill="#94A3B8" fontSize="7.5" fontWeight="bold" textAnchor="middle">BullMQ</text>
                            <text x="39" y="64" fill="#F59E0B" fontSize="7" fontWeight="bold" textAnchor="middle">Job Queue</text>

                            {/* Pipeline Stream */}
                            <line x1="70" y1="55" x2="108" y2="55" stroke="#F59E0B" strokeWidth="2" strokeDasharray="4 2" />

                            {/* Seccomp Barrier */}
                            <rect x="108" y="15" width="28" height="80" rx="4" fill="#1E293B" stroke="#EF4444" strokeWidth="1.5" />
                            <text x="122" y="52" fill="#F87171" fontSize="7" fontWeight="900" textAnchor="middle" transform="rotate(-90 122 52)">SECCOMP</text>

                            {/* Stream into Sandbox */}
                            <line x1="136" y1="55" x2="168" y2="55" stroke="#10B981" strokeWidth="2" />

                            {/* Isolated Container Chamber */}
                            <rect x="168" y="15" width="144" height="80" rx="8" fill="#0F172A" stroke="#10B981" strokeWidth="1.8" />
                            <text x="240" y="32" fill="#34D399" fontSize="8" fontWeight="bold" textAnchor="middle">Isolated Container Jail</text>

                            {/* Quota meters */}
                            <rect x="178" y="42" width="124" height="14" rx="3" fill="#1E293B" />
                            <rect x="178" y="42" width="75" height="14" rx="3" fill="#2563EB" />
                            <text x="240" y="52" fill="#FFFFFF" fontSize="6.5" fontWeight="bold" textAnchor="middle">RAM: 64MB (42MB used)</text>

                            <rect x="178" y="62" width="124" height="14" rx="3" fill="#1E293B" />
                            <rect x="178" y="62" width="98" height="14" rx="3" fill="#10B981" />
                            <text x="240" y="72" fill="#FFFFFF" fontSize="6.5" fontWeight="bold" textAnchor="middle">CPU Quota: 1 Core (0.2s)</text>
                          </svg>
                        </Box>

                        {/* Telemetry Micro Grid */}
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
                          <Box sx={{ p: 0.9, borderRadius: '8px', bgcolor: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.06)', textAlign: 'center' }}>
                            <Typography sx={{ fontSize: '0.6rem', color: '#94A3B8', fontWeight: 700 }}>COLD START</Typography>
                            <Typography sx={{ fontSize: '0.8rem', color: '#4ADE80', fontWeight: 900 }}>45ms</Typography>
                          </Box>
                          <Box sx={{ p: 0.9, borderRadius: '8px', bgcolor: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.06)', textAlign: 'center' }}>
                            <Typography sx={{ fontSize: '0.6rem', color: '#94A3B8', fontWeight: 700 }}>CONTAINMENT</Typography>
                            <Typography sx={{ fontSize: '0.8rem', color: '#38BDF8', fontWeight: 900 }}>100% Isolated</Typography>
                          </Box>
                          <Box sx={{ p: 0.9, borderRadius: '8px', bgcolor: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.06)', textAlign: 'center' }}>
                            <Typography sx={{ fontSize: '0.6rem', color: '#94A3B8', fontWeight: 700 }}>SYSCALLS</Typography>
                            <Typography sx={{ fontSize: '0.8rem', color: '#FCD34D', fontWeight: 900 }}>Strict Whitelist</Typography>
                          </Box>
                        </Box>
                      </Box>
                    )}

                    {/* Visual Case 3: AST Plagiarism Classifier */}
                    {activeProjectIdx === 2 && (
                      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', gap: 1.5 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#818CF8', boxShadow: '0 0 8px #818CF8' }} />
                            <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: '#C7D2FE', letterSpacing: '0.06em' }}>
                              AST SYNTAX GRAPH NEURAL INFERENCE
                            </Typography>
                          </Box>
                          <Typography sx={{ fontSize: '0.66rem', fontWeight: 800, color: '#A78BFA', bgcolor: 'rgba(167, 139, 250, 0.12)', px: 0.9, py: 0.2, borderRadius: '4px', border: '1px solid rgba(167, 139, 250, 0.25)' }}>
                            99.4% Accuracy
                          </Typography>
                        </Box>

                        {/* Interactive SVG AST Tree */}
                        <Box sx={{ width: '100%', height: 140, position: 'relative', bgcolor: 'rgba(15, 23, 42, 0.7)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)', p: 0.8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="100%" height="100%" viewBox="0 0 320 110" preserveAspectRatio="xMidYMid meet">
                            {/* Source AST */}
                            <rect x="8" y="38" width="60" height="34" rx="6" fill="#1E293B" stroke="#475569" strokeWidth="1.2" />
                            <text x="38" y="52" fill="#94A3B8" fontSize="7.5" fontWeight="bold" textAnchor="middle">Source AST</text>
                            <text x="38" y="64" fill="#818CF8" fontSize="7" fontWeight="bold" textAnchor="middle">Tree-sitter</text>

                            {/* Stream into Tree */}
                            <line x1="68" y1="55" x2="105" y2="55" stroke="#818CF8" strokeWidth="2" />

                            {/* AST Graph Tree */}
                            <circle cx="120" cy="55" r="14" fill="#1E293B" stroke="#818CF8" strokeWidth="1.5" />
                            <text x="120" y="58" fill="#FFFFFF" fontSize="7" fontWeight="bold" textAnchor="middle">Root</text>

                            <line x1="134" y1="50" x2="160" y2="28" stroke="#818CF8" strokeWidth="1.2" />
                            <line x1="134" y1="55" x2="160" y2="55" stroke="#818CF8" strokeWidth="1.2" />
                            <line x1="134" y1="60" x2="160" y2="82" stroke="#818CF8" strokeWidth="1.2" />

                            <circle cx="170" cy="28" r="11" fill="#1E293B" stroke="#A78BFA" strokeWidth="1" />
                            <text x="170" y="31" fill="#DDD6FE" fontSize="6" textAnchor="middle">Param</text>

                            <circle cx="170" cy="55" r="11" fill="#1E293B" stroke="#A78BFA" strokeWidth="1" />
                            <text x="170" y="58" fill="#DDD6FE" fontSize="6" textAnchor="middle">Block</text>

                            <circle cx="170" cy="82" r="11" fill="#1E293B" stroke="#A78BFA" strokeWidth="1" />
                            <text x="170" y="85" fill="#DDD6FE" fontSize="6" textAnchor="middle">Return</text>

                            {/* Vector Projection */}
                            <line x1="182" y1="55" x2="215" y2="55" stroke="#EC4899" strokeWidth="2" strokeDasharray="3 2" />

                            {/* PyTorch Embedding Cluster */}
                            <rect x="215" y="20" width="98" height="70" rx="6" fill="#0F172A" stroke="#EC4899" strokeWidth="1.5" />
                            <text x="264" y="36" fill="#F472B6" fontSize="7.5" fontWeight="900" textAnchor="middle">Vector Cosine Hub</text>
                            <text x="264" y="52" fill="#FFFFFF" fontSize="7" fontWeight="bold" textAnchor="middle">Similarity: 0.994</text>
                            <text x="264" y="68" fill="#4ADE80" fontSize="6.5" fontWeight="bold" textAnchor="middle">✓ Invariant Match</text>
                          </svg>
                        </Box>

                        {/* Telemetry Micro Grid */}
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
                          <Box sx={{ p: 0.9, borderRadius: '8px', bgcolor: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.06)', textAlign: 'center' }}>
                            <Typography sx={{ fontSize: '0.6rem', color: '#94A3B8', fontWeight: 700 }}>INFERENCE</Typography>
                            <Typography sx={{ fontSize: '0.8rem', color: '#A78BFA', fontWeight: 900 }}>8.2ms</Typography>
                          </Box>
                          <Box sx={{ p: 0.9, borderRadius: '8px', bgcolor: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.06)', textAlign: 'center' }}>
                            <Typography sx={{ fontSize: '0.6rem', color: '#94A3B8', fontWeight: 700 }}>DATASET</Typography>
                            <Typography sx={{ fontSize: '0.8rem', color: '#38BDF8', fontWeight: 900 }}>50k+ ASTs</Typography>
                          </Box>
                          <Box sx={{ p: 0.9, borderRadius: '8px', bgcolor: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.06)', textAlign: 'center' }}>
                            <Typography sx={{ fontSize: '0.6rem', color: '#94A3B8', fontWeight: 700 }}>CONFIDENCE</Typography>
                            <Typography sx={{ fontSize: '0.8rem', color: '#4ADE80', fontWeight: 900 }}>99.4% Pass</Typography>
                          </Box>
                        </Box>
                      </Box>
                    )}
                  </Box>
                </Box>
              );
            })()}

            {/* Bottom Project Thumbnail Strip (Quick Switching) */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 1.5, pt: 0.5 }}>
              {capstoneProjects.map((p, idx) => {
                const isSelected = activeProjectIdx === idx;
                return (
                  <Box
                    key={p.id}
                    onClick={() => setActiveProjectIdx(idx)}
                    sx={{
                      p: 1.4,
                      borderRadius: '12px',
                      bgcolor: isSelected ? '#EFF6FF' : '#FFFFFF',
                      border: isSelected ? '1.5px solid #2563EB' : '1px solid #E2E8F0',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.2,
                      boxShadow: isSelected ? '0 4px 12px rgba(37, 99, 235, 0.08)' : 'none',
                      '&:hover': {
                        borderColor: isSelected ? '#2563EB' : '#94A3B8',
                        bgcolor: isSelected ? '#EFF6FF' : '#F8FAFC',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: '8px',
                        bgcolor: isSelected ? '#2563EB' : '#F1F5F9',
                        color: isSelected ? '#FFFFFF' : '#64748B',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 900,
                        fontSize: '0.72rem',
                        flexShrink: 0,
                      }}
                    >
                      0{idx + 1}
                    </Box>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography sx={{ fontSize: '0.76rem', fontWeight: 800, color: isSelected ? '#1E40AF' : '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {p.title}
                      </Typography>
                      <Typography sx={{ fontSize: '0.68rem', color: '#64748B' }}>
                        {p.evaluationScore}% Defense Score
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Card>

          {/* ========================================================================= */}
          {/* SECTION 2: VERIFIED ENGINEERING COMPETENCIES (STRUCTURED MATRIX TABLE)    */}
          {/* ========================================================================= */}
          <Card
            elevation={0}
            sx={{
              borderRadius: '22px',
              bgcolor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              p: { xs: 2.5, sm: 3 },
              display: 'flex',
              flexDirection: 'column',
              gap: 2.5,
            }}
          >
            {/* Header & Metric Summary */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1.5 }}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                  <Typography sx={{ fontWeight: 900, fontSize: '1.15rem', color: '#0F172A', letterSpacing: '-0.01em' }}>
                    Verified Engineering Competencies & Mastery Matrix
                  </Typography>
                  <Chip
                    label="PROCTORED & AUDITED"
                    size="small"
                    sx={{ height: 20, fontSize: '0.64rem', fontWeight: 800, bgcolor: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0' }}
                  />
                </Box>
                <Typography sx={{ fontSize: '0.8rem', color: '#64748B', mt: 0.3 }}>
                  Directly evaluated via automated sandboxed test suites, AST syntactic verification, and proctored execution
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ bgcolor: '#EFF6FF', px: 1.4, py: 0.5, borderRadius: '8px', border: '1px solid #BFDBFE', textAlign: 'right' }}>
                  <Typography sx={{ fontSize: '0.64rem', color: '#2563EB', fontWeight: 800, textTransform: 'uppercase' }}>
                    Average Mastery
                  </Typography>
                  <Typography sx={{ fontSize: '0.95rem', fontWeight: 900, color: '#1E40AF', lineHeight: 1.1 }}>
                    91.8%
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Domain Filter Chips */}
            <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap', alignItems: 'center' }}>
              {[
                { label: 'All Competencies', val: 'all', count: 6 },
                { label: 'Algorithms', val: 'Algorithms', count: 2 },
                { label: 'Systems', val: 'System Engineering', count: 1 },
                { label: 'Databases', val: 'Databases', count: 1 },
                { label: 'Frontend', val: 'Frontend', count: 1 },
                { label: 'Cloud & DevOps', val: 'Cloud & DevOps', count: 1 },
              ].map((tab) => {
                const isSelected = competencyFilter === tab.val;
                return (
                  <Chip
                    key={tab.val}
                    label={`${tab.label} (${tab.count})`}
                    size="small"
                    onClick={() => setCompetencyFilter(tab.val)}
                    sx={{
                      fontWeight: 750,
                      fontSize: '0.74rem',
                      cursor: 'pointer',
                      bgcolor: isSelected ? '#2563EB' : '#F1F5F9',
                      color: isSelected ? '#FFFFFF' : '#475569',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: isSelected ? '#1D4ED8' : '#E2E8F0',
                      },
                    }}
                  />
                );
              })}
            </Box>

            {/* Structured Competency Matrix Table (Rule 10 Compliant) */}
            <TableContainer sx={{ border: '1px solid #E2E8F0', borderRadius: '16px', overflowX: 'auto' }}>
              <Table>
                <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.74rem', letterSpacing: '0.04em', py: 1.5 }}>
                      COMPETENCY & DOMAIN
                    </TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.74rem', letterSpacing: '0.04em', py: 1.5 }}>
                      MASTERY TIER
                    </TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.74rem', letterSpacing: '0.04em', py: 1.5 }}>
                      TEST SUITES PASSED
                    </TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.74rem', letterSpacing: '0.04em', py: 1.5, minWidth: 200 }}>
                      SCORE & PROGRESS
                    </TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.74rem', letterSpacing: '0.04em', py: 1.5 }}>
                      DIFFICULTY DISTRIBUTION
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800, color: '#475569', fontSize: '0.74rem', letterSpacing: '0.04em', py: 1.5 }}>
                      AUDIT STATUS
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredCompetencies.map((sk) => {
                    const isMaster = sk.level === 'Master';
                    const isExpert = sk.level === 'Expert';
                    const badgeBg = isMaster ? '#EFF6FF' : isExpert ? '#F5F3FF' : '#ECFDF5';
                    const badgeColor = isMaster ? '#2563EB' : isExpert ? '#7C3AED' : '#059669';

                    return (
                      <TableRow key={sk.name} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                        {/* Domain & Skill Name */}
                        <TableCell sx={{ py: 2 }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4 }}>
                            <Typography sx={{ fontWeight: 850, fontSize: '0.88rem', color: '#0F172A' }}>
                              {sk.name}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                              <Typography sx={{ fontSize: '0.68rem', fontWeight: 750, color: '#64748B', bgcolor: '#F1F5F9', px: 0.8, py: 0.2, borderRadius: '4px' }}>
                                {sk.domain}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>

                        {/* Mastery Tier Badge */}
                        <TableCell sx={{ py: 2 }}>
                          <Chip
                            label={sk.level}
                            size="small"
                            sx={{
                              height: 22,
                              fontSize: '0.7rem',
                              fontWeight: 800,
                              bgcolor: badgeBg,
                              color: badgeColor,
                              border: `1px solid ${isMaster ? '#BFDBFE' : isExpert ? '#DDD6FE' : '#A7F3D0'}`,
                            }}
                          />
                        </TableCell>

                        {/* Problems Solved & Test Suites */}
                        <TableCell sx={{ py: 2 }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Typography sx={{ fontWeight: 800, fontSize: '0.82rem', color: '#0F172A' }}>
                              {sk.testCount} Test Suites
                            </Typography>
                            <Typography sx={{ fontSize: '0.7rem', color: '#64748B' }}>
                              {sk.solvedCount} Problems Verified
                            </Typography>
                          </Box>
                        </TableCell>

                        {/* Continuous Progress Bar & Score */}
                        <TableCell sx={{ py: 2 }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.6, width: '100%', maxWidth: 220 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography sx={{ fontSize: '0.82rem', fontWeight: 900, color: '#0F172A' }}>
                                {sk.score}%
                              </Typography>
                              <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748B' }}>
                                Top {100 - Math.round(sk.score * 0.95)}% Benchmark
                              </Typography>
                            </Box>
                            <Box sx={{ width: '100%', height: 7, borderRadius: '9999px', bgcolor: '#F1F5F9', overflow: 'hidden' }}>
                              <Box
                                sx={{
                                  width: `${sk.score}%`,
                                  height: '100%',
                                  borderRadius: '9999px',
                                  backgroundImage: isMaster
                                    ? 'linear-gradient(90deg, #3B82F6 0%, #1D4ED8 100%)'
                                    : isExpert
                                    ? 'linear-gradient(90deg, #8B5CF6 0%, #6D28D9 100%)'
                                    : 'linear-gradient(90deg, #10B981 0%, #059669 100%)',
                                  transition: 'width 0.6s ease',
                                }}
                              />
                            </Box>
                          </Box>
                        </TableCell>

                        {/* Difficulty Distribution */}
                        <TableCell sx={{ py: 2 }}>
                          <Box sx={{ display: 'flex', gap: 0.8, alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#10B981' }} />
                              <Typography sx={{ fontSize: '0.72rem', fontWeight: 750, color: '#166534' }}>{sk.easy}E</Typography>
                            </Box>
                            <Typography sx={{ color: '#CBD5E1', fontSize: '0.7rem' }}>•</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#2563EB' }} />
                              <Typography sx={{ fontSize: '0.72rem', fontWeight: 750, color: '#1E40AF' }}>{sk.medium}M</Typography>
                            </Box>
                            <Typography sx={{ color: '#CBD5E1', fontSize: '0.7rem' }}>•</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#EF4444' }} />
                              <Typography sx={{ fontSize: '0.72rem', fontWeight: 750, color: '#991B1B' }}>{sk.hard}H</Typography>
                            </Box>
                          </Box>
                        </TableCell>

                        {/* Audit Status */}
                        <TableCell align="right" sx={{ py: 2 }}>
                          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, bgcolor: '#ECFDF5', px: 1, py: 0.3, borderRadius: '6px', border: '1px solid #A7F3D0' }}>
                            <VerifiedRoundedIcon sx={{ fontSize: 13, color: '#059669' }} />
                            <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: '#047857' }}>
                              Audited
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>

          {/* SECTION 2: AUDITED PERFORMANCE LEDGER (STRUCTURED LIST TABLES PER RULE 10) */}
          <Card
            elevation={0}
            sx={{
              borderRadius: '22px',
              bgcolor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              overflow: 'hidden',
            }}
          >
            {/* Table Navigation Header */}
            <Box sx={{ px: 3, pt: 1.5, borderBottom: '1px solid #E2E8F0', bgcolor: '#F8FAFC' }}>
              <Tabs
                value={activeLedgerTab}
                onChange={(_, val) => setActiveLedgerTab(val)}
                sx={{
                  minHeight: 48,
                  '& .MuiTab-root': {
                    minHeight: 48,
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    textTransform: 'none',
                    color: '#64748B',
                    '&.Mui-selected': { color: '#2563EB' },
                  },
                }}
              >
                <Tab icon={<AccountTreeRoundedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label={"Capstone Projects (" + capstoneProjects.length + ")"} value="projects" />
                <Tab icon={<CodeRoundedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label={"Solved Problems (" + solvedProblems.length + ")"} value="problems" />
                <Tab icon={<WorkspacePremiumRoundedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label={"Accredited Courses (" + accreditedCourses.length + ")"} value="courses" />
                <Tab icon={<EmojiEventsRoundedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label={"Contest Records (" + contestHistory.length + ")"} value="contests" />
              </Tabs>
            </Box>

            {/* TAB 1: SOLVED PROBLEMS TABLE */}
            {activeLedgerTab === 'problems' && (
              <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {(['all', 'Easy', 'Medium', 'Hard'] as const).map((diff) => (
                      <Chip
                        key={diff}
                        label={diff === 'all' ? 'All Difficulties' : diff}
                        size="small"
                        onClick={() => setDifficultyFilter(diff)}
                        sx={{
                          fontWeight: 750,
                          fontSize: '0.74rem',
                          bgcolor: difficultyFilter === diff ? '#2563EB' : '#F1F5F9',
                          color: difficultyFilter === diff ? '#FFFFFF' : '#475569',
                          cursor: 'pointer',
                          '&:hover': { bgcolor: difficultyFilter === diff ? '#1D4ED8' : '#E2E8F0' },
                        }}
                      />
                    ))}
                  </Box>

                  <TextField
                    size="small"
                    placeholder="Search problem title or code..."
                    value={problemSearch}
                    onChange={(e) => setProblemSearch(e.target.value)}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchRoundedIcon sx={{ fontSize: 18, color: '#94A3B8' }} />
                          </InputAdornment>
                        ),
                      },
                    }}
                    sx={{ width: { xs: '100%', sm: 280 }, '& .MuiOutlinedInput-root': { borderRadius: '10px', fontSize: '0.82rem' } }}
                  />
                </Box>

                <TableContainer sx={{ border: '1px solid #E2E8F0', borderRadius: '14px', overflowX: 'auto' }}>
                  <Table>
                    <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.76rem', letterSpacing: '0.04em' }}>CODE & PROBLEM TITLE</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.76rem', letterSpacing: '0.04em' }}>DIFFICULTY</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.76rem', letterSpacing: '0.04em' }}>TOPIC CATEGORY</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.76rem', letterSpacing: '0.04em' }}>LANGUAGE</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.76rem', letterSpacing: '0.04em' }}>TESTS & BENCHMARK</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 800, color: '#475569', fontSize: '0.76rem', letterSpacing: '0.04em' }}>SOLVED DATE</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredProblems.map((p) => (
                        <TableRow key={p.id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                          <TableCell sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.84rem' }}>
                            {p.title}
                            <Typography sx={{ fontSize: '0.7rem', color: '#64748B', fontFamily: 'monospace' }}>{p.code}</Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={p.difficulty}
                              size="small"
                              sx={{
                                height: 22,
                                fontSize: '0.68rem',
                                fontWeight: 800,
                                bgcolor: p.difficulty === 'Easy' ? '#F0FDF4' : p.difficulty === 'Medium' ? '#EFF6FF' : '#FEF2F2',
                                color: p.difficulty === 'Easy' ? '#16A34A' : p.difficulty === 'Medium' ? '#2563EB' : '#DC2626',
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ color: '#475569', fontSize: '0.8rem', fontWeight: 500 }}>{p.category}</TableCell>
                          <TableCell sx={{ color: '#1E293B', fontSize: '0.8rem', fontWeight: 700 }}>{p.language}</TableCell>
                          <TableCell>
                            <Typography sx={{ color: '#059669', fontSize: '0.8rem', fontWeight: 800 }}>
                              {p.runtimeMs} ms (Top {100 - Math.round(p.percentile)}%)
                            </Typography>
                            <Typography sx={{ color: '#64748B', fontSize: '0.68rem' }}>
                              {p.testsPassed} Tests Passed
                            </Typography>
                          </TableCell>
                          <TableCell align="right" sx={{ color: '#64748B', fontSize: '0.8rem', fontWeight: 600 }}>{p.solvedAt}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {/* TAB 2: ACCREDITED COURSES TABLE */}
            {activeLedgerTab === 'courses' && (
              <Box sx={{ p: 3 }}>
                <TableContainer sx={{ border: '1px solid #E2E8F0', borderRadius: '14px' }}>
                  <Table>
                    <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.76rem', letterSpacing: '0.04em' }}>COURSE TITLE & ID</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.76rem', letterSpacing: '0.04em' }}>INSTRUCTOR & DOMAIN</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.76rem', letterSpacing: '0.04em' }}>CURRICULUM LABS</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.76rem', letterSpacing: '0.04em' }}>GRADE / SCORE</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.76rem', letterSpacing: '0.04em' }}>COMPLETED</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 800, color: '#475569', fontSize: '0.76rem', letterSpacing: '0.04em' }}>CREDENTIAL</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {accreditedCourses.map((c) => (
                        <TableRow key={c.id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                          <TableCell sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.84rem' }}>
                            {c.title}
                            <Typography sx={{ fontSize: '0.7rem', color: '#64748B', fontFamily: 'monospace' }}>SERIAL: {c.code}</Typography>
                          </TableCell>
                          <TableCell sx={{ color: '#475569', fontSize: '0.8rem' }}>
                            {c.instructor}
                            <Typography sx={{ fontSize: '0.7rem', color: '#64748B' }}>{c.category}</Typography>
                          </TableCell>
                          <TableCell sx={{ color: '#1E293B', fontSize: '0.8rem', fontWeight: 600 }}>{c.hours} Verified Hours</TableCell>
                          <TableCell sx={{ color: '#16A34A', fontWeight: 800, fontSize: '0.82rem' }}>{c.grade}</TableCell>
                          <TableCell sx={{ color: '#64748B', fontSize: '0.8rem' }}>{c.completedDate}</TableCell>
                          <TableCell align="right">
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => setSelectedCert(c)}
                              sx={{ textTransform: 'none', fontWeight: 800, fontSize: '0.75rem', borderRadius: '8px', color: '#2563EB', borderColor: '#BFDBFE' }}
                            >
                              Inspect Certificate
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {/* TAB 3: CONTEST PERFORMANCE TABLE */}
            {activeLedgerTab === 'contests' && (
              <Box sx={{ p: 3 }}>
                <TableContainer sx={{ border: '1px solid #E2E8F0', borderRadius: '14px' }}>
                  <Table>
                    <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.76rem', letterSpacing: '0.04em' }}>CONTEST TITLE</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.76rem', letterSpacing: '0.04em' }}>DIVISION</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.76rem', letterSpacing: '0.04em' }}>GLOBAL RANK</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.76rem', letterSpacing: '0.04em' }}>SCORE</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.76rem', letterSpacing: '0.04em' }}>RATING DELTA</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 800, color: '#475569', fontSize: '0.76rem', letterSpacing: '0.04em' }}>DATE</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {contestHistory.map((cnt) => (
                        <TableRow key={cnt.id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                          <TableCell sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.84rem' }}>{cnt.title}</TableCell>
                          <TableCell>
                            <Chip label={cnt.division} size="small" sx={{ fontSize: '0.68rem', fontWeight: 800, bgcolor: '#FEF3C7', color: '#B45309' }} />
                          </TableCell>
                          <TableCell sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.82rem' }}>
                            #{cnt.rank} <span style={{ color: '#64748B', fontWeight: 500 }}>/ {cnt.totalParticipants}</span>
                            <Typography sx={{ fontSize: '0.68rem', color: '#059669', fontWeight: 700 }}>Top {100 - Math.round(cnt.percentile)}%</Typography>
                          </TableCell>
                          <TableCell sx={{ color: '#059669', fontWeight: 800, fontSize: '0.82rem' }}>{cnt.score} pts</TableCell>
                          <TableCell>
                            <Chip
                              label={cnt.ratingDelta > 0 ? `+${cnt.ratingDelta}` : `${cnt.ratingDelta}`}
                              size="small"
                              sx={{
                                bgcolor: cnt.ratingDelta > 0 ? '#ECFDF5' : cnt.ratingDelta < 0 ? '#FEF2F2' : '#F1F5F9',
                                color: cnt.ratingDelta > 0 ? '#16A34A' : cnt.ratingDelta < 0 ? '#DC2626' : '#64748B',
                                fontWeight: 800,
                                fontSize: '0.7rem',
                              }}
                            />
                          </TableCell>
                          <TableCell align="right" sx={{ color: '#64748B', fontSize: '0.8rem', fontWeight: 600 }}>{cnt.date}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {/* TAB 4: CAPSTONE PROJECTS TABLE */}
            {activeLedgerTab === 'projects' && (
              <Box sx={{ p: 3 }}>
                <TableContainer sx={{ border: '1px solid #E2E8F0', borderRadius: '14px' }}>
                  <Table>
                    <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.76rem', letterSpacing: '0.04em' }}>PROJECT TITLE</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.76rem', letterSpacing: '0.04em' }}>DOMAIN & SPECIALIZATION</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.76rem', letterSpacing: '0.04em' }}>TECH STACK</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.76rem', letterSpacing: '0.04em' }}>FACULTY AUDIT SCORE</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 800, color: '#475569', fontSize: '0.76rem', letterSpacing: '0.04em' }}>COMPLETED</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {capstoneProjects.map((proj) => (
                        <TableRow key={proj.id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                          <TableCell sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.84rem' }}>
                            {proj.title}
                            <Typography sx={{ fontSize: '0.7rem', color: '#64748B' }}>Verified by: {proj.verifiedBy}</Typography>
                          </TableCell>
                          <TableCell sx={{ color: '#475569', fontSize: '0.8rem', fontWeight: 600 }}>{proj.domain}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                              {proj.stack.map((stk) => (
                                <Chip key={stk} label={stk} size="small" sx={{ height: 20, fontSize: '0.66rem', fontWeight: 700, bgcolor: '#F1F5F9', color: '#334155' }} />
                              ))}
                            </Box>
                          </TableCell>
                          <TableCell sx={{ color: '#16A34A', fontWeight: 800, fontSize: '0.82rem' }}>{proj.evaluationScore}% (Pass with Distinction)</TableCell>
                          <TableCell align="right" sx={{ color: '#64748B', fontSize: '0.8rem', fontWeight: 600 }}>{proj.completionDate}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </Card>
        </Box>

        {/* RIGHT COLUMN: Official Verifiable Biometric Credential & Audit Card */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Card 1: Official Titanium Credential Card */}
          <Card
            elevation={0}
            sx={{
              borderRadius: '22px',
              bgcolor: '#0F172A',
              backgroundImage: 'linear-gradient(145deg, #0F172A 0%, #1E293B 100%)',
              color: '#FFFFFF',
              p: 3,
              border: '1px solid #334155',
              boxShadow: '0 14px 32px rgba(15, 23, 42, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              textAlign: 'center',
            }}
          >
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: '#FCD34D', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Digital Recruiter Verification
            </Typography>

            {/* Scannable QR */}
            <Box
              sx={{
                bgcolor: '#FFFFFF',
                p: 1.5,
                borderRadius: '16px',
                mx: 'auto',
                cursor: 'pointer',
                display: 'inline-block',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
                transition: 'transform 0.2s ease',
                '&:hover': { transform: 'scale(1.03)' },
              }}
              onClick={() => setQrModalOpen(true)}
              title="Click to expand QR Code"
            >
              <QRCodeCanvas url={verificationUrl} size={120} />
            </Box>

            <Box>
              <Typography sx={{ fontWeight: 850, fontSize: '0.9rem', color: '#FFFFFF' }}>
                Instant Recruiter Verification
              </Typography>
              <Typography sx={{ fontSize: '0.74rem', color: '#94A3B8', mt: 0.3 }}>
                Scan to inspect authentic solution source, runtime benchmarks, and signatures
              </Typography>
            </Box>

            <Button
              variant="contained"
              size="small"
              onClick={handleCopyLink}
              startIcon={<ContentCopyRoundedIcon sx={{ fontSize: 16 }} />}
              sx={{
                bgcolor: '#2563EB',
                fontWeight: 800,
                fontSize: '0.8rem',
                textTransform: 'none',
                borderRadius: '10px',
                py: 0.9,
                '&:hover': { bgcolor: '#1D4ED8' },
              }}
            >
              Copy Verification URL
            </Button>
          </Card>

          {/* Card 2: Cryptographic Security / Verification Preview Block */}
          <Card
            elevation={0}
            sx={{
              borderRadius: '20px',
              bgcolor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              p: 2.8,
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
              <ShieldRoundedIcon sx={{ fontSize: 20, color: '#2563EB' }} />
              <Typography sx={{ fontWeight: 850, fontSize: '0.88rem', color: '#0F172A' }}>
                Attestation & Verification Preview
              </Typography>
            </Box>

            <Typography sx={{ fontSize: '0.74rem', color: '#64748B', lineHeight: 1.5 }}>
              Sample transcript and ledger preview. Cryptographic signatures and audit hashes will reflect live audited results when synced with student evaluation services.
            </Typography>

            <Box sx={{ p: 1.2, bgcolor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
              <Typography sx={{ fontSize: '0.66rem', color: '#64748B', fontWeight: 700 }}>PREVIEW VERIFICATION HASH</Typography>
              <Typography sx={{ fontSize: '0.68rem', fontFamily: 'monospace', color: '#0F172A', wordBreak: 'break-all', mt: 0.2 }}>
                {verificationHash}
              </Typography>
            </Box>

            <Divider />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography sx={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 600 }}>
                Record Status
              </Typography>
              <Chip
                label="PREVIEW DEMO"
                size="small"
                sx={{ height: 18, fontSize: '0.62rem', fontWeight: 800, bgcolor: '#EFF6FF', color: '#2563EB' }}
              />
            </Box>
          </Card>
        </Box>
      </Box>

      {/* 4. MODALS (QR CODE, SHARE & CERTIFICATE INSPECTION) */}

      {/* QR Modal */}
      <Dialog
        open={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: '20px', p: 2, textAlign: 'center' } } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Typography sx={{ fontWeight: 900, fontSize: '1.05rem', color: '#0F172A' }}>
            Passport Verification QR
          </Typography>
          <IconButton size="small" onClick={() => setQrModalOpen(false)}>
            <CloseRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, py: 1 }}>
          <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
            <QRCodeCanvas url={verificationUrl} size={180} />
          </Box>
          <Typography sx={{ fontSize: '0.82rem', color: '#64748B' }}>
            Scan to inspect verified student credentials for <strong>{studentName}</strong>.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 1.5 }}>
          <Button
            variant="contained"
            onClick={handleCopyLink}
            startIcon={<ContentCopyRoundedIcon sx={{ fontSize: 16 }} />}
            sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 800, bgcolor: '#2563EB', fontSize: '0.82rem', px: 3 }}
          >
            Copy Link
          </Button>
        </DialogActions>
      </Dialog>

      {/* Share Modal */}
      <Dialog
        open={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: '20px', p: 2 } } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Typography sx={{ fontWeight: 900, fontSize: '1.05rem', color: '#0F172A' }}>
            Share Skill Passport
          </Typography>
          <IconButton size="small" onClick={() => setShareModalOpen(false)}>
            <CloseRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, py: 1.5 }}>
          <TextField
            fullWidth
            size="small"
            value={verificationUrl}
            slotProps={{ input: { readOnly: true, sx: { fontFamily: 'monospace', fontSize: '0.8rem' } } }}
          />
          <Button
            fullWidth
            variant="contained"
            onClick={handleCopyLink}
            startIcon={<ContentCopyRoundedIcon sx={{ fontSize: 16 }} />}
            sx={{ textTransform: 'none', fontWeight: 800, borderRadius: '10px', bgcolor: '#2563EB', fontSize: '0.84rem' }}
          >
            Copy Verification Link
          </Button>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<FaLinkedin size={16} color="#0A66C2" />}
            onClick={() => {
              const url = "https://www.linkedin.com/sharing/share-offsite/?url=" + encodeURIComponent(verificationUrl);
              window.open(url, '_blank', 'noopener,noreferrer');
            }}
            sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 800, borderColor: '#CBD5E1', color: '#0F172A', fontSize: '0.84rem' }}
          >
            Share to LinkedIn
          </Button>
        </DialogContent>
      </Dialog>

      {/* Certificate Modal */}
      <Dialog
        open={Boolean(selectedCert)}
        onClose={() => setSelectedCert(null)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: '22px', p: 2 } } }}
      >
        {selectedCert && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
              <Typography sx={{ fontWeight: 900, fontSize: '1.1rem', color: '#0F172A' }}>
                Official Course Credential
              </Typography>
              <IconButton size="small" onClick={() => setSelectedCert(null)}>
                <CloseRoundedIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ py: 1.5 }}>
              <Box sx={{ bgcolor: '#0F172A', color: '#FFFFFF', border: '1.5px solid #334155', borderRadius: '16px', p: 3.5, textAlign: 'center', backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(37,99,235,0.2) 0%, transparent 60%)' }}>
                <WorkspacePremiumRoundedIcon sx={{ fontSize: 46, color: '#F59E0B', mb: 1.5 }} />
                <Typography sx={{ fontWeight: 900, fontSize: '1.15rem', color: '#FFFFFF', letterSpacing: '-0.01em' }}>
                  {selectedCert.title}
                </Typography>
                <Typography sx={{ fontSize: '0.84rem', color: '#93C5FD', mt: 0.6 }}>
                  Awarded to <strong>{studentName}</strong> ({institutionName})
                </Typography>
                <Typography sx={{ fontSize: '0.78rem', color: '#94A3B8', mt: 0.4 }}>
                  Instructor: {selectedCert.instructor} · Verified Lab Hours: {selectedCert.hours} hrs
                </Typography>

                <Box sx={{ my: 2, p: 1.5, bgcolor: 'rgba(255,255,255,0.06)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <Typography sx={{ fontSize: '0.74rem', color: '#6EE7B7', fontWeight: 800 }}>
                    GRADE ACHIEVED: {selectedCert.grade}
                  </Typography>
                  <Typography sx={{ fontFamily: 'monospace', fontSize: '0.74rem', color: '#FDE68A', fontWeight: 700, mt: 0.5 }}>
                    ID: {selectedCert.certificateId} · Date: {selectedCert.completedDate}
                  </Typography>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'flex-end', pb: 1, px: 3 }}>
              <Button
                variant="outlined"
                onClick={() => setSelectedCert(null)}
                sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700, fontSize: '0.8rem' }}
              >
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
