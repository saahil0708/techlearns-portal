'use client';

import React from 'react';
import {
  Box,
  Typography,
  Card,
  Chip,
  Button,
  Avatar,
  IconButton,
  Tooltip,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Select,
  MenuItem,
  Checkbox,
} from '@mui/material';
import Link from 'next/link';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import VerifiedUserRoundedIcon from '@mui/icons-material/VerifiedUserRounded';
import GppBadRoundedIcon from '@mui/icons-material/GppBadRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import FirstPageRoundedIcon from '@mui/icons-material/FirstPageRounded';
import LastPageRoundedIcon from '@mui/icons-material/LastPageRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import { FluidArrowRight, FluidArrowUpward, FluidArrowDownward } from '@/utils/fluid_arrow';
import YouBadge from '@/components/common/YouBadge';
import { UserDirectoryEntity, SortField, SortDirection, getRoleBadgeStyle } from './types';

interface UsersDataTableProps {
  users: UserDirectoryEntity[];
  selectedIds: string[];
  onToggleSelectRow: (id: string) => void;
  onSelectAll: (checked: boolean) => void;
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  page: number;
  rowsPerPage: number;
  onPageChange: (newPage: number) => void;
  onRowsPerPageChange: (newRowsPerPage: number) => void;
  onPeekUser: (user: UserDirectoryEntity) => void;
  onEditUser: (user: UserDirectoryEntity) => void;
  onAssignUser: (user: UserDirectoryEntity) => void;
  onOpenActionMenu: (event: React.MouseEvent<HTMLElement>, user: UserDirectoryEntity) => void;
  onResetFilters: () => void;
  currentUserId?: string;
  currentUserEmail?: string;
}

export default function UsersDataTable({
  users,
  selectedIds,
  onToggleSelectRow,
  onSelectAll,
  sortField,
  sortDirection,
  onSort,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onPeekUser,
  onEditUser,
  onAssignUser,
  onOpenActionMenu,
  onResetFilters,
  currentUserId,
  currentUserEmail,
}: UsersDataTableProps) {
  const borderColor = '#E2E8F0';
  const totalPages = Math.max(1, Math.ceil(users.length / rowsPerPage));
  const safePage = Math.min(Math.max(0, page), totalPages - 1);
  const paginatedUsers = users.slice(safePage * rowsPerPage, (safePage + 1) * rowsPerPage);
  const visibleSelectedCount = React.useMemo(
    () => users.filter((u) => selectedIds.includes(u.id)).length,
    [users, selectedIds]
  );

  return (
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
                  indeterminate={visibleSelectedCount > 0 && visibleSelectedCount < users.length}
                  checked={users.length > 0 && visibleSelectedCount === users.length}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  sx={{
                    color: '#CBD5E1',
                    '&.Mui-checked, &.MuiCheckbox-indeterminate': { color: '#0B1F3A' },
                  }}
                />
              </TableCell>

              {/* User & Handle Header (Sortable) */}
              <TableCell
                onClick={() => onSort('name')}
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
                      <FluidArrowUpward sx={{ fontSize: '0.85rem', color: '#0B1F3A' }} />
                    ) : (
                      <FluidArrowDownward sx={{ fontSize: '0.85rem', color: '#0B1F3A' }} />
                    ))}
                </Box>
              </TableCell>

              {/* Role / Access Tier (Sortable) */}
              <TableCell
                onClick={() => onSort('role')}
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
                      <FluidArrowUpward sx={{ fontSize: '0.85rem', color: '#0B1F3A' }} />
                    ) : (
                      <FluidArrowDownward sx={{ fontSize: '0.85rem', color: '#0B1F3A' }} />
                    ))}
                </Box>
              </TableCell>

              {/* Institution Affiliation (Sortable) */}
              <TableCell
                onClick={() => onSort('institutionName')}
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
                      <FluidArrowUpward sx={{ fontSize: '0.85rem', color: '#0B1F3A' }} />
                    ) : (
                      <FluidArrowDownward sx={{ fontSize: '0.85rem', color: '#0B1F3A' }} />
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
                onClick={() => onSort('lastLoginAt')}
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
                      <FluidArrowUpward sx={{ fontSize: '0.85rem', color: '#0B1F3A' }} />
                    ) : (
                      <FluidArrowDownward sx={{ fontSize: '0.85rem', color: '#0B1F3A' }} />
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
                    onClick={onResetFilters}
                    sx={{ mt: 1.5, color: '#0B1F3A', borderRadius: '9999px', textTransform: 'none' }}
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
                  (currentUserId && currentUserId === user.id) ||
                    (currentUserEmail && user.email && currentUserEmail.toLowerCase() === user.email.toLowerCase())
                );

                return (
                  <TableRow
                    key={user.id}
                    selected={isSelected}
                    sx={{
                      transition: 'all 0.15s ease',
                      borderColor: '#E2E8F0',
                      bgcolor: isSelected ? '#FAF5FF' : isCurrentUser ? '#F8FAFC' : '#FFFFFF',
                      '&:hover': {
                        bgcolor: isSelected ? '#E9D5FF' : '#F8FAFC',
                      },
                    }}
                  >
                    {/* Row Checkbox */}
                    <TableCell padding="checkbox" sx={{ pl: 2.5, borderColor: '#E2E8F0' }}>
                      <Checkbox
                        checked={isSelected}
                        onChange={() => onToggleSelectRow(user.id)}
                        sx={{
                          color: '#CBD5E1',
                          '&.Mui-checked': { color: '#0B1F3A' },
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
                              onClick={() => onPeekUser(user)}
                              sx={{
                                fontWeight: 700,
                                color: '#0F172A',
                                fontSize: '0.88rem',
                                cursor: 'pointer',
                                '&:hover': { color: '#0B1F3A', textDecoration: 'underline' },
                              }}
                            >
                              {user.name}
                            </Typography>
                            {isCurrentUser && <YouBadge />}
                            <Typography
                              sx={{
                                color: '#0B1F3A',
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
                            onClick={() => onPeekUser(user)}
                            sx={{
                              color: '#64748B',
                              borderRadius: '9999px',
                              '&:hover': { color: '#0B1F3A', bgcolor: '#FAF5FF' },
                            }}
                          >
                            <VisibilityRoundedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        {/* Edit User Details */}
                        <Tooltip title="Edit User Details">
                          <IconButton
                            size="small"
                            onClick={() => onEditUser(user)}
                            sx={{
                              color: '#64748B',
                              borderRadius: '9999px',
                              '&:hover': { color: '#0B1F3A', bgcolor: '#FAF5FF' },
                            }}
                          >
                            <EditRoundedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        {/* Assign Active Institute */}
                        <Tooltip title="Assign Active Institute">
                          <IconButton
                            size="small"
                            onClick={() => onAssignUser(user)}
                            sx={{
                              color: '#64748B',
                              borderRadius: '9999px',
                              '&:hover': { color: '#16A34A', bgcolor: '#F0FDF4' },
                            }}
                          >
                            <AccountBalanceRoundedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        {/* More Actions Menu Button */}
                        <Tooltip title="More Actions">
                          <IconButton
                            size="small"
                            onClick={(e) => onOpenActionMenu(e, user)}
                            sx={{
                              color: '#64748B',
                              borderRadius: '9999px',
                              '&:hover': { color: '#0F172A', bgcolor: '#F1F5F9' },
                            }}
                          >
                            <MoreVertRoundedIcon fontSize="small" />
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

      {/* Full-Pill Pagination Bar */}
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
              {users.length === 0 ? 0 : safePage * rowsPerPage + 1}–
              {Math.min((safePage + 1) * rowsPerPage, users.length)}
            </Typography>{' '}
            of{' '}
            <Typography component="span" sx={{ color: '#0F172A', fontWeight: 700 }}>
              {users.length}
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
                onRowsPerPageChange(Number(e.target.value));
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
            disabled={safePage === 0}
            onClick={() => onPageChange(0)}
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
            disabled={safePage === 0}
            onClick={() => onPageChange(Math.max(0, safePage - 1))}
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
            .filter((p) => p === 0 || p === totalPages - 1 || Math.abs(p - safePage) <= 1)
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
                    onClick={() => onPageChange(p)}
                    sx={{
                      minWidth: 32,
                      height: 32,
                      p: 0,
                      borderRadius: '9999px',
                      fontSize: '0.78rem',
                      fontWeight: safePage === p ? 800 : 500,
                      bgcolor: safePage === p ? '#0B1F3A' : '#FFFFFF',
                      color: safePage === p ? '#FFFFFF' : '#64748B',
                      border: '1px solid',
                      borderColor: safePage === p ? '#0B1F3A' : '#E2E8F0',
                      '&:hover': {
                        bgcolor: safePage === p ? '#17366E' : '#F1F5F9',
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
            disabled={safePage >= totalPages - 1 || totalPages === 0}
            onClick={() => onPageChange(totalPages - 1)}
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
  );
}
