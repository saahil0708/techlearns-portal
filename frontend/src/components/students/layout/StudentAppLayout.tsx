'use client';

import React, { ReactNode } from 'react';
import { Box } from '@mui/material';
import StudentSidebar from './StudentSidebar';
import StudentNavbar from './StudentNavbar';

interface StudentAppLayoutProps {
  children: ReactNode;
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  streakDays?: number;
  contestRating?: number;
  ratingTier?: string;
  hideNavbar?: boolean;
}

export default function StudentAppLayout({
  children,
  searchQuery = '',
  onSearchChange,
  streakDays,
  contestRating,
  ratingTier,
  hideNavbar = false,
}: StudentAppLayoutProps) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        bgcolor: '#F4F5F7',
        backgroundImage: `
          radial-gradient(ellipse at 15% 10%, rgba(37, 99, 235, 0.06) 0%, transparent 45%),
          radial-gradient(ellipse at 85% 20%, rgba(37, 99, 235, 0.04) 0%, transparent 45%),
          radial-gradient(ellipse at 50% 90%, rgba(14, 165, 233, 0.04) 0%, transparent 50%)
        `,
        color: '#0F172A',
        p: { xs: 1.5, sm: 2, md: 2.5 },
        pl: { xs: '82px', sm: '90px', md: '102px' },
        gap: { xs: 2, md: 3 },
      }}
    >
      {/* 1. Left Floating Sidebar */}
      <StudentSidebar />

      {/* 2. Main Content Area */}
      <Box
        component="main"
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
        }}
      >
        <Box
          sx={{
            maxWidth: 1400,
            width: '100%',
            mx: 'auto',
            px: { xs: 3, md: 5 },
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            pb: { xs: 4, md: 6 },
          }}
        >
          {!hideNavbar && (
            <StudentNavbar
              searchQuery={searchQuery}
              onSearchChange={onSearchChange}
              streakDays={streakDays}
              contestRating={contestRating}
              ratingTier={ratingTier}
            />
          )}
          {children}
        </Box>
      </Box>
    </Box>
  );
}
