'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Box,
  Typography,
  Chip,
  Button,
  LinearProgress,
  IconButton,
  Drawer,
  Divider,
} from '@mui/material';

// Icons
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import HourglassTopRoundedIcon from '@mui/icons-material/HourglassTopRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import DataObjectRoundedIcon from '@mui/icons-material/DataObjectRounded';
import StorageRoundedIcon from '@mui/icons-material/StorageRounded';
import ApiRoundedIcon from '@mui/icons-material/ApiRounded';
import DevicesRoundedIcon from '@mui/icons-material/DevicesRounded';
import SpeedRoundedIcon from '@mui/icons-material/SpeedRounded';
import CloudQueueRoundedIcon from '@mui/icons-material/CloudQueueRounded';
import DnsRoundedIcon from '@mui/icons-material/DnsRounded';
import LayersRoundedIcon from '@mui/icons-material/LayersRounded';
import PsychologyRoundedIcon from '@mui/icons-material/PsychologyRounded';
import HubRoundedIcon from '@mui/icons-material/HubRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import EastRoundedIcon from '@mui/icons-material/EastRounded';
import { FluidArrowRight } from '@/utils/fluid_arrow';

export interface SkillNode {
  id: string;
  title: string;
  category: string;
  stageIndex: number;
  stageName: string;
  status: 'MASTERED' | 'IN_PROGRESS' | 'LOCKED';
  masteryPct: number;
  solvedCount: number;
  totalCount: number;
  iconType: 'dsa' | 'sql' | 'api' | 'react' | 'queue' | 'sysdesign' | 'grpc' | 'k8s';
  description: string;
  prerequisites: string[];
  unlocks: string[];
  recommendedProblems: { title: string; difficulty: 'Easy' | 'Medium' | 'Hard'; slug: string; xp: number }[];
  keyCompetencies: string[];
}

const ROLES = [
  { id: 'fullstack', label: 'Full-Stack Engineer', icon: <LayersRoundedIcon sx={{ fontSize: 16 }} />, targetScore: 88, completedSkills: 18, totalSkills: 24 },
  { id: 'backend', label: 'Backend Architect', icon: <StorageRoundedIcon sx={{ fontSize: 16 }} />, targetScore: 68, completedSkills: 14, totalSkills: 22 },
  { id: 'aiml', label: 'AI / ML Engineer', icon: <PsychologyRoundedIcon sx={{ fontSize: 16 }} />, targetScore: 54, completedSkills: 11, totalSkills: 20 },
  { id: 'devops', label: 'DevOps & Cloud', icon: <CloudQueueRoundedIcon sx={{ fontSize: 16 }} />, targetScore: 45, completedSkills: 9, totalSkills: 19 },
];

const STAGES = [
  {
    index: 1,
    title: 'Stage 01: Foundations',
    subtitle: 'Algorithms & Data Persistence',
    color: '#059669',
    bgColor: '#ECFDF5',
  },
  {
    index: 2,
    title: 'Stage 02: Core Stack',
    subtitle: 'APIs, React & Concurrency',
    color: '#2563EB',
    bgColor: '#EFF6FF',
  },
  {
    index: 3,
    title: 'Stage 03: Systems & Scale',
    subtitle: 'Architecture & Microservices',
    color: '#7C3AED',
    bgColor: '#F5F3FF',
  },
  {
    index: 4,
    title: 'Stage 04: Production',
    subtitle: 'Kubernetes & Reliability',
    color: '#D97706',
    bgColor: '#FFFBEB',
  },
];

const SKILL_NODES: SkillNode[] = [
  // Stage 1
  {
    id: 'dsa-core',
    title: 'Data Structures & Algorithms',
    category: 'Computer Science Core',
    stageIndex: 1,
    stageName: 'Foundations',
    status: 'MASTERED',
    masteryPct: 94,
    solvedCount: 180,
    totalCount: 190,
    iconType: 'dsa',
    description: 'Arrays, Two Pointers, Trees, Graphs, Dynamic Programming and asymptotic efficiency.',
    prerequisites: ['Basic Programming'],
    unlocks: ['REST & GraphQL APIs', 'High-Scale System Design'],
    keyCompetencies: ['Asymptotic Complexity', 'Graph Traversals (BFS/DFS)', 'Dynamic Programming'],
    recommendedProblems: [
      { title: 'Two Sum & Fast Target Lookups', difficulty: 'Easy', slug: 'two-sum', xp: 50 },
      { title: 'Lowest Common Ancestor in BST', difficulty: 'Medium', slug: 'lca-bst', xp: 120 },
    ],
  },
  {
    id: 'sql-db',
    title: 'Relational DBs & SQL Optimization',
    category: 'Data Persistence',
    stageIndex: 1,
    stageName: 'Foundations',
    status: 'MASTERED',
    masteryPct: 90,
    solvedCount: 45,
    totalCount: 50,
    iconType: 'sql',
    description: 'Relational schema design, ACID transactions, complex JOINs, B-Tree indexes, and execution plans.',
    prerequisites: ['Relational Model'],
    unlocks: ['REST & GraphQL APIs', 'Asynchronous Queues & Concurrency'],
    keyCompetencies: ['B-Tree Indexing Strategies', 'ACID Transactions', 'Execution Plans'],
    recommendedProblems: [
      { title: 'Nth Highest Salary Window Query', difficulty: 'Medium', slug: 'nth-highest-salary', xp: 100 },
    ],
  },

  // Stage 2
  {
    id: 'api-arch',
    title: 'REST & GraphQL APIs',
    category: 'Backend Engineering',
    stageIndex: 2,
    stageName: 'Core Stack',
    status: 'MASTERED',
    masteryPct: 88,
    solvedCount: 38,
    totalCount: 42,
    iconType: 'api',
    description: 'Idempotency, JWT authentication, rate limiting, OpenAPI specifications, and schema stitching.',
    prerequisites: ['Data Structures & Algorithms', 'Relational DBs & SQL Optimization'],
    unlocks: ['Asynchronous Queues & Concurrency', 'React 19 & Next.js App Router'],
    keyCompetencies: ['Idempotency Keys', 'Token Bucket Rate Limiting', 'GraphQL Resolvers'],
    recommendedProblems: [
      { title: 'Rate Limiter Token Bucket Engine', difficulty: 'Medium', slug: 'rate-limiter', xp: 140 },
    ],
  },
  {
    id: 'react-next',
    title: 'React 19 & Next.js App Router',
    category: 'Frontend Engineering',
    stageIndex: 2,
    stageName: 'Core Stack',
    status: 'IN_PROGRESS',
    masteryPct: 76,
    solvedCount: 28,
    totalCount: 36,
    iconType: 'react',
    description: 'Server Components vs Client Components, Suspense streaming, optimistic updates, and Zustand state.',
    prerequisites: ['REST & GraphQL APIs'],
    unlocks: ['High-Scale System Design'],
    keyCompetencies: ['Server vs Client Component Boundaries', 'Suspense Streaming', 'Optimistic UI'],
    recommendedProblems: [
      { title: 'Virtual Scrolling Window Table', difficulty: 'Hard', slug: 'virtual-scroll', xp: 230 },
    ],
  },
  {
    id: 'async-concurrency',
    title: 'Asynchronous Queues & Concurrency',
    category: 'Distributed Systems',
    stageIndex: 2,
    stageName: 'Core Stack',
    status: 'IN_PROGRESS',
    masteryPct: 62,
    solvedCount: 16,
    totalCount: 26,
    iconType: 'queue',
    description: 'Event loops, worker pools, Redis Pub/Sub, BullMQ job queues, and distributed locks.',
    prerequisites: ['REST & GraphQL APIs', 'Relational DBs & SQL Optimization'],
    unlocks: ['High-Scale System Design', 'gRPC & Microservices Mesh'],
    keyCompetencies: ['BullMQ Concurrency', 'Redis Distributed Redlock', 'DLQ Handlers'],
    recommendedProblems: [
      { title: 'Distributed Mutex Redlock Coordinator', difficulty: 'Hard', slug: 'distributed-lock', xp: 260 },
    ],
  },

  // Stage 3
  {
    id: 'sys-design',
    title: 'High-Scale System Design',
    category: 'Architecture',
    stageIndex: 3,
    stageName: 'Systems & Scale',
    status: 'IN_PROGRESS',
    masteryPct: 48,
    solvedCount: 12,
    totalCount: 25,
    iconType: 'sysdesign',
    description: 'Caching tiers, CDN invalidation, database sharding, horizontal scaling, and CAP theorem trade-offs.',
    prerequisites: ['Asynchronous Queues & Concurrency', 'React 19 & Next.js App Router'],
    unlocks: ['gRPC & Microservices Mesh', 'Docker & Kubernetes Orchestration'],
    keyCompetencies: ['Consistent Hashing Rings', 'Cache Aside Patterns', 'Database Sharding'],
    recommendedProblems: [
      { title: 'High-Throughput URL Shortener', difficulty: 'Medium', slug: 'url-shortener', xp: 180 },
    ],
  },
  {
    id: 'grpc-microservices',
    title: 'gRPC & Microservices Mesh',
    category: 'Architecture',
    stageIndex: 3,
    stageName: 'Systems & Scale',
    status: 'LOCKED',
    masteryPct: 0,
    solvedCount: 0,
    totalCount: 20,
    iconType: 'grpc',
    description: 'Protobuf serialization, HTTP/2 streaming, service discovery, circuit breakers, and OpenTelemetry tracing.',
    prerequisites: ['High-Scale System Design', 'Asynchronous Queues & Concurrency'],
    unlocks: ['Docker & Kubernetes Orchestration'],
    keyCompetencies: ['Protobuf Schemas', 'HTTP/2 Streaming', 'Circuit Breakers'],
    recommendedProblems: [
      { title: 'gRPC Bidirectional Streamer', difficulty: 'Hard', slug: 'grpc-pipeline', xp: 280 },
    ],
  },

  // Stage 4
  {
    id: 'k8s-docker',
    title: 'Docker & Kubernetes Orchestration',
    category: 'DevOps & Cloud',
    stageIndex: 4,
    stageName: 'Production',
    status: 'LOCKED',
    masteryPct: 0,
    solvedCount: 0,
    totalCount: 18,
    iconType: 'k8s',
    description: 'Rootless container isolation, cgroups/namespaces security limits, Helm charts, and Horizontal Pod Autoscaling.',
    prerequisites: ['gRPC & Microservices Mesh', 'High-Scale System Design'],
    unlocks: [],
    keyCompetencies: ['Linux cgroups & Memory Limits', 'Multi-Stage Docker Builds', 'Kubernetes HPA'],
    recommendedProblems: [
      { title: 'Secure Code Execution Sandbox', difficulty: 'Hard', slug: 'code-sandbox', xp: 350 },
    ],
  },
];

function getNodeIcon(type: SkillNode['iconType']) {
  switch (type) {
    case 'dsa':
      return <DataObjectRoundedIcon sx={{ fontSize: 20 }} />;
    case 'sql':
      return <StorageRoundedIcon sx={{ fontSize: 20 }} />;
    case 'api':
      return <ApiRoundedIcon sx={{ fontSize: 20 }} />;
    case 'react':
      return <DevicesRoundedIcon sx={{ fontSize: 20 }} />;
    case 'queue':
      return <SpeedRoundedIcon sx={{ fontSize: 20 }} />;
    case 'sysdesign':
      return <HubRoundedIcon sx={{ fontSize: 20 }} />;
    case 'grpc':
      return <CloudQueueRoundedIcon sx={{ fontSize: 20 }} />;
    case 'k8s':
      return <DnsRoundedIcon sx={{ fontSize: 20 }} />;
    default:
      return <HubRoundedIcon sx={{ fontSize: 20 }} />;
  }
}

export default function SkillGraphClient() {
  const [selectedRole, setSelectedRole] = useState('fullstack');
  const [activeNode, setActiveNode] = useState<SkillNode | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  const currentRole = useMemo(() => {
    return ROLES.find((r) => r.id === selectedRole) || ROLES[0];
  }, [selectedRole]);

  const getStatusVisuals = (status: SkillNode['status']) => {
    switch (status) {
      case 'MASTERED':
        return {
          main: '#059669',
          bg: '#ECFDF5',
          border: '#10B981',
          badgeIcon: <CheckCircleRoundedIcon sx={{ fontSize: 14, color: '#059669' }} />,
          label: 'Mastered',
        };
      case 'IN_PROGRESS':
        return {
          main: '#D97706',
          bg: '#FFFBEB',
          border: '#F59E0B',
          badgeIcon: <HourglassTopRoundedIcon sx={{ fontSize: 13, color: '#D97706' }} />,
          label: 'In Progress',
        };
      case 'LOCKED':
        return {
          main: '#64748B',
          bg: '#F8FAFC',
          border: '#CBD5E1',
          badgeIcon: <LockRoundedIcon sx={{ fontSize: 12, color: '#94A3B8' }} />,
          label: 'Locked',
        };
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, pb: 8 }}>
      {/* 1. CLEAN HEADER & ROLE SWITCHER */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          gap: 2,
          pb: 2,
          borderBottom: '1px solid #E2E8F0',
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
            <Typography variant="h5" sx={{ fontWeight: 900, color: '#0F172A', fontSize: '1.35rem', letterSpacing: '-0.02em' }}>
              Skill Graph & Competency Map
            </Typography>
            <Chip
              icon={<AutoAwesomeRoundedIcon sx={{ fontSize: 12, color: '#2563EB !important' }} />}
              label="AI Pathway"
              size="small"
              sx={{ bgcolor: '#EFF6FF', color: '#2563EB', fontWeight: 800, fontSize: '0.72rem', height: 22 }}
            />
          </Box>
          <Typography sx={{ fontSize: '0.82rem', color: '#64748B', mt: 0.3 }}>
            Continuous career progression pipeline with stage-wise milestone verification.
          </Typography>
        </Box>

        {/* Role Selector Pills */}
        <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', alignItems: 'center' }}>
          {ROLES.map((role) => {
            const isSelected = selectedRole === role.id;
            return (
              <Button
                key={role.id}
                size="small"
                onClick={() => setSelectedRole(role.id)}
                startIcon={role.icon}
                sx={{
                  borderRadius: '9999px',
                  px: 2,
                  py: 0.6,
                  fontSize: '0.78rem',
                  fontWeight: isSelected ? 800 : 600,
                  textTransform: 'none',
                  bgcolor: isSelected ? '#0F172A' : 'transparent',
                  color: isSelected ? '#FFFFFF' : '#64748B',
                  border: isSelected ? '1px solid #0F172A' : '1px solid #E2E8F0',
                  '&:hover': {
                    bgcolor: isSelected ? '#1E293B' : '#F1F5F9',
                  },
                }}
              >
                {role.label}
              </Button>
            );
          })}
        </Box>
      </Box>

      {/* 2. MINIMAL OVERALL READINESS STRIP */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, px: 0.5 }}>
        <Typography sx={{ fontSize: '0.86rem', fontWeight: 800, color: '#0F172A', whiteSpace: 'nowrap' }}>
          {currentRole.label}
        </Typography>
        <Box sx={{ flex: 1, maxWidth: 500 }}>
          <LinearProgress
            variant="determinate"
            value={currentRole.targetScore}
            sx={{
              height: 6,
              borderRadius: '9999px',
              bgcolor: '#E2E8F0',
              '& .MuiLinearProgress-bar': { bgcolor: '#2563EB', borderRadius: '9999px' },
            }}
          />
        </Box>
        <Typography sx={{ fontSize: '0.8rem', color: '#64748B', whiteSpace: 'nowrap' }}>
          <strong style={{ color: '#2563EB' }}>{currentRole.targetScore}%</strong> readiness ({currentRole.completedSkills}/{currentRole.totalSkills} skills mastered)
        </Typography>
      </Box>

      {/* 3. CLEAN PROGRESSION PIPELINE (METRO / ROADMAP FLOW) */}
      {/* Top Stage Connector Track */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: 'repeat(4, 1fr)' },
          gap: { xs: 4, lg: 3 },
          position: 'relative',
        }}
      >
        {STAGES.map((stage, stageIdx) => {
          const stageNodes = SKILL_NODES.filter((n) => n.stageIndex === stage.index);
          const completedInStage = stageNodes.filter((n) => n.status === 'MASTERED').length;

          return (
            <Box
              key={stage.index}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                position: 'relative',
              }}
            >
              {/* Stage Header Line & Milestone Header */}
              <Box sx={{ pb: 1.5, borderBottom: `2px solid ${stage.color}` }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography sx={{ fontWeight: 900, fontSize: '0.88rem', color: '#0F172A' }}>
                    {stage.title}
                  </Typography>
                  <Typography sx={{ fontSize: '0.72rem', color: stage.color, fontWeight: 800 }}>
                    {completedInStage}/{stageNodes.length} Mastered
                  </Typography>
                </Box>
                <Typography sx={{ fontSize: '0.74rem', color: '#64748B' }}>
                  {stage.subtitle}
                </Typography>
              </Box>

              {/* Vertical Branch Spine of Clean Nodes */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5,
                  position: 'relative',
                  pl: 2,
                  borderLeft: '2px solid #E2E8F0',
                  ml: 1,
                }}
              >
                {stageNodes.map((node) => {
                  const statusVisuals = getStatusVisuals(node.status);
                  const isHovered = hoveredNodeId === node.id;

                  return (
                    <Box
                      key={node.id}
                      role="button"
                      tabIndex={0}
                      aria-label={`${node.title}, ${node.status}, ${node.masteryPct}% mastery`}
                      onClick={() => setActiveNode(node)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setActiveNode(node);
                        }
                      }}
                      onMouseEnter={() => setHoveredNodeId(node.id)}
                      onMouseLeave={() => setHoveredNodeId(null)}
                      onFocus={() => setHoveredNodeId(node.id)}
                      onBlur={() => setHoveredNodeId(null)}
                      sx={{
                        p: 1.8,
                        borderRadius: '14px',
                        bgcolor: isHovered ? '#F8FAFC' : 'transparent',
                        border: isHovered ? '1px solid #2563EB' : '1px solid transparent',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1,
                        position: 'relative',
                        outline: 'none',
                        '&:hover': {
                          transform: 'translateX(3px)',
                        },
                        '&:focus-visible': {
                          outline: '2px solid #2563EB',
                          outlineOffset: '2px',
                        },
                      }}
                    >
                      {/* Left Connector Node Dot */}
                      <Box
                        sx={{
                          position: 'absolute',
                          left: -23,
                          top: 24,
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          bgcolor: statusVisuals.main,
                          border: '2px solid #FFFFFF',
                          boxShadow: `0 0 0 2px ${statusVisuals.main}`,
                        }}
                      />

                      {/* Node Content Row */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        {/* Domain Icon Circle */}
                        <Box
                          sx={{
                            width: 38,
                            height: 38,
                            borderRadius: '10px',
                            bgcolor: statusVisuals.bg,
                            color: statusVisuals.main,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            border: `1px solid ${statusVisuals.border}`,
                          }}
                        >
                          {getNodeIcon(node.iconType)}
                        </Box>

                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, justifyContent: 'space-between' }}>
                            <Typography sx={{ fontWeight: 800, fontSize: '0.86rem', color: isHovered ? '#2563EB' : '#0F172A', lineHeight: 1.2 }}>
                              {node.title}
                            </Typography>
                            {statusVisuals.badgeIcon}
                          </Box>
                          <Typography sx={{ fontSize: '0.72rem', color: '#64748B', mt: 0.2 }}>
                            {node.category}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Mini Progress Strip */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, pt: 0.5 }}>
                        <LinearProgress
                          variant="determinate"
                          value={node.masteryPct}
                          sx={{
                            flex: 1,
                            height: 4,
                            borderRadius: '9999px',
                            bgcolor: '#F1F5F9',
                            '& .MuiLinearProgress-bar': { bgcolor: statusVisuals.main, borderRadius: '9999px' },
                          }}
                        />
                        <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: statusVisuals.main, whiteSpace: 'nowrap' }}>
                          {node.masteryPct}% ({node.solvedCount}/{node.totalCount})
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* 4. SLIM INSPECTOR DRAWER */}
      <Drawer
        anchor="right"
        open={Boolean(activeNode)}
        onClose={() => setActiveNode(null)}
        slotProps={{
          paper: {
            sx: {
              width: { xs: '100%', sm: 420 },
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              gap: 2.5,
              bgcolor: '#FFFFFF',
            },
          },
        }}
      >
        {activeNode && (() => {
          const statusVisuals = getStatusVisuals(activeNode.status);
          return (
            <>
              {/* Drawer Header */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: '12px',
                      bgcolor: statusVisuals.bg,
                      color: statusVisuals.main,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: `1px solid ${statusVisuals.border}`,
                    }}
                  >
                    {getNodeIcon(activeNode.iconType)}
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#0F172A', lineHeight: 1.2 }}>
                      {activeNode.title}
                    </Typography>
                    <Typography sx={{ fontSize: '0.74rem', color: '#64748B' }}>
                      {activeNode.category} • Stage 0{activeNode.stageIndex}
                    </Typography>
                  </Box>
                </Box>
                <IconButton onClick={() => setActiveNode(null)} size="small">
                  <CloseRoundedIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Box>

              <Divider />

              {/* Status & Progress */}
              <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography sx={{ fontSize: '0.78rem', fontWeight: 800, color: '#0F172A' }}>
                    Status: <strong style={{ color: statusVisuals.main }}>{statusVisuals.label}</strong>
                  </Typography>
                  <Typography sx={{ fontSize: '0.84rem', fontWeight: 800, color: statusVisuals.main }}>
                    {activeNode.masteryPct}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={activeNode.masteryPct}
                  sx={{
                    height: 6,
                    borderRadius: '9999px',
                    bgcolor: '#E2E8F0',
                    '& .MuiLinearProgress-bar': { bgcolor: statusVisuals.main, borderRadius: '9999px' },
                  }}
                />
                <Typography sx={{ fontSize: '0.72rem', color: '#64748B', mt: 0.8 }}>
                  {activeNode.solvedCount} of {activeNode.totalCount} problems completed
                </Typography>
              </Box>

              {/* Description */}
              <Box>
                <Typography sx={{ fontSize: '0.78rem', fontWeight: 800, color: '#0F172A', mb: 0.5 }}>
                  Overview
                </Typography>
                <Typography sx={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.5 }}>
                  {activeNode.description}
                </Typography>
              </Box>

              {/* Key Competencies */}
              <Box>
                <Typography sx={{ fontSize: '0.78rem', fontWeight: 800, color: '#0F172A', mb: 0.8 }}>
                  Competency Checklist
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.6 }}>
                  {activeNode.keyCompetencies.map((comp) => (
                    <Box key={comp} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircleRoundedIcon sx={{ fontSize: 14, color: '#2563EB' }} />
                      <Typography sx={{ fontSize: '0.76rem', color: '#334155' }}>
                        {comp}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* Prerequisites & Unlocks */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography sx={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 800, width: 65 }}>
                    Prereq:
                  </Typography>
                  <Typography sx={{ fontSize: '0.76rem', color: '#0F172A', fontWeight: 600 }}>
                    {activeNode.prerequisites.join(', ') || 'None'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography sx={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 800, width: 65 }}>
                    Unlocks:
                  </Typography>
                  <Typography sx={{ fontSize: '0.76rem', color: '#2563EB', fontWeight: 600 }}>
                    {activeNode.unlocks.join(', ') || 'Capstone'}
                  </Typography>
                </Box>
              </Box>

              {/* Practice Problems */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography sx={{ fontSize: '0.78rem', fontWeight: 800, color: '#0F172A' }}>
                  Target Practice Problems
                </Typography>
                {activeNode.recommendedProblems.map((prob) => (
                  <Box
                    key={prob.slug}
                    sx={{
                      p: 1.5,
                      borderRadius: '10px',
                      border: '1px solid #E2E8F0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      bgcolor: '#FFFFFF',
                    }}
                  >
                    <Box>
                      <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#0F172A' }}>
                        {prob.title}
                      </Typography>
                      <Typography sx={{ fontSize: '0.7rem', color: '#64748B', mt: 0.2 }}>
                        {prob.difficulty} • +{prob.xp} XP
                      </Typography>
                    </Box>
                    <Link href={`/problems/${prob.slug}`} style={{ textDecoration: 'none' }}>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<PlayArrowRoundedIcon sx={{ fontSize: 14 }} />}
                        sx={{
                          textTransform: 'none',
                          borderRadius: '8px',
                          fontSize: '0.74rem',
                          fontWeight: 800,
                          bgcolor: '#2563EB',
                          py: 0.4,
                        }}
                      >
                        Solve
                      </Button>
                    </Link>
                  </Box>
                ))}
              </Box>

              {/* Footer CTA */}
              <Box sx={{ mt: 'auto', pt: 1 }}>
                <Link href="/problems" style={{ textDecoration: 'none' }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<CodeRoundedIcon />}
                    sx={{
                      textTransform: 'none',
                      borderRadius: '10px',
                      fontWeight: 800,
                      fontSize: '0.8rem',
                      borderColor: '#E2E8F0',
                      color: '#0F172A',
                    }}
                  >
                    View All Problems
                  </Button>
                </Link>
              </Box>
            </>
          );
        })()}
      </Drawer>
    </Box>
  );
}
