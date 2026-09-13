'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Box, Typography, Button, Card } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { useAppSelector } from '@/store/hooks';
import LoadingScreen from '@/components/ui/LoadingScreen';

interface FacultyAuthGuardProps {
  children: React.ReactNode;
}

export default function FacultyAuthGuard({ children }: FacultyAuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isCheckingSession } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!isCheckingSession && !isAuthenticated) {
      const redirectParam = encodeURIComponent(pathname);
      router.push(`/login?redirect=${redirectParam}`);
    }
  }, [isCheckingSession, isAuthenticated, pathname, router]);

  if (isCheckingSession || !isAuthenticated || !user) {
    return <LoadingScreen mode="fullscreen" size={38} />;
  }

  const isFacultyOrAdmin =
    user.globalRole === 'FACULTY' ||
    user.globalRole === 'COLLEGE_ADMIN' ||
    user.globalRole === 'SUPER_ADMIN' ||
    user.globalRole === 'PLATFORM_ADMIN' ||
    user.memberships?.some(
      (m) => m.role === 'FACULTY' || m.role === 'COLLEGE_ADMIN' || m.role === 'SUPER_ADMIN',
    );

  if (!isFacultyOrAdmin) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#0B0F19',
          p: 3,
        }}
      >
        <Card
          sx={{
            maxWidth: 480,
            width: '100%',
            p: 4,
            borderRadius: '24px',
            bgcolor: 'rgba(17, 24, 39, 0.9)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(16px)',
            textAlign: 'center',
          }}
        >
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '16px',
              bgcolor: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#EF4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2.5,
            }}
          >
            <LockOutlinedIcon sx={{ fontSize: 28 }} />
          </Box>
          <Typography sx={{ fontSize: '1.25rem', fontWeight: 800, color: '#F8FAFC', mb: 1 }}>
            Faculty Workspace Access
          </Typography>
          <Typography sx={{ fontSize: '0.88rem', color: '#94A3B8', mb: 3, lineHeight: 1.6 }}>
            You are signed in as <strong>{user.email}</strong> with the <strong>{user.globalRole}</strong> role. This workspace is reserved for institutional faculty mentors and instructors.
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Button
              variant="contained"
              fullWidth
              endIcon={<ArrowForwardRoundedIcon />}
              onClick={() => router.push(user.globalRole === 'STUDENT' ? '/students' : '/')}
              sx={{
                bgcolor: '#2563EB',
                borderRadius: '12px',
                py: 1.2,
                fontWeight: 700,
                textTransform: 'none',
                '&:hover': { bgcolor: '#1D4ED8' },
              }}
            >
              Go to Student Workspace
            </Button>

            <Button
              variant="outlined"
              fullWidth
              onClick={() => router.push('/login?redirect=/faculty/profile')}
              sx={{
                borderColor: 'rgba(255,255,255,0.2)',
                color: '#CBD5E1',
                borderRadius: '12px',
                py: 1.1,
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': { borderColor: 'rgba(255,255,255,0.4)', bgcolor: 'rgba(255,255,255,0.05)' },
              }}
            >
              Sign In with Faculty Account
            </Button>
          </Box>
        </Card>
      </Box>
    );
  }

  return <>{children}</>;
}
