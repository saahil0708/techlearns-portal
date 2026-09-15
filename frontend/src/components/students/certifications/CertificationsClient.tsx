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
  Tooltip,
  IconButton,
} from '@mui/material';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import TerminalRoundedIcon from '@mui/icons-material/TerminalRounded';
import StorageRoundedIcon from '@mui/icons-material/StorageRounded';
import CloudQueueRoundedIcon from '@mui/icons-material/CloudQueueRounded';
import LayersRoundedIcon from '@mui/icons-material/LayersRounded';
import PsychologyRoundedIcon from '@mui/icons-material/PsychologyRounded';
import { StudentCertification } from '@/types/student-profile';
import ViewCertificateModal from '@/components/students/profile/ViewCertificateModal';
import { useToast } from '@/context/ToastContext';

// Theme configurations for high-end certificate plaques
const CERT_THEMES: Record<
  string,
  {
    glowColor: string;
    neonBorder: string;
    badgeGradient: string;
    cardBg: string;
    accent: string;
    tagBg: string;
    icon: React.ReactNode;
  }
> = {
  'C++': {
    glowColor: 'rgba(59, 130, 246, 0.35)',
    neonBorder: 'rgba(59, 130, 246, 0.4)',
    badgeGradient: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 50%, #60A5FA 100%)',
    cardBg: 'linear-gradient(180deg, #0F172A 0%, #0B132B 100%)',
    accent: '#60A5FA',
    tagBg: 'rgba(59, 130, 246, 0.12)',
    icon: <TerminalRoundedIcon sx={{ fontSize: 16 }} />,
  },
  'Python': {
    glowColor: 'rgba(234, 179, 8, 0.35)',
    neonBorder: 'rgba(234, 179, 8, 0.4)',
    badgeGradient: 'linear-gradient(135deg, #0369A1 0%, #0284C7 40%, #EAB308 100%)',
    cardBg: 'linear-gradient(180deg, #0F172A 0%, #151A28 100%)',
    accent: '#FBBF24',
    tagBg: 'rgba(234, 179, 8, 0.12)',
    icon: <CodeRoundedIcon sx={{ fontSize: 16 }} />,
  },
  'DSA': {
    glowColor: 'rgba(168, 85, 247, 0.35)',
    neonBorder: 'rgba(168, 85, 247, 0.4)',
    badgeGradient: 'linear-gradient(135deg, #6B21A8 0%, #9333EA 50%, #C084FC 100%)',
    cardBg: 'linear-gradient(180deg, #0F172A 0%, #131127 100%)',
    accent: '#C084FC',
    tagBg: 'rgba(168, 85, 247, 0.12)',
    icon: <PsychologyRoundedIcon sx={{ fontSize: 16 }} />,
  },
  'React': {
    glowColor: 'rgba(6, 182, 212, 0.35)',
    neonBorder: 'rgba(6, 182, 212, 0.4)',
    badgeGradient: 'linear-gradient(135deg, #0E7490 0%, #06B6D4 50%, #67E8F9 100%)',
    cardBg: 'linear-gradient(180deg, #0F172A 0%, #0B1924 100%)',
    accent: '#67E8F9',
    tagBg: 'rgba(6, 182, 212, 0.12)',
    icon: <LayersRoundedIcon sx={{ fontSize: 16 }} />,
  },
  'Cloud': {
    glowColor: 'rgba(249, 115, 22, 0.35)',
    neonBorder: 'rgba(249, 115, 22, 0.4)',
    badgeGradient: 'linear-gradient(135deg, #C2410C 0%, #EA580C 50%, #FB923C 100%)',
    cardBg: 'linear-gradient(180deg, #0F172A 0%, #1F1410 100%)',
    accent: '#FB923C',
    tagBg: 'rgba(249, 115, 22, 0.12)',
    icon: <CloudQueueRoundedIcon sx={{ fontSize: 16 }} />,
  },
  'SQL': {
    glowColor: 'rgba(99, 102, 241, 0.35)',
    neonBorder: 'rgba(99, 102, 241, 0.4)',
    badgeGradient: 'linear-gradient(135deg, #3730A3 0%, #4F46E5 50%, #818CF8 100%)',
    cardBg: 'linear-gradient(180deg, #0F172A 0%, #0F122B 100%)',
    accent: '#818CF8',
    tagBg: 'rgba(99, 102, 241, 0.12)',
    icon: <StorageRoundedIcon sx={{ fontSize: 16 }} />,
  },
};

const DEFAULT_THEME = {
  glowColor: 'rgba(148, 163, 184, 0.25)',
  neonBorder: 'rgba(148, 163, 184, 0.3)',
  badgeGradient: 'linear-gradient(135deg, #1E293B 0%, #334155 50%, #475569 100%)',
  cardBg: 'linear-gradient(180deg, #0F172A 0%, #1E293B 100%)',
  accent: '#94A3B8',
  tagBg: 'rgba(148, 163, 184, 0.12)',
  icon: <WorkspacePremiumRoundedIcon sx={{ fontSize: 16 }} />,
};

const CERTIFICATIONS: StudentCertification[] = [
  {
    id: 'cert-1',
    title: 'C++ Algorithmic Specialist',
    badgeCode: 'C++',
    language: 'C++ 20 / STL',
    stars: 3,
    issueDate: 'August 2025',
    validUntil: 'Lifetime Verified',
    issuer: 'Techlearns Academy',
    credentialId: 'CERT-CPP-9821-X',
    skills: ['STL Algorithms', 'Pointers & Memory', 'Graph Optimization', 'Dynamic Programming'],
    score: '98.5%',
    percentile: 'Top 1% Worldwide',
    proctoredBy: 'AI Sandbox & Full-Screen Video Audit',
    assessmentDuration: '120 Mins',
    problemsSolved: '4 / 4 Hard Algorithmic Problems',
    difficulty: 'Expert Tier',
    grade: 'S+ Distinction',
    verificationHash: '0x9821cff9b2f7c0018a4d7e98a12bc900f81a',
  },
  {
    id: 'cert-2',
    title: 'Python Software Systems Architect',
    badgeCode: 'Python',
    language: 'Python 3.12 / AsyncIO',
    stars: 3,
    issueDate: 'July 2025',
    validUntil: 'Lifetime Verified',
    issuer: 'Techlearns Academy',
    credentialId: 'CERT-PY-5412-B',
    skills: ['AsyncIO Engine', 'FastAPI Microservices', 'Data Structures', 'PyTorch', 'Concurrency'],
    score: '96.2%',
    percentile: 'Top 3% Globally',
    proctoredBy: 'Automated Code Sandbox & AI Proctor',
    assessmentDuration: '90 Mins',
    problemsSolved: '5 / 5 Systems Tasks Solved',
    difficulty: 'Advanced Tier',
    grade: 'A+ Honors',
    verificationHash: '0x5412py78b0129cd88f341109ae45f9103c8e',
  },
  {
    id: 'cert-3',
    title: 'Distributed Systems & Concurrency Engineer',
    badgeCode: 'DSA',
    language: 'Go / CPP / BullMQ',
    stars: 3,
    issueDate: 'September 2025',
    validUntil: 'Lifetime Verified',
    issuer: 'Techlearns Academy',
    credentialId: 'CERT-DIST-1092-A',
    skills: ['Raft Consensus', 'BullMQ Queueing', 'Slotted Redis', 'gRPC', 'Distributed Locks'],
    score: '99.1%',
    percentile: 'Top 0.5% Peak Rank',
    proctoredBy: 'Live Sandbox Proctored Evaluation',
    assessmentDuration: '150 Mins',
    problemsSolved: '3 / 3 Distributed Systems Lab Scenarios',
    difficulty: 'Master Tier',
    grade: 'S+ Distinction',
    verificationHash: '0x1092dist88910fedca44321908741bc599a1',
  },
  {
    id: 'cert-4',
    title: 'React & Next.js Frontend Architect',
    badgeCode: 'React',
    language: 'TypeScript / Next.js',
    stars: 3,
    issueDate: 'October 2025',
    validUntil: 'Lifetime Verified',
    issuer: 'Techlearns Academy',
    credentialId: 'CERT-RCT-7741-F',
    skills: ['Server Components', 'State Machines', 'Tailwind CSS', 'Core Web Vitals', 'SSR/SSG'],
    score: '97.8%',
    percentile: 'Top 2% Worldwide',
    proctoredBy: 'AI Proctored Interactive Sandbox',
    assessmentDuration: '90 Mins',
    problemsSolved: '4 / 4 Complex Interactive UI Modules',
    difficulty: 'Advanced Tier',
    grade: 'A+ Honors',
    verificationHash: '0x7741react00921bf3487aa1245089df122bc',
  },
  {
    id: 'cert-5',
    title: 'Cloud Native DevOps & Container Specialist',
    badgeCode: 'Cloud',
    language: 'Docker / Kubernetes',
    stars: 2,
    issueDate: 'November 2025',
    validUntil: 'November 2028',
    issuer: 'Techlearns Academy',
    credentialId: 'CERT-CLD-3309-K',
    skills: ['Kubernetes Manifests', 'Multi-stage Docker', 'CI/CD Pipelines', 'Helm Charts'],
    score: '94.0%',
    percentile: 'Top 5% Globally',
    proctoredBy: 'Interactive Terminal Sandbox Proctored',
    assessmentDuration: '75 Mins',
    problemsSolved: '12 / 12 Cloud Configuration Tasks',
    difficulty: 'Intermediate Tier',
    grade: 'A Level',
    verificationHash: '0x3309cld48901237ef11084ba908754129b01',
  },
  {
    id: 'cert-6',
    title: 'Advanced PostgreSQL & Query Optimization',
    badgeCode: 'SQL',
    language: 'PostgreSQL 16 Engine',
    stars: 3,
    issueDate: 'December 2025',
    validUntil: 'Lifetime Verified',
    issuer: 'Techlearns Academy',
    credentialId: 'CERT-SQL-8840-P',
    skills: ['B-Tree Indexing', 'EXPLAIN ANALYZE', 'Partitioning', 'ACID Transactions', 'CTE Queries'],
    score: '98.0%',
    percentile: 'Top 1.5% Worldwide',
    proctoredBy: 'Automated DB Engine Proctored Sandbox',
    assessmentDuration: '60 Mins',
    problemsSolved: '10 / 10 SQL Tuning Scenarios',
    difficulty: 'Advanced Tier',
    grade: 'S+ Distinction',
    verificationHash: '0x8840sql990172bf456108ad774019ee2778a',
  },
];

const CATEGORY_FILTERS = [
  { label: 'All Credentials', code: 'All' },
  { label: 'C++', code: 'C++' },
  { label: 'Python', code: 'Python' },
  { label: 'DSA & Systems', code: 'DSA' },
  { label: 'React / Frontend', code: 'React' },
  { label: 'Cloud & DevOps', code: 'Cloud' },
  { label: 'SQL / Database', code: 'SQL' },
];

export default function CertificationsClient() {
  const toast = useToast();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCert, setSelectedCert] = useState<StudentCertification | null>(null);
  const [certModalOpen, setCertModalOpen] = useState(false);

  // Filter logic
  const filteredCerts = useMemo(() => {
    return CERTIFICATIONS.filter((cert) => {
      if (selectedCategory !== 'All' && cert.badgeCode !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = cert.title.toLowerCase().includes(q);
        const matchId = cert.credentialId.toLowerCase().includes(q);
        const matchLang = cert.language.toLowerCase().includes(q);
        const matchSkills = cert.skills?.some((s) => s.toLowerCase().includes(q));
        if (!matchTitle && !matchId && !matchLang && !matchSkills) {
          return false;
        }
      }
      return true;
    });
  }, [selectedCategory, searchQuery]);

  const handleViewCert = (cert: StudentCertification, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedCert(cert);
    setCertModalOpen(true);
  };

  const handleCopyId = async (cert: StudentCertification, e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window !== 'undefined' && navigator?.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(cert.credentialId);
        toast.success(`Credential ID copied: ${cert.credentialId}`, 'Copied to Clipboard');
      } catch {
        toast.error('Failed to copy credential ID to clipboard.', 'Copy Error');
      }
    } else {
      toast.error('Clipboard access is not supported on this browser.', 'Copy Error');
    }
  };

  const handleShareShowcase = async () => {
    if (typeof window !== 'undefined' && navigator?.clipboard?.writeText) {
      try {
        const url = `${window.location.origin}/students/certifications`;
        await navigator.clipboard.writeText(url);
        toast.success('Public credential showcase link copied to clipboard!', 'Showcase URL Copied');
      } catch {
        toast.error('Failed to copy showcase link to clipboard.', 'Share Error');
      }
    } else {
      toast.error('Clipboard access is not supported on this browser.', 'Share Error');
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5, pb: 6 }}>
      {/* 1. Ultra-Premium Hero Header Showcase */}
      <Box
        sx={{
          borderRadius: '28px',
          background: 'linear-gradient(135deg, #0B132B 0%, #111827 50%, #0F172A 100%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          p: { xs: 3, md: 4 },
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Subtle glowing ambient mesh orbs */}
        <Box
          sx={{
            position: 'absolute',
            top: '-40%',
            left: '-10%',
            width: '450px',
            height: '450px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.18) 0%, rgba(0,0,0,0) 70%)',
            pointerEvents: 'none',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '-40%',
            right: '-10%',
            width: '450px',
            height: '450px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, rgba(0,0,0,0) 70%)',
            pointerEvents: 'none',
          }}
        />

        <Box
          sx={{
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            flexDirection: { xs: 'column', lg: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', lg: 'center' },
            gap: 3.5,
          }}
        >
          {/* Left Column: Title & Overview */}
          <Box sx={{ maxWidth: 680 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1.5, flexWrap: 'wrap' }}>
              <Chip
                icon={<VerifiedRoundedIcon sx={{ fontSize: 14, color: '#34D399 !important' }} />}
                label="100% Proctored Credentials"
                size="small"
                sx={{
                  bgcolor: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(52, 211, 153, 0.35)',
                  color: '#34D399',
                  fontWeight: 800,
                  fontSize: '0.74rem',
                  height: 26,
                  backdropFilter: 'blur(8px)',
                }}
              />
              <Chip
                label="SHA-256 Ledger Verified"
                size="small"
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#CBD5E1',
                  fontWeight: 700,
                  fontSize: '0.72rem',
                  height: 26,
                }}
              />
            </Box>

            <Typography
              variant="h4"
              sx={{
                fontWeight: 900,
                color: '#FFFFFF',
                fontSize: { xs: '1.5rem', sm: '1.95rem' },
                lineHeight: 1.2,
                letterSpacing: '-0.02em',
                mb: 1,
              }}
            >
              Verified Credentials & Diplomas
            </Typography>

            <Typography sx={{ fontSize: '0.92rem', color: '#94A3B8', lineHeight: 1.6 }}>
              Cryptographically backed skill diplomas earned through proctored coding assessments. Click any certificate plaque to inspect execution metrics, forensic anti-cheat logs, and digital signatures.
            </Typography>
          </Box>

          {/* Right Column: Key Metric HUD Slabs & Share Button */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: { xs: '100%', sm: 340 } }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5 }}>
              <Box
                sx={{
                  p: 1.75,
                  borderRadius: '16px',
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(12px)',
                  textAlign: 'center',
                }}
              >
                <Typography sx={{ fontSize: '1.45rem', fontWeight: 900, color: '#FFFFFF', lineHeight: 1 }}>
                  {CERTIFICATIONS.length}
                </Typography>
                <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', mt: 0.5 }}>
                  Badges
                </Typography>
              </Box>

              <Box
                sx={{
                  p: 1.75,
                  borderRadius: '16px',
                  bgcolor: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(52, 211, 153, 0.3)',
                  backdropFilter: 'blur(12px)',
                  textAlign: 'center',
                }}
              >
                <Typography sx={{ fontSize: '1.45rem', fontWeight: 900, color: '#34D399', lineHeight: 1 }}>
                  97.3%
                </Typography>
                <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#6EE7B7', textTransform: 'uppercase', mt: 0.5 }}>
                  Avg Score
                </Typography>
              </Box>

              <Box
                sx={{
                  p: 1.75,
                  borderRadius: '16px',
                  bgcolor: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid rgba(96, 165, 250, 0.3)',
                  backdropFilter: 'blur(12px)',
                  textAlign: 'center',
                }}
              >
                <Typography sx={{ fontSize: '1.45rem', fontWeight: 900, color: '#60A5FA', lineHeight: 1 }}>
                  Top 1%
                </Typography>
                <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#93C5FD', textTransform: 'uppercase', mt: 0.5 }}>
                  Rank
                </Typography>
              </Box>
            </Box>

            <Button
              variant="contained"
              onClick={handleShareShowcase}
              startIcon={<ShareRoundedIcon sx={{ fontSize: 16 }} />}
              sx={{
                bgcolor: '#2563EB',
                color: '#FFFFFF',
                borderRadius: '14px',
                fontWeight: 800,
                textTransform: 'none',
                fontSize: '0.86rem',
                py: 1.1,
                boxShadow: '0 8px 20px rgba(37, 99, 235, 0.35)',
                '&:hover': { bgcolor: '#1D4ED8' },
              }}
            >
              Share Showcase Profile
            </Button>
          </Box>
        </Box>
      </Box>

      {/* 2. Filter Bar & Search Input */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', md: 'center' },
          gap: 2,
        }}
      >
        {/* Category Pill Filters */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
          {CATEGORY_FILTERS.map((cat) => {
            const isSelected = selectedCategory === cat.code;
            return (
              <Chip
                key={cat.code}
                label={cat.label}
                clickable
                onClick={() => setSelectedCategory(cat.code)}
                sx={{
                  fontWeight: isSelected ? 800 : 600,
                  fontSize: '0.82rem',
                  height: 36,
                  borderRadius: '12px',
                  bgcolor: isSelected ? '#0F172A' : '#FFFFFF',
                  color: isSelected ? '#FFFFFF' : '#475569',
                  border: isSelected ? '1px solid #0F172A' : '1px solid #E2E8F0',
                  boxShadow: isSelected ? '0 4px 14px rgba(15, 23, 42, 0.2)' : '0 2px 4px rgba(0, 0, 0, 0.02)',
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: isSelected ? '#020617' : '#F8FAFC',
                    borderColor: isSelected ? '#020617' : '#CBD5E1',
                  },
                }}
              />
            );
          })}
        </Box>

        {/* Search Field */}
        <TextField
          size="small"
          placeholder="Search by title, ID, technology..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon sx={{ fontSize: 18, color: '#94A3B8' }} />
                </InputAdornment>
              ),
              sx: {
                borderRadius: '14px',
                bgcolor: '#FFFFFF',
                fontSize: '0.86rem',
                minWidth: { xs: '100%', sm: 300 },
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
              },
            },
          }}
        />
      </Box>

      {/* 3. Luxurious Certificate Plaques Grid (Boxes) */}
      {filteredCerts.length === 0 ? (
        <Card
          elevation={0}
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: '24px',
            bgcolor: '#FFFFFF',
            border: '1.5px dashed #CBD5E1',
          }}
        >
          <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.1rem', mb: 0.5 }}>
            No matching credentials found
          </Typography>
          <Typography sx={{ color: '#64748B', fontSize: '0.84rem' }}>
            Try resetting your search filters or browse all certificates.
          </Typography>
          <Button
            size="small"
            variant="outlined"
            onClick={() => {
              setSelectedCategory('All');
              setSearchQuery('');
            }}
            sx={{ mt: 2, borderRadius: '10px', textTransform: 'none', fontWeight: 700 }}
          >
            Clear Filters
          </Button>
        </Card>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              lg: 'repeat(3, 1fr)',
            },
            gap: 3,
          }}
        >
          {filteredCerts.map((cert) => {
            const theme = CERT_THEMES[cert.badgeCode] || DEFAULT_THEME;

            return (
              <Card
                key={cert.id}
                elevation={0}
                onClick={(e) => handleViewCert(cert, e)}
                sx={{
                  borderRadius: '24px',
                  background: theme.cardBg,
                  border: `1.5px solid ${theme.neonBorder}`,
                  p: { xs: 2.5, sm: 3 },
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 2.25,
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: `0 8px 24px -6px ${theme.glowColor}, 0 2px 6px rgba(0, 0, 0, 0.4)`,
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: `0 20px 40px -10px ${theme.glowColor}, 0 4px 12px rgba(0, 0, 0, 0.5)`,
                    borderColor: theme.accent,
                    '& .badge-shield': {
                      transform: 'scale(1.06) rotate(1deg)',
                    },
                    '& .view-btn': {
                      color: '#FFFFFF',
                      bgcolor: theme.accent,
                    },
                  },
                }}
              >
                {/* Top Corner Ambient Glow */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: '-30%',
                    right: '-30%',
                    width: '180px',
                    height: '180px',
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${theme.glowColor} 0%, rgba(0,0,0,0) 70%)`,
                    pointerEvents: 'none',
                  }}
                />

                {/* Card Top: 3D Shield Badge + Verified Status */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 2 }}>
                  {/* 3D Shield Plaque Badge */}
                  <Box
                    className="badge-shield"
                    sx={{
                      width: 64,
                      height: 70,
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'transform 0.3s ease',
                      filter: `drop-shadow(0 6px 14px ${theme.glowColor})`,
                    }}
                  >
                    {/* Outer Hexagon Shield Layer */}
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        background: theme.badgeGradient,
                        clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                      }}
                    />
                    {/* Glossy Top Glass Bevel */}
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: '2.5px',
                        background:
                          'linear-gradient(180deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.08) 45%, rgba(0,0,0,0.3) 100%)',
                        clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                      }}
                    />
                    <Typography
                      sx={{
                        position: 'relative',
                        zIndex: 2,
                        fontSize: '0.95rem',
                        fontWeight: 900,
                        color: '#FFFFFF',
                        lineHeight: 1,
                        textShadow: '0 2px 6px rgba(0, 0, 0, 0.5)',
                      }}
                    >
                      {cert.badgeCode}
                    </Typography>
                    <Typography
                      sx={{
                        position: 'relative',
                        zIndex: 2,
                        fontSize: '0.55rem',
                        fontWeight: 800,
                        color: '#E2E8F0',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        mt: 0.25,
                      }}
                    >
                      {cert.language.split(' ')[0]}
                    </Typography>
                  </Box>

                  {/* Rating & Pulsing Verified Badge */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.75 }}>
                    <Box sx={{ display: 'flex', gap: 0.3, color: '#FBBF24' }}>
                      {[...Array(cert.stars || 3)].map((_, i) => (
                        <StarRoundedIcon key={i} sx={{ fontSize: 17, filter: 'drop-shadow(0 0 4px rgba(251, 191, 36, 0.4))' }} />
                      ))}
                    </Box>

                    <Chip
                      icon={
                        <Box
                          sx={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            bgcolor: '#34D399',
                            boxShadow: '0 0 8px #34D399',
                            ml: 0.5,
                          }}
                        />
                      }
                      label="VERIFIED"
                      size="small"
                      sx={{
                        bgcolor: 'rgba(16, 185, 129, 0.15)',
                        border: '1px solid rgba(52, 211, 153, 0.35)',
                        color: '#34D399',
                        fontWeight: 800,
                        fontSize: '0.68rem',
                        height: 22,
                        borderRadius: '6px',
                        letterSpacing: '0.04em',
                      }}
                    />
                  </Box>
                </Box>

                {/* Card Body: Title & Details */}
                <Box sx={{ position: 'relative', zIndex: 2 }}>
                  <Typography
                    sx={{
                      fontWeight: 900,
                      color: '#F8FAFC',
                      fontSize: '1.15rem',
                      lineHeight: 1.3,
                      mb: 0.75,
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {cert.title}
                  </Typography>

                  <Typography sx={{ fontSize: '0.78rem', color: '#94A3B8', mb: 2 }}>
                    Techlearns Academy • {cert.issueDate} • {cert.validUntil || 'Lifetime'}
                  </Typography>

                  {/* Performance HUD Display */}
                  {cert.score && (
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: '14px',
                        bgcolor: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        backdropFilter: 'blur(8px)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 2,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <CheckCircleRoundedIcon sx={{ fontSize: 16, color: '#34D399' }} />
                        <Typography sx={{ fontSize: '0.8rem', fontWeight: 800, color: '#F8FAFC' }}>
                          Score: <span style={{ color: '#34D399' }}>{cert.score}</span>
                        </Typography>
                      </Box>
                      {cert.percentile && (
                        <Typography sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#FBBF24' }}>
                          {cert.percentile}
                        </Typography>
                      )}
                    </Box>
                  )}

                  {/* Assessed Skills Pills */}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>
                    {cert.skills?.slice(0, 3).map((skill, idx) => (
                      <Chip
                        key={idx}
                        label={skill}
                        size="small"
                        sx={{
                          bgcolor: theme.tagBg,
                          border: `1px solid ${theme.neonBorder}`,
                          color: '#E2E8F0',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          height: 24,
                          borderRadius: '8px',
                        }}
                      />
                    ))}
                    {(cert.skills?.length || 0) > 3 && (
                      <Chip
                        label={`+${(cert.skills?.length || 0) - 3} more`}
                        size="small"
                        sx={{
                          bgcolor: 'rgba(255, 255, 255, 0.06)',
                          color: '#94A3B8',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          height: 24,
                          borderRadius: '8px',
                        }}
                      />
                    )}
                  </Box>
                </Box>

                {/* Card Footer: Credential ID Vault & Action Button */}
                <Box
                  sx={{
                    pt: 2,
                    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    position: 'relative',
                    zIndex: 2,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography
                      sx={{
                        fontSize: '0.78rem',
                        fontFamily: 'monospace',
                        fontWeight: 800,
                        color: theme.accent,
                        letterSpacing: '0.04em',
                      }}
                    >
                      {cert.credentialId}
                    </Typography>
                    <Tooltip title="Copy Credential ID" arrow>
                      <IconButton
                        size="small"
                        onClick={(e) => handleCopyId(cert, e)}
                        sx={{ p: 0.25, color: '#64748B', '&:hover': { color: theme.accent } }}
                      >
                        <ContentCopyRoundedIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  <Button
                    className="view-btn"
                    size="small"
                    endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: 15 }} />}
                    onClick={(e) => handleViewCert(cert, e)}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 800,
                      fontSize: '0.8rem',
                      color: theme.accent,
                      bgcolor: 'rgba(255, 255, 255, 0.04)',
                      border: `1px solid ${theme.neonBorder}`,
                      borderRadius: '10px',
                      px: 1.5,
                      py: 0.4,
                      transition: 'all 0.2s',
                    }}
                  >
                    View Details
                  </Button>
                </Box>
              </Card>
            );
          })}
        </Box>
      )}

      {/* 4. Complete Pop-up Modal of Whole Data */}
      {selectedCert && (
        <ViewCertificateModal
          open={certModalOpen}
          cert={selectedCert}
          studentName="Alex Mercer (Student)"
          onClose={() => setCertModalOpen(false)}
        />
      )}
    </Box>
  );
}
