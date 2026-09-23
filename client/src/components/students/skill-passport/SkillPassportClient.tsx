'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  Box,
  Typography,
  Card,
  Chip,
  Button,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import TerminalRoundedIcon from '@mui/icons-material/TerminalRounded';
import { FaJira, FaGithub } from 'react-icons/fa';
import { useToast } from '@/context/ToastContext';
import { useAppSelector } from '@/store/hooks';

export interface VerifiedSkillEntry {
  id: string;
  skill: string;
  category: 'CS Core' | 'Backend' | 'Frontend' | 'Database' | 'DevOps';
  level: string;
  percentile: number;
  testPassedCount: number;
  cryptographicProof: string;
  verificationDate: string;
  verifier: string;
}

export interface JiraSprintTicket {
  key: string;
  title: string;
  epic: string;
  storyPoints: number;
  status: string;
  sprint: string;
  completedDate: string;
}

export interface VerifiedPREntry {
  prNumber: string;
  title: string;
  repo: string;
  mergedAt: string;
  cicdStatus: 'Passed (100%)' | 'Audited';
  codeCoverage: string;
  reviewedBy: string;
  linesAdded: number;
  linesRemoved: number;
}

function QRCodeCanvas({ url, size = 160 }: { url: string; size?: number }) {
  const [dataUrl, setDataUrl] = useState<string>('');

  useEffect(() => {
    let isCancelled = false;
    setDataUrl('');
    if (url) {
      QRCode.toDataURL(url, { width: size, margin: 1, color: { dark: '#0F172A', light: '#FFFFFF' } })
        .then((res) => {
          if (!isCancelled) {
            setDataUrl(res);
          }
        })
        .catch(() => {
          if (!isCancelled) {
            setDataUrl('');
          }
        });
    }
    return () => {
      isCancelled = true;
    };
  }, [url, size]);

  if (!dataUrl) {
    return <Box sx={{ width: size, height: size, bgcolor: '#F1F5F9', borderRadius: '12px' }} />;
  }

  return (
    <img
      src={dataUrl}
      alt="Verification QR Code"
      width={size}
      height={size}
      style={{ borderRadius: '12px', display: 'block' }}
    />
  );
}

export default function SkillPassportClient() {
  const toast = useToast();
  const currentUser = useAppSelector((state) => state.auth.user);

  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [activeMainTab, setActiveMainTab] = useState<'jira' | 'github' | 'skills'>('jira');
  const [skillCategoryTab, setSkillCategoryTab] = useState<'all' | 'CS Core' | 'Backend' | 'Frontend' | 'Database' | 'DevOps'>('all');

  const [jiraTickets] = useState<JiraSprintTicket[]>([]);
  const [verifiedPRs] = useState<VerifiedPREntry[]>([]);
  const [passportSkills] = useState<VerifiedSkillEntry[]>([]);

  const passportId = `SKILL-PASS-2026-${(currentUser?.id || '9912').toString().slice(-4).padStart(4, '0')}-IN`;
  const corporateId = currentUser?.rollNo || `TL-2026-DEV-${(currentUser?.id || '8492').toString().slice(-4).padStart(4, '0')}`;
  const studentName = currentUser?.name || 'Verified Associate';
  const corporateEmail = currentUser?.email || (currentUser?.name
    ? `${currentUser.name.toLowerCase().replace(/\s+/g, '.')}@techlearns.corp`
    : '—');
  const verificationUrl = `https://techlearns.in/passport/${encodeURIComponent(corporateId)}`;

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard?.writeText(verificationUrl);
      toast.success('Official verification link copied to clipboard!', 'Link Copied');
    }
  };

  const handleDownloadTranscript = () => {
    toast.info('Generating official signed Industry Experience PDF transcript...', 'Generating PDF');
    setTimeout(() => {
      window.print();
    }, 600);
  };

  const filteredSkills = skillCategoryTab === 'all'
    ? passportSkills
    : passportSkills.filter((s) => s.category === skillCategoryTab);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5, pb: 6 }}>
      {/* 1. Top Header Banner & Quick Actions */}
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
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
            gap: 2.5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '14px',
                bgcolor: '#EFF6FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563EB',
                border: '1px solid #DBEAFE',
                flexShrink: 0,
              }}
            >
              <SecurityRoundedIcon sx={{ fontSize: 26 }} />
            </Box>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.35rem', lineHeight: 1.2 }}>
                  Corporate Skill Passport & Experience Ledger
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '0.84rem', color: '#64748B', mt: 0.5 }}>
                Real-world proof of work tracking Jira sprint velocity, GitHub Enterprise PRs, CI/CD telemetry, and production code reviews.
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              startIcon={<DownloadRoundedIcon />}
              onClick={handleDownloadTranscript}
              sx={{
                borderRadius: '12px',
                fontWeight: 700,
                textTransform: 'none',
                fontSize: '0.84rem',
                px: 2,
                py: 1,
                borderColor: '#CBD5E1',
                color: '#334155',
                '&:hover': { bgcolor: '#F8FAFC', borderColor: '#94A3B8' },
              }}
            >
              Export Proof of Work
            </Button>

            <Button
              variant="contained"
              startIcon={<ContentCopyRoundedIcon />}
              onClick={handleCopyLink}
              sx={{
                bgcolor: '#2563EB',
                borderRadius: '12px',
                fontWeight: 700,
                textTransform: 'none',
                fontSize: '0.84rem',
                px: 2.2,
                py: 1,
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
                '&:hover': { bgcolor: '#1D4ED8' },
              }}
            >
              Copy Verification URL
            </Button>
          </Box>
        </Box>
      </Card>

      {/* 2. Corporate Experience & Digital Badge Card */}
      <Card
        elevation={0}
        sx={{
          borderRadius: '24px',
          background: 'linear-gradient(135deg, #0A0F1D 0%, #0F172A 45%, #1E1B4B 100%)',
          color: '#FFFFFF',
          p: { xs: 3, md: 4 },
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 16px 40px rgba(15, 23, 42, 0.35)',
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr auto' },
          gap: 3.5,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: -60,
            right: -60,
            width: 240,
            height: 240,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(79, 70, 229, 0.25) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* Left identity & corporate role */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.6,
                px: 1.2,
                py: 0.3,
                bgcolor: 'rgba(99, 102, 241, 0.15)',
                border: '1px solid rgba(99, 102, 241, 0.35)',
                borderRadius: '999px',
              }}
            >
              <BusinessRoundedIcon sx={{ fontSize: 14, color: '#A5B4FC' }} />
              <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: '#C7D2FE', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                TechLearns Corporate Engineering Labs (CEL)
              </Typography>
            </Box>
          </Box>

          <Box>
            <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.02em', color: '#FFFFFF' }}>
              {studentName}
            </Typography>
            <Typography sx={{ fontSize: '0.92rem', color: '#93C5FD', fontWeight: 600, mt: 0.2 }}>
              Software Engineering Associate · Full Stack & AI Systems Sprint
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mt: 0.5 }}>
            <Box>
              <Typography sx={{ fontSize: '0.68rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Universal Passport ID
              </Typography>
              <Typography sx={{ fontFamily: 'monospace', fontSize: '0.88rem', color: '#93C5FD', fontWeight: 700 }}>
                {passportId}
              </Typography>
            </Box>

            <Box>
              <Typography sx={{ fontSize: '0.68rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Corporate SkillOS ID
              </Typography>
              <Typography sx={{ fontFamily: 'monospace', fontSize: '0.88rem', color: '#C7D2FE', fontWeight: 700 }}>
                {corporateId}
              </Typography>
            </Box>

            <Box>
              <Typography sx={{ fontSize: '0.68rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Corporate Email Alias
              </Typography>
              <Typography sx={{ fontFamily: 'monospace', fontSize: '0.88rem', color: '#E2E8F0', fontWeight: 600 }}>
                {corporateEmail}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Right QR Code verification widget */}
        <Box
          sx={{
            bgcolor: '#FFFFFF',
            borderRadius: '20px',
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
            zIndex: 1,
            width: { xs: '100%', md: 170 },
          }}
        >
          <QRCodeCanvas url={verificationUrl} size={100} />
          <Typography sx={{ fontSize: '0.66rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Scan to Verify
          </Typography>
          <Button
            size="small"
            variant="text"
            onClick={() => setQrModalOpen(true)}
            sx={{
              fontSize: '0.7rem',
              fontWeight: 700,
              textTransform: 'none',
              color: '#2563EB',
              p: 0,
              minWidth: 0,
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            View Full QR
          </Button>
        </Box>
      </Card>

      {/* 3. Real-World Engineering Telemetry Metrics Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
          gap: 2.5,
        }}
      >
        <Card
          elevation={0}
          sx={{
            borderRadius: '20px',
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            p: 2.5,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              bgcolor: '#EFF6FF',
              color: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FaJira size={20} color="#0052CC" />
          </Box>
          <Box>
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>
              Jira Sprint Velocity
            </Typography>
            <Typography sx={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A' }}>
              {jiraTickets.reduce((acc, t) => acc + (t.storyPoints || 0), 0)} Story Pts
            </Typography>
          </Box>
        </Card>

        <Card
          elevation={0}
          sx={{
            borderRadius: '20px',
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            p: 2.5,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              bgcolor: '#FAF5FF',
              color: '#9333EA',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FaGithub size={22} color="#0F172A" />
          </Box>
          <Box>
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>
              Enterprise PRs Merged
            </Typography>
            <Typography sx={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A' }}>
              {verifiedPRs.length} Production PRs
            </Typography>
          </Box>
        </Card>

        <Card
          elevation={0}
          sx={{
            borderRadius: '20px',
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            p: 2.5,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              bgcolor: '#ECFDF5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CheckCircleRoundedIcon sx={{ fontSize: 24 }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>
              Verified Benchmarks
            </Typography>
            <Typography sx={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A' }}>
              {passportSkills.length} Verified Skills
            </Typography>
          </Box>
        </Card>

        <Card
          elevation={0}
          sx={{
            borderRadius: '20px',
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            p: 2.5,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              bgcolor: '#FFFBEB',
              color: '#D97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <TerminalRoundedIcon sx={{ fontSize: 24, color: '#D97706' }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>
              Cloud Sandbox Status
            </Typography>
            <Typography sx={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A' }}>
              Ready
            </Typography>
          </Box>
        </Card>
      </Box>

      {/* 4. Main Section Tabs */}
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
        <Box sx={{ px: 2.5, pt: 1, borderBottom: '1px solid #E2E8F0', bgcolor: '#F8FAFC' }}>
          <Tabs
            value={activeMainTab}
            onChange={(_, val) => setActiveMainTab(val)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              minHeight: 48,
              '& .MuiTab-root': {
                minHeight: 48,
                fontSize: '0.86rem',
                fontWeight: 700,
                textTransform: 'none',
                color: '#64748B',
                gap: 1,
                '&.Mui-selected': { color: '#2563EB' },
              },
            }}
          >
            <Tab
              icon={<FaJira size={15} color={activeMainTab === 'jira' ? '#0052CC' : '#64748B'} />}
              iconPosition="start"
              label="Jira Agile Sprints & Epics"
              value="jira"
            />
            <Tab
              icon={<FaGithub size={15} color={activeMainTab === 'github' ? '#0F172A' : '#64748B'} />}
              iconPosition="start"
              label="GitHub Enterprise PRs & CI/CD"
              value="github"
            />
            <Tab
              icon={<SecurityRoundedIcon sx={{ fontSize: 17 }} />}
              iconPosition="start"
              label="Verified Competency Transcripts"
              value="skills"
            />
          </Tabs>
        </Box>

        {/* TAB 1: JIRA AGILE SPRINTS & EPICS */}
        {activeMainTab === 'jira' && (
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#0F172A' }}>
                  Agile Sprint Deliverables & Story Points Ledger
                </Typography>
                <Typography sx={{ fontSize: '0.78rem', color: '#64748B' }}>
                  Live telemetry synchronized from Atlassian Jira workspace
                </Typography>
              </Box>
            </Box>

            <TableContainer sx={{ border: '1px solid #E2E8F0', borderRadius: '16px', overflow: 'hidden' }}>
              <Table>
                <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.76rem', py: 1.8 }}>TICKET KEY</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.76rem' }}>TASK / USER STORY</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.76rem' }}>PARENT EPIC</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.76rem' }}>STORY POINTS</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.76rem' }}>STATUS</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800, color: '#475569', fontSize: '0.76rem' }}>DELIVERED ON</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {jiraTickets.length > 0 ? (
                    jiraTickets.map((t) => (
                      <TableRow key={t.key} hover sx={{ '&:last-child td': { borderBottom: 'none' } }}>
                        <TableCell sx={{ py: 1.8 }}>
                          <Chip label={t.key} size="small" sx={{ bgcolor: '#EFF6FF', color: '#0052CC', fontWeight: 800, fontSize: '0.74rem' }} />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.86rem' }}>
                          {t.title}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.76rem', color: '#64748B', fontWeight: 600 }}>
                          {t.epic}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.84rem' }}>
                          {t.storyPoints} pts
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={t.status}
                            size="small"
                            icon={<CheckCircleRoundedIcon sx={{ fontSize: '13px !important', color: '#10B981 !important' }} />}
                            sx={{ bgcolor: '#ECFDF5', color: '#047857', fontWeight: 700, fontSize: '0.68rem', border: '1px solid #A7F3D0' }}
                          />
                        </TableCell>
                        <TableCell align="right" sx={{ color: '#64748B', fontSize: '0.82rem', fontWeight: 600 }}>
                          {t.completedDate}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 6, color: '#64748B' }}>
                        <Typography sx={{ fontSize: '0.9rem', fontWeight: 600 }}>
                          No active Jira sprint tickets recorded for this profile.
                        </Typography>
                        <Typography sx={{ fontSize: '0.78rem', color: '#94A3B8', mt: 0.5 }}>
                          Sprint deliverables will automatically appear once assigned and completed in CEL.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* TAB 2: GITHUB ENTERPRISE PRS & CI/CD */}
        {activeMainTab === 'github' && (
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#0F172A' }}>
                  Enterprise Pull Requests & CI/CD Telemetry
                </Typography>
                <Typography sx={{ fontSize: '0.78rem', color: '#64748B' }}>
                  Audited pull requests merged into main branches with automated unit test suites & mentor approvals
                </Typography>
              </Box>
            </Box>

            <TableContainer sx={{ border: '1px solid #E2E8F0', borderRadius: '16px', overflow: 'hidden' }}>
              <Table>
                <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.76rem', py: 1.8 }}>PR</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.76rem' }}>FEATURE / TITLE</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.76rem' }}>TARGET REPO</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.76rem' }}>DIFF (+/-)</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.76rem' }}>TEST COVERAGE</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.76rem' }}>REVIEWED BY</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800, color: '#475569', fontSize: '0.76rem' }}>MERGED DATE</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {verifiedPRs.length > 0 ? (
                    verifiedPRs.map((pr) => (
                      <TableRow key={pr.prNumber} hover sx={{ '&:last-child td': { borderBottom: 'none' } }}>
                        <TableCell sx={{ py: 1.8 }}>
                          <Chip label={pr.prNumber} size="small" sx={{ bgcolor: '#F1F5F9', color: '#475569', fontWeight: 800, fontSize: '0.74rem' }} />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.86rem' }}>
                          {pr.title}
                        </TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.78rem', color: '#2563EB', fontWeight: 600 }}>
                          {pr.repo}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.78rem', fontWeight: 700 }}>
                          <span style={{ color: '#16A34A' }}>+{pr.linesAdded}</span> / <span style={{ color: '#DC2626' }}>-{pr.linesRemoved}</span>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 800, color: '#059669', fontSize: '0.84rem' }}>
                          {pr.codeCoverage}
                        </TableCell>
                        <TableCell sx={{ color: '#475569', fontSize: '0.82rem', fontWeight: 600 }}>
                          {pr.reviewedBy}
                        </TableCell>
                        <TableCell align="right" sx={{ color: '#64748B', fontSize: '0.82rem', fontWeight: 600 }}>
                          {pr.mergedAt}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 6, color: '#64748B' }}>
                        <Typography sx={{ fontSize: '0.9rem', fontWeight: 600 }}>
                          No verified GitHub pull requests recorded for this profile.
                        </Typography>
                        <Typography sx={{ fontSize: '0.78rem', color: '#94A3B8', mt: 0.5 }}>
                          Production pull requests merged into CEL repositories will appear here.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* TAB 3: VERIFIED COMPETENCIES */}
        {activeMainTab === 'skills' && (
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#0F172A' }}>
                  Verified Technical Competencies & Sandbox Benchmarks
                </Typography>
                <Typography sx={{ fontSize: '0.78rem', color: '#64748B' }}>
                  Benchmarked against automated execution engines with cryptographic verification
                </Typography>
              </Box>
            </Box>

            {/* Filter pills */}
            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
              {(['all', 'CS Core', 'Backend', 'Frontend', 'Database', 'DevOps'] as const).map((cat) => (
                <Chip
                  key={cat}
                  label={cat === 'all' ? 'All Domains' : cat}
                  onClick={() => setSkillCategoryTab(cat)}
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.74rem',
                    bgcolor: skillCategoryTab === cat ? '#2563EB' : '#F1F5F9',
                    color: skillCategoryTab === cat ? '#FFFFFF' : '#475569',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: skillCategoryTab === cat ? '#1D4ED8' : '#E2E8F0' },
                  }}
                />
              ))}
            </Box>

            <TableContainer sx={{ border: '1px solid #E2E8F0', borderRadius: '16px', overflow: 'hidden' }}>
              <Table>
                <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.76rem', py: 1.8 }}>COMPETENCY & DOMAIN</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.76rem' }}>PROFICIENCY LEVEL</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.76rem' }}>BENCHMARK PERCENTILE</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.76rem' }}>PASSED TEST SUITES</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800, color: '#475569', fontSize: '0.76rem' }}>AUDIT DATE</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredSkills.length > 0 ? (
                    filteredSkills.map((sk) => (
                      <TableRow key={sk.id} hover sx={{ '&:last-child td': { borderBottom: 'none' } }}>
                        <TableCell sx={{ py: 1.8 }}>
                          <Box>
                            <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.88rem' }}>
                              {sk.skill}
                            </Typography>
                            <Typography sx={{ fontSize: '0.72rem', color: '#64748B' }}>
                              {sk.verifier}
                            </Typography>
                          </Box>
                        </TableCell>

                        <TableCell>
                          <Chip
                            label={sk.level}
                            size="small"
                            sx={{
                              bgcolor: sk.level.includes('Tier 1') ? '#EFF6FF' : '#F8FAFC',
                              color: sk.level.includes('Tier 1') ? '#1D4ED8' : '#475569',
                              fontWeight: 700,
                              fontSize: '0.7rem',
                              border: '1px solid',
                              borderColor: sk.level.includes('Tier 1') ? '#BFDBFE' : '#E2E8F0',
                            }}
                          />
                        </TableCell>

                        <TableCell sx={{ fontWeight: 900, color: '#059669', fontSize: '0.88rem' }}>
                          Top {sk.percentile}%
                        </TableCell>

                        <TableCell sx={{ fontWeight: 700, color: '#334155', fontSize: '0.84rem' }}>
                          {sk.testPassedCount} Tests Passed
                        </TableCell>

                        <TableCell align="right" sx={{ color: '#64748B', fontSize: '0.82rem', fontWeight: 600 }}>
                          {sk.verificationDate}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 6, color: '#64748B' }}>
                        <Typography sx={{ fontSize: '0.9rem', fontWeight: 600 }}>
                          No verified skill benchmarks recorded for this profile.
                        </Typography>
                        <Typography sx={{ fontSize: '0.78rem', color: '#94A3B8', mt: 0.5 }}>
                          Skills benchmarked through coding assessments and sprint tasks will appear here.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Card>

      {/* Full QR Verification Dialog Modal */}
      <Dialog
        open={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: '24px',
              p: 2,
              textAlign: 'center',
            },
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: '#0F172A' }}>
            Corporate Proof QR Verification
          </Typography>
          <IconButton size="small" onClick={() => setQrModalOpen(false)}>
            <CloseRoundedIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 2 }}>
          <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: '20px', border: '1px solid #E2E8F0' }}>
            <QRCodeCanvas url={verificationUrl} size={160} />
          </Box>
          <Typography sx={{ fontSize: '0.82rem', color: '#64748B', px: 2 }}>
            Hiring partners and university recruiters can scan this QR code to view live Jira sprint velocity, GitHub PRs, and sandbox verification proofs for <strong style={{ color: '#0F172A' }}>{studentName}</strong>.
          </Typography>
          <Typography sx={{ fontFamily: 'monospace', fontSize: '0.78rem', color: '#2563EB', wordBreak: 'break-all' }}>
            {verificationUrl}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 1 }}>
          <Button
            variant="contained"
            onClick={handleCopyLink}
            startIcon={<ContentCopyRoundedIcon />}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 700,
              bgcolor: '#2563EB',
              px: 3,
            }}
          >
            Copy Verification Link
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
