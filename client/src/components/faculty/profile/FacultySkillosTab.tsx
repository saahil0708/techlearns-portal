'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  MenuItem,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

// Material Rounded Icons
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import PlayCircleOutlineRoundedIcon from '@mui/icons-material/PlayCircleOutlineRounded';
import LeaderboardRoundedIcon from '@mui/icons-material/LeaderboardRounded';
import FullscreenRoundedIcon from '@mui/icons-material/FullscreenRounded';
import ContentPasteOffRoundedIcon from '@mui/icons-material/ContentPasteOffRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import VideocamRoundedIcon from '@mui/icons-material/VideocamRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';

import { apiService } from '@/lib/api-service';
import { useToast } from '@/context/ToastContext';
import Link from 'next/link';

interface FacultySkillosTabProps {
  collegeId?: string;
  collegeName?: string;
}

export default function FacultySkillosTab({
  collegeId,
  collegeName = 'Academic Institution',
}: FacultySkillosTabProps) {
  const toast = useToast();

  const [contests, setContests] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [shareModalContest, setShareModalContest] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const getCandidateAssessmentUrl = (c: any) => {
    if (typeof window === 'undefined') return `/assessments/${c?.id || ''}`;
    return `${window.location.origin}/assessments/${c?.id || ''}`;
  };

  const handleCopyDirectLink = (e: React.MouseEvent, c: any) => {
    e.stopPropagation();
    const url = getCandidateAssessmentUrl(c);
    navigator.clipboard.writeText(url);
    toast.success('Public candidate test link copied to clipboard!', 'Link Copied');
  };

  const fetchContests = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiService.getContests({
        limit: 100,
        institutionId: collegeId,
      });
      const items = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
      setContests(items);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  }, [collegeId]);

  useEffect(() => {
    fetchContests();
  }, [fetchContests]);



  const filteredContests = useMemo(() => {
    return contests.filter((c) => {
      if (statusFilter !== 'ALL') {
        const matchesStatus =
          statusFilter === 'ONGOING'
            ? c.status === 'ONGOING'
            : statusFilter === 'COMPLETED'
              ? c.status === 'COMPLETED'
              : c.status === statusFilter;
        if (!matchesStatus) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = c.title?.toLowerCase().includes(q);
        const matchesCode = c.code?.toLowerCase().includes(q);
        const matchesBatch = c.batch?.name?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesCode && !matchesBatch) return false;
      }
      return true;
    });
  }, [contests, searchQuery, statusFilter]);

  const totalProctored = contests.filter((c) => c.isProctored !== false).length;
  const activeRooms = contests.filter((c) => c.status === 'ONGOING').length;
  const upcomingTests = contests.filter((c) => c.status === 'UPCOMING').length;

  const borderColor = '#E2E8F0';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
      {/* Top Banner & Action Header */}
      <Card
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3.5 },
          borderRadius: '20px',
          bgcolor: '#FFFFFF',
          border: `1px solid ${borderColor}`,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)',
          background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #0B1F3A 0%, #5B2D90 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 18px rgba(79, 70, 229, 0.3)',
              }}
            >
              <ShieldRoundedIcon sx={{ color: '#FFFFFF', fontSize: 30 }} />
            </Box>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
                  SkillOS Proctored Assessment Studio
                </Typography>
                <Chip
                  size="small"
                  icon={<SecurityRoundedIcon sx={{ fontSize: '13px !important', color: '#059669 !important' }} />}
                  label="SECURE PROCTOR ENGINE"
                  sx={{
                    bgcolor: '#ECFDF5',
                    color: '#059669',
                    fontWeight: 800,
                    fontSize: '0.68rem',
                    border: '1px solid #A7F3D0',
                    height: 22,
                  }}
                />
              </Box>
              <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5, fontWeight: 500 }}>
                Schedule, manage, and supervise AI-proctored cohort tests, strict exams, and plagiarism-screened assessments.
              </Typography>
            </Box>
          </Box>

          {/* Super Admin Managed Indicator */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              icon={<LockRoundedIcon sx={{ fontSize: '13px !important', color: '#475569 !important' }} />}
              label="TEST CREATION RESTRICTED TO SUPER ADMIN"
              sx={{
                bgcolor: '#F1F5F9',
                color: '#475569',
                fontWeight: 700,
                fontSize: '0.72rem',
                border: '1px solid #CBD5E1',
                height: 32,
                px: 1,
              }}
            />
          </Box>
        </Box>
      </Card>

      {/* Metrics Row */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 2 }}>
        <Card
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: '16px',
            bgcolor: '#FFFFFF',
            border: `1px solid ${borderColor}`,
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          }}
        >
          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
            Total SkillOS Assessments
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', mt: 0.5 }}>
            {contests.length}
          </Typography>
          <Typography variant="caption" sx={{ color: '#0B1F3A', fontWeight: 600 }}>
            {totalProctored} Proctored Enforced
          </Typography>
        </Card>

        <Card
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: '16px',
            bgcolor: '#FFFFFF',
            border: `1px solid ${borderColor}`,
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          }}
        >
          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
            Active Live Rooms
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, color: activeRooms > 0 ? '#10B981' : '#0F172A', mt: 0.5 }}>
            {activeRooms}
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
            Real-time supervised sessions
          </Typography>
        </Card>

        <Card
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: '16px',
            bgcolor: '#FFFFFF',
            border: `1px solid ${borderColor}`,
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          }}
        >
          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
            Scheduled Upcoming
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#5B2D90', mt: 0.5 }}>
            {upcomingTests}
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
            Auto-enrolled cohort exams
          </Typography>
        </Card>

        <Card
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: '16px',
            bgcolor: '#FFFFFF',
            border: `1px solid ${borderColor}`,
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          }}
        >
          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
            Integrity Protection
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#059669', mt: 0.5 }}>
            100%
          </Typography>
          <Typography variant="caption" sx={{ color: '#059669', fontWeight: 600 }}>
            MOSS Plagiarism & Fullscreen
          </Typography>
        </Card>
      </Box>

      {/* Structured List Table Header & Search (Rule 10) */}
      <Card
        elevation={0}
        sx={{
          borderRadius: '18px',
          bgcolor: '#FFFFFF',
          border: `1px solid ${borderColor}`,
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)',
        }}
      >
        {/* Table Filter Controls */}
        <Box
          sx={{
            p: 2.5,
            borderBottom: `1px solid ${borderColor}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
            bgcolor: '#FFFFFF',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, minWidth: '280px' }}>
            <TextField
              size="small"
              placeholder="Search assessment by title, access code, or cohort..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{
                flex: 1,
                maxWidth: '420px',
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                  bgcolor: '#F8FAFC',
                },
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon sx={{ color: '#94A3B8' }} />
                    </InputAdornment>
                  ),
                },
              }}
            />

            <Box sx={{ display: 'flex', gap: 1 }}>
              {['ALL', 'UPCOMING', 'ONGOING', 'COMPLETED'].map((st) => (
                <Chip
                  key={st}
                  label={st === 'ONGOING' ? 'LIVE' : st}
                  clickable
                  onClick={() => setStatusFilter(st)}
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.74rem',
                    bgcolor: statusFilter === st ? '#5B2D90' : '#F1F5F9',
                    color: statusFilter === st ? '#FFFFFF' : '#64748B',
                    border: '1px solid',
                    borderColor: statusFilter === st ? 'transparent' : '#E2E8F0',
                  }}
                />
              ))}
            </Box>
          </Box>

          <Tooltip title="Refresh SkillOS Tests">
            <IconButton onClick={fetchContests} sx={{ color: '#64748B', border: `1px solid ${borderColor}` }}>
              <RefreshRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        {/* List Table */}
        <TableContainer>
          <Table size="small">
            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', pl: 3, py: 1.5 }}>
                  ASSESSMENT & CODE
                </TableCell>
                <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5 }}>
                  TARGET COHORT
                </TableCell>
                <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5 }}>
                  SCHEDULE & DURATION
                </TableCell>
                <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5 }}>
                  QUESTIONS & SCORING
                </TableCell>
                <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5 }}>
                  PROCTORING SUITE
                </TableCell>
                <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5 }}>
                  STATUS
                </TableCell>
                <TableCell align="right" sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', pr: 3, py: 1.5 }}>
                  ACTIONS
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={32} sx={{ color: '#5B2D90' }} />
                  </TableCell>
                </TableRow>
              ) : filteredContests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6, color: '#94A3B8' }}>
                    <ShieldRoundedIcon sx={{ fontSize: 42, color: '#CBD5E1', mb: 1 }} />
                    <Typography sx={{ fontSize: '0.92rem', fontWeight: 600, color: '#64748B' }}>
                      No SkillOS proctored assessments found.
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mt: 0.5 }}>
                      Click "Create SkillOS Proctored Test" to launch your first exam.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredContests.map((c) => {
                  const isProctored = c.isProctored !== false;
                  return (
                    <TableRow key={c.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      {/* 1. Assessment & Code */}
                      <TableCell sx={{ pl: 3, py: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box
                            sx={{
                              width: 36,
                              height: 36,
                              borderRadius: '10px',
                              bgcolor: '#FAF5FF',
                              color: '#5B2D90',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 800,
                            }}
                          >
                            <ShieldRoundedIcon sx={{ fontSize: 20 }} />
                          </Box>
                          <Box>
                            <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A' }}>
                              {c.title}
                            </Typography>
                            <Typography sx={{ fontSize: '0.75rem', color: '#64748B', fontFamily: 'monospace' }}>
                              {c.code || c.slug || `PROC-${c.id.slice(0, 6)}`}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      {/* 2. Target Cohort */}
                      <TableCell sx={{ py: 2 }}>
                        {c.batch ? (
                          <Chip
                            size="small"
                            icon={<SchoolRoundedIcon sx={{ fontSize: '13px !important' }} />}
                            label={c.batch.name}
                            sx={{
                              fontWeight: 700,
                              fontSize: '0.74rem',
                              bgcolor: '#FAF5FF',
                              color: '#0B1F3A',
                              border: '1px solid #F3E8FF',
                            }}
                          />
                        ) : (
                          <Typography sx={{ fontSize: '0.8rem', color: '#64748B' }}>
                            All Batches / Open
                          </Typography>
                        )}
                      </TableCell>

                      {/* 3. Schedule & Duration */}
                      <TableCell sx={{ py: 2 }}>
                        <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#0F172A' }}>
                          {c.startTime ? new Date(c.startTime).toLocaleDateString() : 'Immediate'}
                        </Typography>
                        <Typography sx={{ fontSize: '0.74rem', color: '#64748B' }}>
                          {c.durationMinutes || 90} Mins • {c.windowType || 'FIXED'} Window
                        </Typography>
                      </TableCell>

                      {/* 4. Questions & Scoring */}
                      <TableCell sx={{ py: 2 }}>
                        <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#0F172A' }}>
                          {c.problemsCount || c.problems?.length || 0} Problems
                        </Typography>
                        <Typography sx={{ fontSize: '0.74rem', color: '#64748B' }}>
                          {c.scoringFormat || 'ICPC'}
                        </Typography>
                      </TableCell>

                      {/* 5. Proctoring Suite Flags */}
                      <TableCell sx={{ py: 2 }}>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {isProctored ? (
                            <>
                              <Tooltip title="Native Full-Screen Lock">
                                <Chip
                                  size="small"
                                  icon={<FullscreenRoundedIcon sx={{ fontSize: '12px !important' }} />}
                                  label="Full-Screen"
                                  sx={{ bgcolor: '#ECFDF5', color: '#059669', fontSize: '0.65rem', fontWeight: 700, height: 20 }}
                                />
                              </Tooltip>
                              <Tooltip title="Tab Blur Limit Active">
                                <Chip
                                  size="small"
                                  icon={<WarningAmberRoundedIcon sx={{ fontSize: '12px !important' }} />}
                                  label={`Blur < ${c.tabSwitchLimit || 3}`}
                                  sx={{ bgcolor: '#FFFBEB', color: '#D97706', fontSize: '0.65rem', fontWeight: 700, height: 20 }}
                                />
                              </Tooltip>
                              <Tooltip title="MOSS Plagiarism Engine">
                                <Chip
                                  size="small"
                                  icon={<AutoAwesomeRoundedIcon sx={{ fontSize: '12px !important' }} />}
                                  label="MOSS"
                                  sx={{ bgcolor: '#FAF5FF', color: '#5B2D90', fontSize: '0.65rem', fontWeight: 700, height: 20 }}
                                />
                              </Tooltip>
                            </>
                          ) : (
                            <Chip size="small" label="Standard" sx={{ fontSize: '0.65rem', bgcolor: '#F1F5F9' }} />
                          )}
                        </Box>
                      </TableCell>

                      {/* 6. Status */}
                      <TableCell sx={{ py: 2 }}>
                        <Chip
                          size="small"
                          label={c.status || 'UPCOMING'}
                          sx={{
                            fontWeight: 800,
                            fontSize: '0.7rem',
                            height: 22,
                            bgcolor:
                              c.status === 'LIVE' || c.status === 'ACTIVE'
                                ? '#ECFDF5'
                                : c.status === 'COMPLETED'
                                ? '#F1F5F9'
                                : '#FAF5FF',
                            color:
                              c.status === 'LIVE' || c.status === 'ACTIVE'
                                ? '#059669'
                                : c.status === 'COMPLETED'
                                ? '#64748B'
                                : '#5B2D90',
                            border: '1px solid',
                            borderColor:
                              c.status === 'LIVE' || c.status === 'ACTIVE'
                                ? '#A7F3D0'
                                : c.status === 'COMPLETED'
                                ? '#E2E8F0'
                                : '#C7D2FE',
                          }}
                        />
                      </TableCell>

                      {/* 7. Actions */}
                      <TableCell align="right" sx={{ pr: 3, py: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                          <Tooltip title="Copy Public Candidate Test Link">
                            <IconButton
                              size="small"
                              onClick={(e) => handleCopyDirectLink(e, c)}
                              sx={{
                                color: '#5B2D90',
                                bgcolor: '#FAF5FF',
                                '&:hover': { bgcolor: '#E0E7FF' },
                                borderRadius: '8px',
                                p: 0.75,
                              }}
                            >
                              <ContentCopyRoundedIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>

                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<ShareRoundedIcon sx={{ fontSize: 15 }} />}
                            onClick={() => setShareModalContest(c)}
                            sx={{
                              textTransform: 'none',
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              color: '#0B1F3A',
                              borderColor: '#D8B4FE',
                              bgcolor: '#FAF5FF',
                              borderRadius: '8px',
                              py: 0.35,
                              px: 1.25,
                              '&:hover': { bgcolor: '#E9D5FF', borderColor: '#C084FC' },
                            }}
                          >
                            Send Link
                          </Button>

                          <Link href={`/contests/${c.id}`} style={{ textDecoration: 'none' }}>
                            <Button
                              size="small"
                              variant="outlined"
                              sx={{
                                textTransform: 'none',
                                fontSize: '0.74rem',
                                fontWeight: 700,
                                color: '#5B2D90',
                                borderColor: '#C7D2FE',
                                borderRadius: '8px',
                                py: 0.35,
                                px: 1.25,
                                '&:hover': { bgcolor: '#FAF5FF' },
                              }}
                            >
                              Live Room
                            </Button>
                          </Link>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>



      {/* ── INVITE EXTERNAL CANDIDATES MODAL ── */}
      {shareModalContest && (
        <Dialog
          open={Boolean(shareModalContest)}
          onClose={() => setShareModalContest(null)}
          maxWidth="sm"
          fullWidth
          slotProps={{ paper: { sx: { borderRadius: '20px', p: 1 } } }}
        >
          <DialogTitle sx={{ fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                bgcolor: '#FAF5FF',
                color: '#0B1F3A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShareRoundedIcon sx={{ fontSize: 20 }} />
            </Box>
            Share Test with External Candidates
          </DialogTitle>

          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 2 }}>
            <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A' }}>
                {shareModalContest.title}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mt: 0.5 }}>
                {shareModalContest.durationMinutes || 90} Minutes • {shareModalContest.isProctored !== false ? 'AI-Proctored with Full-Screen Lock' : 'Standard Assessment'}
              </Typography>
            </Box>

            {/* Public Link Box */}
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155', textTransform: 'uppercase', display: 'block', mb: 0.8 }}>
                Direct Candidate Test URL
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  value={getCandidateAssessmentUrl(shareModalContest)}
                  slotProps={{ input: { readOnly: true } }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '10px',
                      bgcolor: '#F1F5F9',
                      fontFamily: 'monospace',
                      fontSize: '0.84rem',
                    },
                  }}
                />
                <Button
                  variant="contained"
                  startIcon={<ContentCopyRoundedIcon sx={{ fontSize: 16 }} />}
                  onClick={(e) => handleCopyDirectLink(e, shareModalContest)}
                  sx={{
                    bgcolor: '#0B1F3A',
                    borderRadius: '10px',
                    textTransform: 'none',
                    fontWeight: 700,
                    px: 2.5,
                    whiteSpace: 'nowrap',
                    '&:hover': { bgcolor: '#17366E' },
                  }}
                >
                  Copy Link
                </Button>
              </Box>
              <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mt: 0.8 }}>
                Candidates opening this link only access the isolated assessment workspace with zero platform navigation.
              </Typography>
            </Box>

            {/* Email / WhatsApp Message Preview */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.8 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155', textTransform: 'uppercase' }}>
                  Candidate Invitation Message Draft
                </Typography>
                <Button
                  size="small"
                  variant="text"
                  startIcon={<ContentCopyRoundedIcon sx={{ fontSize: 14 }} />}
                  onClick={() => {
                    const msg = `Dear Candidate,\n\nYou are invited to take the online proctored technical evaluation: "${shareModalContest.title}".\n\nDirect Test Link: ${getCandidateAssessmentUrl(shareModalContest)}\nDuration: ${shareModalContest.durationMinutes || 90} Minutes\n\nPlease ensure you have a working camera and use a desktop/laptop browser. Do not switch tabs during the assessment.\n\nBest regards,\n${collegeName}`;
                    navigator.clipboard.writeText(msg);
                    toast.success('Invitation template copied to clipboard!', 'Draft Copied');
                  }}
                  sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.74rem', color: '#0B1F3A' }}
                >
                  Copy Message
                </Button>
              </Box>

              <Box
                sx={{
                  p: 2,
                  bgcolor: '#F8FAFC',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                  fontSize: '0.8rem',
                  fontFamily: 'monospace',
                  color: '#334155',
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.5,
                }}
              >
                {`Dear Candidate,\n\nYou are invited to take the online proctored technical evaluation: "${shareModalContest.title}".\n\nDirect Test Link: ${getCandidateAssessmentUrl(shareModalContest)}\nDuration: ${shareModalContest.durationMinutes || 90} Minutes\n\nPlease ensure you have a working camera and use a desktop/laptop browser. Do not switch tabs during the assessment.\n\nBest regards,\n${collegeName}`}
              </Box>
            </Box>
          </DialogContent>

          <DialogActions sx={{ p: 2.5, pt: 1 }}>
            <Button
              onClick={() => setShareModalContest(null)}
              sx={{ textTransform: 'none', fontWeight: 700, color: '#64748B' }}
            >
              Close
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                window.open(getCandidateAssessmentUrl(shareModalContest), '_blank');
              }}
              endIcon={<OpenInNewRoundedIcon sx={{ fontSize: 16 }} />}
              sx={{
                bgcolor: '#5B2D90',
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 700,
                '&:hover': { bgcolor: '#4338CA' },
              }}
            >
              Test Candidate View
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
}
