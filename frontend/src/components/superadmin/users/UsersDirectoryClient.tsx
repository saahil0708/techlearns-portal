'use client';

import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  Chip,
  Button,
  TextField,
  InputAdornment,
  Avatar,
  IconButton,
  Tooltip,
  ListItemIcon,
  Menu,
  MenuItem,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Select,
  Checkbox,
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import Link from 'next/link';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded';
import GroupAddRoundedIcon from '@mui/icons-material/GroupAddRounded';
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import VerifiedUserRoundedIcon from '@mui/icons-material/VerifiedUserRounded';
import GppBadRoundedIcon from '@mui/icons-material/GppBadRounded';
import SupervisorAccountRoundedIcon from '@mui/icons-material/SupervisorAccountRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import FirstPageRoundedIcon from '@mui/icons-material/FirstPageRounded';
import LastPageRoundedIcon from '@mui/icons-material/LastPageRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import TableChartRoundedIcon from '@mui/icons-material/TableChartRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import { FluidArrowRight } from '@/utils/fluid_arrow';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import FilterAltOffRoundedIcon from '@mui/icons-material/FilterAltOffRounded';
import LockResetRoundedIcon from '@mui/icons-material/LockResetRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded';

import dynamic from 'next/dynamic';

// Layout & Modals
import FloatingSidebar from '@/components/superadmin/layout/CurvedSidebar';
import Navbar from '@/components/superadmin/layout/Navbar';
import type { NewUserData, UserRole } from '@/components/superadmin/users/CreateUserModal';
import { apiService } from '@/lib/api-service';
import { useToast } from '@/context/ToastContext';
import { useAppSelector } from '@/store/hooks';
import YouBadge from '@/components/common/YouBadge';
import StatsCard from '@/components/superadmin/shared/StatsCard';

const CreateUserModal = dynamic(() => import('@/components/superadmin/users/CreateUserModal'), { loading: () => null });
const UserQuickPeekDrawer = dynamic(() => import('@/components/superadmin/users/UserQuickPeekDrawer'), { loading: () => null });
const BulkInviteUsersModal = dynamic(() => import('@/components/superadmin/users/BulkInviteUsersModal'), { loading: () => null });
const DeleteConfirmModal = dynamic(() => import('@/components/superadmin/shared/DeleteConfirmModal'), { loading: () => null });
const BulkActionBar = dynamic(() => import('@/components/superadmin/shared/BulkActionBar'), { loading: () => null });

export interface UserDirectoryEntity {
  id: string;
  name: string;
  handle: string;
  email: string;
  role: UserRole;
  institutionType: 'College' | 'School' | 'Independent';
  institutionName: string;
  twoFactorEnabled: boolean;
  lastLoginAt: string;
  lastLoginAtRaw?: string;
  lastLoginIp: string;
  createdAt: string;
  createdAtRaw?: string;
  status: 'Active' | 'Invited' | 'Suspended';
  avatarUrl?: string;
  avatarColor: string;
}

type SortField = 'name' | 'role' | 'institutionName' | 'lastLoginAt' | 'createdAt';
type SortDirection = 'asc' | 'desc';

interface UsersDirectoryClientProps {
  initialUsers: UserDirectoryEntity[];
}

export default function UsersDirectoryClient({ initialUsers }: UsersDirectoryClientProps) {
  const toast = useToast();
  const currentUser = useAppSelector((state) => state.auth.user);
  const [users, setUsers] = useState<UserDirectoryEntity[]>(() =>
    (initialUsers || []).filter((u) => u.role !== 'STUDENT'),
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [twoFactorFilter, setTwoFactorFilter] = useState<string>('ALL');

  // Client-side live data refresh
  React.useEffect(() => {
    async function loadLiveUsers() {
      try {
        const liveData = await apiService.getUsers({ limit: 100 });
        if (liveData?.items && liveData.items.length > 0) {
          const mapped: UserDirectoryEntity[] = liveData.items
            .filter((item: any) => item.globalRole && item.globalRole !== 'STUDENT')
            .map((item: any) => {
              const primaryMembership = Array.isArray(item.memberships)
                ? item.memberships.find((m: any) => m?.institution?.name || m?.college?.name)
                : null;
              const collegeName = primaryMembership?.institution?.name || primaryMembership?.college?.name;
              const userInstitution = item.institution?.trim();

              const institutionType: 'College' | 'School' | 'Independent' = collegeName
                ? 'College'
                : item.institutionType === 'School'
                ? 'School'
                : userInstitution
                ? item.institutionType || 'Independent'
                : 'Independent';

              const institutionName = collegeName || userInstitution || 'Independent';

              const lastLoginAtRaw = item.lastLoginAt || item.auditLogs?.[0]?.createdAt || '';
              const createdAtRaw = item.createdAt || '';
              const lastLoginDate = lastLoginAtRaw
                ? new Date(lastLoginAtRaw).toLocaleDateString('en-US', {
                    month: 'short',
                    day: '2-digit',
                    year: 'numeric',
                  })
                : 'Never';

              const lastLoginIp = item.lastLoginIp || item.auditLogs?.[0]?.ipAddress || '–';

              return {
                id: item.id,
                name: item.name,
                handle: item.rollNo || (item.email ? item.email.split('@')[0] : 'user'),
                email: item.email,
                role: item.globalRole || 'FACULTY',
                institutionType,
                institutionName,
                twoFactorEnabled: Boolean(item.twoFactorEnabled),
                lastLoginAt: lastLoginDate,
                lastLoginAtRaw,
                lastLoginIp,
                createdAt: item.createdAt
                  ? new Date(item.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: '2-digit',
                      year: 'numeric',
                    })
                  : 'Recently',
                createdAtRaw,
                status: item.status === 'ACTIVE' ? 'Active' : 'Suspended',
                avatarColor: '#7C3AED',
              };
            });
          setUsers(mapped);
        }
      } catch (err) {
        console.warn('Live users fetch on client:', err);
      }
    }
    loadLiveUsers();
  }, []);

  // Sorting State
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Selection & Modals State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isBulkInviteOpen, setIsBulkInviteOpen] = useState<boolean>(false);
  const [peekUser, setPeekUser] = useState<UserDirectoryEntity | null>(null);
  const [deleteTargetUsers, setDeleteTargetUsers] = useState<UserDirectoryEntity[] | null>(null);
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);

  // Pagination states
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  const borderColor = '#E2E8F0';

  // Handle Sort Change
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Delete Handlers
  const _handleRequestDeleteSingle = (user: UserDirectoryEntity) => {
    setDeleteTargetUsers([user]);
  };

  const handleRequestDeleteBulk = () => {
    const targets = users.filter((u) => selectedIds.includes(u.id));
    if (targets.length > 0) {
      setDeleteTargetUsers(targets);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetUsers) return;
    const targetIds = new Set(deleteTargetUsers.map((u) => u.id));
    const count = deleteTargetUsers.length;
    const targetsToDelete = [...deleteTargetUsers];
    setUsers((prev) => prev.filter((u) => !targetIds.has(u.id)));
    setSelectedIds((prev) => prev.filter((id) => !targetIds.has(id)));
    setDeleteTargetUsers(null);

    // Call live API to delete user records from database
    for (const target of targetsToDelete) {
      try {
        await apiService.deleteUser(target.id);
      } catch (err) {
        console.error(`Failed to delete user ${target.id}:`, err);
      }
    }
    toast.success(
      count > 1 ? `Successfully deleted ${count} user accounts` : `Deleted user account successfully`,
      'Account Management'
    );
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedRoleFilter('ALL');
    setSelectedStatusFilter('ALL');
    setTwoFactorFilter('ALL');
    setPage(0);
  };

  const isFilterActive =
    searchQuery ||
    selectedRoleFilter !== 'ALL' ||
    selectedStatusFilter !== 'ALL' ||
    twoFactorFilter !== 'ALL';

  // Filter & Sort
  const processedUsers = useMemo(() => {
    return users
      .filter((user) => {
        if (selectedRoleFilter !== 'ALL' && user.role !== selectedRoleFilter) return false;
        if (selectedStatusFilter !== 'ALL' && user.status !== selectedStatusFilter) return false;
        if (twoFactorFilter === 'ENABLED' && !user.twoFactorEnabled) return false;
        if (twoFactorFilter === 'DISABLED' && user.twoFactorEnabled) return false;

        if (
          searchQuery &&
          !user.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !user.handle.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !user.email.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !user.institutionName.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !user.role.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        let valA: any =
          sortField === 'lastLoginAt'
            ? a.lastLoginAtRaw || ''
            : sortField === 'createdAt'
            ? a.createdAtRaw || ''
            : a[sortField];
        let valB: any =
          sortField === 'lastLoginAt'
            ? b.lastLoginAtRaw || ''
            : sortField === 'createdAt'
            ? b.createdAtRaw || ''
            : b[sortField];

        if (typeof valA === 'string') {
          valA = valA.toLowerCase();
          valB = valB.toLowerCase();
        }

        if (sortDirection === 'asc') {
          return valA > valB ? 1 : -1;
        } else {
          return valA < valB ? 1 : -1;
        }
      });
  }, [users, selectedRoleFilter, selectedStatusFilter, twoFactorFilter, searchQuery, sortField, sortDirection]);

  // Pagination slice
  const paginatedUsers = useMemo(() => {
    const start = page * rowsPerPage;
    return processedUsers.slice(start, start + rowsPerPage);
  }, [processedUsers, page, rowsPerPage]);

  const totalPages = Math.max(1, Math.ceil(processedUsers.length / rowsPerPage));

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(processedUsers.map((u) => u.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  // Stats Counters
  const totalCount = users.length;
  const superAdminCount = users.filter((u) => u.role === 'SUPER_ADMIN').length;
  const collegeAdminCount = users.filter((u) => u.role === 'COLLEGE_ADMIN').length;
  const schoolAdminCount = users.filter((u) => u.role === 'SCHOOL_ADMIN').length;
  const adminCount = users.filter((u) => u.role.includes('ADMIN')).length;
  const facultyCount = users.filter((u) => u.role === 'FACULTY').length;
  const recruiterCount = users.filter((u) => u.role === 'RECRUITER').length;
  const twoFaRate = Math.round((users.filter((u) => u.twoFactorEnabled).length / (users.length || 1)) * 100);

  // Add new user handler
  const handleAddUser = async (newData: NewUserData) => {
    const tempId = `usr-${Date.now()}`;
    const nowIso = new Date().toISOString();
    const newUser: UserDirectoryEntity = {
      id: tempId,
      name: newData.name,
      handle: newData.handle,
      email: newData.email,
      role: newData.role,
      institutionType: newData.institutionType,
      institutionName: newData.institutionName,
      twoFactorEnabled: false,
      lastLoginAt: 'Invited (Pending)',
      lastLoginAtRaw: '',
      lastLoginIp: '–',
      createdAt: 'Just now',
      createdAtRaw: nowIso,
      status: 'Invited',
      avatarColor: '#2563EB',
    };
    setUsers((prev) => [newUser, ...prev]);

    const assignedPassword = newData.password?.trim() || 'TemporaryPass123!';
    try {
      const created = await apiService.createUser({
        name: newData.name,
        email: newData.email,
        password: assignedPassword,
        rollNo: newData.handle,
        globalRole:
          newData.role === 'SUPER_ADMIN'
            ? 'SUPER_ADMIN'
            : newData.role === 'COLLEGE_ADMIN' || newData.role === 'SCHOOL_ADMIN'
            ? 'COLLEGE_ADMIN'
            : newData.role === 'STUDENT'
            ? 'STUDENT'
            : 'FACULTY',
      });
      if (created?.id) {
        setUsers((prev) =>
          prev.map((u) => (u.id === tempId ? { ...u, id: created.id } : u))
        );
      }
      toast.success(
        `User "${newData.name}" provisioned. Password: "${assignedPassword}"`,
        'User Created'
      );
    } catch {
      toast.info(`User "${newData.name}" added to local platform directory.`, 'User Registered');
    }
  };

  // Export handlers
  const getExportData = () => {
    const listToExport = selectedIds.length > 0 ? users.filter((u) => selectedIds.includes(u.id)) : processedUsers;
    return listToExport.map((u) => ({
      UserID: u.id,
      Name: u.name,
      Handle: u.handle,
      Email: u.email,
      Role: u.role,
      InstitutionType: u.institutionType,
      Institution: u.institutionName,
      TwoFactorAuth: u.twoFactorEnabled ? 'Enabled' : 'Disabled',
      LastLogin: u.lastLoginAt,
      LastIP: u.lastLoginIp,
      CreatedAt: u.createdAt,
      Status: u.status,
    }));
  };

  const handleExportCSV = () => {
    setExportMenuAnchor(null);
    const data = getExportData();
    if (data.length === 0) {
      toast.warning('No records available to export', 'Export Notice');
      return;
    }
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map((obj) => Object.values(obj).map((v) => `"${v}"`).join(','));
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `users_directory_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${data.length} user records to CSV`, 'Data Export');
  };

  const handleExportExcel = () => {
    setExportMenuAnchor(null);
    const data = getExportData();
    if (data.length === 0) {
      toast.warning('No records available to export', 'Export Notice');
      return;
    }
    let table = '<table border="1"><tr>' + Object.keys(data[0]).map((k) => `<th>${k}</th>`).join('') + '</tr>';
    data.forEach((row) => {
      table += '<tr>' + Object.values(row).map((val) => `<td>${val}</td>`).join('') + '</tr>';
    });
    table += '</table>';
    const blob = new Blob([table], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_directory_${Date.now()}.xls`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Exported ${data.length} user records to Excel`, 'Data Export');
  };

  const getRoleBadgeStyle = (role: UserRole) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return { bg: '#FAF5FF', text: '#7C3AED', border: '#E9D5FF' };
      case 'COLLEGE_ADMIN':
        return { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE' };
      case 'SCHOOL_ADMIN':
        return { bg: '#F0FDF4', text: '#16A34A', border: '#BBF7D0' };
      case 'FACULTY':
        return { bg: '#ECFEFF', text: '#0891B2', border: '#A5F3FC' };
      case 'STUDENT':
        return { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A' };
      default:
        return { bg: '#F1F5F9', text: '#64748B', border: '#CBD5E1' };
    }
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

          {/* Header Summary & Actions */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '10px',
                    bgcolor: '#EFF6FF',
                    color: '#2563EB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <SupervisorAccountRoundedIcon sx={{ fontSize: 22 }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 800, fontSize: { xs: '1.3rem', md: '1.6rem' }, color: '#0F172A', letterSpacing: '-0.02em' }}>
                  Users & Identity Management
                </Typography>
                <Chip
                  label={`${totalCount} Accounts`}
                  size="small"
                  sx={{
                    bgcolor: '#EFF6FF',
                    color: '#2563EB',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    borderRadius: '9999px',
                  }}
                />
              </Box>
              <Typography sx={{ color: '#64748B', fontSize: '0.86rem', mt: 0.5, fontWeight: 500 }}>
                Role-based access control (RBAC), multi-tenant administration, security audits & authentication
              </Typography>
            </Box>

            {/* Actions: Export, Bulk Invite & Add User */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
              <Tooltip title="Export Users Directory">
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
                  Export {selectedIds.length > 0 ? `(${selectedIds.length})` : 'Data'}
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

              {/* Bulk Invite */}
              <Button
                variant="outlined"
                onClick={() => setIsBulkInviteOpen(true)}
                startIcon={<GroupAddRoundedIcon sx={{ fontSize: 18 }} />}
                sx={{
                  bgcolor: '#FFFFFF',
                  color: '#2563EB',
                  border: '1px solid #BFDBFE',
                  borderRadius: '9999px',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.84rem',
                  px: 2,
                  py: 0.75,
                  '&:hover': { bgcolor: '#EFF6FF', borderColor: '#2563EB' },
                }}
              >
                Bulk Invite
              </Button>

              {/* Add User */}
              <Button
                variant="contained"
                onClick={() => setIsCreateModalOpen(true)}
                startIcon={<PersonAddRoundedIcon sx={{ fontSize: 18 }} />}
                sx={{
                  bgcolor: '#2563EB',
                  color: '#FFFFFF',
                  borderRadius: '9999px',
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  px: 2.25,
                  py: 0.75,
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                  '&:hover': { bgcolor: '#1D4ED8' },
                }}
              >
                Provision User
              </Button>
            </Box>
          </Box>

          {/* 4 Summary Metric Cards (Light Royal Blue Standard) */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2.5 }}>
            <StatsCard
              title="Total Accounts"
              value={totalCount}
              icon={<SupervisorAccountRoundedIcon sx={{ fontSize: 20 }} />}
              variant="blue"
              shape="orbital"
              subtitle={`${adminCount} Admins • ${facultyCount} Faculty • ${recruiterCount} Recruiters`}
            />

            <StatsCard
              title="Platform Administrators"
              value={adminCount}
              icon={<AdminPanelSettingsRoundedIcon sx={{ fontSize: 20 }} />}
              variant="black"
              shape="topography"
              subtitle="Super & Tenant Admins"
            />

            <StatsCard
              title="2FA Adoption Rate"
              value={`${twoFaRate}%`}
              icon={<SecurityRoundedIcon sx={{ fontSize: 20 }} />}
              variant="blue"
              shape="hex-grid"
              subtitle="High Security Tier"
            />

            <StatsCard
              title="Active Session Health"
              value="99.8%"
              icon={<VerifiedUserRoundedIcon sx={{ fontSize: 20 }} />}
              variant="black"
              shape="aurora-waves"
              subtitle="Zero active lockouts"
            />
          </Box>

          {/* Filter Toolbar Card with MUI Tabs */}
          <Card
            elevation={0}
            sx={{
              borderRadius: '16px',
              bgcolor: '#FFFFFF',
              border: `1px solid ${borderColor}`,
              boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* MUI Tabs for Role Categories */}
            <Box sx={{ borderBottom: `1px solid ${borderColor}`, px: { xs: 2, md: 3 }, pt: 0.5, bgcolor: '#FFFFFF' }}>
              <Tabs
                value={selectedRoleFilter}
                onChange={(_, newValue) => {
                  setSelectedRoleFilter(newValue);
                  setPage(0);
                }}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  minHeight: 48,
                  '& .MuiTabs-indicator': {
                    backgroundColor: '#2563EB',
                    height: 3,
                    borderRadius: '3px 3px 0 0',
                  },
                  '& .MuiTabs-flexContainer': {
                    gap: { xs: 0.5, sm: 1.5 },
                  },
                }}
              >
                {[
                  { id: 'ALL', label: 'All Users', count: totalCount },
                  { id: 'SUPER_ADMIN', label: 'Super Admins', count: superAdminCount },
                  { id: 'COLLEGE_ADMIN', label: 'College Admins', count: collegeAdminCount },
                  { id: 'SCHOOL_ADMIN', label: 'School Admins', count: schoolAdminCount },
                  { id: 'FACULTY', label: 'Faculty', count: facultyCount },
                  { id: 'RECRUITER', label: 'Recruiters', count: recruiterCount },
                ].map((tab) => (
                  <Tab
                    key={tab.id}
                    value={tab.id}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{ fontWeight: selectedRoleFilter === tab.id ? 700 : 600, fontSize: '0.84rem' }}>
                          {tab.label}
                        </Typography>
                        <Chip
                          label={tab.count}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            borderRadius: '9999px',
                            bgcolor: selectedRoleFilter === tab.id ? '#EFF6FF' : '#F1F5F9',
                            color: selectedRoleFilter === tab.id ? '#2563EB' : '#64748B',
                            border: '1px solid',
                            borderColor: selectedRoleFilter === tab.id ? '#BFDBFE' : '#E2E8F0',
                            pointerEvents: 'none',
                          }}
                        />
                      </Box>
                    }
                    disableRipple
                    sx={{
                      minHeight: 48,
                      py: 1,
                      px: 1.25,
                      textTransform: 'none',
                      color: selectedRoleFilter === tab.id ? '#2563EB !important' : '#64748B',
                      '&:hover': {
                        color: '#0F172A',
                      },
                    }}
                  />
                ))}
              </Tabs>
            </Box>

            {/* Search Bar & Secondary Dropdowns */}
            <Box
              sx={{
                p: { xs: 2, md: 2.5 },
                display: 'flex',
                flexDirection: { xs: 'column', lg: 'row' },
                gap: 2,
                alignItems: { xs: 'stretch', lg: 'center' },
                justifyContent: 'space-between',
              }}
            >
              {/* Search Input */}
              <TextField
                size="small"
                placeholder="Search by user name, @handle, email, institution, or role..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(0);
                }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: '#94A3B8', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  flex: 1,
                  maxWidth: { xs: '100%', lg: 460 },
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '9999px',
                    bgcolor: '#F8FAFC',
                    color: '#0F172A',
                    fontSize: '0.85rem',
                    '& fieldset': { borderColor: '#E2E8F0' },
                    '&:hover fieldset': { borderColor: '#CBD5E1' },
                    '&.Mui-focused fieldset': { borderColor: '#2563EB' },
                  },
                }}
              />

              {/* Row 2: Secondary Dropdown Filters & Reset */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, mr: 0.5 }}>
                  SECURITY & STATUS:
                </Typography>

                {/* 2FA Status */}
                <Select
                  size="small"
                  value={twoFactorFilter}
                  onChange={(e) => {
                    setTwoFactorFilter(e.target.value);
                    setPage(0);
                  }}
                  sx={{
                    bgcolor: '#F8FAFC',
                    color: '#0F172A',
                    borderRadius: '9999px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    height: 32,
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' },
                    '& .MuiSvgIcon-root': { color: '#64748B' },
                  }}
                >
                  <MenuItem value="ALL" sx={{ fontSize: '0.8rem' }}>All 2FA States</MenuItem>
                  <MenuItem value="ENABLED" sx={{ fontSize: '0.8rem' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <VerifiedUserRoundedIcon sx={{ fontSize: 15, color: '#16A34A' }} />
                      2FA Enabled
                    </Box>
                  </MenuItem>
                  <MenuItem value="DISABLED" sx={{ fontSize: '0.8rem' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <GppBadRoundedIcon sx={{ fontSize: 15, color: '#D97706' }} />
                      2FA Disabled
                    </Box>
                  </MenuItem>
                </Select>

                {/* Status */}
                <Select
                  size="small"
                  value={selectedStatusFilter}
                  onChange={(e) => {
                    setSelectedStatusFilter(e.target.value);
                    setPage(0);
                  }}
                  sx={{
                    bgcolor: '#F8FAFC',
                    color: '#0F172A',
                    borderRadius: '9999px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    height: 32,
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' },
                    '& .MuiSvgIcon-root': { color: '#64748B' },
                  }}
                >
                  <MenuItem value="ALL" sx={{ fontSize: '0.8rem' }}>All Statuses</MenuItem>
                  <MenuItem value="Active" sx={{ fontSize: '0.8rem' }}>Active Only</MenuItem>
                  <MenuItem value="Invited" sx={{ fontSize: '0.8rem' }}>Invited (Pending)</MenuItem>
                  <MenuItem value="Suspended" sx={{ fontSize: '0.8rem' }}>Suspended</MenuItem>
                </Select>

                {/* Reset Pill */}
                {isFilterActive && (
                  <Button
                    size="small"
                    onClick={handleResetFilters}
                    startIcon={<FilterAltOffRoundedIcon sx={{ fontSize: '0.9rem' }} />}
                    sx={{
                      borderRadius: '9999px',
                      color: '#DC2626',
                      bgcolor: '#FEF2F2',
                      border: '1px solid #FECACA',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      textTransform: 'none',
                      height: 32,
                      px: 1.5,
                      '&:hover': { bgcolor: '#FEE2E2' },
                    }}
                  >
                    Reset Filters
                  </Button>
                )}
              </Box>
            </Box>
          </Card>

          {/* Floating Fixed Bottom Bulk Action Bar */}
          <BulkActionBar
            selectedCount={selectedIds.length}
            onClear={() => setSelectedIds([])}
            onExport={handleExportExcel}
            onDelete={handleRequestDeleteBulk}
          >
            {/* Batch Reset Password */}
            <Button
              size="small"
              variant="outlined"
              startIcon={<LockResetRoundedIcon sx={{ fontSize: '1rem' }} />}
              sx={{
                borderRadius: '9999px',
                borderColor: '#FDE68A',
                color: '#D97706',
                bgcolor: '#FFFBEB',
                fontSize: '0.78rem',
                fontWeight: 600,
                textTransform: 'none',
                height: 30,
                px: 1.5,
                '&:hover': { bgcolor: '#FEF3C7', borderColor: '#FCD34D' },
              }}
            >
              Reset Passwords
            </Button>
          </BulkActionBar>

          {/* Structured List Table (RULE 10 STANDARD - LIGHT THEME) */}
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
              <Table sx={{ minWidth: 1050 }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                    {/* Checkbox Column */}
                    <TableCell padding="checkbox" sx={{ pl: 2.5, borderColor: '#E2E8F0' }}>
                      <Checkbox
                        indeterminate={selectedIds.length > 0 && selectedIds.length < processedUsers.length}
                        checked={processedUsers.length > 0 && selectedIds.length === processedUsers.length}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        sx={{
                          color: '#CBD5E1',
                          '&.Mui-checked, &.MuiCheckbox-indeterminate': { color: '#2563EB' },
                        }}
                      />
                    </TableCell>

                    {/* User & Handle Header (Sortable) */}
                    <TableCell
                      onClick={() => handleSort('name')}
                      sx={{
                        color: '#64748B',
                        fontWeight: 700,
                        fontSize: '0.74rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        borderColor: '#E2E8F0',
                        cursor: 'pointer',
                        userSelect: 'none',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        User & Handle
                        {sortField === 'name' &&
                          (sortDirection === 'asc' ? (
                            <ArrowUpwardRoundedIcon sx={{ fontSize: '0.85rem', color: '#2563EB' }} />
                          ) : (
                            <ArrowDownwardRoundedIcon sx={{ fontSize: '0.85rem', color: '#2563EB' }} />
                          ))}
                      </Box>
                    </TableCell>

                    {/* Role / Access Tier (Sortable) */}
                    <TableCell
                      onClick={() => handleSort('role')}
                      sx={{
                        color: '#64748B',
                        fontWeight: 700,
                        fontSize: '0.74rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        borderColor: '#E2E8F0',
                        cursor: 'pointer',
                        userSelect: 'none',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        Role & Access Tier
                        {sortField === 'role' &&
                          (sortDirection === 'asc' ? (
                            <ArrowUpwardRoundedIcon sx={{ fontSize: '0.85rem', color: '#2563EB' }} />
                          ) : (
                            <ArrowDownwardRoundedIcon sx={{ fontSize: '0.85rem', color: '#2563EB' }} />
                          ))}
                      </Box>
                    </TableCell>

                    {/* Institution Affiliation (Sortable) */}
                    <TableCell
                      onClick={() => handleSort('institutionName')}
                      sx={{
                        color: '#64748B',
                        fontWeight: 700,
                        fontSize: '0.74rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        borderColor: '#E2E8F0',
                        cursor: 'pointer',
                        userSelect: 'none',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        Assigned Tenant / Org
                        {sortField === 'institutionName' &&
                          (sortDirection === 'asc' ? (
                            <ArrowUpwardRoundedIcon sx={{ fontSize: '0.85rem', color: '#2563EB' }} />
                          ) : (
                            <ArrowDownwardRoundedIcon sx={{ fontSize: '0.85rem', color: '#2563EB' }} />
                          ))}
                      </Box>
                    </TableCell>

                    {/* 2FA Security Status */}
                    <TableCell
                      sx={{
                        color: '#64748B',
                        fontWeight: 700,
                        fontSize: '0.74rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        borderColor: '#E2E8F0',
                      }}
                    >
                      2FA Auth
                    </TableCell>

                    {/* Last Login (Sortable) */}
                    <TableCell
                      onClick={() => handleSort('lastLoginAt')}
                      sx={{
                        color: '#64748B',
                        fontWeight: 700,
                        fontSize: '0.74rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        borderColor: '#E2E8F0',
                        cursor: 'pointer',
                        userSelect: 'none',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        Last Active
                        {sortField === 'lastLoginAt' &&
                          (sortDirection === 'asc' ? (
                            <ArrowUpwardRoundedIcon sx={{ fontSize: '0.85rem', color: '#2563EB' }} />
                          ) : (
                            <ArrowDownwardRoundedIcon sx={{ fontSize: '0.85rem', color: '#2563EB' }} />
                          ))}
                      </Box>
                    </TableCell>

                    {/* Status */}
                    <TableCell
                      sx={{
                        color: '#64748B',
                        fontWeight: 700,
                        fontSize: '0.74rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        borderColor: '#E2E8F0',
                      }}
                    >
                      Status
                    </TableCell>

                    {/* Actions */}
                    <TableCell
                      align="right"
                      sx={{
                        color: '#64748B',
                        fontWeight: 700,
                        fontSize: '0.74rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        borderColor: '#E2E8F0',
                        pr: 3,
                      }}
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {paginatedUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} sx={{ textAlign: 'center', py: 8, borderColor: '#E2E8F0' }}>
                        <Typography variant="subtitle1" sx={{ color: '#64748B', fontWeight: 600 }}>
                          No users found matching your criteria.
                        </Typography>
                        <Button
                          size="small"
                          onClick={handleResetFilters}
                          sx={{ mt: 1.5, color: '#2563EB', borderRadius: '9999px', textTransform: 'none' }}
                        >
                          Reset All Filters
                        </Button>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedUsers.map((user) => {
                      const isSelected = selectedIds.includes(user.id);
                      const roleStyle = getRoleBadgeStyle(user.role);
                      const isCurrentUser = Boolean(
                        currentUser &&
                          (currentUser.id === user.id ||
                            (currentUser.email && user.email && currentUser.email.toLowerCase() === user.email.toLowerCase()))
                      );

                      return (
                        <TableRow
                          key={user.id}
                          selected={isSelected}
                          sx={{
                            transition: 'all 0.15s ease',
                            borderColor: '#E2E8F0',
                            bgcolor: isSelected ? '#EFF6FF' : isCurrentUser ? '#F8FAFC' : '#FFFFFF',
                            '&:hover': {
                              bgcolor: isSelected ? '#DBEAFE' : '#F8FAFC',
                            },
                          }}
                        >
                          {/* Row Checkbox */}
                          <TableCell padding="checkbox" sx={{ pl: 2.5, borderColor: '#E2E8F0' }}>
                            <Checkbox
                              checked={isSelected}
                              onChange={() => handleToggleSelectRow(user.id)}
                              sx={{
                                color: '#CBD5E1',
                                '&.Mui-checked': { color: '#2563EB' },
                              }}
                            />
                          </TableCell>

                          {/* User Info Column */}
                          <TableCell sx={{ borderColor: '#E2E8F0' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Avatar
                                src={user.avatarUrl}
                                sx={{
                                  width: 38,
                                  height: 38,
                                  bgcolor: user.avatarColor,
                                  fontWeight: 800,
                                  fontSize: '0.85rem',
                                  border: '2px solid #E2E8F0',
                                }}
                              >
                                {user.name.charAt(0)}
                              </Avatar>
                              <Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap' }}>
                                  <Typography
                                    onClick={() => setPeekUser(user)}
                                    sx={{
                                      fontWeight: 700,
                                      color: '#0F172A',
                                      fontSize: '0.88rem',
                                      cursor: 'pointer',
                                      '&:hover': { color: '#2563EB', textDecoration: 'underline' },
                                    }}
                                  >
                                    {user.name}
                                  </Typography>
                                  {isCurrentUser && <YouBadge />}
                                  <Typography
                                    sx={{
                                      color: '#2563EB',
                                      fontSize: '0.75rem',
                                      fontFamily: 'monospace',
                                      fontWeight: 600,
                                    }}
                                  >
                                    @{user.handle}
                                  </Typography>
                                </Box>
                                <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
                                  UID: {user.id} • {user.email}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>

                          {/* Role Badge */}
                          <TableCell sx={{ borderColor: '#E2E8F0' }}>
                            <Chip
                              label={user.role.replace('_', ' ')}
                              size="small"
                              sx={{
                                height: 22,
                                fontSize: '0.68rem',
                                fontWeight: 800,
                                borderRadius: '9999px',
                                bgcolor: roleStyle.bg,
                                color: roleStyle.text,
                                border: `1px solid ${roleStyle.border}`,
                              }}
                            />
                          </TableCell>

                          {/* Institution Affiliation */}
                          <TableCell sx={{ borderColor: '#E2E8F0' }}>
                            <Box>
                              <Typography
                                sx={{
                                  fontWeight: 600,
                                  color: '#0F172A',
                                  fontSize: '0.82rem',
                                  maxWidth: 220,
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                {user.institutionName}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.72rem' }}>
                                {user.institutionType} Affiliate
                              </Typography>
                            </Box>
                          </TableCell>

                          {/* 2FA Status */}
                          <TableCell sx={{ borderColor: '#E2E8F0' }}>
                            {user.twoFactorEnabled ? (
                              <Chip
                                icon={<VerifiedUserRoundedIcon sx={{ color: '#16A34A !important', fontSize: '0.85rem !important' }} />}
                                label="Enabled"
                                size="small"
                                sx={{
                                  height: 20,
                                  fontSize: '0.68rem',
                                  fontWeight: 700,
                                  borderRadius: '9999px',
                                  bgcolor: '#F0FDF4',
                                  color: '#16A34A',
                                  border: '1px solid #BBF7D0',
                                }}
                              />
                            ) : (
                              <Chip
                                icon={<GppBadRoundedIcon sx={{ color: '#D97706 !important', fontSize: '0.85rem !important' }} />}
                                label="Disabled"
                                size="small"
                                sx={{
                                  height: 20,
                                  fontSize: '0.68rem',
                                  fontWeight: 700,
                                  borderRadius: '9999px',
                                  bgcolor: '#FFFBEB',
                                  color: '#D97706',
                                  border: '1px solid #FDE68A',
                                }}
                              />
                            )}
                          </TableCell>

                          {/* Last Active */}
                          <TableCell sx={{ borderColor: '#E2E8F0' }}>
                            <Box>
                              <Typography sx={{ fontWeight: 600, color: '#0F172A', fontSize: '0.8rem' }}>
                                {user.lastLoginAt}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.7rem' }}>
                                IP: {user.lastLoginIp}
                              </Typography>
                            </Box>
                          </TableCell>

                          {/* Status */}
                          <TableCell sx={{ borderColor: '#E2E8F0' }}>
                            <Chip
                              label={user.status}
                              size="small"
                              sx={{
                                height: 22,
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                borderRadius: '9999px',
                                bgcolor:
                                  user.status === 'Active'
                                    ? '#F0FDF4'
                                    : user.status === 'Invited'
                                    ? '#FFFBEB'
                                    : '#FEF2F2',
                                color:
                                  user.status === 'Active'
                                    ? '#16A34A'
                                    : user.status === 'Invited'
                                    ? '#D97706'
                                    : '#DC2626',
                                border: '1px solid',
                                borderColor:
                                  user.status === 'Active'
                                    ? '#BBF7D0'
                                    : user.status === 'Invited'
                                    ? '#FDE68A'
                                    : '#FECACA',
                              }}
                            />
                          </TableCell>

                          {/* Actions */}
                          <TableCell align="right" sx={{ pr: 2.5, borderColor: '#E2E8F0' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                              {/* Peek Quick View */}
                              <Tooltip title="Quick Peek Profile">
                                <IconButton
                                  size="small"
                                  onClick={() => setPeekUser(user)}
                                  sx={{
                                    color: '#64748B',
                                    borderRadius: '9999px',
                                    '&:hover': { color: '#2563EB', bgcolor: '#EFF6FF' },
                                  }}
                                >
                                  <VisibilityRoundedIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>

                              {/* Full Profile Link */}
                              <Link href={`/superadmin/users/${user.id}`} passHref style={{ textDecoration: 'none' }}>
                                <IconButton
                                  size="small"
                                  sx={{
                                    color: '#64748B',
                                    borderRadius: '9999px',
                                    '&:hover': { color: '#0F172A', bgcolor: '#F1F5F9' },
                                  }}
                                >
                                  <FluidArrowRight size={16} />
                                </IconButton>
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

            {/* Full-Pill Pagination Bar (Rule 10 & Pill Standards - Light Theme) */}
            <Box
              sx={{
                p: '16px 24px',
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 2,
                borderTop: `1px solid ${borderColor}`,
                bgcolor: '#FFFFFF',
              }}
            >
              {/* Left: Total Range & Rows Per Page */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Typography variant="body2" sx={{ color: '#64748B', fontSize: '0.82rem' }}>
                  Showing{' '}
                  <Typography component="span" sx={{ color: '#0F172A', fontWeight: 700 }}>
                    {processedUsers.length === 0 ? 0 : page * rowsPerPage + 1}–
                    {Math.min((page + 1) * rowsPerPage, processedUsers.length)}
                  </Typography>{' '}
                  of{' '}
                  <Typography component="span" sx={{ color: '#0F172A', fontWeight: 700 }}>
                    {processedUsers.length}
                  </Typography>{' '}
                  users
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="caption" sx={{ color: '#64748B' }}>
                    Rows per page:
                  </Typography>
                  <Select
                    size="small"
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(Number(e.target.value));
                      setPage(0);
                    }}
                    sx={{
                      bgcolor: '#FFFFFF',
                      color: '#0F172A',
                      borderRadius: '9999px',
                      fontSize: '0.78rem',
                      height: 28,
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' },
                      '& .MuiSvgIcon-root': { color: '#64748B' },
                    }}
                  >
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={25}>25</MenuItem>
                    <MenuItem value={50}>50</MenuItem>
                    <MenuItem value={100}>100</MenuItem>
                  </Select>
                </Box>
              </Box>

              {/* Right: Full-Pill Navigation Controls */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                <IconButton
                  size="small"
                  disabled={page === 0}
                  onClick={() => setPage(0)}
                  sx={{
                    borderRadius: '9999px',
                    width: 32,
                    height: 32,
                    border: '1px solid #E2E8F0',
                    color: '#64748B',
                    bgcolor: '#FFFFFF',
                    '&:hover': { bgcolor: '#F1F5F9', color: '#0F172A' },
                    '&.Mui-disabled': { color: '#CBD5E1', borderColor: '#F1F5F9' },
                  }}
                >
                  <FirstPageRoundedIcon fontSize="small" />
                </IconButton>

                <IconButton
                  size="small"
                  disabled={page === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  sx={{
                    borderRadius: '9999px',
                    width: 32,
                    height: 32,
                    border: '1px solid #E2E8F0',
                    color: '#64748B',
                    bgcolor: '#FFFFFF',
                    '&:hover': { bgcolor: '#F1F5F9', color: '#0F172A' },
                    '&.Mui-disabled': { color: '#CBD5E1', borderColor: '#F1F5F9' },
                  }}
                >
                  <ChevronLeftRoundedIcon fontSize="small" />
                </IconButton>

                {/* Page Number Pills */}
                {Array.from({ length: totalPages }, (_, i) => i)
                  .filter((p) => p === 0 || p === totalPages - 1 || Math.abs(p - page) <= 1)
                  .map((p, idx, arr) => {
                    const showEllipsis = idx > 0 && p - arr[idx - 1] > 1;
                    return (
                      <React.Fragment key={p}>
                        {showEllipsis && (
                          <Typography variant="caption" sx={{ color: '#94A3B8', px: 0.5 }}>
                            …
                          </Typography>
                        )}
                        <Button
                          size="small"
                          onClick={() => setPage(p)}
                          sx={{
                            minWidth: 32,
                            height: 32,
                            p: 0,
                            borderRadius: '9999px',
                            fontSize: '0.78rem',
                            fontWeight: page === p ? 800 : 500,
                            bgcolor: page === p ? '#2563EB' : '#FFFFFF',
                            color: page === p ? '#FFFFFF' : '#64748B',
                            border: '1px solid',
                            borderColor: page === p ? '#2563EB' : '#E2E8F0',
                            '&:hover': {
                              bgcolor: page === p ? '#1D4ED8' : '#F1F5F9',
                              color: page === p ? '#FFFFFF' : '#0F172A',
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
                  disabled={page >= totalPages - 1 || totalPages === 0}
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  sx={{
                    borderRadius: '9999px',
                    width: 32,
                    height: 32,
                    border: '1px solid #E2E8F0',
                    color: '#64748B',
                    bgcolor: '#FFFFFF',
                    '&:hover': { bgcolor: '#F1F5F9', color: '#0F172A' },
                    '&.Mui-disabled': { color: '#CBD5E1', borderColor: '#F1F5F9' },
                  }}
                >
                  <ChevronRightRoundedIcon fontSize="small" />
                </IconButton>

                <IconButton
                  size="small"
                  disabled={page >= totalPages - 1 || totalPages === 0}
                  onClick={() => setPage(totalPages - 1)}
                  sx={{
                    borderRadius: '9999px',
                    width: 32,
                    height: 32,
                    border: '1px solid #E2E8F0',
                    color: '#64748B',
                    bgcolor: '#FFFFFF',
                    '&:hover': { bgcolor: '#F1F5F9', color: '#0F172A' },
                    '&.Mui-disabled': { color: '#CBD5E1', borderColor: '#F1F5F9' },
                  }}
                >
                  <LastPageRoundedIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          </Card>
        </Box>
      </Box>

      {/* Modals & Drawers */}
      <CreateUserModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleAddUser}
      />

      <BulkInviteUsersModal
        open={isBulkInviteOpen}
        onClose={() => setIsBulkInviteOpen(false)}
        onImportSuccess={(count) => {
          toast.success(`Successfully batch invited ${count} users with platform credentials.`, 'Bulk Invitations Sent');
        }}
      />

      <UserQuickPeekDrawer
        open={Boolean(peekUser)}
        onClose={() => setPeekUser(null)}
        user={peekUser}
      />

      {/* Deletion Confirmation Modal */}
      <DeleteConfirmModal
        open={Boolean(deleteTargetUsers)}
        onClose={() => setDeleteTargetUsers(null)}
        onConfirm={handleConfirmDelete}
        title={
          deleteTargetUsers && deleteTargetUsers.length > 1
            ? `Delete ${deleteTargetUsers.length} User Accounts`
            : 'Delete User Account'
        }
        subtitle={
          deleteTargetUsers && deleteTargetUsers.length > 1
            ? `Are you sure you want to delete ${deleteTargetUsers.length} selected accounts?`
            : 'Are you sure you want to permanently delete this user account?'
        }
        warningNote={
          deleteTargetUsers && deleteTargetUsers.length > 1
            ? `Permanently deleting ${deleteTargetUsers.length} user accounts will terminate active sessions and revoke system authorization.`
            : 'This action is irreversible. All access tokens, role permissions, and tenant memberships will be permanently erased.'
        }
        confirmLabel={
          deleteTargetUsers && deleteTargetUsers.length > 1
            ? `Delete ${deleteTargetUsers.length} Users`
            : 'Delete Account'
        }
        items={
          deleteTargetUsers?.map((u) => ({
            id: u.id,
            title: u.name,
            subtitle: `@${u.handle} • ${u.email}`,
            extraInfo: `${u.institutionName} (${u.institutionType})`,
            badge: u.role.replace('_', ' '),
            badgeColor: getRoleBadgeStyle(u.role),
            avatarUrl: u.avatarUrl,
            avatarColor: u.avatarColor,
          })) || []
        }
      />
    </Box>
  );
}
