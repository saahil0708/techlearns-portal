'use client';

import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Avatar,
  Chip,
  Button,
  Divider,
  Tooltip,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { FluidArrowRight } from '@/utils/fluid_arrow';
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded';
import LockResetRoundedIcon from '@mui/icons-material/LockResetRounded';
import VpnKeyRoundedIcon from '@mui/icons-material/VpnKeyRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import LinkOffRoundedIcon from '@mui/icons-material/LinkOffRounded';
import Link from 'next/link';
import { useToast } from '@/context/ToastContext';
import type { UserDirectoryEntity } from './UsersDirectoryClient';

interface UserQuickPeekDrawerProps {
  open: boolean;
  onClose: () => void;
  user: UserDirectoryEntity | null;
  onEditUser?: (user: UserDirectoryEntity) => void;
  onAssignInstitution?: (user: UserDirectoryEntity) => void;
  onUnassignInstitution?: (user: UserDirectoryEntity) => void;
}

export default function UserQuickPeekDrawer({
  open,
  onClose,
  user,
  onEditUser,
  onAssignInstitution,
  onUnassignInstitution,
}: UserQuickPeekDrawerProps) {
  const toast = useToast();
  if (!user) return null;

  const [copied, setCopied] = React.useState(false);
  const borderColor = '#E2E8F0';

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(user.email);
    setCopied(true);
    toast.info(`Copied ${user.email} to clipboard!`, 'Email Copied');
    setTimeout(() => setCopied(false), 2000);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return { bg: '#FAF5FF', text: '#7C3AED', border: '#E9D5FF' };
      case 'COLLEGE_ADMIN':
      case 'INSTITUTION_ADMIN':
        return { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE' };
      case 'FACULTY':
        return { bg: '#ECFEFF', text: '#0891B2', border: '#A5F3FC' };
      case 'STUDENT':
        return { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A' };
      default:
        return { bg: '#F1F5F9', text: '#64748B', border: '#E2E8F0' };
    }
  };

  const colors = getRoleBadgeColor(user.role);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: { xs: '100%', sm: 440 },
            bgcolor: '#FFFFFF',
            color: '#0F172A',
            borderLeft: `1px solid ${borderColor}`,
            boxShadow: '-8px 0 32px rgba(0,0,0,0.08)',
            p: 0,
          },
        },
      }}
    >
      {/* Header Bar */}
      <Box
        sx={{
          p: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${borderColor}`,
          bgcolor: '#F8FAFC',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            label={user.role.replace('_', ' ')}
            size="small"
            sx={{
              bgcolor: colors.bg,
              color: colors.text,
              border: `1px solid ${colors.border}`,
              fontWeight: 800,
              fontSize: '0.72rem',
              borderRadius: '9999px',
            }}
          />
          <Chip
            label={user.status}
            size="small"
            sx={{
              bgcolor: user.status === 'Active' ? '#F0FDF4' : '#FFFBEB',
              color: user.status === 'Active' ? '#16A34A' : '#D97706',
              border: `1px solid ${user.status === 'Active' ? '#BBF7D0' : '#FDE68A'}`,
              fontWeight: 700,
              fontSize: '0.72rem',
              borderRadius: '9999px',
            }}
          />
        </Box>
        <IconButton
          onClick={onClose}
          sx={{
            color: '#64748B',
            borderRadius: '9999px',
            '&:hover': { color: '#0F172A', bgcolor: '#F1F5F9' },
          }}
        >
          <CloseRoundedIcon />
        </IconButton>
      </Box>

      {/* Body Content */}
      <Box sx={{ p: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* User Card */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            src={user.avatarUrl}
            sx={{
              width: 64,
              height: 64,
              bgcolor: user.avatarColor,
              fontWeight: 800,
              fontSize: '1.3rem',
              border: '3px solid #BFDBFE',
              boxShadow: '0 4px 14px rgba(37,99,235,0.15)',
            }}
          >
            {user.name.charAt(0)}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
              {user.name}
            </Typography>
            <Typography variant="body2" sx={{ color: '#2563EB', fontFamily: 'monospace', fontSize: '0.82rem', mb: 0.5, fontWeight: 600 }}>
              @{user.handle}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
              UID: {user.id}
            </Typography>
          </Box>
        </Box>

        {/* Institution Info */}
        <Box
          sx={{
            p: '16px',
            borderRadius: '14px',
            bgcolor: '#F8FAFC',
            border: `1px solid ${borderColor}`,
          }}
        >
          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Tenant Organization
          </Typography>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', mt: 0.5 }}>
            {user.institutionName}
          </Typography>
          <Typography variant="caption" sx={{ color: '#2563EB', fontWeight: 600 }}>
            {user.institutionType} Affiliate
          </Typography>
        </Box>

        {/* Security & Access Overview */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5 }}>
          <Box sx={{ p: '14px', borderRadius: '14px', bgcolor: '#EFF6FF', border: '1px solid #BFDBFE' }}>
            <Typography variant="caption" sx={{ color: '#2563EB', fontWeight: 600 }}>
              Two-Factor Auth (2FA)
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, my: 0.3 }}>
              {user.twoFactorEnabled ? (
                <SecurityRoundedIcon sx={{ fontSize: '1.1rem', color: '#16A34A' }} />
              ) : (
                <SecurityRoundedIcon sx={{ fontSize: '1.1rem', color: '#D97706' }} />
              )}
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: user.twoFactorEnabled ? '#16A34A' : '#D97706' }}>
                {user.twoFactorEnabled ? 'Enabled' : 'Disabled'}
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: '#64748B' }}>
              Authenticator App
            </Typography>
          </Box>

          <Box sx={{ p: '14px', borderRadius: '14px', bgcolor: '#F0FDF4', border: '1px solid #BBF7D0' }}>
            <Typography variant="caption" sx={{ color: '#16A34A', fontWeight: 600 }}>
              Last Active
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A', my: 0.3 }}>
              {user.lastLoginAt}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B' }}>
              IP: {user.lastLoginIp}
            </Typography>
          </Box>
        </Box>

        {/* Fast Action Buttons */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Tooltip title={copied ? 'Copied to clipboard!' : 'Copy user email'}>
            <Button
              fullWidth
              variant="outlined"
              onClick={handleCopyEmail}
              startIcon={<ContentCopyRoundedIcon sx={{ fontSize: '1rem' }} />}
              sx={{
                borderRadius: '9999px',
                borderColor: '#CBD5E1',
                color: '#475569',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.82rem',
                py: 1,
                '&:hover': {
                  borderColor: '#2563EB',
                  bgcolor: '#EFF6FF',
                  color: '#2563EB',
                },
              }}
            >
              {copied ? 'Email Copied!' : user.email}
            </Button>
          </Tooltip>

          {/* Edit User Details */}
          {onEditUser && (
            <Button
              fullWidth
              variant="outlined"
              onClick={() => {
                onClose();
                onEditUser(user);
              }}
              startIcon={<EditRoundedIcon sx={{ fontSize: '1rem' }} />}
              sx={{
                borderRadius: '9999px',
                borderColor: '#BFDBFE',
                color: '#2563EB',
                bgcolor: '#EFF6FF',
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.82rem',
                py: 1,
                '&:hover': {
                  borderColor: '#2563EB',
                  bgcolor: '#DBEAFE',
                },
              }}
            >
              Edit User Details
            </Button>
          )}

          {/* Assign Active Institute */}
          {onAssignInstitution && (
            <Button
              fullWidth
              variant="outlined"
              onClick={() => {
                onClose();
                onAssignInstitution(user);
              }}
              startIcon={<AccountBalanceRoundedIcon sx={{ fontSize: '1rem' }} />}
              sx={{
                borderRadius: '9999px',
                borderColor: '#BBF7D0',
                color: '#16A34A',
                bgcolor: '#F0FDF4',
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.82rem',
                py: 1,
                '&:hover': {
                  borderColor: '#16A34A',
                  bgcolor: '#DCFCE7',
                },
              }}
            >
              Assign Active Institute
            </Button>
          )}

          {/* Unassign from Institute */}
          {user.institutionName && user.institutionName !== 'Independent' && onUnassignInstitution && (
            <Button
              fullWidth
              variant="outlined"
              onClick={() => {
                onClose();
                onUnassignInstitution(user);
              }}
              startIcon={<LinkOffRoundedIcon sx={{ fontSize: '1rem' }} />}
              sx={{
                borderRadius: '9999px',
                borderColor: '#FECACA',
                color: '#DC2626',
                bgcolor: '#FEF2F2',
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.82rem',
                py: 1,
                '&:hover': {
                  borderColor: '#DC2626',
                  bgcolor: '#FEE2E2',
                },
              }}
            >
              Unassign from Institute
            </Button>
          )}

          <Button
            fullWidth
            variant="outlined"
            onClick={() => {
              toast.success(`Secure password reset instructions dispatched to ${user.email}`, 'Reset Link Sent');
            }}
            startIcon={<LockResetRoundedIcon sx={{ fontSize: '1rem' }} />}
            sx={{
              borderRadius: '9999px',
              borderColor: '#CBD5E1',
              color: '#475569',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.82rem',
              py: 1,
              '&:hover': {
                borderColor: '#D97706',
                bgcolor: '#FFFBEB',
                color: '#D97706',
              },
            }}
          >
            Send Password Reset Link
          </Button>

          <Link href={`/superadmin/users/${user.id}`} passHref style={{ textDecoration: 'none' }}>
            <Button
              fullWidth
              variant="contained"
              endIcon={<FluidArrowRight size={18} />}
              sx={{
                borderRadius: '9999px',
                bgcolor: '#2563EB',
                py: 1.2,
                fontWeight: 700,
                textTransform: 'none',
                boxShadow: '0 4px 14px rgba(37,99,235,0.25)',
                '&:hover': { bgcolor: '#1D4ED8' },
              }}
            >
              Open Full User Profile & Security Logs
            </Button>
          </Link>
        </Box>
      </Box>
    </Drawer>
  );
}
