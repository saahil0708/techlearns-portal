
import { useState } from 'react';
import Link from 'next/link';
import { Box, Tooltip, Avatar, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, IconButton, Chip } from '@mui/material';
import { useRouter, usePathname } from 'next/navigation';

// Rounded Material Icons matching the design
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import AnalyticsRoundedIcon from '@mui/icons-material/AnalyticsRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import TerminalRoundedIcon from '@mui/icons-material/TerminalRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { FluidArrowRight } from '@/utils/fluid_arrow';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: <GridViewRoundedIcon sx={{ fontSize: 21 }} />, path: '/superadmin' },
  { label: 'Colleges', icon: <AccountBalanceRoundedIcon sx={{ fontSize: 20 }} />, path: '/superadmin/colleges' },
  { label: 'Schools', icon: <SchoolRoundedIcon sx={{ fontSize: 20 }} />, path: '/superadmin/schools' },
  { label: 'Students', icon: <PersonRoundedIcon sx={{ fontSize: 20 }} />, path: '/superadmin/students' },
  { label: 'Users', icon: <PeopleAltRoundedIcon sx={{ fontSize: 20 }} />, path: '/superadmin/users' },
  { label: 'Courses', icon: <MenuBookRoundedIcon sx={{ fontSize: 20 }} />, path: '/superadmin/courses' },
  { label: 'Problems', icon: <CodeRoundedIcon sx={{ fontSize: 20 }} />, path: '/superadmin/problems' },
  { label: 'Contests', icon: <EmojiEventsRoundedIcon sx={{ fontSize: 20 }} />, path: '/superadmin/contests' },
  { label: 'Analytics', icon: <AnalyticsRoundedIcon sx={{ fontSize: 20 }} />, path: '/superadmin/analytics' },
  { label: 'Settings', icon: <SettingsRoundedIcon sx={{ fontSize: 20 }} />, path: '/superadmin/settings' },
];

import { useAppDispatch } from '@/store/hooks';
import { logoutUser } from '@/store/slices/authSlice';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import LogoutConfirmModal from '@/components/shared/LogoutConfirmModal';

export default function CurvedSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const user = useSelector((state: RootState) => state.auth.user);

  const displayName = user?.name || 'Super Admin';
  const displayEmail = user?.email || 'admin@codeplatform.internal';
  const displayRole = user?.globalRole ? user.globalRole.replace('_', ' ') : 'Super Admin';
  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .filter(Boolean)
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'SA';

  const handleConfirmLogout = async () => {
    setLogoutDialogOpen(false);
    await dispatch(logoutUser());
    router.push('/login');
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        left: { xs: 12, sm: 18, md: 24 },
        top: 0,
        height: '100vh',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: { xs: 2, md: 2.75 },
        zIndex: 1200,
        width: 58,
        py: 2,
        overflowY: 'auto',
        overflowX: 'hidden',
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': { display: 'none' },
      }}
    >
      {/* 1. Dedicated Top Logo Pill Capsule */}
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
        }}
      >
        <Tooltip title="CodePlatform Platform" placement="right" arrow>
          <Link href="/superadmin" prefetch style={{ textDecoration: 'none' }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                bgcolor: '#2563EB',
                backgroundImage: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                color: '#FFFFFF',
                fontWeight: 900,
                fontSize: '0.95rem',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'scale(1.08)',
                  boxShadow: '0 6px 20px rgba(37, 99, 235, 0.5)',
                },
              }}
            >
              <TerminalRoundedIcon sx={{ fontSize: 24, color: '#FFFFFF' }} />
            </Box>
          </Link>
        </Tooltip>
      </Box>

      {/* 2. Middle Main Navigation Pill Capsule */}
      <Box
        sx={{
          bgcolor: '#FFFFFF',
          borderRadius: '9999px',
          p: '6px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.06)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 0.75,
          width: 58,
          flexShrink: 0,
        }}
      >
        {NAV_ITEMS.map((item) => {
          const isActive = item.path === '/superadmin' ? pathname === '/superadmin' : pathname.startsWith(item.path);

          return (
            <Tooltip key={item.label} title={item.label} placement="right" arrow>
              <Link href={item.path} prefetch style={{ textDecoration: 'none' }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    flexShrink: 0,
                    bgcolor: isActive ? '#2563EB' : '#F8FAFC',
                    backgroundImage: isActive ? 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)' : 'none',
                    color: isActive ? '#FFFFFF' : '#64748B',
                    border: isActive ? 'none' : '1px solid #F1F5F9',
                    boxShadow: isActive ? '0 4px 16px rgba(37, 99, 235, 0.35)' : 'none',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      bgcolor: isActive ? '#1D4ED8' : '#F1F5F9',
                      color: isActive ? '#FFFFFF' : '#0F172A',
                      borderColor: '#E2E8F0',
                      transform: 'scale(1.06)',
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

      {/* 3. Bottom User & Logout Pill Capsule */}
      <Box
        sx={{
          bgcolor: '#FFFFFF',
          borderRadius: '9999px',
          p: '6px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.06)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 0.85,
          width: 58,
          flexShrink: 0,
        }}
      >
        {/* Logout Button */}
        <Tooltip title="Logout" placement="right" arrow>
          <IconButton
            onClick={() => setLogoutDialogOpen(true)}
            aria-label="Logout"
            sx={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              bgcolor: '#F8FAFC',
              color: '#64748B',
              border: '1px solid #F1F5F9',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                bgcolor: 'rgba(239, 68, 68, 0.1)',
                color: '#EF4444',
                borderColor: 'rgba(239, 68, 68, 0.2)',
                transform: 'scale(1.06)',
              },
            }}
          >
            <LogoutRoundedIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Tooltip>

        {/* User Profile Avatar */}
        <Tooltip title={`${displayName} (${displayRole})`} placement="right" arrow>
          <Link href="/superadmin/profile" prefetch style={{ textDecoration: 'none' }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'scale(1.06)',
                  boxShadow: '0 0 14px rgba(37, 99, 235, 0.3)',
                },
              }}
            >
              <Avatar
                sx={{
                  width: 44,
                  height: 44,
                  bgcolor: '#2563EB',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  border: '2px solid #E2E8F0',
                }}
              >
                {initials}
              </Avatar>
            </Box>
          </Link>
        </Tooltip>
      </Box>

      {/* Logout Confirmation Dialog Box */}
      <LogoutConfirmModal
        open={logoutDialogOpen}
        onClose={() => setLogoutDialogOpen(false)}
        onConfirm={handleConfirmLogout}
      />
    </Box>
  );
}
