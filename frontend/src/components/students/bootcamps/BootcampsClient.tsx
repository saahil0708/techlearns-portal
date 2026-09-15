'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  Chip,
  Button,
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
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import VideoCameraFrontRoundedIcon from '@mui/icons-material/VideoCameraFrontRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { useToast } from '@/context/ToastContext';

interface StudentBootcamp {
  id: string;
  title: string;
  track: string;
  instructor: string;
  duration: string;
  enrolledStudents: number;
  status: 'Enrolled' | 'Available' | 'Completed';
  progressPct: number;
  sessionsCompleted: number;
  totalSessions: number;
  nextSessionDate: string;
  nextSessionTopic: string;
  syllabus: { week: string; topic: string; deliverables: string }[];
}

const BOOTCAMPS: StudentBootcamp[] = [
  {
    id: 'bc-1',
    title: 'Advanced Distributed Systems & High-Frequency Ingestion',
    track: 'Systems & Backend',
    instructor: 'Alex Xu & Martin Kleppmann (Guest)',
    duration: '8 Weeks',
    enrolledStudents: 340,
    status: 'Enrolled',
    progressPct: 62,
    sessionsCompleted: 10,
    totalSessions: 16,
    nextSessionDate: 'Tomorrow at 6:30 PM IST',
    nextSessionTopic: 'LSM-Trees vs B-Trees in RocksDB & Cassandra',
    syllabus: [
      { week: 'Week 1-2', topic: 'Raft & Paxos Consensus Implementation', deliverables: 'Leader Election Engine' },
      { week: 'Week 3-4', topic: 'Storage Engines: LSM & Write-Ahead Logs', deliverables: 'Mini-RocksDB in Go' },
      { week: 'Week 5-6', topic: 'Distributed Lock & Cache Coherence', deliverables: 'Redis Redlock Cluster' },
      { week: 'Week 7-8', topic: 'Capstone: 1M Events/Sec Ingestion Pipeline', deliverables: 'Production Benchmarks' },
    ],
  },
  {
    id: 'bc-2',
    title: 'FAANG DSA Mastery & Problem Pattern Synthesis',
    track: 'Competitive Programming',
    instructor: 'Errichto & NeetCode',
    duration: '6 Weeks',
    enrolledStudents: 820,
    status: 'Enrolled',
    progressPct: 80,
    sessionsCompleted: 16,
    totalSessions: 20,
    nextSessionDate: 'Saturday at 4:00 PM IST',
    nextSessionTopic: 'Segment Trees with Lazy Propagation & Range Queries',
    syllabus: [
      { week: 'Week 1', topic: 'Monotonic Queues & Sliding Window Deque', deliverables: '25 Hard Problems' },
      { week: 'Week 2-3', topic: 'Dynamic Programming on Trees & Bitmasks', deliverables: 'Contest Mock #1' },
      { week: 'Week 4-5', topic: 'Advanced Graph Theory: Max Flow & SCC', deliverables: 'Contest Mock #2' },
      { week: 'Week 6', topic: 'System Design Interview Synthesis', deliverables: 'Final Evaluation' },
    ],
  },
  {
    id: 'bc-3',
    title: 'Modern Generative AI & LLM Systems Engineering',
    track: 'AI / Deep Learning',
    instructor: 'Dr. Andrew Ng & Karpathy Fellow',
    duration: '10 Weeks',
    enrolledStudents: 560,
    status: 'Available',
    progressPct: 0,
    sessionsCompleted: 0,
    totalSessions: 24,
    nextSessionDate: 'Starts Next Monday',
    nextSessionTopic: 'Attention Mechanisms & Transformer Architecture from Scratch',
    syllabus: [
      { week: 'Week 1-3', topic: 'Building NanoGPT & Attention PyTorch', deliverables: 'Trained Character LLM' },
      { week: 'Week 4-6', topic: 'RAG Architectures, Vector DBs & Milvus', deliverables: 'Enterprise Doc Assistant' },
      { week: 'Week 7-8', topic: 'Fine-Tuning LoRA / QLoRA with Unsloth', deliverables: 'Domain Tuned Model' },
      { week: 'Week 9-10', topic: 'vLLM & TensorRT Inference Optimization', deliverables: 'High Throughput API' },
    ],
  },
];

export default function BootcampsClient() {
  const toast = useToast();
  const [bootcamps, setBootcamps] = useState<StudentBootcamp[]>(BOOTCAMPS);
  const [selectedBootcamp, setSelectedBootcamp] = useState<StudentBootcamp | null>(null);

  const handleEnroll = (bc: StudentBootcamp) => {
    setBootcamps((prev) =>
      prev.map((b) => (b.id === bc.id ? { ...b, status: 'Enrolled' } : b))
    );
    toast.success(`You have successfully enrolled in "${bc.title}"!`, 'Enrollment Confirmed');
    setSelectedBootcamp(null);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
      {/* 1. Top Header */}
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
            <TimerOutlinedIcon sx={{ fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.35rem', lineHeight: 1.2 }}>
              Intensive Industry Bootcamps & Cohorts
            </Typography>
            <Typography sx={{ fontSize: '0.84rem', color: '#64748B', mt: 0.3 }}>
              Live sprint training, elite peer cohorts, masterclasses by industry leaders, and hands-on capstone reviews
            </Typography>
          </Box>
        </Box>
      </Card>

      {/* 2. Structured Bootcamps List Table */}
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
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.78rem', py: 2 }}>BOOTCAMP & SYLLABUS</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.78rem' }}>INSTRUCTOR</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.78rem' }}>NEXT LIVE SESSION</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.78rem' }}>PROGRESS</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.78rem' }}>ENROLLMENT</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, color: '#475569', fontSize: '0.78rem' }}>ACTION</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bootcamps.map((bc) => (
                <TableRow
                  key={bc.id}
                  hover
                  sx={{ cursor: 'pointer', '&:last-child td': { borderBottom: 'none' } }}
                  onClick={() => setSelectedBootcamp(bc)}
                >
                  <TableCell sx={{ py: 2.25 }}>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Chip label={bc.track} size="small" sx={{ bgcolor: '#EFF6FF', color: '#2563EB', fontWeight: 800, fontSize: '0.7rem', height: 20 }} />
                        <Typography sx={{ fontSize: '0.74rem', color: '#64748B' }}>
                          {bc.duration} • {bc.enrolledStudents} enrolled
                        </Typography>
                      </Box>
                      <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.92rem', lineHeight: 1.3 }}>
                        {bc.title}
                      </Typography>
                    </Box>
                  </TableCell>

                  <TableCell sx={{ fontWeight: 600, color: '#334155', fontSize: '0.84rem' }}>
                    {bc.instructor}
                  </TableCell>

                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <VideoCameraFrontRoundedIcon sx={{ fontSize: 16, color: '#EA580C' }} />
                      <Box>
                        <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#0F172A' }}>
                          {bc.nextSessionDate}
                        </Typography>
                        <Typography sx={{ fontSize: '0.72rem', color: '#64748B', maxWidth: 200, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {bc.nextSessionTopic}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>

                  <TableCell sx={{ width: 150 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography sx={{ fontSize: '0.72rem', color: '#64748B' }}>
                          {bc.sessionsCompleted}/{bc.totalSessions} Sessions
                        </Typography>
                        <Typography sx={{ fontSize: '0.74rem', fontWeight: 800, color: '#0F172A' }}>
                          {bc.progressPct}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={bc.progressPct}
                        sx={{ height: 6, borderRadius: '9999px', bgcolor: '#F1F5F9', '& .MuiLinearProgress-bar': { bgcolor: '#2563EB' } }}
                      />
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={bc.status}
                      size="small"
                      sx={{
                        fontWeight: 800,
                        fontSize: '0.72rem',
                        bgcolor: bc.status === 'Enrolled' ? '#ECFDF5' : '#F1F5F9',
                        color: bc.status === 'Enrolled' ? '#059669' : '#475569',
                        border: `1px solid ${bc.status === 'Enrolled' ? '#A7F3D0' : '#E2E8F0'}`,
                      }}
                    />
                  </TableCell>

                  <TableCell align="right">
                    <Button
                      size="small"
                      variant={bc.status === 'Enrolled' ? 'outlined' : 'contained'}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (bc.status === 'Available') {
                          handleEnroll(bc);
                        } else {
                          toast.info(`Joining live session for "${bc.title}"...`, 'Live Classroom');
                        }
                      }}
                      sx={{
                        borderRadius: '8px',
                        textTransform: 'none',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        bgcolor: bc.status === 'Available' ? '#2563EB' : 'transparent',
                      }}
                    >
                      {bc.status === 'Available' ? 'Enroll Now' : 'Join Class'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* 3. Syllabus Detail Modal */}
      <Dialog
        open={Boolean(selectedBootcamp)}
        onClose={() => setSelectedBootcamp(null)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: '20px', p: 1 } } }}
      >
        {selectedBootcamp && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Chip label={selectedBootcamp.track} size="small" sx={{ bgcolor: '#EFF6FF', color: '#2563EB', fontWeight: 800, fontSize: '0.72rem', mb: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
                  {selectedBootcamp.title}
                </Typography>
                <Typography sx={{ fontSize: '0.8rem', color: '#64748B', mt: 0.25 }}>
                  Taught by {selectedBootcamp.instructor}
                </Typography>
              </Box>
              <IconButton onClick={() => setSelectedBootcamp(null)} size="small">
                <CloseRoundedIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </DialogTitle>

            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography sx={{ fontSize: '0.84rem', fontWeight: 800, color: '#0F172A' }}>
                Curriculum & Weekly Milestones
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {selectedBootcamp.syllabus.map((s, idx) => (
                  <Box key={idx} sx={{ p: 1.5, borderRadius: '12px', border: '1px solid #E2E8F0', bgcolor: '#F8FAFC' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography sx={{ fontWeight: 800, fontSize: '0.78rem', color: '#2563EB' }}>
                        {s.week}
                      </Typography>
                      <Chip label={s.deliverables} size="small" sx={{ fontSize: '0.68rem', fontWeight: 700, bgcolor: '#FFFFFF', border: '1px solid #CBD5E1' }} />
                    </Box>
                    <Typography sx={{ fontSize: '0.84rem', fontWeight: 600, color: '#0F172A' }}>
                      {s.topic}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </DialogContent>

            <DialogActions sx={{ p: 2.5, pt: 0 }}>
              <Button onClick={() => setSelectedBootcamp(null)} sx={{ textTransform: 'none', borderRadius: '10px' }}>
                Close
              </Button>
              {selectedBootcamp.status === 'Available' ? (
                <Button variant="contained" onClick={() => handleEnroll(selectedBootcamp)} sx={{ bgcolor: '#2563EB', textTransform: 'none', borderRadius: '10px', fontWeight: 700 }}>
                  Enroll in Cohort
                </Button>
              ) : (
                <Button variant="contained" onClick={() => toast.info('Launching live lecture...', 'Live Stream')} sx={{ bgcolor: '#2563EB', textTransform: 'none', borderRadius: '10px', fontWeight: 700 }}>
                  Enter Classroom
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
