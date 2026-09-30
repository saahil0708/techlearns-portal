'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Box,
  Typography,
  Card,
  Button,
  Chip,
  LinearProgress,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Slider,
  Tooltip,
  IconButton,
  Dialog,
  DialogContent,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import PsychologyRoundedIcon from '@mui/icons-material/PsychologyRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import TerminalRoundedIcon from '@mui/icons-material/TerminalRounded';
import RocketLaunchRoundedIcon from '@mui/icons-material/RocketLaunchRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import StorageRoundedIcon from '@mui/icons-material/StorageRounded';
import CloudQueueRoundedIcon from '@mui/icons-material/CloudQueueRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import SmartToyRoundedIcon from '@mui/icons-material/SmartToyRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import TrackChangesRoundedIcon from '@mui/icons-material/TrackChangesRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';

import { useToast } from '@/context/ToastContext';

// Career Tracks Definition
export interface CareerTrack {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  benchmarkScore: number;
  popularRoles: string[];
}

const CAREER_TRACKS: CareerTrack[] = [
  {
    id: 'fullstack',
    title: 'Full-Stack Web Architect',
    subtitle: 'Next.js 15, React 19, NestJS, TypeScript, PostgreSQL, and Cloud Deployments',
    icon: <CodeRoundedIcon sx={{ fontSize: 26 }} />,
    color: '#38BDF8',
    benchmarkScore: 85,
    popularRoles: ['Frontend Engineer', 'Fullstack Developer', 'UI/UX Technologist'],
  },
  {
    id: 'backend-systems',
    title: 'Backend & Distributed Systems',
    subtitle: 'Microservices, BullMQ, Redis Caching, High Concurrency, and Distributed Locks',
    icon: <StorageRoundedIcon sx={{ fontSize: 26 }} />,
    color: '#818CF8',
    benchmarkScore: 88,
    popularRoles: ['Backend Engineer', 'Distributed Systems Architect', 'API Specialist'],
  },
  {
    id: 'competitive-dsa',
    title: 'Algorithmic & Problem Solving (DSA)',
    subtitle: 'Dynamic Programming, Graph Theory, Segment Trees, and Contest Ranks',
    icon: <EmojiEventsRoundedIcon sx={{ fontSize: 26 }} />,
    color: '#F59E0B',
    benchmarkScore: 92,
    popularRoles: ['Software Development Engineer (SDE-1)', 'Competitive Coder', 'Quant Dev'],
  },
  {
    id: 'cloud-devops',
    title: 'Cloud DevOps & Platform Engineering',
    subtitle: 'Docker, Kubernetes, CI/CD Pipelines, Infrastructure as Code, and Observability',
    icon: <CloudQueueRoundedIcon sx={{ fontSize: 26 }} />,
    color: '#10B981',
    benchmarkScore: 80,
    popularRoles: ['DevOps Engineer', 'Site Reliability Engineer (SRE)', 'Cloud Architect'],
  },
  {
    id: 'ai-data',
    title: 'AI & Machine Learning Engineering',
    subtitle: 'LLMs, Vector Databases, Python, PyTorch, Retrieval Augmented Generation (RAG)',
    icon: <SmartToyRoundedIcon sx={{ fontSize: 26 }} />,
    color: '#EC4899',
    benchmarkScore: 86,
    popularRoles: ['AI Engineer', 'MLOps Engineer', 'Data Scientist'],
  },
  {
    id: 'cybersecurity',
    title: 'Cybersecurity & Application Defense',
    subtitle: 'OWASP Top 10, Auth Protocols, Penetration Testing, and Secure Code Audit',
    icon: <SecurityRoundedIcon sx={{ fontSize: 26 }} />,
    color: '#F43F5E',
    benchmarkScore: 82,
    popularRoles: ['Security Analyst', 'AppSec Engineer', 'Penetration Tester'],
  },
];

// Knowledge Domains for Self-Assessment
export interface DomainSkill {
  id: string;
  name: string;
  icon: React.ReactNode;
  level: number; // 0 to 100
  label: 'Beginner' | 'Elementary' | 'Intermediate' | 'Advanced' | 'Expert';
}

const INITIAL_DOMAINS: DomainSkill[] = [
  { id: 'prog', name: 'Programming Languages (TS / C++ / Python / Java)', icon: <TerminalRoundedIcon />, level: 60, label: 'Intermediate' },
  { id: 'dsa', name: 'Data Structures & Algorithms', icon: <PsychologyRoundedIcon />, level: 50, label: 'Intermediate' },
  { id: 'web', name: 'Web Architecture & Modern Frameworks', icon: <CodeRoundedIcon />, level: 70, label: 'Advanced' },
  { id: 'backend', name: 'Server & API Design (REST, NestJS, Express)', icon: <StorageRoundedIcon />, level: 65, label: 'Intermediate' },
  { id: 'db', name: 'Databases & SQL (Postgres, Prisma, Indexing)', icon: <StorageRoundedIcon />, level: 55, label: 'Intermediate' },
  { id: 'cloud', name: 'Cloud, Docker & Deployment Pipelines', icon: <CloudQueueRoundedIcon />, level: 40, label: 'Elementary' },
];

const getLevelLabel = (val: number): DomainSkill['label'] => {
  if (val < 25) return 'Beginner';
  if (val < 50) return 'Elementary';
  if (val < 75) return 'Intermediate';
  if (val < 90) return 'Advanced';
  return 'Expert';
};

// Baseline Diagnostic Questions
interface DiagnosticQuestion {
  id: number;
  question: string;
  codeSnippet?: string;
  topic: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const DIAGNOSTIC_QUESTIONS: DiagnosticQuestion[] = [
  {
    id: 1,
    topic: 'Data Structures & Algorithms',
    question: 'What is the time complexity of searching an element in a balanced Binary Search Tree (AVL / Red-Black Tree) with N nodes in the worst case?',
    options: ['O(1)', 'O(log N)', 'O(N)', 'O(N log N)'],
    correctIndex: 1,
    explanation: 'A balanced BST maintains height bounded by O(log N), ensuring all search, insertion, and deletion operations take O(log N) time in worst-case.',
  },
  {
    id: 2,
    topic: 'Web Systems & Architecture',
    question: 'In React 19 / Next.js App Router, which statement regarding React Server Components (RSC) is TRUE?',
    options: [
      'Server Components can use useState and useEffect hooks directly',
      'Server Components execute on the server, resulting in 0 client-side bundle weight for server-only logic',
      'Server Components cannot fetch database records directly',
      'Server Components require browser DOM hydration',
    ],
    correctIndex: 1,
    explanation: 'RSC code never ships to the browser bundle, drastically reducing JavaScript payload while enabling direct database and secret access on the server.',
  },
  {
    id: 3,
    topic: 'Backend & Concurrency',
    question: 'Why are distributed message queues like BullMQ / Redis used instead of synchronous HTTP calls for long-running jobs (e.g., code compilation / sandboxing)?',
    options: [
      'To prevent API request timeouts and isolate worker node execution from client latency',
      'Because Redis is slower than in-memory arrays',
      'To guarantee that jobs execute on the client machine',
      'To bypass HTTPS encryption overhead',
    ],
    correctIndex: 0,
    explanation: 'Queues decouple ingestion from execution, preventing gateway timeouts and providing backoff retries and concurrency throttling.',
  },
  {
    id: 4,
    topic: 'Database Optimization',
    question: 'Which PostgreSQL index type is most optimal for speeding up exact-match queries on UUID primary keys and B-Tree ranged filter lookups?',
    options: ['GIN Index', 'B-Tree Index', 'BRIN Index', 'GiST Index'],
    correctIndex: 1,
    explanation: 'B-Tree is the default and highest-performance general-purpose index for equality (=) and range (<, <=, >, >=) queries.',
  },
];

interface IdentityDiagnosticWizardProps {
  userId?: string;
  onComplete?: (report: any) => void;
  onClose?: () => void;
  isModal?: boolean;
}

export default function IdentityDiagnosticWizard({
  userId,
  onComplete,
  onClose,
  isModal = false,
}: IdentityDiagnosticWizardProps) {
  const toast = useToast();

  // Wizard Step: 1 = Interest, 2 = Self Knowledge, 3 = Diagnostic Quiz, 4 = Results & Recommendations
  const [currentStep, setCurrentStep] = useState<number>(1);

  // User Selections
  const [selectedTrack, setSelectedTrack] = useState<string>('fullstack');
  const [targetTimeline, setTargetTimeline] = useState<string>('6 months (Standard)');
  const [weeklyCommitment, setWeeklyCommitment] = useState<number>(12);
  const [domainSkills, setDomainSkills] = useState<DomainSkill[]>(INITIAL_DOMAINS);

  // Diagnostic Quiz State
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  // Update domain rating
  const handleDomainChange = (id: string, newLevel: number) => {
    setDomainSkills((prev) =>
      prev.map((d) => (d.id === id ? { ...d, level: newLevel, label: getLevelLabel(newLevel) } : d))
    );
  };

  // Calculate Quiz Score
  const correctQuizCount = Object.entries(quizAnswers).filter(
    ([qId, ansIdx]) => DIAGNOSTIC_QUESTIONS.find((q) => q.id === Number(qId))?.correctIndex === ansIdx
  ).length;

  const activeTrackObj = CAREER_TRACKS.find((t) => t.id === selectedTrack) || CAREER_TRACKS[0];

  // Calculate Role-Fit Match Score
  const avgDomainScore = Math.round(
    domainSkills.reduce((acc, d) => acc + d.level, 0) / domainSkills.length
  );
  const diagnosticBonus = quizSubmitted ? Math.round((correctQuizCount / DIAGNOSTIC_QUESTIONS.length) * 15) : 0;
  const computedRoleFit = Math.min(98, Math.max(35, Math.round(avgDomainScore * 0.85 + diagnosticBonus)));

  // Finish Wizard & Save Goal
  const handleApplyGoals = () => {
    const serializableSkills = domainSkills.map(({ id, name, level, label }) => ({
      id,
      name,
      level,
      label,
    }));

    const diagnosticReport = {
      targetTrack: activeTrackObj.title,
      targetTrackId: activeTrackObj.id,
      timeline: targetTimeline,
      weeklyHours: weeklyCommitment,
      roleFitScore: computedRoleFit,
      skills: serializableSkills,
      quizScore: `${correctQuizCount}/${DIAGNOSTIC_QUESTIONS.length}`,
      timestamp: new Date().toISOString(),
    };

    if (typeof window !== 'undefined') {
      try {
        const storageKey = userId ? `codeplatform_diagnostic_goal_${userId}` : 'codeplatform_diagnostic_goal';
        localStorage.setItem(storageKey, JSON.stringify(diagnosticReport));
      } catch (err) {
        console.warn('Could not save goal to localStorage:', err);
      }
    }

    toast.success('Diagnostic Report & Learning Goals saved to your profile!', 'Identity & Diagnostic Configured');
    if (onComplete) onComplete(diagnosticReport);
    if (onClose) onClose();
  };

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: isModal ? '24px' : '28px',
        bgcolor: '#0B1120',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.65)',
        overflow: 'hidden',
        color: '#FFFFFF',
      }}
    >
      {/* Top Header Bar */}
      <Box
        sx={{
          p: { xs: 2.5, sm: 3 },
          borderBottom: '1px solid rgba(148, 163, 184, 0.12)',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.7) 100%)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '12px',
              bgcolor: 'rgba(56, 189, 248, 0.15)',
              color: '#38BDF8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(56, 189, 248, 0.3)',
            }}
          >
            <PsychologyRoundedIcon sx={{ fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.1rem', color: '#FFFFFF', lineHeight: 1.2 }}>
              Identity & Diagnostic Baseline Engine
            </Typography>
            <Typography sx={{ color: '#94A3B8', fontSize: '0.78rem' }}>
              Calibrate your career aspirations, map existing domain knowledge, and generate personalized curricula.
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Chip
            label={`Step ${currentStep} of 4`}
            size="small"
            sx={{
              bgcolor: 'rgba(56, 189, 248, 0.15)',
              color: '#38BDF8',
              fontWeight: 800,
              fontSize: '0.74rem',
              border: '1px solid rgba(56, 189, 248, 0.3)',
            }}
          />
          {isModal && onClose && (
            <IconButton onClick={onClose} size="small" sx={{ color: '#94A3B8', '&:hover': { color: '#FFFFFF' } }}>
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      </Box>

      {/* Progress Step Indicator */}
      <LinearProgress
        variant="determinate"
        value={(currentStep / 4) * 100}
        sx={{
          height: 4,
          bgcolor: 'rgba(30, 41, 59, 0.8)',
          '& .MuiLinearProgress-bar': {
            bgcolor: '#38BDF8',
            backgroundImage: 'linear-gradient(90deg, #38BDF8 0%, #818CF8 50%, #10B981 100%)',
          },
        }}
      />

      {/* Main Body Content by Step */}
      <Box sx={{ p: { xs: 2.5, sm: 3.5 }, maxHeight: isModal ? '72vh' : 'auto', overflowY: 'auto' }}>
        {/* ========================================================================= */}
        {/* STEP 1: CAREER INTERESTS & ROLE TARGET */}
        {/* ========================================================================= */}
        {currentStep === 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#FFFFFF', mb: 0.5, fontSize: '1.25rem' }}>
                Select Your Target Engineering Track
              </Typography>
              <Typography sx={{ color: '#94A3B8', fontSize: '0.85rem' }}>
                Your diagnostic benchmark, course curriculum, and daily practice agenda will calibrate to this goal.
              </Typography>
            </Box>

            {/* Career Track Cards */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              {CAREER_TRACKS.map((track) => {
                const isSelected = selectedTrack === track.id;
                return (
                  <Card
                    key={track.id}
                    onClick={() => setSelectedTrack(track.id)}
                    elevation={0}
                    sx={{
                      p: 2.5,
                      borderRadius: '18px',
                      bgcolor: isSelected ? 'rgba(30, 58, 138, 0.35)' : 'rgba(15, 23, 42, 0.65)',
                      border: `1.5px solid ${isSelected ? track.color : 'rgba(148, 163, 184, 0.15)'}`,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: isSelected ? `0 8px 24px ${track.color}22` : 'none',
                      '&:hover': {
                        borderColor: track.color,
                        bgcolor: 'rgba(30, 41, 59, 0.7)',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                      <Box
                        sx={{
                          width: 44,
                          height: 44,
                          borderRadius: '12px',
                          bgcolor: `${track.color}20`,
                          color: track.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: `1px solid ${track.color}40`,
                        }}
                      >
                        {track.icon}
                      </Box>
                      {isSelected ? (
                        <CheckCircleRoundedIcon sx={{ color: track.color, fontSize: 24 }} />
                      ) : (
                        <Box
                          sx={{
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            border: '2px solid rgba(148, 163, 184, 0.4)',
                          }}
                        />
                      )}
                    </Box>

                    <Typography sx={{ fontWeight: 800, color: '#FFFFFF', fontSize: '1.05rem', mb: 0.5 }}>
                      {track.title}
                    </Typography>
                    <Typography sx={{ color: '#94A3B8', fontSize: '0.8rem', lineHeight: 1.4, mb: 1.5 }}>
                      {track.subtitle}
                    </Typography>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                      {track.popularRoles.map((role, idx) => (
                        <Chip
                          key={idx}
                          label={role}
                          size="small"
                          sx={{
                            bgcolor: 'rgba(15, 23, 42, 0.8)',
                            color: '#CBD5E1',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            height: 22,
                            border: '1px solid rgba(148, 163, 184, 0.15)',
                          }}
                        />
                      ))}
                    </Box>
                  </Card>
                );
              })}
            </Box>

            {/* Target Timeline & Weekly Hours Goal */}
            <Box
              sx={{
                p: 2.5,
                borderRadius: '18px',
                bgcolor: 'rgba(15, 23, 42, 0.7)',
                border: '1px solid rgba(148, 163, 184, 0.15)',
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 3,
              }}
            >
              <Box>
                <Typography sx={{ fontWeight: 700, color: '#FFFFFF', fontSize: '0.88rem', mb: 1 }}>
                  Target Placement / Mastery Horizon
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {['3 months (Intensive)', '6 months (Standard)', '12 months (Comprehensive)'].map((time) => (
                    <Chip
                      key={time}
                      label={time}
                      onClick={() => setTargetTimeline(time)}
                      sx={{
                        bgcolor: targetTimeline === time ? 'rgba(56, 189, 248, 0.2)' : 'rgba(30, 41, 59, 0.6)',
                        color: targetTimeline === time ? '#38BDF8' : '#94A3B8',
                        fontWeight: 700,
                        border: `1px solid ${targetTimeline === time ? '#38BDF8' : 'rgba(148, 163, 184, 0.2)'}`,
                        cursor: 'pointer',
                      }}
                    />
                  ))}
                </Box>
              </Box>

              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography sx={{ fontWeight: 700, color: '#FFFFFF', fontSize: '0.88rem' }}>
                    Weekly Practice Commitment
                  </Typography>
                  <Typography sx={{ color: '#38BDF8', fontWeight: 800 }}>{weeklyCommitment} hrs/week</Typography>
                </Box>
                <Slider
                  value={weeklyCommitment}
                  min={4}
                  max={30}
                  step={2}
                  onChange={(_, val) => setWeeklyCommitment(val as number)}
                  sx={{
                    color: '#38BDF8',
                    '& .MuiSlider-thumb': { bgcolor: '#38BDF8' },
                  }}
                />
                <Typography sx={{ color: '#64748B', fontSize: '0.74rem' }}>
                  Recommended: 10-15 hrs/week for consistent progress without burn-out.
                </Typography>
              </Box>
            </Box>
          </Box>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: KNOWLEDGE BASELINE SELF-ASSESSMENT */}
        {/* ========================================================================= */}
        {currentStep === 2 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#FFFFFF', mb: 0.5, fontSize: '1.25rem' }}>
                Self-Assessed Knowledge Baseline
              </Typography>
              <Typography sx={{ color: '#94A3B8', fontSize: '0.85rem' }}>
                Estimate your current familiarity across foundational domains so we can skip concepts you already know.
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {domainSkills.map((domain) => (
                <Box
                  key={domain.id}
                  sx={{
                    p: 2.2,
                    borderRadius: '16px',
                    bgcolor: 'rgba(15, 23, 42, 0.7)',
                    border: '1px solid rgba(148, 163, 184, 0.15)',
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    gap: 2.5,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: { sm: 260 } }}>
                    <Box
                      sx={{
                        width: 38,
                        height: 38,
                        borderRadius: '10px',
                        bgcolor: 'rgba(56, 189, 248, 0.12)',
                        color: '#38BDF8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {domain.icon}
                    </Box>
                    <Box>
                      <Typography sx={{ color: '#FFFFFF', fontWeight: 700, fontSize: '0.88rem' }}>
                        {domain.name}
                      </Typography>
                      <Typography sx={{ color: '#64748B', fontSize: '0.74rem' }}>
                        Current rating: <strong style={{ color: '#38BDF8' }}>{domain.label}</strong>
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ flex: 1, width: '100%', px: 1 }}>
                    <Slider
                      value={domain.level}
                      min={0}
                      max={100}
                      step={5}
                      onChange={(_, val) => handleDomainChange(domain.id, val as number)}
                      sx={{
                        color:
                          domain.level >= 75
                            ? '#10B981'
                            : domain.level >= 50
                            ? '#38BDF8'
                            : domain.level >= 25
                            ? '#F59E0B'
                            : '#94A3B8',
                      }}
                    />
                  </Box>

                  <Chip
                    label={`${domain.level}% (${domain.label})`}
                    size="small"
                    sx={{
                      bgcolor: 'rgba(30, 41, 59, 0.8)',
                      color: '#FFFFFF',
                      fontWeight: 700,
                      fontSize: '0.74rem',
                      minWidth: 100,
                      border: '1px solid rgba(148, 163, 184, 0.2)',
                    }}
                  />
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: QUICK ADAPTIVE DIAGNOSTIC TEST */}
        {/* ========================================================================= */}
        {currentStep === 3 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#FFFFFF', mb: 0.5, fontSize: '1.25rem' }}>
                  Quick Baseline Calibration Test
                </Typography>
                <Typography sx={{ color: '#94A3B8', fontSize: '0.85rem' }}>
                  Answer these 4 fundamental questions to calibrate and verify your initial skill graph.
                </Typography>
              </Box>
              <Chip
                icon={<AutoAwesomeRoundedIcon sx={{ fontSize: 14, color: '#38BDF8 !important' }} />}
                label="4 Questions • ~3 mins"
                size="small"
                sx={{ bgcolor: 'rgba(56, 189, 248, 0.15)', color: '#38BDF8', fontWeight: 700 }}
              />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {DIAGNOSTIC_QUESTIONS.map((q, idx) => (
                <Card
                  key={q.id}
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: '16px',
                    bgcolor: 'rgba(15, 23, 42, 0.75)',
                    border: '1px solid rgba(148, 163, 184, 0.15)',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Chip
                      label={`Q${idx + 1} • ${q.topic}`}
                      size="small"
                      sx={{ bgcolor: 'rgba(56, 189, 248, 0.15)', color: '#38BDF8', fontWeight: 700, fontSize: '0.72rem' }}
                    />
                  </Box>

                  <Typography sx={{ fontWeight: 700, color: '#FFFFFF', fontSize: '0.94rem', mb: 2 }}>
                    {q.question}
                  </Typography>

                  <FormControl component="fieldset" sx={{ width: '100%' }}>
                    <RadioGroup
                      value={quizAnswers[q.id] !== undefined ? quizAnswers[q.id] : ''}
                      onChange={(e) => setQuizAnswers({ ...quizAnswers, [q.id]: Number(e.target.value) })}
                    >
                      {q.options.map((opt, optIdx) => {
                        const isChosen = quizAnswers[q.id] === optIdx;
                        return (
                          <Box
                            key={optIdx}
                            onClick={() => setQuizAnswers({ ...quizAnswers, [q.id]: optIdx })}
                            sx={{
                              p: 1.25,
                              px: 2,
                              mb: 1,
                              borderRadius: '10px',
                              bgcolor: isChosen ? 'rgba(56, 189, 248, 0.12)' : 'rgba(30, 41, 59, 0.4)',
                              border: `1px solid ${isChosen ? '#38BDF8' : 'rgba(148, 163, 184, 0.12)'}`,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              '&:hover': {
                                bgcolor: 'rgba(56, 189, 248, 0.08)',
                              },
                            }}
                          >
                            <FormControlLabel
                              value={optIdx}
                              control={<Radio size="small" sx={{ color: '#64748B', '&.Mui-checked': { color: '#38BDF8' } }} />}
                              label={<Typography sx={{ color: '#F8FAFC', fontSize: '0.85rem' }}>{opt}</Typography>}
                              sx={{ m: 0, width: '100%' }}
                            />
                          </Box>
                        );
                      })}
                    </RadioGroup>
                  </FormControl>
                </Card>
              ))}
            </Box>
          </Box>
        )}

        {/* ========================================================================= */}
        {/* STEP 4: DIAGNOSTIC REPORT, ROLE FIT & COURSE RECOMMENDATIONS */}
        {/* ========================================================================= */}
        {currentStep === 4 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Header Banner */}
            <Box
              sx={{
                p: 3,
                borderRadius: '20px',
                background: 'linear-gradient(135deg, #1E3A8A 0%, #1D4ED8 50%, #0284C7 100%)',
                border: '1px solid rgba(147, 197, 253, 0.35)',
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', md: 'center' },
                gap: 2.5,
              }}
            >
              <Box>
                <Chip
                  icon={<RocketLaunchRoundedIcon sx={{ fontSize: 14, color: '#FFFFFF !important' }} />}
                  label="Diagnostic Synthesis Complete"
                  size="small"
                  sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', color: '#FFFFFF', fontWeight: 800, mb: 1 }}
                />
                <Typography variant="h5" sx={{ fontWeight: 900, color: '#FFFFFF', fontSize: '1.35rem' }}>
                  Target: {activeTrackObj.title}
                </Typography>
                <Typography sx={{ color: '#E0E7FF', fontSize: '0.84rem' }}>
                  Horizon: <strong>{targetTimeline}</strong> • Commitment: <strong>{weeklyCommitment} hrs/wk</strong>
                </Typography>
              </Box>

              <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                <Typography sx={{ color: '#BFDBFE', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}>
                  Baseline Role-Fit Index
                </Typography>
                <Typography sx={{ fontSize: '2.4rem', fontWeight: 900, color: '#FFFFFF', lineHeight: 1 }}>
                  {computedRoleFit}%
                </Typography>
                <Typography sx={{ color: '#BAE6FD', fontSize: '0.75rem', fontWeight: 600 }}>
                  Ready to accelerate via tailored roadmap
                </Typography>
              </Box>
            </Box>

            {/* Curated Recommendations */}
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#FFFFFF', mb: 1.5, fontSize: '1.05rem' }}>
                Curated Course & Practice Recommendations
              </Typography>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                {/* Recommendation 1 */}
                <Card
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: '16px',
                    bgcolor: 'rgba(15, 23, 42, 0.75)',
                    border: '1px solid rgba(56, 189, 248, 0.25)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Chip label="Priority 1 • Core Course" size="small" sx={{ bgcolor: 'rgba(56, 189, 248, 0.15)', color: '#38BDF8', fontWeight: 700 }} />
                      <Chip label="12 Modules" size="small" sx={{ bgcolor: 'rgba(30, 41, 59, 0.8)', color: '#94A3B8' }} />
                    </Box>
                    <Typography sx={{ fontWeight: 800, color: '#FFFFFF', fontSize: '1rem', mb: 0.5 }}>
                      Full-Stack Next.js 15 & NestJS Enterprise Engineering
                    </Typography>
                    <Typography sx={{ color: '#94A3B8', fontSize: '0.8rem', mb: 2 }}>
                      Server Components, Prisma ORM, BullMQ task runners, and Dockerized microservices.
                    </Typography>
                  </Box>
                  <Link href="/courses" style={{ textDecoration: 'none' }}>
                    <Button
                      fullWidth
                      variant="contained"
                      size="small"
                      startIcon={<MenuBookRoundedIcon />}
                      sx={{
                        bgcolor: '#38BDF8',
                        color: '#0F172A',
                        fontWeight: 800,
                        textTransform: 'none',
                        borderRadius: '10px',
                        '&:hover': { bgcolor: '#0EA5E9' },
                      }}
                    >
                      Start Recommended Course
                    </Button>
                  </Link>
                </Card>

                {/* Recommendation 2 */}
                <Card
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: '16px',
                    bgcolor: 'rgba(15, 23, 42, 0.75)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Chip label="Priority 2 • Targeted Drills" size="small" sx={{ bgcolor: 'rgba(16, 185, 129, 0.15)', color: '#34D399', fontWeight: 700 }} />
                      <Chip label="25 Drills" size="small" sx={{ bgcolor: 'rgba(30, 41, 59, 0.8)', color: '#94A3B8' }} />
                    </Box>
                    <Typography sx={{ fontWeight: 800, color: '#FFFFFF', fontSize: '1rem', mb: 0.5 }}>
                      Algorithmic Problem Solving & System Design Drills
                    </Typography>
                    <Typography sx={{ color: '#94A3B8', fontSize: '0.8rem', mb: 2 }}>
                      Dynamic Programming, graph networks, and high-concurrency database queries.
                    </Typography>
                  </Box>
                  <Link href="/practice" style={{ textDecoration: 'none' }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      size="small"
                      startIcon={<TerminalRoundedIcon />}
                      sx={{
                        color: '#34D399',
                        borderColor: 'rgba(16, 185, 129, 0.4)',
                        fontWeight: 800,
                        textTransform: 'none',
                        borderRadius: '10px',
                        '&:hover': { bgcolor: 'rgba(16, 185, 129, 0.1)', borderColor: '#10B981' },
                      }}
                    >
                      Open Practice Engine
                    </Button>
                  </Link>
                </Card>
              </Box>
            </Box>

            {/* Personalized Weekly Milestones */}
            <Box
              sx={{
                p: 2.5,
                borderRadius: '16px',
                bgcolor: 'rgba(15, 23, 42, 0.65)',
                border: '1px solid rgba(148, 163, 184, 0.15)',
              }}
            >
              <Typography sx={{ fontWeight: 800, color: '#FFFFFF', fontSize: '0.94rem', mb: 1.5 }}>
                Your Target Weekly Milestones
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 1.5 }}>
                <Box sx={{ p: 1.5, borderRadius: '10px', bgcolor: 'rgba(30, 41, 59, 0.6)' }}>
                  <Typography sx={{ color: '#38BDF8', fontWeight: 800, fontSize: '0.82rem' }}>
                    4 Practice Drills / wk
                  </Typography>
                  <Typography sx={{ color: '#94A3B8', fontSize: '0.74rem' }}>
                    Weighted Medium & Hard problems
                  </Typography>
                </Box>
                <Box sx={{ p: 1.5, borderRadius: '10px', bgcolor: 'rgba(30, 41, 59, 0.6)' }}>
                  <Typography sx={{ color: '#10B981', fontWeight: 800, fontSize: '0.82rem' }}>
                    2 Course Modules / wk
                  </Typography>
                  <Typography sx={{ color: '#94A3B8', fontSize: '0.74rem' }}>
                    Hands-on interactive lab exercises
                  </Typography>
                </Box>
                <Box sx={{ p: 1.5, borderRadius: '10px', bgcolor: 'rgba(30, 41, 59, 0.6)' }}>
                  <Typography sx={{ color: '#F59E0B', fontWeight: 800, fontSize: '0.82rem' }}>
                    1 Project Sprint / mo
                  </Typography>
                  <Typography sx={{ color: '#94A3B8', fontSize: '0.74rem' }}>
                    Verifiable portfolio artifact
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        )}
      </Box>

      {/* Footer Navigation Bar */}
      <Box
        sx={{
          p: { xs: 2, sm: 2.5 },
          borderTop: '1px solid rgba(148, 163, 184, 0.12)',
          bgcolor: 'rgba(15, 23, 42, 0.95)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Button
          disabled={currentStep === 1}
          onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
          startIcon={<ArrowBackRoundedIcon />}
          sx={{
            color: '#94A3B8',
            textTransform: 'none',
            fontWeight: 700,
            '&.Mui-disabled': { color: '#475569' },
          }}
        >
          Previous
        </Button>

        {currentStep < 4 ? (
          <Button
            variant="contained"
            disabled={currentStep === 3 && Object.keys(quizAnswers).length < DIAGNOSTIC_QUESTIONS.length}
            onClick={() => {
              if (currentStep === 3) setQuizSubmitted(true);
              setCurrentStep((prev) => Math.min(4, prev + 1));
            }}
            endIcon={<ArrowForwardRoundedIcon />}
            sx={{
              bgcolor: '#38BDF8',
              color: '#0F172A',
              fontWeight: 800,
              textTransform: 'none',
              borderRadius: '10px',
              px: 3,
              '&:hover': { bgcolor: '#0EA5E9' },
              '&.Mui-disabled': {
                bgcolor: 'rgba(56, 189, 248, 0.2)',
                color: 'rgba(148, 163, 184, 0.5)',
              },
            }}
          >
            {currentStep === 3 ? 'Generate Diagnostic Report' : 'Continue'}
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleApplyGoals}
            startIcon={<CheckCircleRoundedIcon />}
            sx={{
              bgcolor: '#10B981',
              color: '#0F172A',
              fontWeight: 800,
              textTransform: 'none',
              borderRadius: '10px',
              px: 3.5,
              '&:hover': { bgcolor: '#059669' },
            }}
          >
            Save Goals & Apply to Profile
          </Button>
        )}
      </Box>
    </Card>
  );
}
