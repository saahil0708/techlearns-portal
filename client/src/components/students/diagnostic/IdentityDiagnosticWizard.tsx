'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Box,
  Typography,
  Card,
  Button,
  Chip,
  LinearProgress,
  Slider,
  IconButton,
  Dialog,
  DialogContent,
  CircularProgress,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import PsychologyRoundedIcon from '@mui/icons-material/PsychologyRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import RocketLaunchRoundedIcon from '@mui/icons-material/RocketLaunchRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import StorageRoundedIcon from '@mui/icons-material/StorageRounded';
import CloudQueueRoundedIcon from '@mui/icons-material/CloudQueueRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import SmartToyRoundedIcon from '@mui/icons-material/SmartToyRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded';
import StarsRoundedIcon from '@mui/icons-material/StarsRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';

import { useToast } from '@/context/ToastContext';
import { apiService } from '@/lib/api-service';

// Career Tracks Definition
export interface CareerTrack {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  duration: string;
  icon: React.ReactNode;
  color: string;
  bgLight: string;
  bgGradient: string;
  bgGradientSelected: string;
  borderLight: string;
  benchmarkScore: number;
  popularRoles: string[];
}

export const CAREER_TRACKS: CareerTrack[] = [
  {
    id: 'fullstack',
    title: 'Full-Stack Web Architect',
    subtitle: 'Next.js 15, React 19, NestJS, TypeScript, PostgreSQL, and Cloud Deployments',
    badge: '🔥 Most In-Demand',
    duration: '10–12 Wks',
    icon: <CodeRoundedIcon sx={{ fontSize: 24 }} />,
    color: '#2563EB',
    bgLight: '#EFF6FF',
    bgGradient: 'linear-gradient(155deg, #F0F7FF 0%, #FFFFFF 55%, #F4F9FF 100%)',
    bgGradientSelected: 'linear-gradient(155deg, #EFF6FF 0%, #E0EEFE 40%, #FFFFFF 100%)',
    borderLight: '#BFDBFE',
    benchmarkScore: 82,
    popularRoles: ['Frontend Engineer', 'Fullstack Developer', 'UI/UX Technologist'],
  },
  {
    id: 'backend',
    title: 'Backend & Distributed Systems',
    subtitle: 'Microservices, BullMQ, Redis Caching, High Concurrency, and Distributed Locks',
    badge: '⚡ High Concurrency',
    duration: '10–12 Wks',
    icon: <StorageRoundedIcon sx={{ fontSize: 24 }} />,
    color: '#7C3AED',
    bgLight: '#F5F3FF',
    bgGradient: 'linear-gradient(155deg, #FAF5FF 0%, #FFFFFF 55%, #F7F3FE 100%)',
    bgGradientSelected: 'linear-gradient(155deg, #F5F3FF 0%, #EDE9FE 40%, #FFFFFF 100%)',
    borderLight: '#DDD6FE',
    benchmarkScore: 86,
    popularRoles: ['Backend Engineer', 'Distributed Systems Architect', 'API Specialist'],
  },
  {
    id: 'dsa',
    title: 'Algorithmic & Problem Solving (DSA)',
    subtitle: 'Dynamic Programming, Graph Theory, Segment Trees, and Contest Ranks',
    badge: '🏆 Top Tech / FAANG',
    duration: '8–10 Wks',
    icon: <EmojiEventsRoundedIcon sx={{ fontSize: 24 }} />,
    color: '#D97706',
    bgLight: '#FFFBEB',
    bgGradient: 'linear-gradient(155deg, #FFFDF5 0%, #FFFFFF 55%, #FEF9EB 100%)',
    bgGradientSelected: 'linear-gradient(155deg, #FFFBEB 0%, #FEF3C7 40%, #FFFFFF 100%)',
    borderLight: '#FDE68A',
    benchmarkScore: 90,
    popularRoles: ['Software Engineer (SDE-1)', 'Competitive Coder', 'Quant Dev'],
  },
  {
    id: 'cloud_devops',
    title: 'Cloud DevOps & Platform Engineering',
    subtitle: 'Docker, Kubernetes, CI/CD Pipelines, Infrastructure as Code, and Observability',
    badge: '☁️ Cloud Architecture',
    duration: '8–10 Wks',
    icon: <CloudQueueRoundedIcon sx={{ fontSize: 24 }} />,
    color: '#059669',
    bgLight: '#ECFDF5',
    bgGradient: 'linear-gradient(155deg, #F0FDF8 0%, #FFFFFF 55%, #F2FBF6 100%)',
    bgGradientSelected: 'linear-gradient(155deg, #ECFDF5 0%, #D1FAE5 40%, #FFFFFF 100%)',
    borderLight: '#A7F3D0',
    benchmarkScore: 78,
    popularRoles: ['DevOps Engineer', 'Site Reliability Engineer (SRE)', 'Cloud Architect'],
  },
  {
    id: 'ai_ml',
    title: 'AI, ML & Intelligent Systems',
    subtitle: 'Python, Neural Networks, LLM Embeddings, Vector Databases, and PyTorch',
    badge: '🤖 Top Trending',
    duration: '12–14 Wks',
    icon: <SmartToyRoundedIcon sx={{ fontSize: 24 }} />,
    color: '#DB2777',
    bgLight: '#FDF2F8',
    bgGradient: 'linear-gradient(155deg, #FDF4F8 0%, #FFFFFF 55%, #FAF1F6 100%)',
    bgGradientSelected: 'linear-gradient(155deg, #FDF2F8 0%, #FCE7F3 40%, #FFFFFF 100%)',
    borderLight: '#FBCFE8',
    benchmarkScore: 84,
    popularRoles: ['ML Engineer', 'AI Application Developer', 'Data Scientist'],
  },
  {
    id: 'security',
    title: 'Cybersecurity & Systems Defense',
    subtitle: 'Network Security, Threat Intelligence, Cryptography, and Zero Trust Architecture',
    badge: '🛡️ Critical Security',
    duration: '10–12 Wks',
    icon: <SecurityRoundedIcon sx={{ fontSize: 24 }} />,
    color: '#DC2626',
    bgLight: '#FEF2F2',
    bgGradient: 'linear-gradient(155deg, #FEF5F5 0%, #FFFFFF 55%, #FAF2F2 100%)',
    bgGradientSelected: 'linear-gradient(155deg, #FEF2F2 0%, #FEE2E2 40%, #FFFFFF 100%)',
    borderLight: '#FECACA',
    benchmarkScore: 80,
    popularRoles: ['Security Analyst', 'AppSec Engineer', 'Penetration Tester'],
  },
];

// Diagnostic Questions mapping for each track
export interface DiagnosticQuestion {
  id: string;
  trackId: string;
  question: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  options: { key: string; label: string }[];
  correctKey: string;
  explanation: string;
}

const TRACK_QUESTIONS: Record<string, DiagnosticQuestion[]> = {
  fullstack: [
    {
      id: 'fs_1',
      trackId: 'fullstack',
      question: 'In React 19 / Next.js App Router, which statement regarding React Server Components (RSC) is TRUE?',
      difficulty: 'Easy',
      options: [
        { key: 'A', label: 'RSCs execute on both server and client bundle simultaneously.' },
        { key: 'B', label: 'RSCs never ship component code or JavaScript dependencies to the client bundle.' },
        { key: 'C', label: 'RSCs require useState and useEffect for data synchronization.' },
        { key: 'D', label: 'RSCs cannot fetch data directly from databases via Prisma.' },
      ],
      correctKey: 'B',
      explanation: 'RSCs render purely on the server and stream HTML/JSON payloads, keeping bundle size at 0KB on client.',
    },
    {
      id: 'fs_2',
      trackId: 'fullstack',
      question: 'When implementing optimistic updates with TanStack Query or SWR, what is the key safety mechanism?',
      difficulty: 'Medium',
      options: [
        { key: 'A', label: 'Block all user clicks until the server sends a 200 OK status.' },
        { key: 'B', label: 'Save the previous cache snapshot in onMutate and roll back in onError if the mutation fails.' },
        { key: 'C', label: 'Reload the entire webpage whenever an error occurs.' },
        { key: 'D', label: 'Disable client-side cache completely.' },
      ],
      correctKey: 'B',
      explanation: 'Snapshotting previous cache allows graceful rollback on unexpected HTTP 4xx/5xx responses.',
    },
    {
      id: 'fs_3',
      trackId: 'fullstack',
      question: 'Which HTTP header prevents MIME type sniffing security vulnerabilities on modern web platforms?',
      difficulty: 'Medium',
      options: [
        { key: 'A', label: 'X-Content-Type-Options: nosniff' },
        { key: 'B', label: 'Access-Control-Allow-Origin: *' },
        { key: 'C', label: 'Cache-Control: no-cache' },
        { key: 'D', label: 'X-Frame-Options: SAMEORIGIN' },
      ],
      correctKey: 'A',
      explanation: 'X-Content-Type-Options: nosniff blocks the browser from trying to guess MIME types.',
    },
  ],
  backend: [
    {
      id: 'be_1',
      trackId: 'backend',
      question: 'Why is Redis preferred over in-memory JavaScript variables for distributed rate limiting in NestJS clusters?',
      difficulty: 'Easy',
      options: [
        { key: 'A', label: 'Redis has faster math operators than V8 engine.' },
        { key: 'B', label: 'Redis provides centralized atomic operations (INCR/EXPIRE) shared across all horizontal instances.' },
        { key: 'C', label: 'In-memory variables cannot store numbers.' },
        { key: 'D', label: 'Redis encrypts all network requests by default.' },
      ],
      correctKey: 'B',
      explanation: 'Centralized state with atomic operations guarantees rate limits apply accurately across multi-node clusters.',
    },
    {
      id: 'be_2',
      trackId: 'backend',
      question: 'In PostgreSQL database transactions, what anomaly does the "REPEATABLE READ" isolation level prevent?',
      difficulty: 'Hard',
      options: [
        { key: 'A', label: 'Dirty reads and Non-repeatable reads' },
        { key: 'B', label: 'Phantom reads only' },
        { key: 'C', label: 'Deadlocks' },
        { key: 'D', label: 'Table corruption' },
      ],
      correctKey: 'A',
      explanation: 'REPEATABLE READ guarantees any row read in a transaction remains unchanged for subsequent reads.',
    },
    {
      id: 'be_3',
      trackId: 'backend',
      question: 'What is the primary benefit of the Circuit Breaker pattern in microservice architectures?',
      difficulty: 'Medium',
      options: [
        { key: 'A', label: 'It speeds up database indexing automatically.' },
        { key: 'B', label: 'It stops cascading service failures by failing fast when a downstream dependency is unhealthy.' },
        { key: 'C', label: 'It reduces memory leaks in Node.js processes.' },
        { key: 'D', label: 'It compresses HTTP response payloads.' },
      ],
      correctKey: 'B',
      explanation: 'Failing fast prevents resource exhaustion (threads/sockets) when downstream services crash.',
    },
  ],
  dsa: [
    {
      id: 'dsa_1',
      trackId: 'dsa',
      question: 'What is the worst-case time complexity of searching an element in a balanced AVL tree with N nodes?',
      difficulty: 'Easy',
      options: [
        { key: 'A', label: 'O(1)' },
        { key: 'B', label: 'O(log N)' },
        { key: 'C', label: 'O(N)' },
        { key: 'D', label: 'O(N log N)' },
      ],
      correctKey: 'B',
      explanation: 'AVL trees strictly maintain balance factor |hL - hR| <= 1, guaranteeing O(log N) height.',
    },
    {
      id: 'dsa_2',
      trackId: 'dsa',
      question: 'Which algorithm finds Single-Source Shortest Paths in graphs with negative edge weights (no negative cycles)?',
      difficulty: 'Medium',
      options: [
        { key: 'A', label: "Dijkstra's Algorithm" },
        { key: 'B', label: 'Bellman-Ford Algorithm' },
        { key: 'C', label: "Prim's Algorithm" },
        { key: 'D', label: "Kruskal's Algorithm" },
      ],
      correctKey: 'B',
      explanation: 'Bellman-Ford relaxes all edges |V| - 1 times, handling negative weights and detecting negative cycles.',
    },
    {
      id: 'dsa_3',
      trackId: 'dsa',
      question: 'In Disjoint Set Union (DSU), what is the amortized time complexity per operation with Path Compression & Union by Rank?',
      difficulty: 'Hard',
      options: [
        { key: 'A', label: 'O(α(N)) - Inverse Ackermann Function' },
        { key: 'B', label: 'O(log N)' },
        { key: 'C', label: 'O(1) strict' },
        { key: 'D', label: 'O(sqrt(N))' },
      ],
      correctKey: 'A',
      explanation: 'Combining path compression with union by rank achieves near-constant inverse Ackermann complexity.',
    },
  ],
  cloud_devops: [
    {
      id: 'cd_1',
      trackId: 'cloud_devops',
      question: 'What is the purpose of multi-stage Docker builds?',
      difficulty: 'Easy',
      options: [
        { key: 'A', label: 'To run multiple operating systems in one container.' },
        { key: 'B', label: 'To separate build dependencies from the final lightweight production runtime image.' },
        { key: 'C', label: 'To increase container startup time.' },
        { key: 'D', label: 'To automatically deploy to AWS ECS.' },
      ],
      correctKey: 'B',
      explanation: 'Multi-stage builds leave compiler tools in intermediate stages, keeping the final image lean & secure.',
    },
    {
      id: 'cd_2',
      trackId: 'cloud_devops',
      question: 'In Kubernetes, which object ensures exactly one copy of a Pod runs on every matching Node in the cluster?',
      difficulty: 'Medium',
      options: [
        { key: 'A', label: 'Deployment' },
        { key: 'B', label: 'DaemonSet' },
        { key: 'C', label: 'StatefulSet' },
        { key: 'D', label: 'Job' },
      ],
      correctKey: 'B',
      explanation: 'DaemonSets ensure that all (or some) nodes run a copy of a pod (ideal for logging/metrics agents).',
    },
    {
      id: 'cd_3',
      trackId: 'cloud_devops',
      question: 'What does Canary Deployment strategy entail?',
      difficulty: 'Medium',
      options: [
        { key: 'A', label: 'Replacing 100% of servers at midnight.' },
        { key: 'B', label: 'Routing a small percentage of live traffic to the new version to test reliability before full rollout.' },
        { key: 'C', label: 'Running tests only in staging environments.' },
        { key: 'D', label: 'Rolling back whenever CPU usage hits 50%.' },
      ],
      correctKey: 'B',
      explanation: 'Canary testing verifies real user traffic on a minor subset before widening deployment.',
    },
  ],
  ai_ml: [
    {
      id: 'ai_1',
      trackId: 'ai_ml',
      question: 'What is the primary role of the Self-Attention mechanism in Transformer architectures?',
      difficulty: 'Medium',
      options: [
        { key: 'A', label: 'To reduce image resolution for convolutional layers.' },
        { key: 'B', label: 'To compute dynamic contextual relationships between all tokens in a sequence regardless of distance.' },
        { key: 'C', label: 'To compress vector weights to 8-bit integers.' },
        { key: 'D', label: 'To eliminate the need for training data.' },
      ],
      correctKey: 'B',
      explanation: 'Self-attention calculates pairwise token interactions, capturing long-range contextual semantic dependencies.',
    },
    {
      id: 'ai_2',
      trackId: 'ai_ml',
      question: 'Which vector search metric is most commonly used to measure semantic similarity between normalized text embeddings?',
      difficulty: 'Easy',
      options: [
        { key: 'A', label: 'Cosine Similarity' },
        { key: 'B', label: 'Manhattan Distance' },
        { key: 'C', label: 'Hamming Distance' },
        { key: 'D', label: 'Jaccard Index' },
      ],
      correctKey: 'A',
      explanation: 'Cosine similarity measures the angle between vectors, ideal for high-dimensional semantic spaces.',
    },
    {
      id: 'ai_3',
      trackId: 'ai_ml',
      question: 'What problem does Retrieval-Augmented Generation (RAG) primarily solve for Large Language Models?',
      difficulty: 'Medium',
      options: [
        { key: 'A', label: 'Reduces model hallucinations by injecting factual, domain-specific context from external documents.' },
        { key: 'B', label: 'Increases model inference latency.' },
        { key: 'C', label: 'Replaces the neural network weights entirely.' },
        { key: 'D', label: 'Allows training without GPUs.' },
      ],
      correctKey: 'A',
      explanation: 'RAG grounds LLM generation in verified, real-time knowledge bases without expensive retraining.',
    },
  ],
  security: [
    {
      id: 'sec_1',
      trackId: 'security',
      question: 'How does Cross-Site Request Forgery (CSRF) token validation protect web applications?',
      difficulty: 'Medium',
      options: [
        { key: 'A', label: 'It encrypts database passwords.' },
        { key: 'B', label: 'It verifies that state-changing requests originate from the legitimate user session via a secret token.' },
        { key: 'C', label: 'It prevents SQL injection vulnerabilities.' },
        { key: 'D', label: 'It forces users to change passwords every 30 days.' },
      ],
      correctKey: 'B',
      explanation: 'CSRF tokens are unpredictable server-generated secrets tied to the user session, preventing forged submissions.',
    },
    {
      id: 'sec_2',
      trackId: 'security',
      question: 'Which cryptographic algorithm is currently standard for generating asymmetric key pairs for HTTPS/TLS certificates?',
      difficulty: 'Easy',
      options: [
        { key: 'A', label: 'RSA 2048/4096 and ECDSA (e.g. Curve25519)' },
        { key: 'B', label: 'MD5 Hash' },
        { key: 'C', label: 'DES 56-bit' },
        { key: 'D', label: 'Base64 Encoding' },
      ],
      correctKey: 'A',
      explanation: 'RSA and Elliptic Curve Cryptography (ECDSA) form the cryptographic bedrock of TLS 1.3 encryption.',
    },
    {
      id: 'sec_3',
      trackId: 'security',
      question: 'What does the Principle of Least Privilege (PoLP) dictate in software architecture?',
      difficulty: 'Easy',
      options: [
        { key: 'A', label: 'Every user should have administrative root access.' },
        { key: 'B', label: 'Entities are granted only the minimum permissions necessary to perform their required job function.' },
        { key: 'C', label: 'All servers should be on the public internet.' },
        { key: 'D', label: 'Passwords should be stored in plain text.' },
      ],
      correctKey: 'B',
      explanation: 'PoLP minimizes potential damage from compromised accounts or software vulnerabilities.',
    },
  ],
};

export interface IdentityDiagnosticWizardProps {
  open?: boolean;
  onClose?: () => void;
  onComplete?: (result?: any) => void;
  userId?: string;
  isModal?: boolean;
  initialTrack?: string;
}

export const STEP_ITEMS = [
  { step: 1, label: 'Career Track', desc: 'Aspirations & Domain' },
  { step: 2, label: 'Skill Assessment', desc: 'Confidence Rating' },
  { step: 3, label: 'Calibration Quiz', desc: 'Rapid Benchmark' },
  { step: 4, label: 'Curated Roadmap', desc: 'Courses & Goals' },
];

export function IdentityDiagnosticWizard({
  open = true,
  onClose = () => {},
  onComplete,
  isModal = true,
  initialTrack = 'fullstack',
}: IdentityDiagnosticWizardProps) {
  const { showToast } = useToast();

  // Wizard Navigation
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedTrack, setSelectedTrack] = useState<string>(initialTrack);

  // Skill Self-Ratings (1-5 scale)
  const [skillRatings, setSkillRatings] = useState<Record<string, number>>({
    frontend: 3,
    backend: 3,
    dsa: 3,
    database: 3,
    devops: 2,
    system_design: 2,
  });

  // Quiz Answers
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizScore, setQuizScore] = useState<number>(0);

  // Weekly Goals & Target Role
  const [targetWeeklyHours, setTargetWeeklyHours] = useState<number>(10);
  const [targetRole, setTargetRole] = useState<string>('Full-Stack Software Engineer');
  const [targetProblemsPerWeek, setTargetProblemsPerWeek] = useState<number>(15);

  // Real courses fetched from database
  const [allCourses, setAllCourses] = useState<any[]>([]);
  const [enrollingCourseId, setEnrollingCourseId] = useState<string | null>(null);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<Set<string>>(new Set());

  // Saving state
  const [savingGoals, setSavingGoals] = useState<boolean>(false);

  // Fetch real platform courses
  useEffect(() => {
    async function loadCourses() {
      try {
        const res = await apiService.getCourses();
        const courses = (res as any)?.courses || (res as any)?.data || (Array.isArray(res) ? res : []);
        setAllCourses(courses);

        // Check already enrolled courses
        const enrolled = new Set<string>();
        courses.forEach((c: any) => {
          if (c.enrolled || c.isEnrolled || c.userEnrollment) {
            enrolled.add(c.id);
          }
        });
        setEnrolledCourseIds(enrolled);
      } catch (err) {
        console.warn('Failed to load courses for diagnostic wizard', err);
      }
    }
    loadCourses();
  }, []);

  const activeTrackObj = CAREER_TRACKS.find((t) => t.id === selectedTrack) || CAREER_TRACKS[0];
  const questionsForTrack = TRACK_QUESTIONS[selectedTrack] || TRACK_QUESTIONS.fullstack;

  // Handle Quiz answer
  const handleSelectAnswer = (qId: string, optionKey: string) => {
    setQuizAnswers((prev) => ({ ...prev, [qId]: optionKey }));
  };

  // Evaluate Quiz
  const handleEvaluateQuiz = () => {
    let correctCount = 0;
    questionsForTrack.forEach((q) => {
      if (quizAnswers[q.id] === q.correctKey) {
        correctCount += 1;
      }
    });
    const calculatedPercentage = Math.round((correctCount / questionsForTrack.length) * 100);
    setQuizScore(calculatedPercentage);
    setCurrentStep(4);
  };

  // 1-Click Course Enroll
  const handleEnrollCourse = async (courseId: string) => {
    try {
      setEnrollingCourseId(courseId);
      await apiService.enrollInCourse(courseId);
      setEnrolledCourseIds((prev) => new Set([...prev, courseId]));
      showToast('Successfully enrolled in recommended course!', 'success');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to enroll';
      if (msg.toLowerCase().includes('already enrolled')) {
        setEnrolledCourseIds((prev) => new Set([...prev, courseId]));
        showToast('You are already enrolled in this course!', 'info');
      } else {
        showToast(msg, 'error');
      }
    } finally {
      setEnrollingCourseId(null);
    }
  };

  // Apply Diagnostic & Goals to Backend
  const handleApplyGoals = async () => {
    setSavingGoals(true);
    try {
      // 1. Sync Diagnostic to backend
      const diagnosticPayload = {
        targetTrack: selectedTrack,
        skillRatings,
        quizScore,
        completedAt: new Date().toISOString(),
      };

      try {
        if ((apiService as any).saveStudentDiagnostic) {
          await (apiService as any).saveStudentDiagnostic(diagnosticPayload);
        } else if ((apiService as any).updateStudentDiagnostic) {
          await (apiService as any).updateStudentDiagnostic(diagnosticPayload);
        }
      } catch (e) {
        console.warn('Backend saveStudentDiagnostic fallback', e);
      }

      // 2. Sync Goals to student profile
      const goalsPayload = {
        targetRole,
        primaryTrack: selectedTrack,
        targetWeeklyHours,
        targetProblemsPerWeek,
        diagnosticScore: quizScore,
      };

      try {
        if ((apiService as any).saveStudentGoals) {
          await (apiService as any).saveStudentGoals(goalsPayload);
        } else if ((apiService as any).updateStudentGoals) {
          await (apiService as any).updateStudentGoals(goalsPayload);
        }
      } catch (e) {
        console.warn('Backend saveStudentGoals fallback', e);
      }

      // Save locally to localStorage as immediate offline cache
      if (typeof window !== 'undefined') {
        localStorage.setItem('student_diagnostic_completed', 'true');
        localStorage.setItem(
          'student_diagnostic_result',
          JSON.stringify({
            ...diagnosticPayload,
            ...goalsPayload,
          })
        );
      }

      showToast('Career diagnostic & goals successfully calibrated!', 'success');

      if (onComplete) {
        onComplete({
          track: selectedTrack,
          score: quizScore,
          goals: goalsPayload,
        });
      }
      onClose();
    } catch (err: any) {
      showToast(err?.message || 'Failed to save goals', 'error');
    } finally {
      setSavingGoals(false);
    }
  };

  // Calculate matching recommended courses for the active track
  const recommendedCourses = allCourses.filter((c) => {
    const text = `${c.title} ${c.description || ''} ${c.category || ''} ${c.slug || ''}`.toLowerCase();
    if (selectedTrack === 'fullstack') {
      return text.includes('web') || text.includes('react') || text.includes('full') || text.includes('node') || text.includes('next');
    }
    if (selectedTrack === 'backend') {
      return text.includes('back') || text.includes('node') || text.includes('nest') || text.includes('database') || text.includes('sql') || text.includes('system');
    }
    if (selectedTrack === 'dsa') {
      return text.includes('algo') || text.includes('data structure') || text.includes('dsa') || text.includes('python') || text.includes('c++') || text.includes('java');
    }
    if (selectedTrack === 'cloud_devops') {
      return text.includes('cloud') || text.includes('devops') || text.includes('docker') || text.includes('linux');
    }
    if (selectedTrack === 'ai_ml') {
      return text.includes('ai') || text.includes('ml') || text.includes('machine') || text.includes('python') || text.includes('data');
    }
    if (selectedTrack === 'security') {
      return text.includes('security') || text.includes('cyber') || text.includes('network');
    }
    return true;
  }).slice(0, 3);

  // Fallback courses if db has 0 matching
  const displayCourses = recommendedCourses.length > 0 ? recommendedCourses : allCourses.slice(0, 3);

  // Inner Wizard Content
  const wizardContent = (
    <Box sx={{ bgcolor: '#FFFFFF', color: '#0F172A', borderRadius: '16px', overflow: 'hidden' }}>
      {/* Top Header */}
      <Box
        sx={{
          px: { xs: 2.5, md: 4 },
          py: 2.5,
          bgcolor: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              bgcolor: '#EFF6FF',
              border: '1px solid #BFDBFE',
              color: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.12)',
            }}
          >
            <PsychologyRoundedIcon fontSize="medium" />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.15rem', lineHeight: 1.2 }}>
              Career Interest & Diagnostic Engine
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B', fontSize: '0.85rem' }}>
              Calibrate your engineering track, evaluate baseline skills, and generate a tailored roadmap
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            label={`Step ${currentStep} of 4`}
            size="small"
            sx={{
              bgcolor: '#EFF6FF',
              color: '#1D4ED8',
              fontWeight: 700,
              fontSize: '0.78rem',
              border: '1px solid #DBEAFE',
              borderRadius: '8px',
            }}
          />
          {isModal && (
            <IconButton onClick={onClose} size="small" sx={{ color: '#64748B', '&:hover': { bgcolor: '#F1F5F9', color: '#0F172A' } }}>
              <CloseRoundedIcon />
            </IconButton>
          )}
        </Box>
      </Box>

      {/* Stepper Progress Bar */}
      <Box sx={{ bgcolor: '#F8FAFC', px: { xs: 2.5, md: 4 }, py: 2, borderBottom: '1px solid #E2E8F0' }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
            gap: 2,
            alignItems: 'center',
          }}
        >
          {STEP_ITEMS.map((item) => {
            const isActive = currentStep === item.step;
            const isDone = currentStep > item.step;
            return (
              <Box
                key={item.step}
                onClick={() => {
                  if (item.step < currentStep) setCurrentStep(item.step);
                }}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  cursor: item.step < currentStep ? 'pointer' : 'default',
                  opacity: item.step > currentStep ? 0.6 : 1,
                  transition: 'all 0.2s ease',
                }}
              >
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    flexShrink: 0,
                    bgcolor: isDone ? '#10B981' : isActive ? '#2563EB' : '#E2E8F0',
                    color: isDone || isActive ? '#FFFFFF' : '#64748B',
                    boxShadow: isActive ? '0 0 0 4px rgba(37, 99, 235, 0.15)' : 'none',
                    transition: 'all 0.2s',
                  }}
                >
                  {isDone ? <TaskAltRoundedIcon sx={{ fontSize: 18 }} /> : item.step}
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      fontWeight: isActive ? 800 : isDone ? 700 : 600,
                      color: isActive ? '#2563EB' : isDone ? '#0F172A' : '#64748B',
                      lineHeight: 1.1,
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                    }}
                  >
                    {item.label}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      display: { xs: 'none', md: 'block' },
                      color: '#94A3B8',
                      fontSize: '0.72rem',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                    }}
                  >
                    {item.desc}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
        <LinearProgress
          variant="determinate"
          value={(currentStep / 4) * 100}
          sx={{
            mt: 1.5,
            height: 4,
            borderRadius: 2,
            bgcolor: '#E2E8F0',
            '& .MuiLinearProgress-bar': {
              bgcolor: '#2563EB',
              borderRadius: 2,
            },
          }}
        />
      </Box>

      {/* Step Contents */}
      <Box sx={{ p: { xs: 2.5, md: 4 }, bgcolor: '#FFFFFF', minHeight: 460 }}>
        {/* STEP 1: CAREER TRACK SELECTION */}
        {currentStep === 1 && (
          <Box>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', mb: 0.5 }}>
                Select Your Target Engineering Track
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748B' }}>
                Your baseline diagnostic quiz, recommended curriculum, and weekly goals will calibrate directly to this discipline.
              </Typography>
            </Box>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
                gap: 2.5,
              }}
            >
              {CAREER_TRACKS.map((track) => {
                const isSelected = selectedTrack === track.id;
                return (
                  <Card
                    key={track.id}
                    onClick={() => {
                      setSelectedTrack(track.id);
                      setQuizAnswers({});
                    }}
                    sx={{
                      p: 2.5,
                      cursor: 'pointer',
                      borderRadius: '16px',
                      position: 'relative',
                      border: isSelected
                        ? `2px solid ${track.color}`
                        : '1.5px solid #E2E8F0',
                      background: isSelected ? track.bgGradientSelected : track.bgGradient,
                      boxShadow: isSelected
                        ? `0 10px 28px -4px ${track.color}35, 0 0 0 1px ${track.color}`
                        : '0 2px 8px 0 rgba(15, 23, 42, 0.04)',
                      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      '&:hover': {
                        borderColor: track.color,
                        transform: 'translateY(-3px)',
                        boxShadow: `0 12px 28px -4px ${track.color}25, 0 2px 6px rgba(0,0,0,0.04)`,
                      },
                    }}
                  >
                    <Box>
                      {/* Card Header with Icon, Badge & Radio/Check Indicator */}
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                          <Box
                            sx={{
                              width: 46,
                              height: 46,
                              borderRadius: '14px',
                              bgcolor: '#FFFFFF',
                              color: track.color,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              border: `1.5px solid ${isSelected ? track.color : track.borderLight}`,
                              boxShadow: isSelected
                                ? `0 4px 12px ${track.color}30`
                                : `0 2px 6px rgba(0,0,0,0.04)`,
                              transition: 'all 0.2s ease',
                            }}
                          >
                            {track.icon}
                          </Box>
                          <Chip
                            label={track.badge}
                            size="small"
                            sx={{
                              height: 24,
                              fontSize: '0.7rem',
                              fontWeight: 800,
                              bgcolor: isSelected ? '#FFFFFF' : `${track.color}12`,
                              color: track.color,
                              border: `1px solid ${track.borderLight}`,
                              borderRadius: '6px',
                            }}
                          />
                        </Box>

                        {/* Interactive Selected Circle */}
                        <Box
                          sx={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            border: isSelected ? `2px solid ${track.color}` : '2px solid #CBD5E1',
                            bgcolor: isSelected ? track.color : '#FFFFFF',
                            boxShadow: isSelected ? `0 0 0 4px ${track.color}25` : 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          {isSelected && <CheckCircleRoundedIcon sx={{ color: '#FFFFFF', fontSize: 18 }} />}
                        </Box>
                      </Box>

                      {/* Title & Subtitle */}
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 800,
                          color: '#0F172A',
                          mb: 0.7,
                          fontSize: '1.02rem',
                          lineHeight: 1.3,
                        }}
                      >
                        {track.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#475569',
                          fontSize: '0.82rem',
                          mb: 2,
                          minHeight: 38,
                          lineHeight: 1.45,
                        }}
                      >
                        {track.subtitle}
                      </Typography>

                      {/* Quick Meta Row: Benchmark & Duration */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            bgcolor: '#FFFFFF',
                            px: 1,
                            py: 0.3,
                            borderRadius: '6px',
                            border: '1px solid #E2E8F0',
                          }}
                        >
                          <InsightsRoundedIcon sx={{ fontSize: 14, color: track.color }} />
                          <Typography variant="caption" sx={{ color: '#334155', fontWeight: 700, fontSize: '0.72rem' }}>
                            Index: {track.benchmarkScore} pts
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            bgcolor: '#FFFFFF',
                            px: 1,
                            py: 0.3,
                            borderRadius: '6px',
                            border: '1px solid #E2E8F0',
                          }}
                        >
                          <AccessTimeRoundedIcon sx={{ fontSize: 14, color: '#64748B' }} />
                          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, fontSize: '0.72rem' }}>
                            {track.duration}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    {/* Roles Footer with Executive Pills */}
                    <Box
                      sx={{
                        pt: 1.5,
                        borderTop: '1px solid',
                        borderColor: isSelected ? track.borderLight : '#E2E8F0',
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          color: '#64748B',
                          fontWeight: 800,
                          display: 'block',
                          mb: 0.8,
                          fontSize: '0.68rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}
                      >
                        Target Career Roles
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>
                        {track.popularRoles.map((role) => (
                          <Chip
                            key={role}
                            label={role}
                            size="small"
                            sx={{
                              fontSize: '0.72rem',
                              height: 24,
                              bgcolor: isSelected ? '#FFFFFF' : '#FFFFFF',
                              color: isSelected ? '#0F172A' : '#334155',
                              border: isSelected
                                ? `1.5px solid ${track.borderLight}`
                                : '1px solid #E2E8F0',
                              fontWeight: isSelected ? 700 : 600,
                              boxShadow: isSelected ? '0 1px 3px rgba(0,0,0,0.05)' : 'none',
                              borderRadius: '6px',
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  </Card>
                );
              })}
            </Box>
          </Box>
        )}

        {/* STEP 2: SKILL SELF-ASSESSMENT */}
        {currentStep === 2 && (
          <Box>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', mb: 0.5 }}>
                Rate Your Confidence in Core Domains
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748B' }}>
                Self-evaluate your comfort level from Beginner (1) to Expert (5). This adjusts diagnostic starting levels and course prerequisites.
              </Typography>
            </Box>

            {/* Active Track Highlight Banner */}
            <Box
              sx={{
                p: 2,
                mb: 3,
                borderRadius: '12px',
                bgcolor: activeTrackObj.bgLight,
                border: `1px solid ${activeTrackObj.borderLight}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '10px',
                    bgcolor: '#FFFFFF',
                    color: activeTrackObj.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `1px solid ${activeTrackObj.borderLight}`,
                  }}
                >
                  {activeTrackObj.icon}
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A' }}>
                    Track: {activeTrackObj.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B' }}>
                    Standard industry benchmark index: {activeTrackObj.benchmarkScore}/100 pts
                  </Typography>
                </Box>
              </Box>
              <Button
                size="small"
                variant="outlined"
                onClick={() => setCurrentStep(1)}
                sx={{
                  borderColor: activeTrackObj.color,
                  color: activeTrackObj.color,
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  textTransform: 'none',
                  borderRadius: '8px',
                  bgcolor: '#FFFFFF',
                  '&:hover': { bgcolor: '#F8FAFC', borderColor: activeTrackObj.color },
                }}
              >
                Change Track
              </Button>
            </Box>

            {/* Rating Sliders */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2.5 }}>
              {[
                { key: 'frontend', label: 'Frontend & UI Engineering', desc: 'React, Next.js, HTML5/CSS3, TypeScript, State Management' },
                { key: 'backend', label: 'Backend APIs & Architecture', desc: 'Node.js, NestJS/Express, RESTful endpoints, Auth & Security' },
                { key: 'dsa', label: 'Data Structures & Algorithms', desc: 'Arrays, Trees, Graphs, Dynamic Programming, Time Complexity' },
                { key: 'database', label: 'Database Design & SQL', desc: 'PostgreSQL, Prisma ORM, Query Optimization, Indexing' },
                { key: 'devops', label: 'DevOps & Cloud Infrastructure', desc: 'Docker, CI/CD pipelines, Kubernetes, Cloud Deployments' },
                { key: 'system_design', label: 'System Design & Scalability', desc: 'Caching, Microservices, Message Queues (Redis/BullMQ)' },
              ].map((skill) => {
                const val = skillRatings[skill.key] || 3;
                const labels = ['', 'Beginner', 'Elementary', 'Intermediate', 'Advanced', 'Expert'];
                return (
                  <Card
                    key={skill.key}
                    sx={{
                      p: 2.5,
                      borderRadius: '12px',
                      border: '1.5px solid #E2E8F0',
                      bgcolor: '#FFFFFF',
                      boxShadow: '0 1px 3px 0 rgba(0,0,0,0.04)',
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A' }}>
                          {skill.label}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
                          {skill.desc}
                        </Typography>
                      </Box>
                      <Chip
                        label={`${labels[val]} (${val}/5)`}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          bgcolor: val >= 4 ? '#ECFDF5' : val === 3 ? '#EFF6FF' : '#FFFBEB',
                          color: val >= 4 ? '#059669' : val === 3 ? '#2563EB' : '#D97706',
                          border: '1px solid',
                          borderColor: val >= 4 ? '#A7F3D0' : val === 3 ? '#BFDBFE' : '#FDE68A',
                        }}
                      />
                    </Box>

                    <Slider
                      value={val}
                      min={1}
                      max={5}
                      step={1}
                      marks={[
                        { value: 1, label: '1' },
                        { value: 2, label: '2' },
                        { value: 3, label: '3' },
                        { value: 4, label: '4' },
                        { value: 5, label: '5' },
                      ]}
                      onChange={(_, newVal) =>
                        setSkillRatings((prev) => ({ ...prev, [skill.key]: newVal as number }))
                      }
                      sx={{
                        color: '#2563EB',
                        height: 6,
                        mt: 1,
                        '& .MuiSlider-thumb': {
                          bgcolor: '#FFFFFF',
                          border: '3px solid #2563EB',
                          boxShadow: '0 2px 6px rgba(37,99,235,0.3)',
                          '&:hover, &.Mui-focusVisible': {
                            boxShadow: '0 0 0 8px rgba(37,99,235,0.16)',
                          },
                        },
                        '& .MuiSlider-track': {
                          bgcolor: '#2563EB',
                        },
                        '& .MuiSlider-rail': {
                          bgcolor: '#E2E8F0',
                        },
                        '& .MuiSlider-markLabel': {
                          color: '#94A3B8',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                        },
                      }}
                    />
                  </Card>
                );
              })}
            </Box>
          </Box>
        )}

        {/* STEP 3: RAPID DIAGNOSTIC CALIBRATION QUIZ */}
        {currentStep === 3 && (
          <Box>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', mb: 0.5 }}>
                {activeTrackObj.title} — Diagnostic Calibration Quiz
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748B' }}>
                Answer these 3 conceptual questions to calibrate your knowledge baseline and unlock targeted course recommendations.
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {questionsForTrack.map((q, qIndex) => {
                const selectedOption = quizAnswers[q.id];
                return (
                  <Card
                    key={q.id}
                    sx={{
                      p: 3,
                      borderRadius: '14px',
                      border: '1.5px solid #E2E8F0',
                      bgcolor: '#FFFFFF',
                      boxShadow: '0 1px 3px 0 rgba(0,0,0,0.04)',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={`Question ${qIndex + 1} of ${questionsForTrack.length}`}
                          size="small"
                          sx={{
                            fontWeight: 800,
                            bgcolor: '#EFF6FF',
                            color: '#2563EB',
                            fontSize: '0.75rem',
                            border: '1px solid #DBEAFE',
                          }}
                        />
                        <Chip
                          label={q.difficulty}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            fontSize: '0.72rem',
                            bgcolor:
                              q.difficulty === 'Easy'
                                ? '#ECFDF5'
                                : q.difficulty === 'Medium'
                                ? '#FFFBEB'
                                : '#FEF2F2',
                            color:
                              q.difficulty === 'Easy'
                                ? '#059669'
                                : q.difficulty === 'Medium'
                                ? '#D97706'
                                : '#DC2626',
                            border: '1px solid',
                            borderColor:
                              q.difficulty === 'Easy'
                                ? '#A7F3D0'
                                : q.difficulty === 'Medium'
                                ? '#FDE68A'
                                : '#FECACA',
                          }}
                        />
                      </Box>
                    </Box>

                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0F172A', mb: 2, fontSize: '0.95rem' }}>
                      {q.question}
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      {q.options.map((opt) => {
                        const isChosen = selectedOption === opt.key;
                        return (
                          <Box
                            key={opt.key}
                            onClick={() => handleSelectAnswer(q.id, opt.key)}
                            sx={{
                              p: 1.8,
                              borderRadius: '10px',
                              cursor: 'pointer',
                              border: isChosen ? '2px solid #2563EB' : '1.5px solid #E2E8F0',
                              bgcolor: isChosen ? '#EFF6FF' : '#FFFFFF',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1.5,
                              transition: 'all 0.15s ease',
                              '&:hover': {
                                bgcolor: isChosen ? '#EFF6FF' : '#F8FAFC',
                                borderColor: isChosen ? '#2563EB' : '#93C5FD',
                              },
                            }}
                          >
                            <Box
                              sx={{
                                width: 28,
                                height: 28,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 800,
                                fontSize: '0.8rem',
                                bgcolor: isChosen ? '#2563EB' : '#F1F5F9',
                                color: isChosen ? '#FFFFFF' : '#475569',
                                border: isChosen ? 'none' : '1px solid #CBD5E1',
                              }}
                            >
                              {opt.key}
                            </Box>
                            <Typography
                              variant="body2"
                              sx={{
                                color: isChosen ? '#1E3A8A' : '#334155',
                                fontWeight: isChosen ? 700 : 500,
                                fontSize: '0.88rem',
                              }}
                            >
                              {opt.label}
                            </Typography>
                          </Box>
                        );
                      })}
                    </Box>
                  </Card>
                );
              })}
            </Box>
          </Box>
        )}

        {/* STEP 4: CURATED ROADMAP, RECOMMENDED COURSES & TARGET GOALS */}
        {currentStep === 4 && (
          <Box>
            {/* Score & Diagnostic Hero Card */}
            <Card
              sx={{
                p: 3,
                mb: 3.5,
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #EFF6FF 0%, #F0FDF4 100%)',
                border: '1.5px solid #BFDBFE',
                boxShadow: '0 4px 12px 0 rgba(37,99,235,0.06)',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', md: 'row' },
                  alignItems: { xs: 'flex-start', md: 'center' },
                  justifyContent: 'space-between',
                  gap: 2.5,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: '14px',
                      bgcolor: '#2563EB',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
                    }}
                  >
                    <StarsRoundedIcon sx={{ fontSize: 32 }} />
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
                      Calibration Complete: {activeTrackObj.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#475569', mt: 0.3 }}>
                      Diagnostic Score: <strong>{quizScore}%</strong> • Target Readiness Baseline Calibrated
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                  <Chip
                    icon={<CheckCircleRoundedIcon sx={{ fontSize: 16 }} />}
                    label="Curriculum Generated"
                    sx={{
                      bgcolor: '#DCFCE7',
                      color: '#15803D',
                      fontWeight: 700,
                      border: '1px solid #86EFAC',
                    }}
                  />
                  <Chip
                    icon={<AutoAwesomeRoundedIcon sx={{ fontSize: 16 }} />}
                    label="Ready for Practice"
                    sx={{
                      bgcolor: '#DBEAFE',
                      color: '#1E40AF',
                      fontWeight: 700,
                      border: '1px solid #93C5FD',
                    }}
                  />
                </Box>
              </Box>
            </Card>

            {/* Recommended Courses Section */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A' }}>
                    Recommended Platform Courses for {activeTrackObj.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B' }}>
                    Curated structured learning tracks based on your diagnostic answers. Click Enroll to add directly to your profile.
                  </Typography>
                </Box>
                <Button
                  component={Link}
                  href="/courses"
                  size="small"
                  sx={{
                    color: '#2563EB',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    textTransform: 'none',
                    '&:hover': { bgcolor: '#EFF6FF' },
                  }}
                >
                  Browse All Courses →
                </Button>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
                {displayCourses.map((course) => {
                  const isEnrolled = enrolledCourseIds.has(course.id);
                  const isEnrolling = enrollingCourseId === course.id;

                  return (
                    <Card
                      key={course.id}
                      sx={{
                        p: 2.5,
                        borderRadius: '12px',
                        border: isEnrolled ? '1.5px solid #10B981' : '1.5px solid #E2E8F0',
                        bgcolor: isEnrolled ? '#F0FDF4' : '#FFFFFF',
                        boxShadow: '0 1px 3px 0 rgba(0,0,0,0.04)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          borderColor: isEnrolled ? '#10B981' : '#93C5FD',
                          boxShadow: '0 4px 12px 0 rgba(37,99,235,0.08)',
                        },
                      }}
                    >
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                          <Chip
                            label={course.level || course.difficulty || 'Intermediate'}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              bgcolor: '#EFF6FF',
                              color: '#1D4ED8',
                              border: '1px solid #BFDBFE',
                            }}
                          />
                          {isEnrolled && (
                            <Chip
                              label="Enrolled"
                              size="small"
                              color="success"
                              sx={{ height: 20, fontSize: '0.68rem', fontWeight: 800 }}
                            />
                          )}
                        </Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', mb: 0.5, lineHeight: 1.3 }}>
                          {course.title}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: '#64748B',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            mb: 2,
                            lineHeight: 1.4,
                          }}
                        >
                          {course.description || 'Master key fundamentals, hands-on architectural design, and modern best practices.'}
                        </Typography>
                      </Box>

                      <Box sx={{ pt: 1.5, borderTop: '1px solid #F1F5F9' }}>
                        {isEnrolled ? (
                          <Button
                            component={Link}
                            href={`/courses/${course.slug || course.id}`}
                            fullWidth
                            variant="outlined"
                            color="success"
                            size="small"
                            sx={{
                              textTransform: 'none',
                              fontWeight: 700,
                              borderRadius: '8px',
                            }}
                          >
                            Continue Learning
                          </Button>
                        ) : (
                          <Button
                            onClick={() => handleEnrollCourse(course.id)}
                            disabled={isEnrolling}
                            fullWidth
                            variant="contained"
                            size="small"
                            startIcon={isEnrolling ? <CircularProgress size={14} color="inherit" /> : <RocketLaunchRoundedIcon />}
                            sx={{
                              bgcolor: '#2563EB',
                              color: '#FFFFFF',
                              textTransform: 'none',
                              fontWeight: 700,
                              borderRadius: '8px',
                              boxShadow: 'none',
                              '&:hover': { bgcolor: '#1D4ED8' },
                            }}
                          >
                            {isEnrolling ? 'Enrolling...' : 'Enroll in Course'}
                          </Button>
                        )}
                      </Box>
                    </Card>
                  );
                })}
              </Box>
            </Box>

            {/* Target Goals Configuration */}
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A', mb: 0.5 }}>
                Configure Your Weekly Learning Targets
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mb: 2.5 }}>
                These goals sync with your student dashboard and feed your weekly momentum metrics.
              </Typography>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2.5 }}>
                {/* Problems per week */}
                <Card
                  sx={{
                    p: 2.5,
                    borderRadius: '12px',
                    border: '1.5px solid #E2E8F0',
                    bgcolor: '#FFFFFF',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A' }}>
                      Target Problems Solved / Week
                    </Typography>
                    <Chip
                      label={`${targetProblemsPerWeek} Problems`}
                      size="small"
                      sx={{ bgcolor: '#EFF6FF', color: '#2563EB', fontWeight: 800, border: '1px solid #BFDBFE' }}
                    />
                  </Box>
                  <Slider
                    value={targetProblemsPerWeek}
                    min={5}
                    max={40}
                    step={5}
                    marks={[
                      { value: 5, label: '5' },
                      { value: 15, label: '15' },
                      { value: 25, label: '25' },
                      { value: 40, label: '40' },
                    ]}
                    onChange={(_, val) => setTargetProblemsPerWeek(val as number)}
                    sx={{
                      color: '#2563EB',
                      '& .MuiSlider-thumb': { bgcolor: '#FFFFFF', border: '3px solid #2563EB' },
                    }}
                  />
                </Card>

                {/* Study hours per week */}
                <Card
                  sx={{
                    p: 2.5,
                    borderRadius: '12px',
                    border: '1.5px solid #E2E8F0',
                    bgcolor: '#FFFFFF',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A' }}>
                      Dedicated Study Hours / Week
                    </Typography>
                    <Chip
                      label={`${targetWeeklyHours} Hours`}
                      size="small"
                      sx={{ bgcolor: '#ECFDF5', color: '#059669', fontWeight: 800, border: '1px solid #A7F3D0' }}
                    />
                  </Box>
                  <Slider
                    value={targetWeeklyHours}
                    min={3}
                    max={30}
                    step={1}
                    marks={[
                      { value: 3, label: '3h' },
                      { value: 10, label: '10h' },
                      { value: 20, label: '20h' },
                      { value: 30, label: '30h' },
                    ]}
                    onChange={(_, val) => setTargetWeeklyHours(val as number)}
                    sx={{
                      color: '#059669',
                      '& .MuiSlider-thumb': { bgcolor: '#FFFFFF', border: '3px solid #059669' },
                    }}
                  />
                </Card>
              </Box>
            </Box>
          </Box>
        )}
      </Box>

      {/* Footer Navigation Bar */}
      <Box
        sx={{
          px: { xs: 2.5, md: 4 },
          py: 2.5,
          bgcolor: '#FFFFFF',
          borderTop: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Button
          disabled={currentStep === 1}
          onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
          startIcon={<ArrowBackRoundedIcon />}
          variant="outlined"
          sx={{
            color: '#475569',
            borderColor: '#CBD5E1',
            textTransform: 'none',
            fontWeight: 700,
            borderRadius: '10px',
            px: 2.5,
            '&:hover': { bgcolor: '#F8FAFC', borderColor: '#94A3B8' },
            '&.Mui-disabled': {
              opacity: 0.4,
              borderColor: '#E2E8F0',
            },
          }}
        >
          Previous
        </Button>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {currentStep < 4 ? (
            <Button
              variant="contained"
              onClick={() => {
                if (currentStep === 3) {
                  handleEvaluateQuiz();
                } else {
                  setCurrentStep((prev) => prev + 1);
                }
              }}
              endIcon={<ArrowForwardRoundedIcon />}
              sx={{
                bgcolor: '#2563EB',
                color: '#FFFFFF',
                fontWeight: 700,
                textTransform: 'none',
                borderRadius: '10px',
                px: 3.5,
                py: 1,
                boxShadow: '0 2px 6px rgba(37,99,235,0.25)',
                '&:hover': { bgcolor: '#1D4ED8' },
              }}
            >
              {currentStep === 3 ? 'Evaluate & Calibrate' : 'Continue'}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleApplyGoals}
              disabled={savingGoals}
              startIcon={savingGoals ? <CircularProgress size={16} color="inherit" /> : <CheckCircleRoundedIcon />}
              sx={{
                bgcolor: '#10B981',
                color: '#FFFFFF',
                fontWeight: 800,
                textTransform: 'none',
                borderRadius: '10px',
                px: 4,
                py: 1,
                boxShadow: '0 2px 6px rgba(16, 185, 129, 0.25)',
                '&:hover': { bgcolor: '#059669' },
              }}
            >
              {savingGoals ? 'Saving Goals...' : 'Save Goals & Apply to Profile'}
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );

  if (!isModal) {
    return (
      <Card
        sx={{
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.06)',
          overflow: 'hidden',
        }}
      >
        {wizardContent}
      </Card>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: '16px',
            bgcolor: '#FFFFFF',
            color: '#0F172A',
            boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
            overflow: 'hidden',
            border: '1px solid #E2E8F0',
          },
        },
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        {wizardContent}
      </DialogContent>
    </Dialog>
  );
}

export default IdentityDiagnosticWizard;
