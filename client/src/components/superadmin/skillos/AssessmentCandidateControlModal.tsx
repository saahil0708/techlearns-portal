'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Tooltip,
  Typography,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';

// Icons
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import LockOpenRoundedIcon from '@mui/icons-material/LockOpenRounded';
import MoreTimeRoundedIcon from '@mui/icons-material/MoreTimeRounded';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import CampaignRoundedIcon from '@mui/icons-material/CampaignRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';
import VideocamRoundedIcon from '@mui/icons-material/VideocamRounded';
import LaptopWindowsRoundedIcon from '@mui/icons-material/LaptopWindowsRounded';

import { useToast } from '@/context/ToastContext';
import type { SkillosAssessmentEntity } from './SuperadminSkillosClient';

export interface CandidateControlRecord {
  id: string;
  fullName: string;
  email: string;
  rollNumber: string;
  branch: string;
  status: 'WAITING_ROOM' | 'IN_PROGRESS' | 'DISCONNECTED' | 'FLAGGED' | 'SUBMITTED';
  timeRemainingMinutes: number;
  extraMinutesAdded: number;
  tabSwitches: number;
  webcamActive: boolean;
  deviceLocked: boolean;
  magicToken: string;
  lastActive: string;
}

interface AssessmentCandidateControlModalProps {
  open: boolean;
  onClose: () => void;
  assessment: SkillosAssessmentEntity | null;
}

export default function AssessmentCandidateControlModal({
  open,
  onClose,
  assessment,
}: AssessmentCandidateControlModalProps) {
  const toast = useToast();

  // Test-level live states
  const [isTestUnlocked, setIsTestUnlocked] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [announcementText, setAnnouncementText] = useState('');
  const [activeAnnouncement, setActiveAnnouncement] = useState<string | null>(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'WAITING_ROOM' | 'IN_PROGRESS' | 'DISCONNECTED' | 'FLAGGED' | 'SUBMITTED'>('ALL');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Time grant anchor
  const [timeMenuAnchor, setTimeMenuAnchor] = useState<{ el: HTMLElement; candidateId: string } | null>(null);

  // Candidate Roster state for this assessment
  const [candidates, setCandidates] = useState<CandidateControlRecord[]>(() => {
    // Generate an initial realistic roster based on assessment scope
    const prefixes = ['CS', 'IT', 'ECE', 'DS', 'AIML'];
    const names = [
      'Aarav Sharma', 'Sneha Patel', 'Rohan Gupta', 'Priya Nair', 'Vikramaditya Verma',
      'Ananya Reddy', 'Karthik Iyer', 'Divya Mehra', 'Aditya Singh', 'Meera Deshmukh',
      'Rishi Joshi', 'Tanvi Chawla', 'Siddharth Rao', 'Neha Sen', 'Rahul Saxena',
    ];

    return names.map((name, idx) => {
      const branch = prefixes[idx % prefixes.length];
      const initialStatus: CandidateControlRecord['status'] =
        idx === 2 ? 'DISCONNECTED' : idx === 4 ? 'FLAGGED' : idx > 10 ? 'WAITING_ROOM' : 'IN_PROGRESS';

      return {
        id: `cand-${idx + 1}`,
        fullName: name,
        email: `${name.toLowerCase().replace(/\s+/g, '.')}@college.edu`,
        rollNumber: `2026${branch}${String(101 + idx).padStart(3, '0')}`,
        branch,
        status: initialStatus,
        timeRemainingMinutes: 75,
        extraMinutesAdded: 0,
        tabSwitches: idx === 4 ? 3 : idx === 2 ? 1 : 0,
        webcamActive: idx !== 2,
        deviceLocked: true,
        magicToken: `tok_skl_${Math.random().toString(36).substring(2, 10)}_${idx + 1}`,
        lastActive: 'Just now',
      };
    });
  });

  if (!assessment) return null;

  // Filtered candidate list
  const filteredCandidates = candidates.filter((c) => {
    const matchesSearch =
      c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.branch.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const paginatedCandidates = filteredCandidates.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Metrics
  const totalCount = candidates.length;
  const waitingCount = candidates.filter((c) => c.status === 'WAITING_ROOM').length;
  const inProgressCount = candidates.filter((c) => c.status === 'IN_PROGRESS').length;
  const disconnectedCount = candidates.filter((c) => c.status === 'DISCONNECTED').length;
  const flaggedCount = candidates.filter((c) => c.status === 'FLAGGED').length;
  const submittedCount = candidates.filter((c) => c.status === 'SUBMITTED').length;

  // Action Handlers
  const handleUnlockWaitingRoom = () => {
    setIsTestUnlocked(true);
    setCandidates((prev) =>
      prev.map((c) => (c.status === 'WAITING_ROOM' ? { ...c, status: 'IN_PROGRESS' } : c))
    );
    toast.success('Exam questions & timers unlocked for all students in waiting room!', 'Waiting Room Unlocked');
  };

  const handleTogglePause = () => {
    const nextPaused = !isPaused;
    setIsPaused(nextPaused);
    if (nextPaused) {
      toast.info('Assessment timer paused for all candidates.', 'Exam Paused');
    } else {
      toast.success('Assessment resumed.', 'Exam Resumed');
    }
  };

  const handleBroadcastAnnouncement = () => {
    if (!announcementText.trim()) return;
    setActiveAnnouncement(announcementText.trim());
    toast.success(`Announcement broadcasted to all live exam candidate screens!`, 'Banner Broadcasted');
    setAnnouncementText('');
  };

  const handleClearAnnouncement = () => {
    setActiveAnnouncement(null);
    toast.info('Live announcement banner removed.', 'Announcement Cleared');
  };

  const handleAddCohortTime = (minutes: number) => {
    setCandidates((prev) =>
      prev.map((c) => ({
        ...c,
        timeRemainingMinutes: c.timeRemainingMinutes + minutes,
        extraMinutesAdded: c.extraMinutesAdded + minutes,
      }))
    );
    toast.success(`Granted +${minutes} minutes to all ${candidates.length} candidates in the cohort!`, 'Cohort Time Extended');
  };

  const handleCopyCandidateLink = (candidate: CandidateControlRecord) => {
    const candidateUrl = `${window.location.origin}/assessments/${assessment.id}?token=${candidate.magicToken}&email=${encodeURIComponent(candidate.email)}`;
    navigator.clipboard.writeText(candidateUrl);
    toast.success(`Copied magic link for ${candidate.fullName}!`, 'Magic Link Ready');
  };

  const handleResetDeviceLock = (candidateId: string) => {
    setCandidates((prev) =>
      prev.map((c) => {
        if (c.id === candidateId) {
          return {
            ...c,
            deviceLocked: false,
            status: c.status === 'DISCONNECTED' ? 'IN_PROGRESS' : c.status,
            lastActive: 'Unlocked just now',
          };
        }
        return c;
      })
    );
    toast.success('Device & session lock reset! Student can now reconnect from any device/browser.', 'Session Unlocked');
  };

  const handleGrantExtraTime = (candidateId: string, minutes: number) => {
    setCandidates((prev) =>
      prev.map((c) => {
        if (c.id === candidateId) {
          return {
            ...c,
            timeRemainingMinutes: c.timeRemainingMinutes + minutes,
            extraMinutesAdded: c.extraMinutesAdded + minutes,
          };
        }
        return c;
      })
    );
    toast.success(`Granted +${minutes} minutes extra time!`, 'Time Extension Applied');
    setTimeMenuAnchor(null);
  };

  const handleClearFlags = (candidateId: string) => {
    setCandidates((prev) =>
      prev.map((c) => {
        if (c.id === candidateId) {
          return {
            ...c,
            tabSwitches: 0,
            status: c.status === 'FLAGGED' ? 'IN_PROGRESS' : c.status,
          };
        }
        return c;
      })
    );
    toast.success('Proctoring violations and tab-switch count cleared!', 'Integrity Override');
  };

  const handleForceSubmit = (candidateId: string) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === candidateId ? { ...c, status: 'SUBMITTED', timeRemainingMinutes: 0 } : c))
    );
    toast.success('Assessment forcibly submitted and finalized for candidate.', 'Exam Finalized');
  };

  const handleExportCSV = () => {
    const headers = 'FullName,RollNumber,Branch,Email,Status,TimeRemainingMin,ExtraMinGranted,TabSwitches,DeviceLocked,MagicToken\n';
    const rows = candidates
      .map(
        (c) =>
          `"${c.fullName}","${c.rollNumber}","${c.branch}","${c.email}","${c.status}",${c.timeRemainingMinutes},${c.extraMinutesAdded},${c.tabSwitches},${c.deviceLocked},"${c.magicToken}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${assessment.code}_candidate_incident_control_report.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Candidate control log exported to CSV.', 'Audit Log Exported');
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: '24px',
            bgcolor: '#F8FAFC',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            border: '1px solid #E2E8F0',
            boxShadow: '0 25px 60px rgba(11, 31, 58, 0.25)',
          },
        },
      }}
    >
      {/* ── TOP HEADER BAR ── */}
      <DialogTitle
        sx={{
          p: { xs: 2, sm: 3 },
          bgcolor: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #0B1F3A 0%, #5B2D90 100%)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(91, 45, 144, 0.25)',
            }}
          >
            <SupportAgentRoundedIcon sx={{ fontSize: 24 }} />
          </Box>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap' }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
                {assessment.title}
              </Typography>
              <Chip
                label={assessment.code}
                size="small"
                sx={{
                  height: 22,
                  fontWeight: 800,
                  fontSize: '0.68rem',
                  bgcolor: '#FAF5FF',
                  color: '#5B2D90',
                  border: '1px solid #E9D5FF',
                }}
              />
              <Chip
                label={assessment.status}
                size="small"
                sx={{
                  height: 22,
                  fontWeight: 800,
                  fontSize: '0.68rem',
                  bgcolor:
                    assessment.status === 'ONGOING'
                      ? '#DCFCE7'
                      : assessment.status === 'UPCOMING'
                      ? '#FEF3C7'
                      : '#F1F5F9',
                  color:
                    assessment.status === 'ONGOING'
                      ? '#15803D'
                      : assessment.status === 'UPCOMING'
                      ? '#B45309'
                      : '#475569',
                }}
              />
            </Box>
            <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mt: 0.25, fontSize: '0.76rem' }}>
              Live Student Roster, Technical Glitch Overrides & Exam Command Console · {assessment.institutionName} ({assessment.batchName})
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<FileDownloadRoundedIcon />}
            onClick={handleExportCSV}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.78rem',
              borderRadius: '10px',
              borderColor: '#CBD5E1',
              color: '#334155',
              bgcolor: '#FFFFFF',
              '&:hover': { bgcolor: '#F8FAFC', borderColor: '#5B2D90' },
            }}
          >
            Export Incident Sheet
          </Button>

          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              width: 36,
              height: 36,
              color: '#64748B',
              bgcolor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              '&:hover': { bgcolor: '#FEE2E2', color: '#DC2626' },
            }}
          >
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: { xs: 2, sm: 3 }, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {/* ── LIVE HOST COMMAND CONTROLS ── */}
        <Paper
          elevation={0}
          sx={{
            p: 2.25,
            borderRadius: '16px',
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ShieldRoundedIcon sx={{ color: '#5B2D90', fontSize: 20 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.86rem' }}>
                Live Test-Wide Host Actions
              </Typography>
            </Box>

            {/* Quick Host Buttons */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              {/* Unlock Waiting Room */}
              <Button
                size="small"
                variant="contained"
                disabled={isTestUnlocked}
                startIcon={<PlayArrowRoundedIcon />}
                onClick={handleUnlockWaitingRoom}
                sx={{
                  background: isTestUnlocked
                    ? '#E2E8F0'
                    : 'linear-gradient(135deg, #16A34A 0%, #059669 100%)',
                  color: isTestUnlocked ? '#94A3B8' : '#FFFFFF',
                  textTransform: 'none',
                  fontWeight: 800,
                  fontSize: '0.76rem',
                  borderRadius: '8px',
                  boxShadow: 'none',
                }}
              >
                {isTestUnlocked ? 'Waiting Room Unlocked' : 'Unlock Waiting Room for All'}
              </Button>

              {/* Pause / Resume */}
              <Button
                size="small"
                variant="outlined"
                startIcon={isPaused ? <PlayArrowRoundedIcon /> : <PauseRoundedIcon />}
                onClick={handleTogglePause}
                sx={{
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.76rem',
                  borderRadius: '8px',
                  borderColor: isPaused ? '#16A34A' : '#D97706',
                  color: isPaused ? '#16A34A' : '#D97706',
                  bgcolor: '#FFFFFF',
                  '&:hover': { bgcolor: isPaused ? '#DCFCE7' : '#FEF3C7' },
                }}
              >
                {isPaused ? 'Resume Exam' : 'Pause All Timers'}
              </Button>

              {/* Add Cohort Time */}
              <Button
                size="small"
                variant="outlined"
                startIcon={<MoreTimeRoundedIcon />}
                onClick={() => handleAddCohortTime(15)}
                sx={{
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.76rem',
                  borderRadius: '8px',
                  borderColor: '#5B2D90',
                  color: '#5B2D90',
                  bgcolor: '#FAF5FF',
                  '&:hover': { bgcolor: '#F3E8FF' },
                }}
              >
                +15 Min All Students
              </Button>
            </Box>
          </Box>

          {/* Broadcast Announcement Bar */}
          <Box
            sx={{
              p: 1.5,
              borderRadius: '12px',
              bgcolor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
            }}
          >
            <CampaignRoundedIcon sx={{ color: '#5B2D90', fontSize: 22 }} />
            <TextField
              size="small"
              fullWidth
              placeholder="Type urgent live announcement to broadcast to all candidate screens (e.g. 'Network issue resolved, 10 mins added')..."
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleBroadcastAnnouncement();
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  bgcolor: '#FFFFFF',
                  fontSize: '0.8rem',
                },
              }}
            />
            <Button
              size="small"
              variant="contained"
              startIcon={<SendRoundedIcon sx={{ fontSize: 14 }} />}
              onClick={handleBroadcastAnnouncement}
              disabled={!announcementText.trim()}
              sx={{
                background: 'linear-gradient(135deg, #0B1F3A 0%, #5B2D90 100%)',
                color: '#FFFFFF',
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.76rem',
                borderRadius: '8px',
                px: 2,
                whiteSpace: 'nowrap',
              }}
            >
              Broadcast
            </Button>
          </Box>

          {/* Active Banner Preview if set */}
          {activeAnnouncement && (
            <Box
              sx={{
                p: 1.25,
                borderRadius: '10px',
                bgcolor: '#FAF5FF',
                border: '1.5px solid #5B2D90',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip label="LIVE SCREEN BANNER" size="small" sx={{ height: 18, fontSize: '0.62rem', fontWeight: 800, bgcolor: '#5B2D90', color: '#FFFFFF' }} />
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#0B1F3A', fontSize: '0.8rem' }}>
                  {activeAnnouncement}
                </Typography>
              </Box>
              <Button size="small" color="error" onClick={handleClearAnnouncement} sx={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'none', p: 0 }}>
                Dismiss Banner
              </Button>
            </Box>
          )}
        </Paper>

        {/* ── METRICS COUNTERS ── */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(5, 1fr)' }, gap: 2 }}>
          {[
            { label: 'Total Enrolled', count: totalCount, color: '#0F172A', bg: '#FFFFFF' },
            { label: 'In Waiting Room', count: waitingCount, color: '#5B2D90', bg: '#FAF5FF' },
            { label: 'Active In Exam', count: inProgressCount, color: '#16A34A', bg: '#DCFCE7' },
            { label: 'Technical Glitches', count: disconnectedCount + flaggedCount, color: '#DC2626', bg: '#FEF2F2' },
            { label: 'Submissions Finished', count: submittedCount, color: '#0B1F3A', bg: '#F1F5F9' },
          ].map((m) => (
            <Paper
              key={m.label}
              elevation={0}
              sx={{
                p: 1.75,
                borderRadius: '14px',
                bgcolor: m.bg,
                border: '1px solid #E2E8F0',
                display: 'flex',
                flexDirection: 'column',
                gap: 0.25,
              }}
            >
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, fontSize: '0.68rem', textTransform: 'uppercase' }}>
                {m.label}
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 900, color: m.color, lineHeight: 1.2 }}>
                {m.count}
              </Typography>
            </Paper>
          ))}
        </Box>

        {/* ── SEARCH, FILTER & ROSTER TABLE ── */}
        <Paper
          elevation={0}
          sx={{
            p: 2.25,
            borderRadius: '16px',
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {/* Search & Status Filter Chips */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
            <TextField
              size="small"
              placeholder="Search candidate by name, roll no, email, branch..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(0);
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon sx={{ color: '#94A3B8', fontSize: 18 }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                width: { xs: '100%', sm: 340 },
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                  bgcolor: '#F8FAFC',
                  fontSize: '0.8rem',
                },
              }}
            />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
              {(
                [
                  { key: 'ALL', label: `All (${totalCount})` },
                  { key: 'WAITING_ROOM', label: `Waiting (${waitingCount})` },
                  { key: 'IN_PROGRESS', label: `Active (${inProgressCount})` },
                  { key: 'DISCONNECTED', label: `Disconnected (${disconnectedCount})` },
                  { key: 'FLAGGED', label: `Flagged (${flaggedCount})` },
                  { key: 'SUBMITTED', label: `Submitted (${submittedCount})` },
                ] as const
              ).map((tab) => (
                <Chip
                  key={tab.key}
                  label={tab.label}
                  size="small"
                  clickable
                  onClick={() => {
                    setStatusFilter(tab.key);
                    setPage(0);
                  }}
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.72rem',
                    bgcolor: statusFilter === tab.key ? '#0B1F3A' : '#F1F5F9',
                    color: statusFilter === tab.key ? '#FFFFFF' : '#475569',
                    border: '1px solid',
                    borderColor: statusFilter === tab.key ? '#0B1F3A' : '#E2E8F0',
                    '&:hover': {
                      bgcolor: statusFilter === tab.key ? '#17366E' : '#FAF5FF',
                    },
                  }}
                />
              ))}
            </Box>
          </Box>

          {/* Candidates List Table (Rule 10 Structured Format) */}
          <TableContainer sx={{ border: '1px solid #E2E8F0', borderRadius: '12px' }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.74rem', textTransform: 'uppercase' }}>
                    Student Candidate
                  </TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.74rem', textTransform: 'uppercase' }}>
                    Email & Magic Link
                  </TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.74rem', textTransform: 'uppercase' }}>
                    Live Status
                  </TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.74rem', textTransform: 'uppercase' }}>
                    Time Remaining
                  </TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.74rem', textTransform: 'uppercase' }}>
                    Integrity & Device
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800, color: '#475569', fontSize: '0.74rem', textTransform: 'uppercase', pr: 2 }}>
                    Emergency Issue Controls
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedCandidates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                      <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 600 }}>
                        No candidates match the specified filter or query.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedCandidates.map((c) => {
                    const isIssue = c.status === 'DISCONNECTED' || c.status === 'FLAGGED';

                    return (
                      <TableRow
                        key={c.id}
                        hover
                        sx={{
                          bgcolor: isIssue ? 'rgba(254, 242, 242, 0.4)' : 'transparent',
                        }}
                      >
                        {/* Student Name & Roll No */}
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip
                              label={c.rollNumber}
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: '0.66rem',
                                fontWeight: 800,
                                bgcolor: '#EDE9FE',
                                color: '#5B2D90',
                              }}
                            />
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.82rem' }}>
                                {c.fullName}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.68rem' }}>
                                {c.branch}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>

                        {/* Email & Magic Token Copy */}
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                            <Typography variant="caption" sx={{ color: '#334155', fontWeight: 600, fontSize: '0.74rem' }}>
                              {c.email}
                            </Typography>
                            <Tooltip title="Copy Candidate Dynamic Magic Link">
                              <IconButton
                                size="small"
                                onClick={() => handleCopyCandidateLink(c)}
                                sx={{ p: 0.3, color: '#5B2D90', '&:hover': { bgcolor: '#FAF5FF' } }}
                              >
                                <ContentCopyRoundedIcon sx={{ fontSize: 14 }} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>

                        {/* Live Status */}
                        <TableCell>
                          <Chip
                            label={
                              c.status === 'WAITING_ROOM'
                                ? 'Waiting Room'
                                : c.status === 'IN_PROGRESS'
                                ? 'Taking Exam'
                                : c.status === 'DISCONNECTED'
                                ? 'Disconnected'
                                : c.status === 'FLAGGED'
                                ? 'Proctor Flag'
                                : 'Submitted'
                            }
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: '0.66rem',
                              fontWeight: 800,
                              bgcolor:
                                c.status === 'IN_PROGRESS'
                                  ? '#DCFCE7'
                                  : c.status === 'WAITING_ROOM'
                                  ? '#FAF5FF'
                                  : c.status === 'DISCONNECTED'
                                  ? '#FEF2F2'
                                  : c.status === 'FLAGGED'
                                  ? '#FEF3C7'
                                  : '#F1F5F9',
                              color:
                                c.status === 'IN_PROGRESS'
                                  ? '#15803D'
                                  : c.status === 'WAITING_ROOM'
                                  ? '#5B2D90'
                                  : c.status === 'DISCONNECTED'
                                  ? '#DC2626'
                                  : c.status === 'FLAGGED'
                                  ? '#B45309'
                                  : '#475569',
                            }}
                          />
                        </TableCell>

                        {/* Time Remaining */}
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                            <Typography variant="body2" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.8rem' }}>
                              {c.timeRemainingMinutes} min
                            </Typography>
                            {c.extraMinutesAdded > 0 && (
                              <Chip
                                label={`+${c.extraMinutesAdded}m extra`}
                                size="small"
                                sx={{ height: 16, fontSize: '0.58rem', fontWeight: 800, bgcolor: '#DCFCE7', color: '#15803D' }}
                              />
                            )}
                          </Box>
                        </TableCell>

                        {/* Integrity & Device */}
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Tooltip title={c.webcamActive ? 'Webcam active' : 'Webcam disconnected'}>
                              <VideocamRoundedIcon sx={{ fontSize: 16, color: c.webcamActive ? '#16A34A' : '#DC2626' }} />
                            </Tooltip>
                            <Tooltip title={c.deviceLocked ? 'Session locked to student device' : 'Unlocked / Multi-device allowed'}>
                              <LaptopWindowsRoundedIcon sx={{ fontSize: 16, color: c.deviceLocked ? '#0B1F3A' : '#16A34A' }} />
                            </Tooltip>
                            {c.tabSwitches > 0 && (
                              <Tooltip title={`${c.tabSwitches} tab-switch strikes detected`}>
                                <Chip
                                  icon={<WarningAmberRoundedIcon sx={{ fontSize: '12px !important', color: '#DC2626 !important' }} />}
                                  label={`${c.tabSwitches} strikes`}
                                  size="small"
                                  sx={{ height: 18, fontSize: '0.6rem', fontWeight: 800, bgcolor: '#FEF2F2', color: '#DC2626' }}
                                />
                              </Tooltip>
                            )}
                          </Box>
                        </TableCell>

                        {/* Issue Resolution Controls */}
                        <TableCell align="right" sx={{ pr: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                            {/* Unlock Session (for browser freeze / laptop change) */}
                            <Tooltip title="Unlock & Clear Device Lock (If laptop crashed/switched browser)">
                              <IconButton
                                size="small"
                                onClick={() => handleResetDeviceLock(c.id)}
                                sx={{
                                  p: 0.4,
                                  color: '#059669',
                                  bgcolor: '#F0FDF4',
                                  border: '1px solid #BBF7D0',
                                  '&:hover': { bgcolor: '#DCFCE7' },
                                }}
                              >
                                <LockOpenRoundedIcon sx={{ fontSize: 15 }} />
                              </IconButton>
                            </Tooltip>

                            {/* Grant Extra Time Menu */}
                            <Tooltip title="Grant Extra Time (+5m, +10m, +15m, +30m)">
                              <IconButton
                                size="small"
                                onClick={(e) => setTimeMenuAnchor({ el: e.currentTarget, candidateId: c.id })}
                                sx={{
                                  p: 0.4,
                                  color: '#5B2D90',
                                  bgcolor: '#FAF5FF',
                                  border: '1px solid #E9D5FF',
                                  '&:hover': { bgcolor: '#F3E8FF' },
                                }}
                              >
                                <MoreTimeRoundedIcon sx={{ fontSize: 15 }} />
                              </IconButton>
                            </Tooltip>

                            {/* Clear Flags */}
                            {c.tabSwitches > 0 && (
                              <Tooltip title="Clear False-Positive Proctoring Strikes">
                                <IconButton
                                  size="small"
                                  onClick={() => handleClearFlags(c.id)}
                                  sx={{
                                    p: 0.4,
                                    color: '#D97706',
                                    bgcolor: '#FFFBEB',
                                    border: '1px solid #FDE68A',
                                    '&:hover': { bgcolor: '#FEF3C7' },
                                  }}
                                >
                                  <ShieldRoundedIcon sx={{ fontSize: 15 }} />
                                </IconButton>
                              </Tooltip>
                            )}

                            {/* Force Submit */}
                            {c.status !== 'SUBMITTED' && (
                              <Tooltip title="Force Submit & Finalize Attempt">
                                <IconButton
                                  size="small"
                                  onClick={() => handleForceSubmit(c.id)}
                                  sx={{
                                    p: 0.4,
                                    color: '#475569',
                                    bgcolor: '#F8FAFC',
                                    border: '1px solid #E2E8F0',
                                    '&:hover': { color: '#0F172A', bgcolor: '#F1F5F9' },
                                  }}
                                >
                                  <DoneAllRoundedIcon sx={{ fontSize: 15 }} />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredCandidates.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            sx={{ borderTop: '1px solid #E2E8F0' }}
          />
        </Paper>
      </DialogContent>

      {/* Grant Time Popover Menu */}
      {timeMenuAnchor && (
        <Menu
          anchorEl={timeMenuAnchor.el}
          open={Boolean(timeMenuAnchor)}
          onClose={() => setTimeMenuAnchor(null)}
          slotProps={{ paper: { sx: { borderRadius: '12px', minWidth: 160, p: 0.5 } } }}
        >
          <Typography variant="caption" sx={{ px: 1.5, py: 0.5, fontWeight: 800, color: '#64748B', display: 'block', fontSize: '0.68rem', textTransform: 'uppercase' }}>
            Grant Extra Time
          </Typography>
          {[
            { mins: 5, label: '+5 Minutes' },
            { mins: 10, label: '+10 Minutes' },
            { mins: 15, label: '+15 Minutes' },
            { mins: 30, label: '+30 Minutes' },
          ].map((opt) => (
            <MenuItem
              key={opt.mins}
              onClick={() => handleGrantExtraTime(timeMenuAnchor.candidateId, opt.mins)}
              sx={{ borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, color: '#0B1F3A' }}
            >
              <ListItemIcon sx={{ minWidth: 26, color: '#5B2D90' }}>
                <MoreTimeRoundedIcon sx={{ fontSize: 16 }} />
              </ListItemIcon>
              <ListItemText primary={opt.label} slotProps={{ primary: { sx: { fontSize: '0.8rem', fontWeight: 700 } } }} />
            </MenuItem>
          ))}
        </Menu>
      )}
    </Dialog>
  );
}
