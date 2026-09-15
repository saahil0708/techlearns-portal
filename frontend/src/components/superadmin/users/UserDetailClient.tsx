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
  Avatar,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Select,
  Tabs,
  Tab,
  IconButton,
} from '@mui/material';
import Link from 'next/link';

// Icons
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import TableChartRoundedIcon from '@mui/icons-material/TableChartRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import VerifiedUserRoundedIcon from '@mui/icons-material/VerifiedUserRounded';
import GppBadRoundedIcon from '@mui/icons-material/GppBadRounded';
import LockResetRoundedIcon from '@mui/icons-material/LockResetRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import VpnKeyRoundedIcon from '@mui/icons-material/VpnKeyRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import DevicesRoundedIcon from '@mui/icons-material/DevicesRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import FirstPageRoundedIcon from '@mui/icons-material/FirstPageRounded';
import LastPageRoundedIcon from '@mui/icons-material/LastPageRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import SearchIcon from '@mui/icons-material/Search';

// Layout
import FloatingSidebar from '@/components/superadmin/layout/CurvedSidebar';
import Navbar from '@/components/superadmin/layout/Navbar';
import { UserDirectoryEntity } from '@/components/superadmin/users/UsersDirectoryClient';
import { useToast } from '@/context/ToastContext';
import { MuiCenterLoader } from '@/components/shared/MuiLoadingFallback';
import StatsCard from '@/components/superadmin/shared/StatsCard';

// Sub-Tab Interfaces
export interface UserSecurityLogItem {
  id: string;
  event: string;
  category: 'Auth' | 'Security' | 'Access' | 'Audit';
  ipAddress: string;
  location: string;
  userAgent: string;
  status: 'Success' | 'Failed' | 'Warning';
  timestamp: string;
}

export interface UserTenantMembershipItem {
  id: string;
  tenantName: string;
  tenantType: 'College' | 'School' | 'Independent';
  roleInTenant: string;
  permissionsScope: string;
  assignedAt: string;
  status: 'Active' | 'Suspended';
}

export interface UserActiveSessionItem {
  id: string;
  deviceInfo: string;
  ipAddress: string;
  location: string;
  issuedAt: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface UserPreferenceItem {
  id: string;
  settingName: string;
  category: 'Security' | 'Notifications' | 'Display' | 'SSO';
  currentValue: string;
  description: string;
}

interface UserDetailClientProps {
  user: UserDirectoryEntity;
  initialSecurityLogs: UserSecurityLogItem[];
  initialMemberships: UserTenantMembershipItem[];
  initialSessions: UserActiveSessionItem[];
  initialPreferences: UserPreferenceItem[];
}

interface PaginationToolbarProps {
  totalEntries: number;
  currentPage: number;
  rowsPerPage: number;
  onPageChange: (newPage: number) => void;
  onRowsPerPageChange: (newRows: number) => void;
  itemLabel?: string;
  rowsOptions?: number[];
}

function PaginationToolbar({
  totalEntries,
  currentPage,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  itemLabel = 'items',
  rowsOptions = [10, 25, 50],
}: PaginationToolbarProps) {
  const totalPages = Math.max(1, Math.ceil(totalEntries / rowsPerPage));
  const safePage = Math.min(currentPage, totalPages - 1);
  const startEntry = totalEntries === 0 ? 0 : safePage * rowsPerPage + 1;
  const endEntry = Math.min((safePage + 1) * rowsPerPage, totalEntries);

  return (
    <Card
      elevation={0}
      sx={{
        p: 2,
        px: 3,
        borderRadius: '14px',
        bgcolor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
        <Typography sx={{ fontSize: '0.78rem', color: '#64748B' }}>
          Showing <strong style={{ color: '#0F172A', fontWeight: 600 }}>{startEntry}–{endEntry}</strong> of <strong style={{ color: '#0F172A', fontWeight: 600 }}>{totalEntries}</strong> {itemLabel}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography sx={{ fontSize: '0.76rem', color: '#64748B' }}>Rows per page:</Typography>
          <Select
            value={rowsPerPage}
            onChange={(e) => {
              onRowsPerPageChange(Number(e.target.value));
              onPageChange(0);
            }}
            size="small"
            sx={{
              height: 28,
              fontSize: '0.76rem',
              fontWeight: 600,
              color: '#0F172A',
              bgcolor: '#FFFFFF',
              borderRadius: '9999px',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0', borderRadius: '9999px' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#CBD5E1' },
              '& .MuiSvgIcon-root': { color: '#64748B', fontSize: 18 },
            }}
          >
            {rowsOptions.map((opt) => (
              <MenuItem key={opt} value={opt}>{opt}</MenuItem>
            ))}
          </Select>
        </Box>
      </Box>

      {/* Pagination Controls */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
        <IconButton
          size="small"
          disabled={safePage === 0}
          onClick={() => onPageChange(0)}
          sx={{
            width: 32,
            height: 32,
            color: '#64748B',
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '9999px',
            '&:hover': { bgcolor: '#F1F5F9', color: '#0F172A' },
            '&.Mui-disabled': { opacity: 0.4, color: '#94A3B8' },
          }}
        >
          <FirstPageRoundedIcon sx={{ fontSize: 18 }} />
        </IconButton>

        <IconButton
          size="small"
          disabled={safePage === 0}
          onClick={() => onPageChange(Math.max(0, safePage - 1))}
          sx={{
            width: 32,
            height: 32,
            color: '#64748B',
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '9999px',
            '&:hover': { bgcolor: '#F1F5F9', color: '#0F172A' },
            '&.Mui-disabled': { opacity: 0.4, color: '#94A3B8' },
          }}
        >
          <ChevronLeftRoundedIcon sx={{ fontSize: 18 }} />
        </IconButton>

        {Array.from({ length: totalPages }, (_, i) => i)
          .filter((p) => p === 0 || p === totalPages - 1 || Math.abs(p - safePage) <= 1)
          .map((p, idx, arr) => {
            const showEllipsis = idx > 0 && p - arr[idx - 1] > 1;
            return (
              <React.Fragment key={p}>
                {showEllipsis && (
                  <Typography sx={{ fontSize: '0.76rem', color: '#94A3B8', px: 0.5 }}>…</Typography>
                )}
                <Button
                  size="small"
                  onClick={() => onPageChange(p)}
                  sx={{
                    minWidth: 32,
                    height: 32,
                    p: 0,
                    borderRadius: '9999px',
                    fontSize: '0.78rem',
                    fontWeight: safePage === p ? 800 : 500,
                    bgcolor: safePage === p ? '#2563EB' : '#FFFFFF',
                    color: safePage === p ? '#FFFFFF' : '#64748B',
                    border: '1px solid',
                    borderColor: safePage === p ? '#2563EB' : '#E2E8F0',
                    '&:hover': {
                      bgcolor: safePage === p ? '#1D4ED8' : '#F1F5F9',
                      color: safePage === p ? '#FFFFFF' : '#0F172A',
                    },
                  }}
                >
                  {p + 1}
                </Button>
              </React.Fragment>
            );
          })}

        <IconButton
          size="small"
          disabled={safePage >= totalPages - 1 || totalPages === 0}
          onClick={() => onPageChange(Math.min(totalPages - 1, safePage + 1))}
          sx={{
            width: 32,
            height: 32,
            color: '#64748B',
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '9999px',
            '&:hover': { bgcolor: '#F1F5F9', color: '#0F172A' },
            '&.Mui-disabled': { opacity: 0.4, color: '#94A3B8' },
          }}
        >
          <ChevronRightRoundedIcon sx={{ fontSize: 18 }} />
        </IconButton>

        <IconButton
          size="small"
          disabled={safePage >= totalPages - 1 || totalPages === 0}
          onClick={() => onPageChange(totalPages - 1)}
          sx={{
            width: 32,
            height: 32,
            color: '#64748B',
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '9999px',
            '&:hover': { bgcolor: '#F1F5F9', color: '#0F172A' },
            '&.Mui-disabled': { opacity: 0.4, color: '#94A3B8' },
          }}
        >
          <LastPageRoundedIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>
    </Card>
  );
}

export default function UserDetailClient({
  user,
  initialSecurityLogs,
  initialMemberships,
  initialSessions,
  initialPreferences,
}: UserDetailClientProps) {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<number>(0);
  const [isTabLoading, setIsTabLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleTabChange = (_: any, val: number) => {
    if (val === activeTab) return;
    setIsTabLoading(true);
    setActiveTab(val);
    setTimeout(() => setIsTabLoading(false), 180);
  };

  // Sub-tab States
  const [logsSearch, setLogsSearch] = useState('');
  const [logsPage, setLogsPage] = useState(0);
  const [logsRowsPerPage, setLogsRowsPerPage] = useState(10);

  const [membershipsSearch, setMembershipsSearch] = useState('');
  const [membershipsPage, setMembershipsPage] = useState(0);
  const [membershipsRowsPerPage, setMembershipsRowsPerPage] = useState(10);

  const [sessionsPage, setSessionsPage] = useState(0);
  const [sessionsRowsPerPage, setSessionsRowsPerPage] = useState(10);

  const [prefsPage, setPrefsPage] = useState(0);
  const [prefsRowsPerPage, setPrefsRowsPerPage] = useState(10);

  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);

  const borderColor = '#E2E8F0';

  // Filtered Logs
  const filteredLogs = initialSecurityLogs.filter((log) => {
    if (
      logsSearch &&
      !log.event.toLowerCase().includes(logsSearch.toLowerCase()) &&
      !log.ipAddress.toLowerCase().includes(logsSearch.toLowerCase()) &&
      !log.location.toLowerCase().includes(logsSearch.toLowerCase())
    ) {
      return false;
    }
    return true;
  });
  const paginatedLogs = filteredLogs.slice(logsPage * logsRowsPerPage, (logsPage + 1) * logsRowsPerPage);

  // Filtered Memberships
  const filteredMemberships = initialMemberships.filter((m) => {
    if (
      membershipsSearch &&
      !m.tenantName.toLowerCase().includes(membershipsSearch.toLowerCase()) &&
      !m.roleInTenant.toLowerCase().includes(membershipsSearch.toLowerCase())
    ) {
      return false;
    }
    return true;
  });
  const paginatedMemberships = filteredMemberships.slice(
    membershipsPage * membershipsRowsPerPage,
    (membershipsPage + 1) * membershipsRowsPerPage
  );

  const paginatedSessions = initialSessions.slice(
    sessionsPage * sessionsRowsPerPage,
    (sessionsPage + 1) * sessionsRowsPerPage
  );

  const paginatedPrefs = initialPreferences.slice(
    prefsPage * prefsRowsPerPage,
    (prefsPage + 1) * prefsRowsPerPage
  );

  // Export handlers
  const handleExportCSV = () => {
    setExportMenuAnchor(null);
    const headers = 'LogID,Event,Category,IPAddress,Location,UserAgent,Status,Timestamp\n';
    const rows = initialSecurityLogs
      .map((l) => `"${l.id}","${l.event}","${l.category}","${l.ipAddress}","${l.location}","${l.userAgent}","${l.status}","${l.timestamp}"`)
      .join('\n');
    const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + headers + rows);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `user_${user.handle}_security_audit_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${initialSecurityLogs.length} security audit logs to CSV`, 'Export Completed');
  };

  const handleExportExcel = () => {
    setExportMenuAnchor(null);
    let table = '<table border="1"><tr><th>Event</th><th>Category</th><th>IP</th><th>Location</th><th>Status</th><th>Timestamp</th></tr>';
    initialSecurityLogs.forEach((l) => {
      table += `<tr><td>${l.event}</td><td>${l.category}</td><td>${l.ipAddress}</td><td>${l.location}</td><td>${l.status}</td><td>${l.timestamp}</td></tr>`;
    });
    table += '</table>';
    const blob = new Blob([table], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user_${user.handle}_security_audit_${Date.now()}.xls`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success(`Exported ${initialSecurityLogs.length} security audit logs to Excel (.xls)`, 'Export Completed');
  };

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
      <FloatingSidebar />

      {/* Main Content Area */}
      <Box component="main" sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Unified Layout Container: Navbar + Page Content */}
        <Box sx={{ maxWidth: 1400, width: '100%', mx: 'auto', px: { xs: 3, md: 5 }, display: 'flex', flexDirection: 'column', gap: 4, pb: { xs: 4, md: 6 } }}>
          {/* 2. Top Header Navbar */}
          <Navbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

          {/* Breadcrumb & Top Bar */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Button
                component={Link}
                href="/superadmin/users"
                startIcon={<ArrowBackRoundedIcon sx={{ fontSize: 18 }} />}
                sx={{
                  color: '#64748B',
                  borderRadius: '9999px',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                }}
              >
                Back to Users Directory
              </Button>
            </Box>

            {/* Export Actions */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Tooltip title="Export Security & Audit Trail">
                <Button
                  onClick={(e) => setExportMenuAnchor(e.currentTarget)}
                  startIcon={<FileDownloadRoundedIcon sx={{ fontSize: 18 }} />}
                  sx={{
                    bgcolor: '#FFFFFF',
                    color: '#475569',
                    border: `1px solid ${borderColor}`,
                    borderRadius: '9999px',
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.84rem',
                    px: 2,
                    py: 0.75,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                    '&:hover': { bgcolor: '#EFF6FF', color: '#2563EB', borderColor: '#BFDBFE' },
                  }}
                >
                  Export Audit Trail
                </Button>
              </Tooltip>

              <Menu
                anchorEl={exportMenuAnchor}
                open={Boolean(exportMenuAnchor)}
                onClose={() => setExportMenuAnchor(null)}
                slotProps={{
                  paper: {
                    elevation: 4,
                    sx: {
                      borderRadius: '14px',
                      border: '1px solid #E2E8F0',
                      mt: 1,
                      minWidth: 210,
                      p: 0.5,
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08)',
                    },
                  },
                }}
              >
                <MenuItem onClick={handleExportExcel} sx={{ borderRadius: '8px', py: 1 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <TableChartRoundedIcon sx={{ fontSize: 18, color: '#16A34A' }} />
                  </ListItemIcon>
                  <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#0F172A' }}>
                    Download Excel (.xls)
                  </Typography>
                </MenuItem>
                <MenuItem onClick={handleExportCSV} sx={{ borderRadius: '8px', py: 1 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <DescriptionRoundedIcon sx={{ fontSize: 18, color: '#2563EB' }} />
                  </ListItemIcon>
                  <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#0F172A' }}>
                    Download CSV (.csv)
                  </Typography>
                </MenuItem>
              </Menu>
            </Box>
          </Box>

          {/* User Hero Banner */}
          <Card
            elevation={0}
            sx={{
              p: { xs: 2.5, md: 3.5 },
              borderRadius: '20px',
              bgcolor: '#FFFFFF',
              border: `1px solid ${borderColor}`,
              boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', md: 'center' },
              gap: 3,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
              <Avatar
                src={user.avatarUrl}
                sx={{
                  width: 72,
                  height: 72,
                  bgcolor: user.avatarColor,
                  fontWeight: 800,
                  fontSize: '1.6rem',
                  border: '3px solid #BFDBFE',
                  boxShadow: '0 8px 24px rgba(37,99,235,0.18)',
                }}
              >
                {user.name.charAt(0)}
              </Avatar>

              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap' }}>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A' }}>
                    {user.name}
                  </Typography>
                  <Chip
                    label={user.role.replace('_', ' ')}
                    size="small"
                    sx={{
                      bgcolor: '#EFF6FF',
                      color: '#2563EB',
                      border: '1px solid #BFDBFE',
                      fontWeight: 800,
                      fontSize: '0.72rem',
                      borderRadius: '9999px',
                    }}
                  />
                  <Chip
                    label={user.status}
                    size="small"
                    sx={{
                      bgcolor: '#F0FDF4',
                      color: '#16A34A',
                      border: '1px solid #BBF7D0',
                      fontWeight: 700,
                      fontSize: '0.72rem',
                      borderRadius: '9999px',
                    }}
                  />
                </Box>

                <Typography variant="body2" sx={{ color: '#64748B', mt: 0.3 }}>
                  <span style={{ color: '#2563EB', fontWeight: 600, fontFamily: 'monospace' }}>@{user.handle}</span> • {user.email} • UID: <span style={{ fontFamily: 'monospace' }}>{user.id}</span>
                </Typography>

                <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mt: 0.5 }}>
                  Affiliated with <strong>{user.institutionName}</strong> ({user.institutionType}) • Member since {user.createdAt}
                </Typography>
              </Box>
            </Box>

            {/* Quick Actions */}
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                startIcon={<LockResetRoundedIcon sx={{ fontSize: 18 }} />}
                sx={{
                  borderRadius: '9999px',
                  borderColor: '#CBD5E1',
                  color: '#475569',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  px: 2,
                  '&:hover': { borderColor: '#D97706', bgcolor: '#FFFBEB', color: '#D97706' },
                }}
              >
                Reset Password
              </Button>
              <Button
                variant="contained"
                sx={{
                  borderRadius: '9999px',
                  bgcolor: '#2563EB',
                  color: '#FFFFFF',
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  px: 2.5,
                  boxShadow: '0 4px 12px rgba(37,99,235,0.25)',
                  '&:hover': { bgcolor: '#1D4ED8' },
                }}
              >
                Modify Permissions
              </Button>
            </Box>
          </Card>

          {/* 4 Summary Security Cards */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2.5 }}>
            <StatsCard
              title="Two-Factor Auth"
              value={user.twoFactorEnabled ? 'Enabled' : 'Disabled'}
              icon={<SecurityRoundedIcon sx={{ fontSize: 20 }} />}
              variant="blue"
              shape="mountains"
              subtitle="App Authenticator (TOTP)"
            />

            <StatsCard
              title="Active Sessions"
              value={`${initialSessions.length} Devices`}
              icon={<DevicesRoundedIcon sx={{ fontSize: 20 }} />}
              variant="black"
              shape="curves"
              subtitle="Current: macOS / Chrome"
            />

            <StatsCard
              title="Tenant Scope"
              value={`${initialMemberships.length} Orgs`}
              icon={<BusinessRoundedIcon sx={{ fontSize: 20 }} />}
              variant="blue"
              shape="peaks"
              subtitle={`Primary: ${user.institutionName.split(' ')[0]}`}
            />

            <StatsCard
              title="Security Risk Score"
              value="Low (0 Flags)"
              icon={<VerifiedUserRoundedIcon sx={{ fontSize: 20 }} />}
              variant="black"
              shape="waves"
              subtitle={`Last IP: ${user.lastLoginIp}`}
            />
          </Box>

          {/* Navigation Tabs */}
          <Box sx={{ borderBottom: `1px solid ${borderColor}` }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  color: '#64748B',
                  minHeight: 48,
                  px: 2.5,
                  '&.Mui-selected': { color: '#2563EB' },
                },
                '& .MuiTabs-indicator': {
                  bgcolor: '#2563EB',
                  height: 3,
                  borderRadius: '3px 3px 0 0',
                },
              }}
            >
              <Tab icon={<HistoryRoundedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Security & Audit Logs" />
              <Tab icon={<BusinessRoundedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Tenant Memberships" />
              <Tab icon={<DevicesRoundedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Active Sessions & API Keys" />
              <Tab icon={<TuneRoundedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Account Preferences" />
            </Tabs>
          </Box>

          {isTabLoading ? (
            <MuiCenterLoader minHeight="380px" message="Loading tab data..." />
          ) : (
            <>
          {/* Tab 0: Security & Audit Logs (RULE 10 STANDARD) */}
          {activeTab === 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Search Bar */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <TextField
                  size="small"
                  placeholder="Filter security events by name, IP, or location..."
                  value={logsSearch}
                  onChange={(e) => {
                    setLogsSearch(e.target.value);
                    setLogsPage(0);
                  }}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: '#94A3B8', fontSize: 18 }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{
                    width: 380,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '9999px',
                      bgcolor: '#FFFFFF',
                      fontSize: '0.82rem',
                    },
                  }}
                />
              </Box>

              <Card
                elevation={0}
                sx={{
                  borderRadius: '16px',
                  bgcolor: '#FFFFFF',
                  border: `1px solid ${borderColor}`,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                  overflow: 'hidden',
                }}
              >
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                        <TableCell sx={{ color: '#64748B', fontWeight: 700, fontSize: '0.74rem', textTransform: 'uppercase' }}>
                          Security Event
                        </TableCell>
                        <TableCell sx={{ color: '#64748B', fontWeight: 700, fontSize: '0.74rem', textTransform: 'uppercase' }}>
                          Category
                        </TableCell>
                        <TableCell sx={{ color: '#64748B', fontWeight: 700, fontSize: '0.74rem', textTransform: 'uppercase' }}>
                          IP & Location
                        </TableCell>
                        <TableCell sx={{ color: '#64748B', fontWeight: 700, fontSize: '0.74rem', textTransform: 'uppercase' }}>
                          User Agent / Client
                        </TableCell>
                        <TableCell sx={{ color: '#64748B', fontWeight: 700, fontSize: '0.74rem', textTransform: 'uppercase' }}>
                          Status
                        </TableCell>
                        <TableCell align="right" sx={{ color: '#64748B', fontWeight: 700, fontSize: '0.74rem', textTransform: 'uppercase', pr: 3 }}>
                          Timestamp
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedLogs.map((log) => (
                        <TableRow key={log.id} sx={{ '&:hover': { bgcolor: '#F8FAFC' } }}>
                          <TableCell sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.84rem' }}>
                            {log.event}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={log.category}
                              size="small"
                              sx={{
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                borderRadius: '9999px',
                                bgcolor: '#EFF6FF',
                                color: '#2563EB',
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ color: '#475569', fontSize: '0.82rem' }}>
                            <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{log.ipAddress}</span> • {log.location}
                          </TableCell>
                          <TableCell sx={{ color: '#64748B', fontSize: '0.78rem', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {log.userAgent}
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={log.status === 'Success' ? <CheckCircleRoundedIcon sx={{ fontSize: '0.85rem !important' }} /> : <CancelRoundedIcon sx={{ fontSize: '0.85rem !important' }} />}
                              label={log.status}
                              size="small"
                              sx={{
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                borderRadius: '9999px',
                                bgcolor: log.status === 'Success' ? '#F0FDF4' : '#FEF2F2',
                                color: log.status === 'Success' ? '#16A34A' : '#DC2626',
                                border: `1px solid ${log.status === 'Success' ? '#BBF7D0' : '#FECACA'}`,
                              }}
                            />
                          </TableCell>
                          <TableCell align="right" sx={{ color: '#64748B', fontSize: '0.8rem', pr: 3 }}>
                            {log.timestamp}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <PaginationToolbar
                  totalEntries={filteredLogs.length}
                  currentPage={logsPage}
                  rowsPerPage={logsRowsPerPage}
                  onPageChange={setLogsPage}
                  onRowsPerPageChange={setLogsRowsPerPage}
                  itemLabel="logs"
                />
              </Card>
            </Box>
          )}

          {/* Tab 1: Tenant Memberships (RULE 10 STANDARD) */}
          {activeTab === 1 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: '16px',
                  bgcolor: '#FFFFFF',
                  border: `1px solid ${borderColor}`,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                  overflow: 'hidden',
                }}
              >
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                        <TableCell sx={{ color: '#64748B', fontWeight: 700, fontSize: '0.74rem', textTransform: 'uppercase' }}>
                          Tenant Organization
                        </TableCell>
                        <TableCell sx={{ color: '#64748B', fontWeight: 700, fontSize: '0.74rem', textTransform: 'uppercase' }}>
                          Type
                        </TableCell>
                        <TableCell sx={{ color: '#64748B', fontWeight: 700, fontSize: '0.74rem', textTransform: 'uppercase' }}>
                          Role in Tenant
                        </TableCell>
                        <TableCell sx={{ color: '#64748B', fontWeight: 700, fontSize: '0.74rem', textTransform: 'uppercase' }}>
                          Permissions Scope
                        </TableCell>
                        <TableCell sx={{ color: '#64748B', fontWeight: 700, fontSize: '0.74rem', textTransform: 'uppercase' }}>
                          Assigned Date
                        </TableCell>
                        <TableCell align="right" sx={{ color: '#64748B', fontWeight: 700, fontSize: '0.74rem', textTransform: 'uppercase', pr: 3 }}>
                          Status
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedMemberships.map((m) => (
                        <TableRow key={m.id} sx={{ '&:hover': { bgcolor: '#F8FAFC' } }}>
                          <TableCell sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.84rem' }}>
                            {m.tenantName}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={m.tenantType}
                              size="small"
                              sx={{ fontSize: '0.68rem', fontWeight: 700, borderRadius: '9999px', bgcolor: '#F1F5F9' }}
                            />
                          </TableCell>
                          <TableCell sx={{ color: '#2563EB', fontWeight: 700, fontSize: '0.82rem' }}>
                            {m.roleInTenant}
                          </TableCell>
                          <TableCell sx={{ color: '#64748B', fontSize: '0.82rem' }}>
                            {m.permissionsScope}
                          </TableCell>
                          <TableCell sx={{ color: '#64748B', fontSize: '0.82rem' }}>
                            {m.assignedAt}
                          </TableCell>
                          <TableCell align="right" sx={{ pr: 3 }}>
                            <Chip
                              label={m.status}
                              size="small"
                              sx={{
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                borderRadius: '9999px',
                                bgcolor: '#F0FDF4',
                                color: '#16A34A',
                                border: '1px solid #BBF7D0',
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <PaginationToolbar
                  totalEntries={filteredMemberships.length}
                  currentPage={membershipsPage}
                  rowsPerPage={membershipsRowsPerPage}
                  onPageChange={setMembershipsPage}
                  onRowsPerPageChange={setMembershipsRowsPerPage}
                  itemLabel="memberships"
                />
              </Card>
            </Box>
          )}

          {/* Tab 2: Active Sessions & API Keys (RULE 10 STANDARD) */}
          {activeTab === 2 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: '16px',
                  bgcolor: '#FFFFFF',
                  border: `1px solid ${borderColor}`,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                  overflow: 'hidden',
                }}
              >
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                        <TableCell sx={{ color: '#64748B', fontWeight: 700, fontSize: '0.74rem', textTransform: 'uppercase' }}>
                          Client Device / Browser
                        </TableCell>
                        <TableCell sx={{ color: '#64748B', fontWeight: 700, fontSize: '0.74rem', textTransform: 'uppercase' }}>
                          IP & Geolocation
                        </TableCell>
                        <TableCell sx={{ color: '#64748B', fontWeight: 700, fontSize: '0.74rem', textTransform: 'uppercase' }}>
                          Issued Timestamp
                        </TableCell>
                        <TableCell sx={{ color: '#64748B', fontWeight: 700, fontSize: '0.74rem', textTransform: 'uppercase' }}>
                          Last Active
                        </TableCell>
                        <TableCell align="right" sx={{ color: '#64748B', fontWeight: 700, fontSize: '0.74rem', textTransform: 'uppercase', pr: 3 }}>
                          Action
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedSessions.map((s) => (
                        <TableRow key={s.id} sx={{ '&:hover': { bgcolor: '#F8FAFC' } }}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.84rem' }}>
                                {s.deviceInfo}
                              </Typography>
                              {s.isCurrent && (
                                <Chip
                                  label="Current Session"
                                  size="small"
                                  sx={{ fontSize: '0.65rem', fontWeight: 800, borderRadius: '9999px', bgcolor: '#EFF6FF', color: '#2563EB' }}
                                />
                              )}
                            </Box>
                          </TableCell>
                          <TableCell sx={{ color: '#475569', fontSize: '0.82rem' }}>
                            <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{s.ipAddress}</span> • {s.location}
                          </TableCell>
                          <TableCell sx={{ color: '#64748B', fontSize: '0.82rem' }}>
                            {s.issuedAt}
                          </TableCell>
                          <TableCell sx={{ color: '#0F172A', fontWeight: 600, fontSize: '0.82rem' }}>
                            {s.lastActive}
                          </TableCell>
                          <TableCell align="right" sx={{ pr: 3 }}>
                            <Button
                              size="small"
                              disabled={s.isCurrent}
                              sx={{
                                color: '#DC2626',
                                borderRadius: '9999px',
                                textTransform: 'none',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                '&:hover': { bgcolor: '#FEF2F2' },
                              }}
                            >
                              {s.isCurrent ? 'Active Now' : 'Revoke'}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <PaginationToolbar
                  totalEntries={initialSessions.length}
                  currentPage={sessionsPage}
                  rowsPerPage={sessionsRowsPerPage}
                  onPageChange={setSessionsPage}
                  onRowsPerPageChange={setSessionsRowsPerPage}
                  itemLabel="sessions"
                />
              </Card>
            </Box>
          )}

          {/* Tab 3: Account Preferences (RULE 10 STANDARD) */}
          {activeTab === 3 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: '16px',
                  bgcolor: '#FFFFFF',
                  border: `1px solid ${borderColor}`,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                  overflow: 'hidden',
                }}
              >
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                        <TableCell sx={{ color: '#64748B', fontWeight: 700, fontSize: '0.74rem', textTransform: 'uppercase' }}>
                          Configuration Setting
                        </TableCell>
                        <TableCell sx={{ color: '#64748B', fontWeight: 700, fontSize: '0.74rem', textTransform: 'uppercase' }}>
                          Category
                        </TableCell>
                        <TableCell sx={{ color: '#64748B', fontWeight: 700, fontSize: '0.74rem', textTransform: 'uppercase' }}>
                          Current Value
                        </TableCell>
                        <TableCell align="right" sx={{ color: '#64748B', fontWeight: 700, fontSize: '0.74rem', textTransform: 'uppercase', pr: 3 }}>
                          Description
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedPrefs.map((p) => (
                        <TableRow key={p.id} sx={{ '&:hover': { bgcolor: '#F8FAFC' } }}>
                          <TableCell sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.84rem' }}>
                            {p.settingName}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={p.category}
                              size="small"
                              sx={{ fontSize: '0.68rem', fontWeight: 700, borderRadius: '9999px', bgcolor: '#F1F5F9' }}
                            />
                          </TableCell>
                          <TableCell sx={{ color: '#2563EB', fontWeight: 700, fontSize: '0.82rem' }}>
                            {p.currentValue}
                          </TableCell>
                          <TableCell align="right" sx={{ color: '#64748B', fontSize: '0.8rem', pr: 3 }}>
                            {p.description}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <PaginationToolbar
                  totalEntries={initialPreferences.length}
                  currentPage={prefsPage}
                  rowsPerPage={prefsRowsPerPage}
                  onPageChange={setPrefsPage}
                  onRowsPerPageChange={setPrefsRowsPerPage}
                  itemLabel="settings"
                />
              </Card>
            </Box>
          )}
          </>
          )}
        </Box>
      </Box>
    </Box>
  );
}
