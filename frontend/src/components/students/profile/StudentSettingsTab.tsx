'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  IconButton,
  Alert,
  LinearProgress,
} from '@mui/material';
import LockResetRoundedIcon from '@mui/icons-material/LockResetRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { useToast } from '@/context/ToastContext';
import { apiService } from '@/lib/api-service';

export default function StudentSettingsTab() {
  const toast = useToast();

  // 2FA state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Load 2FA status
  React.useEffect(() => {
    let isMounted = true;
    apiService.getProfile()
      .then((profile) => {
        if (isMounted && profile?.twoFactorEnabled !== undefined) {
          setTwoFactorEnabled(Boolean(profile.twoFactorEnabled));
        }
      })
      .catch((err) => {
        console.warn('Could not fetch 2FA status:', err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Password change modal state
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Email notifications state
  const [emailContests, setEmailContests] = useState(true);
  const [emailCourses, setEmailCourses] = useState(true);

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: '#E2E8F0' };
    let score = 0;
    if (pass.length >= 8) score += 25;
    if (pass.length >= 12) score += 25;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 25;
    if (/[0-9]/.test(pass) && /[^A-Za-z0-9]/.test(pass)) score += 25;

    if (score <= 25) return { score, label: 'Weak', color: '#EF4444' };
    if (score <= 50) return { score, label: 'Fair', color: '#F59E0B' };
    if (score <= 75) return { score, label: 'Good', color: '#3B82F6' };
    return { score, label: 'Strong', color: '#16A34A' };
  };

  const handlePasswordSubmit = async () => {
    setPasswordError(null);
    if (!currentPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    setIsChangingPassword(true);
    try {
      await apiService.changePassword(currentPassword, newPassword);
      setPasswordModalOpen(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Your student account password was changed securely.', 'Security Updated');
    } catch (err: any) {
      setPasswordError(err?.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 3 }}>
      {/* 1. Account Credentials & Security Card */}
      <Card
        elevation={0}
        sx={{
          borderRadius: '20px',
          border: '1px solid #E2E8F0',
          bgcolor: '#FFFFFF',
          p: 3.5,
          boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 2 }}>
          <Box sx={{ p: 1, borderRadius: '10px', bgcolor: '#EFF6FF', color: '#2563EB', display: 'flex' }}>
            <SecurityRoundedIcon fontSize="small" />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.1rem' }}>
            Account Credentials & Security
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5, borderBottom: '1px solid #F1F5F9' }}>
            <Box>
              <Typography sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.9rem' }}>Two-Factor Authentication (2FA)</Typography>
              <Typography variant="caption" sx={{ color: '#64748B' }}>Time-based TOTP authenticator protection</Typography>
            </Box>
            <Chip
              label={twoFactorEnabled ? 'Active • Protected' : 'Not enabled'}
              size="small"
              sx={{
                bgcolor: twoFactorEnabled ? '#F0FDF4' : '#F8FAFC',
                color: twoFactorEnabled ? '#16A34A' : '#64748B',
                fontWeight: 700,
                border: twoFactorEnabled ? '1px solid #BBF7D0' : '1px solid #E2E8F0',
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5, borderBottom: '1px solid #F1F5F9' }}>
            <Box>
              <Typography sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.9rem' }}>Account Password</Typography>
              <Typography variant="caption" sx={{ color: '#64748B' }}>High-security bcrypt hashing (12 rounds)</Typography>
            </Box>
            <Button
              variant="outlined"
              size="small"
              startIcon={<LockResetRoundedIcon />}
              onClick={() => {
                setPasswordError(null);
                setPasswordModalOpen(true);
              }}
              sx={{
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 700,
                color: '#2563EB',
                borderColor: '#BFDBFE',
                '&:hover': { bgcolor: '#EFF6FF', borderColor: '#93C5FD' },
              }}
            >
              Change Password
            </Button>
          </Box>
        </Box>
      </Card>

      {/* 2. Notification Preferences Card */}
      <Card
        elevation={0}
        sx={{
          borderRadius: '20px',
          border: '1px solid #E2E8F0',
          bgcolor: '#FFFFFF',
          p: 3.5,
          boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.1rem' }}>
            Notification Preferences
          </Typography>
          <Chip label="Coming Soon" size="small" sx={{ bgcolor: '#F1F5F9', color: '#64748B', fontWeight: 600, fontSize: '0.72rem' }} />
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography sx={{ color: '#64748B', fontSize: '0.88rem', lineHeight: 1.6 }}>
            Stay updated with real-time alerts on upcoming weekly contests, module completion certificates, and platform leaderboard updates.
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.25, borderRadius: '10px', bgcolor: '#F8FAFC' }}>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Contest Reminders & Starts</Typography>
              <Button
                size="small"
                disabled
                variant={emailContests ? 'contained' : 'outlined'}
                onClick={() => setEmailContests(!emailContests)}
                sx={{ textTransform: 'none', borderRadius: '6px', fontSize: '0.78rem', bgcolor: emailContests ? '#2563EB' : 'transparent' }}
              >
                {emailContests ? 'Enabled' : 'Disabled'}
              </Button>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.25, borderRadius: '10px', bgcolor: '#F8FAFC' }}>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Course & Lesson Milestone Alerts</Typography>
              <Button
                size="small"
                disabled
                variant={emailCourses ? 'contained' : 'outlined'}
                onClick={() => setEmailCourses(!emailCourses)}
                sx={{ textTransform: 'none', borderRadius: '6px', fontSize: '0.78rem', bgcolor: emailCourses ? '#2563EB' : 'transparent' }}
              >
                {emailCourses ? 'Enabled' : 'Disabled'}
              </Button>
            </Box>
          </Box>

          <Button
            variant="contained"
            disabled
            sx={{
              bgcolor: '#94A3B8',
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 700,
              mt: 2,
              alignSelf: 'flex-start',
            }}
          >
            Save Preferences (Coming Soon)
          </Button>
        </Box>
      </Card>

      {/* Change Password Dialog Modal */}
      <Dialog
        open={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        slotProps={{
          paper: {
            sx: {
              borderRadius: '24px',
              maxWidth: 480,
              width: '100%',
              p: 1.5,
              bgcolor: '#FFFFFF',
              boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
              border: '1px solid #E2E8F0',
            },
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ p: 1, borderRadius: '12px', bgcolor: '#EFF6FF', color: '#2563EB', display: 'flex' }}>
              <LockResetRoundedIcon />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.1rem' }}>
                Change Password
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B' }}>
                Update your student account security credentials
              </Typography>
            </Box>
          </Box>

          <IconButton size="small" onClick={() => setPasswordModalOpen(false)} sx={{ color: '#94A3B8' }}>
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, px: 3.5, pt: '28px !important', pb: 3 }}>
          {passwordError && (
            <Alert severity="error" sx={{ borderRadius: '12px', fontSize: '0.82rem' }}>
              {passwordError}
            </Alert>
          )}

          {/* Current Password */}
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155', mb: 0.5, display: 'block' }}>
              Current Password
            </Typography>
            <TextField
              fullWidth
              size="small"
              type={showCurrentPassword ? 'text' : 'password'}
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              slotProps={{
                input: {
                  sx: { borderRadius: '10px', fontSize: '0.88rem' },
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setShowCurrentPassword(!showCurrentPassword)} edge="end">
                        {showCurrentPassword ? <VisibilityOffRoundedIcon fontSize="small" /> : <VisibilityRoundedIcon fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Box>

          {/* New Password */}
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155', mb: 0.5, display: 'block' }}>
              New Password
            </Typography>
            <TextField
              fullWidth
              size="small"
              type={showNewPassword ? 'text' : 'password'}
              placeholder="Minimum 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              slotProps={{
                input: {
                  sx: { borderRadius: '10px', fontSize: '0.88rem' },
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setShowNewPassword(!showNewPassword)} edge="end">
                        {showNewPassword ? <VisibilityOffRoundedIcon fontSize="small" /> : <VisibilityRoundedIcon fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />

            {/* Password Strength Meter */}
            {newPassword && (
              <Box sx={{ mt: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.72rem' }}>
                    Password Strength:
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.72rem',
                      color: getPasswordStrength(newPassword).color,
                    }}
                  >
                    {getPasswordStrength(newPassword).label}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={getPasswordStrength(newPassword).score}
                  sx={{
                    height: 5,
                    borderRadius: 3,
                    bgcolor: '#F1F5F9',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: getPasswordStrength(newPassword).color,
                      borderRadius: 3,
                    },
                  }}
                />
              </Box>
            )}
          </Box>

          {/* Confirm Password */}
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155', mb: 0.5, display: 'block' }}>
              Confirm New Password
            </Typography>
            <TextField
              fullWidth
              size="small"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Re-type new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              slotProps={{
                input: {
                  sx: { borderRadius: '10px', fontSize: '0.88rem' },
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                        {showConfirmPassword ? <VisibilityOffRoundedIcon fontSize="small" /> : <VisibilityRoundedIcon fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            {confirmPassword && newPassword === confirmPassword && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                <CheckCircleRoundedIcon sx={{ fontSize: 13, color: '#16A34A' }} />
                <Typography variant="caption" sx={{ color: '#16A34A', fontWeight: 600, fontSize: '0.74rem' }}>
                  Passwords match
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2, pt: 1, gap: 1 }}>
          <Button
            onClick={() => setPasswordModalOpen(false)}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              color: '#64748B',
              borderRadius: '8px',
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            disabled={isChangingPassword}
            onClick={handlePasswordSubmit}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              bgcolor: '#2563EB',
              borderRadius: '8px',
              px: 2.5,
              '&:hover': { bgcolor: '#1D4ED8' },
            }}
          >
            {isChangingPassword ? 'Updating...' : 'Update Password'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
