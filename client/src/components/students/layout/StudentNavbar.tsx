'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Popover,
  Divider,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

// Material Icons
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import LeaderboardRoundedIcon from '@mui/icons-material/LeaderboardRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import TerminalRoundedIcon from '@mui/icons-material/TerminalRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logoutUser } from '@/store/slices/authSlice';
import { apiService } from '@/lib/api-service';
import LogoutConfirmModal from '@/components/shared/LogoutConfirmModal';
import { SkillOSDockModal } from '@/components/students/skillos/SkillOSDock';
import { useNotifications } from '@/context/NotificationContext';

interface StudentNavbarProps {
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
  streakDays?: number;
  contestRating?: number;
  ratingTier?: string;
}

export default function StudentNavbar({
  searchQuery = '',
  onSearchChange = () => {},
  streakDays,
}: StudentNavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();

  const searchInputRef = useRef<HTMLInputElement>(null);
  const user = useAppSelector((state) => state.auth.user);
  const [activeUser, setActiveUser] = useState(user);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  // Dropdown states
  const [exploreAnchor, setExploreAnchor] = useState<null | HTMLElement>(null);
  const isExploreOpen = Boolean(exploreAnchor);

  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const isUserMenuOpen = Boolean(userMenuAnchor);

  const [skillOsModalOpen, setSkillOsModalOpen] = useState(false);

  const [notifAnchorEl, setNotifAnchorEl] = useState<null | HTMLElement>(null);
  const isNotifOpen = Boolean(notifAnchorEl);
  const [notifCategoryTab, setNotifCategoryTab] = useState<'all' | 'contests' | 'submissions' | 'courses' | 'cel'>('all');

  const {
    notifications,
    unreadCount,
    permissionStatus,
    requestPushPermission,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  useEffect(() => {
    setActiveUser(user || null);
  }, [user]);

  useEffect(() => {
    async function loadLiveUser() {
      try {
        const res = await apiService.getProfile();
        const liveUser = res?.data || res;
        if (liveUser && liveUser.name) setActiveUser(liveUser);
      } catch {}
    }
    loadLiveUser();
  }, []);

  // Keyboard shortcut listener for Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const displayName = activeUser?.name || user?.name || '';
  const displayEmail = activeUser?.email || user?.email || '';
  const roleLabel = activeUser?.globalRole ? activeUser.globalRole.replace('_', ' ') : user?.globalRole ? user.globalRole.replace('_', ' ') : 'STUDENT';

  const initials = displayName
    ? displayName
        .split(' ')
        .map((n: string) => n[0])
        .filter(Boolean)
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : null;

  const getProfilePath = () => {
    const role = (activeUser?.globalRole || user?.globalRole || '').toUpperCase();
    if (role === 'SUPER_ADMIN' || role === 'PLATFORM_ADMIN') return '/superadmin/profile';
    if (role === 'FACULTY' || role === 'COLLEGE_ADMIN') return '/faculty/profile';
    return '/students';
  };

  const handleActionSelect = (path: string) => {
    setExploreAnchor(null);
    setUserMenuAnchor(null);
    router.push(path);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      router.push(`/problems?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleConfirmLogout = async () => {
    setLogoutDialogOpen(false);
    await dispatch(logoutUser());
    router.push('/login');
  };

  const isLinkActive = (itemPath: string) => {
    if (itemPath === '/problems') return pathname.startsWith('/problems');
    if (itemPath === '/contests') return pathname.startsWith('/contests');
    if (itemPath === '/courses') return pathname.startsWith('/courses');
    if (itemPath === '/leaderboard') return pathname.startsWith('/leaderboard');
    return pathname === itemPath;
  };

  const isExploreActive =
    pathname.startsWith('/practice') ||
    pathname === '/students/submissions';

  return (
    <>
      <Box
        component="header"
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 1100,
          width: '100%',
          minHeight: { xs: 60, md: 68 },
          bgcolor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid #E2E8F0',
          boxShadow: '0 1px 4px rgba(0, 0, 0, 0.04)',
          px: { xs: 2, sm: 3, md: 4 },
          py: { xs: 1.25, md: 1.6 },
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Box
          sx={{
            maxWidth: 1200,
            width: '100%',
            mx: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          {/* ========================================================================= */}
          {/* 1. LEFT: Clean Logo & Core Essential Nav Links */}
          {/* ========================================================================= */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            {/* Brand Logo */}
            <Link
              href="/students"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                textDecoration: 'none',
              }}
            >
              <Box
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: '8px',
                  bgcolor: '#2563EB',
                  background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)',
                  flexShrink: 0,
                }}
              >
                <CodeRoundedIcon sx={{ color: '#FFFFFF', fontSize: 20 }} />
              </Box>
              <Typography sx={{ fontWeight: 800, fontSize: '1.02rem', color: '#0F172A', letterSpacing: '-0.02em' }}>
                CodePlatform
              </Typography>
            </Link>

            {/* Core Nav Links */}
            <Box
              component="nav"
              aria-label="Main Navigation"
              sx={{
                display: { xs: 'none', md: 'flex' },
                alignItems: 'center',
                gap: 0.5,
              }}
            >
              <Link href="/problems" style={{ textDecoration: 'none' }}>
                <Box
                  sx={{
                    px: 1.5,
                    py: 0.65,
                    borderRadius: '8px',
                    fontSize: '0.86rem',
                    fontWeight: isLinkActive('/problems') ? 700 : 500,
                    color: isLinkActive('/problems') ? '#2563EB' : '#475569',
                    bgcolor: isLinkActive('/problems') ? '#EFF6FF' : 'transparent',
                    transition: 'all 0.15s ease',
                    '&:hover': { color: '#2563EB', bgcolor: '#F8FAFC' },
                  }}
                >
                  Problems
                </Box>
              </Link>

              <Link href="/contests" style={{ textDecoration: 'none' }}>
                <Box
                  sx={{
                    px: 1.5,
                    py: 0.65,
                    borderRadius: '8px',
                    fontSize: '0.86rem',
                    fontWeight: isLinkActive('/contests') ? 700 : 500,
                    color: isLinkActive('/contests') ? '#2563EB' : '#475569',
                    bgcolor: isLinkActive('/contests') ? '#EFF6FF' : 'transparent',
                    transition: 'all 0.15s ease',
                    '&:hover': { color: '#2563EB', bgcolor: '#F8FAFC' },
                  }}
                >
                  Contests
                </Box>
              </Link>

              <Link href="/courses" style={{ textDecoration: 'none' }}>
                <Box
                  sx={{
                    px: 1.5,
                    py: 0.65,
                    borderRadius: '8px',
                    fontSize: '0.86rem',
                    fontWeight: isLinkActive('/courses') ? 700 : 500,
                    color: isLinkActive('/courses') ? '#2563EB' : '#475569',
                    bgcolor: isLinkActive('/courses') ? '#EFF6FF' : 'transparent',
                    transition: 'all 0.15s ease',
                    '&:hover': { color: '#2563EB', bgcolor: '#F8FAFC' },
                  }}
                >
                  Courses
                </Box>
              </Link>

              <Link href="/leaderboard" style={{ textDecoration: 'none' }}>
                <Box
                  sx={{
                    px: 1.5,
                    py: 0.65,
                    borderRadius: '8px',
                    fontSize: '0.86rem',
                    fontWeight: isLinkActive('/leaderboard') ? 700 : 500,
                    color: isLinkActive('/leaderboard') ? '#2563EB' : '#475569',
                    bgcolor: isLinkActive('/leaderboard') ? '#EFF6FF' : 'transparent',
                    transition: 'all 0.15s ease',
                    '&:hover': { color: '#2563EB', bgcolor: '#F8FAFC' },
                  }}
                >
                  Leaderboard
                </Box>
              </Link>

              {/* Revealable Options Dropdown (Explore ▾) */}
              <Button
                size="small"
                onClick={(e) => setExploreAnchor(e.currentTarget)}
                endIcon={<KeyboardArrowDownRoundedIcon sx={{ fontSize: 16 }} />}
                sx={{
                  px: 1.25,
                  py: 0.55,
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontSize: '0.86rem',
                  fontWeight: isExploreActive ? 700 : 500,
                  color: isExploreActive ? '#2563EB' : '#475569',
                  bgcolor: isExploreActive ? '#EFF6FF' : 'transparent',
                  '&:hover': { color: '#2563EB', bgcolor: '#F8FAFC' },
                }}
              >
                More
              </Button>
            </Box>
          </Box>

          {/* ========================================================================= */}
          {/* 2. RIGHT: Search, Streak, Notifications, & Profile Avatar */}
          {/* ========================================================================= */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            {/* Search Bar */}
            <TextField
              inputRef={searchInputRef}
              size="small"
              placeholder="Search (⌘K)"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              slotProps={{
                input: {
                  'aria-label': 'Search problems',
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#94A3B8', fontSize: 17 }} />
                    </InputAdornment>
                  ),
                },
                htmlInput: {
                  'aria-label': 'Search problems',
                },
              }}
              sx={{
                width: { xs: 140, sm: 200, md: 220 },
                display: { xs: 'none', sm: 'block' },
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  bgcolor: '#F8FAFC',
                  fontSize: '0.82rem',
                  height: 34,
                  border: '1px solid #E2E8F0',
                  '& fieldset': { border: 'none' },
                  '&:hover': { borderColor: '#CBD5E1' },
                  '&.Mui-focused': {
                    bgcolor: '#FFFFFF',
                    borderColor: '#2563EB',
                  },
                },
              }}
            />

            {/* Streak Pill */}
            {streakDays !== undefined && (
              <Tooltip title={`${streakDays}-day streak`} arrow>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    px: 1.2,
                    py: 0.4,
                    height: 32,
                    borderRadius: '6px',
                    bgcolor: '#FFF7ED',
                    border: '1px solid #FFEDD5',
                    color: '#C2410C',
                    fontWeight: 700,
                    fontSize: '0.76rem',
                    cursor: 'default',
                  }}
                >
                  <LocalFireDepartmentRoundedIcon sx={{ fontSize: 15, color: '#EA580C' }} />
                  <span>{streakDays}d</span>
                </Box>
              </Tooltip>
            )}

            {/* Notifications Button */}
            <Tooltip title={unreadCount > 0 ? `Notifications (${unreadCount})` : 'Notifications'}>
              <IconButton
                size="small"
                onClick={(e) => setNotifAnchorEl(e.currentTarget)}
                aria-haspopup="dialog"
                aria-expanded={isNotifOpen}
                aria-label="Notifications"
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: '8px',
                  color: '#64748B',
                  border: '1px solid #E2E8F0',
                  position: 'relative',
                  '&:hover': { bgcolor: '#F8FAFC', color: '#0F172A' },
                }}
              >
                <NotificationsNoneRoundedIcon sx={{ fontSize: 18 }} />
                {unreadCount > 0 && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 6,
                      right: 6,
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      bgcolor: '#2563EB',
                    }}
                  />
                )}
              </IconButton>
            </Tooltip>

            {/* SkillOS Command Dock Quick Action */}
            <Tooltip title="SkillOS™ Corporate Workspace & Tools" arrow>
              <Button
                size="small"
                onClick={() => setSkillOsModalOpen(true)}
                startIcon={<TerminalRoundedIcon sx={{ fontSize: 16, color: '#6366F1' }} />}
                sx={{
                  height: 34,
                  px: 1.2,
                  borderRadius: '8px',
                  bgcolor: '#EEF2FF',
                  border: '1px solid #E0E7FF',
                  color: '#4338CA',
                  fontWeight: 800,
                  fontSize: '0.76rem',
                  textTransform: 'none',
                  display: { xs: 'none', md: 'inline-flex' },
                  '&:hover': { bgcolor: '#E0E7FF', borderColor: '#C7D2FE' },
                }}
              >
                SkillOS™
              </Button>
            </Tooltip>

            {/* User Profile Avatar Dropdown */}
            <Tooltip title="Profile & Account" arrow>
              <IconButton
                size="small"
                onClick={(e) => setUserMenuAnchor(e.currentTarget)}
                aria-haspopup="menu"
                aria-expanded={isUserMenuOpen}
                aria-label="User Profile & Account Menu"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  p: '2px',
                  borderRadius: '8px',
                  '&:hover': { bgcolor: '#F8FAFC' },
                }}
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: '#2563EB',
                    color: '#FFFFFF',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                  }}
                >
                  {initials ? initials : <PersonRoundedIcon sx={{ fontSize: 18 }} />}
                </Avatar>
                <KeyboardArrowDownRoundedIcon sx={{ fontSize: 16, color: '#64748B' }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>

      {/* "More" Revealable Options Dropdown */}
      <Menu
        anchorEl={exploreAnchor}
        open={isExploreOpen}
        onClose={() => setExploreAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{
          paper: {
            sx: {
              borderRadius: '12px',
              minWidth: 220,
              mt: 1,
              p: 0.5,
              boxShadow: '0 10px 30px rgba(15, 23, 42, 0.1)',
              border: '1px solid #E2E8F0',
            },
          },
        }}
      >
        <MenuItem
          onClick={() => handleActionSelect('/practice')}
          sx={{ borderRadius: '6px', fontSize: '0.84rem', fontWeight: 600, py: 1 }}
        >
          <ListItemIcon>
            <TerminalRoundedIcon fontSize="small" sx={{ color: '#10B981' }} />
          </ListItemIcon>
          <ListItemText
            primary="Online Compilers"
            secondary="Sandbox code execution"
            slotProps={{
              primary: { sx: { fontWeight: 600, fontSize: '0.82rem', color: '#0F172A' } },
              secondary: { sx: { fontSize: '0.7rem', color: '#64748B' } },
            }}
          />
        </MenuItem>

        <MenuItem
          onClick={() => handleActionSelect('/students/submissions')}
          sx={{ borderRadius: '6px', fontSize: '0.84rem', fontWeight: 600, py: 1 }}
        >
          <ListItemIcon>
            <HistoryRoundedIcon fontSize="small" sx={{ color: '#0EA5E9' }} />
          </ListItemIcon>
          <ListItemText
            primary="Submissions Log"
            secondary="View code & verdicts"
            slotProps={{
              primary: { sx: { fontWeight: 600, fontSize: '0.82rem', color: '#0F172A' } },
              secondary: { sx: { fontSize: '0.7rem', color: '#64748B' } },
            }}
          />
        </MenuItem>

        <Divider sx={{ my: 0.5 }} />

        <MenuItem
          onClick={() => handleActionSelect(getProfilePath())}
          sx={{ borderRadius: '6px', fontSize: '0.84rem', fontWeight: 600, py: 1 }}
        >
          <ListItemIcon>
            <PersonRoundedIcon fontSize="small" sx={{ color: '#6366F1' }} />
          </ListItemIcon>
          <ListItemText
            primary="Personal Workspace"
            secondary="Profile & academic workspace"
            slotProps={{
              primary: { sx: { fontWeight: 600, fontSize: '0.82rem', color: '#0F172A' } },
              secondary: { sx: { fontSize: '0.7rem', color: '#64748B' } },
            }}
          />
        </MenuItem>
      </Menu>

      {/* User Profile Dropdown Menu */}
      <Menu
        anchorEl={userMenuAnchor}
        open={isUserMenuOpen}
        onClose={() => setUserMenuAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              borderRadius: '12px',
              minWidth: 230,
              mt: 1,
              p: 0.75,
              boxShadow: '0 12px 35px rgba(15, 23, 42, 0.1)',
              border: '1px solid #E2E8F0',
            },
          },
        }}
      >
        <Box sx={{ px: 1.5, py: 1, borderBottom: '1px solid #F1F5F9', mb: 0.5 }}>
          {displayName ? (
            <>
              <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#0F172A' }}>
                {displayName}
              </Typography>
              <Typography sx={{ fontSize: '0.72rem', color: '#64748B', wordBreak: 'break-all' }}>
                {displayEmail}
              </Typography>
              <Chip
                label={roleLabel}
                size="small"
                sx={{
                  mt: 0.5,
                  bgcolor: '#EFF6FF',
                  color: '#2563EB',
                  fontWeight: 700,
                  fontSize: '0.64rem',
                  height: 18,
                }}
              />
            </>
          ) : (
            <Typography sx={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 600 }}>
              Student Account
            </Typography>
          )}
        </Box>

        <MenuItem
          onClick={() => handleActionSelect(getProfilePath())}
          sx={{ borderRadius: '6px', fontSize: '0.82rem', fontWeight: 600, py: 0.8 }}
        >
          <ListItemIcon>
            <PersonRoundedIcon fontSize="small" sx={{ color: '#2563EB' }} />
          </ListItemIcon>
          <ListItemText primary="My Profile" />
        </MenuItem>

        <MenuItem
          onClick={() => handleActionSelect('/students/skill-passport')}
          sx={{ borderRadius: '6px', fontSize: '0.82rem', fontWeight: 600, py: 0.8 }}
        >
          <ListItemIcon>
            <BadgeOutlinedIcon fontSize="small" sx={{ color: '#4F46E5' }} />
          </ListItemIcon>
          <ListItemText primary="Skill Passport & ID" />
        </MenuItem>

        <MenuItem
          onClick={() => handleActionSelect('/students/submissions')}
          sx={{ borderRadius: '6px', fontSize: '0.82rem', fontWeight: 600, py: 0.8 }}
        >
          <ListItemIcon>
            <HistoryRoundedIcon fontSize="small" sx={{ color: '#0EA5E9' }} />
          </ListItemIcon>
          <ListItemText primary="My Submissions" />
        </MenuItem>

        <MenuItem
          onClick={() => handleActionSelect('/students/settings')}
          sx={{ borderRadius: '6px', fontSize: '0.82rem', fontWeight: 600, py: 0.8 }}
        >
          <ListItemIcon>
            <SettingsRoundedIcon fontSize="small" sx={{ color: '#64748B' }} />
          </ListItemIcon>
          <ListItemText primary="Account Settings" />
        </MenuItem>

        <Divider sx={{ my: 0.5 }} />

        <MenuItem
          onClick={() => {
            setUserMenuAnchor(null);
            setLogoutDialogOpen(true);
          }}
          sx={{
            borderRadius: '6px',
            fontSize: '0.82rem',
            fontWeight: 700,
            color: '#DC2626',
            py: 0.8,
            '&:hover': { bgcolor: '#FEE2E2' },
          }}
        >
          <ListItemIcon>
            <LogoutRoundedIcon fontSize="small" sx={{ color: '#DC2626' }} />
          </ListItemIcon>
          <ListItemText primary="Sign Out" />
        </MenuItem>
      </Menu>

      {/* Notifications Popover */}
      <Popover
        open={isNotifOpen}
        anchorEl={notifAnchorEl}
        onClose={() => setNotifAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              width: 360,
              borderRadius: '16px',
              p: 2,
              boxShadow: '0 12px 35px rgba(15, 23, 42, 0.12)',
              border: '1px solid #E2E8F0',
              mt: 1,
            },
          },
        }}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1, borderBottom: '1px solid #F1F5F9' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.88rem' }}>
              Notifications
            </Typography>
            {unreadCount > 0 && (
              <Chip
                label={`${unreadCount} new`}
                size="small"
                sx={{
                  height: 18,
                  fontSize: '0.66rem',
                  fontWeight: 800,
                  bgcolor: '#EFF6FF',
                  color: '#2563EB',
                  borderRadius: '4px',
                }}
              />
            )}
          </Box>
          {unreadCount > 0 && (
            <Button
              size="small"
              startIcon={<DoneAllRoundedIcon sx={{ fontSize: 13 }} />}
              onClick={markAllAsRead}
              sx={{ textTransform: 'none', fontSize: '0.7rem', fontWeight: 700, color: '#64748B', p: 0 }}
            >
              Mark all read
            </Button>
          )}
        </Box>

        {/* Firebase Web Push Activation Banner */}
        {permissionStatus !== 'granted' && permissionStatus !== 'unsupported' && (
          <Box
            sx={{
              mt: 1.2,
              p: 1.2,
              borderRadius: '10px',
              bgcolor: '#F0FDF4',
              border: '1px solid #BBF7D0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1,
            }}
          >
            <Box>
              <Typography sx={{ fontSize: '0.74rem', fontWeight: 800, color: '#166534' }}>
                🔔 Enable Firebase Push Alerts
              </Typography>
              <Typography sx={{ fontSize: '0.68rem', color: '#15803D' }}>
                Get live contest & verdict updates on your desktop
              </Typography>
            </Box>
            <Button
              size="small"
              variant="contained"
              onClick={requestPushPermission}
              sx={{
                height: 26,
                fontSize: '0.68rem',
                fontWeight: 800,
                textTransform: 'none',
                bgcolor: '#16A34A',
                '&:hover': { bgcolor: '#15803D' },
                px: 1.2,
                borderRadius: '6px',
                flexShrink: 0,
              }}
            >
              Enable
            </Button>
          </Box>
        )}

        {/* Filter Categories Chips */}
        <Box sx={{ display: 'flex', gap: 0.6, my: 1.2, overflowX: 'auto', pb: 0.2 }}>
          {[
            { id: 'all', label: 'All' },
            { id: 'contests', label: 'Contests' },
            { id: 'submissions', label: 'Verdicts' },
            { id: 'courses', label: 'Courses' },
            { id: 'cel', label: 'CEL' },
          ].map((cat) => (
            <Chip
              key={cat.id}
              label={cat.label}
              size="small"
              onClick={() => setNotifCategoryTab(cat.id as any)}
              sx={{
                height: 22,
                fontSize: '0.68rem',
                fontWeight: 700,
                cursor: 'pointer',
                bgcolor: notifCategoryTab === cat.id ? '#0F172A' : '#F1F5F9',
                color: notifCategoryTab === cat.id ? '#FFFFFF' : '#64748B',
                '&:hover': { bgcolor: notifCategoryTab === cat.id ? '#1E293B' : '#E2E8F0' },
              }}
            />
          ))}
        </Box>

        {/* Notification List */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8, maxHeight: 300, overflowY: 'auto' }}>
          {notifications
            .filter((n) => notifCategoryTab === 'all' || n.category === notifCategoryTab)
            .map((n) => (
              <Box
                key={n.id}
                component="button"
                type="button"
                onClick={() => {
                  markAsRead(n.id);
                  if (n.actionUrl) {
                    setNotifAnchorEl(null);
                    router.push(n.actionUrl);
                  }
                }}
                sx={{
                  p: 1.2,
                  borderRadius: '10px',
                  bgcolor: n.unread ? '#F8FAFC' : '#FFFFFF',
                  border: n.unread ? '1px solid #BFDBFE' : '1px solid #F1F5F9',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                  fontFamily: 'inherit',
                  fontSize: 'inherit',
                  display: 'block',
                  transition: 'all 0.15s ease',
                  '&:hover': { bgcolor: '#F1F5F9', borderColor: '#CBD5E1' },
                  '&:focus-visible': { outline: '2px solid #2563EB', outlineOffset: '1px' },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                    {n.unread && (
                      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#2563EB', flexShrink: 0 }} />
                    )}
                    <Typography sx={{ fontWeight: n.unread ? 800 : 700, color: '#0F172A', fontSize: '0.8rem' }}>
                      {n.title}
                    </Typography>
                  </Box>
                  {n.badge && (
                    <Chip
                      label={n.badge}
                      size="small"
                      sx={{
                        height: 16,
                        fontSize: '0.62rem',
                        fontWeight: 800,
                        bgcolor: n.category === 'submissions' ? '#ECFDF5' : '#EFF6FF',
                        color: n.category === 'submissions' ? '#059669' : '#2563EB',
                        borderRadius: '3px',
                      }}
                    />
                  )}
                </Box>
                <Typography sx={{ color: '#64748B', fontSize: '0.74rem', lineHeight: 1.35 }}>
                  {n.desc}
                </Typography>
                <Typography sx={{ fontSize: '0.65rem', color: '#94A3B8', fontWeight: 600, mt: 0.5 }}>
                  {n.time}
                </Typography>
              </Box>
            ))}

          {notifications.filter((n) => notifCategoryTab === 'all' || n.category === notifCategoryTab).length === 0 && (
            <Box sx={{ py: 3, textAlign: 'center' }}>
              <Typography sx={{ fontSize: '0.82rem', color: '#94A3B8', fontWeight: 600 }}>
                No notifications in this category.
              </Typography>
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 1 }} />
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Button
            size="small"
            onClick={() => {
              setNotifAnchorEl(null);
              router.push('/notifications');
            }}
            sx={{
              width: '100%',
              fontSize: '0.76rem',
              fontWeight: 700,
              textTransform: 'none',
              color: '#2563EB',
              borderRadius: '8px',
              py: 0.6,
              '&:hover': { bgcolor: '#EFF6FF' },
            }}
          >
            View all in Notification Center ↗
          </Button>
        </Box>
      </Popover>

      {/* Logout Dialog */}
      <LogoutConfirmModal
        open={logoutDialogOpen}
        onClose={() => setLogoutDialogOpen(false)}
        onConfirm={handleConfirmLogout}
      />

      {/* SkillOS Command Dock Modal */}
      <SkillOSDockModal
        open={skillOsModalOpen}
        onClose={() => setSkillOsModalOpen(false)}
      />
    </>
  );
}
