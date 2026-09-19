'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
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
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import LeaderboardRoundedIcon from '@mui/icons-material/LeaderboardRounded';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';

import { useAppSelector } from '@/store/hooks';
import { apiService } from '@/lib/api-service';

interface FacultyNavbarProps {
  collegeName?: string;
  collegeCode?: string;
  department?: string;
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
  primaryBlue?: string;
}

interface NotificationItem {
  id: string;
  title: string;
  desc: string;
  time: string;
  unread: boolean;
  type: 'info' | 'success' | 'warning';
}

function extractInstitutionDetails(u: any) {
  const memberships = Array.isArray(u?.memberships) ? u.memberships : [];
  return (
    memberships.find(
      (m: any) =>
        m?.role === 'FACULTY' ||
        m?.role === 'COLLEGE_ADMIN' ||
        m?.role === 'INSTITUTION_ADMIN'
    ) ||
    memberships.find((m: any) => m?.institution?.name || m?.college?.name) ||
    memberships[0]
  );
}

export default function FacultyNavbar({
  collegeName,
  collegeCode,
  department,
  searchQuery = '',
  onSearchChange = () => {},
  primaryBlue = '#2563EB',
}: FacultyNavbarProps) {
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const user = useAppSelector((state) => state.auth.user);

  const firstName = user?.name ? user.name.split(' ')[0] : 'Faculty';
  const primaryMembership = extractInstitutionDetails(user);
  const userMemberships = Array.isArray(user?.memberships) ? user.memberships : [];
  const hasAdminMembership = userMemberships.some(
    (m: any) => m?.role === 'COLLEGE_ADMIN' || m?.role === 'INSTITUTION_ADMIN'
  );

  const roleLabel =
    user?.globalRole === 'COLLEGE_ADMIN' ||
    user?.globalRole === 'INSTITUTION_ADMIN' ||
    hasAdminMembership
      ? 'COLLEGE ADMIN / DEPT HEAD'
      : user?.globalRole === 'SUPER_ADMIN'
      ? 'SUPER ADMIN'
      : 'FACULTY MENTOR';

  const displayCollege =
    collegeName ||
    primaryMembership?.institution?.name ||
    primaryMembership?.college?.name ||
    (user as any)?.institution ||
    (user as any)?.institutionName ||
    'Academic Campus';
  const displayCode =
    collegeCode ||
    primaryMembership?.institution?.code ||
    primaryMembership?.college?.code ||
    'FAC';
  const displayDept = department?.trim() || (user as any)?.department?.trim() || '';

  // Quick Action Menu state
  const [createAnchorEl, setCreateAnchorEl] = useState<null | HTMLElement>(null);
  const isCreateOpen = Boolean(createAnchorEl);

  // Notifications Popover state
  const [notifAnchorEl, setNotifAnchorEl] = useState<null | HTMLElement>(null);
  const isNotifOpen = Boolean(notifAnchorEl);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    async function loadLiveNotifications() {
      try {
        const subs = await apiService.getLiveSubmissions(5);
        if (subs && subs.length > 0) {
          const liveNotifs: NotificationItem[] = subs.slice(0, 4).map((s: any, idx: number) => ({
            id: s.id || `notif-${idx}`,
            title: s.verdict === 'ACCEPTED' ? 'Solution Accepted' : 'Submission Evaluated',
            desc: `${s.user?.name || s.user?.email || 'Student'} on ${s.problem?.title || 'Problem'} (${s.language || 'Code'})`,
            time: 'Just now',
            unread: idx < 2,
            type: s.verdict === 'ACCEPTED' ? 'success' : 'info',
          }));
          setNotifications(liveNotifs);
        }
      } catch (err) {
        console.warn('Faculty navbar notification feed:', err);
      }
    }
    loadLiveNotifications();
  }, []);

  const unreadCount = notifications.filter((n) => n.unread).length;

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

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const handleNotificationClick = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  const handleActionSelect = (route: string) => {
    setCreateAnchorEl(null);
    router.push(route);
  };

  return (
    <Box
      component="header"
      sx={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        pt: { xs: 2, md: 2 },
        pb: 1,
      }}
    >
      {/* Left: Greeting, Role Chip & Academic Details */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              color: '#0F172A',
              fontSize: '1.35rem',
              letterSpacing: '-0.02em',
            }}
          >
            Hello, {firstName}! 👋
          </Typography>
          <Chip
            label={roleLabel}
            size="small"
            sx={{
              bgcolor: '#EFF6FF',
              color: '#2563EB',
              fontWeight: 800,
              fontSize: '0.68rem',
              height: 22,
              borderRadius: '6px',
              border: '1px solid #BFDBFE',
            }}
          />
        </Box>
        <Typography
          variant="body2"
          sx={{
            color: '#64748B',
            fontSize: '0.8rem',
            fontWeight: 500,
            mt: 0.25,
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
          }}
        >
          <span>{displayCollege} ({displayCode})</span>
          {displayDept && (
            <>
              <span>•</span>
              <span>{displayDept}</span>
            </>
          )}
        </Typography>
      </Box>

      {/* Right: SearchBar, Notifications & Quick Action Button */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75 }}>
        {/* Search Input with ⌘K Badge */}
        <TextField
          inputRef={searchInputRef}
          size="small"
          placeholder="Search cohorts, courses, problems..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#94A3B8', fontSize: 18 }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <Box
                    sx={{
                      px: 0.75,
                      py: 0.2,
                      borderRadius: '6px',
                      bgcolor: '#F1F5F9',
                      color: '#64748B',
                      fontSize: '0.68rem',
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      border: '1px solid #E2E8F0',
                    }}
                  >
                    ⌘K
                  </Box>
                </InputAdornment>
              ),
            },
          }}
          sx={{
            width: { xs: 160, sm: 270 },
            display: { xs: 'none', sm: 'block' },
            '& .MuiOutlinedInput-root': {
              borderRadius: '20px',
              bgcolor: '#FFFFFF',
              color: '#0F172A',
              fontSize: '0.84rem',
              fontWeight: 500,
              height: 40,
              transition: 'all 0.2s ease',
              border: '1px solid #E2E8F0',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
              '& fieldset': { border: 'none' },
              '&:hover': { bgcolor: '#FFFFFF', borderColor: '#CBD5E1' },
              '&.Mui-focused': {
                bgcolor: '#FFFFFF',
                borderColor: '#2563EB',
                boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.15)',
              },
            },
            '& input::placeholder': {
              color: '#94A3B8',
              opacity: 1,
            },
          }}
        />

        {/* Notifications Icon with Interactive Popover */}
        <Tooltip title={unreadCount > 0 ? `Notifications (${unreadCount} new)` : 'Notifications'}>
          <IconButton
            onClick={(e) => setNotifAnchorEl(e.currentTarget)}
            sx={{
              width: 40,
              height: 40,
              borderRadius: '20px',
              bgcolor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              color: '#64748B',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
              position: 'relative',
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: '#F8FAFC',
                color: '#0F172A',
                borderColor: '#CBD5E1',
              },
            }}
          >
            <NotificationsNoneRoundedIcon sx={{ fontSize: 20 }} />
            {unreadCount > 0 && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 9,
                  right: 9,
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  bgcolor: '#2563EB',
                  border: '1px solid #FFFFFF',
                  boxShadow: '0 0 6px rgba(37, 99, 235, 0.8)',
                }}
              />
            )}
          </IconButton>
        </Tooltip>

        {/* Notifications Dropdown Popover */}
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
                borderRadius: '18px',
                p: 2,
                boxShadow: '0 14px 40px -10px rgba(15, 23, 42, 0.15)',
                border: '1px solid #E2E8F0',
                mt: 1,
              },
            },
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1.5, borderBottom: '1px solid #F1F5F9' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A' }}>
                Notifications
              </Typography>
              {unreadCount > 0 && (
                <Chip
                  label={`${unreadCount} new`}
                  size="small"
                  sx={{ height: 18, fontSize: '0.66rem', fontWeight: 800, bgcolor: '#EFF6FF', color: '#2563EB' }}
                />
              )}
            </Box>

            {unreadCount > 0 && (
              <Button
                size="small"
                startIcon={<DoneAllRoundedIcon sx={{ fontSize: 14 }} />}
                onClick={handleMarkAllRead}
                sx={{ textTransform: 'none', fontSize: '0.72rem', fontWeight: 600, color: '#64748B', p: 0.5 }}
              >
                Mark all read
              </Button>
            )}
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1.5, maxHeight: 300, overflowY: 'auto' }}>
            {notifications.map((notif) => (
              <Box
                key={notif.id}
                role="button"
                tabIndex={0}
                onClick={() => handleNotificationClick(notif.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleNotificationClick(notif.id);
                  }
                }}
                sx={{
                  p: 1.25,
                  borderRadius: '10px',
                  bgcolor: notif.unread ? '#F8FAFC' : '#FFFFFF',
                  border: notif.unread ? '1px solid #DBEAFE' : '1px solid #F1F5F9',
                  cursor: 'pointer',
                  outline: 'none',
                  transition: 'all 0.15s ease',
                  '&:hover': { bgcolor: '#F1F5F9' },
                  '&:focus-visible': {
                    boxShadow: '0 0 0 2px #2563EB',
                  },
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: notif.unread ? 800 : 600, color: '#0F172A', fontSize: '0.82rem' }}>
                    {notif.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.7rem', flexShrink: 0 }}>
                    {notif.time}
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.75rem', mt: 0.25, display: 'block', lineHeight: 1.35 }}>
                  {notif.desc}
                </Typography>
              </Box>
            ))}
          </Box>
        </Popover>

        {/* Primary Action Button with Quick Action Menu */}
        <Button
          variant="contained"
          onClick={(e) => setCreateAnchorEl(e.currentTarget)}
          startIcon={<AddRoundedIcon sx={{ fontSize: 18 }} />}
          sx={{
            background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
            color: '#FFFFFF',
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '0.84rem',
            borderRadius: '20px',
            px: 2.4,
            py: 0.95,
            height: 40,
            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
            border: 'none',
            '&:hover': {
              background: 'linear-gradient(135deg, #1D4ED8 0%, #1E40AF 100%)',
              boxShadow: '0 6px 20px rgba(37, 99, 235, 0.45)',
              transform: 'translateY(-1px)',
            },
            transition: 'all 0.2s ease',
          }}
        >
          Quick Action
        </Button>

        {/* Quick Action Dropdown Menu */}
        <Menu
          anchorEl={createAnchorEl}
          open={isCreateOpen}
          onClose={() => setCreateAnchorEl(null)}
          slotProps={{
            paper: {
              sx: {
                borderRadius: '16px',
                minWidth: 220,
                boxShadow: '0 14px 35px rgba(15, 23, 42, 0.12)',
                border: '1px solid #E2E8F0',
                p: 0.75,
                mt: 1,
              },
            },
          }}
        >
          <MenuItem onClick={() => handleActionSelect('/faculty/profile?tab=batches')} sx={{ borderRadius: '10px', py: 1 }}>
            <ListItemIcon sx={{ color: '#2563EB', minWidth: 32 }}>
              <SchoolRoundedIcon sx={{ fontSize: 18 }} />
            </ListItemIcon>
            <ListItemText
              slotProps={{ primary: { sx: { fontSize: '0.84rem', fontWeight: 600 } } }}
              primary="Assigned Cohorts & Batches"
            />
          </MenuItem>

          <MenuItem onClick={() => handleActionSelect('/courses')} sx={{ borderRadius: '10px', py: 1 }}>
            <ListItemIcon sx={{ color: '#0284C7', minWidth: 32 }}>
              <MenuBookRoundedIcon sx={{ fontSize: 18 }} />
            </ListItemIcon>
            <ListItemText
              slotProps={{ primary: { sx: { fontSize: '0.84rem', fontWeight: 600 } } }}
              primary="Curriculum & Lab Courses"
            />
          </MenuItem>

          <MenuItem onClick={() => handleActionSelect('/problems')} sx={{ borderRadius: '10px', py: 1 }}>
            <ListItemIcon sx={{ color: '#EA580C', minWidth: 32 }}>
              <CodeRoundedIcon sx={{ fontSize: 18 }} />
            </ListItemIcon>
            <ListItemText
              slotProps={{ primary: { sx: { fontSize: '0.84rem', fontWeight: 600 } } }}
              primary="Coding Problems Archive"
            />
          </MenuItem>

          <Divider sx={{ my: 0.75 }} />

          <MenuItem onClick={() => handleActionSelect('/contests')} sx={{ borderRadius: '10px', py: 1 }}>
            <ListItemIcon sx={{ color: '#CA8A04', minWidth: 32 }}>
              <EmojiEventsRoundedIcon sx={{ fontSize: 18 }} />
            </ListItemIcon>
            <ListItemText
              slotProps={{ primary: { sx: { fontSize: '0.84rem', fontWeight: 600 } } }}
              primary="Competitive Contests"
            />
          </MenuItem>

          <MenuItem onClick={() => handleActionSelect('/leaderboard')} sx={{ borderRadius: '10px', py: 1 }}>
            <ListItemIcon sx={{ color: '#16A34A', minWidth: 32 }}>
              <LeaderboardRoundedIcon sx={{ fontSize: 18 }} />
            </ListItemIcon>
            <ListItemText
              slotProps={{ primary: { sx: { fontSize: '0.84rem', fontWeight: 600 } } }}
              primary="Global Leaderboard"
            />
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
}
