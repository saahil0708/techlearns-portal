'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Box,
  Typography,
  Card,
  Chip,
  Button,
  Tooltip,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  Dialog,
  DialogContent,
} from '@mui/material';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import PsychologyRoundedIcon from '@mui/icons-material/PsychologyRounded';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import TimelineRoundedIcon from '@mui/icons-material/TimelineRounded';
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import BusinessCenterOutlinedIcon from '@mui/icons-material/BusinessCenterOutlined';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';

import dynamic from 'next/dynamic';
import { StudentProfileData, RoleTargetProfile } from '@/types/student-profile';
import { apiService } from '@/lib/api-service';

const IdentityDiagnosticWizard = dynamic(
  () => import('@/components/students/diagnostic/IdentityDiagnosticWizard'),
  { ssr: false }
);

interface GrowthMetricsAndRoleReadinessProps {
  profile: StudentProfileData;
  isOwner?: boolean;
  onOpenEvidenceGraph?: () => void;
}

const DEFAULT_ROLE_TARGETS: RoleTargetProfile[] = [
  {
    id: 'fullstack-engineer',
    roleTitle: 'Full-Stack Software Engineer',
    badge: 'Enterprise Tier',
    description: 'React/Next.js frontend systems, NestJS/Node APIs, relational DBs, and secure deployment pipelines.',
    benchmarkScore: 85,
    competencies: [
      {
        name: 'SSR & Frontend Architecture',
        category: 'Frontend',
        requiredLevel: 85,
        currentLevel: 90,
        status: 'mastered',
        evidenceCount: 14,
        nextDrillTitle: 'React Server Actions & Hydration Optimization',
        nextDrillSlug: 'react-server-actions-optimization',
      },
      {
        name: 'REST & GraphQL API Design',
        category: 'Backend',
        requiredLevel: 80,
        currentLevel: 82,
        status: 'mastered',
        evidenceCount: 11,
        nextDrillTitle: 'Rate Limiting & Token Bucket Algorithms',
        nextDrillSlug: 'rate-limiting-token-bucket',
      },
      {
        name: 'Database Indexing & Transactions',
        category: 'Data',
        requiredLevel: 80,
        currentLevel: 68,
        status: 'progressing',
        evidenceCount: 5,
        nextDrillTitle: 'PostgreSQL Isolation Levels & Deadlock Prevention',
        nextDrillSlug: 'postgres-isolation-deadlocks',
      },
      {
        name: 'Algorithmic Problem Solving (DSA)',
        category: 'Core',
        requiredLevel: 75,
        currentLevel: 84,
        status: 'mastered',
        evidenceCount: 42,
        nextDrillTitle: 'Dynamic Programming on Trees',
        nextDrillSlug: 'tree-dp-optimizations',
      },
      {
        name: 'Containerization & CI/CD Telemetry',
        category: 'DevOps',
        requiredLevel: 70,
        currentLevel: 45,
        status: 'gap',
        evidenceCount: 2,
        nextDrillTitle: 'Docker Multi-stage Builds & Healthchecks',
        nextDrillSlug: 'docker-multistage-builds',
      },
    ],
  },
  {
    id: 'backend-systems',
    roleTitle: 'Backend & Distributed Systems',
    badge: 'High Scale',
    description: 'Microservices, BullMQ message queues, Redis caching, Postgres optimization, and fault tolerance.',
    benchmarkScore: 90,
    competencies: [
      {
        name: 'Asynchronous Queues & Event Streaming',
        category: 'Backend',
        requiredLevel: 85,
        currentLevel: 78,
        status: 'progressing',
        evidenceCount: 8,
        nextDrillTitle: 'BullMQ Backoff & Dead-Letter Handling',
        nextDrillSlug: 'bullmq-backoff-retry',
      },
      {
        name: 'Distributed Concurrency & Locks',
        category: 'Systems',
        requiredLevel: 85,
        currentLevel: 62,
        status: 'gap',
        evidenceCount: 3,
        nextDrillTitle: 'Redis Redlock Distributed Locking Algorithm',
        nextDrillSlug: 'redis-redlock-implementation',
      },
      {
        name: 'Database Schema Normalization & Query Plans',
        category: 'Data',
        requiredLevel: 90,
        currentLevel: 75,
        status: 'progressing',
        evidenceCount: 9,
        nextDrillTitle: 'EXPLAIN ANALYZE Index Optimization',
        nextDrillSlug: 'postgres-query-optimization',
      },
      {
        name: 'System Design & Horizontal Scalability',
        category: 'Architecture',
        requiredLevel: 80,
        currentLevel: 70,
        status: 'progressing',
        evidenceCount: 4,
        nextDrillTitle: 'Consistent Hashing & Partitioning',
        nextDrillSlug: 'consistent-hashing-design',
      },
    ],
  },
  {
    id: 'competitive-dsa',
    roleTitle: 'Algorithmic & Problem Solving Specialist',
    badge: 'Codeforces / LeetCode Track',
    description: 'Graph theory, dynamic programming, segment trees, computational geometry, and contest execution.',
    benchmarkScore: 92,
    competencies: [
      {
        name: 'Dynamic Programming & Memoization',
        category: 'Algorithms',
        requiredLevel: 90,
        currentLevel: 92,
        status: 'mastered',
        evidenceCount: 36,
        nextDrillTitle: 'Digit DP and Bitmask DP Drills',
        nextDrillSlug: 'digit-dp-drills',
      },
      {
        name: 'Graph Algorithms & Flow Networks',
        category: 'Algorithms',
        requiredLevel: 85,
        currentLevel: 88,
        status: 'mastered',
        evidenceCount: 29,
        nextDrillTitle: 'Dinic Algorithm for Maximum Bipartite Matching',
        nextDrillSlug: 'dinic-max-flow',
      },
      {
        name: 'Range Queries & Segment Trees',
        category: 'Data Structures',
        requiredLevel: 85,
        currentLevel: 60,
        status: 'gap',
        evidenceCount: 4,
        nextDrillTitle: 'Lazy Propagation on Segment Trees',
        nextDrillSlug: 'segment-tree-lazy-propagation',
      },
      {
        name: 'Number Theory & Modular Arithmetic',
        category: 'Math',
        requiredLevel: 80,
        currentLevel: 84,
        status: 'mastered',
        evidenceCount: 18,
        nextDrillTitle: 'Matrix Exponentiation for Recurrences',
        nextDrillSlug: 'matrix-exponentiation',
      },
    ],
  },
];

// Circular SVG Filling Gauge
function CircularMetricGauge({
  percentage,
  size = 64,
  strokeWidth = 5.5,
  color = '#2563EB',
  label,
}: {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, percentage)) / 100) * circumference;

  return (
    <Box sx={{ position: 'relative', width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#EEF2F6"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <Box sx={{ position: 'absolute', textAlign: 'center' }}>
        <Typography sx={{ fontWeight: 800, fontSize: '0.82rem', color: '#0F172A', lineHeight: 1 }}>
          {label || `${percentage}%`}
        </Typography>
      </Box>
    </Box>
  );
}

export default function GrowthMetricsAndRoleReadiness({
  profile,
  isOwner = true,
  onOpenEvidenceGraph,
}: GrowthMetricsAndRoleReadinessProps) {
  const [selectedRoleId, setSelectedRoleId] = useState<string>('fullstack-engineer');
  const [diagnosticModalOpen, setDiagnosticModalOpen] = useState<boolean>(false);

  const currentRoleTarget =
    DEFAULT_ROLE_TARGETS.find((r) => r.id === selectedRoleId) || DEFAULT_ROLE_TARGETS[0];

  const avgCompetency = Math.round(
    currentRoleTarget.competencies.reduce((acc, c) => acc + c.currentLevel, 0) /
      currentRoleTarget.competencies.length
  );
  const readinessPct = Math.min(100, Math.round((avgCompetency / currentRoleTarget.benchmarkScore) * 100));

  const hasVerifiedGrowth = Boolean(profile.growthMetrics);

  const growth = profile.growthMetrics || {
    masteryIndex: Math.min(96, Math.max(45, Math.round(((profile.solvedMedium || 0) * 1.5 + (profile.solvedHard || 0) * 3) / 2 + 30))),
    masteryTrend: 'rising' as const,
    practiceConsistencyPct: Math.min(98, Math.max(50, 70 + ((profile.currentStreakDays || 0) > 5 ? 20 : 5))),
    consistencyHealth: 'optimal' as const,
    projectEvidenceScore: 88,
    verifiedArtifactsCount: (profile.solvedTotal || 0) > 0 ? Math.min(profile.solvedTotal || 0, 18) : 0,
    feedbackImprovementRate: 34,
    evidenceBackedPct: (profile.solvedTotal || 0) > 0 ? 85 : 0,
  };

  const gapCount = currentRoleTarget.competencies.filter((c) => c.status === 'gap').length;
  const progressingCount = currentRoleTarget.competencies.filter((c) => c.status === 'progressing').length;
  const masteredCount = currentRoleTarget.competencies.filter((c) => c.status === 'mastered').length;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* ========================================================================= */}
      {/* SECTION 1: 10.1 DASHBOARD PHILOSOPHY (GROWTH TELEMETRY - LIGHT THEME) */}
      {/* ========================================================================= */}
      <Card
        elevation={0}
        sx={{
          borderRadius: '24px',
          bgcolor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          p: { xs: 2.5, sm: 3.5 },
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
        }}
      >
        {/* Top Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 1.5,
            mb: 3,
          }}
        >
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 0.5, flexWrap: 'wrap' }}>
              <Box
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: '10px',
                  bgcolor: '#EFF6FF',
                  color: '#2563EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <PsychologyRoundedIcon sx={{ fontSize: 18 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.15rem' }}>
                {hasVerifiedGrowth ? 'Verified Growth Telemetry' : 'Growth Telemetry (Sample Baseline)'}
              </Typography>
              {!hasVerifiedGrowth && (
                <Chip
                  label="Sample Benchmark"
                  size="small"
                  sx={{
                    bgcolor: '#FFFBEB',
                    color: '#B45309',
                    border: '1px solid #FDE68A',
                    fontWeight: 800,
                    fontSize: '0.68rem',
                    height: 20,
                  }}
                />
              )}
              <Tooltip title="Calculated from difficulty-weighted problem depth, spaced retention velocity, and verifiable artifacts.">
                <IconButton size="small" sx={{ color: '#94A3B8', p: 0.5 }}>
                  <InfoOutlinedIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            </Box>
            <Typography sx={{ color: '#64748B', fontSize: '0.82rem' }}>
              Auditable competency signals evaluated across algorithms, system builds, and rubric calibrations.
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, flexWrap: 'wrap' }}>
            {isOwner && (
              <Button
                size="small"
                variant="contained"
                onClick={() => setDiagnosticModalOpen(true)}
                startIcon={<AutoAwesomeRoundedIcon sx={{ fontSize: 16 }} />}
                sx={{
                  bgcolor: '#2563EB',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  textTransform: 'none',
                  borderRadius: '10px',
                  fontSize: '0.8rem',
                  py: 0.7,
                  px: 1.8,
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
                  '&:hover': { bgcolor: '#1D4ED8' },
                }}
              >
                Run Diagnostic
              </Button>
            )}
            <Chip
              icon={<VerifiedRoundedIcon sx={{ fontSize: 15, color: hasVerifiedGrowth ? '#059669 !important' : '#D97706 !important' }} />}
              label={hasVerifiedGrowth ? `${growth.evidenceBackedPct}% Evidence Backed` : 'Sample Calibration'}
              size="small"
              sx={{
                bgcolor: hasVerifiedGrowth ? '#ECFDF5' : '#FFFBEB',
                color: hasVerifiedGrowth ? '#047857' : '#B45309',
                fontWeight: 800,
                fontSize: '0.74rem',
                border: `1px solid ${hasVerifiedGrowth ? '#A7F3D0' : '#FDE68A'}`,
              }}
            />
          </Box>
        </Box>

        {/* 4 Growth Circular Cards */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
            gap: 2.5,
          }}
        >
          {/* Growth Card 1: Skill Mastery Index */}
          <Box
            sx={{
              p: 2.5,
              borderRadius: '18px',
              bgcolor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            <Box>
              <Typography sx={{ color: '#64748B', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', mb: 0.5 }}>
                Skill Mastery Index
              </Typography>
              <Typography sx={{ fontSize: '1.35rem', fontWeight: 900, color: '#0F172A', lineHeight: 1.1, mb: 0.5 }}>
                {growth.masteryIndex} <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>/100</span>
              </Typography>
              <Typography sx={{ color: '#16A34A', fontSize: '0.72rem', fontWeight: 700 }}>
                High Tier • Rising
              </Typography>
            </Box>
            <CircularMetricGauge percentage={growth.masteryIndex} color="#2563EB" />
          </Box>

          {/* Growth Card 2: Practice Consistency */}
          <Box
            sx={{
              p: 2.5,
              borderRadius: '18px',
              bgcolor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            <Box>
              <Typography sx={{ color: '#64748B', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', mb: 0.5 }}>
                Practice Consistency
              </Typography>
              <Typography sx={{ fontSize: '1.35rem', fontWeight: 900, color: '#0F172A', lineHeight: 1.1, mb: 0.5 }}>
                {growth.practiceConsistencyPct}%
              </Typography>
              <Typography sx={{ color: '#16A34A', fontSize: '0.72rem', fontWeight: 700 }}>
                Spaced Retention
              </Typography>
            </Box>
            <CircularMetricGauge percentage={growth.practiceConsistencyPct} color="#16A34A" />
          </Box>

          {/* Growth Card 3: Quality of Project Evidence */}
          <Box
            sx={{
              p: 2.5,
              borderRadius: '18px',
              bgcolor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            <Box>
              <Typography sx={{ color: '#64748B', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', mb: 0.5 }}>
                Project Evidence
              </Typography>
              <Typography sx={{ fontSize: '1.35rem', fontWeight: 900, color: '#0F172A', lineHeight: 1.1, mb: 0.5 }}>
                {growth.projectEvidenceScore} <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>/100</span>
              </Typography>
              <Typography sx={{ color: '#D97706', fontSize: '0.72rem', fontWeight: 700 }}>
                {growth.verifiedArtifactsCount} Verified Repos
              </Typography>
            </Box>
            <CircularMetricGauge percentage={growth.projectEvidenceScore} color="#D97706" />
          </Box>

          {/* Growth Card 4: Improvement After Feedback */}
          <Box
            sx={{
              p: 2.5,
              borderRadius: '18px',
              bgcolor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            <Box>
              <Typography sx={{ color: '#64748B', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', mb: 0.5 }}>
                Feedback Velocity
              </Typography>
              <Typography sx={{ fontSize: '1.35rem', fontWeight: 900, color: '#7C3AED', lineHeight: 1.1, mb: 0.5 }}>
                +{growth.feedbackImprovementRate}%
              </Typography>
              <Typography sx={{ color: '#7C3AED', fontSize: '0.72rem', fontWeight: 700 }}>
                Post-Review Boost
              </Typography>
            </Box>
            <CircularMetricGauge percentage={growth.feedbackImprovementRate} color="#7C3AED" label={`+${growth.feedbackImprovementRate}%`} />
          </Box>
        </Box>
      </Card>

      {/* ========================================================================= */}
      {/* SECTION 2: ROLE READINESS & COMPETENCY MAP (LIGHT THEME) */}
      {/* ========================================================================= */}
      <Card
        elevation={0}
        sx={{
          borderRadius: '24px',
          bgcolor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          p: { xs: 2.5, sm: 3.5 },
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
        }}
      >
        {/* Header with Role Selector */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
            mb: 3,
            pb: 2.5,
            borderBottom: '1px solid #E2E8F0',
          }}
        >
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 0.5, flexWrap: 'wrap' }}>
              <Box
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: '10px',
                  bgcolor: '#EFF6FF',
                  color: '#2563EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <BusinessCenterOutlinedIcon sx={{ fontSize: 18 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.15rem' }}>
                {profile.roleReadiness?.targetRole === currentRoleTarget.roleTitle ? 'Target Role Readiness & Competency Map' : 'Target Role Readiness & Competency Map (Benchmark Model)'}
              </Typography>
              {profile.roleReadiness?.targetRole !== currentRoleTarget.roleTitle && (
                <Chip
                  label="Sample Benchmark Model"
                  size="small"
                  sx={{
                    bgcolor: '#FFFBEB',
                    color: '#B45309',
                    border: '1px solid #FDE68A',
                    fontWeight: 800,
                    fontSize: '0.68rem',
                    height: 20,
                  }}
                />
              )}
            </Box>
            <Typography sx={{ color: '#64748B', fontSize: '0.82rem' }}>
              Compare your verified competencies against industry hiring benchmarks and identify readiness gaps.
            </Typography>
          </Box>

          {/* Role Dropdown Selector */}
          <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 280 } }}>
            <Select
              value={selectedRoleId}
              onChange={(e) => setSelectedRoleId(e.target.value)}
              sx={{
                bgcolor: '#F8FAFC',
                color: '#0F172A',
                borderRadius: '12px',
                border: '1px solid #CBD5E1',
                fontSize: '0.88rem',
                fontWeight: 700,
                '& .MuiSelect-icon': { color: '#2563EB' },
                '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
              }}
            >
              {DEFAULT_ROLE_TARGETS.map((target) => (
                <MenuItem key={target.id} value={target.id} sx={{ fontSize: '0.88rem', fontWeight: 600 }}>
                  {target.roleTitle}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Role Overview Bar */}
        <Box
          sx={{
            p: 2.5,
            borderRadius: '18px',
            bgcolor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            mb: 3,
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
            gap: 2.5,
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.05rem' }}>
                {currentRoleTarget.roleTitle}
              </Typography>
              <Chip
                label={currentRoleTarget.badge}
                size="small"
                sx={{
                  bgcolor: '#EFF6FF',
                  color: '#2563EB',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  height: 22,
                  border: '1px solid #BFDBFE',
                }}
              />
            </Box>
            <Typography sx={{ color: '#64748B', fontSize: '0.82rem', lineHeight: 1.45 }}>
              {currentRoleTarget.description}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
            <CircularMetricGauge
              percentage={readinessPct}
              size={68}
              strokeWidth={6}
              color={readinessPct >= 80 ? '#16A34A' : '#D97706'}
            />
            <Box>
              <Typography sx={{ color: '#64748B', fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase' }}>
                Role Fit Match
              </Typography>
              <Typography sx={{ color: readinessPct >= 80 ? '#15803D' : '#B45309', fontWeight: 800, fontSize: '0.95rem' }}>
                {readinessPct}% Ready
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Competencies Circular Cards Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: 2.5,
          }}
        >
          {currentRoleTarget.competencies.map((comp, idx) => {
            const isMastered = comp.status === 'mastered';
            const isGap = comp.status === 'gap';

            return (
              <Box
                key={idx}
                sx={{
                  p: 2.5,
                  borderRadius: '18px',
                  bgcolor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 2,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: '#FFFFFF',
                    borderColor: '#CBD5E1',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.04)',
                  },
                }}
              >
                {/* Left Circular Gauge */}
                <CircularMetricGauge
                  percentage={comp.currentLevel}
                  size={64}
                  strokeWidth={5.5}
                  color={isMastered ? '#16A34A' : isGap ? '#DC2626' : '#D97706'}
                />

                {/* Center Content */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ color: '#0F172A', fontWeight: 700, fontSize: '0.9rem', mb: 0.3 }} noWrap>
                    {comp.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Chip
                      label={comp.category}
                      size="small"
                      sx={{ bgcolor: '#FFFFFF', color: '#64748B', fontWeight: 600, fontSize: '0.7rem', height: 20, border: '1px solid #E2E8F0' }}
                    />
                    <Typography sx={{ color: '#2563EB', fontSize: '0.74rem', fontWeight: 700 }}>
                      {comp.evidenceCount} Evidences
                    </Typography>
                  </Box>
                </Box>

                {/* Right Status Badge / Action */}
                <Box sx={{ textAlign: 'right' }}>
                  <Chip
                    icon={
                      isMastered ? (
                        <CheckCircleRoundedIcon sx={{ fontSize: 14, color: '#15803D !important' }} />
                      ) : isGap ? (
                        <WarningAmberRoundedIcon sx={{ fontSize: 14, color: '#DC2626 !important' }} />
                      ) : (
                        <TrendingUpRoundedIcon sx={{ fontSize: 14, color: '#B45309 !important' }} />
                      )
                    }
                    label={isMastered ? 'Ready' : isGap ? 'Gap' : 'In Progress'}
                    size="small"
                    sx={{
                      bgcolor: isMastered ? '#DCFCE7' : isGap ? '#FEE2E2' : '#FEF3C7',
                      color: isMastered ? '#15803D' : isGap ? '#B91C1C' : '#B45309',
                      fontWeight: 800,
                      fontSize: '0.72rem',
                      mb: comp.nextDrillSlug && !isMastered ? 0.8 : 0,
                    }}
                  />

                  {comp.nextDrillSlug && !isMastered && (
                    <Box sx={{ mt: 0.5 }}>
                      <Link href={`/practice?topic=${comp.category.toLowerCase()}`} style={{ textDecoration: 'none' }}>
                        <Button
                          size="small"
                          variant="outlined"
                          sx={{
                            color: '#2563EB',
                            borderColor: '#BFDBFE',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            textTransform: 'none',
                            borderRadius: '8px',
                            py: 0.2,
                            px: 1,
                            '&:hover': { bgcolor: '#EFF6FF', borderColor: '#2563EB' },
                          }}
                        >
                          Bridge Gap
                        </Button>
                      </Link>
                    </Box>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>

        {/* Footer Summary */}
        <Box
          sx={{
            mt: 3,
            pt: 2.5,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 1.5,
            borderTop: '1px solid #E2E8F0',
          }}
        >
          <Box sx={{ display: 'flex', gap: 2, fontSize: '0.82rem' }}>
            <Typography sx={{ color: '#15803D', fontWeight: 800 }}>
              {masteredCount} Competencies Ready
            </Typography>
            <Typography sx={{ color: '#CBD5E1' }}>•</Typography>
            <Typography sx={{ color: '#B45309', fontWeight: 800 }}>
              {progressingCount} Progressing
            </Typography>
            <Typography sx={{ color: '#CBD5E1' }}>•</Typography>
            <Typography sx={{ color: '#B91C1C', fontWeight: 800 }}>
              {gapCount} Skill Gaps
            </Typography>
          </Box>

          <Link href="/students/skill-graph" style={{ textDecoration: 'none' }}>
            <Button
              size="small"
              sx={{
                color: '#2563EB',
                fontWeight: 800,
                fontSize: '0.82rem',
                textTransform: 'none',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              Explore Full Interactive Skill & Evidence Graph →
            </Button>
          </Link>
        </Box>
      </Card>

      {/* Recalibrate Modal Dialog */}
      <Dialog
        open={diagnosticModalOpen}
        onClose={() => setDiagnosticModalOpen(false)}
        maxWidth="lg"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              bgcolor: 'transparent',
              boxShadow: 'none',
              backgroundImage: 'none',
            },
          },
        }}
      >
        <DialogContent sx={{ p: 0 }}>
          <IdentityDiagnosticWizard
            userId={profile.id}
            isModal={true}
            onClose={() => setDiagnosticModalOpen(false)}
            onComplete={(report) => {
              if (typeof window !== 'undefined' && profile.id) {
                try {
                  localStorage.setItem(`codeplatform_diagnostic_goal_${profile.id}`, JSON.stringify(report));
                } catch {}
              }
              setDiagnosticModalOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
}
