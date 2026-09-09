'use client';

import React, { ReactNode } from 'react';
import { Box } from '@mui/material';
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
        flexDirection: 'column',
        bgcolor: '#F8FAFC',
        backgroundImage: `
          radial-gradient(ellipse at 15% 10%, rgba(37, 99, 235, 0.04) 0%, transparent 45%),
          radial-gradient(ellipse at 85% 20%, rgba(37, 99, 235, 0.02) 0%, transparent 45%)
        `,
        color: '#0F172A',
      }}
    >
      {/* 1. Streamlined Top Navigation Bar */}
      {!hideNavbar && (
        <StudentNavbar
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          streakDays={streakDays}
          contestRating={contestRating}
          ratingTier={ratingTier}
        />
      )}

      {/* 2. Main Content Area */}
      <Box
        component="main"
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          px: { xs: 2, sm: 3, md: 3 },
          py: { xs: 2, md: 3 },
        }}
      >
        <Box
          sx={{
            maxWidth: 1200,
            width: '100%',
            mx: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 2.5,
            pb: { xs: 3, md: 5 },
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
