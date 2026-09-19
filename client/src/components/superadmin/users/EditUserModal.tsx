'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Select,
  MenuItem,
  InputAdornment,
  IconButton,
  Chip,
  CircularProgress,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import AlternateEmailRoundedIcon from '@mui/icons-material/AlternateEmailRounded';
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import { useToast } from '@/context/ToastContext';
import { useAppSelector } from '@/store/hooks';
import { apiService } from '@/lib/api-service';
import type { UserDirectoryEntity } from './UsersDirectoryClient';
import type { UserRole } from './CreateUserModal';

interface EditUserModalProps {
  open: boolean;
  onClose: () => void;
  user: UserDirectoryEntity | null;
  onUpdateSuccess: (updatedUser: Partial<UserDirectoryEntity> & { id: string }) => void;
}

export default function EditUserModal({
  open,
  onClose,
  user,
  onUpdateSuccess,
}: EditUserModalProps) {
  const toast = useToast();
  const currentUser = useAppSelector((state) => state.auth.user);
  const callerRole = (currentUser?.globalRole || (currentUser as any)?.role || '').toUpperCase();

  const allowedRoles: UserRole[] = React.useMemo(() => {
    if (callerRole === 'SUPER_ADMIN') {
      return ['SUPER_ADMIN', 'COLLEGE_ADMIN', 'FACULTY', 'STUDENT', 'RECRUITER'];
    }
    if (callerRole === 'PLATFORM_ADMIN') {
      return ['COLLEGE_ADMIN', 'FACULTY', 'STUDENT', 'RECRUITER'];
    }
    if (callerRole === 'COLLEGE_ADMIN' || callerRole === 'INSTITUTION_ADMIN') {
      return ['FACULTY', 'STUDENT', 'RECRUITER'];
    }
    if (callerRole === 'FACULTY') {
      return ['STUDENT'];
    }
    return ['STUDENT'];
  }, [callerRole]);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [handle, setHandle] = useState('');
  const [role, setRole] = useState<UserRole>('FACULTY');
  const [status, setStatus] = useState<'Active' | 'Invited' | 'Suspended'>('Active');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setHandle(user.handle || '');
      setRole(user.role || 'FACULTY');
      setStatus(user.status || 'Active');
      setPassword('');
      setShowPassword(false);
    }
  }, [user]);

  const borderColor = '#E2E8F0';

  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*';
    const randomArray = new Uint32Array(14);
    if (typeof window !== 'undefined' && window.crypto) {
      window.crypto.getRandomValues(randomArray);
    }
    let result = '';
    for (let i = 0; i < 14; i++) {
      result += chars.charAt(randomArray[i] % chars.length);
    }
    setPassword(result);
    setShowPassword(true);
    toast.info('Generated strong temporary password.', 'Password Generated');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!name.trim()) {
      toast.error('Full Name is required', 'Validation Error');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      toast.error('A valid email address is required', 'Validation Error');
      return;
    }

    try {
      setLoading(true);

      const statusMap: Record<string, string> = {
        Active: 'ACTIVE',
        Invited: 'INVITED',
        Suspended: 'SUSPENDED',
      };

      const payload: Record<string, any> = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        globalRole: role,
        status: statusMap[status] || 'ACTIVE',
      };

      if (handle.trim()) {
        payload.handle = handle.trim();
        payload.username = handle.trim();
        payload.rollNo = handle.trim();
      }

      if (password.trim()) {
        payload.password = password.trim();
      }

      await apiService.updateUser(user.id, payload);

      toast.success(`User details for ${name.trim()} successfully updated.`, 'User Updated');

      onUpdateSuccess({
        id: user.id,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        handle: handle.trim() || user.handle,
        role,
        status,
      });

      onClose();
    } catch (err: any) {
      console.error('Failed to update user:', err);
      toast.error(err.message || 'Failed to update user profile.', 'Update Failed');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog
      open={open}
      onClose={() => !loading && onClose()}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: '24px',
            bgcolor: '#FFFFFF',
            border: `1px solid ${borderColor}`,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            p: 1,
            overflow: 'hidden',
          },
        },
      }}
    >
      <form onSubmit={handleSubmit}>
        {/* Header */}
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pb: 1.5,
            pt: 2,
            px: 3,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '12px',
                bgcolor: '#EFF6FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563EB',
                border: '1px solid #DBEAFE',
              }}
            >
              <EditRoundedIcon />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.2rem', lineHeight: 1.2 }}>
                Edit User Details
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 500 }}>
                Update identity, platform permissions, and access status for @{user.handle}
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={onClose}
            disabled={loading}
            size="small"
            sx={{
              color: '#94A3B8',
              borderRadius: '9999px',
              '&:hover': { bgcolor: '#F1F5F9', color: '#0F172A' },
            }}
          >
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        {/* Content */}
        <DialogContent sx={{ px: 3, py: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Identity Group: Name & Handle */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1.2fr 1fr' }, gap: 2 }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, mb: 0.8, display: 'block' }}>
                  FULL NAME *
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Jane Smith"
                  required
                  disabled={loading}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <BadgeRoundedIcon sx={{ color: '#94A3B8', fontSize: 18 }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      bgcolor: '#F8FAFC',
                      fontSize: '0.88rem',
                      '& fieldset': { borderColor },
                      '&:hover fieldset': { borderColor: '#CBD5E1' },
                      '&.Mui-focused fieldset': { borderColor: '#2563EB' },
                    },
                  }}
                />
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, mb: 0.8, display: 'block' }}>
                  HANDLE / USERNAME
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  placeholder="janesmith"
                  disabled={loading}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <AlternateEmailRoundedIcon sx={{ color: '#94A3B8', fontSize: 18 }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      bgcolor: '#F8FAFC',
                      fontSize: '0.88rem',
                      '& fieldset': { borderColor },
                      '&:hover fieldset': { borderColor: '#CBD5E1' },
                      '&.Mui-focused fieldset': { borderColor: '#2563EB' },
                    },
                  }}
                />
              </Box>
            </Box>

            {/* Email Address */}
            <Box>
              <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, mb: 0.8, display: 'block' }}>
                PRIMARY EMAIL ADDRESS *
              </Typography>
              <TextField
                fullWidth
                size="small"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@university.edu"
                required
                disabled={loading}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailRoundedIcon sx={{ color: '#94A3B8', fontSize: 18 }} />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    bgcolor: '#F8FAFC',
                    fontSize: '0.88rem',
                    '& fieldset': { borderColor },
                    '&:hover fieldset': { borderColor: '#CBD5E1' },
                    '&.Mui-focused fieldset': { borderColor: '#2563EB' },
                  },
                }}
              />
            </Box>

            {/* Role and Status Grid */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              {/* Global Role Select */}
              <Box>
                <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, mb: 0.8, display: 'block' }}>
                  PLATFORM ROLE *
                </Typography>
                <Select
                  fullWidth
                  size="small"
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  disabled={loading}
                  startAdornment={
                    <InputAdornment position="start">
                      <AdminPanelSettingsRoundedIcon sx={{ color: '#94A3B8', fontSize: 18 }} />
                    </InputAdornment>
                  }
                  sx={{
                    borderRadius: '12px',
                    bgcolor: '#F8FAFC',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    '& .MuiOutlinedInput-notchedOutline': { borderColor },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#CBD5E1' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#2563EB' },
                  }}
                >
                  {allowedRoles.map((r) => (
                    <MenuItem key={r} value={r} sx={{ fontSize: '0.85rem' }}>
                      {r === 'COLLEGE_ADMIN' ? 'Institute Admin' : r.replace('_', ' ')}
                    </MenuItem>
                  ))}
                </Select>
              </Box>

              {/* Account Status Select */}
              <Box>
                <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, mb: 0.8, display: 'block' }}>
                  ACCOUNT STATUS *
                </Typography>
                <Select
                  fullWidth
                  size="small"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  disabled={loading}
                  sx={{
                    borderRadius: '12px',
                    bgcolor: '#F8FAFC',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    '& .MuiOutlinedInput-notchedOutline': { borderColor },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#CBD5E1' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#2563EB' },
                  }}
                >
                  <MenuItem value="Active" sx={{ fontSize: '0.85rem' }}>
                    <Chip label="Active" size="small" sx={{ bgcolor: '#F0FDF4', color: '#16A34A', fontWeight: 700, height: 22 }} />
                  </MenuItem>
                  <MenuItem value="Invited" sx={{ fontSize: '0.85rem' }}>
                    <Chip label="Invited" size="small" sx={{ bgcolor: '#FFFBEB', color: '#D97706', fontWeight: 700, height: 22 }} />
                  </MenuItem>
                  <MenuItem value="Suspended" sx={{ fontSize: '0.85rem' }}>
                    <Chip label="Suspended" size="small" sx={{ bgcolor: '#FEF2F2', color: '#DC2626', fontWeight: 700, height: 22 }} />
                  </MenuItem>
                </Select>
              </Box>
            </Box>

            {/* Optional Password Reset / Overwrite */}
            <Box sx={{ p: 2, borderRadius: '16px', bgcolor: '#F8FAFC', border: '1px dashed #CBD5E1' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LockRoundedIcon sx={{ fontSize: 18, color: '#64748B' }} />
                  <Typography variant="caption" sx={{ color: '#334155', fontWeight: 700 }}>
                    SET NEW PASSWORD (OPTIONAL)
                  </Typography>
                </Box>
                <Button
                  size="small"
                  onClick={handleGeneratePassword}
                  startIcon={<AutorenewRoundedIcon sx={{ fontSize: '0.85rem' }} />}
                  sx={{
                    fontSize: '0.72rem',
                    color: '#2563EB',
                    textTransform: 'none',
                    fontWeight: 700,
                    p: 0,
                    '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
                  }}
                >
                  Generate Strong
                </Button>
              </Box>

              <TextField
                fullWidth
                size="small"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank to keep existing password"
                disabled={loading}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size="small"
                          sx={{ color: '#94A3B8' }}
                        >
                          {showPassword ? <VisibilityOffRoundedIcon fontSize="small" /> : <VisibilityRoundedIcon fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '10px',
                    bgcolor: '#FFFFFF',
                    fontSize: '0.85rem',
                    '& fieldset': { borderColor: '#E2E8F0' },
                    '&:hover fieldset': { borderColor: '#CBD5E1' },
                    '&.Mui-focused fieldset': { borderColor: '#2563EB' },
                  },
                }}
              />
              <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.72rem', mt: 0.5, display: 'block' }}>
                Only enter a value if you wish to override the user's current password credentials.
              </Typography>
            </Box>
          </Box>
        </DialogContent>

        {/* Footer Actions */}
        <DialogActions
          sx={{
            px: 3,
            py: 2,
            borderTop: `1px solid ${borderColor}`,
            bgcolor: '#F8FAFC',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <Button
            onClick={onClose}
            disabled={loading}
            variant="outlined"
            sx={{
              borderRadius: '9999px',
              borderColor: '#CBD5E1',
              color: '#475569',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.85rem',
              px: 2.5,
              '&:hover': { borderColor: '#94A3B8', bgcolor: '#F1F5F9' },
            }}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={loading}
            variant="contained"
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <CheckCircleOutlineRoundedIcon />}
            sx={{
              borderRadius: '9999px',
              bgcolor: '#2563EB',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.85rem',
              px: 3,
              boxShadow: '0 4px 14px rgba(37,99,235,0.25)',
              '&:hover': { bgcolor: '#1D4ED8' },
            }}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
