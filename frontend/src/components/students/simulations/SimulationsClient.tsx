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
  Avatar,
  TextField,
} from '@mui/material';
import DomainOutlinedIcon from '@mui/icons-material/DomainOutlined';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import HourglassTopRoundedIcon from '@mui/icons-material/HourglassTopRounded';
import BugReportRoundedIcon from '@mui/icons-material/BugReportRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import { useToast } from '@/context/ToastContext';

interface SprintTicket {
  id: string;
  key: string;
  title: string;
  domain: string;
  priority: 'P0 - Blocker' | 'P1 - High' | 'P2 - Medium';
  storyPoints: number;
  status: 'Backlog' | 'In Progress' | 'In Review' | 'Merged';
  assignee: { name: string; avatarBg: string };
  prNumber?: string;
  techLeadFeedback?: string;
  description: string;
}

const INITIAL_TICKETS: SprintTicket[] = [
  {
    id: 't-1',
    key: 'PAY-8921',
    title: 'Implement Idempotency Key Middleware for Stripe Webhooks',
    domain: 'Payment Systems',
    priority: 'P0 - Blocker',
    storyPoints: 5,
    status: 'In Review',
    assignee: { name: 'You (Software Engineer)', avatarBg: '#2563EB' },
    prNumber: '#142',
    techLeadFeedback: 'Solid implementation of Redis distributed setnx key locks. Ensure retry-after header is formatted in seconds.',
    description: 'Avoid double billing by ensuring incoming webhooks check deduplication keys before dispatching balance top-up jobs.',
  },
  {
    id: 't-2',
    key: 'AUTH-3042',
    title: 'Migrate Session Token Expiry to Slotted Redis Hashes',
    domain: 'Security & Auth',
    priority: 'P1 - High',
    storyPoints: 3,
    status: 'In Progress',
    assignee: { name: 'You (Software Engineer)', avatarBg: '#2563EB' },
    description: 'Optimize auth token lookup performance across cluster nodes with TTL expiry event listeners.',
  },
  {
    id: 't-3',
    key: 'SEARCH-1120',
    title: 'Optimize Elasticsearch Fuzzy Autocomplete Query Latency',
    domain: 'Search & Discovery',
    priority: 'P1 - High',
    storyPoints: 8,
    status: 'Merged',
    assignee: { name: 'You (Software Engineer)', avatarBg: '#2563EB' },
    prNumber: '#138',
    techLeadFeedback: 'LGTM! Benchmarks show 42ms p99 latency drop under 10k RPS load tests. Merging.',
    description: 'Add edge n-gram analyzer to problem indexing pipeline to reduce memory footprint by 35%.',
  },
  {
    id: 't-4',
    key: 'SRE-9014',
    title: 'Configure Prometheus Alert Rules for BullMQ Failed Job Spikes',
    domain: 'SRE & Infrastructure',
    priority: 'P2 - Medium',
    storyPoints: 2,
    status: 'Backlog',
    assignee: { name: 'DevOps Lead', avatarBg: '#8B5CF6' },
    description: 'Alert on Slack if DLQ queue volume exceeds 50 failed judge container jobs in a 5-minute rolling window.',
  },
];

export default function SimulationsClient() {
  const toast = useToast();
  const [tickets, setTickets] = useState<SprintTicket[]>(INITIAL_TICKETS);
  const [selectedTicket, setSelectedTicket] = useState<SprintTicket | null>(null);
  const [prModalOpen, setPrModalOpen] = useState(false);
  const [prBranch, setPrBranch] = useState('feat/PAY-8921-idempotency');
  const [prNotes, setPrNotes] = useState('');

  const completedPoints = tickets.filter((t) => t.status === 'Merged').reduce((acc, t) => acc + t.storyPoints, 0);
  const totalPoints = tickets.reduce((acc, t) => acc + t.storyPoints, 0);
  const sprintPct = Math.round((completedPoints / totalPoints) * 100);

  const handleOpenPR = (ticket: SprintTicket) => {
    setSelectedTicket(ticket);
    setPrBranch(`feat/${ticket.key.toLowerCase()}-${ticket.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 20)}`);
    setPrModalOpen(true);
  };

  const handleSubmitPR = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;

    setTickets((prev) =>
      prev.map((t) =>
        t.id === selectedTicket.id
          ? {
              ...t,
              status: 'In Review',
              prNumber: `#${Math.floor(Math.random() * 800) + 100}`,
              techLeadFeedback: 'Automated CI build passed 42/42 tests. Assigned to Senior Staff Engineer for code review.',
            }
          : t
      )
    );
    setPrModalOpen(false);
    toast.success(`Pull Request opened for ${selectedTicket.key}. CI pipeline running!`, 'PR Submitted');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
      {/* 1. Header Card */}
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
              <DomainOutlinedIcon sx={{ fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.35rem', lineHeight: 1.2 }}>
                Corporate Engineering Simulation
              </Typography>
              <Typography sx={{ fontSize: '0.84rem', color: '#64748B', mt: 0.3 }}>
                Simulate Fortune 500 engineering sprints, submit PRs, resolve Jira tickets, and receive Staff Engineer reviews
              </Typography>
            </Box>
          </Box>

          <Chip
            label="Sprint #14 (Active: 4 Days Left)"
            size="small"
            sx={{
              bgcolor: '#ECFDF5',
              color: '#059669',
              fontWeight: 800,
              fontSize: '0.78rem',
              height: 28,
              borderRadius: '8px',
              border: '1px solid #A7F3D0',
            }}
          />
        </Box>

        {/* Sprint Burndown Progress */}
        <Box sx={{ mt: 3, pt: 2.5, borderTop: '1px solid #F1F5F9' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: '#0F172A' }}>
              Sprint Velocity & Story Points
            </Typography>
            <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: '#2563EB' }}>
              {completedPoints} of {totalPoints} Points ({sprintPct}%)
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={sprintPct}
            sx={{
              height: 8,
              borderRadius: '9999px',
              bgcolor: '#F1F5F9',
              '& .MuiLinearProgress-bar': { bgcolor: '#2563EB', borderRadius: '9999px' },
            }}
          />
        </Box>
      </Card>

      {/* 2. Structured Sprint Board Table */}
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
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.78rem', py: 2 }}>TICKET KEY & DOMAIN</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.78rem' }}>SUMMARY & REQUIREMENT</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.78rem' }}>PRIORITY</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.78rem' }}>POINTS</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.78rem' }}>STATUS</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, color: '#475569', fontSize: '0.78rem' }}>PR ACTION</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tickets.map((t) => (
                <TableRow
                  key={t.id}
                  hover
                  sx={{ cursor: 'pointer', '&:last-child td': { borderBottom: 'none' } }}
                  onClick={() => setSelectedTicket(t)}
                >
                  <TableCell sx={{ py: 2.25 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Typography sx={{ fontWeight: 800, color: '#2563EB', fontSize: '0.84rem', fontFamily: 'monospace' }}>
                        {t.key}
                      </Typography>
                      <Chip label={t.domain} size="small" sx={{ bgcolor: '#F1F5F9', color: '#475569', fontSize: '0.68rem', height: 20, width: 'fit-content' }} />
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.9rem', lineHeight: 1.3 }}>
                      {t.title}
                    </Typography>
                    <Typography sx={{ fontSize: '0.78rem', color: '#64748B', mt: 0.3, maxWidth: 440, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {t.description}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={t.priority}
                      size="small"
                      sx={{
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        bgcolor: t.priority.startsWith('P0') ? '#FEE2E2' : t.priority.startsWith('P1') ? '#FEF3C7' : '#F1F5F9',
                        color: t.priority.startsWith('P0') ? '#DC2626' : t.priority.startsWith('P1') ? '#D97706' : '#475569',
                      }}
                    />
                  </TableCell>

                  <TableCell sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.86rem' }}>
                    {t.storyPoints} pts
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={t.status}
                      size="small"
                      sx={{
                        fontWeight: 800,
                        fontSize: '0.72rem',
                        borderRadius: '6px',
                        bgcolor: t.status === 'Merged' ? '#ECFDF5' : t.status === 'In Review' ? '#FEF3C7' : t.status === 'In Progress' ? '#EFF6FF' : '#F1F5F9',
                        color: t.status === 'Merged' ? '#059669' : t.status === 'In Review' ? '#D97706' : t.status === 'In Progress' ? '#2563EB' : '#64748B',
                      }}
                    />
                  </TableCell>

                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }} onClick={(e) => e.stopPropagation()}>
                      {t.status === 'In Progress' && (
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => handleOpenPR(t)}
                          sx={{ bgcolor: '#2563EB', textTransform: 'none', borderRadius: '8px', fontSize: '0.76rem', fontWeight: 700 }}
                        >
                          Submit PR
                        </Button>
                      )}
                      {t.prNumber && (
                        <Chip
                          label={t.prNumber}
                          size="small"
                          sx={{ bgcolor: '#EFF6FF', color: '#2563EB', fontWeight: 800, fontSize: '0.74rem' }}
                        />
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* 3. Ticket Details & Tech Lead Feedback Modal */}
      <Dialog
        open={Boolean(selectedTicket && !prModalOpen)}
        onClose={() => setSelectedTicket(null)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: '20px', p: 1 } } }}
      >
        {selectedTicket && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography sx={{ fontWeight: 800, color: '#2563EB', fontSize: '0.88rem', fontFamily: 'monospace' }}>
                  {selectedTicket.key}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', lineHeight: 1.2, mt: 0.25 }}>
                  {selectedTicket.title}
                </Typography>
              </Box>
              <IconButton onClick={() => setSelectedTicket(null)} size="small">
                <CloseRoundedIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </DialogTitle>

            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Typography sx={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.6 }}>
                {selectedTicket.description}
              </Typography>

              {selectedTicket.techLeadFeedback && (
                <Box sx={{ p: 2, bgcolor: '#F0FDF4', borderRadius: '14px', border: '1px solid #BBF7D0' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <CheckCircleRoundedIcon sx={{ color: '#16A34A', fontSize: 18 }} />
                    <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: '#166534' }}>
                      Staff Engineer Code Review
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: '0.82rem', color: '#14532D', fontStyle: 'italic', lineHeight: 1.5 }}>
                    "{selectedTicket.techLeadFeedback}"
                  </Typography>
                </Box>
              )}
            </DialogContent>

            <DialogActions sx={{ p: 2.5, pt: 0 }}>
              <Button onClick={() => setSelectedTicket(null)} sx={{ textTransform: 'none', borderRadius: '10px' }}>
                Close
              </Button>
              {selectedTicket.status === 'In Progress' && (
                <Button
                  variant="contained"
                  onClick={() => handleOpenPR(selectedTicket)}
                  sx={{ bgcolor: '#2563EB', textTransform: 'none', borderRadius: '10px', fontWeight: 700 }}
                >
                  Create Pull Request
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* 4. Pull Request Submission Modal */}
      <Dialog
        open={prModalOpen}
        onClose={() => setPrModalOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: '20px', p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#0F172A' }}>
          Open Simulated Pull Request
        </DialogTitle>
        <form onSubmit={handleSubmitPR}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Branch Name"
              size="small"
              fullWidth
              value={prBranch}
              onChange={(e) => setPrBranch(e.target.value)}
            />
            <TextField
              label="PR Description & Testing Notes"
              size="small"
              fullWidth
              multiline
              rows={3}
              required
              value={prNotes}
              onChange={(e) => setPrNotes(e.target.value)}
              placeholder="Explain how you solved the ticket and test coverage added..."
            />
          </DialogContent>
          <DialogActions sx={{ p: 2.5, pt: 0 }}>
            <Button onClick={() => setPrModalOpen(false)} sx={{ textTransform: 'none', borderRadius: '10px' }}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" startIcon={<SendRoundedIcon />} sx={{ bgcolor: '#2563EB', textTransform: 'none', borderRadius: '10px', fontWeight: 700 }}>
              Submit for Review
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
