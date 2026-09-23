'use client';

import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Chip,
  Button,
  TextField,
  InputAdornment,
  LinearProgress,
  IconButton,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

// Icons
import LaptopMacOutlinedIcon from '@mui/icons-material/LaptopMacOutlined';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import GitHubIcon from '@mui/icons-material/GitHub';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import TerminalRoundedIcon from '@mui/icons-material/TerminalRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import StorageRoundedIcon from '@mui/icons-material/StorageRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import SpeedRoundedIcon from '@mui/icons-material/SpeedRounded';
import PsychologyRoundedIcon from '@mui/icons-material/PsychologyRounded';
import DnsRoundedIcon from '@mui/icons-material/DnsRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import MemoryRoundedIcon from '@mui/icons-material/MemoryRounded';
import LanRoundedIcon from '@mui/icons-material/LanRounded';
import LayersRoundedIcon from '@mui/icons-material/LayersRounded';
import { FluidArrowRight } from '@/utils/fluid_arrow';
import { useToast } from '@/context/ToastContext';

export interface StudentProject {
  id: string;
  title: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  status: 'In Progress' | 'Completed' | 'Available';
  progressPct: number;
  techStack: string[];
  iconType: 'kv' | 'ide' | 'queue' | 'ai' | 'k8s';
  accentColor: string;
  bgColor: string;
  repoUrl: string;
  liveUrl: string;
  milestonesCompleted: number;
  totalMilestones: number;
  description: string;
  ports: string[];
  services: { name: string; runtime: string; port: string; status: 'healthy' | 'idle' }[];
  terminalLogs: string[];
  milestones: { id: string; title: string; phase: string; done: boolean }[];
}

const CATEGORIES = [
  { id: 'Distributed Systems', name: 'Distributed Systems', icon: <StorageRoundedIcon sx={{ fontSize: 18 }} /> },
  { id: 'Full Stack', name: 'Full-Stack Engineering', icon: <LaptopMacOutlinedIcon sx={{ fontSize: 18 }} /> },
  { id: 'Backend & Cloud', name: 'Backend & Cloud', icon: <SpeedRoundedIcon sx={{ fontSize: 18 }} /> },
  { id: 'AI / Machine Learning', name: 'AI & Machine Learning', icon: <PsychologyRoundedIcon sx={{ fontSize: 18 }} /> },
  { id: 'DevOps & SRE', name: 'DevOps & Cloud Native', icon: <DnsRoundedIcon sx={{ fontSize: 18 }} /> },
];

const INITIAL_PROJECTS: StudentProject[] = [
  {
    id: 'proj-1',
    title: 'Distributed In-Memory Key-Value Store with Raft Consensus',
    category: 'Distributed Systems',
    difficulty: 'Advanced',
    status: 'In Progress',
    progressPct: 75,
    techStack: ['Go 1.22', 'Raft Consensus', 'gRPC', 'Docker Sandbox'],
    iconType: 'kv',
    accentColor: '#7C3AED',
    bgColor: '#F5F3FF',
    repoUrl: 'https://github.com/student/distributed-kv-raft',
    liveUrl: 'https://kv-raft.sandbox.techlearns.io',
    milestonesCompleted: 6,
    totalMilestones: 8,
    description: 'Leader election, log replication, snapshotting, and fault-tolerant cluster partitioned testing with Jepsen.',
    ports: [':8080 HTTP', ':9090 gRPC', ':2379 Raft'],
    services: [
      { name: 'Raft Node 01 (Leader)', runtime: 'Go Binary', port: ':8080', status: 'healthy' },
      { name: 'Raft Node 02 (Follower)', runtime: 'Go Binary', port: ':8081', status: 'healthy' },
      { name: 'Raft Node 03 (Follower)', runtime: 'Go Binary', port: ':8082', status: 'healthy' },
    ],
    terminalLogs: [
      '[RAFT-CORE] Initializing cluster with 3 peer consensus nodes...',
      '[RAFT-ELECTION] Term 4: Node 01 received quorum votes (2/3) -> ELEVATED TO LEADER',
      '[HEARTBEAT] Sending AppendEntries RPC to Node 02, Node 03 (RTT: 0.8ms)',
      '[KV-STORE] Committed key "user:1024:session" across all quorum state machines.',
      '[METRICS] Current write throughput: 42,800 ops/sec | Consensus Lag: 0ms',
    ],
    milestones: [
      { id: 'm1', title: 'Leader Election & Term State Machine', phase: 'Phase 1', done: true },
      { id: 'm2', title: 'AppendEntries RPC Log Replication', phase: 'Phase 1', done: true },
      { id: 'm3', title: 'Log Compaction & Memory Snapshots', phase: 'Phase 2', done: true },
      { id: 'm4', title: 'gRPC Unary & Bidirectional Client API', phase: 'Phase 2', done: true },
      { id: 'm5', title: 'Multi-Node Cluster Orchestration', phase: 'Phase 3', done: true },
      { id: 'm6', title: 'Network Partition Fault Injection (Jepsen)', phase: 'Phase 3', done: true },
      { id: 'm7', title: 'Persistent Disk Write-Ahead Log (WAL)', phase: 'Phase 4', done: false },
      { id: 'm8', title: 'Production Load Benchmark (50k req/s)', phase: 'Phase 4', done: false },
    ],
  },
  {
    id: 'proj-2',
    title: 'Real-time Collaborative Code & Whiteboard IDE',
    category: 'Full Stack',
    difficulty: 'Advanced',
    status: 'In Progress',
    progressPct: 60,
    techStack: ['Next.js 15', 'NestJS', 'WebSockets', 'CRDT / Yjs', 'PostgreSQL'],
    iconType: 'ide',
    accentColor: '#2563EB',
    bgColor: '#EFF6FF',
    repoUrl: 'https://github.com/student/collab-ide',
    liveUrl: 'https://collab-ide.sandbox.techlearns.io',
    milestonesCompleted: 3,
    totalMilestones: 5,
    description: 'Multi-cursor synchronization, real-time audio chat, Monaco editor integration, and dockerized language runner.',
    ports: [':3000 Web', ':8000 API', ':8080 WSS'],
    services: [
      { name: 'Frontend Next.js 15', runtime: 'Node.js 20', port: ':3000', status: 'healthy' },
      { name: 'Collab NestJS API', runtime: 'NestJS / WSS', port: ':8000', status: 'healthy' },
      { name: 'PostgreSQL 16 DB', runtime: 'PostgreSQL', port: ':5432', status: 'healthy' },
    ],
    terminalLogs: [
      '[NEXT-APP] Ready in 1.4s (http://localhost:3000)',
      '[WS-GATEWAY] Client "usr_992" joined room "workspace-alpha"',
      '[CRDT-SYNC] Yjs state vector synchronized (delta size: 48 bytes)',
      '[SANDBOX-RUNNER] Executing Python3 script in rootless container...',
      '[SANDBOX-RUNNER] Exit code 0 (execution time: 42ms)',
    ],
    milestones: [
      { id: 'm1', title: 'Monaco Editor with LSP Language Servers', phase: 'Phase 1', done: true },
      { id: 'm2', title: 'CRDT / Yjs Document Sync Engine', phase: 'Phase 1', done: true },
      { id: 'm3', title: 'WebSocket Room Presence & Live Cursors', phase: 'Phase 2', done: true },
      { id: 'm4', title: 'Dockerized Sandboxed Code Runner', phase: 'Phase 2', done: false },
      { id: 'm5', title: 'WebRTC Live Audio Mesh Channel', phase: 'Phase 3', done: false },
    ],
  },
  {
    id: 'proj-3',
    title: 'High-Throughput BullMQ Job Queue Execution Engine',
    category: 'Backend & Cloud',
    difficulty: 'Intermediate',
    status: 'Completed',
    progressPct: 100,
    techStack: ['Node.js', 'Redis', 'BullMQ', 'Docker Sandbox', 'Prisma'],
    iconType: 'queue',
    accentColor: '#059669',
    bgColor: '#ECFDF5',
    repoUrl: 'https://github.com/student/code-judge-worker',
    liveUrl: 'https://judge-engine.sandbox.techlearns.io',
    milestonesCompleted: 5,
    totalMilestones: 5,
    description: 'Sandboxed code execution cluster, isolation using Linux cgroups and seccomp profiles, and real-time WebSocket score stream.',
    ports: [':8000 Worker', ':6379 Redis', ':5555 Bull-Board'],
    services: [
      { name: 'BullMQ Master Dispatcher', runtime: 'Node.js', port: ':8000', status: 'healthy' },
      { name: 'Redis Standalone Cluster', runtime: 'Redis 7.2', port: ':6379', status: 'healthy' },
      { name: 'Linux Sandbox Workers (x4)', runtime: 'cgroups/seccomp', port: 'Internal', status: 'healthy' },
    ],
    terminalLogs: [
      '[QUEUE-MASTER] Redis connection established at redis://localhost:6379',
      '[WORKER-POOL] 4 concurrent isolation workers spawned.',
      '[JOB-DISPATCH] Job #4028 processed in 18ms (Verdict: ACCEPTED)',
      '[MONITOR] Memory usage: 142MB / 1024MB | Backpressure: 0%',
    ],
    milestones: [
      { id: 'm1', title: 'BullMQ Worker Pool Concurrency', phase: 'Phase 1', done: true },
      { id: 'm2', title: 'Rootless Docker Sandbox Isolation', phase: 'Phase 1', done: true },
      { id: 'm3', title: 'Linux cgroups Resource Enforcer', phase: 'Phase 2', done: true },
      { id: 'm4', title: 'Redis Pub/Sub Verdict Stream', phase: 'Phase 2', done: true },
      { id: 'm5', title: 'Load Stress Testing & Benchmark', phase: 'Phase 3', done: true },
    ],
  },
  {
    id: 'proj-4',
    title: 'AI Medical Imaging Segmentation & Diagnosis API',
    category: 'AI / Machine Learning',
    difficulty: 'Advanced',
    status: 'Available',
    progressPct: 0,
    techStack: ['Python 3.11', 'PyTorch', 'FastAPI', 'U-Net', 'CUDA ONNX'],
    iconType: 'ai',
    accentColor: '#D97706',
    bgColor: '#FFFBEB',
    repoUrl: 'https://github.com/student/ai-medical-segmentation',
    liveUrl: 'https://medical-ai.sandbox.techlearns.io',
    milestonesCompleted: 0,
    totalMilestones: 6,
    description: '3D MRI CT scan segmentation model deployment, DICOM parsing, GPU inference acceleration, and authenticated HIPAA endpoints.',
    ports: [':8000 API', ':8501 Streamlit GUI'],
    services: [
      { name: 'FastAPI Inference Engine', runtime: 'Python / Uvicorn', port: ':8000', status: 'idle' },
      { name: 'ONNX CUDA Runtime', runtime: 'NVIDIA TensorRT', port: 'Internal', status: 'idle' },
    ],
    terminalLogs: [
      '[ENV-CHECK] CUDA 12.2 detected (NVIDIA RTX 4090 GPU available)',
      '[FASTAPI] Model weights ready for initialization...',
    ],
    milestones: [
      { id: 'm1', title: 'DICOM File Stream Parser', phase: 'Phase 1', done: false },
      { id: 'm2', title: 'U-Net Model Tensor Preprocessing', phase: 'Phase 1', done: false },
      { id: 'm3', title: 'ONNX Runtime CUDA Acceleration', phase: 'Phase 2', done: false },
      { id: 'm4', title: 'FastAPI Async Inference Gateway', phase: 'Phase 2', done: false },
      { id: 'm5', title: 'Segmentation Mask Overlay Canvas', phase: 'Phase 3', done: false },
      { id: 'm6', title: 'Secure HIPAA Compliant Storage', phase: 'Phase 3', done: false },
    ],
  },
  {
    id: 'proj-5',
    title: 'Kubernetes Multi-Tenant Cluster Autoscaler Operator',
    category: 'DevOps & SRE',
    difficulty: 'Advanced',
    status: 'Available',
    progressPct: 0,
    techStack: ['Kubernetes CRD', 'Go Operator SDK', 'Prometheus', 'Helm'],
    iconType: 'k8s',
    accentColor: '#0284C7',
    bgColor: '#E0F2FE',
    repoUrl: 'https://github.com/student/k8s-autoscaler-operator',
    liveUrl: 'https://k8s-operator.sandbox.techlearns.io',
    milestonesCompleted: 0,
    totalMilestones: 7,
    description: 'Custom Resource Definitions, metric reconciliation loops, zero-downtime rolling upgrades, and pod disruption budgets.',
    ports: [':8443 Webhook', ':9090 Prometheus'],
    services: [
      { name: 'Go Operator Controller', runtime: 'Kubebuilder v3', port: ':8443', status: 'idle' },
      { name: 'Prometheus Metric Exporter', runtime: 'Prometheus SDK', port: ':9090', status: 'idle' },
    ],
    terminalLogs: [
      '[K8S-OPERATOR] Watching CRD "AutoscalerPolicy" in namespace default...',
      '[RECONCILE] Controller loop active.',
    ],
    milestones: [
      { id: 'm1', title: 'Custom Resource Definition (CRD) Schema', phase: 'Phase 1', done: false },
      { id: 'm2', title: 'Reconciliation Controller in Go', phase: 'Phase 1', done: false },
      { id: 'm3', title: 'Prometheus Custom Metric Adapter', phase: 'Phase 2', done: false },
      { id: 'm4', title: 'Dynamic Replica Scaling Logic', phase: 'Phase 2', done: false },
      { id: 'm5', title: 'Pod Disruption Budget Safeguards', phase: 'Phase 3', done: false },
      { id: 'm6', title: 'Helm Package Chart Distribution', phase: 'Phase 3', done: false },
      { id: 'm7', title: 'Chaos Engineering Failover Drill', phase: 'Phase 4', done: false },
    ],
  },
];

function getProjectIcon(type: StudentProject['iconType']) {
  switch (type) {
    case 'kv':
      return <StorageRoundedIcon sx={{ fontSize: 18 }} />;
    case 'ide':
      return <LaptopMacOutlinedIcon sx={{ fontSize: 18 }} />;
    case 'queue':
      return <SpeedRoundedIcon sx={{ fontSize: 18 }} />;
    case 'ai':
      return <PsychologyRoundedIcon sx={{ fontSize: 18 }} />;
    case 'k8s':
      return <DnsRoundedIcon sx={{ fontSize: 18 }} />;
    default:
      return <CodeRoundedIcon sx={{ fontSize: 18 }} />;
  }
}

export default function ProjectsClient() {
  const toast = useToast();
  const [projects, setProjects] = useState<StudentProject[]>(INITIAL_PROJECTS);
  const [activeProjectId, setActiveProjectId] = useState<string>(INITIAL_PROJECTS[0].id);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    'Distributed Systems': true,
    'Full Stack': true,
    'Backend & Cloud': true,
    'AI / Machine Learning': false,
    'DevOps & SRE': false,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'terminal' | 'services'>('overview');

  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0];

  const handleToggleCategory = (catId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  const handleToggleMilestone = (milestoneId: string) => {
    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id !== activeProject.id) return proj;
        const updatedMilestones = proj.milestones.map((m) =>
          m.id === milestoneId ? { ...m, done: !m.done } : m
        );
        const completedCount = updatedMilestones.filter((m) => m.done).length;
        const pct = Math.round((completedCount / updatedMilestones.length) * 100);
        return {
          ...proj,
          milestones: updatedMilestones,
          milestonesCompleted: completedCount,
          progressPct: pct,
          status: pct === 100 ? 'Completed' : pct > 0 ? 'In Progress' : 'Available',
        };
      })
    );
    toast.success('Project milestone status updated', 'Milestone Updated');
  };

  const handleLaunchContainer = () => {
    toast.success(`Allocating container sandbox pod for "${activeProject.title}"...`, 'Cloud Sandbox Initialized');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pb: 6 }}>
      {/* 1. TOP HEADER */}
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
              Cloud Sandbox & Project Studio
            </Typography>
            <Chip
              icon={<AutoAwesomeRoundedIcon sx={{ fontSize: 12, color: '#2563EB !important' }} />}
              label="Kubernetes Sandbox Online"
              size="small"
              sx={{ bgcolor: '#EFF6FF', color: '#2563EB', fontWeight: 800, fontSize: '0.72rem', height: 22 }}
            />
          </Box>
          <Typography sx={{ fontSize: '0.82rem', color: '#64748B', mt: 0.3 }}>
            Full-stack capstone architectures, container sandboxes, and interactive milestone verification.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Button
            variant="contained"
            startIcon={<TerminalRoundedIcon sx={{ fontSize: 16 }} />}
            onClick={handleLaunchContainer}
            sx={{
              bgcolor: '#0F172A',
              color: '#FFFFFF',
              borderRadius: '10px',
              fontWeight: 800,
              fontSize: '0.82rem',
              textTransform: 'none',
              px: 2.2,
              py: 0.7,
              boxShadow: 'none',
              '&:hover': { bgcolor: '#1E293B', boxShadow: 'none' },
            }}
          >
            Launch Cloud IDE
          </Button>
        </Box>
      </Box>

      {/* 2. SPLIT-SCREEN CLOUD SANDBOX WORKBENCH WITH ACCORDION ON LEFT */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '340px 1fr' },
          gap: 3,
          alignItems: 'start',
        }}
      >
        {/* LEFT ACCORDION RAIL: Grouped by Project Tracks */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
          }}
        >
          {/* Search bar */}
          <TextField
            size="small"
            placeholder="Search architecture..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon sx={{ fontSize: 16, color: '#94A3B8' }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                height: 38,
                borderRadius: '10px',
                bgcolor: '#FFFFFF',
                fontSize: '0.82rem',
              },
            }}
          />

          {/* Category Accordions */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {CATEGORIES.map((cat) => {
              const projectsInCat = projects.filter((p) => {
                const matchCat = p.category === cat.id;
                const matchSearch =
                  !searchQuery ||
                  p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  p.techStack.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
                return matchCat && matchSearch;
              });

              if (projectsInCat.length === 0 && searchQuery) return null;

              const isExpanded = Boolean(expandedCategories[cat.id]);
              const hasActiveProject = projectsInCat.some((p) => p.id === activeProjectId);

              return (
                <Accordion
                  key={cat.id}
                  expanded={isExpanded}
                  onChange={() => handleToggleCategory(cat.id)}
                  disableGutters
                  elevation={0}
                  sx={{
                    bgcolor: '#FFFFFF',
                    border: hasActiveProject ? '1px solid #CBD5E1' : '1px solid #E2E8F0',
                    borderRadius: '12px !important',
                    overflow: 'hidden',
                    '&:before': { display: 'none' },
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreRoundedIcon sx={{ fontSize: 18, color: '#64748B' }} />}
                    sx={{
                      px: 1.8,
                      py: 0.2,
                      minHeight: 46,
                      '& .MuiAccordionSummary-content': { my: 0.8 },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', pr: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ color: '#2563EB', display: 'flex', alignItems: 'center' }}>
                          {cat.icon}
                        </Box>
                        <Typography sx={{ fontWeight: 800, fontSize: '0.82rem', color: '#0F172A' }}>
                          {cat.name}
                        </Typography>
                      </Box>
                      <Chip
                        label={projectsInCat.length}
                        size="small"
                        sx={{ height: 20, fontSize: '0.68rem', fontWeight: 800, bgcolor: '#F1F5F9', color: '#475569' }}
                      />
                    </Box>
                  </AccordionSummary>

                  <AccordionDetails sx={{ px: 1.2, pt: 0, pb: 1.2, display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                    {projectsInCat.map((project) => {
                      const isSelected = project.id === activeProjectId;
                      const isDone = project.status === 'Completed';

                      return (
                        <Box
                          key={project.id}
                          role="button"
                          tabIndex={0}
                          aria-selected={isSelected}
                          aria-label={`${project.title}, ${project.status}, ${project.progressPct}% complete`}
                          onClick={() => setActiveProjectId(project.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setActiveProjectId(project.id);
                            }
                          }}
                          sx={{
                            p: 1.4,
                            borderRadius: '10px',
                            cursor: 'pointer',
                            bgcolor: isSelected ? '#EFF6FF' : '#F8FAFC',
                            border: isSelected ? '1px solid #2563EB' : '1px solid transparent',
                            transition: 'all 0.15s ease',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 0.6,
                            outline: 'none',
                            '&:hover': {
                              bgcolor: isSelected ? '#EFF6FF' : '#F1F5F9',
                            },
                            '&:focus-visible': {
                              outline: '2px solid #2563EB',
                              outlineOffset: '2px',
                            },
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
                            <Typography
                              sx={{
                                fontWeight: isSelected ? 800 : 700,
                                fontSize: '0.78rem',
                                color: isSelected ? '#1E40AF' : '#0F172A',
                                lineHeight: 1.3,
                              }}
                            >
                              {project.title}
                            </Typography>
                            {isDone ? (
                              <CheckCircleRoundedIcon sx={{ fontSize: 15, color: '#059669', flexShrink: 0, mt: 0.2 }} />
                            ) : (
                              <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: '#2563EB', flexShrink: 0, mt: 0.2 }}>
                                {project.progressPct}%
                              </Typography>
                            )}
                          </Box>

                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box sx={{ display: 'flex', gap: 0.4 }}>
                              {project.techStack.slice(0, 2).map((t) => (
                                <Typography key={t} sx={{ fontSize: '0.66rem', color: '#64748B', bgcolor: '#FFFFFF', px: 0.6, py: 0.1, borderRadius: '4px', border: '1px solid #E2E8F0' }}>
                                  {t}
                                </Typography>
                              ))}
                            </Box>
                            <Typography sx={{ fontSize: '0.68rem', color: '#64748B' }}>
                              {project.milestonesCompleted}/{project.totalMilestones} steps
                            </Typography>
                          </Box>
                        </Box>
                      );
                    })}
                  </AccordionDetails>
                </Accordion>
              );
            })}
          </Box>
        </Box>

        {/* RIGHT MAIN WORKBENCH: Active Project Studio */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2.5,
            bgcolor: '#FFFFFF',
            borderRadius: '20px',
            border: '1px solid #E2E8F0',
            p: { xs: 2.5, sm: 3.5 },
          }}
        >
          {/* Active Project Studio Header */}
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '12px',
                  bgcolor: activeProject.bgColor,
                  color: activeProject.accentColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {getProjectIcon(activeProject.iconType)}
              </Box>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: '#0F172A', fontSize: '1.15rem' }}>
                    {activeProject.title}
                  </Typography>
                  <Chip
                    label={activeProject.status}
                    size="small"
                    sx={{
                      fontWeight: 800,
                      fontSize: '0.7rem',
                      height: 22,
                      bgcolor: activeProject.status === 'Completed' ? '#ECFDF5' : '#EFF6FF',
                      color: activeProject.status === 'Completed' ? '#059669' : '#2563EB',
                    }}
                  />
                </Box>
                <Typography sx={{ fontSize: '0.78rem', color: '#64748B', mt: 0.3 }}>
                  {activeProject.category} • {activeProject.difficulty}
                </Typography>
              </Box>
            </Box>

            {/* Direct Repo & Sandbox link */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<GitHubIcon sx={{ fontSize: 15 }} />}
                component="a"
                href={activeProject.repoUrl}
                target="_blank"
                sx={{
                  textTransform: 'none',
                  borderRadius: '8px',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  borderColor: '#E2E8F0',
                  color: '#0F172A',
                  '&:hover': { bgcolor: '#F8FAFC' },
                }}
              >
                Repository
              </Button>
            </Box>
          </Box>

          {/* Description */}
          <Typography sx={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.6 }}>
            {activeProject.description}
          </Typography>

          {/* Clean Studio Ports & Tech Bar */}
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 2,
              alignItems: 'center',
              p: 1.8,
              borderRadius: '12px',
              bgcolor: '#F8FAFC',
              border: '1px solid #E2E8F0',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap' }}>
              <LanRoundedIcon sx={{ fontSize: 16, color: '#64748B' }} />
              <Typography sx={{ fontSize: '0.74rem', fontWeight: 800, color: '#0F172A', mr: 0.5 }}>
                Ports:
              </Typography>
              {activeProject.ports.map((port) => (
                <Chip
                  key={port}
                  label={port}
                  size="small"
                  sx={{ bgcolor: '#FFFFFF', border: '1px solid #CBD5E1', fontSize: '0.7rem', height: 22, fontWeight: 700 }}
                />
              ))}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap' }}>
              <MemoryRoundedIcon sx={{ fontSize: 16, color: '#64748B' }} />
              <Typography sx={{ fontSize: '0.74rem', fontWeight: 800, color: '#0F172A', mr: 0.5 }}>
                Stack:
              </Typography>
              {activeProject.techStack.map((tech) => (
                <Chip
                  key={tech}
                  label={tech}
                  size="small"
                  sx={{ bgcolor: '#EFF6FF', color: '#2563EB', fontSize: '0.7rem', height: 22, fontWeight: 800 }}
                />
              ))}
            </Box>
          </Box>

          {/* View Tab Selector: Overview & Milestones / Live Terminal / Active Services */}
          <Box sx={{ display: 'flex', gap: 1, borderBottom: '1px solid #E2E8F0', pb: 1 }}>
            {[
              { id: 'overview', label: 'Milestone Roadmap' },
              { id: 'terminal', label: 'Live Console & Logs' },
              { id: 'services', label: 'Microservice Topology' },
            ].map((tab) => {
              const isSelected = activeTab === tab.id;
              return (
                <Button
                  key={tab.id}
                  size="small"
                  onClick={() => setActiveTab(tab.id as any)}
                  sx={{
                    fontWeight: isSelected ? 800 : 600,
                    fontSize: '0.8rem',
                    textTransform: 'none',
                    borderRadius: '8px',
                    px: 1.8,
                    py: 0.5,
                    bgcolor: isSelected ? '#0F172A' : 'transparent',
                    color: isSelected ? '#FFFFFF' : '#64748B',
                    '&:hover': { bgcolor: isSelected ? '#1E293B' : '#F1F5F9' },
                  }}
                >
                  {tab.label}
                </Button>
              );
            })}
          </Box>

          {/* TAB 1: MILESTONE ROADMAP */}
          {activeTab === 'overview' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: '#0F172A' }}>
                  Deliverables Checklist ({activeProject.milestonesCompleted}/{activeProject.totalMilestones} Completed)
                </Typography>
                <Typography sx={{ fontSize: '0.78rem', color: '#2563EB', fontWeight: 800 }}>
                  {activeProject.progressPct}% Overall Progress
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {activeProject.milestones.map((m) => (
                  <Box
                    key={m.id}
                    role="checkbox"
                    tabIndex={0}
                    aria-checked={m.done}
                    aria-label={`${m.title}, ${m.phase}, ${m.done ? 'completed' : 'pending'}`}
                    onClick={() => handleToggleMilestone(m.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleToggleMilestone(m.id);
                      }
                    }}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 1.5,
                      borderRadius: '12px',
                      bgcolor: m.done ? '#F0FDF4' : '#F8FAFC',
                      border: `1px solid ${m.done ? '#DCFCE7' : '#E2E8F0'}`,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      outline: 'none',
                      '&:hover': {
                        borderColor: '#2563EB',
                      },
                      '&:focus-visible': {
                        outline: '2px solid #2563EB',
                        outlineOffset: '2px',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <CheckCircleRoundedIcon
                        sx={{ fontSize: 18, color: m.done ? '#10B981' : '#CBD5E1' }}
                      />
                      <Box>
                        <Typography sx={{ fontSize: '0.82rem', fontWeight: m.done ? 700 : 500, color: m.done ? '#065F46' : '#1E293B' }}>
                          {m.title}
                        </Typography>
                      </Box>
                    </Box>

                    <Chip
                      label={m.phase}
                      size="small"
                      sx={{ fontSize: '0.68rem', height: 20, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0' }}
                    />
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {/* TAB 2: LIVE TERMINAL & CONSOLE */}
          {activeTab === 'terminal' && (
            <Box
              sx={{
                bgcolor: '#0B1120',
                borderRadius: '14px',
                p: 2.5,
                color: '#38BDF8',
                fontFamily: 'monospace',
                fontSize: '0.78rem',
                lineHeight: 1.8,
                display: 'flex',
                flexDirection: 'column',
                gap: 0.8,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <Typography sx={{ color: '#94A3B8', fontSize: '0.72rem', fontFamily: 'monospace' }}>
                  SANDBOX CONSOLE // STDOUT STREAM
                </Typography>
                <Chip label="LIVE" size="small" sx={{ height: 18, fontSize: '0.62rem', bgcolor: '#059669', color: '#FFFFFF', fontWeight: 900 }} />
              </Box>

              {activeProject.terminalLogs.map((log, idx) => (
                <Typography key={idx} sx={{ color: log.includes('LEADER') || log.includes('ACCEPTED') ? '#34D399' : '#E2E8F0', fontSize: '0.78rem' }}>
                  {log}
                </Typography>
              ))}
            </Box>
          )}

          {/* TAB 3: MICROSERVICE TOPOLOGY */}
          {activeTab === 'services' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: '#0F172A' }}>
                Active Container Pods & Port Bindings
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 1.5 }}>
                {activeProject.services.map((srv) => (
                  <Box
                    key={srv.name}
                    sx={{
                      p: 2,
                      borderRadius: '12px',
                      border: '1px solid #E2E8F0',
                      bgcolor: '#F8FAFC',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 0.8,
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography sx={{ fontWeight: 800, fontSize: '0.82rem', color: '#0F172A' }}>
                        {srv.name}
                      </Typography>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: srv.status === 'healthy' ? '#10B981' : '#94A3B8' }} />
                    </Box>
                    <Typography sx={{ fontSize: '0.72rem', color: '#64748B' }}>
                      Runtime: {srv.runtime}
                    </Typography>
                    <Typography sx={{ fontSize: '0.72rem', color: '#2563EB', fontWeight: 700 }}>
                      Binding: {srv.port}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
