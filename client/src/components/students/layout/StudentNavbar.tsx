'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  MenuList,
  ListItemIcon,
  ListItemText,
  Popover,
  Divider,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Drawer,
  Badge,
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
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import ArrowDropDownRoundedIcon from '@mui/icons-material/ArrowDropDownRounded';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import AccountTreeRoundedIcon from '@mui/icons-material/AccountTreeRounded';
import LaptopChromebookRoundedIcon from '@mui/icons-material/LaptopChromebookRounded';
import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import WorkOutlineRoundedIcon from '@mui/icons-material/WorkOutlineRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import PublicRoundedIcon from '@mui/icons-material/PublicRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import ForumRoundedIcon from '@mui/icons-material/ForumRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';

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
  searchQuery: _searchQuery = '',
  onSearchChange: _onSearchChange = () => {},
  streakDays,
  contestRating: _contestRating,
  ratingTier: _ratingTier,
}: StudentNavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();

  const [isMounted, setIsMounted] = useState(false);
  const user = useAppSelector((state) => state.auth.user);
  const [activeUser, setActiveUser] = useState(user);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const effectiveStreak =
    typeof streakDays === 'number' && streakDays > 0
      ? streakDays
      : typeof (activeUser as any)?.streakDays === 'number' && (activeUser as any).streakDays > 0
      ? (activeUser as any).streakDays
      : 0;

  // Dropdown states & hover timers
  const [resourcesAnchor, setResourcesAnchor] = useState<null | HTMLElement>(null);
  const isResourcesOpen = Boolean(resourcesAnchor);
  const resourcesTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const isUserMenuOpen = Boolean(userMenuAnchor);
  const userMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [skillOsModalOpen, setSkillOsModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileResourcesOpen, setMobileResourcesOpen] = useState(false);

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

  // Cleanup hover timers on unmount
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (!target.closest('.resources-menu-container') && !target.closest('.resources-popover-paper')) {
        setResourcesAnchor(null);
      }
      if (!target.closest('.user-menu-container') && !target.closest('.user-menu-popover-paper')) {
        setUserMenuAnchor(null);
      }
    };
    document.addEventListener('click', handleClickOutside);

    return () => {
      if (resourcesTimeoutRef.current) clearTimeout(resourcesTimeoutRef.current);
      if (userMenuTimeoutRef.current) clearTimeout(userMenuTimeoutRef.current);
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const handleResourcesMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
    if (resourcesTimeoutRef.current) {
      clearTimeout(resourcesTimeoutRef.current);
      resourcesTimeoutRef.current = null;
    }
    setResourcesAnchor(e.currentTarget);
  };

  const handleResourcesMouseLeave = () => {
    resourcesTimeoutRef.current = setTimeout(() => {
      setResourcesAnchor(null);
    }, 240);
  };

  const handleUserMenuMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
    if (userMenuTimeoutRef.current) {
      clearTimeout(userMenuTimeoutRef.current);
      userMenuTimeoutRef.current = null;
    }
    setUserMenuAnchor(e.currentTarget);
  };

  const handleUserMenuMouseLeave = () => {
    userMenuTimeoutRef.current = setTimeout(() => {
      setUserMenuAnchor(null);
    }, 240);
  };

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
    return '/students/profile';
  };

  const handleActionSelect = (path: string) => {
    setResourcesAnchor(null);
    setUserMenuAnchor(null);
    router.push(path);
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
    if (itemPath === '/practice') return pathname.startsWith('/practice');
    return pathname === itemPath;
  };

  const isResourcesActive =
    pathname.startsWith('/leaderboard') ||
    pathname.startsWith('/students/submissions') ||
    pathname.startsWith('/students/skill-passport');

  return (
    <>
      <Box
        component="header"
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 1100,
          width: '100%',
          bgcolor: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
        }}
      >
        <Box
          sx={{
            maxWidth: 1440,
            width: '100%',
            mx: 'auto',
            px: { xs: 2, sm: 3, md: 4 },
            minHeight: 64,
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* ========================================================================= */}
          {/* 1. LEFT GROUP: Brand Logo + Greeting + Courses + Practice + Compete + Compiler + Resources ▾ */}
          {/* ========================================================================= */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 2, sm: 2.5, md: 3 } }}>
            {/* Brand Logo (TechLearns Theme) */}
            <Link
              href="/students"
              style={{
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'none',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  height: 44,
                  pr: 1.5,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/logo/techlearns-logo.png"
                  alt="TechLearns"
                  style={{
                    height: '38px',
                    width: '170px',
                    objectFit: 'contain',
                    display: 'block',
                  }}
                />
              </Box>
            </Link>

            {/* Small Screen Menu Toggle Button */}
            <IconButton
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open mobile navigation menu"
              sx={{
                display: { xs: 'flex', md: 'none' },
                color: '#475569',
                p: 0.5,
              }}
            >
              <MenuRoundedIcon sx={{ fontSize: 24 }} />
            </IconButton>

            {/* Greeting: Hello, <User Name> */}
            {isMounted && displayName ? (
              <Typography
                sx={{
                  display: { xs: 'none', sm: 'block' },
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  color: '#475569',
                  whiteSpace: 'nowrap',
                  ml: 0.5,
                }}
              >
                Hello, {displayName}
              </Typography>
            ) : null}

            {/* Nav Links */}
            <Box
              component="nav"
              aria-label="Main Navigation"
              sx={{
                display: { xs: 'none', md: 'flex' },
                alignItems: 'center',
                gap: { md: 2.2, lg: 3 },
                ml: 1,
              }}
            >
              {/* Courses (Direct Link) */}
              <Link href="/courses" style={{ textDecoration: 'none' }}>
                <Typography
                  sx={{
                    fontSize: '0.88rem',
                    fontWeight: isLinkActive('/courses') ? 700 : 500,
                    color: isLinkActive('/courses') ? '#0B1F3A' : '#475569',
                    transition: 'color 0.15s ease',
                    '&:hover': { color: '#0B1F3A' },
                  }}
                >
                  Courses
                </Typography>
              </Link>

              {/* Practice */}
              <Link href="/problems" style={{ textDecoration: 'none' }}>
                <Typography
                  sx={{
                    fontSize: '0.88rem',
                    fontWeight: isLinkActive('/problems') ? 700 : 500,
                    color: isLinkActive('/problems') ? '#0B1F3A' : '#475569',
                    transition: 'color 0.15s ease',
                    '&:hover': { color: '#0B1F3A' },
                  }}
                >
                  Practice
                </Typography>
              </Link>

              {/* Compete */}
              <Link href="/contests" style={{ textDecoration: 'none' }}>
                <Typography
                  sx={{
                    fontSize: '0.88rem',
                    fontWeight: isLinkActive('/contests') ? 700 : 500,
                    color: isLinkActive('/contests') ? '#0B1F3A' : '#475569',
                    transition: 'color 0.15s ease',
                    '&:hover': { color: '#0B1F3A' },
                  }}
                >
                  Compete
                </Typography>
              </Link>

              {/* Compiler */}
              <Link href="/practice" style={{ textDecoration: 'none' }}>
                <Typography
                  sx={{
                    fontSize: '0.88rem',
                    fontWeight: isLinkActive('/practice') ? 700 : 500,
                    color: isLinkActive('/practice') ? '#0B1F3A' : '#475569',
                    transition: 'color 0.15s ease',
                    '&:hover': { color: '#0B1F3A' },
                  }}
                >
                  Compiler
                </Typography>
              </Link>

              {/* Resources ▾ Dropdown (On Hover & On Click) */}
              <Box
                className="resources-menu-container"
                onMouseEnter={handleResourcesMouseEnter}
                onMouseLeave={handleResourcesMouseLeave}
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  '&:hover .resources-arrow': {
                    transform: 'rotate(180deg)',
                    color: '#0B1F3A',
                  },
                }}
              >
                <Button
                  size="small"
                  onClick={(e) => setResourcesAnchor(e.currentTarget)}
                  endIcon={
                    <ArrowDropDownRoundedIcon
                      className="resources-arrow"
                      sx={{
                        fontSize: 18,
                        color: isResourcesActive || isResourcesOpen ? '#0B1F3A' : '#64748B',
                        ml: -0.5,
                        transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), color 0.15s ease',
                        transform: isResourcesOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      }}
                    />
                  }
                  sx={{
                    p: 0,
                    minWidth: 'auto',
                    textTransform: 'none',
                    fontSize: '0.88rem',
                    fontWeight: isResourcesActive || isResourcesOpen ? 700 : 500,
                    color: isResourcesActive || isResourcesOpen ? '#0B1F3A' : '#475569',
                    '&:hover': {
                      color: '#0B1F3A',
                      bgcolor: 'transparent',
                      '& .resources-arrow': {
                        transform: 'rotate(180deg)',
                        color: '#0B1F3A',
                      },
                    },
                  }}
                >
                  Resources
                </Button>
              </Box>
            </Box>
          </Box>

          {/* ========================================================================= */}
          {/* 2. RIGHT GROUP: Notifications Bell + Profile Avatar */}
          {/* ========================================================================= */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Daily Practice Streak Badge */}
            {isMounted && effectiveStreak > 0 && (
              <Tooltip title={`${effectiveStreak} Days Daily Practice Streak`}>
                <Chip
                  icon={<LocalFireDepartmentRoundedIcon sx={{ fontSize: 16, color: '#EA580C !important' }} />}
                  label={`${effectiveStreak}d`}
                  size="small"
                  sx={{
                    bgcolor: '#FFF7ED',
                    color: '#EA580C',
                    border: '1px solid #FFEDD5',
                    fontWeight: 800,
                    fontSize: '0.75rem',
                    height: 28,
                    borderRadius: '9999px',
                    mr: 0.5,
                  }}
                />
              </Tooltip>
            )}

            {/* Notification Bell Icon */}
            <Tooltip title="Notifications">
              <IconButton
                onClick={(e) => setNotifAnchorEl(e.currentTarget)}
                aria-label="Open notifications"
                sx={{
                  color: isNotifOpen ? '#0B1F3A' : '#64748B',
                  bgcolor: isNotifOpen ? '#FAF5FF' : 'transparent',
                  p: 0.8,
                  '&:hover': { bgcolor: '#F1F5F9', color: '#0F172A' },
                }}
              >
                <Badge
                  badgeContent={isMounted ? unreadCount : 0}
                  color="error"
                  max={99}
                  sx={{
                    '& .MuiBadge-badge': {
                      fontSize: '0.65rem',
                      height: 16,
                      minWidth: 16,
                      px: 0.4,
                      fontWeight: 800,
                    },
                  }}
                >
                  <NotificationsNoneRoundedIcon sx={{ fontSize: 21 }} />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* Profile Avatar with Chevron */}
            <Box
              className="user-menu-container"
              onMouseEnter={handleUserMenuMouseEnter}
              onMouseLeave={handleUserMenuMouseLeave}
              sx={{
                display: 'flex',
                alignItems: 'center',
                '&:hover .user-menu-arrow': {
                  transform: 'rotate(180deg)',
                  color: '#0B1F3A',
                },
              }}
            >
              <Button
                onClick={(e) => setUserMenuAnchor(e.currentTarget)}
                aria-haspopup="menu"
                aria-expanded={isUserMenuOpen}
                aria-label="User profile menu"
                sx={{
                  p: 0.3,
                  minWidth: 'auto',
                  textTransform: 'none',
                  borderRadius: '50px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  '&:hover': {
                    bgcolor: '#F8FAFC',
                    '& .user-menu-arrow': {
                      transform: 'rotate(180deg)',
                      color: '#0B1F3A',
                    },
                  },
                }}
              >
                <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                  {/* Circular Profile Avatar */}
                  <Avatar
                    sx={{
                      width: 36,
                      height: 36,
                      bgcolor: '#0B1F3A',
                      background: 'linear-gradient(135deg, #0B1F3A 0%, #5B2D90 100%)',
                      color: '#FFFFFF',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      boxShadow: '0 2px 6px rgba(91, 45, 144, 0.25)',
                    }}
                  >
                    {isMounted && initials ? initials : <PersonRoundedIcon sx={{ fontSize: 18 }} />}
                  </Avatar>

                  {/* Online/Rating Indicator Pill */}
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: -1,
                      right: -2,
                      width: 11,
                      height: 11,
                      borderRadius: '50%',
                      bgcolor: '#10B981',
                      border: '2px solid #FFFFFF',
                    }}
                  />
                </Box>

                {/* Dropdown Chevron */}
                <ArrowDropDownRoundedIcon
                  className="user-menu-arrow"
                  sx={{
                    fontSize: 18,
                    color: isUserMenuOpen ? '#0B1F3A' : '#64748B',
                    ml: 0.2,
                    transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), color 0.15s ease',
                    transform: isUserMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                />
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ========================================================================= */}
      {/* 3. SIMPLE & CLEAN RESOURCES DROPDOWN MENU                                 */}
      {/* ========================================================================= */}
      <Popover
        anchorEl={resourcesAnchor}
        open={isResourcesOpen}
        onClose={() => setResourcesAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        disableRestoreFocus
        disableScrollLock
        slotProps={{
          root: {
            sx: { pointerEvents: 'none' },
          },
          paper: {
            className: 'resources-popover-paper',
            onMouseEnter: () => {
              if (resourcesTimeoutRef.current) {
                clearTimeout(resourcesTimeoutRef.current);
                resourcesTimeoutRef.current = null;
              }
            },
            onMouseLeave: handleResourcesMouseLeave,
            sx: {
              pointerEvents: 'auto',
              borderRadius: '16px',
              width: { xs: '96vw', sm: 460 },
              mt: 0.5,
              p: 1.5,
              background: '#FFFFFF',
              boxShadow: '0 12px 36px rgba(15, 23, 42, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05)',
              border: '1px solid #E2E8F0',
              listStyle: 'none',
              '& *': {
                listStyle: 'none',
              },
            },
          },
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            gap: 0.5,
          }}
        >
          {/* Column 1 */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
            <Box
              component="button"
              type="button"
              onClick={() => handleActionSelect('/students/skill-graph')}
              sx={{
                all: 'unset',
                display: 'flex',
                alignItems: 'center',
                gap: 1.25,
                boxSizing: 'border-box',
                width: '100%',
                borderRadius: '10px',
                p: '8px 10px',
                cursor: 'pointer',
                color: '#334155',
                transition: 'all 0.15s ease',
                '&:hover': {
                  bgcolor: '#F8FAFC',
                  color: '#0B1F3A',
                  '& .res-icon': { color: '#0B1F3A' },
                },
              }}
            >
              <AccountTreeRoundedIcon className="res-icon" sx={{ fontSize: 19, color: '#64748B', transition: 'color 0.15s ease' }} />
              <Typography sx={{ fontSize: '0.84rem', fontWeight: 600, color: 'inherit' }}>
                Role Skill Graph
              </Typography>
            </Box>


            <Box
              component="button"
              type="button"
              onClick={() => handleActionSelect('/students/projects')}
              sx={{
                all: 'unset',
                display: 'flex',
                alignItems: 'center',
                gap: 1.25,
                boxSizing: 'border-box',
                width: '100%',
                borderRadius: '10px',
                p: '8px 10px',
                cursor: 'pointer',
                color: '#334155',
                transition: 'all 0.15s ease',
                '&:hover': {
                  bgcolor: '#F8FAFC',
                  color: '#0B1F3A',
                  '& .res-icon': { color: '#0B1F3A' },
                },
              }}
            >
              <LaptopChromebookRoundedIcon className="res-icon" sx={{ fontSize: 19, color: '#64748B', transition: 'color 0.15s ease' }} />
              <Typography sx={{ fontSize: '0.84rem', fontWeight: 600, color: 'inherit' }}>
                Project Workspace
              </Typography>
            </Box>

            <Box
              component="button"
              type="button"
              onClick={() => handleActionSelect('/students/simulations')}
              sx={{
                all: 'unset',
                display: 'flex',
                alignItems: 'center',
                gap: 1.25,
                boxSizing: 'border-box',
                width: '100%',
                borderRadius: '10px',
                p: '8px 10px',
                cursor: 'pointer',
                color: '#334155',
                transition: 'all 0.15s ease',
                '&:hover': {
                  bgcolor: '#F8FAFC',
                  color: '#0B1F3A',
                  '& .res-icon': { color: '#0B1F3A' },
                },
              }}
            >
              <ApartmentRoundedIcon className="res-icon" sx={{ fontSize: 19, color: '#64748B', transition: 'color 0.15s ease' }} />
              <Typography sx={{ fontSize: '0.84rem', fontWeight: 600, color: 'inherit' }}>
                Corporate Simulation
              </Typography>
            </Box>

            <Box
              component="button"
              type="button"
              onClick={() => handleActionSelect('/students/career-hub')}
              sx={{
                all: 'unset',
                display: 'flex',
                alignItems: 'center',
                gap: 1.25,
                boxSizing: 'border-box',
                width: '100%',
                borderRadius: '10px',
                p: '8px 10px',
                cursor: 'pointer',
                color: '#334155',
                transition: 'all 0.15s ease',
                '&:hover': {
                  bgcolor: '#F8FAFC',
                  color: '#0B1F3A',
                  '& .res-icon': { color: '#0B1F3A' },
                },
              }}
            >
              <WorkOutlineRoundedIcon className="res-icon" sx={{ fontSize: 19, color: '#64748B', transition: 'color 0.15s ease' }} />
              <Typography sx={{ fontSize: '0.84rem', fontWeight: 600, color: 'inherit' }}>
                Career Hub
              </Typography>
            </Box>

            <Box
              component="button"
              type="button"
              onClick={() => handleActionSelect('/students/jobs')}
              sx={{
                all: 'unset',
                display: 'flex',
                alignItems: 'center',
                gap: 1.25,
                boxSizing: 'border-box',
                width: '100%',
                borderRadius: '10px',
                p: '8px 10px',
                cursor: 'pointer',
                color: '#334155',
                transition: 'all 0.15s ease',
                '&:hover': {
                  bgcolor: '#F8FAFC',
                  color: '#0B1F3A',
                  '& .res-icon': { color: '#0B1F3A' },
                },
              }}
            >
              <LocationOnRoundedIcon className="res-icon" sx={{ fontSize: 19, color: '#64748B', transition: 'color 0.15s ease' }} />
              <Typography sx={{ fontSize: '0.84rem', fontWeight: 600, color: 'inherit' }}>
                Jobs / Placements
              </Typography>
            </Box>
          </Box>

          {/* Column 2 */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
            <Box
              component="button"
              type="button"
              onClick={() => handleActionSelect('/students/bootcamps')}
              sx={{
                all: 'unset',
                display: 'flex',
                alignItems: 'center',
                gap: 1.25,
                boxSizing: 'border-box',
                width: '100%',
                borderRadius: '10px',
                p: '8px 10px',
                cursor: 'pointer',
                color: '#334155',
                transition: 'all 0.15s ease',
                '&:hover': {
                  bgcolor: '#F8FAFC',
                  color: '#0B1F3A',
                  '& .res-icon': { color: '#0B1F3A' },
                },
              }}
            >
              <AccessTimeRoundedIcon className="res-icon" sx={{ fontSize: 19, color: '#64748B', transition: 'color 0.15s ease' }} />
              <Typography sx={{ fontSize: '0.84rem', fontWeight: 600, color: 'inherit' }}>
                Bootcamps
              </Typography>
            </Box>

            <Box
              component="button"
              type="button"
              onClick={() => handleActionSelect('/students/interview-prep')}
              sx={{
                all: 'unset',
                display: 'flex',
                alignItems: 'center',
                gap: 1.25,
                boxSizing: 'border-box',
                width: '100%',
                borderRadius: '10px',
                p: '8px 10px',
                cursor: 'pointer',
                color: '#334155',
                transition: 'all 0.15s ease',
                '&:hover': {
                  bgcolor: '#F8FAFC',
                  color: '#0B1F3A',
                  '& .res-icon': { color: '#0B1F3A' },
                },
              }}
            >
              <DescriptionRoundedIcon className="res-icon" sx={{ fontSize: 19, color: '#64748B', transition: 'color 0.15s ease' }} />
              <Typography sx={{ fontSize: '0.84rem', fontWeight: 600, color: 'inherit' }}>
                Interview Prep
              </Typography>
            </Box>

            <Box
              component="button"
              type="button"
              onClick={() => handleActionSelect('/students/ai-coach')}
              sx={{
                all: 'unset',
                display: 'flex',
                alignItems: 'center',
                gap: 1.25,
                boxSizing: 'border-box',
                width: '100%',
                borderRadius: '10px',
                p: '8px 10px',
                cursor: 'pointer',
                color: '#334155',
                transition: 'all 0.15s ease',
                '&:hover': {
                  bgcolor: '#F8FAFC',
                  color: '#0B1F3A',
                  '& .res-icon': { color: '#0B1F3A' },
                },
              }}
            >
              <AutoAwesomeRoundedIcon className="res-icon" sx={{ fontSize: 19, color: '#64748B', transition: 'color 0.15s ease' }} />
              <Typography sx={{ fontSize: '0.84rem', fontWeight: 600, color: 'inherit', flex: 1 }}>
                AI Coach
              </Typography>
              <Chip
                label="AI"
                size="small"
                sx={{
                  height: 16,
                  fontSize: '0.55rem',
                  fontWeight: 800,
                  bgcolor: '#F3E8FF',
                  color: '#7E22CE',
                  borderRadius: '4px',
                  px: 0.25,
                }}
              />
            </Box>

            <Box
              component="button"
              type="button"
              onClick={() => handleActionSelect('/students/community')}
              sx={{
                all: 'unset',
                display: 'flex',
                alignItems: 'center',
                gap: 1.25,
                boxSizing: 'border-box',
                width: '100%',
                borderRadius: '10px',
                p: '8px 10px',
                cursor: 'pointer',
                color: '#334155',
                transition: 'all 0.15s ease',
                '&:hover': {
                  bgcolor: '#F8FAFC',
                  color: '#0B1F3A',
                  '& .res-icon': { color: '#0B1F3A' },
                },
              }}
            >
              <ForumRoundedIcon className="res-icon" sx={{ fontSize: 19, color: '#64748B', transition: 'color 0.15s ease' }} />
              <Typography sx={{ fontSize: '0.84rem', fontWeight: 600, color: 'inherit' }}>
                Community
              </Typography>
            </Box>

            <Box
              component="button"
              type="button"
              onClick={() => handleActionSelect('/students/certifications')}
              sx={{
                all: 'unset',
                display: 'flex',
                alignItems: 'center',
                gap: 1.25,
                boxSizing: 'border-box',
                width: '100%',
                borderRadius: '10px',
                p: '8px 10px',
                cursor: 'pointer',
                color: '#334155',
                transition: 'all 0.15s ease',
                '&:hover': {
                  bgcolor: '#F8FAFC',
                  color: '#0B1F3A',
                  '& .res-icon': { color: '#0B1F3A' },
                },
              }}
            >
              <VerifiedRoundedIcon className="res-icon" sx={{ fontSize: 19, color: '#64748B', transition: 'color 0.15s ease' }} />
              <Typography sx={{ fontSize: '0.84rem', fontWeight: 600, color: 'inherit' }}>
                Certifications
              </Typography>
            </Box>

            <Box
              component="button"
              type="button"
              onClick={() => handleActionSelect('/students/skill-passport')}
              sx={{
                all: 'unset',
                display: 'flex',
                alignItems: 'center',
                gap: 1.25,
                boxSizing: 'border-box',
                width: '100%',
                borderRadius: '10px',
                p: '8px 10px',
                cursor: 'pointer',
                color: '#334155',
                transition: 'all 0.15s ease',
                '&:hover': {
                  bgcolor: '#F8FAFC',
                  color: '#0B1F3A',
                  '& .res-icon': { color: '#0B1F3A' },
                },
              }}
            >
              <BadgeOutlinedIcon className="res-icon" sx={{ fontSize: 19, color: '#64748B', transition: 'color 0.15s ease' }} />
              <Typography sx={{ fontSize: '0.84rem', fontWeight: 600, color: 'inherit' }}>
                Skill Passport & ID
              </Typography>
            </Box>
          </Box>
        </Box>
      </Popover>

      {/* User Profile Dropdown Menu (Simple & Sleek) */}
      <Popover
        anchorEl={userMenuAnchor}
        open={isUserMenuOpen}
        onClose={() => setUserMenuAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        disableRestoreFocus
        disableScrollLock
        slotProps={{
          root: {
            sx: { pointerEvents: 'none' },
          },
          paper: {
            className: 'user-menu-popover-paper',
            onMouseEnter: () => {
              if (userMenuTimeoutRef.current) {
                clearTimeout(userMenuTimeoutRef.current);
                userMenuTimeoutRef.current = null;
              }
            },
            onMouseLeave: handleUserMenuMouseLeave,
            sx: {
              pointerEvents: 'auto',
              borderRadius: '12px',
              minWidth: 215,
              mt: 0.5,
              p: 0.75,
              background: '#FFFFFF',
              boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.05)',
              border: '1px solid #E2E8F0',
              listStyle: 'none',
              '& *': {
                listStyle: 'none',
              },
            },
          },
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          {/* User Info Header */}
          <Box sx={{ px: 1.25, py: 1, mb: 0.5, borderBottom: '1px solid #F1F5F9' }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.84rem', color: '#0F172A', lineHeight: 1.2 }}>
              {displayName || 'Student Account'}
            </Typography>
            <Typography sx={{ fontSize: '0.72rem', color: '#64748B', mt: 0.2, wordBreak: 'break-all' }}>
              {displayEmail}
            </Typography>
            <Chip
              label={roleLabel}
              size="small"
              sx={{
                mt: 0.5,
                bgcolor: '#FAF5FF',
                color: '#0B1F3A',
                fontWeight: 700,
                fontSize: '0.58rem',
                letterSpacing: '0.04em',
                height: 18,
                borderRadius: '4px',
              }}
            />
          </Box>

          {/* 1. My Profile */}
          <Box
            component="button"
            type="button"
            onClick={() => handleActionSelect(getProfilePath())}
            sx={{
              all: 'unset',
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
              boxSizing: 'border-box',
              width: '100%',
              borderRadius: '8px',
              p: '7px 10px',
              cursor: 'pointer',
              color: '#334155',
              transition: 'all 0.15s ease',
              '&:hover': {
                bgcolor: '#F8FAFC',
                color: '#0F172A',
                '& .menu-icon': { color: '#0B1F3A' },
              },
            }}
          >
            <PersonRoundedIcon className="menu-icon" sx={{ fontSize: 18, color: '#64748B', transition: 'color 0.15s ease' }} />
            <Typography sx={{ fontSize: '0.82rem', fontWeight: 500, color: 'inherit' }}>
              My Profile
            </Typography>
          </Box>

          {/* 2. Skill Passport & ID */}
          <Box
            component="button"
            type="button"
            onClick={() => handleActionSelect('/students/skill-passport')}
            sx={{
              all: 'unset',
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
              boxSizing: 'border-box',
              width: '100%',
              borderRadius: '8px',
              p: '7px 10px',
              cursor: 'pointer',
              color: '#334155',
              transition: 'all 0.15s ease',
              '&:hover': {
                bgcolor: '#F8FAFC',
                color: '#0F172A',
                '& .menu-icon': { color: '#5B2D90' },
              },
            }}
          >
            <BadgeOutlinedIcon className="menu-icon" sx={{ fontSize: 18, color: '#64748B', transition: 'color 0.15s ease' }} />
            <Typography sx={{ fontSize: '0.82rem', fontWeight: 500, color: 'inherit' }}>
              Skill Passport & ID
            </Typography>
          </Box>

          {/* 3. My Submissions */}
          <Box
            component="button"
            type="button"
            onClick={() => handleActionSelect('/students/submissions')}
            sx={{
              all: 'unset',
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
              boxSizing: 'border-box',
              width: '100%',
              borderRadius: '8px',
              p: '7px 10px',
              cursor: 'pointer',
              color: '#334155',
              transition: 'all 0.15s ease',
              '&:hover': {
                bgcolor: '#F8FAFC',
                color: '#0F172A',
                '& .menu-icon': { color: '#16A34A' },
              },
            }}
          >
            <HistoryRoundedIcon className="menu-icon" sx={{ fontSize: 18, color: '#64748B', transition: 'color 0.15s ease' }} />
            <Typography sx={{ fontSize: '0.82rem', fontWeight: 500, color: 'inherit' }}>
              My Submissions
            </Typography>
          </Box>

          {/* 4. Account Settings */}
          <Box
            component="button"
            type="button"
            onClick={() => handleActionSelect('/students/settings')}
            sx={{
              all: 'unset',
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
              boxSizing: 'border-box',
              width: '100%',
              borderRadius: '8px',
              p: '7px 10px',
              cursor: 'pointer',
              color: '#334155',
              transition: 'all 0.15s ease',
              '&:hover': {
                bgcolor: '#F8FAFC',
                color: '#0F172A',
                '& .menu-icon': { color: '#0F172A' },
              },
            }}
          >
            <SettingsRoundedIcon className="menu-icon" sx={{ fontSize: 18, color: '#64748B', transition: 'color 0.15s ease' }} />
            <Typography sx={{ fontSize: '0.82rem', fontWeight: 500, color: 'inherit' }}>
              Account Settings
            </Typography>
          </Box>

          <Divider sx={{ my: 0.5, borderColor: '#F1F5F9' }} />

          {/* 5. Sign Out */}
          <Box
            component="button"
            type="button"
            onClick={() => {
              setUserMenuAnchor(null);
              setLogoutDialogOpen(true);
            }}
            sx={{
              all: 'unset',
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
              boxSizing: 'border-box',
              width: '100%',
              borderRadius: '8px',
              p: '7px 10px',
              cursor: 'pointer',
              color: '#EF4444',
              transition: 'all 0.15s ease',
              '&:hover': {
                bgcolor: '#FEF2F2',
                color: '#DC2626',
              },
            }}
          >
            <LogoutRoundedIcon sx={{ fontSize: 18, color: 'inherit' }} />
            <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: 'inherit' }}>
              Sign Out
            </Typography>
          </Box>
        </Box>
      </Popover>

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
                  bgcolor: '#FAF5FF',
                  color: '#0B1F3A',
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
                  border: n.unread ? '1px solid #F3E8FF' : '1px solid #F1F5F9',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                  fontFamily: 'inherit',
                  fontSize: 'inherit',
                  display: 'block',
                  transition: 'all 0.15s ease',
                  '&:hover': { bgcolor: '#F1F5F9', borderColor: '#CBD5E1' },
                  '&:focus-visible': { outline: '2px solid #0B1F3A', outlineOffset: '1px' },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                    {n.unread && (
                      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#0B1F3A', flexShrink: 0 }} />
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
                        bgcolor: n.category === 'submissions' ? '#ECFDF5' : '#FAF5FF',
                        color: n.category === 'submissions' ? '#059669' : '#0B1F3A',
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
              color: '#0B1F3A',
              borderRadius: '8px',
              py: 0.6,
              '&:hover': { bgcolor: '#FAF5FF' },
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

      {/* Small-Screen Navigation Drawer */}
      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        slotProps={{
          paper: {
            sx: {
              width: 300,
              bgcolor: '#FFFFFF',
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
            },
          },
        }}
      >
        {/* Drawer Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1.5, borderBottom: '1px solid #F1F5F9' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #0B1F3A 0%, #5B2D90 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
              }}
            >
              <CodeRoundedIcon sx={{ fontSize: 18 }} />
            </Box>
            <Typography sx={{ fontWeight: 800, fontSize: '0.98rem', color: '#0F172A' }}>
              TechLearns
            </Typography>
          </Box>
          <IconButton onClick={() => setMobileMenuOpen(false)} size="small">
            <CloseRoundedIcon sx={{ fontSize: 20, color: '#64748B' }} />
          </IconButton>
        </Box>

        {/* Main Destinations */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', px: 1, pt: 0.5 }}>
            Navigation
          </Typography>
          <Box
            component="button"
            onClick={() => {
              setMobileMenuOpen(false);
              router.push('/courses');
            }}
            sx={{
              all: 'unset',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              p: '9px 12px',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.88rem',
              color: isLinkActive('/courses') ? '#0B1F3A' : '#334155',
              bgcolor: isLinkActive('/courses') ? '#FAF5FF' : 'transparent',
              '&:hover': { bgcolor: '#F8FAFC', color: '#0B1F3A' },
            }}
          >
            <MenuBookRoundedIcon sx={{ fontSize: 19 }} />
            Courses
          </Box>

          <Box
            component="button"
            onClick={() => {
              setMobileMenuOpen(false);
              router.push('/problems');
            }}
            sx={{
              all: 'unset',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              p: '9px 12px',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.88rem',
              color: isLinkActive('/problems') ? '#0B1F3A' : '#334155',
              bgcolor: isLinkActive('/problems') ? '#FAF5FF' : 'transparent',
              '&:hover': { bgcolor: '#F8FAFC', color: '#0B1F3A' },
            }}
          >
            <CodeRoundedIcon sx={{ fontSize: 19 }} />
            Practice
          </Box>

          <Box
            component="button"
            onClick={() => {
              setMobileMenuOpen(false);
              router.push('/contests');
            }}
            sx={{
              all: 'unset',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              p: '9px 12px',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.88rem',
              color: isLinkActive('/contests') ? '#0B1F3A' : '#334155',
              bgcolor: isLinkActive('/contests') ? '#FAF5FF' : 'transparent',
              '&:hover': { bgcolor: '#F8FAFC', color: '#0B1F3A' },
            }}
          >
            <EmojiEventsRoundedIcon sx={{ fontSize: 19 }} />
            Compete
          </Box>

          <Box
            component="button"
            onClick={() => {
              setMobileMenuOpen(false);
              router.push('/practice');
            }}
            sx={{
              all: 'unset',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              p: '9px 12px',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.88rem',
              color: isLinkActive('/practice') ? '#0B1F3A' : '#334155',
              bgcolor: isLinkActive('/practice') ? '#FAF5FF' : 'transparent',
              '&:hover': { bgcolor: '#F8FAFC', color: '#0B1F3A' },
            }}
          >
            <TerminalRoundedIcon sx={{ fontSize: 19 }} />
            Compiler
          </Box>
        </Box>

        <Divider sx={{ my: 0.5 }} />

        {/* Resources Section in Drawer */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, flex: 1, overflowY: 'auto' }}>
          <Box
            component="button"
            type="button"
            onClick={() => setMobileResourcesOpen(!mobileResourcesOpen)}
            aria-expanded={mobileResourcesOpen}
            aria-controls="mobile-resources-list"
            sx={{
              all: 'unset',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              px: 1,
              py: 0.75,
              width: '100%',
              boxSizing: 'border-box',
              '&:focus-visible': { outline: '2px solid #0B1F3A', borderRadius: '6px' },
            }}
          >
            <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Resources & Tools
            </Typography>
            <KeyboardArrowDownRoundedIcon
              sx={{
                fontSize: 18,
                color: '#94A3B8',
                transform: mobileResourcesOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease',
              }}
            />
          </Box>

          {mobileResourcesOpen && (
            <Box id="mobile-resources-list" sx={{ display: 'flex', flexDirection: 'column', gap: 0.25, pl: 0.5 }}>
              {[
                { label: 'Role Skill Graph', path: '/students/skill-graph', icon: <AccountTreeRoundedIcon sx={{ fontSize: 18 }} /> },
                { label: 'Project Workspace', path: '/students/projects', icon: <LaptopChromebookRoundedIcon sx={{ fontSize: 18 }} /> },
                { label: 'Corporate Simulation', path: '/students/simulations', icon: <ApartmentRoundedIcon sx={{ fontSize: 18 }} /> },
                { label: 'Career Hub', path: '/students/career-hub', icon: <WorkOutlineRoundedIcon sx={{ fontSize: 18 }} /> },
                { label: 'Jobs / Placements', path: '/students/jobs', icon: <LocationOnRoundedIcon sx={{ fontSize: 18 }} /> },
                { label: 'Bootcamps', path: '/students/bootcamps', icon: <AccessTimeRoundedIcon sx={{ fontSize: 18 }} /> },
                { label: 'Interview Prep', path: '/students/interview-prep', icon: <DescriptionRoundedIcon sx={{ fontSize: 18 }} /> },
                { label: 'AI Coach', path: '/students/ai-coach', icon: <AutoAwesomeRoundedIcon sx={{ fontSize: 18 }} /> },
                { label: 'Community', path: '/students/community', icon: <ForumRoundedIcon sx={{ fontSize: 18 }} /> },
                { label: 'Certifications', path: '/students/certifications', icon: <VerifiedRoundedIcon sx={{ fontSize: 18 }} /> },
                { label: 'Skill Passport & ID', path: '/students/skill-passport', icon: <BadgeOutlinedIcon sx={{ fontSize: 18 }} /> },
              ].map((item) => (
                <Box
                  key={item.label}
                  component="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    router.push(item.path);
                  }}
                  sx={{
                    all: 'unset',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.25,
                    p: '7px 10px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 500,
                    fontSize: '0.82rem',
                    color: '#475569',
                    '&:hover': { bgcolor: '#F8FAFC', color: '#0B1F3A' },
                  }}
                >
                  {item.icon}
                  {item.label}
                </Box>
              ))}

            </Box>
          )}
        </Box>

        <Divider sx={{ my: 1 }} />

        {/* Mobile Profile & Signout actions */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, pt: 0.5 }}>
          <Box
            component="button"
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              router.push('/students/profile');
            }}
            sx={{
              all: 'unset',
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
              p: '8px 10px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.86rem',
              color: '#1E293B',
              '&:hover': { bgcolor: '#F8FAFC', color: '#0B1F3A' },
            }}
          >
            <PersonRoundedIcon sx={{ fontSize: 19, color: '#0B1F3A' }} />
            My Profile
          </Box>

          <Box
            component="button"
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              setLogoutDialogOpen(true);
            }}
            sx={{
              all: 'unset',
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
              p: '8px 10px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.86rem',
              color: '#DC2626',
              '&:hover': { bgcolor: '#FEF2F2' },
            }}
          >
            <LogoutRoundedIcon sx={{ fontSize: 19 }} />
            Sign Out
          </Box>
        </Box>
      </Drawer>
    </>
  );
}
