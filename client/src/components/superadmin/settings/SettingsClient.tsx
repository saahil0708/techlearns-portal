'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  Tabs,
  Tab,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  IconButton,
  Tooltip,
  Alert,
  Slider,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import { useToast } from '@/context/ToastContext';
import { MuiCenterLoader } from '@/components/shared/MuiLoadingFallback';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import TerminalRoundedIcon from '@mui/icons-material/TerminalRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import WebhookRoundedIcon from '@mui/icons-material/WebhookRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import FirstPageRoundedIcon from '@mui/icons-material/FirstPageRounded';
import LastPageRoundedIcon from '@mui/icons-material/LastPageRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';

import CurvedSidebar from '@/components/superadmin/layout/CurvedSidebar';
import Navbar from '@/components/superadmin/layout/Navbar';
import BulkActionBar from '@/components/superadmin/shared/BulkActionBar';
import { FluidArrowRight } from '@/utils/fluid_arrow';
import type {
  GeneralSettings,
  CompilerConfig,
  SecuritySettings,
  ScoringEngineSettings,
  ApiWebhookEntity,
  AuditLogEntity,
} from '@/types/settings';

interface SettingsClientProps {
  initialGeneral: GeneralSettings;
  initialCompilers: CompilerConfig[];
  initialSecurity: SecuritySettings;
  initialScoring: ScoringEngineSettings;
  initialWebhooks: ApiWebhookEntity[];
  initialAuditLogs: AuditLogEntity[];
}

export default function SettingsClient({
  initialGeneral,
  initialCompilers,
  initialSecurity,
  initialScoring,
  initialWebhooks,
  initialAuditLogs,
}: SettingsClientProps) {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<number>(0);
  const [isTabLoading, setIsTabLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleTabChange = (_: any, val: number) => {
    if (val === activeTab) return;
    setIsTabLoading(true);
    setActiveTab(val);
    setTimeout(() => setIsTabLoading(false), 180);
  };

  // Form State
  const [general, setGeneral] = useState<GeneralSettings>(initialGeneral);
  const [compilers, setCompilers] = useState<CompilerConfig[]>(initialCompilers);
  const [security, setSecurity] = useState<SecuritySettings>(initialSecurity);
  const [scoring, setScoring] = useState<ScoringEngineSettings>(initialScoring);
  const [webhooks, setWebhooks] = useState<ApiWebhookEntity[]>(initialWebhooks);
  const [auditLogs] = useState<AuditLogEntity[]>(initialAuditLogs);

  // Selection & Pagination for Audit / Webhooks
  const [selectedAuditIds, setSelectedAuditIds] = useState<string[]>([]);
  const [auditPage, setAuditPage] = useState(0);
  const [auditRowsPerPage] = useState(8);

  const primaryBlue = '#2563EB';
  const borderColor = '#E2E8F0';

  const handleSaveSettings = () => {
    toast.info('Settings saved locally. Backend persistence not yet implemented — changes will reset on page reload.', 'Local Save Only');
  };

  const handleToggleCompiler = (id: string) => {
    setCompilers((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, status: c.status === 'Enabled' ? 'Disabled' : 'Enabled' }
          : c
      )
    );
    toast.info('Compiler engine status updated.', 'Compiler Engine');
  };

  const totalAuditPages = Math.ceil(auditLogs.length / auditRowsPerPage) || 1;
  const paginatedAuditLogs = auditLogs.slice(
    auditPage * auditRowsPerPage,
    auditPage * auditRowsPerPage + auditRowsPerPage
  );

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        bgcolor: '#F4F5F7',
        backgroundImage: `
          radial-gradient(ellipse at 15% 10%, rgba(37, 99, 235, 0.06) 0%, transparent 45%),
          radial-gradient(ellipse at 85% 20%, rgba(37, 99, 235, 0.04) 0%, transparent 45%),
          radial-gradient(ellipse at 50% 90%, rgba(14, 165, 233, 0.04) 0%, transparent 50%)
        `,
        color: '#0F172A',
        p: { xs: 1.5, sm: 2, md: 2.5 },
        pl: { xs: '82px', sm: '90px', md: '102px' },
        gap: { xs: 2, md: 3 },
      }}
    >
      {/* 1. Left Curved Navigation Sidebar */}
      <CurvedSidebar />

      {/* Main Content Area */}
      <Box component="main" sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Unified Layout Container */}
        <Box
          sx={{
            maxWidth: 1400,
            width: '100%',
            mx: 'auto',
            px: { xs: 3, md: 5 },
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            pb: { xs: 4, md: 6 },
          }}
        >
          {/* Top Navbar */}
          <Navbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

          {/* Page Header & Save Bar */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748B' }}>
                  System Governance
                </Typography>
                <Typography sx={{ fontSize: '0.8rem', color: '#94A3B8' }}>/</Typography>
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: primaryBlue }}>
                  Settings & Platform Administration
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
                Platform Settings & Security Console
              </Typography>
              <Typography sx={{ fontSize: '0.88rem', color: '#64748B', mt: 0.25 }}>
                Manage compiler sandbox parameters, institutional SSO authentication, scoring rules, and security audit logs.
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Button
                variant="contained"
                onClick={handleSaveSettings}
                startIcon={<SaveRoundedIcon sx={{ fontSize: 18 }} />}
                sx={{
                  bgcolor: primaryBlue,
                  color: '#FFFFFF',
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.86rem',
                  px: 2.5,
                  py: 0.9,
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
                  '&:hover': { bgcolor: '#1D4ED8' },
                }}
              >
                Save All Changes
              </Button>
            </Box>
          </Box>

          {/* MUI Tabs Standard for Settings Sections */}
          <Box sx={{ borderBottom: `1px solid ${borderColor}`, bgcolor: '#FFFFFF', borderRadius: '14px 14px 0 0', px: 2, pt: 1 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                minHeight: 48,
                '& .MuiTabs-indicator': {
                  backgroundColor: primaryBlue,
                  height: 3,
                  borderRadius: '3px 3px 0 0',
                },
              }}
            >
              <Tab icon={<SettingsRoundedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="General & Branding" sx={{ textTransform: 'none', fontWeight: activeTab === 0 ? 700 : 500, fontSize: '0.86rem', color: activeTab === 0 ? primaryBlue : '#64748B', minHeight: 48 }} />
              <Tab icon={<TerminalRoundedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Sandbox & Compilers" sx={{ textTransform: 'none', fontWeight: activeTab === 1 ? 700 : 500, fontSize: '0.86rem', color: activeTab === 1 ? primaryBlue : '#64748B', minHeight: 48 }} />
              <Tab icon={<SecurityRoundedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Security & SSO" sx={{ textTransform: 'none', fontWeight: activeTab === 2 ? 700 : 500, fontSize: '0.86rem', color: activeTab === 2 ? primaryBlue : '#64748B', minHeight: 48 }} />
              <Tab icon={<EmojiEventsRoundedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Scoring & Contest Rules" sx={{ textTransform: 'none', fontWeight: activeTab === 3 ? 700 : 500, fontSize: '0.86rem', color: activeTab === 3 ? primaryBlue : '#64748B', minHeight: 48 }} />
              <Tab icon={<WebhookRoundedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Webhooks & APIs" sx={{ textTransform: 'none', fontWeight: activeTab === 4 ? 700 : 500, fontSize: '0.86rem', color: activeTab === 4 ? primaryBlue : '#64748B', minHeight: 48 }} />
              <Tab icon={<HistoryRoundedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Audit & Security Logs" sx={{ textTransform: 'none', fontWeight: activeTab === 5 ? 700 : 500, fontSize: '0.86rem', color: activeTab === 5 ? primaryBlue : '#64748B', minHeight: 48 }} />
            </Tabs>
          </Box>

          {/* TAB CONTENT PANELS */}
          {isTabLoading ? (
            <MuiCenterLoader minHeight="380px" message="Loading configuration panel..." />
          ) : (
            <>
          {/* Tab 0: General Profile & Branding */}
          {activeTab === 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Card elevation={0} sx={{ p: 3.5, borderRadius: '16px', bgcolor: '#FFFFFF', border: `1px solid ${borderColor}`, display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box>
                  <Typography sx={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>
                    Platform Identity & Organization
                  </Typography>
                  <Typography sx={{ fontSize: '0.8rem', color: '#64748B' }}>
                    Core branding displayed across student IDE workspaces, leaderboards, and certificate headers.
                  </Typography>
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2.5 }}>
                  <TextField
                    label="Platform Title"
                    value={general.platformName}
                    onChange={(e) => setGeneral({ ...general, platformName: e.target.value })}
                    size="small"
                    fullWidth
                  />
                  <TextField
                    label="Institution / Institute Tagline"
                    value={general.institutionTagline}
                    onChange={(e) => setGeneral({ ...general, institutionTagline: e.target.value })}
                    size="small"
                    fullWidth
                  />
                  <TextField
                    label="Primary Domain URL"
                    value={general.primaryDomain}
                    onChange={(e) => setGeneral({ ...general, primaryDomain: e.target.value })}
                    size="small"
                    fullWidth
                  />
                  <TextField
                    label="System Support Email"
                    value={general.supportEmail}
                    onChange={(e) => setGeneral({ ...general, supportEmail: e.target.value })}
                    size="small"
                    fullWidth
                  />
                </Box>

                <Divider sx={{ borderColor: '#F1F5F9' }} />

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2.5 }}>
                  <FormControl size="small" fullWidth>
                    <InputLabel>Active Academic Year</InputLabel>
                    <Select
                      value={general.academicYear}
                      label="Active Academic Year"
                      onChange={(e) => setGeneral({ ...general, academicYear: e.target.value })}
                    >
                      <MenuItem value="2026 - 2027">2026 - 2027 (Current)</MenuItem>
                      <MenuItem value="2025 - 2026">2025 - 2026</MenuItem>
                      <MenuItem value="2024 - 2025">2024 - 2025</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl size="small" fullWidth>
                    <InputLabel>Default Timezone</InputLabel>
                    <Select
                      value={general.defaultTimezone}
                      label="Default Timezone"
                      onChange={(e) => setGeneral({ ...general, defaultTimezone: e.target.value })}
                    >
                      <MenuItem value="Asia/Kolkata (IST +5:30)">Asia/Kolkata (IST +5:30)</MenuItem>
                      <MenuItem value="America/New_York (EST -5:00)">America/New_York (EST -5:00)</MenuItem>
                      <MenuItem value="Europe/London (GMT +0:00)">Europe/London (GMT +0:00)</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                <Divider sx={{ borderColor: '#F1F5F9' }} />

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A' }}>
                        Allow Public Student Self-Registrations
                      </Typography>
                      <Typography sx={{ fontSize: '0.76rem', color: '#64748B' }}>
                        When disabled, coders can only join via university bulk roster imports or faculty invite codes.
                      </Typography>
                    </Box>
                    <Switch
                      checked={general.allowPublicRegistrations}
                      onChange={(e) => setGeneral({ ...general, allowPublicRegistrations: e.target.checked })}
                      color="primary"
                    />
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: '#DC2626' }}>
                        System Maintenance Mode
                      </Typography>
                      <Typography sx={{ fontSize: '0.76rem', color: '#64748B' }}>
                        Temporarily pauses live contest arenas and queues new code submissions for scheduled upgrades.
                      </Typography>
                    </Box>
                    <Switch
                      checked={general.maintenanceMode}
                      onChange={(e) => setGeneral({ ...general, maintenanceMode: e.target.checked })}
                      color="error"
                    />
                  </Box>
                </Box>
              </Card>
            </Box>
          )}

          {/* Tab 1: Sandbox & Compiler Engines */}
          {activeTab === 1 && (
            <Card elevation={0} sx={{ borderRadius: '16px', bgcolor: '#FFFFFF', border: `1px solid ${borderColor}`, overflow: 'hidden' }}>
              <Box sx={{ p: 3, borderBottom: `1px solid ${borderColor}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography sx={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>
                    Compiler Sandboxes & Resource Budgets
                  </Typography>
                  <Typography sx={{ fontSize: '0.78rem', color: '#64748B' }}>
                    Per-language execution time quotas, memory ceilings, and active BullMQ judge worker pods.
                  </Typography>
                </Box>
                <Button size="small" variant="outlined" startIcon={<AddRoundedIcon sx={{ fontSize: 16 }} />} sx={{ textTransform: 'none', fontWeight: 700, color: primaryBlue, borderColor: '#DBEAFE' }}>
                  Add Custom Runtime
                </Button>
              </Box>

              <TableContainer>
                <Table size="small">
                  <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                    <TableRow>
                      <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', pl: 3, py: 1.5 }}>LANGUAGE & VERSION</TableCell>
                      <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5 }}>COMPILER COMMAND</TableCell>
                      <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5 }}>TIME LIMIT</TableCell>
                      <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5 }}>MEMORY CAP</TableCell>
                      <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5 }}>ACTIVE WORKERS</TableCell>
                      <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5 }}>STATUS</TableCell>
                      <TableCell align="right" sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', pr: 3, py: 1.5 }}>ACTIONS</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {compilers.map((c) => (
                      <TableRow key={c.id} hover sx={{ '& td': { borderBottom: '1px solid #F1F5F9' } }}>
                        <TableCell sx={{ pl: 3, py: 1.75 }}>
                          <Typography sx={{ fontSize: '0.86rem', fontWeight: 700, color: '#0F172A' }}>{c.language}</Typography>
                          <Typography sx={{ fontSize: '0.72rem', color: '#64748B' }}>{c.version}</Typography>
                        </TableCell>
                        <TableCell sx={{ py: 1.75 }}>
                          <Typography sx={{ fontSize: '0.74rem', fontFamily: 'monospace', bgcolor: '#F8FAFC', p: '2px 6px', borderRadius: '4px', border: '1px solid #E2E8F0', display: 'inline-block' }}>
                            {c.compilerCommand}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 1.75 }}>
                          <Typography sx={{ fontSize: '0.84rem', fontWeight: 700, color: '#0F172A' }}>{c.defaultTimeLimitSec}s</Typography>
                        </TableCell>
                        <TableCell sx={{ py: 1.75 }}>
                          <Typography sx={{ fontSize: '0.84rem', fontWeight: 700, color: '#0F172A' }}>{c.defaultMemoryLimitMb} MB</Typography>
                        </TableCell>
                        <TableCell sx={{ py: 1.75 }}>
                          <Chip size="small" label={`${c.activeWorkersCount} pods`} sx={{ height: 22, fontSize: '0.72rem', fontWeight: 600, bgcolor: '#EFF6FF', color: '#2563EB' }} />
                        </TableCell>
                        <TableCell sx={{ py: 1.75 }}>
                          <Chip
                            size="small"
                            label={c.status}
                            sx={{
                              height: 22,
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              bgcolor: c.status === 'Enabled' ? '#ECFDF5' : '#F1F5F9',
                              color: c.status === 'Enabled' ? '#059669' : '#64748B',
                              border: `1px solid ${c.status === 'Enabled' ? '#A7F3D0' : '#E2E8F0'}`,
                            }}
                          />
                        </TableCell>
                        <TableCell align="right" sx={{ pr: 3, py: 1.75 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleToggleCompiler(c.id)}
                            sx={{
                              textTransform: 'none',
                              fontWeight: 700,
                              fontSize: '0.74rem',
                              color: c.status === 'Enabled' ? '#DC2626' : '#2563EB',
                              borderColor: c.status === 'Enabled' ? '#FECACA' : '#DBEAFE',
                              bgcolor: c.status === 'Enabled' ? '#FEF2F2' : '#EFF6FF',
                              borderRadius: '6px',
                              px: 1.25,
                              py: 0.3,
                            }}
                          >
                            {c.status === 'Enabled' ? 'Disable' : 'Enable'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          )}

          {/* Tab 2: Security & Authentication (SSO / 2FA) */}
          {activeTab === 2 && (
            <Card elevation={0} sx={{ p: 3.5, borderRadius: '16px', bgcolor: '#FFFFFF', border: `1px solid ${borderColor}`, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box>
                <Typography sx={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>
                  Institutional Security & Single Sign-On (SSO)
                </Typography>
                <Typography sx={{ fontSize: '0.8rem', color: '#64748B' }}>
                  Enforce strict access controls, university SAML federations, and role-based privilege boundaries.
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A' }}>
                      Require Two-Factor Authentication (2FA) for Admins & Faculty
                    </Typography>
                    <Typography sx={{ fontSize: '0.76rem', color: '#64748B' }}>
                      Enforces TOTP authenticator app verification on every privileged login session.
                    </Typography>
                  </Box>
                  <Switch
                    checked={security.requireTwoFactorForAdmins}
                    onChange={(e) => setSecurity({ ...security, requireTwoFactorForAdmins: e.target.checked })}
                    color="primary"
                  />
                </Box>

                <Divider sx={{ borderColor: '#F1F5F9' }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A' }}>
                      Enforce Institute Domain Matching
                    </Typography>
                    <Typography sx={{ fontSize: '0.76rem', color: '#64748B' }}>
                      Restricts student and faculty logins strictly to their affiliated institute email domains (@mit.edu, @cam.ac.uk).
                    </Typography>
                  </Box>
                  <Switch
                    checked={security.enforceInstituteDomainMatch}
                    onChange={(e) => setSecurity({ ...security, enforceInstituteDomainMatch: e.target.checked })}
                    color="primary"
                  />
                </Box>

                <Divider sx={{ borderColor: '#F1F5F9' }} />

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderRadius: '12px', bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                    <Typography sx={{ fontSize: '0.84rem', fontWeight: 700 }}>Google Workspace SSO</Typography>
                    <Switch checked={security.allowGoogleSSO} onChange={(e) => setSecurity({ ...security, allowGoogleSSO: e.target.checked })} color="primary" />
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderRadius: '12px', bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                    <Typography sx={{ fontSize: '0.84rem', fontWeight: 700 }}>GitHub Developer SSO</Typography>
                    <Switch checked={security.allowGithubSSO} onChange={(e) => setSecurity({ ...security, allowGithubSSO: e.target.checked })} color="primary" />
                  </Box>
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2.5, mt: 1 }}>
                  <TextField
                    label="Session Timeout (Minutes)"
                    type="number"
                    value={security.sessionTimeoutMinutes}
                    onChange={(e) => setSecurity({ ...security, sessionTimeoutMinutes: Number(e.target.value) })}
                    size="small"
                  />
                  <TextField
                    label="Minimum Password Length"
                    type="number"
                    value={security.passwordMinLength}
                    onChange={(e) => setSecurity({ ...security, passwordMinLength: Number(e.target.value) })}
                    size="small"
                  />
                </Box>
              </Box>
            </Card>
          )}

          {/* Tab 3: Scoring & Contest Engine */}
          {activeTab === 3 && (
            <Card elevation={0} sx={{ p: 3.5, borderRadius: '16px', bgcolor: '#FFFFFF', border: `1px solid ${borderColor}`, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box>
                <Typography sx={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>
                  Competitive Scoring & Evaluation Rules
                </Typography>
                <Typography sx={{ fontSize: '0.8rem', color: '#64748B' }}>
                  Configure standard penalty times, plagiarism detection thresholds, and automated test rejudging.
                </Typography>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography sx={{ fontSize: '0.86rem', fontWeight: 700, color: '#0F172A' }}>
                    ICPC Wrong Submission Penalty: {scoring.defaultIcpcPenaltyMinutes} Minutes
                  </Typography>
                  <Typography sx={{ fontSize: '0.74rem', color: '#64748B' }}>
                    Minutes added to leaderboard penalty time for each rejected submission prior to Accepted (AC).
                  </Typography>
                  <Slider
                    value={scoring.defaultIcpcPenaltyMinutes}
                    onChange={(_, val) => setScoring({ ...scoring, defaultIcpcPenaltyMinutes: val as number })}
                    min={5}
                    max={60}
                    step={5}
                    valueLabelDisplay="auto"
                    sx={{ color: primaryBlue }}
                  />
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography sx={{ fontSize: '0.86rem', fontWeight: 700, color: '#0F172A' }}>
                    MOSS AST Plagiarism Sensitivity: {scoring.mossPlagiarismSensitivity}%
                  </Typography>
                  <Typography sx={{ fontSize: '0.74rem', color: '#64748B' }}>
                    Threshold above which code similarities trigger an automatic academic integrity flag for faculty.
                  </Typography>
                  <Slider
                    value={scoring.mossPlagiarismSensitivity}
                    onChange={(_, val) => setScoring({ ...scoring, mossPlagiarismSensitivity: val as number })}
                    min={50}
                    max={95}
                    step={5}
                    valueLabelDisplay="auto"
                    sx={{ color: '#D97706' }}
                  />
                </Box>
              </Box>

              <Divider sx={{ borderColor: '#F1F5F9' }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A' }}>
                      Allow Partial Scoring on Hidden Testcases (IOI Style)
                    </Typography>
                    <Typography sx={{ fontSize: '0.76rem', color: '#64748B' }}>
                      Awards subtask score points proportionally when code passes partial testcase groups.
                    </Typography>
                  </Box>
                  <Switch
                    checked={scoring.allowPartialTestcaseScores}
                    onChange={(e) => setScoring({ ...scoring, allowPartialTestcaseScores: e.target.checked })}
                    color="primary"
                  />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A' }}>
                      Automatic Rejudge on Problem Testcase Updates
                    </Typography>
                    <Typography sx={{ fontSize: '0.76rem', color: '#64748B' }}>
                      Automatically dispatches re-evaluation tasks to BullMQ workers whenever faculty alters test data.
                    </Typography>
                  </Box>
                  <Switch
                    checked={scoring.autoRejudgeOnTestcaseUpdate}
                    onChange={(e) => setScoring({ ...scoring, autoRejudgeOnTestcaseUpdate: e.target.checked })}
                    color="primary"
                  />
                </Box>
              </Box>
            </Card>
          )}

          {/* Tab 4: Webhooks & APIs */}
          {activeTab === 4 && (
            <Card elevation={0} sx={{ borderRadius: '16px', bgcolor: '#FFFFFF', border: `1px solid ${borderColor}`, overflow: 'hidden' }}>
              <Box sx={{ p: 3, borderBottom: `1px solid ${borderColor}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography sx={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>
                    Active Webhook Outlets & Integrations
                  </Typography>
                  <Typography sx={{ fontSize: '0.78rem', color: '#64748B' }}>
                    Dispatch real-time event payloads to college ERPs, Discord bots, and LMS platforms.
                  </Typography>
                </Box>
                <Button size="small" variant="contained" startIcon={<AddRoundedIcon sx={{ fontSize: 16 }} />} sx={{ bgcolor: primaryBlue, textTransform: 'none', fontWeight: 700, borderRadius: '8px' }}>
                  Register Webhook
                </Button>
              </Box>

              <TableContainer>
                <Table size="small">
                  <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                    <TableRow>
                      <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', pl: 3, py: 1.5 }}>WEBHOOK NAME</TableCell>
                      <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5 }}>ENDPOINT URL</TableCell>
                      <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5 }}>SUBSCRIBED EVENTS</TableCell>
                      <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5 }}>STATUS</TableCell>
                      <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5 }}>LAST TRIGGERED</TableCell>
                      <TableCell align="right" sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', pr: 3, py: 1.5 }}>ACTIONS</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {webhooks.map((w) => (
                      <TableRow key={w.id} hover sx={{ '& td': { borderBottom: '1px solid #F1F5F9' } }}>
                        <TableCell sx={{ pl: 3, py: 1.75 }}>
                          <Typography sx={{ fontSize: '0.86rem', fontWeight: 700, color: '#0F172A' }}>{w.name}</Typography>
                          <Typography sx={{ fontSize: '0.7rem', color: '#64748B', fontFamily: 'monospace' }}>{w.secretMasked}</Typography>
                        </TableCell>
                        <TableCell sx={{ py: 1.75 }}>
                          <Typography sx={{ fontSize: '0.76rem', fontFamily: 'monospace', color: '#2563EB' }}>{w.targetUrl}</Typography>
                        </TableCell>
                        <TableCell sx={{ py: 1.75 }}>
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            {w.events.map((ev) => (
                              <Chip key={ev} size="small" label={ev} sx={{ height: 20, fontSize: '0.68rem', fontWeight: 600, bgcolor: '#F1F5F9' }} />
                            ))}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ py: 1.75 }}>
                          <Chip size="small" label={w.status} sx={{ height: 22, fontSize: '0.72rem', fontWeight: 700, bgcolor: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0' }} />
                        </TableCell>
                        <TableCell sx={{ py: 1.75 }}>
                          <Typography sx={{ fontSize: '0.76rem', color: '#64748B' }}>{w.lastTriggered}</Typography>
                        </TableCell>
                        <TableCell align="right" sx={{ pr: 3, py: 1.75 }}>
                          <Button size="small" variant="outlined" endIcon={<FluidArrowRight size={14} />} sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.74rem', color: primaryBlue, borderColor: '#DBEAFE', bgcolor: '#EFF6FF', borderRadius: '6px' }}>
                            Test Ping
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          )}

          {/* Tab 5: Audit & Security Logs (Rule 10 Structured Table) */}
          {activeTab === 5 && (
            <Card elevation={0} sx={{ borderRadius: '16px', bgcolor: '#FFFFFF', border: `1px solid ${borderColor}`, overflow: 'hidden' }}>
              <Box sx={{ p: 3, borderBottom: `1px solid ${borderColor}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography sx={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>
                    Privileged Audit Trail & Security Logs
                  </Typography>
                  <Typography sx={{ fontSize: '0.78rem', color: '#64748B' }}>
                    Immutable log record of administrative modifications, role escalations, and rejudging events.
                  </Typography>
                </Box>
                <Chip label="Immutable Retention: 365 Days" size="small" sx={{ bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', fontWeight: 700, fontSize: '0.72rem' }} />
              </Box>

              <TableContainer>
                <Table size="small">
                  <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                    <TableRow>
                      <TableCell padding="checkbox" sx={{ pl: 2.5, py: 1.5 }}>
                        <Checkbox
                          size="small"
                          checked={paginatedAuditLogs.length > 0 && paginatedAuditLogs.every((l) => selectedAuditIds.includes(l.id))}
                          indeterminate={selectedAuditIds.length > 0 && paginatedAuditLogs.some((l) => selectedAuditIds.includes(l.id)) && !paginatedAuditLogs.every((l) => selectedAuditIds.includes(l.id))}
                          onChange={(e) => {
                            const visibleIds = paginatedAuditLogs.map((l) => l.id);
                            if (e.target.checked) {
                              setSelectedAuditIds((prev) => [...new Set([...prev, ...visibleIds])]);
                            } else {
                              setSelectedAuditIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
                            }
                          }}
                          sx={{ color: '#94A3B8', '&.Mui-checked': { color: primaryBlue } }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5, minWidth: 160 }}>TIMESTAMP</TableCell>
                      <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5, minWidth: 180 }}>ADMIN USER</TableCell>
                      <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5, minWidth: 200 }}>ACTION / EVENT</TableCell>
                      <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5, minWidth: 180 }}>TARGET ENTITY</TableCell>
                      <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5, minWidth: 130 }}>IP ADDRESS</TableCell>
                      <TableCell align="right" sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', pr: 3, py: 1.5, minWidth: 120 }}>STATUS</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedAuditLogs.map((log) => {
                      const isSelected = selectedAuditIds.includes(log.id);
                      return (
                        <TableRow key={log.id} hover selected={isSelected} sx={{ '& td': { borderBottom: '1px solid #F1F5F9' }, '&.Mui-selected': { bgcolor: '#EFF6FF !important' } }}>
                          <TableCell padding="checkbox" sx={{ pl: 2.5, py: 1.75 }}>
                            <Checkbox
                              size="small"
                              checked={isSelected}
                              onChange={() =>
                                setSelectedAuditIds((prev) =>
                                  prev.includes(log.id) ? prev.filter((id) => id !== log.id) : [...prev, log.id]
                                )
                              }
                              sx={{ color: '#CBD5E1', '&.Mui-checked': { color: primaryBlue } }}
                            />
                          </TableCell>
                          <TableCell sx={{ py: 1.75 }}>
                            <Typography sx={{ fontSize: '0.76rem', color: '#64748B', fontFamily: 'monospace' }}>{log.timestamp}</Typography>
                          </TableCell>
                          <TableCell sx={{ py: 1.75 }}>
                            <Typography sx={{ fontSize: '0.84rem', fontWeight: 700, color: '#0F172A' }}>{log.adminName}</Typography>
                            <Typography sx={{ fontSize: '0.7rem', color: '#64748B' }}>{log.adminEmail}</Typography>
                          </TableCell>
                          <TableCell sx={{ py: 1.75 }}>
                            <Typography sx={{ fontSize: '0.84rem', fontWeight: 600, color: '#0F172A' }}>{log.action}</Typography>
                            <Typography sx={{ fontSize: '0.7rem', color: '#64748B' }}>{log.details}</Typography>
                          </TableCell>
                          <TableCell sx={{ py: 1.75 }}>
                            <Chip size="small" label={log.targetEntity} sx={{ height: 22, fontSize: '0.72rem', fontWeight: 600, bgcolor: '#F1F5F9' }} />
                          </TableCell>
                          <TableCell sx={{ py: 1.75 }}>
                            <Typography sx={{ fontSize: '0.76rem', color: '#64748B', fontFamily: 'monospace' }}>{log.ipAddress}</Typography>
                          </TableCell>
                          <TableCell align="right" sx={{ pr: 3, py: 1.75 }}>
                            <Chip
                              size="small"
                              label={log.status}
                              sx={{
                                height: 22,
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                bgcolor: log.status === 'SUCCESS' ? '#ECFDF5' : log.status === 'WARNING' ? '#FFFBEB' : '#FEF2F2',
                                color: log.status === 'SUCCESS' ? '#059669' : log.status === 'WARNING' ? '#D97706' : '#DC2626',
                                border: `1px solid ${log.status === 'SUCCESS' ? '#A7F3D0' : log.status === 'WARNING' ? '#FDE68A' : '#FECACA'}`,
                                borderRadius: '5px',
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Pagination */}
              <Box sx={{ p: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${borderColor}` }}>
                <Typography sx={{ fontSize: '0.84rem', color: '#64748B' }}>
                  Showing <strong style={{ color: '#0F172A' }}>{auditPage * auditRowsPerPage + 1}</strong> to{' '}
                  <strong style={{ color: '#0F172A' }}>{Math.min((auditPage + 1) * auditRowsPerPage, auditLogs.length)}</strong> of{' '}
                  <strong style={{ color: '#0F172A' }}>{auditLogs.length}</strong> logs
                </Typography>

                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '9999px', p: '3px 8px' }}>
                  <IconButton size="small" onClick={() => setAuditPage(0)} disabled={auditPage === 0} sx={{ color: '#64748B' }}>
                    <FirstPageRoundedIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                  <IconButton size="small" onClick={() => setAuditPage((p) => Math.max(0, p - 1))} disabled={auditPage === 0} sx={{ color: '#64748B' }}>
                    <ChevronLeftRoundedIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                  <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', px: 1.25 }}>
                    Page <strong style={{ color: '#0F172A' }}>{auditPage + 1}</strong> of <strong style={{ color: '#0F172A' }}>{totalAuditPages}</strong>
                  </Typography>
                  <IconButton size="small" onClick={() => setAuditPage((p) => Math.min(totalAuditPages - 1, p + 1))} disabled={auditPage >= totalAuditPages - 1} sx={{ color: '#64748B' }}>
                    <ChevronRightRoundedIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                  <IconButton size="small" onClick={() => setAuditPage(totalAuditPages - 1)} disabled={auditPage >= totalAuditPages - 1} sx={{ color: '#64748B' }}>
                    <LastPageRoundedIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Box>
              </Box>
            </Card>
          )}
          </>
          )}

          {/* Floating BulkActionBar for Audit Logs */}
          <BulkActionBar
            selectedCount={selectedAuditIds.length}
            onClear={() => setSelectedAuditIds([])}
            itemLabel="Logs Selected"
            exportLabel="Export Logs (.csv)"
            onExport={() => {
              toast.success(`Exported ${selectedAuditIds.length} platform audit logs as CSV.`, 'Audit Export');
              setSelectedAuditIds([]);
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}
