'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  Box,
  Tooltip,
  Avatar,
  Typography,
  IconButton,
  Skeleton,
} from '@mui/material';

// Material Rounded Icons
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import LeaderboardRoundedIcon from '@mui/icons-material/LeaderboardRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import TerminalRoundedIcon from '@mui/icons-material/TerminalRounded';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logoutUser } from '@/store/slices/authSlice';
import { apiService } from '@/lib/api-service';
import LogoutConfirmModal from '@/components/shared/LogoutConfirmModal';

// Faculty Navigation Items Matrix
const FACULTY_NAV_ITEMS = [
  { label: 'Faculty Profile & Bio', icon: <PersonRoundedIcon sx={{ fontSize: 21 }} />, path: '/faculty/profile' },
  { label: 'Assigned Cohorts & Batches', icon: <SchoolRoundedIcon sx={{ fontSize: 20 }} />, path: '/faculty/profile?tab=batches' },
  { label: 'College Students Roster', icon: <GroupRoundedIcon sx={{ fontSize: 20 }} />, path: '/faculty/profile?tab=students' },
  { label: 'Curriculum & Courses', icon: <MenuBookRoundedIcon sx={{ fontSize: 20 }} />, path: '/faculty/profile?tab=courses' },
  { label: 'Lab Challenges & Question Bank', icon: <CodeRoundedIcon sx={{ fontSize: 21 }} />, path: '/faculty/profile?tab=problems' },
  { label: 'Competitive Contests', icon: <EmojiEventsRoundedIcon sx={{ fontSize: 20 }} />, path: '/contests' },
  { label: 'Global Leaderboard', icon: <LeaderboardRoundedIcon sx={{ fontSize: 20 }} />, path: '/leaderboard' },
];

export default function FacultySidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab');

  const dispatch = useAppDispatch();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const user = useAppSelector((state) => state.auth.user);
  const [activeUser, setActiveUser] = useState(user);
  const [loading, setLoading] = useState<boolean>(!user?.name);

  useEffect(() => {
    setActiveUser(user || null);
    if (user?.name) {
      setLoading(false);
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

  const displayName = activeUser?.name || user?.name || 'Faculty Mentor';
  const displayEmail = activeUser?.email || user?.email || '';
  const displayRole =
    activeUser?.globalRole === 'COLLEGE_ADMIN'
      ? 'Department Head & Admin'
      : activeUser?.globalRole === 'SUPER_ADMIN'
      ? 'Super Admin'
      : 'Faculty Mentor';

  const activeMemberships = Array.isArray(activeUser?.memberships) ? activeUser.memberships : [];
  const qualifyingMembership = activeMemberships.find(
    (m: any) =>
      m?.role === 'FACULTY' ||
      m?.role === 'COLLEGE_ADMIN' ||
      m?.role === 'INSTITUTION_ADMIN'
  );

  const collegeName =
    qualifyingMembership?.institution?.name ||
    qualifyingMembership?.college?.name ||
    activeUser?.memberships?.[0]?.institution?.name ||
    activeUser?.memberships?.[0]?.college?.name ||
    (activeUser as any)?.institution ||
    (activeUser as any)?.institutionName ||
    user?.memberships?.[0]?.institution?.name ||
    user?.memberships?.[0]?.college?.name ||
    (user as any)?.institution ||
    (user as any)?.institutionName ||
    'Academic Institution';
  const collegeCode =
    qualifyingMembership?.institution?.code ||
    qualifyingMembership?.college?.code ||
    activeUser?.memberships?.[0]?.institution?.code ||
    activeUser?.memberships?.[0]?.college?.code ||
    user?.memberships?.[0]?.institution?.code ||
    user?.memberships?.[0]?.college?.code ||
    'COLLEGE';

  const userInitials = displayName
    ? displayName
        .split(' ')
        .map((n: string) => n[0])
        .filter(Boolean)
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'FM';

  const isItemActive = (itemPath: string) => {
    if (itemPath === '/faculty/profile?tab=batches') {
      return pathname.startsWith('/faculty') && currentTab === 'batches';
    }
    if (itemPath === '/faculty/profile?tab=students') {
      return pathname.startsWith('/faculty') && currentTab === 'students';
    }
    if (itemPath === '/faculty/profile?tab=courses') {
      return (pathname.startsWith('/faculty') && currentTab === 'courses') || pathname.startsWith('/courses');
    }
    if (itemPath === '/faculty/profile?tab=problems') {
      return (pathname.startsWith('/faculty') && currentTab === 'problems') || pathname.startsWith('/problems');
    }
    if (itemPath === '/faculty/profile') {
      return (
        pathname.startsWith('/faculty') &&
        currentTab !== 'batches' &&
        currentTab !== 'students' &&
        currentTab !== 'courses' &&
        currentTab !== 'problems'
      );
    }
    if (itemPath === '/contests') {
      return pathname === '/contests' || pathname.startsWith('/contests/');
    }
    if (itemPath === '/leaderboard') {
      return pathname === '/leaderboard' || pathname.startsWith('/leaderboard/');
    }
    return pathname === itemPath;
  };

  const handleConfirmLogout = async () => {
    setLogoutDialogOpen(false);
    await dispatch(logoutUser());
    router.push('/login');
  };

  return (
    <>
      <Box
        component="aside"
        aria-label="Faculty Navigation"
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
          <Tooltip title={`${collegeName} (${collegeCode}) • Academic Faculty`} placement="right" arrow>
            <Link
              href="/faculty/profile"
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
                <SchoolRoundedIcon sx={{ color: '#FFFFFF', fontSize: 24 }} />
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
            gap: '4px',
            width: 58,
            flexShrink: 0,
          }}
        >
          {FACULTY_NAV_ITEMS.map((item) => {
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
                    {displayRole} • {collegeCode}
                  </Typography>
                </Box>
              )
            }
            placement="right"
            arrow
          >
            <Link
              href="/faculty/profile"
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
                  bgcolor: pathname.startsWith('/faculty') ? 'rgba(37, 99, 235, 0.12)' : 'transparent',
                  border: pathname.startsWith('/faculty') ? '2px solid #2563EB' : '2px solid transparent',
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
                    {userInitials}
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
      <LogoutConfirmModal
        open={logoutDialogOpen}
        onClose={() => setLogoutDialogOpen(false)}
        onConfirm={handleConfirmLogout}
      />
    </>
  );
}
