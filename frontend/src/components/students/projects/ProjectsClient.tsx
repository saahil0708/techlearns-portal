'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  Chip,
  Button,
  TextField,
  InputAdornment,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import LaptopMacOutlinedIcon from '@mui/icons-material/LaptopMacOutlined';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import GitHubIcon from '@mui/icons-material/GitHub';
import LaunchRoundedIcon from '@mui/icons-material/LaunchRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import TerminalRoundedIcon from '@mui/icons-material/TerminalRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { useToast } from '@/context/ToastContext';

interface StudentProject {
  id: string;
  title: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  status: 'In Progress' | 'Completed' | 'Available';
  progressPct: number;
  techStack: string[];
  repoUrl?: string;
  liveUrl?: string;
  milestonesCompleted: number;
  totalMilestones: number;
  description: string;
}

const INITIAL_PROJECTS: StudentProject[] = [
  {
    id: 'proj-1',
    title: 'Distributed In-Memory Key-Value Store with Raft Consensus',
    category: 'Distributed Systems',
    difficulty: 'Advanced',
    status: 'In Progress',
    progressPct: 75,
    techStack: ['Go', 'Raft Protocol', 'gRPC', 'Docker'],
    repoUrl: 'https://github.com/student/distributed-kv-raft',
    liveUrl: 'https://kv-raft.sandbox.techlearns.io',
    milestonesCompleted: 6,
    totalMilestones: 8,
    description: 'Leader election, log replication, snapshotting, and fault-tolerant cluster partitioned testing with Jepsen.',
  },
  {
    id: 'proj-2',
    title: 'Real-time Collaborative Code & Whiteboard IDE',
    category: 'Full Stack',
    difficulty: 'Advanced',
    status: 'In Progress',
    progressPct: 60,
    techStack: ['Next.js 15', 'NestJS', 'WebSockets', 'CRDT / Yjs', 'PostgreSQL'],
    repoUrl: 'https://github.com/student/collab-ide',
    liveUrl: 'https://collab-ide.sandbox.techlearns.io',
    milestonesCompleted: 3,
    totalMilestones: 5,
    description: 'Multi-cursor synchronization, real-time audio chat, Monaco editor integration, and dockerized language runner.',
  },
  {
    id: 'proj-3',
    title: 'High-Throughput BullMQ Job Queue Execution Engine',
    category: 'Backend & Cloud',
    difficulty: 'Intermediate',
    status: 'Completed',
    progressPct: 100,
    techStack: ['Node.js', 'Redis', 'BullMQ', 'Docker Sandbox', 'Prisma'],
    repoUrl: 'https://github.com/student/code-judge-worker',
    liveUrl: 'https://judge-engine.sandbox.techlearns.io',
    milestonesCompleted: 5,
    totalMilestones: 5,
    description: 'Sandboxed code execution cluster, isolation using Linux cgroups and seccomp profiles, and real-time WebSocket score stream.',
  },
  {
    id: 'proj-4',
    title: 'AI Medical Imaging Segmentation & Diagnosis API',
    category: 'AI / Machine Learning',
    difficulty: 'Advanced',
    status: 'Available',
    progressPct: 0,
    techStack: ['Python', 'PyTorch', 'FastAPI', 'U-Net', 'ONNX Runtime'],
    milestonesCompleted: 0,
    totalMilestones: 6,
    description: '3D MRI CT scan segmentation model deployment, DICOM parsing, GPU inference acceleration, and authenticated HIPAA endpoints.',
  },
  {
    id: 'proj-5',
    title: 'Kubernetes Multi-Tenant Cluster Autoscaler Operator',
    category: 'DevOps & SRE',
    difficulty: 'Advanced',
    status: 'Available',
    progressPct: 0,
    techStack: ['Kubernetes CRD', 'Go Operator SDK', 'Prometheus', 'Helm'],
    milestonesCompleted: 0,
    totalMilestones: 7,
    description: 'Custom Resource Definitions, metric reconciliation loops, zero-downtime rolling upgrades, and pod disruption budgets.',
  },
];

export default function ProjectsClient() {
  const toast = useToast();
  const [projects, setProjects] = useState<StudentProject[]>(INITIAL_PROJECTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedProject, setSelectedProject] = useState<StudentProject | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Full Stack');
  const [newStack, setNewStack] = useState('Next.js, NestJS, PostgreSQL');

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.techStack.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = categoryFilter === 'ALL' || p.category === categoryFilter;
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesSearch && matchesCat && matchesStatus;
  });

  const handleLaunchProject = (project: StudentProject) => {
    toast.success(`Launching Cloud Sandbox for "${project.title}"...`, 'Sandbox Initialized');
  };

  const handleCreateNewProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast.error('Please provide a project title.', 'Validation Error');
      return;
    }
    const newProj: StudentProject = {
      id: `proj-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      difficulty: 'Intermediate',
      status: 'In Progress',
      progressPct: 0,
      techStack: newStack.split(',').map((s) => s.trim()).filter(Boolean),
      milestonesCompleted: 0,
      totalMilestones: 5,
      description: 'Custom developer project workspace configured in the cloud sandbox.',
    };
    setProjects([newProj, ...projects]);
    setCreateModalOpen(false);
    setNewTitle('');
    toast.success('New Project Workspace created successfully!', 'Project Created');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
      {/* 1. Top Header Banner */}
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
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}>
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
              <LaptopMacOutlinedIcon sx={{ fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.35rem', lineHeight: 1.2 }}>
                Project Workspace & Sandbox
              </Typography>
              <Typography sx={{ fontSize: '0.84rem', color: '#64748B', mt: 0.3 }}>
                Build production-grade full stack capstones, verify CI/CD tests, and launch cloud dev environments
              </Typography>
            </Box>
          </Box>

          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => setCreateModalOpen(true)}
            sx={{
              bgcolor: '#2563EB',
              borderRadius: '12px',
              fontWeight: 700,
              textTransform: 'none',
              fontSize: '0.86rem',
              px: 2.5,
              py: 1,
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
              '&:hover': { bgcolor: '#1D4ED8' },
            }}
          >
            New Project
          </Button>
        </Box>

        {/* Search & Filters */}
        <Box sx={{ display: 'flex', gap: 1.5, mt: 3, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Search projects, stacks, tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon sx={{ fontSize: 18, color: '#94A3B8' }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              flex: 1,
              minWidth: 260,
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                bgcolor: '#F8FAFC',
                fontSize: '0.84rem',
              },
            }}
          />

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {['ALL', 'In Progress', 'Completed', 'Available'].map((st) => (
              <Chip
                key={st}
                label={st}
                onClick={() => setStatusFilter(st)}
                size="small"
                sx={{
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  borderRadius: '8px',
                  bgcolor: statusFilter === st ? '#2563EB' : '#F1F5F9',
                  color: statusFilter === st ? '#FFFFFF' : '#475569',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: statusFilter === st ? '#1D4ED8' : '#E2E8F0' },
                }}
              />
            ))}
          </Box>
        </Box>
      </Card>

      {/* 2. Structured List Table Format (AGENTS.md Standard) */}
      <Card
        elevation={0}
        sx={{
          borderRadius: '24px',
          bgcolor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.03)',
          overflow: 'hidden',
        }}
      >
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.78rem', py: 2 }}>PROJECT & ARCHITECTURE</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.78rem' }}>TRACK / CATEGORY</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.78rem' }}>TECH STACK</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.78rem' }}>MILESTONES / PROGRESS</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.78rem' }}>STATUS</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, color: '#475569', fontSize: '0.78rem' }}>ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProjects.map((proj) => (
                <TableRow
                  key={proj.id}
                  hover
                  sx={{
                    cursor: 'pointer',
                    '&:last-child td': { borderBottom: 'none' },
                  }}
                  onClick={() => setSelectedProject(proj)}
                >
                  <TableCell sx={{ py: 2.25 }}>
                    <Box>
                      <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.92rem', lineHeight: 1.3 }}>
                        {proj.title}
                      </Typography>
                      <Typography sx={{ fontSize: '0.78rem', color: '#64748B', mt: 0.3, maxWidth: 360, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {proj.description}
                      </Typography>
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={proj.category}
                      size="small"
                      sx={{ bgcolor: '#EFF6FF', color: '#2563EB', fontWeight: 700, fontSize: '0.72rem', borderRadius: '6px' }}
                    />
                  </TableCell>

                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', maxWidth: 220 }}>
                      {proj.techStack.map((tech) => (
                        <Chip
                          key={tech}
                          label={tech}
                          size="small"
                          sx={{ bgcolor: '#F8FAFC', color: '#334155', border: '1px solid #E2E8F0', fontSize: '0.7rem', height: 22 }}
                        />
                      ))}
                    </Box>
                  </TableCell>

                  <TableCell sx={{ width: 170 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography sx={{ fontSize: '0.74rem', color: '#64748B' }}>
                          {proj.milestonesCompleted}/{proj.totalMilestones} Steps
                        </Typography>
                        <Typography sx={{ fontSize: '0.74rem', fontWeight: 800, color: '#0F172A' }}>
                          {proj.progressPct}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={proj.progressPct}
                        sx={{
                          height: 6,
                          borderRadius: '9999px',
                          bgcolor: '#F1F5F9',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: proj.progressPct === 100 ? '#10B981' : '#2563EB',
                          },
                        }}
                      />
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={proj.status}
                      size="small"
                      sx={{
                        fontWeight: 800,
                        fontSize: '0.72rem',
                        borderRadius: '6px',
                        bgcolor: proj.status === 'Completed' ? '#ECFDF5' : proj.status === 'In Progress' ? '#EFF6FF' : '#F1F5F9',
                        color: proj.status === 'Completed' ? '#059669' : proj.status === 'In Progress' ? '#2563EB' : '#64748B',
                        border: `1px solid ${proj.status === 'Completed' ? '#A7F3D0' : proj.status === 'In Progress' ? '#BFDBFE' : '#CBD5E1'}`,
                      }}
                    />
                  </TableCell>

                  <TableCell align="right">
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }} onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<TerminalRoundedIcon sx={{ fontSize: 15 }} />}
                        onClick={() => handleLaunchProject(proj)}
                        sx={{
                          borderRadius: '8px',
                          textTransform: 'none',
                          fontSize: '0.76rem',
                          fontWeight: 700,
                          py: 0.5,
                        }}
                      >
                        Sandbox
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* 3. Project Detail Dialog */}
      <Dialog
        open={Boolean(selectedProject)}
        onClose={() => setSelectedProject(null)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: { borderRadius: '20px', p: 1 },
          },
        }}
      >
        {selectedProject && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Chip
                  label={selectedProject.category}
                  size="small"
                  sx={{ bgcolor: '#EFF6FF', color: '#2563EB', fontWeight: 800, fontSize: '0.72rem', mb: 1 }}
                />
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
                  {selectedProject.title}
                </Typography>
              </Box>
              <IconButton onClick={() => setSelectedProject(null)} size="small">
                <CloseRoundedIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </DialogTitle>

            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Typography sx={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.6 }}>
                {selectedProject.description}
              </Typography>

              <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
                <Typography sx={{ fontSize: '0.78rem', fontWeight: 800, color: '#0F172A', mb: 1 }}>
                  Technology Stack:
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                  {selectedProject.techStack.map((tech) => (
                    <Chip key={tech} label={tech} size="small" sx={{ bgcolor: '#FFFFFF', border: '1px solid #CBD5E1', fontSize: '0.76rem' }} />
                  ))}
                </Box>
              </Box>

              {selectedProject.repoUrl && (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.5, border: '1px solid #E2E8F0', borderRadius: '12px' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <GitHubIcon sx={{ fontSize: 20, color: '#0F172A' }} />
                    <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F172A' }}>
                      GitHub Repository Connected
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    component="a"
                    href={selectedProject.repoUrl}
                    target="_blank"
                    endIcon={<LaunchRoundedIcon sx={{ fontSize: 13 }} />}
                    sx={{ textTransform: 'none', fontSize: '0.78rem' }}
                  >
                    View Repo
                  </Button>
                </Box>
              )}
            </DialogContent>

            <DialogActions sx={{ p: 2.5, pt: 0 }}>
              <Button onClick={() => setSelectedProject(null)} sx={{ textTransform: 'none', borderRadius: '10px' }}>
                Close
              </Button>
              <Button
                variant="contained"
                startIcon={<TerminalRoundedIcon />}
                onClick={() => {
                  handleLaunchProject(selectedProject);
                  setSelectedProject(null);
                }}
                sx={{ bgcolor: '#2563EB', textTransform: 'none', borderRadius: '10px', fontWeight: 700 }}
              >
                Launch Cloud Sandbox
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* 4. New Project Workspace Modal */}
      <Dialog
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: { borderRadius: '20px', p: 1 },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#0F172A' }}>
          Create New Project Workspace
        </DialogTitle>
        <form onSubmit={handleCreateNewProject}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Project Title"
              size="small"
              fullWidth
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Distributed Log Replicator"
            />
            <TextField
              label="Category / Track"
              size="small"
              fullWidth
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
            <TextField
              label="Tech Stack (comma separated)"
              size="small"
              fullWidth
              value={newStack}
              onChange={(e) => setNewStack(e.target.value)}
              placeholder="e.g. Go, Docker, PostgreSQL"
            />
          </DialogContent>
          <DialogActions sx={{ p: 2.5, pt: 0 }}>
            <Button onClick={() => setCreateModalOpen(false)} sx={{ textTransform: 'none', borderRadius: '10px' }}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" sx={{ bgcolor: '#2563EB', textTransform: 'none', borderRadius: '10px', fontWeight: 700 }}>
              Create Workspace
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
