'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Box, Typography, Button, Card } from '@mui/material';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import { FluidArrowRight } from '@/utils/fluid_arrow';
import { useAppSelector } from '@/store/hooks';
import LoadingScreen from '@/components/ui/LoadingScreen';

interface InstitutionAdminAuthGuardProps {
  children: React.ReactNode;
}

export default function InstitutionAdminAuthGuard({ children }: InstitutionAdminAuthGuardProps) {
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

  const isInstitutionAdmin =
    user.globalRole === 'SUPER_ADMIN' ||
    user.globalRole === 'PLATFORM_ADMIN' ||
    user.globalRole === 'INSTITUTION_ADMIN' ||
    (user.globalRole as any) === 'COLLEGE_ADMIN' ||
    (Array.isArray(user.memberships) &&
      user.memberships.some(
        (m: any) =>
          m.role === 'SUPER_ADMIN' ||
          m.role === 'PLATFORM_ADMIN' ||
          m.role === 'INSTITUTION_ADMIN' ||
          m.role === 'COLLEGE_ADMIN'
      ));

  if (!isInstitutionAdmin) {
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
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '20px',
              bgcolor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2.5,
            }}
          >
            <LockOutlinedIcon sx={{ fontSize: 32, color: '#EF4444' }} />
          </Box>

          <Typography sx={{ fontSize: '1.4rem', fontWeight: 800, color: '#F9FAFB', mb: 1 }}>
            Access Restricted
          </Typography>

          <Typography sx={{ fontSize: '0.9rem', color: '#9CA3AF', mb: 3, lineHeight: 1.6 }}>
            The <strong>Institution Admin Portal</strong> requires Dean, Department Head, or Campus Administrator credentials. Your current account does not have sufficient administrative privileges.
          </Typography>

          <Box sx={{ display: 'flex', gap: 1.5, width: '100%' }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => router.push('/faculty/profile')}
              startIcon={<SchoolRoundedIcon sx={{ fontSize: 18 }} />}
              sx={{
                py: 1.2,
                borderRadius: '12px',
                borderColor: 'rgba(255, 255, 255, 0.15)',
                color: '#E5E7EB',
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': {
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                },
              }}
            >
              Faculty Workspace
            </Button>

            <Button
              fullWidth
              variant="contained"
              onClick={() => router.push('/')}
              sx={{
                py: 1.2,
                borderRadius: '12px',
                bgcolor: '#2563EB',
                color: '#FFFFFF',
                textTransform: 'none',
                fontWeight: 700,
                '&:hover': {
                  bgcolor: '#1D4ED8',
                },
              }}
            >
              Platform Home
            </Button>
          </Box>
        </Card>
      </Box>
    );
  }

  return <>{children}</>;
}
