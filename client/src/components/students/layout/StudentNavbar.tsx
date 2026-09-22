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

interface StudentNavbarProps {
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
  streakDays?: number;
  contestRating?: number;
  ratingTier?: string;
}

interface NotificationItem {
  id: string;
  title: string;
  desc: string;
  time: string;
  unread: boolean;
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

  const [notifAnchorEl, setNotifAnchorEl] = useState<null | HTMLElement>(null);
  const isNotifOpen = Boolean(notifAnchorEl);

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'n-1',
      title: 'Submission Accepted',
      desc: 'Problem #407 Trapping Rain Water II passed all 42 test cases!',
      time: '12m ago',
      unread: true,
    },
    {
      id: 'n-2',
      title: 'Upcoming Contest',
      desc: 'Weekly Grand Arena #108 starts in 2 hours.',
      time: '1h ago',
      unread: true,
    },
  ]);

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

  const unreadCount = notifications.filter((n) => n.unread).length;

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
              width: 320,
              borderRadius: '14px',
              p: 1.75,
              boxShadow: '0 10px 30px rgba(15, 23, 42, 0.1)',
              border: '1px solid #E2E8F0',
              mt: 1,
            },
          },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1, borderBottom: '1px solid #F1F5F9' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.84rem' }}>
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Button
              size="small"
              startIcon={<DoneAllRoundedIcon sx={{ fontSize: 13 }} />}
              onClick={() => setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))}
              sx={{ textTransform: 'none', fontSize: '0.7rem', fontWeight: 600, color: '#64748B', p: 0 }}
            >
              Mark all read
            </Button>
          )}
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, mt: 1, maxHeight: 260, overflowY: 'auto' }}>
          {notifications.map((n) => (
            <Box
              key={n.id}
              component="button"
              type="button"
              onClick={() => setNotifications((prev) => prev.map((item) => (item.id === n.id ? { ...item, unread: false } : item)))}
              sx={{
                p: 1,
                borderRadius: '8px',
                bgcolor: n.unread ? '#F8FAFC' : '#FFFFFF',
                border: n.unread ? '1px solid #DBEAFE' : '1px solid #F1F5F9',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                fontFamily: 'inherit',
                display: 'block',
                '&:hover': { bgcolor: '#F1F5F9' },
                '&:focus-visible': { outline: '2px solid #2563EB' },
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: n.unread ? 700 : 600, color: '#0F172A', fontSize: '0.78rem', display: 'block' }}>
                {n.title}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.72rem', display: 'block', mt: 0.25 }}>
                {n.desc}
              </Typography>
            </Box>
          ))}
        </Box>
      </Popover>

      {/* Logout Dialog */}
      <LogoutConfirmModal
        open={logoutDialogOpen}
        onClose={() => setLogoutDialogOpen(false)}
        onConfirm={handleConfirmLogout}
      />
    </>
  );
}
