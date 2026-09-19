'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Box,
  Tooltip,
  Avatar,
  Typography,
  IconButton,
  Skeleton,
} from '@mui/material';

// Material Rounded Icons
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import AssignmentIndRoundedIcon from '@mui/icons-material/AssignmentIndRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import AnalyticsRoundedIcon from '@mui/icons-material/AnalyticsRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import CoPresentRoundedIcon from '@mui/icons-material/CoPresentRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logoutUser } from '@/store/slices/authSlice';
import { apiService } from '@/lib/api-service';
import LogoutConfirmModal from '@/components/shared/LogoutConfirmModal';

export default function InstitutionAdminSidebar() {
  const router = useRouter();
  const pathname = usePathname();
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

  const activeMemberships = Array.isArray(activeUser?.memberships) ? activeUser.memberships : [];
  const primaryMembership =
    activeMemberships.find(
      (m: any) =>
        m?.role === 'INSTITUTION_ADMIN' ||
        m?.role === 'COLLEGE_ADMIN' ||
        m?.role === 'FACULTY'
    ) ||
    activeMemberships[0];

  const collegeName =
    primaryMembership?.institution?.name ||
    primaryMembership?.college?.name ||
    (activeUser as any)?.institution ||
    'Academic Institution';

  const collegeCode =
    primaryMembership?.institution?.code ||
    primaryMembership?.college?.code ||
    'CAMPUS';

  const displayName = activeUser?.name || user?.name || 'Institution Admin';
  const displayRole = 'Institution Admin / Dean';

  const userInitials = displayName
    ? displayName
        .split(' ')
        .map((n: string) => n[0])
        .filter(Boolean)
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'IA';

  const navItems = [
    { label: 'Campus Dashboard', icon: <AccountBalanceRoundedIcon sx={{ fontSize: 21 }} />, path: '/institution-admin' },
    { label: 'Faculty & Mentors', icon: <AssignmentIndRoundedIcon sx={{ fontSize: 21 }} />, path: '/institution-admin/faculty' },
    { label: 'Cohorts & Batches', icon: <SchoolRoundedIcon sx={{ fontSize: 21 }} />, path: '/institution-admin/batches' },
    { label: 'Student Directory', icon: <GroupRoundedIcon sx={{ fontSize: 21 }} />, path: '/institution-admin/students' },
    { label: 'Institutional Analytics', icon: <AnalyticsRoundedIcon sx={{ fontSize: 21 }} />, path: '/institution-admin/analytics' },
    { label: 'Campus Settings', icon: <SettingsRoundedIcon sx={{ fontSize: 21 }} />, path: '/institution-admin/settings' },
    { label: 'Switch to Faculty Workspace', icon: <CoPresentRoundedIcon sx={{ fontSize: 21 }} />, path: '/faculty/profile' },
  ];

  const isItemActive = (itemPath: string) => {
    if (itemPath === '/institution-admin') {
      return pathname === '/institution-admin';
    }
    return pathname.startsWith(itemPath);
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
        aria-label="Institution Admin Navigation"
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
          <Tooltip title={`${collegeName} (${collegeCode}) • Institution Admin Portal`} placement="right" arrow>
            <Link
              href="/institution-admin"
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
                  background: 'linear-gradient(135deg, #1E40AF 0%, #2563EB 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 14px rgba(30, 64, 175, 0.35)',
                }}
              >
                <AccountBalanceRoundedIcon sx={{ color: '#FFFFFF', fontSize: 24 }} />
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
          {navItems.map((item) => {
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
                        ? 'linear-gradient(135deg, #1E40AF 0%, #2563EB 100%)'
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
              href="/institution-admin/settings"
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
                  bgcolor: pathname.startsWith('/institution-admin/settings') ? 'rgba(37, 99, 235, 0.12)' : 'transparent',
                  border: pathname.startsWith('/institution-admin/settings') ? '2px solid #2563EB' : '2px solid transparent',
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
                      bgcolor: '#1E40AF',
                      color: '#FFFFFF',
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      border: '1.5px solid #FFFFFF',
                      boxShadow: '0 2px 8px rgba(30, 64, 175, 0.25)',
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
