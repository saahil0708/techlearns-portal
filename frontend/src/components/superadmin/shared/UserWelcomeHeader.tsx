'use client';

import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import FiberManualRecordRoundedIcon from '@mui/icons-material/FiberManualRecordRounded';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';

interface UserWelcomeHeaderProps {
  systemStatus?: string;
}

export default function UserWelcomeHeader({
  systemStatus = 'UNKNOWN',
}: UserWelcomeHeaderProps) {
  const user = useSelector((state: RootState) => state.auth.user);
  const firstName = user?.name ? user.name.split(' ')[0] : 'Alex';
  
  // Dynamic greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Formatted date string
  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const isHealthy =
    systemStatus.toUpperCase() === 'ONLINE' ||
    systemStatus.toUpperCase() === 'HEALTHY' ||
    systemStatus.toUpperCase() === 'ACTIVE';

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 2,
        width: '100%',
        pt: 0.5,
      }}
    >
      {/* Left: Professional Greeting & Subtitle */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            fontSize: { xs: '1.45rem', sm: '1.65rem', md: '1.8rem' },
            color: '#0F172A',
            letterSpacing: '-0.03em',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          {getGreeting()},{' '}
          <Box
            component="span"
            sx={{
              background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {firstName}
          </Box>{' '}
          <Box component="span" sx={{ WebkitTextFillColor: 'initial', fontSize: '1.4rem' }}>
            👋
          </Box>
        </Typography>
        <Typography sx={{ fontSize: '0.86rem', color: '#64748B', fontWeight: 500 }}>
          Here is what is happening across your campuses, student coders, and compiler clusters today.
        </Typography>
      </Box>

      {/* Right: Date Badge & System Status Pill */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
        {/* Date Pill */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            px: 1.5,
            py: 0.6,
            borderRadius: '9999px',
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            color: '#475569',
            fontSize: '0.78rem',
            fontWeight: 600,
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          }}
        >
          <CalendarTodayRoundedIcon sx={{ fontSize: 14, color: '#64748B' }} />
          <span>{formattedDate}</span>
        </Box>

        {/* Live Status Pill */}
        <Chip
          icon={
            <FiberManualRecordRoundedIcon
              sx={{
                fontSize: '9px !important',
                color: isHealthy ? '#10B981 !important' : '#F59E0B !important',
              }}
            />
          }
          label={isHealthy ? 'All Systems Live' : systemStatus}
          size="small"
          sx={{
            bgcolor: isHealthy ? '#ECFDF5' : '#FFFBEB',
            color: isHealthy ? '#059669' : '#D97706',
            fontWeight: 700,
            fontSize: '0.74rem',
            height: 30,
            px: 0.5,
            border: `1px solid ${isHealthy ? '#A7F3D0' : '#FDE68A'}`,
            borderRadius: '9999px',
          }}
        />
      </Box>
    </Box>
  );
}
