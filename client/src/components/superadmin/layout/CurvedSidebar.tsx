
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Box, Tooltip, Avatar, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, IconButton, Chip } from '@mui/material';
import { useRouter, usePathname } from 'next/navigation';

// Rounded Material Icons matching the design
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import ArticleRoundedIcon from '@mui/icons-material/ArticleRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import TerminalRoundedIcon from '@mui/icons-material/TerminalRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { FluidArrowRight } from '@/utils/fluid_arrow';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: <GridViewRoundedIcon sx={{ fontSize: 21 }} />, path: '/superadmin' },
  { label: 'Institutions', icon: <AccountBalanceRoundedIcon sx={{ fontSize: 20 }} />, path: '/superadmin/institutions' },
  { label: 'Blogs', icon: <ArticleRoundedIcon sx={{ fontSize: 20 }} />, path: '/superadmin/blogs' },
  { label: 'Students', icon: <PersonRoundedIcon sx={{ fontSize: 20 }} />, path: '/superadmin/students' },
  { label: 'Users', icon: <PeopleAltRoundedIcon sx={{ fontSize: 20 }} />, path: '/superadmin/users' },
  { label: 'Courses', icon: <MenuBookRoundedIcon sx={{ fontSize: 20 }} />, path: '/superadmin/courses' },
  { label: 'Problems', icon: <CodeRoundedIcon sx={{ fontSize: 20 }} />, path: '/superadmin/problems' },
  { label: 'Contests & Bootcamps', icon: <EmojiEventsRoundedIcon sx={{ fontSize: 20 }} />, path: '/superadmin/contests' },
  { label: 'SkillOS Tests', icon: <ShieldRoundedIcon sx={{ fontSize: 20 }} />, path: '/superadmin/skillos' },
  { label: 'Settings', icon: <SettingsRoundedIcon sx={{ fontSize: 20 }} />, path: '/superadmin/settings' },
];

import { useAppDispatch } from '@/store/hooks';
import { logoutUser } from '@/store/slices/authSlice';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { BRAND_COLORS } from '@/theme/colors';
import LogoutConfirmModal from '@/components/shared/LogoutConfirmModal';

export default function CurvedSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const user = useSelector((state: RootState) => state.auth.user);

  const displayName = user?.name || 'Super Admin';
  const displayEmail = user?.email || 'admin@techlearns.internal';
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
        <Tooltip title="TechLearns Portal" placement="right" arrow>
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
                bgcolor: BRAND_COLORS.primary,
                backgroundImage: BRAND_COLORS.gradients.brand,
                color: '#FFFFFF',
                fontWeight: 900,
                fontSize: '0.95rem',
                boxShadow: `0 4px 14px ${BRAND_COLORS.alpha.navy20}`,
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                p: '3px',
                '&:hover': {
                  transform: 'scale(1.08)',
                  boxShadow: `0 6px 20px ${BRAND_COLORS.alpha.purple20}`,
                },
              }}
            >
              <Image
                src="/images/logo/techlearns-single.png"
                alt="TechLearns"
                width={20}
                height={20}
                style={{ objectFit: 'contain' }}
                priority
              />
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
          const isActive = item.path === '/superadmin'
            ? pathname === '/superadmin'
            : item.path === '/superadmin/contests'
            ? pathname.startsWith('/superadmin/contests') || pathname.startsWith('/superadmin/bootcamps')
            : pathname.startsWith(item.path) || (item.path === '/superadmin/institutions' && pathname.startsWith('/superadmin/colleges'));

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
                    bgcolor: isActive ? BRAND_COLORS.primary : '#F8FAFC',
                    backgroundImage: isActive ? BRAND_COLORS.gradients.brand : 'none',
                    color: isActive ? '#FFFFFF' : '#64748B',
                    border: isActive ? 'none' : '1px solid #F1F5F9',
                    boxShadow: isActive ? `0 4px 16px ${BRAND_COLORS.alpha.purple20}` : 'none',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      bgcolor: isActive ? BRAND_COLORS.navy.hover : '#F1F5F9',
                      color: isActive ? '#FFFFFF' : BRAND_COLORS.primary,
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
                  boxShadow: '0 0 14px rgba(91, 45, 144, 0.3)',
                },
              }}
            >
              <Avatar
                sx={{
                  width: 44,
                  height: 44,
                  bgcolor: '#0B1F3A',
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
