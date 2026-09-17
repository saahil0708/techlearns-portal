'use client';

import React, { useState } from 'react';
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
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
} from '@mui/material';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import {
  FaMagnifyingGlass,
  FaFire,
  FaTrophy,
  FaUser,
  FaArrowRightFromBracket,
  FaGear,
} from 'react-icons/fa6';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logoutUser } from '@/store/slices/authSlice';
import LogoutConfirmModal from '@/components/shared/LogoutConfirmModal';

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

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  const handleOpenMenu = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  };
  const handleCloseMenu = () => {
    setAnchorEl(null);
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
    .slice(0, 2);

  return (
    <>
      <Box
        sx={{
          width: '100%',
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        {/* Left Search Bar */}
        <Box sx={{ flex: 1, maxWidth: 460 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search problems, courses, projects..."
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <FaMagnifyingGlass size={13} color="#94A3B8" />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                bgcolor: '#FFFFFF',
                fontSize: '0.84rem',
                border: '1px solid #E2E8F0',
                '& fieldset': { border: 'none' },
                '&:hover': {
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                },
              },
            }}
          />
        </Box>

        {/* Right Stats & Profile Pills */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {/* Streak Chip - Conditionally rendered only when streakDays is defined */}
          {typeof streakDays === 'number' && (
            <Chip
              size="small"
              icon={<FaFire size={13} color="#EA580C" />}
              label={`${streakDays} Day Streak`}
              sx={{
                bgcolor: '#FFF7ED',
                color: '#C2410C',
                fontWeight: 700,
                fontSize: '0.76rem',
                height: 32,
                borderRadius: '10px',
                border: '1px solid #FED7AA',
                px: 0.5,
              }}
            />
          )}

          {/* Rating Chip - Conditionally rendered only when contestRating is defined */}
          {typeof contestRating === 'number' && (
            <Chip
              size="small"
              icon={<FaTrophy size={12} color="#CA8A04" />}
              label={`${contestRating} pts${ratingTier ? ` (${ratingTier})` : ''}`}
              sx={{
                bgcolor: '#FEFCE8',
                color: '#854D0E',
                fontWeight: 700,
                fontSize: '0.76rem',
                height: 32,
                borderRadius: '10px',
                border: '1px solid #FEF08A',
                px: 0.5,
                display: { xs: 'none', sm: 'inline-flex' },
              }}
            />
          )}

          {/* User Profile Avatar Pill / Native Button Trigger */}
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
              bgcolor: '#FFFFFF',
              p: '3px 12px 3px 4px',
              borderRadius: '14px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
              transition: 'all 0.15s ease',
              fontFamily: 'inherit',
              textAlign: 'left',
              '&:hover': {
                bgcolor: '#F8FAFC',
                borderColor: '#CBD5E1',
              },
              '&:focus-visible': {
                outline: '2px solid #2563EB',
                outlineOffset: '2px',
                borderColor: '#2563EB',
              },
            }}
          >
            <Avatar
              src={(user as any)?.avatarUrl}
              sx={{
                width: 30,
                height: 30,
                bgcolor: '#2563EB',
                fontSize: '0.78rem',
                fontWeight: 700,
              }}
            >
              <span suppressHydrationWarning>{initials}</span>
            </Avatar>
            <Box sx={{ display: { xs: 'none', md: 'block' }, textAlign: 'left' }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#0F172A', lineHeight: 1.1 }} suppressHydrationWarning>
                {displayName}
              </Typography>
              <Typography sx={{ fontSize: '0.68rem', color: '#64748B' }}>
                Student Coder
              </Typography>
            </Box>
            <KeyboardArrowDownRoundedIcon
              sx={{
                fontSize: 18,
                color: '#64748B',
                transition: 'transform 0.2s ease, color 0.15s ease',
                transform: Boolean(anchorEl) ? 'rotate(180deg)' : 'rotate(0deg)',
                ml: 0.25,
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
        slotProps={{
          list: {
            'aria-labelledby': 'student-account-menu-button',
          },
          paper: {
            sx: {
              borderRadius: '14px',
              mt: 1,
              minWidth: 190,
              boxShadow: '0 12px 28px rgba(0,0,0,0.08)',
              border: '1px solid #E2E8F0',
            },
          },
        }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F172A' }}>
            {displayName}
          </Typography>
          <Typography sx={{ fontSize: '0.72rem', color: '#64748B' }}>
            {displayEmail}
          </Typography>
        </Box>
        <Divider />
        <MenuItem
          onClick={() => {
            handleCloseMenu();
            router.push('/students/profile');
          }}
          sx={{ fontSize: '0.82rem', py: 1, gap: 1.25 }}
        >
          <FaUser size={13} color="#64748B" />
          My Profile
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleCloseMenu();
            router.push('/students/settings');
          }}
          sx={{ fontSize: '0.82rem', py: 1, gap: 1.25 }}
        >
          <FaGear size={13} color="#64748B" />
          Account Settings
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            handleCloseMenu();
            setLogoutModalOpen(true);
          }}
          sx={{ fontSize: '0.82rem', py: 1, color: '#DC2626', gap: 1.25 }}
        >
          <FaArrowRightFromBracket size={13} color="#DC2626" />
          Sign Out
        </MenuItem>
      </Menu>

      <LogoutConfirmModal
        open={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
      />
    </>
  );
}
