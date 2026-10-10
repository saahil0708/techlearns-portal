'use client';

import React, { useState, useEffect, ReactNode } from 'react';
import { Box } from '@mui/material';
import StudentNavbar from '@/components/students/layout/StudentNavbar';
import FacultySidebar from '@/components/faculty/layout/FacultySidebar';
import FacultyNavbar from '@/components/faculty/layout/FacultyNavbar';
import CurvedSidebar from '@/components/superadmin/layout/CurvedSidebar';
import Navbar from '@/components/superadmin/layout/Navbar';
import { useAppSelector } from '@/store/hooks';

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
  const user = useAppSelector((state) => state.auth.user);
  const [activeUser, setActiveUser] = useState(user);

  useEffect(() => {
    setActiveUser(user || null);
  }, [user]);

  const role = activeUser?.globalRole;
  const isFaculty = role === 'FACULTY' || role === 'COLLEGE_ADMIN';
  const isSuperAdmin = role === 'SUPER_ADMIN';

  if (isFaculty) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          bgcolor: '#F4F5F7',
          backgroundImage: `
            radial-gradient(ellipse at 15% 10%, rgba(91, 45, 144, 0.05) 0%, transparent 45%),
            radial-gradient(ellipse at 85% 20%, rgba(124, 58, 237, 0.04) 0%, transparent 45%),
            radial-gradient(ellipse at 50% 90%, rgba(5, 150, 105, 0.04) 0%, transparent 50%)
          `,
          color: '#0F172A',
          p: { xs: 1.5, sm: 2, md: 2.5 },
          pl: { xs: '82px', sm: '90px', md: '102px' },
          gap: { xs: 2, md: 3 },
        }}
      >
        <FacultySidebar />
        <Box component="main" sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <Box sx={{ maxWidth: 1800, width: '100%', mx: 'auto', px: { xs: 2, md: 3 }, display: 'flex', flexDirection: 'column', gap: 4, pb: { xs: 4, md: 6 } }}>
            {!hideNavbar && (
              <FacultyNavbar
                collegeName={activeUser?.memberships?.[0]?.college?.name}
                collegeCode={activeUser?.memberships?.[0]?.college?.code}
                department={(activeUser as any)?.department}
                searchQuery={searchQuery}
                onSearchChange={onSearchChange}
              />
            )}
            {children}
          </Box>
        </Box>
      </Box>
    );
  }

  if (isSuperAdmin) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          bgcolor: '#0B0F19',
          backgroundImage: `
            radial-gradient(ellipse at 15% 10%, rgba(91, 45, 144, 0.07) 0%, transparent 45%),
            radial-gradient(ellipse at 85% 20%, rgba(124, 58, 237, 0.05) 0%, transparent 45%)
          `,
          color: '#F8FAFC',
          p: { xs: 1.5, sm: 2, md: 2.5 },
          pl: { xs: '82px', sm: '90px', md: '102px' },
          gap: { xs: 2, md: 3 },
        }}
      >
        <CurvedSidebar />
        <Box component="main" sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <Box sx={{ maxWidth: 1800, width: '100%', mx: 'auto', px: { xs: 2, md: 3 }, display: 'flex', flexDirection: 'column', gap: 4, pb: { xs: 4, md: 6 } }}>
            {!hideNavbar && (
              <Navbar
                searchQuery={searchQuery}
                onSearchChange={onSearchChange}
              />
            )}
            {children}
          </Box>
        </Box>
      </Box>
    );
  }

  // 🎓 Student Layout: Top Navbar (No Sidebar) for a Clean, Full-Width Profile & Learning Workspace
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#F8FAFC',
        backgroundImage: `
          radial-gradient(ellipse at 15% 10%, rgba(91, 45, 144, 0.05) 0%, transparent 45%),
          radial-gradient(ellipse at 85% 20%, rgba(91, 45, 144, 0.03) 0%, transparent 45%),
          radial-gradient(ellipse at 50% 90%, rgba(91, 45, 144, 0.03) 0%, transparent 50%)
        `,
        color: '#0F172A',
      }}
    >
      {/* 1. Top Navigation Bar */}
      {!hideNavbar && (
        <StudentNavbar
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          streakDays={streakDays !== undefined ? streakDays : (activeUser as any)?.streakDays}
          contestRating={contestRating !== undefined ? contestRating : (activeUser as any)?.contestRating}
          ratingTier={ratingTier !== undefined ? ratingTier : (activeUser as any)?.ratingTier}
        />
      )}

      {/* 2. Main Full-Width Page Container */}
      <Box
        component="main"
        sx={{
          flex: 1,
          width: '100%',
          maxWidth: 1440,
          mx: 'auto',
          px: { xs: 2, sm: 3, md: 4 },
          py: { xs: 2.5, md: 3.5 },
          display: 'flex',
          flexDirection: 'column',
          gap: 3.5,
          pb: { xs: 6, md: 8 },
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
