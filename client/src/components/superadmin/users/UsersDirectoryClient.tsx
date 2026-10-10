'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  Button,
  ListItemIcon,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import Link from 'next/link';
import dynamic from 'next/dynamic';

import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import LinkOffRoundedIcon from '@mui/icons-material/LinkOffRounded';
import LockResetRoundedIcon from '@mui/icons-material/LockResetRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import { FluidArrowRight } from '@/utils/fluid_arrow';

// Layout & Modals
import FloatingSidebar from '@/components/superadmin/layout/CurvedSidebar';
import Navbar from '@/components/superadmin/layout/Navbar';
import type { NewUserData } from '@/components/superadmin/users/CreateUserModal';
import { apiService } from '@/lib/api-service';
import { useToast } from '@/context/ToastContext';
import { useAppSelector } from '@/store/hooks';

export * from './directory/types';
import {
  UserDirectoryEntity,
  SortField,
  SortDirection,
  getRoleBadgeStyle,
} from './directory/types';
import UsersStatsBanner from './directory/UsersStatsBanner';
import UsersFilterToolbar from './directory/UsersFilterToolbar';
import UsersDataTable from './directory/UsersDataTable';

const CreateUserModal = dynamic(() => import('@/components/superadmin/users/CreateUserModal'), { loading: () => null });
const EditUserModal = dynamic(() => import('@/components/superadmin/users/EditUserModal'), { loading: () => null });
const AssignInstitutionModal = dynamic(() => import('@/components/superadmin/users/AssignInstitutionModal'), { loading: () => null });
const UserQuickPeekDrawer = dynamic(() => import('@/components/superadmin/users/UserQuickPeekDrawer'), { loading: () => null });
const BulkInviteUsersModal = dynamic(() => import('@/components/superadmin/users/BulkInviteUsersModal'), { loading: () => null });
const DeleteConfirmModal = dynamic(() => import('@/components/superadmin/shared/DeleteConfirmModal'), { loading: () => null });
const BulkActionBar = dynamic(() => import('@/components/superadmin/shared/BulkActionBar'), { loading: () => null });

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
  useEffect(() => {
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

              const institutionType: 'Institute' | 'Independent' = collegeName || userInstitution
                ? 'Institute'
                : 'Independent';

              const institutionName = collegeName || userInstitution || 'Independent';

              const lastLoginAtRaw = item.lastLoginAt || item.auditLogs?.[0]?.createdAt || '';
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
                createdAtRaw: item.createdAt || new Date().toISOString(),
                status:
                  item.status === 'ACTIVE'
                    ? 'Active'
                    : item.status === 'INVITED'
                    ? 'Invited'
                    : 'Suspended',
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
  const [editingUser, setEditingUser] = useState<UserDirectoryEntity | null>(null);
  const [assigningUser, setAssigningUser] = useState<UserDirectoryEntity | null>(null);
  const [actionMenuAnchor, setActionMenuAnchor] = useState<null | HTMLElement>(null);
  const [actionMenuUser, setActionMenuUser] = useState<UserDirectoryEntity | null>(null);
  const [deleteTargetUsers, setDeleteTargetUsers] = useState<UserDirectoryEntity[] | null>(null);

  // Pagination states
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  const borderColor = '#E2E8F0';

  const handleOpenActionMenu = (event: React.MouseEvent<HTMLElement>, targetUser: UserDirectoryEntity) => {
    event.stopPropagation();
    setActionMenuAnchor(event.currentTarget);
    setActionMenuUser(targetUser);
  };

  const handleCloseActionMenu = () => {
    setActionMenuAnchor(null);
    setActionMenuUser(null);
  };

  const handleUpdateUserSuccess = (updated: Partial<UserDirectoryEntity> & { id: string }) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === updated.id ? { ...u, ...updated } : u))
    );
    if (peekUser?.id === updated.id) {
      setPeekUser((prev) => (prev ? { ...prev, ...updated } : null));
    }
  };

  const handleAssignInstitutionSuccess = (updated: Partial<UserDirectoryEntity> & { id: string }) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === updated.id ? { ...u, ...updated } : u))
    );
    if (peekUser?.id === updated.id) {
      setPeekUser((prev) => (prev ? { ...prev, ...updated } : null));
    }
  };

  const handleUnassignUser = async (targetUser: UserDirectoryEntity) => {
    try {
      await apiService.unassignUserFromInstitutions(targetUser.id);
      toast.success(
        `Unassigned ${targetUser.name} from ${targetUser.institutionName} (now Independent).`,
        'Affiliation Removed'
      );
      handleAssignInstitutionSuccess({
        id: targetUser.id,
        institutionName: 'Independent',
        institutionType: 'Independent',
      });
    } catch (err: any) {
      toast.error(err?.message || 'Failed to unassign user from institution.', 'Action Failed');
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(processedUsers.map((u) => u.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedRoleFilter('ALL');
    setSelectedStatusFilter('ALL');
    setTwoFactorFilter('ALL');
    setPage(0);
  };

  const isFilterActive =
    searchQuery.trim() !== '' ||
    selectedRoleFilter !== 'ALL' ||
    selectedStatusFilter !== 'ALL' ||
    twoFactorFilter !== 'ALL';

const sanitizeSpreadsheetField = (val: any): string => {
  let str = String(val ?? '');
  if (/^[=+\-@\t\r]/.test(str)) {
    str = "'" + str;
  }
  return str;
};

const sanitizeCsvField = (val: any): string => {
  const str = sanitizeSpreadsheetField(val);
  return `"${str.replace(/"/g, '""')}"`;
};

const escapeHtml = (unsafe: any): string => {
  return String(unsafe ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

  // Single or Bulk delete confirmation
  const handleConfirmDelete = async () => {
    if (!deleteTargetUsers || deleteTargetUsers.length === 0) return;
    const succeededUsers: UserDirectoryEntity[] = [];
    let failedCount = 0;
    let lastErrorMessage = '';

    try {
      for (const target of deleteTargetUsers) {
        try {
          await apiService.deleteUser(target.id);
          succeededUsers.push(target);
        } catch (err: any) {
          failedCount++;
          lastErrorMessage = err?.message || 'Failed to delete user';
        }
      }

      if (failedCount > 0) {
        const errorMsg = succeededUsers.length > 0
          ? `Deleted ${succeededUsers.length} user(s), but ${failedCount} failed (${lastErrorMessage}).`
          : `Failed to delete ${failedCount} user(s): ${lastErrorMessage}`;
        toast.error(errorMsg, 'Deletion Incomplete');
      } else {
        const names = succeededUsers.map((u) => u.name).join(', ');
        toast.success(
          succeededUsers.length === 1
            ? `Deleted account for ${names}.`
            : `Permanently deleted ${succeededUsers.length} accounts (${names}).`,
          'Accounts Removed'
        );
      }
    } finally {
      if (succeededUsers.length > 0) {
        const succeededIds = new Set(succeededUsers.map((u) => u.id));
        setUsers((prevUsers) => {
          const remainingUsers = prevUsers.filter((u) => !succeededIds.has(u.id));
          const remainingProcessed = remainingUsers.filter((user) => {
            if (selectedRoleFilter !== 'ALL' && user.role !== selectedRoleFilter) return false;
            if (selectedStatusFilter !== 'ALL' && user.status !== selectedStatusFilter) return false;
            if (twoFactorFilter === 'ENABLED' && !user.twoFactorEnabled) return false;
            if (twoFactorFilter === 'DISABLED' && user.twoFactorEnabled) return false;
            const q = searchQuery.trim().toLowerCase();
            if (q) {
              const matchName = user.name.toLowerCase().includes(q);
              const matchHandle = user.handle.toLowerCase().includes(q);
              const matchEmail = user.email.toLowerCase().includes(q);
              const matchInst = user.institutionName.toLowerCase().includes(q);
              const matchRole = user.role.toLowerCase().includes(q);
              if (!matchName && !matchHandle && !matchEmail && !matchInst && !matchRole) return false;
            }
            return true;
          });
          const maxPage = Math.max(0, Math.ceil(remainingProcessed.length / rowsPerPage) - 1);
          setPage((currentPage) => Math.min(currentPage, maxPage));
          return remainingUsers;
        });
        setSelectedIds((prev) => prev.filter((id) => !succeededIds.has(id)));
      }
      setDeleteTargetUsers(null);
    }
  };

  const handleRequestDeleteBulk = () => {
    const targets = users.filter((u) => selectedIds.includes(u.id));
    if (targets.length > 0) {
      setDeleteTargetUsers(targets);
    }
  };

  const handleAddUser = async (newUserData: NewUserData) => {
    if (!newUserData.password?.trim()) {
      toast.error('A password must be provided for user account creation.', 'Password Required');
      return;
    }
    try {
      const created = await apiService.createUser({
        name: newUserData.name,
        email: newUserData.email,
        globalRole: newUserData.role,
        password: newUserData.password.trim(),
      });

      const nowIso = new Date().toISOString();
      const newUserEntity: UserDirectoryEntity = {
        id: created?.id || `usr-${Date.now()}`,
        name: newUserData.name,
        handle: newUserData.handle || newUserData.email.split('@')[0],
        email: newUserData.email,
        role: newUserData.role,
        institutionType: newUserData.institutionType,
        institutionName: newUserData.institutionName || 'Independent',
        twoFactorEnabled: false,
        lastLoginAt: 'Never',
        lastLoginIp: '–',
        createdAt: 'Just now',
        createdAtRaw: created?.createdAt || nowIso,
        status: newUserData.sendInviteEmail ? 'Invited' : 'Active',
        avatarColor: '#0B1F3A',
      };

      setUsers((prev) => [newUserEntity, ...prev]);
      setIsCreateModalOpen(false);
      toast.success(
        `Provisioned ${newUserEntity.name} (${newUserEntity.role.replace('_', ' ')}).`,
        'User Created'
      );
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create user account.', 'Creation Failed');
    }
  };

  // Process and Filter Users
  const processedUsers = useMemo(() => {
    return users
      .filter((user) => {
        if (selectedRoleFilter !== 'ALL' && user.role !== selectedRoleFilter) {
          return false;
        }
        if (selectedStatusFilter !== 'ALL' && user.status !== selectedStatusFilter) {
          return false;
        }
        if (twoFactorFilter === 'ENABLED' && !user.twoFactorEnabled) {
          return false;
        }
        if (twoFactorFilter === 'DISABLED' && user.twoFactorEnabled) {
          return false;
        }
        const q = searchQuery.trim().toLowerCase();
        if (q) {
          const matchName = user.name.toLowerCase().includes(q);
          const matchHandle = user.handle.toLowerCase().includes(q);
          const matchEmail = user.email.toLowerCase().includes(q);
          const matchInst = user.institutionName.toLowerCase().includes(q);
          const matchRole = user.role.toLowerCase().includes(q);
          if (!matchName && !matchHandle && !matchEmail && !matchInst && !matchRole) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        let valA: string = (a[sortField] ?? '') as string;
        let valB: string = (b[sortField] ?? '') as string;
        if (sortField === 'lastLoginAt') {
          valA = a.lastLoginAtRaw || (a.lastLoginAt === 'Never' ? '0' : a.lastLoginAt);
          valB = b.lastLoginAtRaw || (b.lastLoginAt === 'Never' ? '0' : b.lastLoginAt);
        }
        if (sortField === 'createdAt') {
          valA = a.createdAtRaw || (a.createdAt === 'Just now' ? '9999' : a.createdAt);
          valB = b.createdAtRaw || (b.createdAt === 'Just now' ? '9999' : b.createdAt);
        }
        const comp = valA.localeCompare(valB, undefined, { numeric: true });
        return sortDirection === 'asc' ? comp : -comp;
      });
  }, [users, selectedRoleFilter, selectedStatusFilter, twoFactorFilter, searchQuery, sortField, sortDirection]);

  // High-level statistics
  const totalCount = users.length;
  const superAdminCount = users.filter((u) => u.role === 'SUPER_ADMIN').length;
  const instituteAdminCount = users.filter((u) => u.role === 'COLLEGE_ADMIN').length;
  const facultyCount = users.filter((u) => u.role === 'FACULTY').length;
  const recruiterCount = users.filter((u) => u.role === 'RECRUITER').length;
  const adminCount = superAdminCount + instituteAdminCount;
  const twoFaEnabledCount = users.filter((u) => u.twoFactorEnabled).length;
  const twoFaRate = totalCount > 0 ? Math.round((twoFaEnabledCount / totalCount) * 100) : 0;
  const activeCount = users.filter((u) => u.status === 'Active').length;
  const activeRate = totalCount > 0 ? Math.round((activeCount / totalCount) * 100) : 0;

  // Exports
  const handleExportCSV = () => {
    const data = selectedIds.length > 0 ? users.filter((u) => selectedIds.includes(u.id)) : processedUsers;
    const headers = ['ID', 'Name', 'Handle', 'Email', 'Role', 'Affiliation', '2FA Status', 'Last Login', 'Created At', 'Status'];
    const rows = data.map((u) => [
      sanitizeCsvField(u.id),
      sanitizeCsvField(u.name),
      sanitizeCsvField(u.handle),
      sanitizeCsvField(u.email),
      sanitizeCsvField(u.role),
      sanitizeCsvField(u.institutionName),
      sanitizeCsvField(u.twoFactorEnabled ? 'Enabled' : 'Disabled'),
      sanitizeCsvField(u.lastLoginAt),
      sanitizeCsvField(u.createdAt),
      sanitizeCsvField(u.status),
    ]);
    const csvContent = [headers.map(sanitizeCsvField).join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `users_export_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Exported ${data.length} user records to CSV`, 'Data Export');
  };

  const handleExportExcel = () => {
    const data = selectedIds.length > 0 ? users.filter((u) => selectedIds.includes(u.id)) : processedUsers;
    let table = '<table border="1"><tr><th>ID</th><th>Name</th><th>Handle</th><th>Email</th><th>Role</th><th>Institution</th><th>2FA Enabled</th><th>Last Login</th><th>Created At</th><th>Status</th></tr>';
    data.forEach((u) => {
      table += `<tr><td>${escapeHtml(sanitizeSpreadsheetField(u.id))}</td><td>${escapeHtml(sanitizeSpreadsheetField(u.name))}</td><td>${escapeHtml(sanitizeSpreadsheetField(u.handle))}</td><td>${escapeHtml(sanitizeSpreadsheetField(u.email))}</td><td>${escapeHtml(sanitizeSpreadsheetField(u.role))}</td><td>${escapeHtml(sanitizeSpreadsheetField(u.institutionName))}</td><td>${escapeHtml(sanitizeSpreadsheetField(u.twoFactorEnabled ? 'Yes' : 'No'))}</td><td>${escapeHtml(sanitizeSpreadsheetField(u.lastLoginAt))}</td><td>${escapeHtml(sanitizeSpreadsheetField(u.createdAt))}</td><td>${escapeHtml(sanitizeSpreadsheetField(u.status))}</td></tr>`;
    });
    table += '</table>';
    const blob = new Blob([table], { type: 'application/vnd.ms-excel;charset=utf-8;' });
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

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        bgcolor: '#F4F5F7',
        backgroundImage: `
          radial-gradient(ellipse at 15% 10%, rgba(91, 45, 144, 0.06) 0%, transparent 45%),
          radial-gradient(ellipse at 85% 20%, rgba(91, 45, 144, 0.04) 0%, transparent 45%),
          radial-gradient(ellipse at 50% 90%, rgba(91, 45, 144, 0.04) 0%, transparent 50%)
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
        <Box sx={{ maxWidth: 1400, width: '100%', mx: 'auto', px: { xs: 3, md: 5 }, display: 'flex', flexDirection: 'column', gap: 4, pb: { xs: 4, md: 6 } }}>
          {/* 2. Top Header Navbar */}
          <Navbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

          {/* 3. Header Summary & Actions + Metrics */}
          <UsersStatsBanner
            totalCount={totalCount}
            adminCount={adminCount}
            facultyCount={facultyCount}
            recruiterCount={recruiterCount}
            twoFaRate={twoFaRate}
            activeCount={activeCount}
            activeRate={activeRate}
            selectedCount={selectedIds.length}
            onExportExcel={handleExportExcel}
            onExportCSV={handleExportCSV}
            onOpenBulkInvite={() => setIsBulkInviteOpen(true)}
            onOpenCreateUser={() => setIsCreateModalOpen(true)}
          />

          {/* 4. Filter Toolbar Card */}
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
            <UsersFilterToolbar
              selectedRoleFilter={selectedRoleFilter}
              onRoleFilterChange={(r) => {
                setSelectedRoleFilter(r);
                setPage(0);
              }}
              searchQuery={searchQuery}
              onSearchChange={(q) => {
                setSearchQuery(q);
                setPage(0);
              }}
              twoFactorFilter={twoFactorFilter}
              onTwoFactorFilterChange={(f) => {
                setTwoFactorFilter(f);
                setPage(0);
              }}
              selectedStatusFilter={selectedStatusFilter}
              onStatusFilterChange={(s) => {
                setSelectedStatusFilter(s);
                setPage(0);
              }}
              onResetFilters={handleResetFilters}
              isFilterActive={isFilterActive}
              totalCount={totalCount}
              superAdminCount={superAdminCount}
              instituteAdminCount={instituteAdminCount}
              facultyCount={facultyCount}
              recruiterCount={recruiterCount}
            />
          </Card>

          {/* 5. Floating Fixed Bottom Bulk Action Bar */}
          <BulkActionBar
            selectedCount={selectedIds.length}
            onClear={() => setSelectedIds([])}
            onExport={handleExportExcel}
            onDelete={handleRequestDeleteBulk}
          >
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

          {/* 6. Structured List Table (RULE 10 STANDARD) */}
          <UsersDataTable
            users={processedUsers}
            selectedIds={selectedIds}
            onToggleSelectRow={handleToggleSelectRow}
            onSelectAll={handleSelectAll}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={setPage}
            onRowsPerPageChange={(r) => {
              setRowsPerPage(r);
              setPage(0);
            }}
            onPeekUser={setPeekUser}
            onEditUser={setEditingUser}
            onAssignUser={setAssigningUser}
            onOpenActionMenu={handleOpenActionMenu}
            onResetFilters={handleResetFilters}
            currentUserId={currentUser?.id}
            currentUserEmail={currentUser?.email}
          />
        </Box>
      </Box>

      {/* Modals & Drawers */}
      <CreateUserModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleAddUser}
      />

      <EditUserModal
        open={Boolean(editingUser)}
        onClose={() => setEditingUser(null)}
        user={editingUser}
        onUpdateSuccess={handleUpdateUserSuccess}
      />

      <AssignInstitutionModal
        open={Boolean(assigningUser)}
        onClose={() => setAssigningUser(null)}
        user={assigningUser}
        onAssignSuccess={handleAssignInstitutionSuccess}
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
        onEditUser={(u) => setEditingUser(u)}
        onAssignInstitution={(u) => setAssigningUser(u)}
        onUnassignInstitution={handleUnassignUser}
      />

      {/* Row Action Menu */}
      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={handleCloseActionMenu}
        slotProps={{
          paper: {
            sx: {
              borderRadius: '14px',
              border: `1px solid ${borderColor}`,
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
              p: 0.5,
              minWidth: 200,
            },
          },
        }}
      >
        <MenuItem
          onClick={() => {
            if (actionMenuUser) setPeekUser(actionMenuUser);
            handleCloseActionMenu();
          }}
          sx={{ fontSize: '0.82rem', fontWeight: 600, borderRadius: '8px', color: '#0F172A' }}
        >
          <ListItemIcon sx={{ minWidth: '28px !important', color: '#0B1F3A' }}>
            <VisibilityRoundedIcon fontSize="small" />
          </ListItemIcon>
          Quick Peek Profile
        </MenuItem>

        <MenuItem
          onClick={() => {
            if (actionMenuUser) setEditingUser(actionMenuUser);
            handleCloseActionMenu();
          }}
          sx={{ fontSize: '0.82rem', fontWeight: 600, borderRadius: '8px', color: '#0F172A' }}
        >
          <ListItemIcon sx={{ minWidth: '28px !important', color: '#0B1F3A' }}>
            <EditRoundedIcon fontSize="small" />
          </ListItemIcon>
          Edit User Details
        </MenuItem>

        <MenuItem
          onClick={() => {
            if (actionMenuUser) setAssigningUser(actionMenuUser);
            handleCloseActionMenu();
          }}
          sx={{ fontSize: '0.82rem', fontWeight: 600, borderRadius: '8px', color: '#0F172A' }}
        >
          <ListItemIcon sx={{ minWidth: '28px !important', color: '#16A34A' }}>
            <AccountBalanceRoundedIcon fontSize="small" />
          </ListItemIcon>
          Assign Active Institute
        </MenuItem>

        {actionMenuUser && actionMenuUser.institutionName && actionMenuUser.institutionName !== 'Independent' && (
          <MenuItem
            onClick={() => {
              const u = actionMenuUser;
              handleCloseActionMenu();
              handleUnassignUser(u);
            }}
            sx={{ fontSize: '0.82rem', fontWeight: 600, borderRadius: '8px', color: '#D97706' }}
          >
            <ListItemIcon sx={{ minWidth: '28px !important', color: '#D97706' }}>
              <LinkOffRoundedIcon fontSize="small" />
            </ListItemIcon>
            Unassign from Institute
          </MenuItem>
        )}

        {actionMenuUser && (
          <Link href={`/superadmin/users/${actionMenuUser.id}`} passHref style={{ textDecoration: 'none' }}>
            <MenuItem
              onClick={handleCloseActionMenu}
              sx={{ fontSize: '0.82rem', fontWeight: 600, borderRadius: '8px', color: '#0F172A' }}
            >
              <ListItemIcon sx={{ minWidth: '28px !important', color: '#64748B' }}>
                <FluidArrowRight size={16} />
              </ListItemIcon>
              Open Full Profile
            </MenuItem>
          </Link>
        )}

        <Divider sx={{ my: 0.5, borderColor: '#F1F5F9' }} />

        <MenuItem
          onClick={() => {
            if (actionMenuUser) {
              setDeleteTargetUsers([actionMenuUser]);
            }
            handleCloseActionMenu();
          }}
          sx={{ fontSize: '0.82rem', fontWeight: 600, borderRadius: '8px', color: '#DC2626' }}
        >
          <ListItemIcon sx={{ minWidth: '28px !important', color: '#DC2626' }}>
            <DeleteOutlineRoundedIcon fontSize="small" />
          </ListItemIcon>
          Delete Account
        </MenuItem>
      </Menu>

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
