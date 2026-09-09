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
  Skeleton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import TerminalRoundedIcon from '@mui/icons-material/TerminalRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import FlashOnRoundedIcon from '@mui/icons-material/FlashOnRounded';

import { useAppSelector } from '@/store/hooks';
import { apiService } from '@/lib/api-service';

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
  type: 'info' | 'success' | 'warning';
}

export default function StudentNavbar({
  searchQuery = '',
  onSearchChange = () => {},
  streakDays,
  contestRating,
  ratingTier,
}: StudentNavbarProps) {
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const user = useAppSelector((state) => state.auth.user);
  const [activeUser, setActiveUser] = useState(user);
  const [loading, setLoading] = useState<boolean>(!user?.name);

  useEffect(() => {
    if (user?.name) {
      setActiveUser(user);
      setLoading(false);
    } else {
      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem('codeplatform_user');
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed?.name) {
              setActiveUser(parsed);
              setLoading(false);
            }
          }
        } catch {}
      }
    }
  }, [user]);

  useEffect(() => {
    async function loadLiveUser() {
      try {
        const res = await apiService.getProfile();
        const liveUser = res?.data || res;
        if (liveUser && liveUser.name) {
          setActiveUser(liveUser);
        }
      } catch {
      } finally {
        setLoading(false);
      }
    }
    loadLiveUser();
  }, []);

  const displayName = activeUser?.name || user?.name || '';
  const firstName = displayName ? displayName.split(' ')[0] : '';
  const roleLabel = activeUser?.globalRole ? activeUser.globalRole.replace('_', ' ') : user?.globalRole ? user.globalRole.replace('_', ' ') : 'STUDENT';

  // Notifications Popover state
  const [notifAnchorEl, setNotifAnchorEl] = useState<null | HTMLElement>(null);
  const isNotifOpen = Boolean(notifAnchorEl);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'n-1',
      title: 'Submission Accepted',
      desc: 'Problem #407 Trapping Rain Water II passed all 42 test cases!',
      time: '12m ago',
      unread: true,
      type: 'success',
    },
    {
      id: 'n-2',
      title: 'Upcoming Weekly Contest',
      desc: 'Weekly Grand Arena #108 starts in 2 hours. Register now.',
      time: '1h ago',
      unread: true,
      type: 'info',
    },
    {
      id: 'n-3',
      title: 'Course Milestone Unlocked',
      desc: 'Advanced Graph Algorithms: Lesson 4 Segment Trees is now available.',
      time: 'Yesterday',
      unread: false,
      type: 'info',
    },
  ]);

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

  // Quick Action Menu state (in place of redundant profile popup)
  const [quickActionAnchor, setQuickActionAnchor] = useState<null | HTMLElement>(null);
  const isQuickActionOpen = Boolean(quickActionAnchor);

  const handleActionSelect = (route: string) => {
    setQuickActionAnchor(null);
    router.push(route);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      router.push(`/problems?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

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
        pb: 2,
        mb: 1,
      }}
    >
      {/* Left Greeting & Role Badge */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minHeight: 32 }}>
          {loading || !firstName ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Skeleton variant="rounded" width={160} height={28} sx={{ borderRadius: '8px' }} animation="wave" />
              <Skeleton variant="rounded" width={68} height={22} sx={{ borderRadius: '6px' }} animation="wave" />
            </Box>
          ) : (
            <>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.35rem', letterSpacing: '-0.02em' }}>
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
            </>
          )}
        </Box>
        <Typography variant="body2" sx={{ color: '#64748B', fontSize: '0.8rem', fontWeight: 500, mt: 0.25 }}>
          Ready for today&apos;s challenges & compiler cluster throughput
        </Typography>
      </Box>

      {/* Right Controls: Search with ⌘K, Notifications & Profile Action Button */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75 }}>
        {/* Search Field with ⌘K Badge */}
        <TextField
          inputRef={searchInputRef}
          size="small"
          placeholder="Search for entities, problems..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={handleSearchKeyDown}
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
            width: { xs: 160, sm: 260, md: 300 },
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

        {/* Notifications Bell Button */}
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

        {/* Daily Coding Streak Pill (if available) */}
        {streakDays !== undefined && (
          <Tooltip title={`${streakDays}-day active coding streak! Solve a problem today to keep it active.`} arrow>
            <Box
              sx={{
                display: { xs: 'none', md: 'flex' },
                alignItems: 'center',
                gap: 0.65,
                px: 1.6,
                py: 0.75,
                height: 40,
                borderRadius: '20px',
                bgcolor: '#FFF7ED',
                border: '1px solid #FFEDD5',
                color: '#C2410C',
                fontWeight: 700,
                fontSize: '0.8rem',
                boxShadow: '0 1px 3px rgba(234, 88, 12, 0.08)',
                cursor: 'default',
              }}
            >
              <LocalFireDepartmentRoundedIcon sx={{ fontSize: 18, color: '#EA580C' }} />
              <span>{streakDays}d Streak</span>
            </Box>
          </Tooltip>
        )}

        {/* Primary Action Button: "+ Quick Practice" with Action Dropdown */}
        <Button
          variant="contained"
          startIcon={<FlashOnRoundedIcon sx={{ fontSize: 17 }} />}
          endIcon={<KeyboardArrowDownRoundedIcon sx={{ fontSize: 16 }} />}
          onClick={(e) => setQuickActionAnchor(e.currentTarget)}
          sx={{
            background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
            color: '#FFFFFF',
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '0.84rem',
            borderRadius: '9999px',
            px: 2.2,
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
          Quick Practice
        </Button>
      </Box>

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
              onClick={() => setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))}
              sx={{ textTransform: 'none', fontSize: '0.72rem', fontWeight: 600, color: '#64748B', p: 0.5 }}
            >
              Mark all read
            </Button>
          )}
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1.5, maxHeight: 300, overflowY: 'auto' }}>
          {notifications.map((n) => (
            <Box
              key={n.id}
              onClick={() => setNotifications((prev) => prev.map((item) => (item.id === n.id ? { ...item, unread: false } : item)))}
              sx={{
                p: 1.25,
                borderRadius: '10px',
                bgcolor: n.unread ? '#F8FAFC' : '#FFFFFF',
                border: n.unread ? '1px solid #DBEAFE' : '1px solid #F1F5F9',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                '&:hover': { bgcolor: '#F1F5F9' },
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: n.unread ? 800 : 600, color: '#0F172A', fontSize: '0.82rem' }}>
                  {n.title}
                </Typography>
                <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.7rem', flexShrink: 0 }}>
                  {n.time}
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.75rem', mt: 0.25, display: 'block', lineHeight: 1.35 }}>
                {n.desc}
              </Typography>
            </Box>
          ))}
        </Box>
      </Popover>

      {/* Quick Action Navigation Dropdown Menu */}
      <Menu
        anchorEl={quickActionAnchor}
        open={isQuickActionOpen}
        onClose={() => setQuickActionAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              borderRadius: '16px',
              minWidth: 230,
              mt: 1,
              p: 0.75,
              boxShadow: '0 14px 35px rgba(15, 23, 42, 0.12)',
              border: '1px solid #E2E8F0',
            },
          },
        }}
      >
        <MenuItem
          onClick={() => handleActionSelect('/problems')}
          sx={{ borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, py: 1.1 }}
        >
          <ListItemIcon>
            <CodeRoundedIcon fontSize="small" sx={{ color: '#2563EB' }} />
          </ListItemIcon>
          <ListItemText
            primary="Daily Challenge"
            secondary="Solve today's featured problem"
            slotProps={{
              primary: { sx: { fontWeight: 700, fontSize: '0.84rem', color: '#0F172A' } },
              secondary: { sx: { fontSize: '0.72rem', color: '#64748B' } },
            }}
          />
        </MenuItem>

        <MenuItem
          onClick={() => handleActionSelect('/practice')}
          sx={{ borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, py: 1.1 }}
        >
          <ListItemIcon>
            <TerminalRoundedIcon fontSize="small" sx={{ color: '#10B981' }} />
          </ListItemIcon>
          <ListItemText
            primary="Online Compiler"
            secondary="Live multi-language sandbox"
            slotProps={{
              primary: { sx: { fontWeight: 700, fontSize: '0.84rem', color: '#0F172A' } },
              secondary: { sx: { fontSize: '0.72rem', color: '#64748B' } },
            }}
          />
        </MenuItem>

        <Divider sx={{ my: 0.75 }} />

        <MenuItem
          onClick={() => handleActionSelect('/contests')}
          sx={{ borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, py: 1.1 }}
        >
          <ListItemIcon>
            <EmojiEventsRoundedIcon fontSize="small" sx={{ color: '#F59E0B' }} />
          </ListItemIcon>
          <ListItemText
            primary="Live Contests"
            secondary="Compete & rank up"
            slotProps={{
              primary: { sx: { fontWeight: 700, fontSize: '0.84rem', color: '#0F172A' } },
              secondary: { sx: { fontSize: '0.72rem', color: '#64748B' } },
            }}
          />
        </MenuItem>

        <MenuItem
          onClick={() => handleActionSelect('/courses')}
          sx={{ borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, py: 1.1 }}
        >
          <ListItemIcon>
            <MenuBookRoundedIcon fontSize="small" sx={{ color: '#6366F1' }} />
          </ListItemIcon>
          <ListItemText
            primary="Browse Courses"
            secondary="Curated DSA & Dev paths"
            slotProps={{
              primary: { sx: { fontWeight: 700, fontSize: '0.84rem', color: '#0F172A' } },
              secondary: { sx: { fontSize: '0.72rem', color: '#64748B' } },
            }}
          />
        </MenuItem>
      </Menu>
    </Box>
  );
}
