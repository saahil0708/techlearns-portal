'use client';

import React, { useState, useMemo } from 'react';
import { Box } from '@mui/material';
import { useToast } from '@/context/ToastContext';
import { useAppSelector } from '@/store/hooks';

export * from './components/types';
import {
  SolvedProblemRecord,
  AccreditedCourseRecord,
  ContestRecord,
  CapstoneProjectRecord,
  SkillDomain,
} from './components/types';

import PassportHeaderDossier from './components/PassportHeaderDossier';
import PassportScorecard from './components/PassportScorecard';
import PassportCapstoneShowcase from './components/PassportCapstoneShowcase';
import PassportCompetenciesMatrix from './components/PassportCompetenciesMatrix';
import PassportLedgerSection from './components/PassportLedgerSection';
import PassportVerificationSidebar from './components/PassportVerificationSidebar';
import PassportModals from './components/PassportModals';

export default function SkillPassportClient() {
  const toast = useToast();
  const currentUser = useAppSelector((state) => state.auth.user);

  // Active Project Showcase Index for the Slider
  const [activeProjectIdx, setActiveProjectIdx] = useState(0);

  // Filter state
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

  const passportId = currentUser?.id
    ? 'SP-' + new Date().getFullYear() + '-' + currentUser.id.toString().slice(0, 6).toUpperCase()
    : 'SP-PREVIEW-' + new Date().getFullYear();
  const verificationHash = 'SHA256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069';
  const verificationUrl = 'https://techlearns.in/verify/passport/' + encodeURIComponent(passportId);

  // Capstone Projects Dataset
  const capstoneProjects: CapstoneProjectRecord[] = useMemo(
    () => [
      {
        id: '1',
        title: 'High-Throughput Distributed Rate Limiter & Token Bucket Cluster',
        domain: 'Distributed Systems & Microservices',
        summary:
          'Production-grade sliding-window rate limiter cluster with distributed Redis atomic Lua synchronization, gRPC streaming interceptors, and Prometheus telemetry.',
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
        summary:
          'High-security multi-tenant remote code judge executing untrusted user submissions in isolated Linux cgroups and seccomp sandboxes with real-time WebSocket feedback.',
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
        summary:
          'Abstract Syntax Tree parser converting multi-language source code into normalized token graphs to detect deep code obfuscation, variable renaming, and struct restructuring.',
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

  // Solved Problems Dataset
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

  // Skill Competencies Matrix
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
      } catch {
        toast.error('Failed to copy verification link to clipboard.', 'Copy Error');
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5, pb: 10, maxWidth: 1440, mx: 'auto', width: '100%' }}>
      {/* 1. TOP OFFICIAL SECURITY RIBBON & PASSPORT IDENTIFICATION HEADER */}
      <PassportHeaderDossier
        studentName={studentName}
        studentHandle={studentHandle}
        studentRollNo={studentRollNo}
        studentDegree={studentDegree}
        studentGradYear={studentGradYear}
        institutionName={institutionName}
        passportId={passportId}
        onOpenShareModal={() => setShareModalOpen(true)}
        onExportPDF={handlePrint}
      />

      {/* 2. EXECUTIVE METRIC SCORECARD */}
      <PassportScorecard />

      {/* 3. CORE ARCHITECTURAL LAYOUT */}
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
          {/* SECTION 1: MAJOR VERIFIED ENGINEERING PROJECTS */}
          <PassportCapstoneShowcase
            capstoneProjects={capstoneProjects}
            activeProjectIdx={activeProjectIdx}
            setActiveProjectIdx={setActiveProjectIdx}
          />

          {/* SECTION 2: VERIFIED ENGINEERING COMPETENCIES */}
          <PassportCompetenciesMatrix
            skillDomains={skillDomains}
            competencyFilter={competencyFilter}
            setCompetencyFilter={setCompetencyFilter}
          />

          {/* SECTION 3: COMPREHENSIVE LEDGER TABS */}
          <PassportLedgerSection
            capstoneProjects={capstoneProjects}
            solvedProblems={solvedProblems}
            accreditedCourses={accreditedCourses}
            contestHistory={contestHistory}
            onInspectCertificate={setSelectedCert}
          />
        </Box>

        {/* RIGHT COLUMN: Official Verifiable Biometric Credential & Audit Card */}
        <PassportVerificationSidebar
          verificationUrl={verificationUrl}
          verificationHash={verificationHash}
          onOpenQrModal={() => setQrModalOpen(true)}
          onCopyLink={handleCopyLink}
        />
      </Box>

      {/* 4. MODALS (QR CODE, SHARE & CERTIFICATE INSPECTION) */}
      <PassportModals
        qrModalOpen={qrModalOpen}
        onCloseQrModal={() => setQrModalOpen(false)}
        shareModalOpen={shareModalOpen}
        onCloseShareModal={() => setShareModalOpen(false)}
        selectedCert={selectedCert}
        onCloseCertModal={() => setSelectedCert(null)}
        verificationUrl={verificationUrl}
        studentName={studentName}
        institutionName={institutionName}
        onCopyLink={handleCopyLink}
      />
    </Box>
  );
}
