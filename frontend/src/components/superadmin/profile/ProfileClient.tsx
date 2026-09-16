'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { usePolling } from '@/utils/usePolling';
import {
  Box,
  Typography,
  Avatar,
  Paper,
  Tooltip,
  Button,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  IconButton,
  LinearProgress,
} from '@mui/material';
import CurvedSidebar from '@/components/superadmin/layout/CurvedSidebar';
import Navbar from '@/components/superadmin/layout/Navbar';
import { useToast } from '@/context/ToastContext';
import { apiService } from '@/lib/api-service';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { setUser } from '@/store/slices/authSlice';
import {
  FaInstagram,
  FaFacebookF,
  FaTwitter,
  FaGithub,
  FaLinkedinIn,
  FaTelegram,
  FaShieldHalved,
  FaPenToSquare,
  FaKey,
  FaClockRotateLeft,
  FaCircleCheck,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaBuildingColumns,
  FaTrophy,
  FaCode,
  FaServer,
  FaXmark,
  FaCheck,
} from 'react-icons/fa6';

interface ProfileProps {
  name?: string;
  username?: string;
  role?: string;
  email?: string;
  school?: string;
  phone?: string;
  birthDate?: string;
  registrationDate?: string;
  location?: string;
  adminId?: string;
  department?: string;
  accessLevel?: string;
  twoFactorStatus?: string;
  timezone?: string;
  systemStatus?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  collegesCount?: number;
  contestsCount?: number;
  submissionsCount?: number;
  uptimePercentage?: string;
}

export default function ProfileClient({
  name: propName,
  username: propUsername,
  role: propRole,
  email: propEmail,
  school: propSchool,
  phone: propPhone,
  birthDate: propBirthDate,
  registrationDate: propRegistrationDate,
  location: propLocation,
  adminId: propAdminId,
  department: propDepartment,
  accessLevel: propAccessLevel,
  twoFactorStatus: propTwoFactorStatus,
  timezone: propTimezone,
  systemStatus: propSystemStatus,
  avatarUrl: propAvatarUrl,
  bannerUrl: propBannerUrl,
}: ProfileProps) {
  const router = useRouter();
  const toast = useToast();
  const dispatch = useDispatch();
  const authUser = useSelector((state: RootState) => state.auth.user);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastSeverity, setToastSeverity] = useState<'success' | 'info' | 'error'>('info');

  const getDerivedProfile = (user: any) => ({
    name: user?.name || propName || 'System Administrator',
    username: user?.rollNo || user?.handle || (user?.email ? user.email.split('@')[0] : (propUsername || 'admin')),
    role: user?.globalRole === 'SUPER_ADMIN' ? 'Super Admin' : (user?.globalRole || propRole || 'Super Admin'),
    email: user?.email || propEmail || 'admin@codeplatform.io',
    school: user?.institution || propSchool || 'CodePlatform Global Command',
    phone: user?.phone ?? propPhone ?? '+1 (555) 019-2834',
    birthDate: user?.birthDate || propBirthDate || '—',
    registrationDate: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : (propRegistrationDate || 'Active Session'),
    location: user?.location || propLocation || 'Global Operations',
    adminId: user?.id ? `ADM-${user.id.slice(0, 8).toUpperCase()}` : (propAdminId || 'ADM-ROOT-01'),
    department: user?.department || propDepartment || 'Platform Operations & Infrastructure',
    accessLevel: user?.globalRole === 'SUPER_ADMIN' ? 'Tier 0 Root Admin (Global)' : (propAccessLevel || 'Platform Admin'),
    twoFactorStatus: user?.twoFactorEnabled !== undefined ? (user.twoFactorEnabled ? 'TOTP Enabled' : 'Disabled') : (propTwoFactorStatus ?? 'TOTP Enabled'),
    timezone: propTimezone || (typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC'),
    systemStatus: propSystemStatus || 'Active • Production Cluster',
    avatarUrl: user?.avatarUrl || propAvatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    bannerUrl: user?.bannerUrl || propBannerUrl || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1600&auto=format&fit=crop&q=80',
  });

  // Interactive Profile State
  const [profile, setProfile] = useState(getDerivedProfile(authUser));

  useEffect(() => {
    if (authUser) {
      setProfile(getDerivedProfile(authUser));
    }
  }, [authUser]);

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [liveAuditLogs, setLiveAuditLogs] = useState<any[]>([]);
  const [liveMetrics, setLiveMetrics] = useState<any>(null);

  const fetchAdminLiveData = useCallback(async () => {
    const [metricsResult, logsResult] = await Promise.allSettled([
      apiService.getAdminMetrics(),
      apiService.getAdminAuditLogs(),
    ]);

    let metrics = null;
    if (metricsResult.status === 'fulfilled' && metricsResult.value) {
      metrics = metricsResult.value;
      setLiveMetrics(metrics);
    } else if (metricsResult.status === 'rejected') {
      console.warn('Failed to fetch admin metrics:', metricsResult.reason);
    }

    let logs = null;
    if (logsResult.status === 'fulfilled' && Array.isArray(logsResult.value)) {
      logs = logsResult.value;
      setLiveAuditLogs(logs);
    } else if (logsResult.status === 'rejected') {
      console.warn('Failed to fetch admin audit logs:', logsResult.reason);
    }

    return { metrics, logs };
  }, []);

  usePolling(fetchAdminLiveData, {
    intervalMs: 20000,
    pauseOnHidden: true,
    revalidateOnFocus: true,
  });

  // Edit Profile Dialog State
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({ ...profile });

  const handleOpenEditDialog = () => {
    setEditForm({ ...profile });
    setEditDialogOpen(true);
  };

  const handleSaveProfile = async () => {
    if (!editForm.name.trim()) {
      toast.error('Name cannot be empty.', 'Validation Error');
      return;
    }
    setIsSavingProfile(true);
    try {
      if (authUser?.id) {
        const updated = await apiService.updateUser(authUser.id, {
          name: editForm.name,
          email: editForm.email,
          phone: editForm.phone,
          location: editForm.location,
          institution: editForm.school,
          department: editForm.department,
          avatarUrl: editForm.avatarUrl,
          birthDate: editForm.birthDate,
          rollNo: editForm.username,
        });
        if (updated) {
          dispatch(setUser({
            ...authUser,
            ...updated,
            name: editForm.name,
            email: editForm.email,
            phone: editForm.phone,
            location: editForm.location,
            institution: editForm.school,
            department: editForm.department,
            avatarUrl: editForm.avatarUrl,
            birthDate: editForm.birthDate,
            rollNo: editForm.username,
            handle: editForm.username,
          }));
        }
      }
      setProfile({ ...editForm });
      setEditDialogOpen(false);
      toast.success('Super Admin profile updated successfully!', 'Profile Settings');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update profile', 'Update Failed');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Change Password Dialog State
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Password strength calculator
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
      setPasswordDialogOpen(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Your account password was changed securely.', 'Security Updated');
    } catch (err: any) {
      setPasswordError(err?.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
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
      {/* 1. Left Curved Sidebar */}
      <CurvedSidebar />

      {/* 2. Main Workspace Layout matching other platform pages */}
      <Box component="main" sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Standard Unified 1400px Max-Width Layout Container matching all other pages */}
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

          {/* Profile Section Container */}
          <Box sx={{ width: '100%', position: 'relative' }}>
            {/* Landscape Cover Banner */}
            <Box
              sx={{
                width: '100%',
                height: { xs: '200px', sm: '260px', md: '300px' },
                borderRadius: '24px',
                overflow: 'hidden',
                position: 'relative',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06)',
                border: '1px solid #E2E8F0',
                backgroundImage: `url(${profile.bannerUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                bgcolor: '#0F172A',
              }}
            >
              {/* Soft Ambient Overlay */}
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.2) 0%, rgba(15, 23, 42, 0.4) 100%)',
                }}
              />
            </Box>

            {/* Centered Floating Profile Card */}
            <Paper
              elevation={0}
              sx={{
                width: '94%',
                maxWidth: '1040px',
                mx: 'auto',
                mt: { xs: '-65px', sm: '-75px', md: '-85px' },
                borderRadius: '24px',
                bgcolor: '#FFFFFF',
                boxShadow: '0 20px 45px -12px rgba(15, 23, 42, 0.12)',
                border: '1px solid #E2E8F0',
                position: 'relative',
                overflow: 'visible',
              }}
            >
              {/* Centered Overlapping Circular Avatar */}
              <Box
                sx={{
                  position: 'absolute',
                  top: { xs: '-55px', sm: '-65px', md: '-70px' },
                  left: '50%',
                  transform: 'translateX(-50%)',
                  zIndex: 10,
                }}
              >
                <Avatar
                  src={profile.avatarUrl}
                  alt={profile.name}
                  sx={{
                    width: { xs: 110, sm: 130, md: 140 },
                    height: { xs: 110, sm: 130, md: 140 },
                    border: '5px solid #FFFFFF',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.14)',
                    bgcolor: '#F3F4F6',
                  }}
                />
              </Box>

              {/* Top Left Role Chip & Top Right Username */}
              <Box sx={{ pt: 3, px: { xs: 3, sm: 5 }, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box
                  sx={{
                    border: '1.5px solid #BFDBFE',
                    color: '#2563EB',
                    bgcolor: '#EFF6FF',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    borderRadius: '8px',
                    px: 1.75,
                    py: 0.4,
                    display: 'inline-block',
                    letterSpacing: '0.02em',
                  }}
                >
                  {profile.role}
                </Box>

                <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600, fontSize: '0.85rem' }}>
                  @{profile.username}
                </Typography>
              </Box>

              {/* Centered Name & Theme Blue Accent Bar */}
              <Box sx={{ pt: { xs: 2.5, sm: 3 }, pb: 2.5, px: 3, textAlign: 'center' }}>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    color: '#0F172A',
                    fontSize: { xs: '1.75rem', sm: '2.25rem' },
                    letterSpacing: '-0.02em',
                    lineHeight: 1.2,
                    whiteSpace: 'pre-line',
                  }}
                >
                  {profile.name}
                </Typography>

                {/* Theme Blue Horizontal Accent Bar */}
                <Box
                  sx={{
                    width: 52,
                    height: 4,
                    background: 'linear-gradient(90deg, #2563EB, #3B82F6)',
                    borderRadius: 2,
                    mx: 'auto',
                    mt: 1.5,
                  }}
                />
              </Box>

              {/* Key Information Summary Grid (Option 2: Extended Admin Identity & Security) */}
              <Box
                sx={{
                  px: { xs: 3, sm: 5, md: 6 },
                  pt: 1,
                  pb: 2.5,
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  columnGap: 5,
                  rowGap: 1.75,
                  bgcolor: '#FFFFFF',
                }}
              >
                {/* 1. Admin ID */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 0.75, borderBottom: '1px solid #F1F5F9' }}>
                  <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 500, fontSize: '0.86rem' }}>
                    Admin ID:
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#0F172A', fontWeight: 700, fontSize: '0.86rem', fontFamily: 'monospace' }}>
                    {profile.adminId}
                  </Typography>
                </Box>

                {/* 2. Access Privilege */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 0.75, borderBottom: '1px solid #F1F5F9' }}>
                  <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 500, fontSize: '0.86rem' }}>
                    Access Level:
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#2563EB', fontWeight: 700, fontSize: '0.86rem' }}>
                    {profile.accessLevel}
                  </Typography>
                </Box>

                {/* 3. Department */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 0.75, borderBottom: '1px solid #F1F5F9' }}>
                  <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 500, fontSize: '0.86rem' }}>
                    Department:
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#0F172A', fontWeight: 700, fontSize: '0.86rem' }}>
                    {profile.department}
                  </Typography>
                </Box>

                {/* 4. Two-Factor Authentication */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 0.75, borderBottom: '1px solid #F1F5F9' }}>
                  <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 500, fontSize: '0.86rem' }}>
                    2FA Security:
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <FaCircleCheck size={12} color="#16A34A" />
                    <Typography variant="body2" sx={{ color: '#16A34A', fontWeight: 700, fontSize: '0.86rem' }}>
                      {profile.twoFactorStatus}
                    </Typography>
                  </Box>
                </Box>

                {/* 5. Registration Date */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 0.75, borderBottom: '1px solid #F1F5F9' }}>
                  <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 500, fontSize: '0.86rem' }}>
                    Registration Date:
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#0F172A', fontWeight: 700, fontSize: '0.86rem' }}>
                    {profile.registrationDate}
                  </Typography>
                </Box>

                {/* 6. Date of Birth */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 0.75, borderBottom: '1px solid #F1F5F9' }}>
                  <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 500, fontSize: '0.86rem' }}>
                    Date of Birth:
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#0F172A', fontWeight: 700, fontSize: '0.86rem' }}>
                    {profile.birthDate}
                  </Typography>
                </Box>

                {/* 7. Phone */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 0.75, borderBottom: '1px solid #F1F5F9' }}>
                  <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 500, fontSize: '0.86rem' }}>
                    Phone:
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#0F172A', fontWeight: 700, fontSize: '0.86rem' }}>
                    {profile.phone}
                  </Typography>
                </Box>

                {/* 8. City / State */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 0.75, borderBottom: '1px solid #F1F5F9' }}>
                  <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 500, fontSize: '0.86rem' }}>
                    City / State:
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#0F172A', fontWeight: 700, fontSize: '0.86rem' }}>
                    {profile.location}
                  </Typography>
                </Box>

                {/* 9. Timezone */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 0.75, borderBottom: '1px solid #F1F5F9' }}>
                  <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 500, fontSize: '0.86rem' }}>
                    Timezone:
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#0F172A', fontWeight: 700, fontSize: '0.86rem' }}>
                    {profile.timezone}
                  </Typography>
                </Box>

                {/* 10. System Status */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 0.75, borderBottom: '1px solid #F1F5F9' }}>
                  <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 500, fontSize: '0.86rem' }}>
                    System Status:
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#0F172A', fontWeight: 700, fontSize: '0.86rem' }}>
                    {profile.systemStatus}
                  </Typography>
                </Box>
              </Box>

              {/* Quick Admin Shortcuts & Actions Bar */}
              <Box
                sx={{
                  mx: { xs: 3, sm: 5, md: 6 },
                  mb: 3,
                  p: 1.5,
                  borderRadius: '16px',
                  bgcolor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 1.5,
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pl: 0.5 }}>
                  <FaShieldHalved size={15} color="#2563EB" />
                  <Typography variant="subtitle2" sx={{ color: '#0F172A', fontWeight: 700, fontSize: '0.84rem' }}>
                    Admin Controls
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<FaPenToSquare size={13} />}
                    onClick={handleOpenEditDialog}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: '0.78rem',
                      color: '#0F172A',
                      borderColor: '#CBD5E1',
                      borderRadius: '8px',
                      bgcolor: '#FFFFFF',
                      '&:hover': {
                        bgcolor: '#F1F5F9',
                        borderColor: '#94A3B8',
                      },
                    }}
                  >
                    Edit Details
                  </Button>

                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<FaLock size={12} />}
                    onClick={() => setPasswordDialogOpen(true)}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: '0.78rem',
                      color: '#D97706',
                      borderColor: '#FDE68A',
                      borderRadius: '8px',
                      bgcolor: '#FFFBEB',
                      '&:hover': {
                        bgcolor: '#FEF3C7',
                        borderColor: '#FCD34D',
                      },
                    }}
                  >
                    Change Password
                  </Button>

                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<FaKey size={13} />}
                    onClick={() => router.push('/superadmin/settings')}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: '0.78rem',
                      color: '#2563EB',
                      borderColor: '#BFDBFE',
                      borderRadius: '8px',
                      bgcolor: '#EFF6FF',
                      '&:hover': {
                        bgcolor: '#DBEAFE',
                        borderColor: '#93C5FD',
                      },
                    }}
                  >
                    Security & 2FA
                  </Button>

                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<FaClockRotateLeft size={13} />}
                    onClick={() => router.push('/superadmin/analytics')}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      bgcolor: '#0F172A',
                      color: '#FFFFFF',
                      borderRadius: '8px',
                      boxShadow: 'none',
                      '&:hover': {
                        bgcolor: '#2563EB',
                        boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                      },
                    }}
                  >
                    Audit Logs
                  </Button>
                </Box>
              </Box>

              {/* Bottom Shaded Pastel Blue/Slate Theme Footer */}
              <Box
                sx={{
                  bgcolor: '#EFF6FF',
                  borderTop: '1px solid #DBEAFE',
                  borderRadius: '0 0 24px 24px',
                  px: { xs: 3, sm: 5, md: 6 },
                  py: 2.4,
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  justifyContent: 'space-between',
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  gap: 2,
                }}
              >
                {/* Left Details: Email & Institution */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                    <Typography variant="body2" sx={{ color: '#475569', fontWeight: 700, fontSize: '0.86rem' }}>
                      Email:
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#0F172A', fontWeight: 600, fontSize: '0.86rem' }}>
                      {profile.email}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                    <Typography variant="body2" sx={{ color: '#475569', fontWeight: 700, fontSize: '0.86rem' }}>
                      Institution:
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#0F172A', fontWeight: 600, fontSize: '0.86rem' }}>
                      {profile.school}
                    </Typography>
                  </Box>
                </Box>

                {/* Right Social Icons Row */}
                <Box sx={{ display: 'flex', gap: 1.25, alignItems: 'center' }}>
                  {[
                    { icon: <FaInstagram size={13} />, link: 'https://instagram.com', title: 'Instagram' },
                    { icon: <FaFacebookF size={12} />, link: 'https://facebook.com', title: 'Facebook' },
                    { icon: <FaTwitter size={12} />, link: 'https://twitter.com', title: 'Twitter' },
                    { icon: <FaGithub size={13} />, link: 'https://github.com', title: 'GitHub' },
                    { icon: <FaLinkedinIn size={12} />, link: 'https://linkedin.com', title: 'LinkedIn' },
                    { icon: <FaTelegram size={13} />, link: 'https://t.me', title: 'Telegram' },
                  ].map((social, idx) => (
                    <Tooltip key={idx} title={social.title}>
                      <Box
                        component="a"
                        href={social.link}
                        target="_blank"
                        rel="noreferrer"
                        sx={{
                          width: 34,
                          height: 34,
                          borderRadius: '50%',
                          bgcolor: '#0F172A',
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                          textDecoration: 'none',
                          '&:hover': {
                            bgcolor: '#2563EB',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.35)',
                          },
                        }}
                      >
                        {social.icon}
                      </Box>
                    </Tooltip>
                  ))}
                </Box>
              </Box>
            </Paper>

            {/* Recent Security & Activity Audit Log Card Below Profile */}
            <Paper
              elevation={0}
              sx={{
                width: '94%',
                maxWidth: '1040px',
                mx: 'auto',
                mt: 3.5,
                p: { xs: 2.5, sm: 3.5 },
                borderRadius: '24px',
                bgcolor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                boxShadow: '0 4px 20px -4px rgba(15, 23, 42, 0.05)',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, pb: 1.5, borderBottom: '1px solid #F1F5F9' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                  <Box sx={{ p: 1, borderRadius: '10px', bgcolor: '#EFF6FF', color: '#2563EB', display: 'flex' }}>
                    <FaClockRotateLeft size={16} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1rem' }}>
                      Recent Security & Administrative Activity
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748B' }}>
                      Audit log of privileged actions associated with {profile.name}
                    </Typography>
                  </Box>
                </Box>

                <Button
                  size="small"
                  onClick={() => router.push('/superadmin/analytics')}
                  sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.8rem', color: '#2563EB' }}
                >
                  View Full Audit Log →
                </Button>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {liveAuditLogs.length === 0 ? (
                  <Box sx={{ py: 3, textAlign: 'center' }}>
                    <Typography sx={{ color: '#64748B', fontSize: '0.88rem', fontWeight: 500 }}>
                      No recent audit log records available.
                    </Typography>
                  </Box>
                ) : (
                  liveAuditLogs.map((item: any, idx) => {
                    const timeStr = item.createdAt
                      ? new Date(item.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                      : 'Recent';
                    const isSuccess =
                      item.status?.toUpperCase() === 'SUCCESS' ||
                      item.status?.toUpperCase() === 'COMPLETED';
                    const color = isSuccess ? '#16A34A' : '#2563EB';
                    const badgeBg = isSuccess ? '#F0FDF4' : '#EFF6FF';

                    return (
                      <Box
                        key={item.id || idx}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          p: 1.5,
                          borderRadius: '12px',
                          bgcolor: '#F8FAFC',
                          border: '1px solid #F1F5F9',
                          transition: 'all 0.15s ease',
                          '&:hover': { bgcolor: '#F1F5F9' },
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color }} />
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.86rem' }}>
                              {item.action}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.78rem' }}>
                              {item.detail}
                            </Typography>
                          </Box>
                        </Box>

                        <Box sx={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 500, fontSize: '0.76rem' }}>
                            {timeStr}
                          </Typography>
                          <Box
                            sx={{
                              px: 1.25,
                              py: 0.3,
                              borderRadius: '6px',
                              bgcolor: badgeBg,
                              color: color,
                              fontWeight: 700,
                              fontSize: '0.72rem',
                            }}
                          >
                            {item.status}
                          </Box>
                        </Box>
                      </Box>
                    );
                  })
                )}
              </Box>
            </Paper>
          </Box>
        </Box>
      </Box>

      {/* Edit Profile Dialog Modal */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        slotProps={{
          paper: {
            sx: {
              borderRadius: '24px',
              maxWidth: 640,
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
              <FaPenToSquare size={18} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.15rem' }}>
                Edit Profile Details
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B' }}>
                Update Super Admin personal & operational information
              </Typography>
            </Box>
          </Box>

          <IconButton size="small" onClick={() => setEditDialogOpen(false)} sx={{ color: '#94A3B8' }}>
            <FaXmark size={16} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, px: 3.5, pt: '28px !important', pb: 3 }}>
          {/* 2-Column Input Grid */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            {/* Full Name */}
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155', mb: 0.5, display: 'block' }}>
                Full Name
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                slotProps={{ input: { sx: { borderRadius: '10px', fontSize: '0.88rem' } } }}
              />
            </Box>

            {/* Username */}
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155', mb: 0.5, display: 'block' }}>
                Username
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={editForm.username}
                onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                slotProps={{ input: { sx: { borderRadius: '10px', fontSize: '0.88rem' } } }}
              />
            </Box>

            {/* Email Address */}
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155', mb: 0.5, display: 'block' }}>
                Email Address
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                slotProps={{ input: { sx: { borderRadius: '10px', fontSize: '0.88rem' } } }}
              />
            </Box>

            {/* Phone */}
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155', mb: 0.5, display: 'block' }}>
                Phone Number
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                slotProps={{ input: { sx: { borderRadius: '10px', fontSize: '0.88rem' } } }}
              />
            </Box>

            {/* Date of Birth */}
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155', mb: 0.5, display: 'block' }}>
                Date of Birth
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={editForm.birthDate}
                onChange={(e) => setEditForm({ ...editForm, birthDate: e.target.value })}
                slotProps={{ input: { sx: { borderRadius: '10px', fontSize: '0.88rem' } } }}
              />
            </Box>

            {/* City / State */}
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155', mb: 0.5, display: 'block' }}>
                City / State
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={editForm.location}
                onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                slotProps={{ input: { sx: { borderRadius: '10px', fontSize: '0.88rem' } } }}
              />
            </Box>

            {/* Institution / College */}
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155', mb: 0.5, display: 'block' }}>
                Institution / Organization
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={editForm.school}
                onChange={(e) => setEditForm({ ...editForm, school: e.target.value })}
                slotProps={{ input: { sx: { borderRadius: '10px', fontSize: '0.88rem' } } }}
              />
            </Box>

            {/* Department */}
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155', mb: 0.5, display: 'block' }}>
                Department
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={editForm.department}
                onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                slotProps={{ input: { sx: { borderRadius: '10px', fontSize: '0.88rem' } } }}
              />
            </Box>
          </Box>

          {/* Avatar Image URL Preview */}
          <Box sx={{ mt: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155', mb: 0.5, display: 'block' }}>
              Avatar Image URL
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
              <Avatar src={editForm.avatarUrl} sx={{ width: 42, height: 42, border: '2px solid #E2E8F0' }} />
              <TextField
                fullWidth
                size="small"
                value={editForm.avatarUrl}
                onChange={(e) => setEditForm({ ...editForm, avatarUrl: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                slotProps={{ input: { sx: { borderRadius: '10px', fontSize: '0.84rem' } } }}
              />
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2, pt: 1, gap: 1 }}>
          <Button
            onClick={() => setEditDialogOpen(false)}
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
            onClick={handleSaveProfile}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              bgcolor: '#2563EB',
              borderRadius: '8px',
              px: 2.75,
              '&:hover': { bgcolor: '#1D4ED8' },
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Change Password Dialog Modal */}
      <Dialog
        open={passwordDialogOpen}
        onClose={() => setPasswordDialogOpen(false)}
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
            <Box sx={{ p: 1, borderRadius: '12px', bgcolor: '#FEF3C7', color: '#D97706', display: 'flex' }}>
              <FaLock size={18} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.1rem' }}>
                Change Password
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B' }}>
                Super Admin Security & Credential Update
              </Typography>
            </Box>
          </Box>

          <IconButton size="small" onClick={() => setPasswordDialogOpen(false)} sx={{ color: '#94A3B8' }}>
            <FaXmark size={16} />
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
                        {showCurrentPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
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
                        {showNewPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
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
                        {showConfirmPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            {confirmPassword && newPassword === confirmPassword && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                <FaCheck size={11} color="#16A34A" />
                <Typography variant="caption" sx={{ color: '#16A34A', fontWeight: 600, fontSize: '0.74rem' }}>
                  Passwords match
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2, pt: 1, gap: 1 }}>
          <Button
            onClick={() => setPasswordDialogOpen(false)}
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
            Update Password
          </Button>
        </DialogActions>
      </Dialog>

      {/* Action Feedback Snackbar */}
      <Snackbar
        open={Boolean(toastMessage)}
        autoHideDuration={3500}
        onClose={() => setToastMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setToastMessage(null)}
          severity={toastSeverity}
          sx={{
            bgcolor: toastSeverity === 'success' ? '#065F46' : '#0F172A',
            color: '#FFFFFF',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(15, 23, 42, 0.3)',
            '& .MuiAlert-icon': { color: toastSeverity === 'success' ? '#34D399' : '#60A5FA' },
          }}
        >
          {toastMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
