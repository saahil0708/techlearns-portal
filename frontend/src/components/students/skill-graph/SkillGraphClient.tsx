'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  Chip,
  Button,
  LinearProgress,
  IconButton,
  Drawer,
  Divider,
} from '@mui/material';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import HourglassTopRoundedIcon from '@mui/icons-material/HourglassTopRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import Link from 'next/link';

interface SkillNode {
  id: string;
  title: string;
  category: string;
  level: 'Foundations' | 'Core' | 'Advanced' | 'Production';
  status: 'MASTERED' | 'IN_PROGRESS' | 'LOCKED';
  masteryPct: number;
  solvedCount: number;
  totalCount: number;
  description: string;
  prerequisites: string[];
  recommendedProblems: { title: string; difficulty: 'Easy' | 'Medium' | 'Hard'; slug: string }[];
}

const ROLES = [
  { id: 'fullstack', label: 'Full-Stack Software Engineer', targetScore: 88, completedSkills: 18, totalSkills: 24 },
  { id: 'backend', label: 'Backend & Systems Architect (Go / Java)', targetScore: 68, completedSkills: 14, totalSkills: 22 },
  { id: 'aiml', label: 'AI / Machine Learning Engineer', targetScore: 54, completedSkills: 11, totalSkills: 20 },
  { id: 'devops', label: 'Cloud Native & DevOps Engineer', targetScore: 45, completedSkills: 9, totalSkills: 19 },
];

const SKILL_NODES: SkillNode[] = [
  // Foundations
  {
    id: 'dsa-core',
    title: 'Data Structures & Algorithms',
    category: 'Computer Science Core',
    level: 'Foundations',
    status: 'MASTERED',
    masteryPct: 94,
    solvedCount: 180,
    totalCount: 190,
    description: 'Arrays, Two Pointers, Sliding Window, Linked Lists, Trees, and Graph Traversal algorithms with asymptotic efficiency.',
    prerequisites: ['Basic Programming', 'Discrete Math'],
    recommendedProblems: [
      { title: 'Two Sum & Target Lookups', difficulty: 'Easy', slug: 'two-sum' },
      { title: 'Lowest Common Ancestor in BST', difficulty: 'Medium', slug: 'lca-bst' },
    ],
  },
  {
    id: 'sql-db',
    title: 'Relational DBs & SQL Optimization',
    category: 'Data Persistence',
    level: 'Foundations',
    status: 'MASTERED',
    masteryPct: 90,
    solvedCount: 45,
    totalCount: 50,
    description: 'Relational schema design, ACID transactions, complex JOINs, indexing strategies (B-Tree, Hash), and execution plans.',
    prerequisites: ['Relational Model'],
    recommendedProblems: [
      { title: 'Nth Highest Salary Query', difficulty: 'Medium', slug: 'nth-highest-salary' },
    ],
  },
  // Core
  {
    id: 'api-arch',
    title: 'REST & GraphQL API Architecture',
    category: 'Backend Engineering',
    level: 'Core',
    status: 'MASTERED',
    masteryPct: 88,
    solvedCount: 38,
    totalCount: 42,
    description: 'Idempotency, status codes, JWT authentication, rate limiting, OpenAPI specifications, and schema stitching.',
    prerequisites: ['Data Structures & Algorithms', 'Relational DBs & SQL Optimization'],
    recommendedProblems: [
      { title: 'Rate Limiter Token Bucket', difficulty: 'Medium', slug: 'rate-limiter' },
    ],
  },
  {
    id: 'react-next',
    title: 'React 19 & Next.js App Router',
    category: 'Frontend Engineering',
    level: 'Core',
    status: 'IN_PROGRESS',
    masteryPct: 76,
    solvedCount: 28,
    totalCount: 36,
    description: 'Server Components vs Client Components, Suspense streaming, optimistic updates, Zustand state, and performance profiling.',
    prerequisites: ['Modern JavaScript / ES6+', 'HTML5 & CSS Tokens'],
    recommendedProblems: [
      { title: 'Virtual Scrolling Window Table', difficulty: 'Hard', slug: 'virtual-scroll' },
    ],
  },
  {
    id: 'async-concurrency',
    title: 'Asynchronous Queues & Concurrency',
    category: 'Distributed Systems',
    level: 'Core',
    status: 'IN_PROGRESS',
    masteryPct: 62,
    solvedCount: 16,
    totalCount: 26,
    description: 'Event loop mechanics, worker pools, Redis Pub/Sub, BullMQ job queues, lock contention, and idempotency keys.',
    prerequisites: ['REST & GraphQL API Architecture'],
    recommendedProblems: [
      { title: 'Distributed Mutex Lock Engine', difficulty: 'Hard', slug: 'distributed-lock' },
    ],
  },
  // Advanced
  {
    id: 'sys-design',
    title: 'High-Scale System Architecture',
    category: 'Architecture',
    level: 'Advanced',
    status: 'IN_PROGRESS',
    masteryPct: 48,
    solvedCount: 12,
    totalCount: 25,
    description: 'Caching tiers, CDN invalidation, database sharding, horizontal scaling, consensus protocols, and fault isolation.',
    prerequisites: ['Asynchronous Queues & Concurrency'],
    recommendedProblems: [
      { title: 'URL Shortener at Scale', difficulty: 'Medium', slug: 'url-shortener' },
      { title: 'Live Chat Delivery Protocol', difficulty: 'Hard', slug: 'live-chat' },
    ],
  },
  {
    id: 'microservices',
    title: 'gRPC & Microservices Communication',
    category: 'Architecture',
    level: 'Advanced',
    status: 'LOCKED',
    masteryPct: 0,
    solvedCount: 0,
    totalCount: 20,
    description: 'Protobuf serialization, HTTP/2 streaming, service discovery, circuit breakers, and distributed tracing with OpenTelemetry.',
    prerequisites: ['High-Scale System Architecture'],
    recommendedProblems: [
      { title: 'gRPC Unary & Bidirectional Pipeline', difficulty: 'Hard', slug: 'grpc-pipeline' },
    ],
  },
  // Production
  {
    id: 'k8s-docker',
    title: 'Docker Sandbox & Kubernetes Orchestration',
    category: 'DevOps & Reliability',
    level: 'Production',
    status: 'LOCKED',
    masteryPct: 0,
    solvedCount: 0,
    totalCount: 18,
    description: 'Multi-stage container builds, rootless sandbox execution, Helm charts, pod autoscaling, and ingress controllers.',
    prerequisites: ['gRPC & Microservices Communication'],
    recommendedProblems: [
      { title: 'Secure Code Execution Sandbox', difficulty: 'Hard', slug: 'code-sandbox' },
    ],
  },
];

export default function SkillGraphClient() {
  const [selectedRole, setSelectedRole] = useState('fullstack');
  const [activeNode, setActiveNode] = useState<SkillNode | null>(null);

  const currentRole = ROLES.find((r) => r.id === selectedRole) || ROLES[0];

  const getStatusColor = (status: SkillNode['status']) => {
    switch (status) {
      case 'MASTERED':
        return { bg: '#ECFDF5', text: '#059669', border: '#A7F3D0', icon: <CheckCircleRoundedIcon sx={{ fontSize: 16 }} /> };
      case 'IN_PROGRESS':
        return { bg: '#FEF3C7', text: '#D97706', border: '#FDE68A', icon: <HourglassTopRoundedIcon sx={{ fontSize: 15 }} /> };
      case 'LOCKED':
        return { bg: '#F1F5F9', text: '#64748B', border: '#CBD5E1', icon: <LockRoundedIcon sx={{ fontSize: 14 }} /> };
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
      {/* 1. Page Header Card */}
      <Card
        elevation={0}
        sx={{
          borderRadius: '24px',
          bgcolor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          p: { xs: 2.5, sm: 3.5 },
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '14px',
                bgcolor: '#EFF6FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563EB',
                border: '1px solid #DBEAFE',
              }}
            >
              <AccountTreeOutlinedIcon sx={{ fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.35rem', lineHeight: 1.2 }}>
                Role Skill Graph & Competency Map
              </Typography>
              <Typography sx={{ fontSize: '0.84rem', color: '#64748B', mt: 0.3 }}>
                Target role pathways, dependency chains, and real-time competency milestone verification
              </Typography>
            </Box>
          </Box>

          <Chip
            icon={<AutoAwesomeRoundedIcon sx={{ fontSize: 14, color: '#2563EB !important' }} />}
            label="AI Pathway Engine Active"
            size="small"
            sx={{
              bgcolor: '#EFF6FF',
              color: '#2563EB',
              fontWeight: 700,
              fontSize: '0.78rem',
              height: 28,
              borderRadius: '8px',
              border: '1px solid #DBEAFE',
              px: 0.5,
            }}
          />
        </Box>

        {/* Target Role Selector Pills */}
        <Box sx={{ display: 'flex', gap: 1.25, mt: 3, flexWrap: 'wrap' }}>
          {ROLES.map((role) => (
            <Button
              key={role.id}
              onClick={() => setSelectedRole(role.id)}
              variant={selectedRole === role.id ? 'contained' : 'outlined'}
              size="small"
              sx={{
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '0.8rem',
                textTransform: 'none',
                px: 2,
                py: 0.75,
                bgcolor: selectedRole === role.id ? '#2563EB' : '#FFFFFF',
                borderColor: selectedRole === role.id ? '#2563EB' : '#E2E8F0',
                color: selectedRole === role.id ? '#FFFFFF' : '#475569',
                boxShadow: selectedRole === role.id ? '0 4px 12px rgba(37, 99, 235, 0.25)' : 'none',
                '&:hover': {
                  bgcolor: selectedRole === role.id ? '#1D4ED8' : '#F8FAFC',
                  borderColor: selectedRole === role.id ? '#1D4ED8' : '#CBD5E1',
                },
              }}
            >
              {role.label}
            </Button>
          ))}
        </Box>
      </Card>

      {/* 2. Target Role Progress Meter */}
      <Card
        elevation={0}
        sx={{
          borderRadius: '20px',
          bgcolor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          p: 3,
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: '0.98rem', color: '#0F172A' }}>
              Target Readiness: {currentRole.label}
            </Typography>
            <Typography sx={{ fontSize: '0.78rem', color: '#64748B' }}>
              {currentRole.completedSkills} of {currentRole.totalSkills} skills mastered • Industry Benchmark Match
            </Typography>
          </Box>
          <Typography sx={{ fontWeight: 900, fontSize: '1.25rem', color: '#2563EB' }}>
            {currentRole.targetScore}%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={currentRole.targetScore}
          sx={{
            height: 10,
            borderRadius: '9999px',
            bgcolor: '#EFF6FF',
            '& .MuiLinearProgress-bar': {
              bgcolor: '#2563EB',
              backgroundImage: 'linear-gradient(90deg, #3B82F6 0%, #2563EB 100%)',
              borderRadius: '9999px',
            },
          }}
        />
      </Card>

      {/* 3. Interactive Skill Nodes Grid */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {(['Foundations', 'Core', 'Advanced', 'Production'] as const).map((lvl) => {
          const nodesInLevel = SKILL_NODES.filter((n) => n.level === lvl);
          return (
            <Box key={lvl} sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography sx={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748B', letterSpacing: '0.05em' }}>
                  {lvl} Track
                </Typography>
                <Box sx={{ flex: 1, height: '1px', bgcolor: '#E2E8F0' }} />
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 2 }}>
                {nodesInLevel.map((node) => {
                  const statusStyle = getStatusColor(node.status);
                  return (
                    <Card
                      key={node.id}
                      elevation={0}
                      onClick={() => setActiveNode(node)}
                      sx={{
                        p: 2.5,
                        borderRadius: '18px',
                        bgcolor: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: 2,
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                          borderColor: '#93C5FD',
                        },
                      }}
                    >
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.25 }}>
                          <Chip
                            icon={statusStyle.icon}
                            label={node.status.replace('_', ' ')}
                            size="small"
                            sx={{
                              bgcolor: statusStyle.bg,
                              color: statusStyle.text,
                              fontWeight: 800,
                              fontSize: '0.7rem',
                              height: 24,
                              borderRadius: '6px',
                              border: `1px solid ${statusStyle.border}`,
                            }}
                          />
                          <Typography sx={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 600 }}>
                            {node.category}
                          </Typography>
                        </Box>

                        <Typography sx={{ fontWeight: 800, fontSize: '0.98rem', color: '#0F172A', mb: 0.5, lineHeight: 1.3 }}>
                          {node.title}
                        </Typography>
                        <Typography sx={{ fontSize: '0.78rem', color: '#64748B', lineHeight: 1.45, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {node.description}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 1.5, borderTop: '1px solid #F1F5F9' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography sx={{ fontWeight: 800, fontSize: '0.84rem', color: node.status === 'LOCKED' ? '#94A3B8' : '#2563EB' }}>
                            {node.masteryPct}%
                          </Typography>
                          <Typography sx={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                            ({node.solvedCount}/{node.totalCount} completed)
                          </Typography>
                        </Box>
                        <Typography sx={{ fontSize: '0.76rem', fontWeight: 700, color: '#2563EB', display: 'flex', alignItems: 'center', gap: 0.25 }}>
                          Details <ArrowForwardRoundedIcon sx={{ fontSize: 13 }} />
                        </Typography>
                      </Box>
                    </Card>
                  );
                })}
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* 4. Drawer for Node Details & Practice Link */}
      <Drawer
        anchor="right"
        open={Boolean(activeNode)}
        onClose={() => setActiveNode(null)}
        slotProps={{
          paper: {
            sx: {
              width: { xs: '100%', sm: 440 },
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              gap: 2.5,
            },
          },
        }}
      >
        {activeNode && (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Chip
                  label={activeNode.level}
                  size="small"
                  sx={{ bgcolor: '#EFF6FF', color: '#2563EB', fontWeight: 800, fontSize: '0.72rem', mb: 1 }}
                />
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
                  {activeNode.title}
                </Typography>
                <Typography sx={{ fontSize: '0.78rem', color: '#64748B', mt: 0.25 }}>
                  {activeNode.category}
                </Typography>
              </Box>
              <IconButton onClick={() => setActiveNode(null)} size="small">
                <CloseRoundedIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Box>

            <Divider />

            <Box>
              <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: '#0F172A', mb: 0.75 }}>
                Competency Overview
              </Typography>
              <Typography sx={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.6 }}>
                {activeNode.description}
              </Typography>
            </Box>

            <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
              <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', mb: 0.5 }}>
                Prerequisites:
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                {activeNode.prerequisites.map((p) => (
                  <Chip key={p} label={p} size="small" sx={{ bgcolor: '#FFFFFF', border: '1px solid #CBD5E1', fontSize: '0.72rem' }} />
                ))}
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
              <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: '#0F172A' }}>
                Target Practice Problems
              </Typography>
              {activeNode.recommendedProblems.map((prob) => (
                <Box
                  key={prob.slug}
                  sx={{
                    p: 1.5,
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box>
                    <Typography sx={{ fontSize: '0.84rem', fontWeight: 700, color: '#0F172A' }}>
                      {prob.title}
                    </Typography>
                    <Chip
                      label={prob.difficulty}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        bgcolor: prob.difficulty === 'Easy' ? '#ECFDF5' : prob.difficulty === 'Medium' ? '#FEF3C7' : '#FEE2E2',
                        color: prob.difficulty === 'Easy' ? '#059669' : prob.difficulty === 'Medium' ? '#D97706' : '#DC2626',
                        mt: 0.5,
                      }}
                    />
                  </Box>
                  <Link href={`/problems/${prob.slug}`} style={{ textDecoration: 'none' }}>
                    <Button size="small" variant="outlined" sx={{ textTransform: 'none', borderRadius: '8px', fontSize: '0.78rem' }}>
                      Solve
                    </Button>
                  </Link>
                </Box>
              ))}
            </Box>

            <Box sx={{ mt: 'auto', display: 'flex', gap: 1 }}>
              <Link href="/practice" style={{ textDecoration: 'none', flex: 1 }}>
                <Button fullWidth variant="contained" startIcon={<CodeRoundedIcon />} sx={{ bgcolor: '#2563EB', textTransform: 'none', borderRadius: '12px', fontWeight: 700 }}>
                  Open Practice
                </Button>
              </Link>
            </Box>
          </>
        )}
      </Drawer>
    </Box>
  );
}
