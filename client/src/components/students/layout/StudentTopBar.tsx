'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Avatar,
  Chip,
  IconButton,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Popover,
  Divider,
  Tooltip,
} from '@mui/material';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import NotificationsActiveRoundedIcon from '@mui/icons-material/NotificationsActiveRounded';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import CampaignRoundedIcon from '@mui/icons-material/CampaignRounded';
import {
  FaFire,
  FaTrophy,
} from 'react-icons/fa6';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logoutUser } from '@/store/slices/authSlice';
import LogoutConfirmModal from '@/components/shared/LogoutConfirmModal';
import StarRatingBadge from '@/components/shared/StarRatingBadge';
import { useNotifications, type AppNotification } from '@/context/NotificationContext';
import SendNotificationModal from '@/components/shared/SendNotificationModal';

interface StudentTopBarProps {
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  streakDays?: number;
  contestRating?: number;
  ratingTier?: string;
}

export default function StudentTopBar({
  searchQuery = '',
  onSearchChange,
  streakDays,
  contestRating,
  ratingTier,
}: StudentTopBarProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifAnchorEl, setNotifAnchorEl] = useState<null | HTMLElement>(null);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [sendNotifOpen, setSendNotifOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Global Keyboard shortcut for ⌘K / Ctrl+K
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

  const handleOpenMenu = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  };
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleOpenNotif = (e: React.MouseEvent<HTMLElement>) => {
    setNotifAnchorEl(e.currentTarget);
  };
  const handleCloseNotif = () => {
    setNotifAnchorEl(null);
  };

  const handleNotificationClick = (notif: AppNotification) => {
    markAsRead(notif.id);
    handleCloseNotif();
    if (notif.actionUrl) {
      router.push(notif.actionUrl);
    }
  };

  const handleConfirmLogout = async () => {
    setLogoutModalOpen(false);
    await dispatch(logoutUser());
    router.push('/login');
  };

  const displayName = user?.name || 'Student';
  const displayEmail = user?.email || 'student@techlearns.io';
  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .filter(Boolean)
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'ST';

  const safeStreak = typeof streakDays === 'number' ? streakDays : (typeof (user as any)?.streakDays === 'number' ? (user as any).streakDays : undefined);
  const safeRating = typeof contestRating === 'number' ? contestRating : (typeof (user as any)?.contestRating === 'number' ? (user as any).contestRating : undefined);

  return (
    <>
      {/* 🚀 Floating Pills Header */}
      <Box
        component="header"
        sx={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: { xs: 1.25, sm: 1.5, md: 2 },
          py: 0.5,
          bgcolor: 'transparent',
          transition: 'all 0.3s ease',
        }}
      >
        {/* 1. Left: Search Pill Input with ⌘K Badge */}
        <Box
          sx={{
            flex: { xs: 1, md: '0 1 440px' },
            position: 'relative',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            maxWidth: { xs: '100%', md: isSearchFocused ? 480 : 420 },
          }}
        >
          <TextField
            inputRef={searchInputRef}
            fullWidth
            size="small"
            placeholder="Search problems, courses, projects..."
            value={searchQuery}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            onChange={(e) => onSearchChange?.(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start" sx={{ ml: 0.5, mr: 0.5 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 28,
                        height: 28,
                        borderRadius: '9999px',
                        bgcolor: isSearchFocused ? '#EFF6FF' : '#F1F5F9',
                        color: isSearchFocused ? '#2563EB' : '#94A3B8',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <SearchRoundedIcon sx={{ fontSize: 17 }} />
                    </Box>
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end" sx={{ mr: 0.5, gap: 0.5 }}>
                    {searchQuery && (
                      <IconButton
                        size="small"
                        onClick={() => onSearchChange?.('')}
                        sx={{
                          p: 0.35,
                          borderRadius: '9999px',
                          color: '#94A3B8',
                          '&:hover': { color: '#0F172A', bgcolor: '#E2E8F0' },
                        }}
                      >
                        <CloseRoundedIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    )}
                    <Box
                      sx={{
                        display: { xs: 'none', sm: 'inline-flex' },
                        alignItems: 'center',
                        px: 1,
                        py: 0.25,
                        borderRadius: '9999px',
                        bgcolor: '#F1F5F9',
                        color: '#64748B',
                        fontSize: '0.65rem',
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        border: '1px solid #E2E8F0',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                        userSelect: 'none',
                      }}
                    >
                      ⌘K
                    </Box>
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '9999px',
                bgcolor: '#FFFFFF',
                fontSize: '0.84rem',
                fontWeight: 500,
                color: '#0F172A',
                height: 40,
                border: '1px solid #E2E8F0',
                boxShadow: '0 1px 4px rgba(0, 0, 0, 0.04)',
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                '& fieldset': { border: 'none' },
                '&:hover': {
                  borderColor: '#CBD5E1',
                  bgcolor: '#FFFFFF',
                  boxShadow: '0 3px 10px rgba(0, 0, 0, 0.06)',
                },
                '&.Mui-focused': {
                  borderColor: '#2563EB',
                  bgcolor: '#FFFFFF',
                  boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.12), 0 3px 10px rgba(37, 99, 235, 0.08)',
                },
              },
              '& input::placeholder': {
                color: '#94A3B8',
                fontSize: '0.81rem',
                opacity: 1,
              },
            }}
          />
        </Box>

        {/* 2. Right: Content Pills Container */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.75, sm: 1, md: 1.25 } }}>
          {/* Daily Solve Quick Pill Action */}
          <Tooltip title="Daily Problem Challenge (+25 XP)" arrow placement="bottom">
            <Button
              onClick={() => router.push('/problems')}
              sx={{
                display: { xs: 'none', lg: 'inline-flex' },
                alignItems: 'center',
                gap: 0.75,
                height: 36,
                px: 1.8,
                borderRadius: '9999px',
                background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
                color: '#047857',
                border: '1px solid #A7F3D0',
                fontSize: '0.75rem',
                fontWeight: 800,
                textTransform: 'none',
                boxShadow: '0 1px 3px rgba(16, 185, 129, 0.1)',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              <BoltRoundedIcon sx={{ fontSize: 16, color: '#059669' }} />
              <span>Daily Solve</span>
            </Button>
          </Tooltip>

          {/* Streak Pill - Conditionally rendered only when numeric streak exists */}
          {typeof safeStreak === 'number' && (
            <Tooltip
              title={`🔥 ${safeStreak} Day Streak! Solve 1 problem today to keep your streak.`}
              arrow
              placement="bottom"
            >
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.75,
                  height: 36,
                  px: 1.5,
                  borderRadius: '9999px',
                  background: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)',
                  border: '1px solid #FED7AA',
                  boxShadow: '0 1px 4px rgba(234, 88, 12, 0.08)',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  userSelect: 'none',
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 14px rgba(234, 88, 12, 0.22)',
                    borderColor: '#FDBA74',
                  },
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 22,
                    height: 22,
                    borderRadius: '9999px',
                    bgcolor: '#FFEDD5',
                  }}
                >
                  <FaFire size={13} color="#EA580C" />
                </Box>
                <Typography
                  sx={{
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    color: '#C2410C',
                    letterSpacing: '-0.01em',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {safeStreak} <span style={{ fontWeight: 600 }}>Day Streak</span>
                </Typography>
              </Box>
            </Tooltip>
          )}

          {/* Star Rating Badge - Conditionally rendered only when numeric contest rating exists */}
          {typeof safeRating === 'number' && (
            <Box sx={{ display: { xs: 'none', sm: 'inline-flex' } }}>
              <StarRatingBadge rating={safeRating} size="small" showDivision={true} />
            </Box>
          )}

          {/* Notification Bell Pill */}
          <Tooltip title={unreadCount > 0 ? `Alerts (${unreadCount} unread)` : 'Notifications'} arrow placement="bottom">
            <IconButton
              onClick={handleOpenNotif}
              sx={{
                width: 36,
                height: 36,
                borderRadius: '9999px',
                bgcolor: Boolean(notifAnchorEl) ? '#EFF6FF' : '#FFFFFF',
                border: Boolean(notifAnchorEl) ? '1px solid #BFDBFE' : '1px solid #E2E8F0',
                color: Boolean(notifAnchorEl) ? '#2563EB' : '#64748B',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                position: 'relative',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: '#F8FAFC',
                  color: '#0F172A',
                  borderColor: '#CBD5E1',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              {unreadCount > 0 ? (
                <NotificationsActiveRoundedIcon sx={{ fontSize: 18, color: '#2563EB' }} />
              ) : (
                <NotificationsNoneRoundedIcon sx={{ fontSize: 18 }} />
              )}
              {unreadCount > 0 && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 6,
                    right: 6,
                    width: 7,
                    height: 7,
                    borderRadius: '9999px',
                    bgcolor: '#2563EB',
                    border: '1.5px solid #FFFFFF',
                    boxShadow: '0 0 8px rgba(37, 99, 235, 0.9)',
                    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                    '@keyframes pulse': {
                      '0%, 100%': { opacity: 1 },
                      '50%': { opacity: 0.4 },
                    },
                  }}
                />
              )}
            </IconButton>
          </Tooltip>

          {/* Notifications Dropdown Popover */}
          <Popover
            open={Boolean(notifAnchorEl)}
            anchorEl={notifAnchorEl}
            onClose={handleCloseNotif}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            slotProps={{
              paper: {
                sx: {
                  width: { xs: 320, sm: 370 },
                  borderRadius: '24px',
                  p: 2,
                  bgcolor: 'rgba(255, 255, 255, 0.98)',
                  backdropFilter: 'blur(20px)',
                  boxShadow: '0 20px 45px -10px rgba(15, 23, 42, 0.18)',
                  border: '1px solid #E2E8F0',
                  mt: 1.25,
                },
              },
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1.5, borderBottom: '1px solid #F1F5F9' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.92rem' }}>
                  Notifications
                </Typography>
                {unreadCount > 0 && (
                  <Chip
                    label={`${unreadCount} new`}
                    size="small"
                    sx={{ height: 20, borderRadius: '9999px', fontSize: '0.66rem', fontWeight: 800, bgcolor: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE' }}
                  />
                )}
              </Box>

              {unreadCount > 0 && (
                <Button
                  size="small"
                  startIcon={<DoneAllRoundedIcon sx={{ fontSize: 14 }} />}
                  onClick={markAllAsRead}
                  sx={{ textTransform: 'none', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 600, color: '#64748B', px: 1.2, py: 0.4, '&:hover': { color: '#2563EB', bgcolor: '#EFF6FF' } }}
                >
                  Mark all read
                </Button>
              )}
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1.5, maxHeight: 320, overflowY: 'auto' }}>
              {notifications.length === 0 ? (
                <Box sx={{ py: 3, textAlign: 'center' }}>
                  <Typography sx={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                    No notifications yet. You&apos;re all caught up!
                  </Typography>
                </Box>
              ) : (
                notifications.map((notif) => (
                  <Box
                    key={notif.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleNotificationClick(notif)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleNotificationClick(notif);
                      }
                    }}
                    sx={{
                      p: 1.25,
                      borderRadius: '14px',
                      bgcolor: notif.unread ? '#F8FAFC' : '#FFFFFF',
                      border: notif.unread ? '1px solid #DBEAFE' : '1px solid #F1F5F9',
                      cursor: 'pointer',
                      outline: 'none',
                      transition: 'all 0.15s ease',
                      '&:hover': { bgcolor: '#F1F5F9', borderColor: '#CBD5E1' },
                      '&:focus-visible': {
                        boxShadow: '0 0 0 2px #2563EB',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        {notif.unread && (
                          <Box sx={{ width: 6, height: 6, borderRadius: '9999px', bgcolor: '#2563EB', flexShrink: 0 }} />
                        )}
                        <Typography sx={{ fontWeight: notif.unread ? 800 : 600, color: '#0F172A', fontSize: '0.82rem' }}>
                          {notif.title}
                        </Typography>
                      </Box>
                      <Typography sx={{ color: '#94A3B8', fontSize: '0.68rem', flexShrink: 0, fontWeight: 500 }}>
                        {notif.time}
                      </Typography>
                    </Box>
                    <Typography sx={{ color: '#64748B', fontSize: '0.74rem', mt: 0.35, display: 'block', lineHeight: 1.35, pl: notif.unread ? 1.5 : 0 }}>
                      {notif.desc}
                    </Typography>
                  </Box>
                ))
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

          {/* User Profile Pill */}
          <Box
            component="button"
            type="button"
            id="student-account-menu-button"
            aria-controls={Boolean(anchorEl) ? 'student-account-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={Boolean(anchorEl) ? 'true' : 'false'}
            aria-label="User account menu"
            onClick={handleOpenMenu}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
              cursor: 'pointer',
              bgcolor: Boolean(anchorEl) ? '#F8FAFC' : '#FFFFFF',
              py: '3px',
              pl: '3px',
              pr: { xs: '6px', md: '14px' },
              borderRadius: '9999px',
              border: Boolean(anchorEl) ? '1px solid #BFDBFE' : '1px solid #E2E8F0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              fontFamily: 'inherit',
              textAlign: 'left',
              position: 'relative',
              '&:hover': {
                bgcolor: '#F8FAFC',
                borderColor: '#CBD5E1',
                boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                transform: 'translateY(-1px)',
              },
              '&:focus-visible': {
                outline: 'none',
                borderColor: '#2563EB',
                boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.15)',
              },
            }}
          >
            {/* Avatar Pill with Status Indicator */}
            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
              <Avatar
                src={(user as any)?.avatarUrl}
                sx={{
                  width: 30,
                  height: 30,
                  borderRadius: '9999px',
                  background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  color: '#FFFFFF',
                  boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)',
                }}
              >
                <span suppressHydrationWarning>{initials}</span>
              </Avatar>
              <Box
                sx={{
                  position: 'absolute',
                  bottom: -1,
                  right: -1,
                  width: 8,
                  height: 8,
                  borderRadius: '9999px',
                  bgcolor: '#16A34A',
                  border: '1.5px solid #FFFFFF',
                  boxShadow: '0 0 4px rgba(22, 163, 74, 0.6)',
                }}
              />
            </Box>

            <Box sx={{ display: { xs: 'none', md: 'block' }, textAlign: 'left', pr: 0.5 }}>
              <Typography
                sx={{
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  color: '#0F172A',
                  lineHeight: 1.15,
                  letterSpacing: '-0.01em',
                }}
                suppressHydrationWarning
              >
                {displayName}
              </Typography>
              <Typography sx={{ fontSize: '0.67rem', color: '#64748B', fontWeight: 600 }}>
                Student Coder
              </Typography>
            </Box>

            <KeyboardArrowDownRoundedIcon
              sx={{
                fontSize: 18,
                color: Boolean(anchorEl) ? '#2563EB' : '#94A3B8',
                transition: 'transform 0.25s ease, color 0.2s ease',
                transform: Boolean(anchorEl) ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* Profile Menu Dropdown */}
      <Menu
        id="student-account-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        slotProps={{
          list: {
            'aria-labelledby': 'student-account-menu-button',
            sx: { p: 0.75 },
          },
          paper: {
            sx: {
              borderRadius: '24px',
              mt: 1.25,
              minWidth: 245,
              bgcolor: 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(20px)',
              color: '#0F172A',
              boxShadow: '0 20px 45px -10px rgba(15, 23, 42, 0.16), 0 0 1px 1px rgba(0,0,0,0.04)',
              border: '1px solid #E2E8F0',
            },
          },
        }}
      >
        {/* User Card Header */}
        <Box sx={{ px: 1.75, py: 1.5, bgcolor: '#F8FAFC', borderRadius: '16px', mb: 0.75 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <Avatar
              src={(user as any)?.avatarUrl}
              sx={{
                width: 36,
                height: 36,
                borderRadius: '9999px',
                background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
                fontSize: '0.85rem',
                fontWeight: 800,
                color: '#FFFFFF',
              }}
            >
              <span suppressHydrationWarning>{initials}</span>
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: '0.86rem', fontWeight: 800, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {displayName}
              </Typography>
              <Typography sx={{ fontSize: '0.72rem', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {displayEmail}
              </Typography>
            </Box>
          </Box>

          {/* Quick User Stats Ribbon - Conditionally rendered only when stats exist */}
          {(typeof safeStreak === 'number' || typeof safeRating === 'number') && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.25 }}>
              {typeof safeStreak === 'number' && (
                <Box
                  sx={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    px: 1,
                    py: 0.5,
                    borderRadius: '9999px',
                    bgcolor: '#FFF7ED',
                    border: '1px solid #FED7AA',
                  }}
                >
                  <FaFire size={11} color="#EA580C" />
                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: '#C2410C' }}>
                    {safeStreak}d streak
                  </Typography>
                </Box>
              )}
              {typeof safeRating === 'number' && (
                <Box
                  sx={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    px: 1,
                    py: 0.5,
                    borderRadius: '9999px',
                    bgcolor: '#F0FDF4',
                    border: '1px solid #BBF7D0',
                  }}
                >
                  <FaTrophy size={11} color="#16A34A" />
                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: '#15803D' }}>
                    {safeRating} pts
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </Box>

        {/* Menu Items */}
        <MenuItem
          onClick={() => {
            handleCloseMenu();
            router.push('/students/profile');
          }}
          sx={{
            borderRadius: '12px',
            fontSize: '0.84rem',
            py: 1,
            gap: 1.5,
            color: '#334155',
            fontWeight: 600,
            '&:hover': { bgcolor: '#F1F5F9', color: '#0F172A' },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 28,
              height: 28,
              borderRadius: '9999px',
              bgcolor: '#EFF6FF',
              color: '#2563EB',
            }}
          >
            <PersonOutlineRoundedIcon sx={{ fontSize: 17 }} />
          </Box>
          My Profile
        </MenuItem>

        <MenuItem
          onClick={() => {
            handleCloseMenu();
            router.push('/students/skill-passport');
          }}
          sx={{
            borderRadius: '12px',
            fontSize: '0.84rem',
            py: 1,
            gap: 1.5,
            color: '#334155',
            fontWeight: 600,
            '&:hover': { bgcolor: '#F1F5F9', color: '#0F172A' },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 28,
              height: 28,
              borderRadius: '9999px',
              bgcolor: '#FAF5FF',
              color: '#9333EA',
            }}
          >
            <WorkspacePremiumRoundedIcon sx={{ fontSize: 17 }} />
          </Box>
          Skill Passport
        </MenuItem>

        <MenuItem
          onClick={() => {
            handleCloseMenu();
            router.push('/problems');
          }}
          sx={{
            borderRadius: '12px',
            fontSize: '0.84rem',
            py: 1,
            gap: 1.5,
            color: '#334155',
            fontWeight: 600,
            '&:hover': { bgcolor: '#F1F5F9', color: '#0F172A' },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 28,
              height: 28,
              borderRadius: '9999px',
              bgcolor: '#FFF7ED',
              color: '#EA580C',
            }}
          >
            <CodeRoundedIcon sx={{ fontSize: 17 }} />
          </Box>
          Problems Archive
        </MenuItem>

        <MenuItem
          onClick={() => {
            handleCloseMenu();
            router.push('/courses');
          }}
          sx={{
            borderRadius: '12px',
            fontSize: '0.84rem',
            py: 1,
            gap: 1.5,
            color: '#334155',
            fontWeight: 600,
            '&:hover': { bgcolor: '#F1F5F9', color: '#0F172A' },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 28,
              height: 28,
              borderRadius: '9999px',
              bgcolor: '#F0F9FF',
              color: '#0284C7',
            }}
          >
            <MenuBookOutlinedIcon sx={{ fontSize: 17 }} />
          </Box>
          My Courses
        </MenuItem>

        <MenuItem
          onClick={() => {
            handleCloseMenu();
            router.push('/students/settings');
          }}
          sx={{
            borderRadius: '12px',
            fontSize: '0.84rem',
            py: 1,
            gap: 1.5,
            color: '#334155',
            fontWeight: 600,
            '&:hover': { bgcolor: '#F1F5F9', color: '#0F172A' },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 28,
              height: 28,
              borderRadius: '9999px',
              bgcolor: '#F8FAFC',
              color: '#64748B',
            }}
          >
            <SettingsOutlinedIcon sx={{ fontSize: 17 }} />
          </Box>
          Account Settings
        </MenuItem>

        {user?.globalRole && user.globalRole !== 'STUDENT' && (
          <MenuItem
            onClick={() => {
              handleCloseMenu();
              setSendNotifOpen(true);
            }}
            sx={{
              borderRadius: '12px',
              fontSize: '0.84rem',
              py: 1,
              gap: 1.5,
              color: '#2563EB',
              bgcolor: '#EFF6FF',
              fontWeight: 700,
              mt: 0.5,
              '&:hover': { bgcolor: '#DBEAFE' },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 28,
                height: 28,
                borderRadius: '9999px',
                bgcolor: '#DBEAFE',
                color: '#2563EB',
              }}
            >
              <CampaignRoundedIcon sx={{ fontSize: 17 }} />
            </Box>
            Broadcast Push Alert
          </MenuItem>
        )}

        <Divider sx={{ my: 0.75 }} />

        <MenuItem
          onClick={() => {
            handleCloseMenu();
            setLogoutModalOpen(true);
          }}
          sx={{
            borderRadius: '12px',
            fontSize: '0.84rem',
            py: 1,
            gap: 1.5,
            color: '#DC2626',
            fontWeight: 600,
            '&:hover': { bgcolor: '#FEF2F2', color: '#B91C1C' },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 28,
              height: 28,
              borderRadius: '9999px',
              bgcolor: '#FEF2F2',
              color: '#DC2626',
            }}
          >
            <LogoutRoundedIcon sx={{ fontSize: 17 }} />
          </Box>
          Sign Out
        </MenuItem>
      </Menu>

      <LogoutConfirmModal
        open={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
      />

      <SendNotificationModal
        open={sendNotifOpen}
        onClose={() => setSendNotifOpen(false)}
      />
    </>
  );
}
