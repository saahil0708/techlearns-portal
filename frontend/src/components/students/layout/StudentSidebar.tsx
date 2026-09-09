'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  Box,
  Tooltip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton,
  Chip,
  Skeleton,
} from '@mui/material';

// Material Rounded Icons
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
import MilitaryTechRoundedIcon from '@mui/icons-material/MilitaryTechRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logoutUser } from '@/store/slices/authSlice';
import { apiService } from '@/lib/api-service';

// Student / Coder Navigation Matrix
const STUDENT_NAV_ITEMS = [
  { label: 'My Profile & Workspace', icon: <PersonRoundedIcon sx={{ fontSize: 21 }} />, path: '/students' },
  { label: 'Practice & Online Compilers', icon: <TerminalRoundedIcon sx={{ fontSize: 21 }} />, path: '/practice' },
  { label: 'Problem Archive & Solves', icon: <CodeRoundedIcon sx={{ fontSize: 21 }} />, path: '/problems' },
  { label: 'Enrolled Courses', icon: <MenuBookRoundedIcon sx={{ fontSize: 20 }} />, path: '/courses' },
  { label: 'Competitive Contests', icon: <EmojiEventsRoundedIcon sx={{ fontSize: 20 }} />, path: '/contests' },
  { label: 'Global Leaderboard', icon: <LeaderboardRoundedIcon sx={{ fontSize: 20 }} />, path: '/leaderboard' },
  { label: 'My Submissions', icon: <HistoryRoundedIcon sx={{ fontSize: 21 }} />, path: '/students/submissions' },
  { label: 'Account Settings', icon: <SettingsRoundedIcon sx={{ fontSize: 20 }} />, path: '/students/settings' },
];

export default function StudentSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams ? searchParams.get('tab') : null;

  const dispatch = useAppDispatch();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

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
  const displayEmail = activeUser?.email || user?.email || '';
  const displayRole = activeUser?.globalRole ? activeUser.globalRole.replace('_', ' ') : user?.globalRole ? user.globalRole.replace('_', ' ') : 'STUDENT';

  const initials = displayName
    ? displayName
        .split(' ')
        .map((n: string) => n[0])
        .filter(Boolean)
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  const isProfileActive =
    (pathname === '/students' || pathname === '/students/profile' || pathname.startsWith('/students/')) &&
    pathname !== '/students/submissions' &&
    pathname !== '/students/settings' &&
    (!currentTab || currentTab === 'overview');

  const handleConfirmLogout = async () => {
    setLogoutDialogOpen(false);
    await dispatch(logoutUser());
    router.push('/login');
  };

  const isItemActive = (itemPath: string) => {
    // 1. My Submissions / History
    if (itemPath === '/students/submissions' || itemPath.includes('tab=submissions')) {
      return (
        pathname === '/students/submissions' ||
        (pathname.startsWith('/students') && currentTab === 'submissions')
      );
    }

    // 2. Account Settings
    if (itemPath === '/students/settings' || itemPath.includes('tab=settings')) {
      return (
        pathname === '/students/settings' ||
        (pathname.startsWith('/students') && currentTab === 'settings')
      );
    }

    // 3. My Profile & Workspace
    if (itemPath === '/students' || itemPath === '/students/profile') {
      const isSubTab = currentTab === 'submissions' || currentTab === 'settings';
      const isSubRoute = pathname === '/students/submissions' || pathname === '/students/settings';
      return (
        (pathname === '/students' || pathname === '/students/profile' || (pathname.startsWith('/students/') && !isSubRoute)) &&
        !isSubTab &&
        !isSubRoute
      );
    }

    // 4. Practice & Compilers
    if (itemPath === '/practice') {
      return pathname === '/practice' || pathname.startsWith('/practice/') || (pathname.startsWith('/students') && currentTab === 'practice');
    }

    // 5. Problem Archive
    if (itemPath === '/problems') {
      return pathname === '/problems' || pathname.startsWith('/problems/');
    }

    // 6. Enrolled Courses
    if (itemPath === '/courses') {
      return pathname === '/courses' || pathname.startsWith('/courses/') || (pathname.startsWith('/students') && currentTab === 'courses');
    }

    // 7. Competitive Contests
    if (itemPath === '/contests') {
      return pathname === '/contests' || pathname.startsWith('/contests/') || (pathname.startsWith('/students') && currentTab === 'contests');
    }

    // 8. Global Leaderboard
    if (itemPath === '/leaderboard') {
      return pathname === '/leaderboard' || pathname.startsWith('/leaderboard/');
    }

    return pathname === itemPath;
  };

  return (
    <>
      <Box
        component="aside"
        aria-label="Student Navigation"
        sx={{
          position: 'fixed',
          left: { xs: 10, sm: 16, md: 22 },
          top: 0,
          height: '100vh',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: { xs: 1.75, md: 2.25 },
          zIndex: 1200,
          width: 58,
          py: 2,
          pointerEvents: 'auto',
        }}
      >
        {/* 1. Dedicated Top Logo Capsule */}
        <Box
          sx={{
            bgcolor: '#FFFFFF',
            borderRadius: '9999px',
            p: '6px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 58,
            height: 58,
            flexShrink: 0,
            transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease',
            '&:hover': {
              transform: 'scale(1.05)',
              boxShadow: '0 12px 28px rgba(37, 99, 235, 0.18)',
            },
          }}
        >
          <Tooltip title="CodePlatform Student Arena" placement="right" arrow>
            <Link
              href="/students"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textDecoration: 'none',
              }}
            >
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '9999px',
                  bgcolor: '#2563EB',
                  background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
                }}
              >
                <CodeRoundedIcon sx={{ color: '#FFFFFF', fontSize: 24 }} />
              </Box>
            </Link>
          </Tooltip>
        </Box>

        {/* 2. Main Navigation Floating Pill Capsule */}
        <Box
          sx={{
            bgcolor: '#FFFFFF',
            borderRadius: '9999px',
            p: '6px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.06)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '3px',
            width: 58,
            flexShrink: 0,
          }}
        >
          {STUDENT_NAV_ITEMS.map((item) => {
            const active = isItemActive(item.path);

            return (
              <Tooltip key={item.label} title={item.label} placement="right" arrow>
                <Link
                  href={item.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textDecoration: 'none',
                  }}
                >
                  <Box
                    sx={{
                      position: 'relative',
                      width: 44,
                      height: 44,
                      borderRadius: '9999px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: active ? '#2563EB' : 'transparent',
                      background: active
                        ? 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)'
                        : 'transparent',
                      color: active ? '#FFFFFF' : '#64748B',
                      boxShadow: active ? '0 4px 14px rgba(37, 99, 235, 0.4)' : 'none',
                      transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        bgcolor: active ? '#1D4ED8' : 'rgba(37, 99, 235, 0.08)',
                        color: active ? '#FFFFFF' : '#2563EB',
                        transform: 'scale(1.06)',
                      },
                      '&:active': {
                        transform: 'scale(0.96)',
                      },
                    }}
                  >
                    {item.icon}
                  </Box>
                </Link>
              </Tooltip>
            );
          })}
        </Box>

        {/* 3. Bottom User Avatar & Logout Capsule */}
        <Box
          sx={{
            bgcolor: '#FFFFFF',
            borderRadius: '9999px',
            p: '6px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            width: 58,
            flexShrink: 0,
          }}
        >
          {/* Avatar Profile Quick Link */}
          <Tooltip
            title={
              loading ? (
                <Box sx={{ p: 0.5, textAlign: 'center' }}>
                  <Typography sx={{ fontSize: '0.78rem', color: '#CBD5E1', fontWeight: 600 }}>
                    Loading profile...
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ p: 0.5, textAlign: 'center' }}>
                  <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#FFFFFF' }}>
                    {displayName}
                  </Typography>
                  <Typography sx={{ fontSize: '0.72rem', color: '#93C5FD', fontWeight: 600 }}>
                    {displayRole} • View Profile
                  </Typography>
                </Box>
              )
            }
            placement="right"
            arrow
          >
            <Link
              href="/students"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textDecoration: 'none',
              }}
            >
              <Box
                sx={{
                  position: 'relative',
                  width: 44,
                  height: 44,
                  borderRadius: '9999px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: isProfileActive ? 'rgba(37, 99, 235, 0.12)' : 'transparent',
                  border: isProfileActive ? '2px solid #2563EB' : '2px solid transparent',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'scale(1.08)',
                    borderColor: '#3B82F6',
                  },
                }}
              >
                {loading ? (
                  <Skeleton
                    variant="circular"
                    width={36}
                    height={36}
                    animation="wave"
                    sx={{ bgcolor: 'rgba(37, 99, 235, 0.15)' }}
                  />
                ) : (
                  <Avatar
                    sx={{
                      width: 36,
                      height: 36,
                      bgcolor: '#2563EB',
                      color: '#FFFFFF',
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      border: '1.5px solid #FFFFFF',
                      boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
                    }}
                  >
                    {initials}
                  </Avatar>
                )}
              </Box>
            </Link>
          </Tooltip>

          {/* Quick Logout Button */}
          <Tooltip title="Log Out of Session" placement="right" arrow>
            <IconButton
              onClick={() => setLogoutDialogOpen(true)}
              aria-label="Log Out"
              sx={{
                width: 40,
                height: 40,
                borderRadius: '9999px',
                color: '#94A3B8',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  bgcolor: '#FEE2E2',
                  color: '#DC2626',
                  transform: 'scale(1.08)',
                },
                '&:active': {
                  transform: 'scale(0.95)',
                },
              }}
            >
              <LogoutRoundedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Logout Confirmation Dialog */}
      <Dialog
        open={logoutDialogOpen}
        onClose={() => setLogoutDialogOpen(false)}
        slotProps={{
          paper: {
            sx: {
              borderRadius: '20px',
              p: 1,
              maxWidth: 400,
              width: '100%',
              bgcolor: '#FFFFFF',
              boxShadow: '0 20px 48px rgba(0, 0, 0, 0.16)',
            },
          },
        }}
      >
        <DialogTitle sx={{ pb: 1, pt: 2, px: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: '12px',
                bgcolor: '#FEE2E2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#DC2626',
              }}
            >
              <WarningAmberRoundedIcon sx={{ fontSize: 22 }} />
            </Box>
            <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#0F172A' }}>
              Sign Out
            </Typography>
          </Box>
          <IconButton onClick={() => setLogoutDialogOpen(false)} size="small" sx={{ color: '#94A3B8' }}>
            <CloseRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: 3, py: 1.5 }}>
          <Typography sx={{ fontSize: '0.88rem', color: '#64748B', lineHeight: 1.6 }}>
            Are you sure you want to log out of your session on CodePlatform? You will need to log in again to access your workspace.
          </Typography>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, pt: 1, gap: 1 }}>
          <Button
            onClick={() => setLogoutDialogOpen(false)}
            variant="outlined"
            sx={{
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 700,
              color: '#64748B',
              borderColor: '#E2E8F0',
              '&:hover': { borderColor: '#CBD5E1', bgcolor: '#F8FAFC' },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmLogout}
            variant="contained"
            disableElevation
            sx={{
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 700,
              bgcolor: '#DC2626',
              color: '#FFFFFF',
              '&:hover': { bgcolor: '#B91C1C' },
            }}
          >
            Sign Out
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
